import React, { FC, useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

import { VIDEO_SERVER_URL } from "../../constants/urls";
import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import useClassroomSocket from "../../hooks/useClassroomSocket";
import Layout from "../layout/layout";

import Controls from "./classroomComponents/controls";
import Videos from "./classroomComponents/videos";

const url = `${VIDEO_SERVER_URL}/?type=student&room=123`;

const Classroom: FC = () => {
  const intl = useIntl();
  const { getInfo, updateInfo } = useStudentContext();
  const { sendMessage, peerConnection } = useClassroomSocket({
    url,
  });
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [isRemoteStreamActive, setIsRemoteStreamActive] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDeviceLabel, setSelectedAudioDeviceLabel] =
    useState("Default");
  const [selectedAudioDeviceID, setSelectedAudioDeviceID] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceLabel, setSelectedVideoDeviceLabel] =
    useState("Default");
  const [selectedVideoDeviceID, setSelectedVideoDeviceID] = useState("");
  const [callSettingsAnchorEl, setCallSettingsAnchorEl] =
    useState<null | HTMLElement>(null);
  const [callSettingsMenuIsOpen, setCallSettingsMenuIsOpen] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage(JSON.stringify({ type: "candidate", data: event.candidate }));
    }
  };

  peerConnection.ontrack = (event) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
    setIsRemoteStreamActive(true);
  };
  peerConnection.onconnectionstatechange = () => {
    if (peerConnection.connectionState === "disconnected") {
      setIsRemoteStreamActive(false);
    }
  };

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
    const videoTrack = localStream.current?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  };
  const toggleAudio = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const handleSelectVideoDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: deviceId } },
        audio: { deviceId: { exact: selectedAudioDeviceID } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setSelectedVideoDeviceID(deviceId);
      setSelectedVideoDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting video stream with the selected device: ", // TODO: localize
        error
      );
    }
  };
  const handleSelectAudioDevice = async (deviceId: string, label: string) => {
    try {
      const constraints = {
        video: { deviceId: { exact: selectedVideoDeviceID } },
        audio: { deviceId: { exact: deviceId } },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setSelectedAudioDeviceID(deviceId);
      setSelectedAudioDeviceLabel(label);
    } catch (error) {
      console.error(
        "Error starting audio stream with the selected device: ", // TODO: localize
        error
      );
    }
  };

  const fetchDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioStreamDevices = devices.filter(
      (device) => device.kind === "audioinput"
    );
    const videoStreamDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setAudioDevices(audioStreamDevices);
    setSelectedAudioDeviceID(audioStreamDevices[0].deviceId);
    setSelectedAudioDeviceLabel(audioStreamDevices[0].label);
    setVideoDevices(videoStreamDevices);
    setSelectedVideoDeviceID(videoStreamDevices[0].deviceId);
    setSelectedVideoDeviceLabel(videoStreamDevices[0].label);
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
      stream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, stream);
      });
      setIsMicOn(true);
      setIsVideoOn(true);
      await fetchDevices();
    } catch (error) {
      console.error("Error starting media: ", error);
    }
  };

  const joinClass = async () => {
    if (!peerConnection) {
      return;
    }

    if (isCallStarted) {
      peerConnection.close();
      setIsCallStarted(false);
      setIsRemoteStreamActive(false);
      // TODO: send signal that the call is ended for other participants
    } else {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendMessage(JSON.stringify({ type: "offer", data: offer }));
      setIsCallStarted(true);
    }
  };

  useEffect(() => {
    startMedia();
  }, []);

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  return (
    <Layout title={intl.formatMessage({ id: "common_classroom" })}>
      <Videos
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isRemoteStreamActive={isRemoteStreamActive}
      />
      <Controls
        isCallStarted={isCallStarted}
        handleOpenCallSettingsMenu={handleOpenCallSettingsMenu}
        handleCloseCallSettingsMenu={handleCloseCallSettingsMenu}
        callSettingsAnchorEl={callSettingsAnchorEl}
        callSettingsMenuIsOpen={callSettingsMenuIsOpen}
        handleSelectVideoDevice={handleSelectVideoDevice}
        toggleVideo={toggleVideo}
        isVideoOn={isVideoOn}
        videoDevices={videoDevices}
        selectedVideoDeviceLabel={selectedVideoDeviceLabel}
        handleSelectAudioDevice={handleSelectAudioDevice}
        toggleAudio={toggleAudio}
        isMicOn={isMicOn}
        audioDevices={audioDevices}
        selectedAudioDeviceLabel={selectedAudioDeviceLabel}
        joinClass={joinClass}
      />
    </Layout>
  );
};

export default Classroom;
