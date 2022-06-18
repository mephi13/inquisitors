"""Define a game room."""

from typing import Dict, List, Optional
from .player import Player
from flask_socketio import join_room, leave_room, rooms, emit
from . import log

class GameRoom:
    """Game room state."""

    def __init__(self, id: str) -> None:
        """Construct a game room."""
        self.id = id
        # Map session IDs to Player instances
        self.players: Dict[str, Player] = {}

    def join(self, user_id: str, user_name: str) -> None:
        """Join the room."""
        self.players[user_id] = Player(user_id, user_name)

        # Use event context to assign the current client to
        # the room at Flask level
        join_room(self.id)

    def leave(self, user_id: str) -> None:
        """Leave the room."""
        self.players.pop(user_id, None)

        # Rely on event context to leave the room
        leave_room(self.id)

    def on_update(self) -> None:
        """Notify the players about room update."""
        users = self.get_users()
        if users:
            self.emit("roomupdate", {
                "users": self.get_users(),
            })
        else:
            # No users left, unlink ourselves from the global map
            log.info(f"No more users in room {self.id}. Deleting...")
            game_rooms.pop(self.id)

    def emit(self, event_type: str, payload: Dict[str, str]) -> None:
        """Emit an event to all users in the room."""
        emit(event_type, payload, to=self.id)

    def get_users(self) -> List[Dict[str, str]]:
        """Fetch users in the room in a transport-ready format."""
        return [ { "name": player.name } for player in self.players.values() ]

    def start_game(self) -> None:
        """Start a game."""
        # TODO: Implement me!

def find_user_room() -> Optional[GameRoom]:
    """Find room by user ID."""
    # Rely on event context to fetch rooms the player is in
    room_ids = rooms()
    # User is automatically added to a room upon connecting, the other room is ours
    assert len(room_ids) <= 2, \
        f"Unexpected number of rooms: {len(room_ids)}: {room_ids}"
    # It seems that the order is not ensured, check both
    for id in room_ids:
        if id in game_rooms.keys():
            return game_rooms[id]
    return None

# Global mapping of room IDs to room states
game_rooms: Dict[str, GameRoom] = {}
