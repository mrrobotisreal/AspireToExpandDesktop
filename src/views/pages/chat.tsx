import React, { FC, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
  Avatar,
  Box,
  Divider,
  Grid,
  Grid2,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";
import { AttachFileTwoTone, SendTwoTone } from "@mui/icons-material";

import { useChatContext, Chat, ChatMessage } from "../../context/chatContext";
import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import Layout from "../layout/layout";
import Text from "../text/text";

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: string) => void;
  selectedChat: string | null;
  preferredName: string;
  font: string;
  primaryColor: string;
  backgroundColor: string;
  borderColor: string;
}

const ChatList: FC<ChatListProps> = ({
  chats,
  onChatSelect,
  selectedChat,
  preferredName,
  font,
  primaryColor,
  backgroundColor,
  borderColor,
}) => {
  return (
    <Box
      sx={{
        pt: 1,
        pb: 1,
        position: "relative",
        height: "77vh",
        maxHeight: "77vh",
      }}
    >
      <Box
        sx={{
          backgroundColor: primaryColor,
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
        }}
      >
        <Text
          variant="h6"
          fontFamily={font}
          fontWeight="bold"
          textAlign="center"
        >
          Recent Chats
        </Text>
      </Box>
      <Divider />
      <Box
        sx={{
          overflowY: "auto",
          maxHeight: "74vh",
          backgroundColor,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          borderLeft: `1px solid ${borderColor}`,
          borderRadius: "0 0 6px 6px",
          height: "74vh",
        }}
      >
        <List>
          {chats.map((chat) => {
            return (
              <Box key={chat.chatID}>
                <ListItemButton
                  selected={selectedChat === chat.chatID}
                  onClick={() => onChatSelect(chat.chatID)}
                >
                  <ListItemText
                    primary={
                      <Text
                        fontFamily={font}
                        fontWeight="bold"
                        textOverflow="ellipsis"
                        noWrap
                      >
                        {chat.to === preferredName
                          ? chat.mostRecentMessage.from
                          : chat.to}
                      </Text>
                    }
                    secondary={
                      <Text fontFamily={font} textOverflow="ellipsis" noWrap>
                        {chat.mostRecentMessage.content}
                      </Text>
                    }
                  />
                </ListItemButton>
                <Divider />
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );
};

interface ChatWindowProps {
  selectedChat: string | null;
  messages: ChatMessage[];
  preferredName: string;
  name: string;
  toID: string;
  textMessage: string;
  handleTextMessageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickAttach: () => void;
  handleClickSend: (name: string, toID: string) => void;
  externalChatBackgroundColor: string;
}

const ChatWindow: FC<ChatWindowProps> = ({
  selectedChat,
  messages,
  preferredName,
  name,
  toID,
  textMessage,
  handleTextMessageChange,
  handleClickAttach,
  handleClickSend,
  externalChatBackgroundColor,
}) => {
  return (
    <Box sx={{ pl: 2, pt: 1, pb: 1 }}>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          height: "72vh",
          overflowY: "auto",
          width: "100%",
          backgroundColor: "#f7f7f7",
        }}
      >
        {messages.length ? (
          <>
            {messages.map((msg, index) => {
              const date = new Date(msg.time);
              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      msg.from === preferredName ? "flex-end" : "flex-start",
                    mb: 1,
                    width: "100%",
                  }}
                >
                  <Paper
                    sx={{
                      p: 1,
                      borderRadius: "6px",
                      maxWidth: "50%",
                      backgroundColor:
                        msg.from === preferredName
                          ? "background.default"
                          : externalChatBackgroundColor,
                    }}
                  >
                    <Text>
                      <strong>{msg.from}:</strong> {msg.content}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}
                    </Text>
                  </Paper>
                </Box>
              );
            })}
          </>
        ) : (
          <Text color="textSecondary" align="center">
            Select a chat to start messaging
          </Text>
        )}
      </Paper>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          border: "1px solid #ddd",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          backgroundColor: "#f7f7f7",
        }}
      >
        <IconButton
          disabled={!Boolean(selectedChat)}
          onClick={handleClickAttach}
        >
          <AttachFileTwoTone />
        </IconButton>
        <TextField
          variant="outlined"
          fullWidth
          size="small"
          multiline
          maxRows={4}
          placeholder="Type a message..."
          sx={{ ml: 1, mr: 1 }}
          disabled={!Boolean(selectedChat)}
          value={textMessage}
          onChange={handleTextMessageChange}
        />
        <IconButton
          disabled={!Boolean(selectedChat)}
          onClick={() => handleClickSend(name, toID)}
          color="primary"
        >
          <SendTwoTone />
        </IconButton>
      </Box>
    </Box>
  );
};

