"""Define a player state."""


class Player:
    """Define a player state."""

    def __init__(self, sid: str) -> None:
        """Instantiate a player."""
        self.sid = sid
        self.question = ""
        ...
