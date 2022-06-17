"""Define a game room."""

from typing import Dict
from .player import Player

# TODO: Try using Flask-SocketIO room abstraction and not reinvent the wheel

class Room:
    """Game room state."""

    def __init__(self, id: str) -> None:
        """Construct a game room."""
        self.id = id
        # Map session IDs to Player instances
        self.players: Dict[str, Player] = {}

# Global mapping of room IDs to room states
rooms: Dict[str, Room] = {}
