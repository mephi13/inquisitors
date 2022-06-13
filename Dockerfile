FROM python:3.8 AS server

WORKDIR /usr/src/app

# Copy required modules
COPY server server

# Install the modules
RUN pip install -e server

# Make the log directory
RUN mkdir log

# Copy resources
# COPY resources/certs/CansCert.pem resources/certs/CansCert.pem
# COPY resources/certs/CansKey.pem resources/certs/CansKey.pem

CMD ["python", "-u", "-m", "inquisitors"]
