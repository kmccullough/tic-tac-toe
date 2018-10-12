(function () { 'use strict';

  class TicTacToe {

    constructor(
      renderer,
      net,
      title,
    ) {
      this.renderer = renderer;
      this.net = net;
      this.title = title;

      this.net
        .on('player', player => {
          console.log('Player name:', player.name);
          this.title.set(player.name);
        })
        .on('game-start', match => {
          console.log('Match started against ' + match.opponent.name);
          this.renderer.setState({
            isInLobby: false,
          });
        })
        .on('game-end', match => {
          console.log('Match ended against ' + match.opponent.name);
          this.renderer.setState({
            isInLobby: true,
          });
        })
      ;
    }

    animate(frame) {
      this.renderer.animate(frame);
    }

  }

  window.TicTacToe = TicTacToe;

})();
