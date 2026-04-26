import sys
import os

_root    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_backend = os.path.join(_root, "backend")
_build   = os.path.join(_root, "frontend", "build")

sys.path.insert(0, _backend)
os.chdir(_backend)

try:
    from server import app                          # FastAPI ASGI app
    _import_error = None
except Exception as _e:
    _import_error = _e
    from fastapi import FastAPI
    app = FastAPI()

from fastapi import Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

if _import_error:
    # Diagnostic mode — return the startup error so we can debug it
    @app.get("/api/health")
    def health_error():
        return JSONResponse({
            "status": "startup_error",
            "error": str(_import_error),
            "type": type(_import_error).__name__,
            "backend_dir": _backend,
            "backend_exists": os.path.isdir(_backend),
            "files": os.listdir(_backend) if os.path.isdir(_backend) else [],
        })
    @app.api_route("/{path:path}", methods=["GET","POST","PUT","DELETE","PATCH"])
    def catch_all(path: str):
        return JSONResponse({"status": "startup_error", "error": str(_import_error)}, status_code=500)
else:
    # Serve React static assets (/static/js, /static/css, etc.)
    _static_dir = os.path.join(_build, "static")
    if os.path.isdir(_static_dir):
        app.mount("/static", StaticFiles(directory=_static_dir), name="react-static")

    # SPA fallback — non-/api/ routes return index.html
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
