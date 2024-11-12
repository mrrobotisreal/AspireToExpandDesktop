import React, { FC, useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  MicOffTwoTone,
  MicTwoTone,
  SettingsTwoTone,
  VideocamOffTwoTone,
  VideocamTwoTone,
} from "@mui/icons-material";

import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import Layout from "../layout/layout";
import Text from "../text/text";

const Classroom: FC = () => {
  const intl = useIntl();
  const { info } = useStudentContext();
  const { regularFont, heavyFont } = useThemeContext();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection>(
    new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
      ],
    })
  );
  const socket = new WebSocket("ws://localhost:9999/video");
  const localStream = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaStreamTrack[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("Default");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaStreamTrack[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("Default");
  const [isLocalVideoReady, setIsLocalVideoReady] = useState(false);
  const [isRemoteVideoReady, setIsRemoteVideoReady] = useState(false);
  const [callSettingsAnchorEl, setCallSettingsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [callSettingsMenuIsOpen, setCallSettingsMenuIsOpen] = useState(false);

  const handleOpenCallSettingsMenu = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setCallSettingsAnchorEl(event.currentTarget);
    setCallSettingsMenuIsOpen(true);
  };
  const handleCloseCallSettingsMenu = () => {
    setCallSettingsMenuIsOpen(false);
    setCallSettingsAnchorEl(null);
  };

  const toggleVideo = () => {
    console.log("Toggling video...");
    const videoTrack = localStream.current?.getVideoTracks()[0];
    console.log("Video track: ", videoTrack);

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };
  const toggleAudio = () => {
    console.log("Toggling audio...");
    const audioTrack = localStream.current?.getAudioTracks()[0];
    console.log("Audio track: ", audioTrack);

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const audioStreamDevices: MediaStreamTrack[] = stream.getAudioTracks();
      const videoStreamDevices: MediaStreamTrack[] = stream.getVideoTracks();
      setAudioDevices(audioStreamDevices);
      setSelectedAudioDevice(audioStreamDevices[0].label);
      setVideoDevices(videoStreamDevices);
      setSelectedVideoDevice(videoStreamDevices[0].label);
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
      setIsMicOn(true);
      setIsVideoOn(true);
    } catch (error) {
      console.error("Error starting media: ", error);
    }
  };

  useEffect(() => {
    socket.onmessage = async (message) => {
      console.log("Received message: ", message.data);
      const { event, payload } = JSON.parse(message.data);

      if (event === "offer") {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(payload)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.send(JSON.stringify({ event: "answer", payload: answer }));
      } else if (event === "answer") {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(payload)
        );
      } else if (event === "ice-candidate") {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(payload)
        );
      }
    };

    peerConnection.current.onicecandidate = (event) => {
      console.log("ICE candidate: ", event.candidate);
      if (event.candidate) {
        console.log("Sending ICE candidate...");
        socket.send(
          JSON.stringify({ event: "ice-candidate", payload: event.candidate })
        );
      }
    };

    peerConnection.current.ontrack = (event) => {
      const [stream] = event.streams;

      if (remoteVideoRef.current) {
        console.log("Setting remote video stream...");
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteStream(stream);
      setIsRemoteVideoReady(true);
    };

    startMedia();

    return () => {
      peerConnection.current.close();
      socket.close();
    };
  }, []);

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.send(JSON.stringify({ event: "offer", payload: offer }));
  };

  return (
    <Layout title={"Classroom"}>
      <Tooltip title="Alina's video" placement="top" arrow>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundColor: "darkgray",
            backgroundImage: `url("${__dirname}/src/assets/images/backgroundVideoImage.png")`,
          }}
        />
      </Tooltip>
      {/* {isRemoteVideoReady ? (
        <Tooltip title="Alina's video" placement="top" arrow>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              height: "38vh",
              width: "100%",
              border: "1px solid black",
              borderRadius: "6px",
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Alina's video" placement="top" arrow>
          <Box sx={{ mb: 0.5 }}>
            <Skeleton variant="rectangular" animation="wave" height="38vh" />
          </Box>
        </Tooltip>
      )} */}
      <Tooltip title="Your local video" placement="bottom" arrow>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          style={{
            height: "38vh",
            width: "100%",
            border: "1px solid black",
            borderRadius: "6px",
            backgroundColor: "darkgray",
            backgroundImage: `url("${__dirname}/src/assets/images/backgroundVideoImage.png")`,
          }}
        />
      </Tooltip>
      {/* {isLocalVideoReady ? (
        <Tooltip title="Your local video" placement="bottom" arrow>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{
              height: "38vh",
              width: "100%",
              border: "1px solid black",
              borderRadius: "6px",
            }}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Your local video" placement="bottom" arrow>
          <Box sx={{ mt: 0.5 }}>
            <Skeleton variant="rectangular" animation="wave" height="38vh" />
          </Box>
        </Tooltip>
      )} */}
      <Box padding={2}>
        <Stack direction="row" justifyContent="space-evenly">
          <IconButton
            id="call-settings-button"
            onClick={handleOpenCallSettingsMenu}
            size="large"
          >
            <SettingsTwoTone fontSize="large" />
          </IconButton>
          <Menu
            id="call-settings-menu"
            elevation={1}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            anchorEl={callSettingsAnchorEl}
            open={callSettingsMenuIsOpen}
            onClose={handleCloseCallSettingsMenu}
          >
            <Box padding={2}>
              <Text variant="h6" fontFamily={heavyFont}>
                Call settings
              </Text>
              <Divider sx={{ my: 0.5 }} />
              <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
                Video
              </Text>
              {videoDevices.map((device) => (
                <MenuItem key={device.label}>
                  <Text variant="body2" fontFamily={regularFont}>
                    {device.label === selectedVideoDevice
                      ? `✅ ${device.label}`
                      : device.label}
                  </Text>
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5 }} />
              <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
                Audio
              </Text>
              {audioDevices.map((device) => (
                <MenuItem key={device.label}>
                  <Text variant="body2" fontFamily={regularFont}>
                    {device.label === selectedAudioDevice
                      ? `✅ ${device.label}`
                      : device.label}
                  </Text>
                </MenuItem>
              ))}
            </Box>
          </Menu>
          <Tooltip title={selectedAudioDevice} placement="top" arrow>
            <IconButton size="large" onClick={toggleAudio}>
              {isMicOn ? (
                <MicTwoTone fontSize="large" />
              ) : (
                <MicOffTwoTone fontSize="large" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title={selectedVideoDevice} placement="top" arrow>
            <IconButton size="large" onClick={toggleVideo}>
              {isVideoOn ? (
                <VideocamTwoTone fontSize="large" />
              ) : (
                <VideocamOffTwoTone fontSize="large" />
              )}
            </IconButton>
          </Tooltip>
          <Button variant="contained" onClick={createOffer}>
            <Text variant="button" fontFamily={regularFont}>
              Join class
            </Text>
          </Button>
        </Stack>
      </Box>
    </Layout>
  );
};

export default Classroom;
