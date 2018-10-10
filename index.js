
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');

const Game = require('./server/game');
const Names = require('./server/names');

const port = 3000;

server.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.use(express.static('public'));

// Redirect for index
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const game = new Game();
const names = new Names();

// game.on('match', (match) => {
//   const players = match.consume();
//   io.emit('news', players);
// });

io.on('connection', (client) => {

  let name = names.add();
  let player = {
    id: client.id,
    name: name,
  };

  console.log(`Player connected: ${player.name} (${game.playerCount() + 1})`);
  game.addPlayer(player);
  client.emit('player', player);
  io.emit('players', game.players.players);

  client.on('disconnect', () => {
    console.log(`Player disconnected: ${player.name} (${game.playerCount() - 1})`);
    names.remove(player.name);
    game.removePlayer(player);
    io.emit('players', game.players.players);
  });

});