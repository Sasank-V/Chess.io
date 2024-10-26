import { useEffect, useState } from "react";
import { useWebRTCSetup } from "../hooks/useWebRTCSetup"
import { Video, VideoOff, Mic, MicOff } from "lucide-react"

const VideoStream = () => {
  const {
    startStream,
    localVideoRef,
    isConnected,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    remoteVideoRef
  } = useWebRTCSetup();
  const [width,setWidth] = useState(window.innerWidth);
  useEffect(()=>{
    window.addEventListener("resize",()=>{
      setWidth(window.innerWidth);
    })
    return window.removeEventListener("resize",()=>{
      setWidth(window.innerWidth);
    })
  })


  return (
      <div className=" flex-center lg:flex-col gap-3 mt-5 text-sm md:text-lg lg:-translate-y-5">
        <div className=" flex-center lg:flex-col gap-3">
        <div className="flex-center mx-2 lg:space-x-4 flex-col lg:flex-row text-white my-3 gap-2">
        <button onClick={startStream} className="bg-green-500 hover:bg-green-700 p-2 rounded-3xl text-white" disabled={isConnected}>
          {isConnected ? "Connected" : "Stream"}
        </button>
        <div className="flex-center flex-col">
            <button onClick={toggleVideo} className="flex items-center space-x-2">
              {isVideoEnabled ? <Video className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <VideoOff className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
              <span>Video</span>
            </button>
            <button onClick={toggleAudio} className="flex items-center space-x-2">
              {isAudioEnabled ? <Mic className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : <MicOff className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
              <span>Audio</span>
            </button>
        </div>
          </div>
          <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{width:width > 800 ? Math.min(250,width/5) : Math.max(width/4,100) ,height:width > 800 ? Math.min(250,width/5) : Math.max(width/4,100)}}>
            <video ref={localVideoRef} playsInline autoPlay muted className="absolute inset-0 w-full h-full object-cover"></video>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">Me</div>
          </div>
        </div>
        <div className="relative bg-gray-200 rounded-lg overflow-hidden " style={{width:width > 800 ? Math.min(250,width/5) : Math.max(width/4,100) ,height:width > 800 ? Math.min(250,width/5) : Math.max(width/4,100)}}>
            <video ref={remoteVideoRef} playsInline autoPlay className="absolute inset-0 w-full h-full object-cover"></video>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">Opp</div>
      </div>
    </div>
  )
}

export default VideoStream