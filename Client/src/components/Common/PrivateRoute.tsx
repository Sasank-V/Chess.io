import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/context';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const gameContext = useContext(GameContext);
  if(!gameContext) throw new Error("Game Context Does not exist");
  const {hasSocket} = gameContext;

  useEffect(() => {
    if (!hasSocket) navigate('/');
  }, [hasSocket, navigate]);

  return hasSocket ? children : null;
};

export default PrivateRoute;