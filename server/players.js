const EventEmitter = require('events');

const Player = require('./player');

class PlayersEmitter extends EventEmitter { }

class Players {

  constructor() {
    this.players = [];
    this.emitter = new PlayersEmitter();
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }

  add(player) {
    player = Player.wrap(player);
    if (!this.players.some(p => p.id === player.id)) {
      this.players.push(player);
      this.emitter.emit('add', player, this);
    }
    return this;
  }

  remove(player) {
    player = Player.wrap(player);
    const i = this.players.findIndex(p => p.id === player.id);
    if (i >= 0) {
      this.players.splice(i, 1);
      this.emitter.emit('remove', player, this);
    }
    return this;
  }

}

module.exports = Players;