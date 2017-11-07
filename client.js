var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('Connection Closed by Server');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });

    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            number = Math.round(Math.random() * 3);
            var users = ['umesh', 'kamlesh', 'mukesh', 'divesh'];
            connection.sendUTF(users[number]);
            setTimeout(sendNumber, 3000);
        }
    }
    sendNumber();
});

client.connect('ws://localhost:8090/', null);
