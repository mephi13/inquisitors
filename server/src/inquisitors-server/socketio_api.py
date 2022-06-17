"""SocketIO API definition."""

from typing import Dict
from . import socketio, log
from .rooms import rooms
from .player import Player

@socketio.on('connect')
def client_connected_callback() -> None:
    print("Client connected")

@socketio.on('disconnect')
def client_disconnected_callback() -> None:
    # TODO: Find the client in the room based on session ID and remove them
    print("Client disconnected")

@socketio.on('joinRoom')
def join_room(room_id: str) -> None:
    """Add a player to their room."""
    if room_id in rooms.keys():
        # TODO: How to recover session ID in this callback?
        sid = 0
        # Add the user to the room
        rooms[room_id].players[sid] = Player(sid=sid)
        # TODO: Distinguish between rooms that already have a game in progress
        # and those still in setup phase
        log.info(f"User {sid} joined room {room_id}")
    else:
        # Terminate connection?
        pass

@socketio.on('startGame')
def start_game(room_id: str) -> None:
    """Start a game."""
    if room_id in rooms.keys():
        # TODO: How to recover session ID in this callback?
        sid = 0
        # TODO: Assert the sender is actually in the room
        # (and possibly not alone/minimum number of players met?)
        # TODO: Mark the room as having a game ongoing
    else: # Possibly better to fail with KeyError
        # Terminate connection?
        pass

@socketio.on('submitQuestion')
def submit_question(data: Dict[str, str]) -> None:
    """Submit a player's question."""
    try:
        room_id = data["roomId"]
        question = data["question"]
        # TODO: How to recover session ID in this callback?
        sid = 0
        # Funnily enough, except KeyError will also take care of
        # invalid room ID or player not in the room
        rooms[room_id].players[sid].question = question
    except KeyError:
        # Terminate connection?
        pass
