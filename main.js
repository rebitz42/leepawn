let board, game;
const resetBtn = document.getElementById("reset");
let msg = document.getElementById("msg");

let whiteSquareGrey = "#a9a9a9";
let blackSquareGrey = "#696969";

let config = {
  pieceTheme: "lib/chessboard/img/chesspieces/wikipedia/{piece}.png",
  position: "start",
  showNotation: true,
  draggable: true,
  dropOffBoard: "snapback",
  snapbackSpeed: 200,
  snapSpeed: 50,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onDragStart: onDragStart,
  onMouseoverSquare: onMouseoverSquare,
  onMouseoutSquare: onMouseoutSquare,
};

window.onload = function () {
  game = new Chess();
  board = Chessboard("board", config);

  resetBtn.addEventListener("click", function () {
    board.start(false);
    removeRedSquare();
    msg.textContent = "";
    game.reset();
  });
};

function onDrop(source, target) {
  removeGreySquare();
  let move = game.move({
    from: source,
    to: target,
    promotion: "q",
  });

  if (move === null) return "snapback";
  removeRedSquare();
  updateStatus();
}

function onSnapEnd() {
  board.position(game.fen());
}

function onDragStart(source, piece) {
  if (game.game_over()) return false;

  if (
    (game.turn() == "w" && piece.search(/^b/) !== -1) ||
    (game.turn() == "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function updateStatus() {
  let prevColor = game.turn() === "w" ? "Black" : "White";

  if (game.in_checkmate()) {
    msg.textContent = "Checkmate! " + prevColor + " wins.";
  }

  if (game.in_stalemate()) {
    msg.textContent = "Draw by stalemate.";
  }

  if (game.in_threefold_repetition()) {
    msg.textContent = "Draw by threefold repetition.";
  }

  if (game.insufficient_material()) {
    msg.textContent = "Draw by insufficient material.";
  }

  if (game.in_check()) {
    let kingPosition = getKeyByValue(board.position(), game.turn() + "K");
    redSquare(kingPosition);
  }
}

function greySquare(square) {
  let squareEl = document.querySelector("#board .square-" + square);

  if (!squareEl) return;

  let background = whiteSquareGrey;
  if (squareEl.classList.contains("black-3c85d")) {
    background = blackSquareGrey;
  }

  squareEl.style.background = background;
}

function removeGreySquare() {
  let squares = document.querySelectorAll("#board .square-55d63");
  for (let i = 0; i < squares.length; i++) {
    squares[i].style.background = "";
  }
}

function onMouseoverSquare(square, piece) {
  removeGreySquare();

  let moves = game.moves({
    square: square,
    verbose: true,
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (let i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquare();
}

function redSquare(square) {
  let squareEl = document.querySelector("#board .square-" + square);
  squareEl.classList.add("red-square");
}

function removeRedSquare() {
  // Remove red-square from all squares
  let square = document.querySelectorAll("#board .red-square");
  square.forEach((sq) => sq.classList.remove("red-square"));
}

// Helper function to get key by value in an object
function getKeyByValue(object, value) {
  for (let key in object) {
    if (object[key] === value) {
      return key;
    }
  }
  return null;
}
