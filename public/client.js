var username = null, userColor = null;
var connection = null;
var msgBox = $('textarea[name=message]');
var chats = $('.chats');
var logs = $('.log');
var options = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'};

$(function() {
  alert("Your first message is your user name. Only after providing user name, you can chat.");
  // if user is running mozilla then use it's built-in WebSocket
 var wbSocket = window.WebSocket || window.MozWebSocket;
 // if browser doesn't support WebSocket, just show
 // some notification and exit
 if (!wbSocket) {
   alert("Your Browser doesn't support WebSocket");
   addLog(new Date().toLocaleString('en-US', options)+": You browser doesn't support WebSocket");
   return;
 }

 connection = new WebSocket('ws://localhost:8090');

 connection.onopen = function () {
   // Do what you need at server startup
   var log = new Date().toLocaleString('en-US', options)+": You are connected to the server. Send your username.";
   addLog(log);
   // check connection status perodically
   checkConnection();
 };

  connection.onclose = function(){
    // Do what you need at server startup
    disConnectLog();
  };

 connection.onerror = function (error) {
   // just in there were some problems with connection...
   addLog(new Date().toLocaleString('en-US', options)+": "+ error);
 };

 connection.onmessage = function (message) {
    // Messages from server, we need to parse the messages to know what
    // type of message is this.
    console.log(message.data);
    var msg = JSON.parse(message.data);
    var time = msg.time;
    if(msg.type == 'broadcast_log')
      addLog(time+": "+msg.message);
    else if(msg.type == 'personal_log'){
      addLog(time+": Your user name is: "+msg.username+".");
      username = msg.username;
      userColor = msg.color;
      $('#userName').html("My Username: "+ username);
    }
    else if(msg.type == 'message')
      updateChatBox(msg.sender, time, msg.color, msg.message, true);
  };

});

function disConnectLog(){
  var log = new Date().toLocaleString('en-US', options)+": Connection closed by server or server is down. You may try refreshing.";
  addLog(log);
}


function updateChatBox(user, time, color, msg, isReceived){
  var username = user + " (" + time + ")";
  var sender = $("<div class = 'sender'></div>");
  var message = $("<div class = 'message'></div>");
  sender.append(username);
  message.append(msg);
  var chatMsg = null;
  if(isReceived){
    chatMsg = $("<div class = 'receivedMsg mess'></div>");
    chatMsg.append(sender);
    chatMsg.append(message);
  }else{
    chatMsg = $("<div class = 'sentMsg mess'></div>");
    chatMsg.append(message);
    chatMsg.append(sender);
  }
  chatMsg.css({'background-color': color});
  chats.append(chatMsg);
  // This line scrools down to latest message.
  chats.stop().animate({ scrollTop: chats[0].scrollHeight}, 1000);
}

function addLog(log){
  logs.append(log+"<br>>> ");
  logs.stop().animate({ scrollTop: logs[0].scrollHeight}, 1000);
}

// Send when enter key is pressed
 msgBox.keydown(function(e){
   if(e.keyCode === 13)
    sendMsg();
 });

 function sendMsg(){
   if(connection.readyState !== 1){
     alert("Not connected. Check log");
     disConnectLog();
     return;
   }
   var msg = msgBox.val();
   if(msg == null || msg.length == 0)alert("Type  Some Message");
   else {
     msgBox.val("");
     // Send msgs to server
     connection.send(msg);
     //update chat-box
     if(username != null)
      updateChatBox("", new Date().toLocaleString('en-US', options), userColor, msg, false);
   }
 }

 function checkConnection(){
     if(connection.readyState !== 1){
       disConnectLog();
     }
     setTimeout(checkConnection, 5000);
 }
