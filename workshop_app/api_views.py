# JSON API for the React workshop UI. Session authentication + CSRF on mutating requests.
import json
import os
from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.http import require_GET, require_http_methods

from .forms import (
    CommentsForm,
    ProfileForm,
    UserLoginForm,
    UserRegistrationForm,
    WorkshopForm,
    WorkshopTypeForm,
)
from .models import (
    AttachmentFile,
    Comment,
    Profile,
    Workshop,
    WorkshopType,
    department_choices,
    has_profile,
    source,
    states,
    title,
)
from .send_mails import send_email
from .views import is_email_checked, is_instructor


def _json_error(message, status=400, **extra):
    body = {"ok": False, "error": message}
    body.update(extra)
    return JsonResponse(body, status=status)


def _user_payload(user):
    if not user.is_authenticated:
        return None
    data = {
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name or "",
        "last_name": user.last_name or "",
        "email": user.email or "",
        "is_superuser": user.is_superuser,
        "is_instructor": is_instructor(user),
        "has_profile": has_profile(user),
    }
    if has_profile(user):
        p = user.profile
        data["profile"] = {
            "email_verified": p.is_email_verified,
            "position": p.position,
            "institute": p.institute,
            "department": p.department,
            "phone_number": p.phone_number,
            "state": p.state,
            "location": p.location or "",
            "title": p.title,
        }
    else:
        data["profile"] = None
    return data


def _workshop_dict(w):
    inst = w.instructor
    coord = w.coordinator
    return {
        "id": w.id,
        "uid": str(w.uid),
        "date": w.date.isoformat(),
        "status": w.status,
        "status_label": w.get_status(),
        "tnc_accepted": w.tnc_accepted,
        "workshop_type": {
            "id": w.workshop_type_id,
            "name": w.workshop_type.name,
            "duration": w.workshop_type.duration,
        },
        "coordinator": {
            "id": coord.id,
            "name": coord.get_full_name() or coord.username,
            "email": coord.email,
        },
        "instructor": (
            {
                "id": inst.id,
                "name": inst.get_full_name() or inst.username,
            }
            if inst
            else None
        ),
    }


@require_GET
def api_csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_GET
def api_meta(request):
    """Field choices for registration and profile forms (mirrors Django model choices)."""
    return JsonResponse(
        {
            "departments": [{"value": a[0], "label": a[1]} for a in department_choices],
            "titles": [{"value": a[0], "label": a[1]} for a in title],
            "sources": [{"value": a[0], "label": a[1]} for a in source],
            "states": [{"value": a[0], "label": a[1]} for a in states if a[0]],
        }
    )


@require_GET
def api_me(request):
    return JsonResponse({"user": _user_payload(request.user)})


@require_http_methods(["POST"])
def api_login(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    form = UserLoginForm({"username": username, "password": password})
    if not form.is_valid():
        err = (
            form.errors.get("__all__", ["Invalid credentials"])[0]
            if form.errors
            else "Invalid credentials"
        )
        return _json_error(str(err), 400)

    # Legacy form returns User from clean(); support authenticate() directly too.
    user = authenticate(username=username, password=password)
    if user is None:
        return _json_error("Invalid username or password", 400)

    if user.is_superuser:
        return _json_error("Use the admin site for staff accounts", 403)

    if not has_profile(user):
        return _json_error("Account has no profile. Contact the administrator.", 403)

    if not user.profile.is_email_verified:
        return JsonResponse(
            {
                "ok": False,
                "needs_activation": True,
                "error": "Email not verified yet. Check your inbox.",
            },
            status=403,
        )

    login(request, user)
    return JsonResponse({"ok": True, "user": _user_payload(user)})


@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({"ok": True})


@require_http_methods(["POST"])
def api_register(request):
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    form = UserRegistrationForm(body)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)

    username, password, key = form.save()
    user = authenticate(username=username, password=password)
    login(request, user)
    user_position = request.user.profile.position
    send_email(
        request,
        call_on="Registration",
        user_position=user_position,
        key=key,
    )
    return JsonResponse({"ok": True, "user": _user_payload(user)})


@login_required
@require_GET
def api_workshops_coordinator(request):
    user = request.user
    if is_instructor(user):
        return _json_error("Not a coordinator account", 403)
    qs = Workshop.objects.filter(coordinator=user).order_by("-date")
    return JsonResponse({"workshops": [_workshop_dict(w) for w in qs]})


@login_required
@require_GET
def api_workshops_instructor(request):
    user = request.user
    if not is_instructor(user):
        return _json_error("Not an instructor account", 403)
    today = timezone.now().date()
    qs = Workshop.objects.filter(
        Q(instructor=user, date__gte=today) | Q(status=0)
    ).order_by("-date")
    return JsonResponse(
        {
            "workshops": [_workshop_dict(w) for w in qs],
            "today": today.isoformat(),
        }
    )