const Chat: FC = () => {
  const intl = useIntl();
  const { info, getInfo, updateInfo } = useStudentContext();
  const { theme, themeCustom, regularFont, heavyFont } = useThemeContext();
  const {
    chats: _chats,
    fetchChats,
    messages: _messages,
    fetchMessages,
    sendMessage,
  } = useChatContext();
  const chats = useMemo(() => _chats, [_chats]);
  const messages = useMemo(() => _messages, [_messages]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState<string>("");

  const handleChatSelect = (chatID: string) => {
    setSelectedChat(chatID);
  };

  const getNameAndID = () => {
    if (selectedChat && chats.length) {
      const chat = chats.find((chat) => chat.chatID === selectedChat)!;
      return {
        name:
          chat.to === info.preferredName
            ? chat.mostRecentMessage.from
            : chat.to,
        toID:
          chat.toID === info.studentId
            ? chat.mostRecentMessage.fromID
            : chat.toID,
      };
    } else {
      return {
        name: "",
        toID: "",
      };
    }
  };
  const { name, toID } = getNameAndID();

  const handleTextMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTextMessage(event.target.value);
  };

  const handleClickAttach = () => {
    console.log("Attach clicked");
  };

  const handleClickSend = (name: string, toID: string) => {
    console.log("handling send...");
    const message = {
      from: info.preferredName!,
      fromID: info.studentId!,
      to: name,
      toID: toID,
      content: textMessage.trim(),
      time: Date.now(),
    };
    sendMessage(message);
    setTextMessage("");
  };

  useEffect(() => {
    const storedStudentInfo = getInfo();

    // TODO: Remove this useEffect in production;
    // This is just for testing purposes to keep info updated during refreshes
    if (storedStudentInfo) {
      updateInfo(storedStudentInfo);
    }
  }, []);

  useEffect(() => {
    if (info.studentId && selectedChat) {
      fetchMessages(selectedChat!);
    } else if (info.studentId) {
      fetchChats(info.studentId!);
    }
  }, [info, selectedChat]);

  return (
    <Layout title={intl.formatMessage({ id: "common_chat" })}>
      <Text variant="h4" fontFamily={heavyFont}>
        {intl.formatMessage({ id: "common_chat" })}
      </Text>
      <Text variant="body1" fontFamily={regularFont}>
        {intl.formatMessage({ id: "chat_description" })}
      </Text>
      <Grid container sx={{ height: "77vh" }}>
        <Grid item xs={4} md={3}>
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
            selectedChat={selectedChat}
            preferredName={info.preferredName!}
            font={regularFont}
            primaryColor={theme.palette.primary.light}
            backgroundColor={themeCustom.palette.background.main}
            borderColor={themeCustom.palette.background.border}
          />
        </Grid>
        <Grid item xs={8} md={9}>
          <ChatWindow
            selectedChat={selectedChat}
            messages={messages}
            preferredName={info.preferredName!}
            name={name}
            toID={toID}
            textMessage={textMessage}
            handleTextMessageChange={handleTextMessageChange}
            handleClickAttach={handleClickAttach}
            handleClickSend={handleClickSend}
            externalChatBackgroundColor={theme.palette.primary.light}
          />
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Chat;
