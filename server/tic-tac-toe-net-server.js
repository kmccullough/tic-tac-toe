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
        client
          .on('take-turn', (pos) => {
            this.emitter.emit('take-turn', player, pos)
          })
          .on('disconnect', () => {
            this.clients.delete(player.id);
            this.emitter.emit('disconnect', player);
          })
        ;
      })
    ;
  }

  on(event, fn) {
    return this.emitter.on(event, fn);
  }

  error(event, message) {
    this.socket.emit('error', event, message);
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

  broadcastMatchStart(match) {
    const game = {
      turn: 'x',
      board: match.board.board,
    };
    const players = match.players.players;
    const c1 = this.clients.get(players[0].id);
    c1 && c1
      .emit('game-start', {
        ...game,
        marker: 'x',
        opponent: players[1],
      });
    const c2 = this.clients.get(players[1].id);
    c2 && c2
      .emit('game-start', {
        ...game,
        marker: 'o',
        opponent: players[0],
      });
    return this;
  }

  /**
   * @param {PlayerMatch} match
   * @returns {TicTacToeNetServer}
   */
  broadcastMatchState(match) {
    const game = {
      turn: match.getMarker(),
      board: match.board.board,
    };
    const players = match.players.players;
    const c1 = this.clients.get(players[0].id);
    c1 && c1
      .emit('game-start', {
        ...game,
        marker: 'x',
        opponent: players[1],
      });
    const c2 = this.clients.get(players[1].id);
    c2 && c2
      .emit('game-start', {
        ...game,
        marker: 'o',
        opponent: players[0],
      });
    return this;
  }

  broadcastMatchEnd(match) {
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

}

module.exports = TicTacToeNetServer;
