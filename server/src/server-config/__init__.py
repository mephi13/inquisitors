"""Configuration constants for inquisitors backend."""
import os
from OpenSSL.crypto import load_certificate, load_privatekey, FILETYPE_PEM 


class BaseConfig(object):
    """Base configuration for inquisitors backend."""

    DEBUG = True
    SERVER_NAME = (
        f'{os.environ["SERVER_HOSTNAME"]}:{os.environ["SERVER_PORT"]}'
    )
    CSRF_ENABLED = True
    SECRET_KEY = os.environ["SERVER_SECRET_KEY"]
    CA_CERT = load_certificate(FILETYPE_PEM ,open('./resources/rootCA.pem','r').read())
    CA_KEY = load_privatekey(FILETYPE_PEM ,open('./resources/rootCA.key','r').read())
