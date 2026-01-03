/////////////////////////////////////////////////////////////////////
// Chess Game Logic and Board Interaction
////////////////////////////////////////////////////////////////////

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
  setTimeout(makeMinMaxMove, 250);
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

/////////////////////////////////////////////////////////////////////
// Evaluation Function for AI
////////////////////////////////////////////////////////////////////
const checkmate_eval = 10000;

let pieceValues = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

function evaluateBoard(board) {
  let evaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      evaluation += getPieceValue(board[i][j]);
    }
  }
  return evaluation;
}

function getPieceValue(piece) {
  if (piece === null) return 0;

  if (piece.color === "w") {
    return pieceValues[piece.type];
  } else {
    return -pieceValues[piece.type];
  }
}

function evaluatePosition(position) {
  if (position.in_checkmate()) {
    return position.turn() == "w" ? -checkmate_eval : checkmate_eval;
  } else if (position.in_draw()) {
    return 0;
  } else {
    return evaluateBoard(position.board());
  }
}
/////////////////////////////////////////////////////////////////////
// Chess AI algorithms (e.g., Minimax, Alpha-Beta Pruning)
////////////////////////////////////////////////////////////////////

function minimax(position, depth, alpha, beta, maximizingPlayer) {
  if (position.in_checkmate() || position.in_draw() || depth == 0) {
    return [null, evaluatePosition(position)];
  }
  let bestMove;
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    let possibleMoves = shuffle(position.moves());
    for (let i = 0; i < possibleMoves.length; i++) {
      position.move(possibleMoves[i]);
      let [childBestMove, childEval] = minimax(
        position,
        depth - 1,
        alpha,
        beta,
        false
      );
      if (childEval > maxEval) {
        maxEval = childEval;
        bestMove = possibleMoves[i];
      }
      position.undo();
      alpha = Math.max(alpha, childEval);
      if (beta <= alpha) {
        break;
      }
    }
    return [bestMove, maxEval];
  } else {
    let minEval = +Infinity;
    let possibleMoves = shuffle(position.moves());
    for (let i = 0; i < possibleMoves.length; i++) {
      position.move(possibleMoves[i]);
      let [childBestMove, childEval] = minimax(
        position,
        depth - 1,
        alpha,
        beta,
        true
      );
      if (childEval < minEval) {
        minEval = childEval;
        bestMove = possibleMoves[i];
      }
      position.undo();
      beta = Math.min(beta, childEval);
      if (beta <= alpha) {
        break;
      }
    }
    return [bestMove, minEval];
  }
}

function makeMinMaxMove() {
  let maximizing = game.turn() == "w";
  let [bestMove, bestEval] = minimax(game, 3, -Infinity, +Infinity, maximizing);
  game.move(bestMove);
  board.position(game.fen());
  removeRedSquare();
  updateStatus();
}

// Fisher-Yates shuffle
function shuffle(array) {
  for (
    let j, x, i = array.length;
    i;
    j = Math.floor(Math.random() * i),
      x = array[--i],
      array[i] = array[j],
      array[j] = x
  );
  return array;
}
