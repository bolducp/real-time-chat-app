$(document).ready(init);

function init(){
    clickHandler();
}

var socket = new WebSocket("ws://localhost:5000/chat");
var uid = createUID();
var allMessages = [];

socket.onopen = function (event) {
    console.log("Websocket open!");
}

socket.onclose = function (event) {
    console.log("Websocket closed!");
}

socket.onmessage = function (event) {
    var incomingMessage = JSON.parse(event.data);
    var $message = $("<p></p>)").text(incomingMessage["message"]);
    if (isUserMessage(incomingMessage)) {
        $message.css({ color: "green" });
    }
    $("#chat").append($message);
}

function createUID() {
    return s4() + s4() + s4() + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16);
}

function clickHandler() {
    $("button").click(sendMessage);
}

function sendMessage(event) {
    var data = JSON.stringify({
        uid: uid,
        message: $("textarea").val()
    });

    socket.send(data);
}

function isUserMessage(message) {
    return message["uid"] === uid;
}
