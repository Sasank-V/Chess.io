import {parentPort} from "worker_threads";
import {Chess} from  "chess.js";
import { VALIDATE_MOVE} from './Messages';

import { WorkerMessage,ValidateMove,WorkerMoveReply } from "../Types/WorkerTypes";

parentPort?.on("message",(message:WorkerMessage) => {
    parentPort?.postMessage(handleValidateMove(message.data as ValidateMove))
})

const handleValidateMove = (data:ValidateMove):WorkerMoveReply => {
    const board = new Chess(data.board);
    try {
        board.move(data.move);
        return {
            type:VALIDATE_MOVE,
            move:data.move,
            isValid:true,
        }
        
      } catch (error) {
        console.log("Invalid move: ", error);
        return {
            type:VALIDATE_MOVE,
            move:data.move,
            isValid:false,
        }
      }
}


