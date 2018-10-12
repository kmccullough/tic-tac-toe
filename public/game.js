((io, app) => { 'use strict';

  app.run(() => {

    const titleService = new TitleService();
    titleService
      .setPart('original', app.dom.one('title').innerHTML)
      .on('change', title => { document.title = title; });

    const renderer = new TicTacToeRenderer(
      app.dom.one('#js-canvas')
    );

    const server = new TicTacToeServer( io.connect('//') );

    const game = new TicTacToe( renderer, server, titleService );

    app.canvas.animate(15, frame => game.animate(frame));

  });

})(window.io, window.app);
