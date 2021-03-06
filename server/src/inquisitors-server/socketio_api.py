"""SocketIO API definition."""

from typing import Dict

from . import socketio, log
from .player import get_user_id
from .game_rooms import find_user_room, game_rooms
from flask_socketio import disconnect, emit

@socketio.on("connect")
def on_connect() -> None:
    """Handle new SocketIO connection."""
    log.info(
        f"User {get_user_id()} connected"
    )

@socketio.on("disconnect")
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

@socketio.on("room_join")
def on_room_join(data: Dict[str, str]) -> None:
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
    except KeyError as e:
        log.error(f"Error in on_room_join: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("game_start")
def on_game_start(data: Dict[str, str]) -> None:
    """Start a game."""
    try:
        room_id = data["roomId"]
        room = game_rooms[room_id]
        # TODO: Assert enough players to play the game and
        # requesting user actually in the room
        room.on_game_start()
    except KeyError as e:
        log.error(f"Error in on_game_start: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("question_submit")
def on_question_submit(data: Dict[str, str]) -> None:
    """Submit a player"s question."""
    try:
        user_id = get_user_id()
        room_id = data["roomId"]
        question = data["question"]
        room = game_rooms[room_id]
        room.players[user_id].question = question
        room.on_question_submit()
    except KeyError as e:
        log.error(f"Error in on_question_submit: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("avnet_complete")
def on_avnet_complete(data: Dict[str, str]) -> None:
    """Anonymous veto network phase complete."""
    try:
        user_id = get_user_id()
        room_id = data["roomId"]
        room = game_rooms[room_id]
        room.players[user_id].avnet_done = True
        # Run room callback
        room.on_avnet_complete()
    except KeyError as e:
        log.error(f"Error in on_avnet_complete: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("public_vote_submit")
def on_public_vote_submit(data: Dict[str, str]) -> None:
    """Submit a public"s vote."""
    try:
        user_id = get_user_id()
        room_id = data["roomId"]
        room = game_rooms[room_id]
        vote = room.get_user_id_by_name(data["vote"])
        room.players[user_id].voted_for = data["vote"]
        room.players[vote].votes_against += 1
        # Run room callback
        room.on_public_vote_submit()
    except KeyError as e:
        log.error(f"Error in on_public_vote_submit: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("next_round_ready")
def on_next_round_ready(data: Dict[str, str]) -> None:
    """Acknowledge player's readiness to continue."""
    try:
        user_id = get_user_id()
        room_id = data["roomId"]
        room = game_rooms[room_id]
        room.players[user_id].ready_for_next_round = True
        room.on_next_round_ready()
    except KeyError as e:
        log.error(f"Error in on_next_round_ready: {type(e).__name__}: {e}")
        disconnect()

@socketio.on("route_tls")
def on_route_tls(data: Dict[str, str]) -> None:
    """Route client-client TLS message."""
    try:
        sender_id = get_user_id()
        room_id = data["roomId"]
        receiver_name = data["receiver"]
        payload = data["payload"]
        room = game_rooms[room_id]
        receiver_id = room.get_user_id_by_name(receiver_name)
        sender_name = room.players[sender_id].name
        log.debug("TLS message to route: " + str(data))

        emit("tls_message", {
            "sender": sender_name,
            "receiver": receiver_name,
            "payload": payload,
        }, to=receiver_id)
    except KeyError as e:
        log.error(f"Error in on_route_tls: {type(e).__name__}: {e}")
        disconnect()
