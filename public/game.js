((io, app) => { 'use strict';

  app.run(() => {

    const titleService = new TitleService();
    titleService
      .setPart('original', app.dom.one('title').innerHTML)
      .on('change', title => { document.title = title; });

    const canvas = app.dom.one('#js-canvas');

    const input = new TicTacToeInput( canvas );

    const renderer = new TicTacToeRenderer( canvas );

    const net = new TicTacToeNetClient( io.connect('//') );

    const game = new TicTacToe( input, renderer, net, titleService );

    app.canvas.animate(15, frame => game.animate(frame));

  });

})(window.io, window.app);
