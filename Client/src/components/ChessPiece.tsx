import { useEffect, useState } from "react";

import blackPawn from "../assets/Black/Pawn.png";
import blackRook from "../assets/Black/Rook.png";
import blackKinght from "../assets/Black/Knight.png";
import blackBishop from "../assets/Black/Bishop.png";
import blackKing from "../assets/Black/King.png";
import blackQueen from "../assets/Black/Queen.png";

import whitePawn from "../assets/White/Pawn.png";
import whiteRook from "../assets/White/Rook.png";
import whiteKinght from "../assets/White/Knight.png";
import whiteBishop from "../assets/White/Bishop.png";
import whiteKing from "../assets/White/King.png";
import whiteQueen from "../assets/White/Queen.png";

type Input = {
    type:string,
    color:string,
    label:string, 
};

function ChessPiece (inp:Input){
    const [icon,setIcon] = useState<string>("");
    useEffect(()=>{
        setIcon(getIcon(inp.type,inp.color));
    },[inp]);
    const getIcon = (type:string, color:string): string => {
        if (color === 'b') {
            switch (type) {
                case 'k': return blackKing; // King
                case 'q': return blackQueen; // Queen
                case 'r': return blackRook; // Rook
                case 'b': return blackBishop; // Bishop
                case 'n': return blackKinght; // Knight
                case 'p': return blackPawn; // Pawn
                default: return "";
            }
        } else {
            switch (type) {
                case 'k': return whiteKing; // King
                case 'q': return whiteQueen; // Queen
                case 'r': return whiteRook; // Rook
                case 'b': return whiteBishop; // Bishop
                case 'n': return whiteKinght; // Knight
                case 'p': return whitePawn; // Pawn
                default: return "";
            }
        }
    }
    return(<div className={`w-[62.5px] h-[62.5px] bg-[${inp.color}] flex justify-center items-center text-3xl`}    
    >
        <img src={icon?icon:""} alt="" data-square={inp.label} />
    </div>);
}
export default ChessPiece;