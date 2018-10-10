const EventEmitter = require('events');

const Players = require('./players');
const Player = require('./player');

class GameQueueEmitter extends EventEmitter { }

class PlayerMatch {

  constructor(a, b, consumeFn) {
    this[0] = a;
    this[1] = b;
    this.consumeFn = consumeFn;
  }

  consume() {
    this.consumeFn && this.consumeFn();
    return [ this[0], this[1] ];
  }

}

class Game {

  constructor() {
    this.emitter = new GameQueueEmitter();

    this.players = new Players();
    this.players.on('add', (player, players) => {
      // if (players.length >= 2) {
      //   const players = new PlayerMatch(
      //     this.players[0],
      //     this.players[1],
      //     () => this.players.splice(0, 2)
      //   );
      //   this.emitter.emit('match', players);
      // }
    });
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }

  addPlayer(player) {
    this.players.add(player);
    return this;
  }

  removePlayer(player) {
    this.players.remove(player);
    return this;
  }

  playerCount() {
    return this.players.players.length;
  }

}

module.exports = Game;