'use client'

import { useRef, useState, useCallback, useEffect, useContext } from "react";
import { useSocket } from "./useSocket";
import { WEB_STREAM } from '../components/Messages';
import { GameContext } from "../context/context";

export const useWebRTCSetup = () => {
    const socket = useSocket();
    const [isConnected, setIsConnected] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    const iceServers = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };

    const gameContext = useContext(GameContext);
  if (!gameContext) throw new Error("Game context Not found");

  const {hasSocket} = gameContext;

    const createPeerConnection = useCallback(() => {
        if (!peerConnection.current) {
            peerConnection.current = new RTCPeerConnection(iceServers);
            
            peerConnection.current.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.send(JSON.stringify({
                        type: WEB_STREAM,
                        data: {
                            type: "candidate", 
                            candidate: event.candidate
                        }
                    }));
                }
            };

            peerConnection.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };
        }
    }, [socket]);

    const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
        try {
            createPeerConnection();
            if (!peerConnection.current) throw new Error("Peer connection not initialized");

            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await peerConnection.current.createAnswer();

            await peerConnection.current.setLocalDescription(answer);

            if (socket) {
                socket.send(JSON.stringify({ 
                    type: WEB_STREAM,
                    data: { type: "answer", answer }
                }));
            } else {
                console.error("Socket not available");
            }
        } catch (error) {
            console.error("Error during offer handling:", error);
        }
    }, [createPeerConnection, socket]);

    const startConnection = useCallback((event: MessageEvent) => {
        if (!socket) return;
        const message = JSON.parse(event.data);
        if (message.type !== WEB_STREAM) return;
        const data = message.data;

        if (data.type === "offer") {
            handleOffer(data.offer);
        } else if (data.type === "answer") {
            if (!data.answer) {
                console.error("Received answer is undefined");
                return;
            }
            peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer))
                .catch(error => console.error("Error setting remote description:", error));
        } else if (data.type === "candidate" && peerConnection.current) {
            peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch(error => console.error("Error adding ICE candidate:", error));
        }
    }, [socket, handleOffer]);

    const startStream = useCallback(async () => {
        try {
            createPeerConnection();
            if (!peerConnection.current) throw new Error("Peer connection not initialized");

            localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream.current;

            localStream.current.getTracks().forEach(track => peerConnection.current?.addTrack(track, localStream.current!));

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            
            if (socket) {
                socket.send(JSON.stringify({ 
                    type: WEB_STREAM,
                    data: {
                        type: "offer", 
                        offer 
                    }
                }));
                setIsConnected(true);
            } else {
                console.error("Socket not available");
            }
        } catch (error) {
            console.error("Error starting stream:", error);
        }
    }, [createPeerConnection, socket]);

    const toggleVideo = useCallback(() => {
        if (localStream.current) {
            localStream.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    }, [isVideoEnabled]);

    const toggleAudio = useCallback(() => {
        if (localStream.current) {
            localStream.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    }, [isAudioEnabled]);

    const disconnectPeer = useCallback(() => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsConnected(false);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);

        if (socket) {
            socket.send(JSON.stringify({
                type: WEB_STREAM,
                data: {
                    type: "disconnect"
                }
            }));
        }
    }, [socket]);

    useEffect(() => {
        if (socket) {
            socket.addEventListener('message', startConnection);
            return () => {
                socket.removeEventListener('message', startConnection);
            };
        }
    }, [socket, startConnection]);

    useEffect(() => {
        if(!hasSocket) disconnectPeer();
        return () => {
            disconnectPeer();
        };
    }, [disconnectPeer,hasSocket]);

    return { 
        startStream, 
        localVideoRef, 
        remoteVideoRef, 
        isConnected, 
        toggleVideo, 
        toggleAudio, 
        isVideoEnabled, 
        isAudioEnabled,
        disconnectPeer 
    };
};