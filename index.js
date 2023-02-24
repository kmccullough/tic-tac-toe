const process = require('process');

function onExit() {
  // do whatever to terminate properly
  // at worst, just 'exit(0)'
  console.log('Tic-Tac-Terminating...');
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

ipc.config.id = 'tic-tac-toe.U0F0IWJhfExBckgS';
ipc.config.stopRetrying = 0;
ipc.config.silent = true;

const maintenanceNoticeDelay = 5000;

let updateDelayed = 0;
ipc.serve(() => {
  ipc.server.on('update', (data, socket) => {
    if (updateDelayed === 0) {
      console.log('Server update requested. Sending maintenance notices.');
      console.log(`Update will commence in ${maintenanceNoticeDelay * 2} ms...`);
      // Notify tic-tac-toe clients that the server will soon be going down for maintenance
      io.emit('maintenance', maintenanceNoticeDelay * 2);
      // Respond to update server that we need some time...
      ipc.server.emit(socket, 'update', maintenanceNoticeDelay);
    } else if (updateDelayed === 1) {
      console.log(`Update will commence in ${maintenanceNoticeDelay} ms...`);
      // Notify tic-tac-toe clients that the server will SOON be going down for maintenance
      io.emit('maintenance', maintenanceNoticeDelay);
      // Respond to update server that we need MORE time...
      ipc.server.emit(socket, 'update', maintenanceNoticeDelay);
    } else {
      console.log(`Ready for update.`);
      // Respond to update server that we are ready for update
      ipc.server.emit(socket, 'update');
    }
    updateDelayed = (updateDelayed + 1) % 3;
  });
  ipc.server.on('disconnect', () => {
    updateDelayed = 0;
  });
});
ipc.server.start();

const port = 3000;

server.listen(port, () => console.log(`Serving on http://localhost:${port}/`));

app.use(express.static(path.join(__dirname, 'public')));

// Redirect for index
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

const analyzer = new TicTacToeAnalyzer();
const net = new TicTacToeNetServer( io );
const names = new Names();
const game = new TicTacToe( analyzer, net, names );
