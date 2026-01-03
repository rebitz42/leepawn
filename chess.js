/////////////////////////////////////////////////////////////////////
// Chess Game Logic and Board Interaction
////////////////////////////////////////////////////////////////////

let board, game;
const resetBtn = document.getElementById("reset");
let msg = document.getElementById("msg");

pst = {
    'P': [   0,   0,   0,   0,   0,   0,   0,   0,
            78,  83,  86,  73, 102,  82,  85,  90,
             7,  29,  21,  44,  40,  31,  44,   7,
           -17,  16,  -2,  15,  14,   0,  15, -13,
           -26,   3,  10,   9,   6,   1,   0, -23,
           -22,   9,   5, -11, -10,  -2,   3, -19,
           -31,   8,  -7, -37, -36, -14,   3, -31,
             0,   0,   0,   0,   0,   0,   0,   0],
    'N': [  -66, -53, -75, -75, -10, -55, -58, -70,
            -3,  -6, 100, -36,   4,  62,  -4, -14,
            10,  67,   1,  74,  73,  27,  62,  -2,
            24,  24,  45,  37,  33,  41,  25,  17,
            -1,   5,  31,  21,  22,  35,   2,   0,
           -18,  10,  13,  22,  18,  15,  11, -14,
           -23, -15,   2,   0,   2,   0, -23, -20,
           -74, -23, -26, -24, -19, -35, -22, -69],
    'B': [ -59, -78, -82, -76, -23,-107, -37, -50,
           -11,  20,  35, -42, -39,  31,   2, -22,
            -9,  39, -32,  41,  52, -10,  28, -14,
            25,  17,  20,  34,  26,  25,  15,  10,
            13,  10,  17,  23,  17,  16,   0,   7,
            14,  25,  24,  15,   8,  25,  20,  15,
            19,  20,  11,   6,   7,   6,  20,  16,
            -7,   2, -15, -12, -14, -15, -10, -10],
    'R': [  35,  29,  33,   4,  37,  33,  56,  50,
            55,  29,  56,  67,  55,  62,  34,  60,
            19,  35,  28,  33,  45,  27,  25,  15,
             0,   5,  16,  13,  18,  -4,  -9,  -6,
           -28, -35, -16, -21, -13, -29, -46, -30,
           -42, -28, -42, -25, -25, -35, -26, -46,
           -53, -38, -31, -26, -29, -43, -44, -53,
           -30, -24, -18,   5,  -2, -18, -31, -32],
    'Q': [   6,   1,  -8,-104,  69,  24,  88,  26,
            14,  32,  60, -10,  20,  76,  57,  24,
            -2,  43,  32,  60,  72,  63,  43,   2,
             1, -16,  22,  17,  25,  20, -13,  -6,
           -14, -15,  -2,  -5,  -1, -10, -20, -22,
           -30,  -6, -13, -11, -16, -11, -16, -27,
           -36, -18,   0, -19, -15, -15, -21, -38,
           -39, -30, -31, -13, -31, -36, -34, -42],
    'K': [   4,  54,  47, -99, -99,  60,  83, -62,
           -32,  10,  55,  56,  56,  55,  10,   3,
           -62,  12, -57,  44, -67,  28,  37, -31,
           -55,  50,  11,  -4, -19,  13,   0, -49,
           -55, -43, -52, -28, -51, -47,  -8, -50,
           -47, -42, -43, -79, -64, -32, -29, -32,
            -4,   3, -14, -50, -57, -18,  13,   4,
            17,  30,  -3, -14,   6,  -1,  40,  18],
}

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

function getPiecePSTValue(piece, row, col) {
  if (!piece) return 0;
  const type = piece.type.toUpperCase();
  let sq = piece.color === "w" ? row * 8 + col : (7 - row) * 8 + col;
  if (!pst[type]) return 0;

  return (piece.color === "w" ? 1 : -1) * pst[type][sq];
}

function evaluateBoard(board) {
  let evaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = board[i][j];
      evaluation += getPieceValue(piece);
      evaluation += getPiecePSTValue(piece, i, j);
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
