import Home from './screens/Home.tsx'
import Play from "./screens/Play.tsx";
import WaitingPage from './screens/WaitingPage.tsx';
import GameOver from "./screens/GameOver.tsx";
import NotFound from './screens/NotFound.tsx';

import { BrowserRouter,Routes,Route } from 'react-router-dom'
import { GameContext } from './context/context.ts';
import { useState } from 'react';

const App = () => {
    const [color,setColor] = useState<string>("ToBeGiven");
    const [isWinner,setIsWinner] = useState<boolean>(false);
  return (
    <>
        <BrowserRouter>
            <GameContext.Provider value={{color,setColor,isWinner,setIsWinner}}>
                <Routes>
                    <Route path='/' element={<Home/>}></Route>
                    <Route path='/wait' element={<WaitingPage/>}></Route>
                    <Route path='/play' element={<Play/>}></Route>
                    <Route path='/gameover' element={<GameOver/>}></Route>
                    <Route path='/*' element={<NotFound/>}></Route>
                </Routes>
            </GameContext.Provider>
        </BrowserRouter>
    </>
  )
}

export default App