FROM python:3.8 AS server

WORKDIR /usr/src/app

# Copy required modules
COPY server server

# Install the modules
RUN pip install -e server

# Make the log directory
RUN mkdir log

CMD ["python", "-u", "-m", "inquisitors-server"]
