$(document).ready(init);

function init(){
    clickHandler();
    setRandomBackgroundColor();
    getAllMessages();
}

var socket = new WebSocket("ws://" + window.location.host + "/chat");
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
    $("textarea").val("");
}

function isUserMessage(message) {
    return message["uid"] === uid;
}

function setRandomBackgroundColor() {
    var colors = [
        "LightSteelBlue", "LightSalmon", "LightYellow", "LightSeaGreen", "MistyRose", "PaleTurquoise", "PaleVioletRed", "Thistle", "Lavender", "DarkTurquoise", "DarkSeaGreen", "CadetBlue", "LightGoldenRodYellow", "LightCyan", "LightCoral"
    ];
    var randomIndex = Math.floor(Math.random() * colors.length);
    $("body").css({ "background-color": colors[randomIndex]});
}

function getAllMessages() {
    $.ajax({
        url: "/messages",
        type: "GET",
        success: function(data){
            setUpChat(data);
        },
        error: function(err){
            alert(err);
        }
    });
}

function setUpChat(messages) {
    console.log("MESSAGES", messages);
}