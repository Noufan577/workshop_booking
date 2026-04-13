from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie


@ensure_csrf_cookie
def workshop_spa(request, spa_path=None):
    """Serve the React shell for all /workshop/app/* routes."""
    return render(
        request,
        "workshop_app/spa.html",
        {
            "page_title": "FOSSEE Workshops — IIT Bombay",
            "meta_description": (
                "Book and manage FOSSEE workshops: coordinators propose sessions, "
                "instructors confirm dates. Run by the FOSSEE project, IIT Bombay."
            ),
        },
    )
