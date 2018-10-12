const EventEmitter = require('events');

class TicTacToeNetServer {

  constructor(
    socket,
    clients,
  ) {
    this.emitter = new EventEmitter();
    this.socket = socket;
    this.clients = clients || new Map();

    this.socket
      .on('connection', (client) => {
        let player = { id: client.id };
        this.clients.set(player.id, client);
        this.emitter.emit('connection', player);
        client.on('disconnect', () => {
          this.clients.delete(player.id);
          this.emitter.emit('disconnect', player);
        });
      })
    ;
  }

  emitPlayer(player) {
    const client = this.clients.get(player.id);
    if (client) {
      client.emit('player', player);
    }
    return this;
  }

  broadcastPlayers(players) {
    this.socket.emit('players', players);
    return this;
  }

  matchStart(match) {
    const players = match.players.players;
    const c1 = this.clients.get(players[0].id);
    c1 && c1
      .emit('game-start', {
        opponent: players[1],
      });
    const c2 = this.clients.get(players[1].id);
    c2 && c2
      .emit('game-start', {
        opponent: players[0],
      });
    return this;
  }

  matchEnd(match) {
    const players = match.players.players;
    const c1 = this.clients.get(players[0].id);
    c1 && c1
      .emit('game-end', {
        opponent: players[1],
      });
    const c2 = this.clients.get(players[1].id);
    c2 && c2
      .emit('game-end', {
        opponent: players[0],
      });
    return this;
  }

  on(event, fn) {
    return this.emitter.on(event, fn);
  }

}

module.exports = TicTacToeNetServer;
