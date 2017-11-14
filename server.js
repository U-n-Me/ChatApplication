var WebSocketServer = require('websocket').server;
var http = require('http');
var portNo = 8090;
var options = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'};

var server = http.createServer(function(req, res){
  // We are not dealing with http now, so no need to
  // implement anything here
});

server.listen(portNo, function(){
  console.log("Server listening on port: "+ portNo);
});

// Let's start WebSocket Server
wsServer = new WebSocketServer({
  httpServer : server
});

function originIsAllowed(origin){
  // logic
  return true;
}

// whole server(app) data
var clients = {};

wsServer.on('request', function(request){
  var origin = request.origin;
  //console.log(request);
  if(!originIsAllowed(origin)){
    request.reject();
    console.log(new Date() + " Rejected: Connection from " + origin + ".");
    return;
  }
  var connection = request.accept(null, origin);
  var owner = connection.socket._handle.owner._peername;
  console.log(new Date() + " Accepted: Connection from " + JSON.stringify(owner) + " .");
  //var index = clients.push(connection) - 1;
  var userName = null;

  connection.on('message', function(message){
    if(message.type === 'utf8'){
      if(userName === null){
        userName = message.utf8Data;
        if(clients.hasOwnProperty(userName))
          userName += '@'+Math.round(Math.random() * 0xFFFF);
        // Give a color to each connection
        var r = Math.floor(Math.random()*256), g = Math.floor(Math.random()*256), b = Math.floor(Math.random()*256);
        if(r < 16)r = 16; if(g < 16)g = 16; if(b < 16)b = 16;
        var clr = "#"+r.toString(16)+g.toString(16)+b.toString(16);
        //send info to client
      connection.sendUTF(JSON.stringify({type: 'personal_log', time: new Date().toLocaleString("en-US", options),
                                username: userName, color: clr}));
        clients[userName] = {connection: connection, color: clr};
        console.log(new Date + ": " + userName + " added.");
        broadCast({type: 'broadcast_log', time: new Date().toLocaleString("en-US", options), message: userName + ' is active.'});
      }
      else{
        var message = message.utf8Data;
        console.log(new Date().toLocaleString("en-US") + ": " + userName + ": "+ message);
        broadCast({type: 'message', sender: userName,color: clients[userName].color, time: new Date().toLocaleString("en-US", options), message: message});
      }
    }
  });

  connection.on('close', function(reasonCode, description) {
    delete clients[userName];
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    broadCast({type: 'broadcast_log', time: new Date().toLocaleString("en-US", options), message: userName + ' is offline.'});
    });

    function broadCast(json){
      for(var client in clients){
        if(client !== userName)
          clients[client].connection.sendUTF(JSON.stringify(json));
      }
    }
});
