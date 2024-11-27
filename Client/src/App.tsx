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

const App = () => {
  const [color, setColor] = useState<string>("ToBeGiven");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [reason, setReason] = useState("ToBeSet");
  const [hasSocket, setHasSocket] = useState(false);

  const [username, setUsername] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [expiry, setExpiry] = useState<number>(0);



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
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot" element={<ForgotPassPage />} />
              <Route
                path="/wait"
                element={
                  <PrivateRoute>
                    <WaitingPage />
                  </PrivateRoute>
                }
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
