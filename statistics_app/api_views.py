# JSON/CSV API for workshop statistics (React UI).
import datetime as dt

import pandas as pd
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from teams.models import Team
from workshop_app.models import Workshop, WorkshopType, has_profile, states


def _is_instructor(user):
    return user.is_authenticated and user.groups.filter(name="instructor").exists()


def _workshop_queryset(request):
    """Same filtering rules as legacy workshop_public_stats."""
    user = request.user
    from_date = request.GET.get("from_date")
    to_date = request.GET.get("to_date")
    state = request.GET.get("state")
    workshoptype = request.GET.get("workshop_type")
    show_workshops = request.GET.get("show_workshops") in ("1", "on", "true", "yes")
    sort = request.GET.get("sort") or "date"

    if from_date and to_date:
        workshops = Workshop.objects.filter(date__range=(from_date, to_date), status=1).order_by(sort)
        if state:
            workshops = workshops.filter(coordinator__profile__state=state)
        if workshoptype:
            workshops = workshops.filter(workshop_type_id=workshoptype)
    else:
        today = timezone.now()
        upto = today + dt.timedelta(days=15)
        workshops = Workshop.objects.filter(date__range=(today, upto), status=1).order_by("date")

    if show_workshops and user.is_authenticated and has_profile(user):
        if _is_instructor(user):
            workshops = workshops.filter(instructor_id=user.id)
        else:
            workshops = workshops.filter(coordinator_id=user.id)

    return workshops


@require_GET
def api_stats_public(request):
    workshops = _workshop_queryset(request)

    if request.GET.get("download"):
        data = workshops.values(
            "workshop_type__name",
            "coordinator__first_name",
            "coordinator__last_name",
            "instructor__first_name",
            "instructor__last_name",
            "coordinator__profile__state",
            "date",
            "status",
        )
        df = pd.DataFrame(list(data))
        if not df.empty:
            df.status.replace([0, 1, 2], ["Pending", "Success", "Reject"], inplace=True)
            codes, states_map = list(zip(*states))
            df.coordinator__profile__state.replace(codes, states_map, inplace=True)
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="workshop-statistics.csv"'
        df.to_csv(response, index=False)
        return response

    ws_states, ws_count = Workshop.objects.get_workshops_by_state(workshops)
    ws_type, ws_type_count = Workshop.objects.get_workshops_by_type(workshops)

    paginator = Paginator(workshops, 30)
    page = int(request.GET.get("page") or 1)
    page_obj = paginator.get_page(page)

    rows = []
    for w in page_obj.object_list:
        inst = w.instructor
        coord = w.coordinator
        institute = ""
        if has_profile(coord):
            institute = coord.profile.institute
        rows.append(
            {
                "coordinator_name": (coord.get_full_name() or coord.username or "").strip(),
                "institute": institute,
                "instructor_name": (inst.get_full_name() or inst.username or "").strip() if inst else "—",
                "workshop_name": w.workshop_type.name,
                "date": w.date.isoformat(),
            }
        )

    wt_options = [
        {"id": wt.id, "name": wt.name} for wt in WorkshopType.objects.order_by("name")
    ]
    state_options = [{"value": s[0], "label": s[1]} for s in states if s[0]]

    return JsonResponse(
        {
            "chart_state": {"labels": ws_states, "counts": ws_count},
            "chart_type": {"labels": ws_type, "counts": ws_type_count},
            "rows": rows,
            "pagination": {
                "page": page_obj.number,
                "num_pages": paginator.num_pages,
                "total": paginator.count,
                "per_page": 30,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
            },
            "filters": {
                "from_date": request.GET.get("from_date") or "",
                "to_date": request.GET.get("to_date") or "",
                "state": request.GET.get("state") or "",
                "workshop_type": request.GET.get("workshop_type") or "",
                "show_workshops": request.GET.get("show_workshops") in ("1", "on", "true", "yes"),
                "sort": request.GET.get("sort") or "date",
            },
            "workshop_types": wt_options,
            "states": state_options,
            "sort_options": [
                {"value": "date", "label": "Oldest first"},
                {"value": "-date", "label": "Latest first"},
            ],
        }
    )


@require_GET
def api_stats_team(request, team_id=None):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"detail": "Authentication required"}, status=401)

    teams = Team.objects.all()
    if team_id is not None:
        team = teams.filter(pk=team_id).first()
        if team is None:
            return JsonResponse({"detail": "Team not found"}, status=404)
    else:
        team = teams.first()

    if team is None:
        return JsonResponse(
            {
                "empty": True,
                "message": "No teams exist yet. Create a team in the admin and add members.",
                "teams": [],
            }
        )

    if not team.members.filter(user_id=user.id).exists():
        return JsonResponse(
            {"forbidden": True, "message": "You are not a member of this team."},
            status=403,
        )

    member_workshop_data = {}
    for member in team.members.all():
        n = Workshop.objects.filter(instructor_id=member.user.id).count()
        member_workshop_data[member.user.get_full_name() or member.user.username] = n

    team_list = [{"id": t.id, "label": f"Team #{t.id}"} for t in teams]

    return JsonResponse(
        {
            "empty": False,
            "teams": team_list,
            "current_team_id": team.id,
            "chart": {
                "labels": list(member_workshop_data.keys()),
                "counts": list(member_workshop_data.values()),
            },
        }
    )
