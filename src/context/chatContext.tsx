import React, {
  FC,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";

import { HTTP_CHAT_SERVER_URL } from "../constants/urls";

export interface ChatMessage {
  from: string;
  fromID: string;
  to: string;
  toID: string;
  content: string;
  time: number;
}

export interface Chat {
  chatID: string;
  to: string;
  toID: string;
  mostRecentMessage: ChatMessage;
}

const getChatID = (message: ChatMessage): string => {
  if (message.fromID < message.toID) {
    return `${message.fromID}_${message.toID}`;
  }
  return `${message.toID}_${message.fromID}`;
};

interface ChatContextProps {
  chats: Chat[];
  fetchChats: (studentId: string) => void;
  messages: ChatMessage[];
  fetchMessages: (chatId: string) => void;
  sendMessage: (message: ChatMessage) => void;
  // TODO: implement search for users
}

const ChatContext = createContext<ChatContextProps>({
  chats: [],
  fetchChats: async (studentId: string) => {},
  messages: [],
  fetchMessages: async (chatId: string) => {},
  sendMessage: async (message: ChatMessage) => {},
});

export const useChatContext = () => useContext<ChatContextProps>(ChatContext);

const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const fetchChats = async (studentId: string) => {
    try {
      const response = await fetch(
        `${HTTP_CHAT_SERVER_URL}/chats?studentID=${studentId}`
      );
      const data = await response.json();
      const sortedData = data.sort((a: Chat, b: Chat) => {
        if (a.mostRecentMessage.time > b.mostRecentMessage.time) return -1;
        if (a.mostRecentMessage.time < b.mostRecentMessage.time) return 1;
        return 0;
      });

      setChats(sortedData);

      localStorage.setItem("chats", JSON.stringify(sortedData));
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId: string, page = 1) => {
    // TODO: Implement pagination
    try {
      const response = await fetch(
        `${HTTP_CHAT_SERVER_URL}/messages?chatID=${chatId}&limit=50&page=${page}`
      );
      const data = await response.json();

      setMessages(data);

      // TODO: Implement pagination and syncing with the server
      const key = `messages_${chatId}_${page}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = (message: ChatMessage) => {
    const chatId = getChatID(message);
    const updatedMessages = [...messages, message];
    const key = `messages_${chatId}_1`; // TODO: Implement pagination

    window.electronAPI.sendMessage(message);
    setMessages(updatedMessages);
    localStorage.setItem(key, JSON.stringify(updatedMessages));
  };

  const values = {
    chats,
    fetchChats,
    messages,
    fetchMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={values}>{children}</ChatContext.Provider>;
};

export default ChatProvider;
