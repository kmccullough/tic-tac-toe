(function () { 'use strict';

// TODO fix mouse capture positioning within canvas
// TODO break up into sane commits

  class TicTacToeRenderer {

    constructor({
      canvas,
      headerEl,
      player1,
      player2,
      turn,
      style = null,
      state = null
    }) {
      this.emitter = new app.cb.Emitter();
      this.canvas = canvas;

      // Watch `top`
      this.headerResizeObserver = new ResizeObserver(([
        { borderBoxSize: [ { blockSize } ] }
      ]) => {
        this.top = blockSize;
      });
      this.headerResizeObserver.observe(headerEl);

      // Watch `width`/`height`
      this.canvasResizeObserver = new ResizeObserver(([ {
        borderBoxSize: [ { inlineSize, blockSize } ],
      } ]) => {
        this.width = inlineSize;
        this.height = blockSize;
      });
      this.canvasResizeObserver.observe(canvas.parentElement);

      this.player1 = player1;
      this.player2 = player2;
      this.turn = turn;
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
      this.setState({ ...state });
    }

    on(event, fn) {
      this.emitter.on(event, fn);
      return this;
    }

    setState(state) {
      this.state = {
        isInLobby: true,
        ...this.state,
        ...state,
      };
      return this;
    }

    animate(frame) {
      const can = this.canvas;
      const ctx = this.canvasContext;
      const { width: oldWidth, height: oldHeight } = can;
      const { width = 0, height = 0 } = this;
      const isWidthChange = width !== oldWidth;
      const isHeightChange = height !== oldHeight;

      // Set clear flag if size changed
      if (isWidthChange || isHeightChange) {
        if (isWidthChange) {
          can.width = width;
        }
        if (isHeightChange) {
          can.height = height;
        }
        this.isCleared = true;
      }

      // Set clear flag on mouse click
      const { click, mouse } = this.state;
      if (mouse || click) {
        if (click) {
          this.isCleared = true;
        }
      }

      // Set clear flag if state changed
      if (!this.isCleared) {
        const drawDepVars = app.compare.isChanged(this.drawDepVars, [
          this.state.isInLobby,
        ]);
        if (drawDepVars) {
          this.isCleared = true;
          this.drawDepVars = drawDepVars;
        }
      }

      ctx.lineCap = 'round';
      if (!this.state.isInLobby) {
        this.renderBoard();
      }

      this.isCleared = false;
      this.state.click = null;
    }

    renderBoard() {
      const can = this.canvas;
      const ctx = this.canvasContext;

      if (!this.isCleared) {
        const gameDepVars = app.compare.isChanged(this.gameDepVars, [
          this.state.x, this.state.o, // Player names
          this.state.turn, // Turn marker
          JSON.stringify(this.state.board), // Board state
          this.state.result, // End game
        ]);
        if (!gameDepVars) {
          return;
        }
        this.gameDepVars = gameDepVars;
      }

      const cy = can.height / 2;

      const minSize
        = this.maths.minSize
        = Math.min(can.width, can.height);
      const scoreFontSize
        = this.maths.scoreFontSize
        = minSize * this.style.scoreFontSize;
      this.drawScoreboard(ctx, this.maths, this.style);

      const gridRect = {
        left: 0,
        top: 0,
        right: can.width,
        bottom: can.height
      };
      this.drawBoard(ctx, gridRect, this.style);

      if (this.state.result) {

        let drawEnd = this.isCleared;
        if (!drawEnd) {
          const endDepVars = app.compare.isChanged(this.endDepVars, [
            this.state.result, // End game
          ]);
          if (endDepVars) {
            this.endDepVars = endDepVars;
            drawEnd = true;
          }
        }

        if (drawEnd) {
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
    }

    drawScoreboard(ctx, maths, style) {
      if (!this.isCleared) {
        const scoreDepVars = app.compare.isChanged(this.scoreDepVars, [
          this.state.x, this.state.o, // Player names
          this.state.turn, // Turn marker
        ]);
        if (!scoreDepVars) {
          return;
        }
        this.scoreDepVars = scoreDepVars;
      }

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

      this.turn.innerText = turnMarker;
      this.player1.innerText = xText;
      this.player2.innerText = oText;
    }

    drawBoard(ctx, rect, style) {

      const board = this.state.board || [];

      if (!this.isCleared) {
        const boardDepVars = app.compare.isChanged(this.boardDepVars, [
          JSON.stringify(board), // Board state
        ]);
        if (!boardDepVars) {
          return;
        }
        this.boardDepVars = boardDepVars;
      }

      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;

      ctx.clearRect(rect.left, rect.top, width, height);

      const gridWidth = style.gridWidth;
      const gridHeight = style.gridHeight;
      const lane = {
        width: width / gridWidth,
        height: height / gridHeight
      };
      const minSize = Math.min(width, height);
      this.drawGrid(ctx, rect, lane, minSize, style);

      const xMarkers = [];
      const oMarkers = [];

      const top = Math.floor(this.top);
      function offset(pos) {
        if (!pos) {
          return pos;
        }
        const { x = 0, y = 0 } = pos || {};
        return { x, y: y - top };
      }
      const click = offset(this.state.click);
      const mouse = offset(this.state.mouse);

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
          if (app.math.is2DContained(markerRect, mouse)){
            // TODO draw hilite
            this.drawHighlight(ctx, markerRect, this.state.myMarker === this.state.turn);
          }
          if (marker === 'x') {
            xMarkers.push(markerRect)
          } else if (marker === 'o') {
            oMarkers.push(markerRect)
          } else if (this.state.isMyTurn && click) {
            if (app.math.is2DContained(markerRect, click)){
              // TODO: Abstract this to report item clicked
              this.emitter.emit('take-turn', { x, y });
            }
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

    drawHighlight(ctx, { top, right, bottom, left }, enabled) {
      ctx.fillStyle = enabled ? 'rgba(64,255,0,0.2)' : 'rgba(255,0,0,0.2)';
      ctx.strokeStyle = null;
      ctx.fillRect(left, top, right - left, bottom - top)
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
