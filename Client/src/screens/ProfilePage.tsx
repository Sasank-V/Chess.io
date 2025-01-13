import { Crown, Trophy } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/userContext";
import { axiosC } from "../AxiosConfig";
import { toast } from "react-toastify";
import Button from "../components/Common/Button";
import { useNavigate } from "react-router-dom";

export type GetUserProfileResponse = {
  success: boolean;
  message: string;
  data?: {
    username: string;
    photo: string;
    rating: number;
    gamesPlayed: number;
    gamesWon: number;
    games: {
      white: string;
      black: string;
      total_moves: number;
      won: boolean;
      reason: string;
      id: string;
    }[];
  };
};

export default function ProfilePage() {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw Error("User context unavailable in profile page");
  }
  const { username, photo, email } = userContext;
  const [userData, setUserData] = useState({
    username,
    rating: 0,
    gamesWon: 0,
    gamesPlayed: 0,
    photo,
    games: [
      {
        white: "",
        black: "",
        won: false,
        total_moves: 0,
        reason: "",
        id: "",
      },
    ],
  });
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const pieces = ["♔", "♕", "♖", "♘"];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosC.post<GetUserProfileResponse>(
          "/user/profile",
          {
            email,
          }
        );
        const res = response.data;
        if (!res.success) {
          toast.error(res.message);
          return;
        }
        if (res.success && res.data) {
          setUserData(res.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching Profile");
      }
    };
    fetchUserProfile();
  }, []);

  useGSAP(() => {
    gsap.from(profileRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
    });

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

  return (
    <section className="w-full flex flex-col background items-center gap-8 min-h-screen p-8">
      {/* Floating Chess Pieces Background */}
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

      {/* Profile Section */}
      <div ref={profileRef} className="w-full max-w-4xl mt-16">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src={userData.photo}
              alt={userData.username}
              className="w-40 h-40 rounded-full border-4 border-white/20"
            />
            <div className="flex flex-col items-center md:items-start gap-4">
              <h1 className="text-4xl font-bold flex items-center gap-3">
                {userData.username}
                <Crown className="text-yellow-400" />
              </h1>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold">{userData.rating}</p>
                  <p className="text-gray-400">Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{userData.gamesWon}</p>
                  <p className="text-gray-400">Games Won</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{userData.gamesPlayed}</p>
                  <p className="text-gray-400">Total Games</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Games History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Game History
          </h2>
          <div className="space-y-4">
            {userData.games.length == 0 && (
              <div className="text-white relative flex-center flex-col text-2xl gap-5">
                <p>No Games Played Yet</p>
                <div
                  onClick={() => {
                    navigate("/wait");
                  }}
                >
                  <Button text="Play" />
                </div>
              </div>
            )}
            {userData.games.map((game, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white"
                style={{
                  backgroundColor: game.won
                    ? "rgb(34 197 94 / 0.1)"
                    : "rgb(239 68 68 / 0.1)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                  <div className="cursor-pointer hover:scale-110 transition-all duration-200">
                    <img
                      data-game-id={game.id}
                      onClick={(e) => {
                        // console.log(e.currentTarget);
                        const gameId =
                          e.currentTarget.getAttribute("data-game-id");
                        if (gameId) {
                          navigate(`/gameview/${gameId}`);
                        }
                      }}
                      src="/Chess_Board.png"
                      alt="chess-board-logo"
                      className="bg-slate-800 text-slate-700 w-[100px] h-[100px]"
                    />
                  </div>
                  <div>
                    <p className="text-gray-400">Players</p>
                    <p className="font-medium">{game.white} (White)</p>
                    <p className="font-medium">vs</p>
                    <p className="font-medium">{game.black} (Black)</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Moves</p>
                    <p className="font-medium">{game.total_moves}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Result</p>
                    <p className="font-medium">{game.won ? "Won" : "Lost"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reason</p>
                    <p className="font-medium">{game.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
