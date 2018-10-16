
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');

const TicTacToeAnalyzer = require('./server/tic-tac-toe-analyzer');
const TicTacToeNetServer = require('./server/tic-tac-toe-net-server');
const Names = require('./server/names');
const TicTacToe = require('./server/tic-tac-toe');

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}.`));

app.use(express.static(path.join(__dirname, 'public')));

// Redirect for index
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

const analyzer = new TicTacToeAnalyzer();
const net = new TicTacToeNetServer( io );
const names = new Names();
const game = new TicTacToe( analyzer, net, names );
