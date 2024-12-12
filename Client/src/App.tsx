import Home from "./screens/Home.tsx";
import Play from "./screens/PlayScreen.tsx";
import WaitingPage from "./screens/WaitingPage.tsx";
import GameOver from "./screens/GameOver.tsx";
import NotFound from "./screens/NotFound.tsx";
import PrivateRoute from "./components/Common/PrivateRoute.tsx";

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameContext } from "./context/gameContext.ts";
import { useEffect, useState } from "react";

import { UserContext } from "./context/userContext.ts";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NavBar from "./screens/NavBar.tsx";
import Cookies from "js-cookie";

const NavbarWrapper = () => {
  const location = useLocation();
  
  // Define paths where navbar should not appear
  const hideNavbarPaths = ["/wait","/play"];
  
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return shouldShowNavbar ? (
    <section className="z-50 w-full border-2 border-black">
      <NavBar/> 
    </section>
  ) : null;
};

const App = () => {
  const [color, setColor] = useState<string>("ToBeGiven");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [hasSocket, setHasSocket] = useState(false);
  const [oppName,setOppName] = useState<string>("");

  const [username, setUsername] = useState<string>("");
  const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false);
  const [photo,setPhoto] = useState<string>("");

  
  useEffect(() => {
    // Check cookies when app loads
    const savedUsername = Cookies.get('username');
    const savedPhoto = Cookies.get("photo");

    if (savedUsername && savedPhoto) {
        setUsername(savedUsername);
        setPhoto(savedPhoto);
        setIsLoggedIn(true);
        // console.log("Got it");
    }
  }, []);


  return (
    <>
      <BrowserRouter>
        <UserContext.Provider
          value={{
            username,
            setUsername,
            isLoggedIn,
            setIsLoggedIn,
            photo,
            setPhoto
          }}
        >
          <GameContext.Provider
            value={{
              color,
              setColor,
              isWinner,
              setIsWinner,
              reason,
              setReason,
              hasSocket,
              setHasSocket,
              oppName,
              setOppName
            }}
          >
            <NavbarWrapper/>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/wait"
                element={<WaitingPage />}
              />
              <Route
                path="/play"
                element={
                  <PrivateRoute>
                    <Play />
                  </PrivateRoute>
                }
              />
              <Route path="/gameover" element={<GameOver />} />
              <Route path="/*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </GameContext.Provider>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
};

export default App;
