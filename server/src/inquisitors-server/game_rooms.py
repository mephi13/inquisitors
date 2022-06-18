"""Define a game room."""

from typing import Dict
from .player import Player
from flask_socketio import join_room, leave_room, rooms

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

    def start_game(self) -> None:
        """Start a game."""
        # TODO: Implement me!

def find_user_room(user_id: str) -> str:
    """Find room by user ID."""
    assert user_id
    # Rely on event context to fetch rooms the player is in
    user_rooms = rooms()
    assert len(user_rooms) == 1, "Player can only be in one room at a time"
    return user_rooms[0]

# Global mapping of room IDs to room states
game_rooms: Dict[str, GameRoom] = {}
