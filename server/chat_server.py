import json
from flask import Flask, send_from_directory
from flask_sockets import Sockets

app = Flask(__name__)
sockets = Sockets(app)

@app.route("/")
def index():
    return send_static("index.html")

@app.route("/static/<path>")
def send_static(path):
    return send_from_directory("../client/static", path)

connections = []
messages = []

@sockets.route("/chat")
def chat_socket(web_socket):
    global connections
    connections = add_socket(web_socket, connections)

    while not web_socket.closed:
        message = json.loads(web_socket.receive())
        messages.append(message)
        connections = remove_closed_sockets(connections)
        json_message = json.dumps(message)
        send_message(json_message, connections)

def add_socket(web_socket, connections):
    return connections + [web_socket]

def remove_closed_sockets(connections):
    return [c for c in connections if not c.closed]

def send_message(message, connections):
    for socket in connections:
        socket.send(message)


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
