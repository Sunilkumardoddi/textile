import sys
import os

_root    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_backend = os.path.join(_root, "backend")
_build   = os.path.join(_root, "frontend", "build")

sys.path.insert(0, _backend)
os.chdir(_backend)

from server import app                          # FastAPI ASGI app
from fastapi import Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Serve React static assets (/static/js, /static/css, etc.)
_static_dir = os.path.join(_build, "static")
if os.path.isdir(_static_dir):
    app.mount("/static", StaticFiles(directory=_static_dir), name="react-static")

# Serve other top-level files from the React build (favicon, manifest, etc.)
if os.path.isdir(_build):
    app.mount("/public", StaticFiles(directory=_build), name="react-public")

# SPA fallback — any route that isn't /api/* or a static file returns index.html
@app.middleware("http")
async def spa_fallback(request: Request, call_next):
    response = await call_next(request)
    path = request.url.path
    if (response.status_code == 404
            and not path.startswith("/api/")
            and not path.startswith("/static/")):
        index = os.path.join(_build, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
    return response
