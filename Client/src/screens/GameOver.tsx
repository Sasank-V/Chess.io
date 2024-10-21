import { useContext } from "react";
import { INIT_GAME } from "../components/Messages";
import { useSocket } from "../hooks/useSocket";
import { Link } from "react-router-dom";
import { GameContext } from "../context/context";
import Button from "../components/Button";
const GameOver = () => {

  const gameContext = useContext(GameContext);
  const isWinner = gameContext?.isWinner;

  const useHandleRestart = () => {
    const socket = useSocket();
    socket?.send(JSON.stringify({
      type : INIT_GAME
    }))
  }

  return (
    <div className="w-full h-[100vh] flex-center flex-col text-white gap-4 background">
        <div className="flex-center flex-col">
          <h1 className="text-6xl">Game Over</h1>
          <div className="text-[150px]">♔</div>
        </div>
        <div className="flex-center flex-col">
          <h2 className="text-5xl mb-10">{isWinner ? "You Won !!" : "You Lost !!"}</h2>
          <Link to="/wait" onClick={useHandleRestart}>
            <Button text={"Play Again"}/>
          </Link>
        </div>
      </div>
  )
}

export default GameOver