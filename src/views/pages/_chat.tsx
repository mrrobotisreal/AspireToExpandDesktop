import React, { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Grid } from "@mui/material";

import { useStudentContext } from "../../context/studentContext";
import useChat, { ChatUser, EmitSendMessageParams } from "../../hooks/useChat";
import Layout from "../layout/layout";

import ChatDialog from "./chatComponents/_chatDialog";
import ChatList from "./chatComponents/_chatList";
import ChatWindow from "./chatComponents/_chatWindow";

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useStudentContext();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const {
    isRegistering,
    emitCreateChatRoom,
    isCreatingChatRoom,
    emitListChats,
    areChatsLoading,
    emitListMessages,
    areMessagesLoading,
    emitSendMessage,
    emitReadMessages,
    chatSummaries,
    chatMessages,
  } = useChat();
  const [name, setName] = useState<string>("");
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);

  const handleChatSelect = (chatId: string, chatName: string) => {
    localStorage.setItem("selectedChat", chatId);
    setSelectedChat(chatId);
    if (!info.student_id) {
      console.error("Teacher ID not found");
    }
    setName(chatName);
    emitListMessages({ roomId: chatId, userId: info.student_id! });
  };

  const handleTextMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextMessage(event.target.value);
  };

  const handleClickAttach = () => {
    console.log("Attach clicked");
  };

  const handleClickSend = () => {
    if (!info.student_id) {
      console.error("Student ID not found");
    }
    const newMessage: EmitSendMessageParams = {
      roomId: selectedChat!,
      sender: {
        userId: info.student_id!,
        userType: "student",
        preferredName: info.preferred_name!,
        firstName: info.first_name!,
        lastName: info.last_name!,
        profilePictureUrl: info.profile_picture_url!,
      },
      message: textMessage,
      timestamp: Date.now(),
    };
    console.log("Sending message", JSON.stringify(newMessage, null, 2));
    emitSendMessage(newMessage);
    setTextMessage("");
  };

  const handleOpenStartNewChat = () => setIsStartNewChatOpen(true);
  const handleCloseStartNewChat = () => setIsStartNewChatOpen(false);
  const handleStartNewChat = (participants: ChatUser[], message: string) => {
    emitCreateChatRoom({
      sender: {
        userId: info.student_id!,
        userType: "teacher",
        preferredName: info.preferred_name!,
        firstName: info.first_name!,
        lastName: info.last_name!,
        profilePictureUrl: info.profile_picture_url || "",
      },
      participants,
      message,
      timestamp: Date.now(),
    });
    handleCloseStartNewChat();
  };

  useEffect(() => {
    localStorage.removeItem("selectedChat");
    localStorage.removeItem("createdChatRoomId");
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    const storedSelectedChat = localStorage.getItem("selectedChat");
    const storedCreatedChatRoomId = localStorage.getItem("createdChatRoomId");
    const storedCreatedChatRoomParticipants = localStorage.getItem(
      "createdChatRoomParticipants"
    );
    if (storedCreatedChatRoomId && storedCreatedChatRoomParticipants) {
      emitListChats({ userId: info.student_id! });
      const chatParticipants = JSON.parse(storedCreatedChatRoomParticipants);
      const chatName = chatParticipants
        .filter(
          (participant: ChatUser) => participant.userId !== info.student_id
        )
        .map((participant: ChatUser) => participant.preferredName)
        .join(", ");
      handleChatSelect(storedCreatedChatRoomId, chatName);
      localStorage.removeItem("createdChatRoomId");
      localStorage.removeItem("createdChatRoomParticipants");
    }

    if (
      selectedChat &&
      selectedChat === storedSelectedChat &&
      chatMessages.length > 0
    ) {
      emitReadMessages({
        chatId: selectedChat,
        unreadMessages: chatMessages,
      });
    }

    if (
      storedSelectedChat &&
      storedSelectedChat !== selectedChat &&
      chatMessages
    ) {
      setSelectedChat(storedSelectedChat);
    }
  }, [chatMessages, selectedChat]);

  return (
    <Layout title={intl.formatMessage({ id: "common_chat" })}>
      <Grid container sx={{ height: "84vh" }}>
        <Grid item xs={4} md={3}>
          <ChatList
            chats={chatSummaries}
            chatsAreLoading={isRegistering || areChatsLoading}
            onChatSelect={handleChatSelect}
            selectedChat={selectedChat}
            handleStartNewChat={handleOpenStartNewChat}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <ChatWindow
            selectedChat={selectedChat}
            messages={chatMessages}
            messagesAreLoading={areMessagesLoading || isCreatingChatRoom}
            name={name}
            textMessage={textMessage}
            handleTextMessageChange={handleTextMessageChange}
            handleClickAttach={handleClickAttach}
            handleClickSend={handleClickSend}
          />
        </Grid>
      </Grid>
      <ChatDialog
        isStartNewChatOpen={isStartNewChatOpen}
        handleCloseStartNewChat={handleCloseStartNewChat}
        handleStartNewChat={handleStartNewChat}
      />
    </Layout>
  );
};

export default Chat;
