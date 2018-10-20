(function () { 'use strict';

  class TicTacToe {

    constructor(
      input,
      renderer,
      net,
      title,
      player,
    ) {
      this.input = input;
      this.renderer = renderer;
      this.net = net;
      this.title = title;
      this.player = player || {};

      this.input
        .on('click', pos => {
          this.renderer.setState({ click: pos });
        })
      ;

      this.renderer.on('take-turn', pos => {
        this.net.takeTurn(pos);
      });

      const gameState = state => {
        this.renderer.setState({
          isMyTurn: state.turn === state.marker,
          turn: state.turn,
          board: state.board,
        });
      };

      this.net
        .on('player', player => {
          this.player = player;
          this.title.set(player.name);
        })
        .on('game-start', state => {
          console.log('Match started against ' + state.opponent.name);
          console.log('My marker is ' + state.marker + ' and it is' + (state.turn === state.marker ? '' : ' not') + ' my turn.');
          this.renderer.setState({
            isInLobby: false,
            myMarker: state.marker,
            isHumanOpponent: true,
            [state.marker]: this.player.name,
            [state.marker === 'x' ? 'o' : 'x']: state.opponent.name,
          });
          gameState(state);
        })
        .on('game-state', state => {
          console.log('Game state:', state);
          gameState(state);
        })
        .on('game-end', state => {
          console.log('Match ended against ' + state.opponent.name);
          this.renderer.setState({
            board: state.board,
            isInLobby: true
          });
        })
      ;
    }

    animate(frame) {
      this.renderer.animate(frame);
      this.renderer.setState({ click: null });
    }

  }

  window.TicTacToe = TicTacToe;

})();
