$(document).ready(init);

function init(){
    clickHandler();
    setRandomBackgroundColor();
    getAllMessages();
    getAllUsernames();
}

if (window.location.protocol == "https:") {
  var ws_scheme = "wss://";
} else {
  var ws_scheme = "ws://";
}

var socket = new WebSocket(ws_scheme + location.host + "/chat");
var uid = createUID();
var allMessages = [];
var usernames = {};

socket.onopen = function (event) {
    console.log("Websocket open!");
}

socket.onclose = function (event) {
    console.log("Websocket closed!");
}

socket.onmessage = function (event) {
    var incomingMessage = JSON.parse(event.data);

    if (incomingMessage["message"]) {
        addMessageToChatScreen(incomingMessage);
    } else if (incomingMessage["usernames"]) {
        usernames = incomingMessage["usernames"];
    }
}

function addMessageToChatScreen(message) {
    var $line = $("<div></div>");
    var $message = $("<span></span>").text(message["message"]);
    var username = getUsername(message["uid"]);
    var $username = $("<span></span>").text(username);

    if (isUserMessage(message)) {
        $message.css({ color: "green" });
    }

    $line.append($username, ": ", $message);
    $("#chat").append($line);
} 

function getUsername(uid) {
    return usernames[uid] || uid;
}

function createUID() {
    return s4() + s4() + s4() + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16);
}

function clickHandler() {
    $("button").click(sendMessage);
    $("#username").click(updateUsername);
}

function sendMessage(event) {
    var data = JSON.stringify({
        uid: uid,
        message: $("textarea").val()
    });

    socket.send(data);
    $("textarea").val("");
}

function updateUsername() {
    var data = JSON.stringify({
        uid: uid,
        username: $("input").val()
    });

    socket.send(data);
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
            var messageData = JSON.parse(data);
            setUpChat(messageData);
            console.log(messageData);
        },
        error: function(err){
            alert(err);
        }
    });
}

function getAllUsernames() {
    $.ajax({
        url: "/usernames",
        type: "GET",
        success: function(data){
            var responseData = JSON.parse(data);
            usernames = responseData;
        },
        error: function(err){
            alert(err);
        }
    });
}

function setUpChat(messages) {
    for (var i = 0; i < messages.length; i++) {
        addMessageToChatScreen(messages[i]);
    }
}