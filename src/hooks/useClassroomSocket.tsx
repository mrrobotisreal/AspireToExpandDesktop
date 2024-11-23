import { useCallback, useRef, useEffect } from "react";

export let candidateQueue: RTCIceCandidate[] = [];
export let remoteDescriptionSet = false;

interface UseClassroomSocketProps {
  url: string;
}

interface UseClassroomSocketReturns {
  sendMessage: (message: string) => void;
  peerConnection: RTCPeerConnection;
  peerConnections: { [id: string]: RTCPeerConnection };
}

const peerConnections: { [id: string]: RTCPeerConnection } = {};

const useClassroomSocket = ({
  url,
}: UseClassroomSocketProps): UseClassroomSocketReturns => {
  const socketRef = useRef<WebSocket | null>(null);
  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
    })
  );

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message, classroom socket is not open.");
    }
  }, []);

  const onMessage = useCallback(async (data: string) => {
    const message = JSON.parse(data);

    if (message.type === "offer") {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(message.data)
      );
      remoteDescriptionSet = true;

      while (candidateQueue.length > 0) {
        const candidate = candidateQueue.shift();
        if (candidate) {
          await peerConnection.current.addIceCandidate(candidate);
        }
      }

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      sendMessage(JSON.stringify({ type: "answer", data: answer }));
    } else if (message.type === "candidate") {
      const candidate = new RTCIceCandidate(message.data);

      if (remoteDescriptionSet) {
        await peerConnection.current.addIceCandidate(candidate);
      } else {
        candidateQueue.push(candidate);
      }

      await peerConnection.current.addIceCandidate(candidate);
    } else if (message.type === "answer") {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(message.data)
      );
      remoteDescriptionSet = true;

      while (candidateQueue.length > 0) {
        const candidate = candidateQueue.shift();
        if (candidate) {
          await peerConnection.current.addIceCandidate(candidate);
        }
      }
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
  }, [url, onMessage]);

  return {
    sendMessage,
    peerConnection: peerConnection.current,
    peerConnections,
  };
};

export default useClassroomSocket;
