const Players = require('./players');

class PlayerMatch {

  constructor(
    players
  ) {
    this.players = Players.wrap(players);
  }

}

module.exports = PlayerMatch;
