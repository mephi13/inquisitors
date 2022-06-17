"""Inquistors backend app."""

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

# Instantiate the app
app = Flask(__name__)
app.config.from_object("server-config.BaseConfig")
socketio = SocketIO(app, cors_allowed_origins="*")

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Expose the logger
log = app.logger
