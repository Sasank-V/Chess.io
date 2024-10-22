import Home from './screens/Home.tsx'
import Play from "./screens/Play.tsx";
import WaitingPage from './screens/WaitingPage.tsx';
import GameOver from "./screens/GameOver.tsx";
import NotFound from './screens/NotFound.tsx';
import PrivateRoute from './components/PrivateRoute.tsx';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameContext } from './context/context.ts';
import { useState } from 'react';

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
