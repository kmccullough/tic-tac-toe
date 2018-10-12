const Players = require('./players');
const PlayerMatch = require('./match');
const PlayerMatches = require('./matches');

class TicTacToe {

  constructor(
    net,
    names,
    players,
    queue,
  ) {
    this.net = net;
    this.names = names;
    this.players = players || new Players();
    this.queue = queue || new Players();
    this.matches = new PlayerMatches();

    this.net
      .on('connection', player => {
        player.name = this.names.add();
        console.log(`Player connected: ${player.name} (${this.players.length + 1})`);
        this.players.add(player);
        this.net
          .emitPlayer(player)
          .broadcastPlayers([ ...this.players ])
        ;
      })
      .on('disconnect', player => {
        console.log(`Player disconnected: ${player.name} (${this.players.length - 1})`);
        this.players.remove(player);
        this.names.remove(player.name);
        this.matches.getByPlayer(player)
          .forEach(match => this.matches.remove(match));
        this.net.broadcastPlayers(Array.from(this.players));
      })
    ;

    this.players.on('add', player => this.queue.add(player));

    // Try to match players whenever a new player added to the queue
    this.queue.on('add', () => this.matchPlayers());

    this.matches
      .on('add', match => {
        const players = [ ...match.players ];
        console.log(`Match started between ${players[0].name} and ${players[1].name}`);
        this.net.matchStart(match);
      })
      .on('remove', match => {
        const players = [ ...match.players ];
        console.log(`Match ended between ${players[0].name} and ${players[1].name}`);
        // If a match is removed, add players back to queue
        players.forEach(player => {
          if (this.players.has(player) && !this.queue.has(player)) {
            this.queue.add(player);
          }
        });
        // Notify players match is over
        this.net.matchEnd(match);
      })
    ;
  }

  matchPlayers() {
    const players = [ ...this.queue ];
    if (players.length >= 2) {
      const match = new PlayerMatch(players);
      this.queue
        .remove(players[0])
        .remove(players[1])
      ;
      this.matches.add(match);
    }
    return this;
  }

}

module.exports = TicTacToe;
