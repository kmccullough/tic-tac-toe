const EventEmitter = require('events');

const { Player } = require('./player');

class MatchesEmitter extends EventEmitter { }

class PlayerMatches {

  constructor() {
    this.byPlayerId = new Map();
    this.matches = new Set();
    this.emitter = new MatchesEmitter();
  }

  on(event, handler) {
    this.emitter.on(event, handler);
    return this;
  }

  add(match) {
    match.players.players.forEach(player => {
      let matches = this.byPlayerId.get(player.id);
      if (!matches) {
        this.byPlayerId.set(player.id, matches = new Set());
      }
      matches.add(match);
      this.emitter.emit('player-added-to-match', player, match, this);
    });
    this.matches.add(match);
    this.emitter.emit('add', match, this);
    return this;
  }

  remove(match) {
    match.players.players.forEach(player => {
      let matches = this.byPlayerId.get(player.id);
      if (matches) {
        matches.delete(match);
        this.emitter.emit('player-removed-from-match', player, match, this);
        if (!matches.size) {
          this.byPlayerId.delete(player.id);
          this.emitter.emit('player-removed-from-all-matches', player, this);
        }
      }
    });
    this.matches.delete(match);
    this.emitter.emit('remove', match, this);
    return this;
  }

  getByPlayer(player) {
    player = Player.wrap(player);
    return Array.from(this.byPlayerId.get(player.id) || []);
  }
}

module.exports = {
  PlayerMatches,
};
