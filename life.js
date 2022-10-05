'use strict';
const CELL_SIZE = 4;
const RADIX = 10;
const timeOut = 20; // ms
const cells = [
  // [false, false, true, false, false, false],
  // [true, false, true, false, false, false],
  // [false, true, true, false, false, false],
  // [false, false, false, false, false, false],
  // [false, false, false, false, false, false],
  // [false, false, false, false, false, false],
  // [false, true, true, false, false, true],
  // [true, false, true, false, false, true],
  // [false, true, true, false, false, false],
  // [false, false, false, false, false, false],
  // [false, false, false, false, false, false],
  // [true, true, false, false, false, true],
];

function play(id, func) {
  if (!id && !!func) {
    id = setInterval(() => {
      func();
    }, timeOut);
  } else {
    id = clearInterval(id);
  }
  return id;
}

function Grid(width, height, canvasContext) {
  this.size = {
    x: parseInt(width / CELL_SIZE, RADIX),
    y: parseInt(height / CELL_SIZE, RADIX)
  };

  // Заполнение массива
  this.initArray = function () {
    for (let i = 0; i < this.size.x; i++) {
      cells[i] = new Array(this.size.y);
      // buffCells[i] = new Array(this.size.y);
      for (let j = 0; j < this.size.y; j++) {
        cells[i][j] = false;
        // buffCells[i][j] = false;
      }
    }
  };

  //
  this.draw = function () {
    canvasContext.translate(0.5, 0.5);
    canvasContext.beginPath();

    for (let i = 0; i <= this.size.x; i++) {
      canvasContext.moveTo(0, i * CELL_SIZE);
      canvasContext.lineWidth = 1;
      canvasContext.lineTo(width, i * CELL_SIZE);
      canvasContext.strokeStyle = '#ddd'; // цвет линии
    }

    for (let i = 0; i <= this.size.x; i++) {
      canvasContext.lineWidth = 1;
      canvasContext.moveTo(i * CELL_SIZE, 0);
      canvasContext.lineTo(i * CELL_SIZE, height);
      canvasContext.strokeStyle = '#ddd'; // цвет линии
    }

    canvasContext.stroke();
  };
}

function Game(width, height, canvasContext) {
  this.size = {
    x: parseInt(width / CELL_SIZE, RADIX),
    y: parseInt(height / CELL_SIZE, RADIX)
  };

  const _render = () => {
    this.clear();
    cells.forEach((line, i) => {
      line.forEach((value, j) => { if (value) this.fillCell(i, j) });
    });
  };

  const _getLiveNeighbors = (x, y) => {
    let count = 0;
    let shift = {
      x: {
        left: 1,
        right: 1
      },
      y: {
        top: 1,
        down: 1
      }
    }
    // Замыкаем границы
    // Лево - Право
    if (x + 1 >= this.size.x) {
      shift.x.right = x * -1;
    } else if (x - 1 < 0) {
      shift.x.left = (this.size.x - 1) * -1;
    }

    // Вверх - Низ
    if (y + 1 >= this.size.y) {
      shift.y.down = y * -1;
    }
    if (y - 1 < 0) {
      shift.y.top = (this.size.y - 1) * -1;
    }

    //ПРАВИЛА ИГРЫ
    //Проверяем верхнюю левую ячейку !
    if (cells[x - shift.x.left][y - shift.y.top] === true) {
      count += 1;
    }

    //Проверяем верхнюю ячейку !
    if (cells[x][y - shift.y.top] === true) {
      count += 1;
    }

    //Проверяем верхнюю правую ячейку !
    if (cells[x + shift.x.right][y - shift.y.top] === true) {
      count += 1;
    }

    //Проверяем левую ячейку !
    if (cells[x - shift.x.left][y] === true) {
      count += 1;
    }

    //Проверяем правую ячейку !
    if (cells[x + shift.x.right][y] === true) {
      count += 1;
    }

    //Проверяем нижнюю левую ячейку !
    if (cells[x - shift.x.left][y + shift.y.down] === true) {
      count += 1;
    }

    //Проверяем нижнюю ячейку !
    if (cells[x][y + shift.y.down] === true) {
      count += 1;
    }

    //Проверяем нижнюю правую ячейку !
    if (cells[x + shift.x.right][y + shift.y.down] === true) {
      count += 1;
    }

    return count;
  };

  const _calcLife = () => {
    const tempCells = [...cells.map((item) => [...item])];
    let cellWillSurvive;
    let countNeighbors;

    for (let i = 0; i < this.size.x; i++) {
      for (let j = 0; j < this.size.y; j++) {
        cellWillSurvive = false;
        countNeighbors = _getLiveNeighbors(i, j);

        if (!cells[i][j] && countNeighbors === 3) {
          cellWillSurvive = true;
        }

        if (cells[i][j]) {
          if (countNeighbors < 2 || countNeighbors > 3) {
            cellWillSurvive = false;
          } else {
            cellWillSurvive = true;
          }
        }

        tempCells[i][j] = cellWillSurvive;
      }
    }

    for (let i = 0; i < this.size.x; i++) {
      for (let j = 0; j < this.size.y; j++) {
        cells[i][j] = tempCells[i][j];
      }
    }

    // cells.forEach((line, i) => {
    //   cells[i] = tempCells.map(item => item[i]);
    // });
  };

  this.clear = () => canvasContext.clearRect(0, 0, width, height);

  this.fillCell = (x, y) => canvasContext.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE + 1, CELL_SIZE + 1);

  this.randomFill = () => {
    cells.forEach((line, index) => {
      cells[index] = line.map(() => Math.random() > 0.6 ? true : false)
    });

    _render();
  };

  this.update = () => {
    // console.log(cells);
    _calcLife();
    _render();
  };

  this.preRender = () => {
    _render();
  };
}

function init() {
  // Id для таймера
  let playId = null;
  const canvasGrid = document.getElementById('back').getContext('2d');
  canvasGrid.width = document.getElementById('back').width;
  canvasGrid.height = document.getElementById('back').height;

  const canvasGame = document.getElementById('game').getContext('2d');
  canvasGame.width = document.getElementById('game').width;
  canvasGame.height = document.getElementById('game').height;

  const grid = new Grid(canvasGrid.width, canvasGrid.height, canvasGrid);
  grid.initArray();
  grid.draw();

  const game = new Game(canvasGame.width, canvasGame.height, canvasGame);

  // Кнопки
  const clearGrid = document.getElementById('clear');
  clearGrid.onclick = () => game.clear();

  const randFill = document.getElementById('rand');
  randFill.onclick = () => game.randomFill();

  const start = document.getElementById('start');
  start.onclick = () => playId = play(playId, game.update);

  const stop = document.getElementById('stop');
  stop.onclick = () => playId = play(playId);

  game.preRender()
}

window.onload = init();