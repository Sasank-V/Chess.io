'use client'

import { useNavigate } from "react-router-dom"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Button from "../components/Common/Button";
import { useContext } from "react";
import { GameContext } from "../context/context";

export default function Home() {
  const navigate = useNavigate();
  const gamecontext = useContext(GameContext);
  if(!gamecontext) throw new Error("Game Contex is Undefined in Home");
  const {setHasSocket} = gamecontext;
  const peices = ['♔', '♕', '♖', '♘'];
  useGSAP(()=>{
    gsap.to(".logo",{
      y:-25,
      duration:0.8,
      delay:0.5,
      yoyo:true,
      repeat:-1,
      ease:"power1.inOut"
    })
  });
  
  const useHandleStart = () => {
    setHasSocket(true);
    navigate("/wait");
  }


  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center background relative overflow-hidden">
      <div className="text-white text-center mb-12 animate-fadeIn p-10 sm:p-20 relative">
        <div className="absolute top-0 left-0">
          <span className="home-peice">
            {peices[0]}
          </span>
        </div>
        <div className="absolute top-0 right-0">
          <span className="home-peice">
            {peices[1]}
          </span>
        </div>
        <div className="absolute bottom-0 left-0">
          <span className="home-peice">
            {peices[2]}
          </span>
        </div>
        <div className="absolute bottom-0 right-0">
          <span className="home-peice">
            {peices[3]}
          </span>
        </div>
        <h1 className="logo text-6xl sm:text-9xl font-bold mb-2">Chess<span className="text-4xl sm:text-5xl font-light">.io</span></h1>
        <p className="text-xl sm:text-2xl text-gray-300 mt-4">Experience the thrill of online chess</p>
      </div>

      <div onClick={useHandleStart}>
        <Button text={'Play Now'}/>
      </div>

      <div className="mt-16 text-gray-400 text-sm">
        <p>Join thousands of players worldwide</p>
      </div>
    </section>
  )
}