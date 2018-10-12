
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');

const Names = require('./server/names');
const TicTacToe = require('./server/tic-tac-toe');
const TicTacToeNetServer = require('./server/tic-tac-toe-net-server');

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}.`));

app.use(express.static('public'));

// Redirect for index
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const names = new Names();

const net = new TicTacToeNetServer( io );

const game = new TicTacToe( net, names );
