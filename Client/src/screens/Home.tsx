'use client'

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocket } from "../hooks/useSocket";
import Button from "../components/Button";
import { INIT_GAME } from "../components/Messages";

export default function Home() {
  const peices = ['♔', '♕', '♖', '♘'];
  
  useGSAP(()=>{
    gsap.to(".logo",{
      y:15,
      repeat:-1,
      duration:1,
      yoyo: true,
      ease: "power1.inOut"
    })
  });
  
  const handleStart = () => {
    const socket = useSocket();
    socket?.send(JSON.stringify({
      type : INIT_GAME
    }))
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

      <Link to="/wait" onClick={handleStart}>
        <Button text={'Play Now'}/>
      </Link>

      <div className="mt-16 text-gray-400 text-sm">
        <p>Join thousands of players worldwide</p>
      </div>
    </section>
  )
}