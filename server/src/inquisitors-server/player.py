"""Define a player state."""

from flask import request

class Player:
    """Define a player state."""

    def __init__(self, id: str, name: str) -> None:
        """Instantiate a player."""
        self.id = id
        self.name = name
        self.question = ""
        ...

def get_user_id() -> str:
    """Get unique user ID."""
    # Rely on the SocketIO session ID, but hide the
    # implementation detail
    return request.sid
