((io, app) => { 'use strict';

  app.run(() => {

    const titleService = new TitleService();
    titleService
      .setPart('original', app.dom.one('title').innerHTML)
      .on('change', title => { document.title = title; });

    const gamesEl = app.dom.one('.games');
    const usersEl = app.dom.one('.users');
    const canvas = app.dom.one('canvas');
    const name = app.dom.one('.name');
    const play = app.dom.one('.play');
    const turn = app.dom.one('.turn');
    const player1 = app.dom.one('.player1');
    const player2 = app.dom.one('.player2');
    const queueEl = app.dom.one('.queue');

    const input = new TicTacToeInput( canvas, name, play );

    const router = new TicTacToeRouter(app.dom.one('.app'), {
      lobby: app.dom.one('.lobby'),
      game: app.dom.one('.local-game'),
    });

    const renderer = new TicTacToeRenderer({
      canvas,
      headerEl: app.dom.one('.local-game .header'),
      turn,
      player1,
      player2,
    });

    const net = new TicTacToeNetClient( io.connect('//') );

    const game = new TicTacToe( router, gamesEl, usersEl, queueEl, name, input, renderer, net, titleService );

    app.canvas.animate(15, frame => game.animate(frame));

  });

})(window.io, window.app);
