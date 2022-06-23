"""Define a game room."""

from random import sample, randint, choice
from typing import Any, Dict, List, Optional
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
        self.responders_subset: Dict[str, Player] = {}
        self.index_pool = 0

    def join(self, user_id: str, user_name: str) -> None:
        """Join the room."""
        self.players[user_id] = Player(user_id, user_name, self.index_pool)
        self.index_pool += 1

        # Use event context to assign the current client to
        # the room at Flask level
        join_room(self.id)

    def leave(self, user_id: str) -> None:
        """Leave the room."""
        self.players.pop(user_id, None)

        # Rely on event context to leave the room
        leave_room(self.id)

    def get_user_id_by_name(self, name: str) -> str:
        """Find ID of the user based on name."""
        for player in self.players.values():
            if player.name == name:
                return player.id
        return ""

    def on_update(self) -> None:
        """Notify the players about room update."""
        users = self._get_users()
        if users:
            self.emit("room_update", {
                "users": self._get_users(),
            })
        else:
            # No users left, unlink ourselves from the global map
            log.info(f"No more users in room {self.id}. Deleting...")
            game_rooms.pop(self.id)

    def on_question_submit(self) -> None:
        """Handle question submission."""
        if all([ player.question for player in self.players.values() ]):
            # All players submitted their questions, do state transition
            self.responders_subset = self._get_responders_subset()
            question = self._select_question()

            for player in self.players.values():
                if player in self.responders_subset.values():
                    emit("response_prompt", {
                        "question": question,
                        "promptUser": True,
                    }, to=player.id)
                else:
                    emit("response_prompt", {
                        "question": question,
                        "promptUser": False,
                    }, to=player.id)

    def on_avnet_complete(self) -> None:
        """Handle completion of anonymous veto network round."""
        if all([ player.avnet_done for player in self.players.values() ]):
            self.emit("public_vote_prompt", {
                "respondersSubset": [ player.name for player in self.responders_subset.values() ],
            })

    def on_public_vote_submit(self) -> None:
        """Handle public vote submission."""
        if all([ player.voted_for for player in self.players.values() ]):
            heretic = self._get_heretic()
            self.emit("public_vote_reveal", {
                "votes": self._get_users(),
                "heretic": heretic.name if heretic else "",
            })

            # Remove heretic if any
            if heretic:
                self.players.pop(heretic.id)

    def on_next_round_ready(self) -> None:
        """Handle next round ready notification."""
        if all([ player.ready_for_next_round for player in self.players.values() ]):
            # Reset the votes and submissions
            self._reset_round()
            # Start the game anew
            self.on_game_start()

    def emit(self, event_type: str, payload: Dict[str, str]) -> None:
        """Emit an event to all users in the room."""
        emit(event_type, payload, to=self.id)

    def on_game_start(self) -> None:
        """Start a game."""
        # Prompt all players for questions
        self.emit("question_prompt", {})

    def _select_question(self) -> str:
        """Select a random question."""
        return choice([ player.question for player in self.players.values() ])

    def _get_responders_subset(self) -> Dict[str, Player]:
        """Select a random subset of responders and return their IDs."""
        count = randint(2, len(self.players))
        keys_subset = sample(list(self.players.keys()), count)
        return { id: self.players[id] for id in keys_subset }

    def _get_users(self) -> List[Dict[str, str]]:
        """Fetch users in the room in a transport-ready format."""
        return [ {
            "name": player.name,
            "index" : player.index,
            "votedFor" : player.voted_for
            } for player in self.players.values() ]

    def _get_heretic(self) -> Optional[Player]:
        """Get name of the player with the most votes or None if tie."""
        heretic = self.players[list(self.players.keys())[0]]
        # Find the player with the most votes
        for player in self.players.values():
            if player.votes_against > heretic.votes_against:
                heretic = player

        # Check if tie
        for player in self.players.values():
            if player.votes_against == heretic.votes_against and player != heretic:
                # Return tie
                return None

        return heretic

    def _reset_round(self) -> None:
        """Reset round data of each player."""
        for player in self.players.values():
            player.reset()

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
