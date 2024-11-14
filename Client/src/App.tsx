import Home from './screens/Home.tsx'
import Play from "./screens/PlayScreen.tsx";
import WaitingPage from './screens/WaitingPage.tsx';
import GameOver from "./screens/GameOver.tsx";
import NotFound from './screens/NotFound.tsx';
import PrivateRoute from './components/Common/PrivateRoute.tsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameContext } from './context/context.ts';
import { useState } from 'react';
import LoginPage from './screens/LoginPage.tsx';
import SignUpPage from './screens/SignUpPage.tsx';

const App = () => {
  const [color, setColor] = useState<string>("ToBeGiven");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [reason, setReason] = useState("ToBeSet");
  const [hasSocket,setHasSocket] = useState(false);

  return (
    <>
      <BrowserRouter>
        <GameContext.Provider value={{ color, setColor, isWinner, setIsWinner, reason, setReason,hasSocket,setHasSocket}}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignUpPage/>}/>
            <Route path='/wait' element={
              <PrivateRoute>
                <WaitingPage />
              </PrivateRoute>
            } />
            <Route path='/play' element={
              <PrivateRoute>
                <Play />
              </PrivateRoute>
            } />
            <Route path='/gameover' element={<GameOver />} />
            <Route path='/*' element={<NotFound />} />
          </Routes>
        </GameContext.Provider>
      </BrowserRouter>
    </>
  );
};

export default App;
