import json
from geventwebsocket.websocket import WebSocket
from mock import Mock
from ..chat_server import add_socket, remove_closed_sockets, send_message

def test_add_socket():
    # given
    socket = WebSocket(Mock(), Mock(), Mock())
    connections = []

    # when
    result = add_socket(socket, connections)

    # then
    assert result == [socket]


def test_remove_closed_sockets():
    # given
    socket1 = Mock(WebSocket)
    socket1.closed = False
    socket2 = Mock(WebSocket)
    socket2.closed = False
    socket3 = Mock(WebSocket)
    socket3.closed = True

    connections = [socket1, socket2, socket3]

    # when 
    result = remove_closed_sockets(connections)

    # then
    assert result == [socket1, socket2]


def test_send_message():
    # given
    connections = [Mock(WebSocket), Mock(WebSocket)]
    message = '{"uid": 4444, "message": "test message"}'
    
    # when
    send_message(message, connections)

    # then
    for connection in connections:
        connection.send.assert_called_with(message)


    