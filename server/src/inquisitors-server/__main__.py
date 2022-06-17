"""Entry point to the backend application."""

from . import app, socketio
from .http_api import *
from .socketio_api import *

socketio.run(app)
