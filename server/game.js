const EventEmitter = require('events');

const PlayerMatch = require('./match');
const PlayerMatches = require('./matches');
const Players = require('./players');

class GameQueueEmitter extends EventEmitter { }

class Game {

  constructor() {
    this.emitter = new GameQueueEmitter();

    this.players = new Players();
    this.queue = new Players();
    this.matches = new PlayerMatches();

    this.queue.on('add', () => this.matchPlayers());

    this.matches.on('remove', match => {
      match.players.players.forEach(player => {
        if (this.players.has(player) && !this.queue.has(player)) {
          this.queue.add(player);
        }
      })
    });
  }

  matchPlayers() {
    const players = this.queue.players.slice(0, 2);
    if (players.length >= 2) {
      const match = new PlayerMatch(players);
      this.queue
        .remove(players[0])
        .remove(players[1])
      ;
      this.matches.add(match);
      this.emitter.emit('match-start', match);
    }
    return this;
  }

  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }

  addPlayer(player) {
    this.players.add(player);
    this.queue.add(player);
    this.emitter.emit('add-player', player);
    return this;
  }

  removePlayer(player) {
    this.players.remove(player);
    this.queue.remove(player);
    this.matches.getByPlayer(player)
      .forEach(match => {
        this.matches.remove(match);
        // TODO: reason for match-end (e.g. player quit, other player wins)
        this.emitter.emit('match-end', match)
      });
    this.emitter.emit('remove-player', player);
    return this;
  }

  playerCount() {
    return this.players.players.length;
  }

}

module.exports = Game;