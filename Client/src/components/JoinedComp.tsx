import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import React from 'react'
import Button from './Button';

const JoinedComp = ({setGameJoined} : {setGameJoined:(val:boolean)=>void}) => {
    const peices = ['♔', '♕', '♖', '♗', '♘', '♙'];
    useGSAP(() => {
        // Animate when opponent is found
        gsap.to(".chess-piece", { scale: 0, stagger: 0.1, ease: "back.in" });
        gsap.fromTo(".found-text", 
          { opacity: 0, y: 50 },
          { opacity: 1, y: -20, duration: 0.5, delay: 0.5 }
        );
        gsap.fromTo(".join-button", 
          { scale: 0 },
          { scale: 1, duration: 0.5, delay: 0.8, ease: "back.out" }
        );
        gsap.to(".horse",{
          scale: 1.3,
          duration: 1,
          delay:0.4,
          ease:"power1.inOut"
        })
    }, []);
  return (
    <div className="min-h-screen flex-center flex-col background text-white ">
      <div className="relative w-64 h-64"> 
        <div className="text-[150px] flex-center horse">
          {peices[Math.floor(Math.random()*6)]}
        </div> 
      </div>
        <div className="text-center">
          <h2 className="found-text text-3xl font-bold mb-6">
            Opponent Found!
          </h2>
          <div onClick={()=>setGameJoined(true)} className='join-button'>
            <Button text='Join Game'/>
          </div>
        </div>
    </div>
  )
}

export default JoinedComp