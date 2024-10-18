import { Chess } from "chess.js";
import { useContext, useEffect, useState, useRef } from "react";
import ChessPiece from "./ChessPiece";
import { GameContext } from "../context/context";
import { useSocket } from "../hooks/useSocket";
import { GAME_OVER, INIT_GAME, MOVE } from "./Messages";
import Button from "./Button";
import { Link, Navigate, redirect, Route, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function ChessBoard() {
  const gameContext = useContext(GameContext);
  const { color, setIsWinner } = gameContext;
  
  const chessRef = useRef(new Chess());
  const navigate = useNavigate();
  const socket = useSocket();

  const draggedPieceRef = useRef(null);
  const [board, setBoard] = useState(chessRef.current.board());
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState("w");
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState(null);
  
  const rowLabels = [8, 7, 6, 5, 4, 3, 2, 1];
  const colLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MOVE:
          console.log("Opponent's move:", message.payload);
          const result = chessRef.current.move(message.payload);
          if (result) {
            setBoard(chessRef.current.board());
            setTurn(chessRef.current.turn());
          }
          break;
        case GAME_OVER:
          if (message.payload.winner == color) setIsWinner(true);
          setGameOver(true);
          if (socket) socket.close();
          navigate("/gameover");
          break;
      }
    };
    socket.onmessage = handleMessage;
  }, [socket, gameOver, turn]);

  const handleDragStart = (e, piece, square) => {
    if (chessRef.current.turn() !== color || piece.color !== color) return;
    setDraggedPiece({ piece, square });
    draggedPieceRef.current = e.target;
  };

  const handleDragEnd = (e) => {
    setDraggedPiece(null);
    draggedPieceRef.current = null;
  };

  const isPromotion = (from, to) => {
    const piece = chessRef.current.get(from);
    return piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1');
  };

  const handleMove = (targetSquare) => {
    if (chessRef.current.turn() !== color || !draggedPiece) {
      console.log("Not Your Turn or No Piece Selected");
      return;
    }

    const move = {
      from: draggedPiece.square,
      to: targetSquare,
    };

    if (isPromotion(move.from, move.to)) {
      setPromotionMove(move);
      setShowPromotion(true);
    } else {
      makeMove(move);
    }
  };

  const makeMove = (move) => {
    try {
      const result = chessRef.current.move(move);
      if (result) {
        setBoard(chessRef.current.board());
        socket?.send(
          JSON.stringify({
            type: MOVE,
            move: move,
          })
        );
        setTurn(chessRef.current.turn());
      } else {
        console.log("Invalid move", move);
      }
    } catch (error) {
      console.log("Error making move:", error);
    }

    setDraggedPiece(null);
  };

  const handlePromotion = (pieceType) => {
    if (promotionMove) {
      const move = { ...promotionMove, promotion: pieceType };
      makeMove(move);
      setShowPromotion(false);
      setPromotionMove(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const targetSquare = e.target.dataset.square;
    if (targetSquare) {
      handleMove(targetSquare);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useGSAP(() => {
    gsap.to(".turn-text", {
      opacity: 0.5,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });
  });

  return (
    <div className="w-full h-full flex-center flex-col gap-5">
      <h2 className="text-white text-lg turn-text">
        {turn === color ? "Your Turn" : "Wait for opponent to play"}
      </h2>
      <div className="bg-white relative">
        <div className="flex">
          <div
            className={`flex flex-col justify-around items-center w-[35px] h-[500px] text-md font-semibold ${
              color === "b" ? "rotate-180" : ""
            }`}
          >
            {rowLabels.map((label) => (
              <p key={label} className={`${color === "b" ? "rotate-180" : ""}`}>
                {label}
              </p>
            ))}
          </div>

          <div
            className={`relative bg-white w-[500px] h-[500px] flex flex-wrap ${
              color === "b" ? "rotate-180" : ""
            }`}
          >
            {board.map((row, rowIdx) =>
              row.map((piece, colIdx) => {
                const squareLabel =
                  `${colLabels[colIdx]}${rowLabels[rowIdx]}`.toLowerCase();
                return (
                  <div
                    key={squareLabel}
                    data-square={squareLabel}
                    className={`${
                      (rowIdx + colIdx) % 2 === 0
                        ? "bg-board-white"
                        : "bg-board-black"
                    } w-[62.5px] h-[62.5px] flex justify-center items-center ${
                      color === "b" ? "rotate-180" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {piece && (
                      <div
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, piece, squareLabel)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        <ChessPiece
                          color={piece.color}
                          type={piece.type}
                          label={squareLabel}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="h-[35px] w-[35px] bg-white left-0 bottom-0"></div>
          <div
            className={`flex w-full px-6 h-[35px] items-center justify-between text-md font-semibold ${
              color === "b" ? "rotate-180" : ""
            }`}
          >
            {colLabels.map((label) => (
              <p key={label} className={`${color === "b" ? "rotate-180" : ""}`}>
                {label}
              </p>
            ))}
          </div>
        </div>
      </div>
      {showPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Choose promotion piece:</h3>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((pieceType) => (
                <button
                  key={pieceType}
                  className="w-16 h-16 bg-gray-200 hover:bg-gray-300 flex items-center justify-center rounded"
                  onClick={() => handlePromotion(pieceType)}
                >
                  <ChessPiece color={color} type={pieceType} label="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}