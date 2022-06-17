"""HTTP API definition."""

from flask import Response, jsonify, abort
from . import app
from secrets import token_urlsafe

from .rooms import rooms, Room

@app.route("/get_room", methods=["GET"])
def get_room() -> Response:
    """Allocate a room."""
    # Generate a unique room ID
    room_id = token_urlsafe()
    # Create room state
    rooms[room_id] = Room(id=room_id)
    # Send the ID to the client
    return jsonify({
        # Speak JavaScript and use camelCase
        "roomId" : room_id
    })

@app.route("/check_room/<room_id>", methods=["GET"])
def check_room(room_id) -> Response:
    """Check if a room exists."""
    if room_id in rooms.keys():
        return jsonify({
            "success" : True
        })
    else:
        # Room not found, return 404
        abort(404)

@app.route("/get_players/<room_id>", methods=["GET"])
def get_players(room_id) -> Response:
    """Get players currently in the room."""
    if room_id in rooms.keys():
        # TODO: Find what data is needed to establish secure channels with all players
        players = []
        for session_id in rooms[room_id].players.keys():
            players.append(session_id)

        return jsonify({
            "players" : players
        })
    else: # Possibly better to fail with KeyError
        # Room not found, return 404
        abort(404)
