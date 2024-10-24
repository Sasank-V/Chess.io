import { Link } from "react-router-dom";
import ChessBoard from "../components/ChessBoard";
import CloseButton from "../components/CloseButton";
import { useContext } from "react";
import { GameContext } from "../context/context";
import { useSocket } from "../hooks/useSocket";
import { PLAYER_RESIGN } from "../components/Messages";
const Play = () => {

  const gameContext = useContext(GameContext);
  if(!gameContext) throw new Error("Game context is Undefined");
  const {setIsWinner,setHasSocket,setReason} = gameContext
  const socket = useSocket();
  const handleResign = () => {
    if(!socket) return;
    socket.send(JSON.stringify({
      type:PLAYER_RESIGN
    }))
    setReason("You Resigned");
    setHasSocket(false);
    socket.close();
    setIsWinner(false);
  }

  return (
    <section className="w-full h-[100vh] background flex-center flex-col gap-3">
      <div>
        <ChessBoard/>
      </div>
      <Link to="/gameover" onClick={handleResign}>
        <div className="scale-75">
          <CloseButton text="Resign"/>
        </div>
      </Link>
    </section>
  )
}

export default Play