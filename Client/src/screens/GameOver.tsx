import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/gameContext";
import Button from "../components/Common/Button";
import { useSocket } from "../hooks/useSocket";
const GameOver = () => {

  const gameContext = useContext(GameContext);
  if(!gameContext) throw new Error("Game Context is Undefined in gameover ");
  const {isWinner,reason,setHasSocket,setReason} = gameContext;
  const socket = useSocket();
  const navigate = useNavigate();
  useEffect(()=>{
    if(reason === ""){
      return navigate("/");
    }
  },[reason]);

  return (
    <div className="w-full h-[100vh] flex-center flex-col text-white gap-4 background">
        <div className="flex-center flex-col">
          <h1 className="text-6xl">Game Over</h1>
          <div className="text-[150px]">♔</div>
        </div>
        <div className="flex-center flex-col">
          <h2 className="text-5xl mb-5">{isWinner ? "You Won !!" : "You Lost !!"}</h2>
          <h4 className="text-2xl mb-5 opacity-90">{reason}</h4>
          <div onClick={()=>{
            socket?.close();
            setReason("");
            setHasSocket(false);
            navigate("/wait");
            }}>
            <Button text={"Play Again"}/>
          </div>
        </div>
      </div>
  )
}

export default GameOver