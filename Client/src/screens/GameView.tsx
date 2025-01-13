import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosC } from "../AxiosConfig";
import { GetGameInfoReponse } from "../../../Server/src/REST/controllers/user";
import { toast } from "react-toastify";
import { Chess } from "chess.js";
import ChessBoardView from "../components/ChessBoardView";
import {
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Swords,
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const GameView = () => {
  const { id } = useParams();
  const [gameData, setGameData] = useState({
    id: "",
    player1: "",
    player2: "",
    winner: "",
    moves: [
      {
        from: "",
        to: "",
        promotion: "",
      },
    ],
    reason: "",
  });
  const chessRef = useRef(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [board, setBoard] = useState(chessRef.current.board());
  const pieces = ["♔", "♕", "♖", "♘"];

  const goToStart = () => setCurrentMoveIndex(-1);
  const goToEnd = () => setCurrentMoveIndex(gameData.moves.length - 1);
  const goToPrevMove = () =>
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  const goToNextMove = () =>
    setCurrentMoveIndex((prev) =>
      Math.min(gameData.moves.length - 1, prev + 1)
    );

  useGSAP(() => {
    gsap.to(".floating-piece", {
      y: "random(-20, 20)",
      x: "random(-20, 20)",
      rotation: "random(-15, 15)",
      duration: "random(2, 4)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 2,
        from: "random",
      },
    });
  }, []);

  useEffect(() => {
    chessRef.current.reset();
    for (let i = 0; i <= currentMoveIndex; i++) {
      chessRef.current.move(gameData.moves[i]);
    }
    setBoard(chessRef.current.board());
  }, [currentMoveIndex, gameData.moves]);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // console.log(id);
        const response = await axiosC.get<GetGameInfoReponse>(
          `/user/game/${id}`
        );
        const res = response.data;
        if (!res.success) {
          toast.error(res.message);
          return;
        }
        if (res.success && res.data) {
          //   console.log(res);
          setGameData(res.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching Profile");
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center gap-8 p-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={i}
          className="floating-piece absolute text-4xl text-white/10 pointer-events-none shaw"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        >
          {pieces[i % pieces.length]}
        </span>
      ))}

      <div className="flex flex-col items-center gap-2 mt-16 text-white justify-center">
        <h1 className="text-2xl font-bold flex gap-3">Game Replay</h1>
        <div className="flex flex-center gap-2 text-sm md:text-xl text-muted-foreground bg-white/10 rounded-xl p-4">
          <span className="w-1/3">{gameData.player1}</span>
          <span>
            <Swords />
          </span>
          <span className="w-1/3">{gameData.player2}</span>
        </div>
        <div className="flex gap-10 flex-center text-sm md:text-lg">
          <div className="">
            Winner: <span className="font-semibold">{gameData.winner}</span>
          </div>
          {gameData.reason && (
            <div className="text-muted-foreground">
              Reason: {gameData.reason}
            </div>
          )}
        </div>
      </div>
      <div className="">
        <ChessBoardView board={board} />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={goToStart} disabled={currentMoveIndex === -1}>
          <SkipBack className="h-4 w-4" color="White" />
        </button>
        <button onClick={goToPrevMove} disabled={currentMoveIndex === -1}>
          <ChevronLeft className="h-4 w-4" color="White" />
        </button>
        <div className="min-w-[4rem] text-center text-white">
          {currentMoveIndex + 1} / {gameData.moves.length}
        </div>
        <button
          onClick={goToNextMove}
          disabled={currentMoveIndex === gameData.moves.length - 1}
        >
          <ChevronRight className="h-4 w-4" color="White" />
        </button>
        <button
          onClick={goToEnd}
          disabled={currentMoveIndex === gameData.moves.length - 1}
        >
          <SkipForward className="h-4 w-4" color="White" />
        </button>
      </div>
    </div>
  );
};

export default GameView;
