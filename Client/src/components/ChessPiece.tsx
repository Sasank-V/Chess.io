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

function ChessPiece ({type,color,label}){
    const [icon,setIcon] = useState(null);
    useEffect(()=>{
        setIcon(getIcon(type,color));
    });
    const getIcon = (type, color) => {
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
    return(<div className={`w-[62.5px] h-[62.5px] bg-[${color}] flex justify-center items-center text-3xl`}    
    >
        <img src={icon} alt="" data-square={label} />
    </div>);
}
export default ChessPiece;