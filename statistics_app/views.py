# Legacy statistics views redirect into the React app at /workshop/app/statistics/
from django.shortcuts import redirect


def workshop_public_stats(request):
    q = request.GET.urlencode()
    target = "/workshop/app/statistics" + ("?" + q if q else "")
    return redirect(target)


def team_stats(request, team_id=None):
    if team_id is not None:
        return redirect(f"/workshop/app/statistics/team/{team_id}")
    return redirect("/workshop/app/statistics/team")