@login_required
@require_http_methods(["POST"])
def api_accept_workshop(request, workshop_id):
    user = request.user
    if not is_instructor(user):
        return _json_error("Forbidden", 403)
    try:
        workshop = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return _json_error("Workshop not found", 404)

    workshop.status = 1
    workshop.instructor = user
    workshop.save()

    coordinator_profile = workshop.coordinator.profile
    send_email(
        request,
        call_on="Booking Confirmed",
        user_position="instructor",
        workshop_date=str(workshop.date),
        workshop_title=workshop.workshop_type.name,
        user_name=workshop.coordinator.get_full_name(),
        other_email=workshop.coordinator.email,
        phone_number=coordinator_profile.phone_number,
        institute=coordinator_profile.institute,
    )
    send_email(
        request,
        call_on="Booking Confirmed",
        workshop_date=str(workshop.date),
        workshop_title=workshop.workshop_type.name,
        other_email=workshop.coordinator.email,
        phone_number=request.user.profile.phone_number,
    )
    return JsonResponse({"ok": True, "workshop": _workshop_dict(workshop)})


@login_required
@require_http_methods(["POST"])
def api_change_workshop_date(request, workshop_id):
    user = request.user
    if not is_instructor(user):
        return _json_error("Forbidden", 403)
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    new_date_str = body.get("new_date")
    if not new_date_str:
        return _json_error("new_date required", 400)

    try:
        new_workshop_date = datetime.strptime(new_date_str, "%Y-%m-%d")
    except ValueError:
        return _json_error("Date must be YYYY-MM-DD", 400)

    if datetime.today().date() > new_workshop_date.date():
        return _json_error("Pick a future date", 400)

    workshop_qs = Workshop.objects.filter(id=workshop_id)
    if not workshop_qs.exists():
        return _json_error("Workshop not found", 404)

    workshop_date = workshop_qs.first().date
    workshop_qs.update(date=new_workshop_date.date())

    send_email(
        request,
        call_on="Change Date",
        user_position="instructor",
        workshop_date=str(workshop_date),
        new_workshop_date=str(new_workshop_date.date()),
    )
    w = workshop_qs.first()
    send_email(
        request,
        call_on="Change Date",
        new_workshop_date=str(new_workshop_date.date()),
        workshop_date=str(workshop_date),
        other_email=w.coordinator.email,
    )
    return JsonResponse({"ok": True})


@login_required
@require_http_methods(["POST"])
def api_propose_workshop(request):
    user = request.user
    if user.is_superuser:
        return _json_error("Use admin", 403)
    if is_instructor(user):
        return _json_error("Instructors cannot propose from this form", 403)

    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    form = WorkshopForm(body)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)

    form_data = form.save(commit=False)
    form_data.coordinator = user
    if Workshop.objects.filter(
        date=form_data.date,
        workshop_type=form_data.workshop_type,
        coordinator=form_data.coordinator,
    ).exists():
        return _json_error("You already proposed this workshop on that date", 400)

    form_data.save()
    instructors = Profile.objects.filter(position="instructor")
    for i in instructors:
        send_email(
            request,
            call_on="Proposed Workshop",
            user_position="instructor",
            workshop_date=str(form_data.date),
            workshop_title=form_data.workshop_type,
            user_name=user.get_full_name(),
            other_email=i.user.email,
            phone_number=user.profile.phone_number,
            institute=user.profile.institute,
        )
    return JsonResponse({"ok": True, "workshop": _workshop_dict(form_data)})


@login_required
@require_http_methods(["POST"])
def api_workshop_type_create(request):
    if not is_instructor(request.user):
        return _json_error("Forbidden", 403)
    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)
    form = WorkshopTypeForm(body)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)
    wt = form.save()
    return JsonResponse(
        {"ok": True, "id": wt.id, "name": wt.name},
        status=201,
    )


@require_GET
def api_workshop_types(request):
    page = int(request.GET.get("page") or 1)
    per_page = min(int(request.GET.get("per_page") or 12), 50)
    qs = WorkshopType.objects.order_by("id")
    total = qs.count()
    start = (page - 1) * per_page
    items = qs[start : start + per_page]
    return JsonResponse(
        {
            "results": [
                {
                    "id": wt.id,
                    "name": wt.name,
                    "description": wt.description,
                    "duration": wt.duration,
                }
                for wt in items
            ],
            "page": page,
            "per_page": per_page,
            "total": total,
        }
    )


def _attachment_dict(af):
    return {
        "id": af.id,
        "filename": os.path.basename(af.attachments.name) if af.attachments else "",
        "url": af.attachments.url if af.attachments else "",
    }


