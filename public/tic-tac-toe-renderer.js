(function () { 'use strict';

  class TicTacToeRenderer {

    constructor(
      canvas,
      style,
      state
    ) {
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
      this.state = {
        isInLobby: true,
        ...state,
      };
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
      can.width = window.innerWidth;
      can.height = window.innerHeight;
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

      const gridWidth = this.style.gridWidth;
      const gridHeight = this.style.gridHeight;
      const minSize = Math.min(can.width, can.height);
      const lineWidth = minSize * this.style.lineWidth;

      // Clear canvas
      ctx.clearRect(0, 0, can.width, can.height);

      const fontSize = minSize * this.style.scoreFontSize;
      ctx.font = fontSize + 'px ' + this.style.scoreFont;
      ctx.fillStyle = 'black';
      ctx.fillText('Versus', fontSize / 5, fontSize);

      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      ctx.strokeStyle = this.style.colorGrid;
      ctx.beginPath();

      // Draw vertical lines
      let gridPaddingWidth = can.width / gridWidth;
      for (let x = 1; x < gridWidth; ++x) {
        const padding = gridPaddingWidth * x;
        ctx.moveTo(padding, fontSize + lineWidth);
        ctx.lineTo(padding, can.height - lineWidth);
      }

      // Draw horizontal lines
      let gridPaddingHeight = (can.height - fontSize) / gridHeight;
      for (let y = 1; y < gridHeight; ++y) {
        const padding = fontSize + gridPaddingHeight * y;
        ctx.moveTo(lineWidth, padding);
        ctx.lineTo(can.width - lineWidth, padding);
      }

      ctx.stroke();

      let p = minSize * (this.style.xWidth || this.style.markerWidth);
      ctx.lineWidth = p;

      ctx.strokeStyle = this.style.xColor;
      ctx.beginPath();

      // Draw player markers
      for (let y = 0; y < gridHeight; ++y) {
        for (let x = 0; x < gridWidth; ++x) {
          const x1 = gridPaddingWidth * x + p;
          const x2 = x1 + gridPaddingWidth - p - p;
          const y1 = fontSize + gridPaddingHeight * y + p;
          const y2 = y1 + gridPaddingHeight - p - p;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.moveTo(x2, y1);
          ctx.lineTo(x1, y2);
        }
      }

      ctx.stroke();

      p = minSize * (this.style.oWidth || this.style.markerWidth);
      ctx.lineWidth = p;

      ctx.strokeStyle = this.style.oColor;
      ctx.beginPath();

      // Draw player markers
      for (let y = 0; y < gridHeight; ++y) {
        for (let x = 0; x < gridWidth; ++x) {
          const x1 = gridPaddingWidth * x + p;
          const xc = x1 - p + gridPaddingWidth / 2;
          const x2 = x1 - p + gridPaddingWidth - p;
          const y1 = fontSize + gridPaddingHeight * y + p;
          const yc = y1 - p + gridPaddingHeight / 2;
          const y2 = y1 - p + gridPaddingHeight - p;
          ctx.moveTo(x2, yc);
          ctx.quadraticCurveTo(x2, y2, xc, y2);
          ctx.quadraticCurveTo(x1, y2, x1, yc);
          ctx.quadraticCurveTo(x1, y1, xc, y1);
          ctx.quadraticCurveTo(x2, y1, x2, yc);
        }
      }

      ctx.stroke();
    }

  }

  window.TicTacToeRenderer = TicTacToeRenderer;

})();
