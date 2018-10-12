(function () { 'use strict';

  class TicTacToe {

    constructor(
      renderer,
      server,
      title,
    ) {
      this.renderer = renderer;
      this.server = server;
      this.title = title;

      this.server
        .on('player', player => {
          this.title.set(player.name);
        });
      this.server
        .on('game-start', game => {
          this.renderer.setState({
            isInLobby: false,
          });
        });
      this.server
        .on('game-end', game => {
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
