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
        bottom: scoreFontSize
      };
      this.drawScoreboard(ctx, scoreboardRect, this.maths, this.style);

      const gridRect = {
        left: 0,
        top: scoreboardRect.bottom,
        right: can.width,
        bottom: can.height
      };
      this.drawBoard(ctx, gridRect, this.style);
    }

    drawScoreboard(ctx, rect, maths, style) {
      const fontSize = maths.scoreFontSize;
      ctx.font = fontSize + 'px ' + style.scoreFont;
      ctx.fillStyle = 'black';
      ctx.fillText(
        'Versus',
        rect.left + fontSize / 5, // Plus some padding
        rect.top  + fontSize // Baseline
      );
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
          ctx.lineWidth = p;

          ctx.strokeStyle = style.xColor;
          ctx.beginPath();

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

  }

  window.TicTacToeRenderer = TicTacToeRenderer;

})();
