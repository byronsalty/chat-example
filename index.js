const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

connectedUsers = {};

function sysMsg(msg) {
  return {
    user: "system",
    content: msg
  }
}

io.on('connection', (socket) => {
  //io.emit('chat message', "User connected");

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    //io.emit('chat message', sysMsg("user disconnected"));
    console.log("someone disconnected " + socket.id);
    let user = connectedUsers[socket.id];
    console.log("someone disconnected " + user);
    io.emit('chat message', sysMsg(user + " disconnected"));
  });
  socket.on('username', user => {
    console.log("username registered: " + user);
    io.emit('chat message', sysMsg(user + " connected"));
    connectedUsers[socket.id] = user
    console.log("users: " + JSON.stringify(connectedUsers));
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
