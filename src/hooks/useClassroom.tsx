/**
 * THIS FILE IS FOR TESTING PURPOSES ONLY
 */
import { useCallback, useRef, useEffect } from "react";

import { VIDEO_SERVER_URL } from "../constants/urls";
import {
  VideoRefObject,
  VideoRefObjects,
} from "../views/pages/classroomComponents/_videos";

const url = `${VIDEO_SERVER_URL}/?type=student&room=123`;
const remoteDescriptions: { [id: string]: boolean } = {};
const candidateQueue: RTCIceCandidate[] = [];

interface UseClassroomProps {
  addParticipant: (id: string, label: string, stream: MediaStream) => void;
  removeParticipant: (id: string) => void;
  localStream: MediaStream | null;
}

export interface UseClassroomReturns {
  peerConnections: { [id: string]: RTCPeerConnection };
}

const useClassroom = ({
  addParticipant,
  removeParticipant,
  localStream,
}: UseClassroomProps): UseClassroomReturns => {
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<{ [id: string]: RTCPeerConnection }>({});

  const createPeerConnection = useCallback((id: string, label: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    });

    localStream
      ?.getTracks()
      .forEach((track) => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      const remoteStream = new MediaStream(event.streams[0].getTracks());
      addParticipant(id, label, remoteStream);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage(
          JSON.stringify({
            type: "candidate",
            target: id,
            label,
            data: event.candidate,
          })
        );
      }
    };

    if (peerConnectionsRef.current) {
      peerConnectionsRef.current[id] = peerConnection;
    }

    return peerConnection;
  }, []);

  const handleOffer = useCallback(async (data: string) => {
    const message = JSON.parse(data);
    const peerConnection = createPeerConnection(message.target, message.label);

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.data)
    );

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendMessage(
      JSON.stringify({
        type: "answer",
        target: message.target,
        label: message.label,
        data: answer,
      })
    );
  }, []);

  const handleCandidate = useCallback(async (data: string) => {
    const message = JSON.parse(data);
    const peerConnection = peerConnectionsRef.current[message.target];
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
    }
  }, []);

  const handleAnswer = useCallback(async (data: string) => {
    const message = JSON.parse(data);
    const peerConnection = peerConnectionsRef.current[message.target];
    if (!peerConnection) {
      console.error(
        "Peer connection not found for answer from",
        message.target
      );
      return;
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.data)
    );
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message, classroom socket is not open.");
    }
  }, []);

  const onMessage = useCallback(async (data: string) => {
    const message = JSON.parse(data);
    console.log("Received message:", message);

    if (message.type === "offer") {
      await handleOffer(data);
    } else if (message.type === "candidate") {
      await handleCandidate(data);
    } else if (message.type === "answer") {
      await handleAnswer(data);
    }
  }, []);

  useEffect(() => {
    if (!socketRef.current) {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log("Connected to classroom socket");
      };

      socket.onmessage = async (event) => {
        console.log("Incoming message");
        const rawData = event.data;

        if (rawData instanceof Blob) {
          const textData = await rawData.text();
          const message = JSON.parse(textData);
          onMessage(textData);
        } else if (typeof rawData === "string") {
          const message = JSON.parse(rawData);
          onMessage(rawData);
        } else {
          console.warn(`Received unknown data type: ${typeof rawData}`);
        }
      };

      socket.onclose = async (event) => {
        console.warn(
          `Disconnected from classroom socket: ${event.reason} (${event.code})`
        );
      };

      socket.onerror = async (error) => {
        console.error(
          `Error with classroom socket: ${JSON.stringify(error, null, 2)}`
        );
      };

      return () => {
        socket.close();
      };
    }
  }, [onMessage]);

  return {
    peerConnections: peerConnectionsRef.current,
  };
};

export default useClassroom;
