"""HTTP API definition."""

from flask import Response, jsonify, request
from OpenSSL.crypto import load_certificate, FILETYPE_PEM, dump_certificate
from . import app, log
from typing import Dict
from secrets import token_urlsafe
import base64

from .game_rooms import game_rooms, GameRoom

@app.route("/get_room", methods=["GET"])
def get_room() -> Response:
    """Allocate a game room."""
    room_id = token_urlsafe()
    game_rooms[room_id] = GameRoom(room_id)
    # Send the ID back to the client
    return jsonify({
        # Speak JavaScript and use camelCase
        "roomId" : room_id,
    })

@app.route("/sign", methods=["POST"])
def sign() -> Response:
    """Sign TLS certificate."""
    data = request.json
    if "cert" not in data:
        return jsonify({
            "error" : "Certificate is required",
        })
    decoded = base64.b64decode(data["cert"]).decode()
    cert_to_sign = load_certificate(FILETYPE_PEM, decoded) 
    cert_to_sign.sign(app.config['CA_KEY'], "sha256")
    signed_cert = dump_certificate(FILETYPE_PEM, cert_to_sign)
    log.debug(signed_cert.decode())
    return jsonify({
        "signedCert" : (signed_cert).decode(),
    })

