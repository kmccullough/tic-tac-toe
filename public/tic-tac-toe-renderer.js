(function () { 'use strict';

  class TicTacToeRenderer {

    constructor(
      canvas,
      style,
      state
    ) {
      this.emitter = new app.cb.Emitter();
      this.canvas = canvas;
      this.canvasContext = canvas.getContext('2d');
      this.style = {
        gridWidth: 3,
        gridHeight: 3,
        lineWidth: 1 / 50,
        colorGrid: 'gray',
        xColor: 'darkblue',
        oColor: 'darkgreen',
        scoreFontSize: 1 / 10,
        scoreFont: 'sans-serif',
        winFontSize: 1 / 5,
        winFont: 'sans-serif',
        markerWidth: 1 / 20,
        // xWidth: 1 / 20,
        // oWidth: 1 / 20,
        ...style,
      };
      // A place to store maths results
      this.maths = {};
      this.state = {
        isInLobby: true,
        ...state,
      };
    }

    on(event, fn) {
      this.emitter.on(event, fn);
      return this;
    }

    setState(state) {
      this.state = {
        ...this.state,
        ...state,
      };
      return this;
    }

    animate(frame) {
      const can = this.canvas;
      const ctx = this.canvasContext;
      can.width = window.innerWidth;
      can.height = window.innerHeight;
      ctx.lineCap = 'round';
      if (this.state.isInLobby) {
        this.renderLobby();
      } else {
        this.renderBoard();
      }
    }

    renderLobby() {
      const can = this.canvas;
      const ctx = this.canvasContext;

      const minSize = Math.min(can.width, can.height);

      const fontSize = minSize * this.style.scoreFontSize;
      ctx.font = fontSize + 'px ' + this.style.scoreFont;
      ctx.fillStyle = 'black';
      ctx.fillText('Lobby', fontSize / 5, fontSize);
    }

    renderBoard() {
      const can = this.canvas;
      const ctx = this.canvasContext;
      // Clear canvas
      ctx.clearRect(0, 0, can.width, can.height);

      const cy = can.height / 2;

      const minSize
        = this.maths.minSize
        = Math.min(can.width, can.height);
      const scoreFontSize
        = this.maths.scoreFontSize
        = minSize * this.style.scoreFontSize;
      const scoreboardRect = {
        left: 0,
        top: 0,
        right: can.width,
        bottom: scoreFontSize * 1.2
      };
      this.drawScoreboard(ctx, scoreboardRect, this.maths, this.style);

      const gridRect = {
        left: 0,
        top: scoreboardRect.bottom,
        right: can.width,
        bottom: can.height
      };
      this.drawBoard(ctx, gridRect, this.style);

      if (this.state.result) {
        const winFontSize
          = this.maths.winFontSize
          = minSize * this.style.winFontSize;
        const winTop = cy - winFontSize / 2;
        const winnerRect = {
          left: 0,
          top: winTop,
          right: can.width,
          bottom: winTop + winFontSize
        };
        this.drawWinner(ctx, winnerRect, this.maths, this.style);
      }
    }

    drawScoreboard(ctx, rect, maths, style) {
      const cx = (rect.right - rect.left) / 2;
      const fontSize = maths.scoreFontSize;
      ctx.font = fontSize + 'px ' + style.scoreFont;
      ctx.fillStyle = 'black';
      const baseLine = rect.top + fontSize;
      const dlmtWho = '';
      // const me = '(Me)';
      const me = '*';
      // const them = '(' + (this.isHumanOpponent ? 'Them' : 'CPU') + ')';
      const them = '';

      // const dlmtExplicit = ' : ';
      const dlmtExplicit = '';
      // const xExplicit = 'X';
      const xExplicit = '';
      // const oExplicit = 'O';
      const oExplicit = '';

      const padding = '  ';

      const xWho = this.state.myMarker === 'x' ? me : them;
      const oWho = this.state.myMarker === 'o' ? me : them;
      const xPlayer = this.state.x;
      const oPlayer = this.state.o;

      const turnMarker = this.state.turn === 'x' ? '<' : '>';

      const xText = xPlayer + dlmtWho + xWho + dlmtExplicit + xExplicit + padding;
      const oText = padding + oExplicit + dlmtExplicit + oPlayer + dlmtWho + oWho;

      ctx.textAlign = 'center';
      ctx.fillText(turnMarker, cx, baseLine);
      ctx.textAlign = 'right';
      ctx.fillText(xText, cx, baseLine);
      ctx.textAlign = 'left';
      ctx.fillText(oText, cx, baseLine);
    }

    drawBoard(ctx, rect, style) {
      const size = {
        width:  rect.right  - rect.left,
        height: rect.bottom - rect.top
      };
      const gridWidth = style.gridWidth;
      const gridHeight = style.gridHeight;
      const lane = {
        width: size.width / gridWidth,
        height: size.height / gridHeight
      };
      const minSize = Math.min(size.width, size.height);
      this.drawGrid(ctx, rect, lane, minSize, style);

      const xMarkers = [];
      const oMarkers = [];
      const board = this.state.board || [];
      board.forEach((row, y) => {
        row.forEach((marker, x) => {
          marker = (marker || '').toLowerCase();
          let p = minSize * (style.xWidth || style.markerWidth);
          const x1 = rect.left + lane.width * x + p;
          const x2 = x1 + lane.width - p - p;
          const y1 = rect.top + lane.height * y + p;
          const y2 = y1 + lane.height - p - p;
          const markerRect = {
            left: x1,
            right: x2,
            top: y1,
            bottom: y2
          };
          if (marker === 'x') {
            xMarkers.push(markerRect)
          } else if (marker === 'o') {
            oMarkers.push(markerRect)
          } else if (this.state.isMyTurn && this.state.click
            && app.math.is2DContained(markerRect, this.state.click)
          ) {
            // TODO: Abstract this to report item clicked
            this.emitter.emit('take-turn', { x, y });
          }
        });
      });

      this.drawX(ctx, xMarkers, minSize, style);
      this.drawO(ctx, oMarkers, minSize, style);
    }

    drawGrid(ctx, rect, lane, minSize, style) {
      const lineWidth = minSize * style.lineWidth;
      const gridPadding = lineWidth;
      const gridWidth = style.gridWidth;
      const gridHeight = style.gridHeight;

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = style.colorGrid;
      ctx.beginPath();

      // Draw vertical lines
      for (let x = 1; x < gridWidth; ++x) {
        const left = lane.width * x;
        ctx.moveTo(rect.left + left, rect.top    + gridPadding);
        ctx.lineTo(rect.left + left, rect.bottom - gridPadding);
      }

      // Draw horizontal lines
      for (let y = 1; y < gridHeight; ++y) {
        const top = lane.height * y;
        ctx.moveTo(rect.left  + gridPadding, rect.top + top);
        ctx.lineTo(rect.right - gridPadding, rect.top + top);
      }

      ctx.stroke();
    }

    drawX(ctx, markers, minSize, style) {
      ctx.lineWidth = minSize * (style.xWidth || style.markerWidth);
      ctx.strokeStyle = style.xColor;
      ctx.beginPath();
      markers.forEach(marker => {
        ctx.moveTo(marker.left,  marker.top);
        ctx.lineTo(marker.right, marker.bottom);
        ctx.moveTo(marker.right, marker.top);
        ctx.lineTo(marker.left,  marker.bottom);
      });
      ctx.stroke();
    }

    drawO(ctx, markers, minSize, style) {
      ctx.lineWidth = minSize * (style.oWidth || style.markerWidth);
      ctx.strokeStyle = style.oColor;
      ctx.beginPath();
      const curve = ctx.quadraticCurveTo.bind(ctx);
      markers.forEach(marker => {
        const xc = marker.left + (marker.right  - marker.left) / 2;
        const yc = marker.top  + (marker.bottom - marker.top)  / 2;
        ctx.moveTo(marker.right, yc);
        curve(marker.right, marker.bottom, xc,           marker.bottom);
        curve(marker.left,  marker.bottom, marker.left,  yc);
        curve(marker.left,  marker.top,    xc,           marker.top);
        curve(marker.right, marker.top,    marker.right, yc);
      });
      ctx.stroke();
    }

    drawWinner(ctx, rect, maths, style) {
      const cx = (rect.right - rect.left) / 2;
      const fontSize = maths.winFontSize;
      ctx.font = fontSize + 'px ' + style.winFont;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = maths.winFontSize / 20;
      ctx.fillStyle = 'white';
      const baseLine = rect.top + fontSize;
      ctx.textAlign = 'center';
      const winMessage = this.state.result.winner
        .toUpperCase() + ' Wins!';
      ctx.strokeText(winMessage, cx, baseLine);
      ctx.fillText(winMessage, cx, baseLine);
    }

  }

  window.TicTacToeRenderer = TicTacToeRenderer;

})();
