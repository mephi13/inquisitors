"""Configuration constants for inquisitors backend."""
import os


class BaseConfig(object):
    """Base configuration for inquisitors backend."""

    DEBUG = True
    SERVER_NAME = (
        f'{os.environ["SERVER_HOSTNAME"]}:{os.environ["SERVER_PORT"]}'
    )
    CSRF_ENABLED = True
    SECRET_KEY = os.environ["SERVER_SECRET_KEY"]
