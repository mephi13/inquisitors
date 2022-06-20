"""Define a player state."""

from flask import request

class Player:
    """Define a player state."""

    def __init__(self, id: str, name: str) -> None:
        """Instantiate a player."""
        self.id = id
        self.name = name
        self.question = ""
        # Votes cast against the player
        self.votes_against = 0
        # Name of the user the player voted against
        self.voted_for: str = ""
        # Flag set when the secret voting phase is over
        self.avnet_done = False

def get_user_id() -> str:
    """Get unique user ID."""
    # Rely on the SocketIO session ID, but hide the
    # implementation detail
    return request.sid
