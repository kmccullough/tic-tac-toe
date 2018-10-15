const EventEmitter = require('events');

const Player = require('./player');

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
    this.length = this.players.length;
    this.emitter = new PlayersEmitter();
  }

  [Symbol.iterator]() {
    return this.players[Symbol.iterator]();
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }

  add(player) {
    player = Player.wrap(player);
    if (!this.has(player)) {
      this.players.push(player);
      this.length = this.players.length;
      this.emitter.emit('add', player, this);
    }
    return this;
  }

  remove(player) {
    player = Player.wrap(player);
    const i = this.players.findIndex(p => p.id === player.id);
    if (i >= 0) {
      this.players.splice(i, 1);
      this.length = this.players.length;
      this.emitter.emit('remove', player, this);
    }
    return this;
  }

  has(player) {
    player = Player.wrap(player);
    return this.players.some(p => p.id === player.id);
  }

  forEach(fn) {
    this.players.forEach(fn);
    return this;
  }

  indexOf(player) {
    return this.players.indexOf(player);
  }
}

module.exports = Players;