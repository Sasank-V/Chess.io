import { Chess, Square } from "chess.js";
import { useContext, useEffect, useState, useRef } from "react";
import ChessPiece from "./ChessPiece";
import { GameContext } from "../../context/context";
import { useSocket } from "../../hooks/useSocket";
import { GAME_OVER, MOVE, PLAYER_RESIGN,} from "../Common/Messages";
import { useNavigate } from "react-router-dom";
import JoinedComp from "./JoinedScreen";

type Move = {
  from: string;
  to: string;
  promotion?: string;
};

type Input = {
  gameJoined : boolean,
  setGameJoined : (val:boolean)=>void
}

export default function ChessBoard(inp:Input) {
  const {gameJoined,setGameJoined} = inp;
  const gameContext = useContext(GameContext);
  if (!gameContext) throw new Error("Game context Not found");

  const { color, setIsWinner, setReason, setHasSocket } = gameContext;

  const chessRef = useRef(new Chess());
  const navigate = useNavigate();
  const socket = useSocket();

  const [board, setBoard] = useState(chessRef.current.board());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [turn, setTurn] = useState("w");
  const [showPromotion, setShowPromotion] = useState(false);
  const [promotionMove, setPromotionMove] = useState<Move | null>(null);
  const [invalidMove, setInvalidMove] = useState<boolean>(false);

  const [screenWidth,setScreenWidth] = useState(window.innerWidth);
  const [boardWidth,setBoardWidth] = useState(500);
  const [boardHeight,setBoardHeight] = useState(500);



  const rowLabels = [8, 7, 6, 5, 4, 3, 2, 1];
  const colLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
  

  useEffect(()=>{
    window.addEventListener("resize",()=>{
      setScreenWidth(window.innerWidth);
    })
    return ()=>{
      window.removeEventListener("resize",()=>{
        setScreenWidth(window.innerWidth);
      })
    }
  },[screenWidth]);

  useEffect(()=>{
    if(screenWidth > 600){
      setBoardWidth(500);
      setBoardHeight(500);
    }else{
      const newWidth = Math.min(500,screenWidth*0.9);
      setBoardWidth(newWidth);
      setBoardHeight(newWidth);
    }
  },[screenWidth])

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case MOVE: {
          const result = chessRef.current.move(message.payload);
          if (result) {
            setBoard(chessRef.current.board());
            setTurn(chessRef.current.turn());
          }
          break;
        }
        case GAME_OVER:
          if (message.payload.winner === color) setIsWinner(true);
          setHasSocket(false);
          setReason(message.payload.reason);
          navigate("/gameover");
          break;
        case PLAYER_RESIGN:
          setIsWinner(true);
          setHasSocket(false);
          setReason(message.payload.reason);
          navigate("/gameover");
          break;
      }
    };
    socket.onmessage = handleMessage;
  }, [socket, turn, invalidMove, color, setIsWinner, setHasSocket, setReason, navigate]);

  const isPromotion = (from: Square, to: Square): boolean => {
    const piece = chessRef.current.get(from);
    return piece && piece.type === 'p' && (to[1] === '8' || to[1] === '1');
  };

  const showInvalid = () => {
    setInvalidMove(true);
    setTimeout(() => setInvalidMove(false), 1000);
  };

  const handleSquareClick = (square: string) => {
    if (chessRef.current.turn() !== color) return;

    if (selectedSquare === null) {
      const piece = chessRef.current.get(square as Square);
      if (piece && piece.color === color) {
        setSelectedSquare(square);
      }
    } else if(selectedSquare === square){
      setSelectedSquare(null);
    }else{
      handleMove(square);
    }
  };

  const handleMove = (targetSquare: string) => {
    if (!selectedSquare) return;
    const move = { from: selectedSquare, to: targetSquare };
    if (isPromotion(move.from as Square, move.to as Square)) {
      setPromotionMove(move as Move);
      setShowPromotion(true);
      return;
    }
    try {
      const result = chessRef.current.move(move);
      if (result) {
        setBoard(chessRef.current.board());
        setTurn(chessRef.current.turn());
        socket?.send(
          JSON.stringify({
            type: MOVE,
            move: move,
          })
        );
      }
    } catch {
      showInvalid();
    }
    setSelectedSquare(null);
  };

  const handlePromotion = (pieceType: string) => {
    if (promotionMove) {
      const move = { ...promotionMove, promotion: pieceType };
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
        }
      } catch {
        setShowPromotion(false);
        showInvalid();
      }
    }
    setShowPromotion(false);
    setPromotionMove(null);
    setSelectedSquare(null);
  };

 


  return (
    !gameJoined ? 
      <div className="w-[100vw] h-[100vh]">
        <JoinedComp setGameJoined={setGameJoined}/>
      </div> :  
    <div className="w-full h-full flex-center flex-col gap-5">
      <h2 className="text-white text-lg turn-text">
        {turn === color ? "Your Turn" : "Wait for opponent to play"}
      </h2>
      <div className="bg-white relative">
        <div className="flex">
          <div
            className={`flex flex-col justify-around items-center  text-md font-semibold ${
              color === "b" ? "rotate-180" : ""
            }`}
            style={{width:boardWidth/16 , height:boardHeight}}
          >
            {rowLabels.map((label) => (
              <p key={label} className={`${color === "b" ? "rotate-180" : ""}`}>
                {label}
              </p>
            ))}
          </div>

          {invalidMove && (
            <div className="flex-center absolute z-10 text-white text-2xl h-full w-full bg-opacity-60 bg-black">
              Invalid Move
            </div>
          )}
          <div
            className={`relative bg-white  flex flex-wrap ${
              color === "b" ? "rotate-180" : ""
            }`}
            style={{width:boardWidth , height:boardHeight}}
          >
            {board.map((row, rowIdx) =>
              row.map((piece, colIdx) => {
                const squareLabel = `${colLabels[colIdx]}${rowLabels[rowIdx]}`.toLowerCase();
                const cellColor = (rowIdx + colIdx) % 2 === 0 ? "bg-board-white" : "bg-board-black";
                return (
                  <div
                    key={squareLabel}
                    data-square={squareLabel}
                    className={`${cellColor} flex justify-center items-center ${
                      color === "b" ? "rotate-180" : ""
                    }  active:bg-active`}
                    onClick={() => handleSquareClick(squareLabel)}
                   style={{width:boardHeight/8,
                    height:boardHeight/8,
                  backgroundColor:selectedSquare === squareLabel ? "#7b61ff" : ""}}
                   >
                    {piece && (
                      <div>
                        <ChessPiece color={piece.color} type={piece.type}/>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex justify-center text-xs sm:text-ms">
          <div className="h-[20px] md:h-[35px]" style={{ width: boardHeight/16 }} />
          <div
            className={`flex w-full items-center justify-around ${color == 'b' ? "rotate-180" : "" }`}
            style={{ height: boardHeight/16 }}
          >
            {colLabels.map((label) => (
              <p key={label} className={color == 'b' ? "rotate-180" : ""}>
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
                  <ChessPiece color={color} type={pieceType} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}