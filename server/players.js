const EventEmitter = require('events');

const { Player } = require('./player');

class PlayersEmitter extends EventEmitter { }

class Players {

  static wrap(playersLike) {
    return playersLike instanceof Players ? playersLike : new Players(playersLike);
  }

  constructor(players) {
    this.players = [];
    if (players instanceof Players) {
      this.players = players.players.slice();
    } else if (Array.isArray(players)) {
      this.players = players.slice();
    }
    this.emitter = new PlayersEmitter();
  }

  [Symbol.iterator]() {
    return this.players[Symbol.iterator]();
  }

  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }

  add(player) {
    player = Player.wrap(player);
    if (!this.has(player)) {
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

  toggle(player) {
    return this.has(player) ? this.remove(player) : this.add(player);
  }

  get length() {
    return this.players.length;
  }

  indexOf(player) {
    const { id } = Player.wrap(player);
    return this.players.findIndex(p => p.id === id);
  }

  has(player) {
    return this.indexOf(player) >= 0;
  }

  get(player) {
    return this.players[this.indexOf(player)];
  }

  update(player) {
    player = Player.wrap(player);
    const index = this.indexOf(player);
    if (index >= 0) {
      this.players[index] = player;
      this.emitter.emit('update', player, this);
    }
    return this;
  }

  forEach(fn) {
    this.players.forEach(fn);
    return this;
  }

  map(fn) {
    return this.players.map(fn);
  }

}

module.exports = {
  Players,
};
