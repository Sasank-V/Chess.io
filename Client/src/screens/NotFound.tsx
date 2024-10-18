'use client'

import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function NotFound() {
  useGSAP(() => {
    // Animate text and button
    gsap.from(['.error-text', '.error-message', '.return-button'], {
      y: 50,
      opacity: 0,
      stagger: 0.2,
      delay: 1,
      duration: 0.8,
      ease: 'back.out(1.7)',
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center background">
      <div className="text-center">
        <div className="w-64 h-64 mx-auto mb-8 relative">
          <div className="grid grid-cols-8 grid-rows-8">
            {[...Array(64)].map((_, i) => (
              <div
                key={i}
                className={`chess-square w-8 h-8 ${
                  (Math.floor(i / 8) + i) % 2 === 0 ? "bg-gray-700" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
        <h1 className="error-text text-6xl font-bold text-white mb-4">404</h1>
        <p className="error-message text-xl text-gray-300 mb-8">Oops! You've made an illegal move.</p>
        <Link to="/" className="return-button inline-block group relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur  group-hover:opacity-100 transition duration-200"
            aria-hidden="true"
          ></div>
          <button className="relative px-6 py-3 bg-white text-gray-800 rounded-full transition-all duration-200 ease-out hover:scale-105 hover:shadow-lg">
            Return to the board
          </button>
        </Link>
      </div>
    </div>
  )
}