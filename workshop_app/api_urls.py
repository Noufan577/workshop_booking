from django.conf.urls import url

from statistics_app import api_views as stats_api_views
from workshop_app import api_views

urlpatterns = [
    url(r"^csrf/$", api_views.api_csrf, name="api_csrf"),
    url(r"^meta/$", api_views.api_meta, name="api_meta"),
    url(r"^me/$", api_views.api_me, name="api_me"),
    url(r"^auth/login/$", api_views.api_login, name="api_login"),
    url(r"^auth/logout/$", api_views.api_logout, name="api_logout"),
    url(r"^auth/register/$", api_views.api_register, name="api_register"),
    url(
        r"^workshops/coordinator/$",
        api_views.api_workshops_coordinator,
        name="api_workshops_coordinator",
    ),
    url(
        r"^workshops/instructor/$",
        api_views.api_workshops_instructor,
        name="api_workshops_instructor",
    ),
    url(
        r"^workshops/(?P<workshop_id>\d+)/accept/$",
        api_views.api_accept_workshop,
        name="api_accept_workshop",
    ),
    url(
        r"^workshops/(?P<workshop_id>\d+)/date/$",
        api_views.api_change_workshop_date,
        name="api_change_workshop_date",
    ),
    url(
        r"^workshops/(?P<workshop_id>\d+)/comments/$",
        api_views.api_workshop_comment,
        name="api_workshop_comment",
    ),
    url(
        r"^workshops/(?P<workshop_id>\d+)/$",
        api_views.api_workshop_detail,
        name="api_workshop_detail",
    ),
    url(r"^workshops/propose/$", api_views.api_propose_workshop, name="api_propose"),
    url(
        r"^workshop-types/create/$",
        api_views.api_workshop_type_create,
        name="api_workshop_type_create",
    ),
    url(r"^workshop-types/$", api_views.api_workshop_types, name="api_workshop_types"),
    url(
        r"^workshop-types/(?P<workshop_type_id>\d+)/attachments/$",
        api_views.api_workshop_type_attachment_add,
        name="api_workshop_type_attachment_add",
    ),
    url(
        r"^attachments/(?P<attachment_id>\d+)/$",
        api_views.api_attachment_delete,
        name="api_attachment_delete",
    ),
    url(
        r"^workshop-types/(?P<workshop_type_id>\d+)/$",
        api_views.api_workshop_type_detail,
        name="api_workshop_type_detail",
    ),
    url(
        r"^workshop-types/(?P<workshop_type_id>\d+)/tnc/$",
        api_views.api_workshop_type_tnc,
        name="api_workshop_type_tnc",
    ),
    url(r"^profile/$", api_views.api_own_profile, name="api_own_profile"),
    url(
        r"^coordinators/(?P<user_id>\d+)/$",
        api_views.api_coordinator_profile,
        name="api_coordinator_profile",
    ),
    url(
        r"^stats/public/$",
        stats_api_views.api_stats_public,
        name="api_stats_public",
    ),
    url(
        r"^stats/team/(?P<team_id>\d+)/$",
        stats_api_views.api_stats_team,
        name="api_stats_team_detail",
    ),
    url(
        r"^stats/team/$",
        stats_api_views.api_stats_team,
        name="api_stats_team",
    ),
]
