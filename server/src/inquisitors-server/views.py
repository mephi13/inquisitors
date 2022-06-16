"""Views definitions."""

from flask import Response, jsonify
from . import app

# sanity check route
@app.route("/ping", methods=["GET"])
def ping_pong() -> Response:
    """Sanity check."""
    return jsonify("Pong!")

@app.route("/invert/<message>", methods=["GET"])
def invert_message(message) -> Response:
    """Test dynamic routes."""
    tokens = list(message)
    tokens.reverse()
    return jsonify(''.join(tokens))
