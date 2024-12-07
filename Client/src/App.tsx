import Home from "./screens/Home.tsx";
import Play from "./screens/PlayScreen.tsx";
import WaitingPage from "./screens/WaitingPage.tsx";
import GameOver from "./screens/GameOver.tsx";
import NotFound from "./screens/NotFound.tsx";
import PrivateRoute from "./components/Common/PrivateRoute.tsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameContext } from "./context/gameContext.ts";
import { useEffect, useState } from "react";
import LoginPage from "./screens/LoginPage.tsx";
import SignUpPage from "./screens/SignUpPage.tsx";
import ForgotPassPage from "./screens/ForgotPassPage.tsx";
import { UserContext } from "./context/userContext.ts";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { refresh } from "./hooks/useRefresh.ts";
import NavBar from "./components/Common/NavBar.tsx";
import Cookies from "js-cookie";

const App = () => {
  const [color, setColor] = useState<string>("ToBeGiven");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [hasSocket, setHasSocket] = useState(false);
  const [oppName,setOppName] = useState<string>("");

  const [username, setUsername] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [expiry, setExpiry] = useState<number>(0);
  const [isLoggedIn,setIsLoggedIn] = useState<boolean>(false);
  const [photo,setPhoto] = useState<string>("");

  useEffect(() => {
    // Check cookies when app loads
    const savedUsername = Cookies.get('username');
    const savedToken = Cookies.get('accessToken');
    const savedExpiry = Cookies.get('expiry');
    const savedPhoto = Cookies.get("photo");

    if (savedUsername && savedToken && savedExpiry && savedPhoto) {
      const expiryTime = parseInt(savedExpiry);
      const currentTime = new Date().getTime();
      if (expiryTime > currentTime) {
        setUsername(savedUsername);
        setAccessToken(savedToken);
        setExpiry(parseInt(savedExpiry));
        setPhoto(savedPhoto);
        setIsLoggedIn(true);
        // console.log("Got it");
      } else {
        // Clear expired cookies
        Cookies.remove('username');
        Cookies.remove('accessToken');
        Cookies.remove('expiry');
      }
    }
  }, []);


  useEffect(()=>{
    if(!accessToken) return;
    const refreshAccessToken = async () => {
      try{
        const res = await refresh();
        const newAccessToken = res?.data.accessToken;
        if(!newAccessToken){
          console.log("Got No new AccessToken");
          return;
        }
        setAccessToken(newAccessToken);
        console.log("Token Refreshed");
      }catch(error){
        console.log("Error while refreshing token: ",error);
      }
    }
    const timer = setTimeout(()=>{
      refreshAccessToken();
    },5*60*1000);
    return ()=>clearTimeout(timer);
  },[accessToken]);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider
          value={{
            username,
            setUsername,
            accessToken,
            setAccessToken,
            expiry,
            setExpiry,
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
            <section className="z-50 w-full">
              <NavBar/> 
            </section>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot" element={<ForgotPassPage />} />
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
