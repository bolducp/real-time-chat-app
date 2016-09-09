import json
from flask import Flask, send_from_directory, request
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
usernames = {}

@sockets.route("/chat")
def chat_socket(web_socket):
    global connections, usernames
    connections = add_socket(web_socket, connections)

    while not web_socket.closed:
        data = json.loads(web_socket.receive())
        connections = remove_closed_sockets(connections)

        if "message" in data:
            messages.append(data)
            json_message = json.dumps(data)

        elif "username" in data:
            usernames[data["uid"]] = data["username"]
            json_message = json.dumps( { "usernames" : usernames } )
        
        send_message(json_message, connections)
        
def add_socket(web_socket, connections):
    return connections + [web_socket]

def remove_closed_sockets(connections):
    return [c for c in connections if not c.closed]

def send_message(message, connections):
    for socket in connections:
        socket.send(message)

@app.route("/messages")
def send_messages():
    return json.dumps(messages)

@app.route("/usernames",  methods=["GET", "POST"])
def manage_username():
    global usernames

    if request.method == "POST":
        usernames[request.form["uid"]] = request.form["username"]
        return json.dumps(usernames)
    else:
        return json.dumps(usernames)
    

if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
