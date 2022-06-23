"""Define a player state."""

from flask import request

class Player:
    """Define a player state."""

    def __init__(self, id: str, name: str, index: int) -> None:
        """Instantiate a player."""
        self.id = id
        self.name = name
        self.index = index
        self.question = ""
        # Votes cast against the player
        self.votes_against = 0
        # Name of the user the player voted against
        self.voted_for: str = ""
        # Flag set when the secret voting phase is over
        self.avnet_done = False
        self.ready_for_next_round = False

    def reset(self) -> None:
        """Reset the player's state."""
        self.votes_against = 0
        self.voted_for = ""
        self.question = ""
        self.avnet_done = False
        self.ready_for_next_round = False

def get_user_id() -> str:
    """Get unique user ID."""
    # Rely on the SocketIO session ID, but hide the
    # implementation detail
    return request.sid
