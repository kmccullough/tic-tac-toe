const { Players } = require('./players');
const { PlayerMatch } = require('./match');
const { PlayerMatches } = require('./matches');

class TicTacToe {

  constructor(
    analyzer,
    net,
    names,
    players,
    queue,
  ) {
    /** @type TicTacToeAnalyzer */
    this.analyzer = analyzer;
    /** @type TicTacToeNetServer */
    this.net = net;
    this.names = names;
    this.players = players || new Players();
    this.queue = queue || new Players();
    this.matches = new PlayerMatches();

    this.players.on('add', player => {
      // Notify players of latest player list
      this.net.broadcastPlayers([ ...this.players ]);
      // Add player to match queue
      this.queue.add(player);
    });

    this.queue.on('add', () => {
      // Try to match players whenever a new player added to the queue
      this.matchPlayers();
    });

    this.matches
      .on('add', match => {
        const players = [ ...match.players ];
        console.log(`Match started between ${players[0].name} and ${players[1].name}`);
        // Notify players of their starting match
        this.net.broadcastMatchStart(match);
      })
      .on('remove', match => {
        const players = [ ...match.players ];
        console.log(`Match ended between ${players[0].name} and ${players[1].name}`);
        // Notify players match is over
        this.net.broadcastMatchEnd(match);
        // If a match is removed, add players back to queue
        players.forEach(player => {
          if (this.players.has(player) && !this.queue.has(player)) {
            this.queue.add(player);
          }
        });
      })
    ;

    this.net
      .on('connection', player => {
        player.name = this.names.add();
        console.log(`Player connected: ${player.name} (${this.players.length + 1})`);
        // Tell the player who they are
        this.net.emitPlayer(player);
        // Add the player to the collection
        this.players.add(player);
      })
      .on('take-turn', (player, pos) => {
        /** @type PlayerMatch */
        const match = this.matches.getByPlayer(player)[0];
        if (!match) {
          this.net.error('take-turn', 'You are not in a match.');
        } else if (!match.isPlayerTurn(player)) {
          this.net.error('take-turn', 'It is not your turn.');
        } else if (!match.board.isEmptyAt(pos)) {
          this.net.error('take-turn', 'That position is not empty.')
        } else {
          // Make the move
          match.board.setMarker(pos, match.getMarker());
          // Change turn marker
          match.toggleMarker();
          // Analyze the resulting board
          const analysis = this.analyzer.analyze(match.board);
          if (analysis.isInvalid) {
            console.log('Invalid game state');
            // Something went wrong
            match.setResult({ error: 'Invalid game state' });
            this.matches.remove(match);
          } else if (analysis.isOver) {
            match.setResult({ winner: analysis.winningMarker });
            this.matches.remove(match);
          } else {
            // Still playing, broadcast state
            this.net.broadcastMatchState(match);
          }
        }
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

module.exports = {
  TicTacToe,
};
