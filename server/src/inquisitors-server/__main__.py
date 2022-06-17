from . import app, socketio
from .views import *

socketio.run(app)
