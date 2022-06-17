"""Views definitions."""

from flask import Response, jsonify, request
from . import app, socketio

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

@socketio.on('connect')
def client_connected_callback() -> None:
    print("Client connected")

@socketio.on('disconnect')
def client_disconnected_callback() -> None:
    print("Client disconnected")

@socketio.on('json')
def receive_json(json) -> None:
    sid = request.args.get("sid")
    print(f"Session ID: {sid}, payload: {json}")
