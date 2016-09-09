$(document).ready(init);

function init(){
    clickHandler();
    setRandomBackgroundColor();
    getAllMessages();
    getAllUsernames();

    var username = generateRandomUsername();
    initializeRandomUsername(username);
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

function generateRandomUsername() {
    var adjectives =  [   
        "affable", "agreeable", "ambitious", "amicable", "amusing", "charming", "conscientious",
        "considerate", "diligent", "dynamic", "exuberant", "gregarious", "imaginative", "inventive",
        "optimistic", "persistent", "pioneering", "philosophical", "practical", "rational", "reliable", 
        "resourceful", "sensible", "sincere", "sociable", "versatile", "warmhearted", "witty"
    ];

    var animals = [ 
        "anaconda", "macaw", "butterfly", "crocodile", "dragonfly", "mongoose", "fox", "gecko", "armadillo", 
        "hummingbird", "iguana", "katydid", "lemur", "leopard", "puma", "panda", "sloth", "sting-ray"
    ];

    return toTitleCase(adjectives[Math.floor(Math.random() * adjectives.length)] + " " + animals[Math.floor(Math.random() * animals.length)]);
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function initializeRandomUsername(username) {
    var data = JSON.stringify({
        uid: uid,
        username: username
    });

    socket.send(data);
    $("#username").text(username);
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16);
}

function clickHandler() {
    $("#sendMessage").click(sendMessage);
    $("#updateUsername").click(updateUsername);
    $("textarea").keyup(sendOnEnter);
}

function sendMessage() {
    var data = JSON.stringify({
        uid: uid,
        message: $("textarea").val()
    });

    socket.send(data);
    $("textarea").val("");
}

function updateUsername() {
    var newUsername = $("input").val();

    var data = JSON.stringify({
        uid: uid,
        username: newUsername
    });

    socket.send(data);
    $("input").val("");
    $("#username").text(newUsername);
}

function sendOnEnter(event){
    if(event.keyCode == 13) {
        sendMessage();
    }
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