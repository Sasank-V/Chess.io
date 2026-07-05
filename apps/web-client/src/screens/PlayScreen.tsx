import { Link } from "react-router-dom";
import ChessBoard from "../components/PlayScreen/ChessBoard.tsx";
import CloseButton from "../components/PlayScreen/CloseButton.tsx";
import { useContext, useState } from "react";
import { GameContext } from "../context/gameContext.ts";
import { useSocket } from "../hooks/useSocket.ts";
import { PLAYER_RESIGN } from "../components/Common/Messages.tsx";
import VideoStream from "../components/PlayScreen/VideoStream.tsx";
const Play = () => {

  const gameContext = useContext(GameContext);
  if(!gameContext) throw new Error("Game context is Undefined");
  const {setIsWinner,setHasSocket,setReason,oppName} = gameContext
  const socket = useSocket();

  const [gameJoined,setGameJoined] = useState<boolean>(false);

  const handleResign = () => {
    if(!socket) return;
    socket.send(JSON.stringify({
      type:PLAYER_RESIGN
    }))
    setReason("You Resigned");
    socket.close();
    setHasSocket(false);
    setIsWinner(false);
  }

  return (
    <section className="w-full min-h-screen background flex-center flex-col lg:flex-row gap-5">
      <div className={`${!gameJoined?"hidden":"flex"}`}>
        <VideoStream oppName={oppName}/>
      </div>
      <div className="z-0
      ">
        <ChessBoard gameJoined={gameJoined} setGameJoined={setGameJoined}/>
      </div> 
      <Link to="/gameover" onClick={handleResign} className={`${!gameJoined?"hidden":"flex"}`}>
        <div className="scale-75">
          <CloseButton text="Resign"/>
        </div>
      </Link>
    </section>
  )
}

export default Play