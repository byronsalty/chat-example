const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const SYSTEM_USER = "system";

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

connectedUsers = {};

function findSocketId(username) {
  for (const socket in connectedUsers) {
    if (connectedUsers[socket] === username) {
      return socket;
    }
  }
}
function sysMsg(msg) {
  return {
    user: SYSTEM_USER,
    content: msg
  }
}

io.on('connection', (socket) => {
  //io.emit('chat message', "User connected");

  socket.on('chat message', msg => {
    
    
    if (/^\//.test(msg.content)) {
      console.log("User sent a command");
      const commandRe = /^\/(\w+) ?(\w*) ?(.*)/;
      let found = msg.content.match(commandRe);

      if (found[1] === "list") {
        msg = sysMsg("Users: " + Object.values(connectedUsers));
        
        socket.emit('chat message', msg);
      } else if (found[1] === "msg") {
        toPerson = found[2]
        body = found[3]
        id = findSocketId(toPerson);
        if (id) {
          msg.content = body;
          socket.to(id).emit('chat message', msg);
        } else {
          socket.emit('chat message', sysMsg("Private Message not deliverable."));
        }
      } else {
        console.log("Unknown command");
        socket.emit('chat message', sysMsg("Unknown command: " + found[1]));
      }
    } else {
      socket.broadcast.emit('chat message', msg);
    }
  });
  socket.on('typing', msg => {
    console.log(msg.user + " is typing");
    socket.broadcast.emit('typing', msg);
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
