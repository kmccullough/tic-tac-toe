
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');

const Game = require('./server/game');
const Names = require('./server/names');

const port = 3000;

server.listen(port, () => console.log(`Listening on port ${port}.`));

app.use(express.static('public'));

// Redirect for index
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const game = new Game();
const names = new Names();
const clients = new Map();

game
  .on('match-start', (match) => {
    const players = match.players.players;
    const c1 = clients.get(players[0].id);
    c1 && c1
      .emit('game-start', {
        opponent: players[1],
      });
    const c2 = clients.get(players[1].id);
    c2 && c2
      .emit('game-start', {
        opponent: players[0],
      });
  })
  .on('match-end', (match) => {
    const players = match.players.players;
    const c1 = clients.get(players[0].id);
    c1 && c1
      .emit('game-end', {
        opponent: players[1],
      });
    const c2 = clients.get(players[1].id);
    c2 && c2
      .emit('game-end', {
        opponent: players[0],
      });
  })
;

io.on('connection', (client) => {

  let name = names.add();
  let player = {
    id: client.id,
    name: name,
  };

  clients.set(player.id, client);

  console.log(`Player connected: ${player.name} (${game.playerCount() + 1})`);
  game.addPlayer(player);
  client.emit('player', player);
  io.emit('players', game.players.players);

  client.on('disconnect', () => {
    clients.delete(player.id);
    console.log(`Player disconnected: ${player.name} (${game.playerCount() - 1})`);
    names.remove(player.name);
    game.removePlayer(player);
    io.emit('players', game.players.players);
  });

});