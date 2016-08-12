import json
from flask import Flask, render_template
from flask_sockets import Sockets

app = Flask(__name__)
sockets = Sockets(app)

@app.route("/")
def index():
    return render_template("index.html")

connections = []
messages = []

@sockets.route("/chat")
def echo_socket(web_socket):
    global connections
    connections.append(web_socket)

    while not web_socket.closed:
        message = json.loads(web_socket.receive())
        messages.append(message)
        connections = [c for c in connections if not c.closed]
        for socket in connections:
            socket.send(json.dumps(message))


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