@require_http_methods(["GET", "PATCH"])
def api_workshop_type_detail(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return _json_error("Not found", 404)

    if request.method == "PATCH":
        if not request.user.is_authenticated:
            return _json_error("Authentication required", 401)
        if not is_instructor(request.user):
            return _json_error("Forbidden", 403)
        try:
            body = json.loads(request.body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            return _json_error("Invalid JSON body", 400)
        form = WorkshopTypeForm(body, instance=wt)
        if not form.is_valid():
            return JsonResponse({"ok": False, "errors": form.errors}, status=400)
        form.save()
        wt.refresh_from_db()

    return JsonResponse(
        {
            "id": wt.id,
            "name": wt.name,
            "description": wt.description,
            "duration": wt.duration,
            "terms_and_conditions": wt.terms_and_conditions,
            "attachments": [
                _attachment_dict(af)
                for af in AttachmentFile.objects.filter(workshop_type=wt)
            ],
        }
    )


@login_required
@require_GET
def api_workshop_detail(request, workshop_id):
    try:
        w = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return _json_error("Not found", 404)

    user = request.user
    if is_instructor(user):
        comments = Comment.objects.filter(workshop=w)
    else:
        comments = Comment.objects.filter(workshop=w, public=True)

    return JsonResponse(
        {
            "workshop": _workshop_dict(w),
            "comments": [
                {
                    "id": c.id,
                    "author": c.author.get_full_name() or c.author.username,
                    "comment": c.comment,
                    "public": c.public,
                    "created_date": c.created_date.isoformat(),
                }
                for c in comments.order_by("-created_date")
            ],
        }
    )


@login_required
@require_http_methods(["POST"])
def api_workshop_comment(request, workshop_id):
    try:
        w = Workshop.objects.get(id=workshop_id)
    except Workshop.DoesNotExist:
        return _json_error("Not found", 404)

    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    form = CommentsForm(body)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)

    form_data = form.save(commit=False)
    if not is_instructor(request.user):
        form_data.public = True
    form_data.author = request.user
    form_data.created_date = timezone.now()
    form_data.workshop = w
    form_data.save()
    return JsonResponse({"ok": True})


@login_required
@require_http_methods(["GET", "PATCH"])
def api_own_profile(request):
    user = request.user
    if user.is_superuser:
        return _json_error("Use admin for staff profiles", 403)
    if not has_profile(user):
        return _json_error("No profile", 404)

    profile = user.profile
    if request.method == "GET":
        return JsonResponse(
            {
                "profile": {
                    "title": profile.title,
                    "institute": profile.institute,
                    "department": profile.department,
                    "phone_number": profile.phone_number,
                    "position": profile.position,
                    "location": profile.location,
                    "state": profile.state,
                },
                "first_name": user.first_name,
                "last_name": user.last_name,
            }
        )

    try:
        body = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return _json_error("Invalid JSON body", 400)

    form = ProfileForm(body, user=user, instance=profile)
    if not form.is_valid():
        return JsonResponse({"ok": False, "errors": form.errors}, status=400)

    form_data = form.save(commit=False)
    form_data.user = user
    form_data.user.first_name = body.get("first_name", user.first_name)
    form_data.user.last_name = body.get("last_name", user.last_name)
    form_data.user.save()
    form_data.save()
    return JsonResponse({"ok": True, "user": _user_payload(user)})


@login_required
@require_GET
def api_coordinator_profile(request, user_id):
    user = request.user
    if not is_instructor(user) or not is_email_checked(user):
        return _json_error("Instructors only", 403)
    try:
        coord = Profile.objects.get(user_id=user_id)
    except Profile.DoesNotExist:
        return _json_error("Not found", 404)

    workshops = Workshop.objects.filter(coordinator_id=user_id).order_by("date")
    return JsonResponse(
        {
            "profile": {
                "name": coord.user.get_full_name() or coord.user.username,
                "institute": coord.institute,
                "department": coord.department,
                "phone_number": coord.phone_number,
                "state": coord.state,
            },
            "workshops": [_workshop_dict(w) for w in workshops],
        }
    )


@login_required
@require_http_methods(["POST"])
def api_workshop_type_attachment_add(request, workshop_type_id):
    if not is_instructor(request.user):
        return _json_error("Forbidden", 403)
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return _json_error("Not found", 404)
    upload = request.FILES.get("attachments")
    if not upload:
        return _json_error("Expected multipart file field `attachments`", 400)
    af = AttachmentFile(workshop_type=wt, attachments=upload)
    af.save()
    return JsonResponse(
        {"ok": True, "attachment": _attachment_dict(af)},
        status=201,
    )


@login_required
@require_http_methods(["DELETE"])
def api_attachment_delete(request, attachment_id):
    if not is_instructor(request.user):
        return _json_error("Forbidden", 403)
    try:
        af = AttachmentFile.objects.get(id=attachment_id)
    except AttachmentFile.DoesNotExist:
        return _json_error("Not found", 404)
    wt_id = af.workshop_type_id
    if af.attachments:
        af.attachments.delete(save=False)
    af.delete()
    return JsonResponse({"ok": True, "workshop_type_id": wt_id})


@login_required
@require_GET
def api_workshop_type_tnc(request, workshop_type_id):
    try:
        wt = WorkshopType.objects.get(id=workshop_type_id)
    except WorkshopType.DoesNotExist:
        return _json_error("Not found", 404)
    return JsonResponse({"tnc": wt.terms_and_conditions})
