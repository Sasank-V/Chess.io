import { useEffect, useState } from "react";
import ChessPiece from "../components/PlayScreen/ChessPiece";
type BoardProps = {
  board: ({ square: string; type: string; color: string } | null)[][];
};

export default function ChessBoardView({ board }: BoardProps) {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [boardWidth, setBoardWidth] = useState(500);
  const [boardHeight, setBoardHeight] = useState(500);

  const rowLabels = [8, 7, 6, 5, 4, 3, 2, 1];
  const colLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenWidth > 600) {
      setBoardWidth(500);
      setBoardHeight(500);
    } else {
      const newWidth = Math.min(500, screenWidth * 0.9);
      setBoardWidth(newWidth);
      setBoardHeight(newWidth);
    }
  }, [screenWidth]);

  return (
    <div className="bg-white">
      <div className="flex">
        <div
          className="flex flex-col justify-around items-center text-md font-semibold"
          style={{ width: boardWidth / 16, height: boardHeight }}
        >
          {rowLabels.map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>

        <div
          className="relative bg-white flex flex-wrap"
          style={{ width: boardWidth, height: boardHeight }}
        >
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => {
              const squareLabel =
                `${colLabels[colIdx]}${rowLabels[rowIdx]}`.toLowerCase();
              const cellColor =
                (rowIdx + colIdx) % 2 === 0
                  ? "bg-board-white"
                  : "bg-board-black";
              return (
                <div
                  key={squareLabel}
                  data-square={squareLabel}
                  className={`${cellColor} flex justify-center items-center`}
                  style={{
                    width: boardHeight / 8,
                    height: boardHeight / 8,
                  }}
                >
                  {piece && (
                    <div>
                      <ChessPiece color={piece.color} type={piece.type} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex justify-center text-xs sm:text-ms">
        <div
          className="h-[20px] md:h-[35px]"
          style={{ width: boardHeight / 16 }}
        />
        <div
          className="flex w-full items-center justify-around"
          style={{ height: boardHeight / 16 }}
        >
          {colLabels.map((label) => (
            <p key={label}>{label}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
