"""Inquistors backend app."""
from flask import Flask
from flask_cors import CORS

# instantiate the app
app = Flask(__name__)
app.config.from_object("server-config.BaseConfig")

# enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})
