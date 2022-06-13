"""Inquistors backend app."""
from flask import Flask, Response, jsonify
from flask_cors import CORS

# instantiate the app
app = Flask("__name__")
app.config.from_object("config.BaseConfig")

# enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})


# sanity check route
@app.route("/ping", methods=["GET"])
def ping_pong() -> Response:
    """Sanity check."""
    return jsonify("pong!")


app.run()
