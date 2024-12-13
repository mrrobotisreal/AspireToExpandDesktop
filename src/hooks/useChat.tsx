import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { HTTP_CHAT_SERVER_URL, MAIN_SERVER_URL } from "../constants/urls";
import { useStudentContext } from "../context/studentContext";

export interface ChatUser {
  userId: string;
  userType: string;
  preferredName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  sender: ChatUser;
  content: string;
  timestamp: number;
  isReceived: boolean;
  isRead: boolean;
  isDeleted: boolean;
}

export interface Chat {
  chatId: string;
  participants: ChatUser[];
  messages: ChatMessage[];
}

export interface Chats {
  [chatId: string]: Chat;
}

export interface ChatSummary {
  chatId: string;
  participants: ChatUser[];
  latestMessage: ChatMessage;
}

interface EmitRegisterUserParams {
  userId: string;
  userType: string;
  preferredName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

interface EmitListChatsParams {
  userId: string;
}

interface EmitListMessagesParams {
  roomId: string;
  userId: string;
}

export interface EmitSendMessageParams {
  roomId: string;
  sender: ChatUser;
  message: string;
  timestamp: number;
}

export interface EmitReadMessagesParams {
  chatId: string;
  unreadMessages: ChatMessage[];
}

interface UseChatReturns {
  emitRegisterUser: (params: EmitRegisterUserParams) => void;
  isRegistering: boolean;
  emitListChats: (params: EmitListChatsParams) => void;
  areChatsLoading: boolean;
  emitListMessages: (params: EmitListMessagesParams) => void;
  areMessagesLoading: boolean;
  emitSendMessage: (params: EmitSendMessageParams) => void;
  emitReadMessages: (params: EmitReadMessagesParams) => void;
  chats: Chats;
  chatSummaries: ChatSummary[];
  chatMessages: ChatMessage[];
}

const useChat = (): UseChatReturns => {
  const { info, getInfo } = useStudentContext();
  const socketRef = useRef<Socket | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [chats, setChats] = useState<Chats>({});
  const [chatsList, setChatsList] = useState<Chat[]>([]);
  const [chatSummaries, setChatSummaries] = useState<ChatSummary[]>([]);
  const [areChatsLoading, setAreChatsLoading] = useState(false);
  const [areChatsLoaded, setAreChatsLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [areMessagesLoading, setAreMessagesLoading] = useState(false);

  // User registration
  const emitRegisterUser = (params: EmitRegisterUserParams) => {
    setIsRegistering(true);
    socketRef.current?.emit("registerUser", params);
  };
  const onUserRegistered = ({ userId }: { userId: string }) => {
    setIsRegistering(false);
    setIsRegistered(true);
    emitListChats({ userId });
  };
  const onRegisterUserError = (error: string) => {
    console.error("Error registering user:", error);
  };

  // Chats List
  const emitListChats = (params: EmitListChatsParams) => {
    setAreChatsLoading(true);
    setAreChatsLoaded(false);
    socketRef.current?.emit("listChatRooms", params);
  };
  const onChatsList = (chatsList: ChatSummary[]) => {
    const sortedChats = chatsList.toSorted(
      (a, b) => b.latestMessage.timestamp - a.latestMessage.timestamp // TODO: let backend sort this
    );
    setChatSummaries(sortedChats);
    setAreChatsLoading(false);
    setAreChatsLoaded(true);
  };
  const onListChatsError = (error: string) => {
    console.error("Error listing chats:", error);
  };

  // Messages List
  const emitListMessages = (params: EmitListMessagesParams) => {
    setAreMessagesLoading(true);
    socketRef.current?.emit("listMessages", params);
  };
  const onMessagesList = ({
    chatId,
    participants,
    messagesList,
  }: {
    chatId: string;
    participants: ChatUser[];
    messagesList: ChatMessage[];
  }) => {
    if (!chats[chatId]) {
      setChats({
        ...chats,
        [chatId]: {
          chatId,
          participants,
          messages: messagesList,
        },
      });
    } else {
      const newChats = {
        ...chats,
        [chatId]: {
          chatId,
          participants,
          messages: messagesList,
        },
      };
      setChats(newChats);
    }
    const selectedChat = localStorage.getItem("selectedChat");
    if (selectedChat && selectedChat === chatId) {
      setChatMessages(messagesList);
    }
    setAreMessagesLoading(false);
  };

  // Message Sending & Receiving
  const emitSendMessage = (params: EmitSendMessageParams) => {
    socketRef.current?.emit("sendMessage", params);
  };
  const emitReadMessages = (params: EmitReadMessagesParams) => {
    const { chatId, unreadMessages } = params;
    let studentId: string | undefined = info.student_id;
    // This is a workaround for the student_id not being available in the info object until I can track down where it's being overwritten
    if (!studentId) {
      console.log("No student_id...");
      console.log("Getting stored info...");
      const storedInfo = getInfo();
      studentId = storedInfo?.student_id;
      if (!studentId) {
        console.error("Sorry! No student_id! Exiting...");
        return;
      }
    }
    const unreadMessageIds: string[] = [];
    unreadMessages.forEach((msg) => {
      if (msg.sender.userId !== studentId && !msg.isRead) {
        unreadMessageIds.push(msg.messageId);
      }
    });
    if (!socketRef.current) {
      console.error("Socket not found");
      return;
    }
    socketRef.current?.emit("readMessages", {
      roomId: chatId,
      unreadMessages: unreadMessageIds,
    });
  };
  const onMessageReceived = (message: ChatMessage) => {}; // TODO: implement this
  const onMessageRead = (messageId: string) => {}; // TODO: implement this
  const onNewMessage = (incomingChat: Chat) => {
    const updatedChats = {
      ...chats,
      [incomingChat.chatId]: incomingChat,
    };
    setChats(updatedChats);
    socketRef.current?.emit("receiveMessage", incomingChat.messages[0]);
    const selectedChat = localStorage.getItem("selectedChat");
    if (selectedChat && selectedChat === incomingChat.chatId) {
      setChatMessages(incomingChat.messages);
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      const newSocket: Socket = io("http://localhost:11114");
      newSocket.on("userRegistered", onUserRegistered);
      newSocket.on("registerUserError", onRegisterUserError);
      newSocket.on("chatsList", onChatsList);
      newSocket.on("listChatsError", onListChatsError);
      newSocket.on("messagesList", onMessagesList);
      newSocket.on("messageReceived", onMessageReceived);
      newSocket.on("messageRead", onMessageRead);
      newSocket.on("newMessage", onNewMessage);
      socketRef.current = newSocket;
    }

    if (
      socketRef.current &&
      !isRegistered &&
      info.student_id &&
      info.preferred_name &&
      info.first_name &&
      info.last_name
    ) {
      emitRegisterUser({
        userId: info.student_id,
        userType: "student",
        preferredName: info.preferred_name,
        firstName: info.first_name,
        lastName: info.last_name,
        profilePictureUrl: info.profile_picture_url || "",
      });
    }

    if (socketRef.current && isRegistered && info.student_id) {
      emitListChats({ userId: info.student_id });
    }
  }, [
    info.student_id,
    info.preferred_name,
    info.first_name,
    info.last_name,
    info.profile_picture_url,
    socketRef.current,
    isRegistered,
  ]);

  return {
    emitRegisterUser,
    isRegistering,
    emitListChats,
    areChatsLoading,
    emitListMessages,
    areMessagesLoading,
    emitSendMessage,
    emitReadMessages,
    chats,
    chatSummaries,
    chatMessages,
  };
};

export default useChat;
