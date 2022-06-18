"""HTTP API definition."""

from flask import Response, jsonify
from . import app
from secrets import token_urlsafe

from .game_rooms import game_rooms, GameRoom

@app.route("/get_room", methods=["GET"])
def get_room() -> Response:
    """Allocate a game room."""
    room_id = token_urlsafe()
    game_rooms[room_id] = GameRoom(room_id)
    # Send the ID back to the client
    return jsonify({
        # Speak JavaScript and use camelCase
        "roomId" : room_id
    })
