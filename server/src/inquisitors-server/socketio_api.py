"""SocketIO API definition."""

from typing import Dict

from . import socketio, log
from .player import get_user_id
from .game_rooms import find_user_room, game_rooms
from flask_socketio import disconnect

@socketio.on('connect')
def on_connect() -> None:
    """Handle new SocketIO connection."""
    log.info(
        f"User {get_user_id()} connected"
    )

@socketio.on('disconnect')
def on_disconnect() -> None:
    """Handle SocketIO disconnect."""
    room = find_user_room()
    user_id = get_user_id()
    if room:
        room.leave(user_id)
        log.info(
            f"User {user_id} left the room {room.id} and disconnected"
        )
        room.on_update()
    else:
        log.info(
            f"User {user_id} disconnected"
        )

@socketio.on('join')
def on_join(data: Dict[str, str]) -> None:
    """Add a player to their room."""
    try:
        user_id = get_user_id()
        user_name = data["userName"]
        room_id = data["roomId"]
        room = game_rooms[room_id]
        # Add the user to the room
        room.join(user_id, user_name)

        # Notify all players in the room about the newcomer
        room.on_update()

        log.info(
            f"User {user_id} ({user_name}) joined room {room_id}"
        )
    except KeyError:
        disconnect()

@socketio.on('start')
def on_start(data: Dict[str, str]) -> None:
    """Start a game."""
    try:
        room_id = data[""]
        # TODO: Assert enough players to play the game and
        # requesting user actually in the room
        game_rooms[room_id].start_game()
    except KeyError:
        disconnect()


@socketio.on('qsubmit')
def on_qsubmit(data: Dict[str, str]) -> None:
    """Submit a player's question."""
    try:
        user_id = get_user_id()
        room_id = data["roomId"]
        question = data["question"]
        game_rooms[room_id].players[user_id].question = question
    except KeyError:
        disconnect()
