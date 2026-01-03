let board;
let resetBtn = document.getElementById("resetButton");

let config = {
  pieceTheme: "lib/chessboard/img/chesspieces/wikipedia/{piece}.png",
  position: "start",
  showNotation: true,
  draggable: true,
  dropOffBoard: "snapback",
  snapbackSpeed: 200,
  snapSpeed: 50,
};

window.onload = function () {
  board = Chessboard("board", config);

  resetBtn.addEventListener("click", function () {
    board.start(false); //false means instant snapback
  });
};
