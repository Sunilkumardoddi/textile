import sys
import os

_backend = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, _backend)
os.chdir(_backend)

from server import app  # noqa: F401  — Vercel picks up `app` as the ASGI handler
