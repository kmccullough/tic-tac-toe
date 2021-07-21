const process = require('process');

function onExit() {
  // do whatever to terminate properly
  // at worst, just 'exit(0)'
  process.exit(0);
}

process.on('SIGTERM', onExit);
process.on('SIGINT', onExit);

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');

const { TicTacToeAnalyzer } = require('./server/tic-tac-toe-analyzer');
const { TicTacToeNetServer } = require('./server/tic-tac-toe-net-server');
const { Names } = require('./server/names');
const { TicTacToe } = require('./server/tic-tac-toe');

const ipc = require('node-ipc');

ipc.config.id = 'tic-tac-toe-LpptAjZ3/fdXmTN7KTt8lg==';
ipc.config.stopRetrying = 0;

const ipcServer = ipc.server;
ipc.serve(() => {
  ipcServer.on('update', (data, socket) => {
    // For now, just end after a short timeout
    setTimeout(() => {
      io.emit('maintenance', 5000);
      ipcServer.emit(socket, 'update');
    }, 5000);
  });
});
ipcServer.start();

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
