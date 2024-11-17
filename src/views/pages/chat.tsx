import React, { FC, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import {
  Autocomplete,
  // Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  Grid,
  Grid2,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  AddCircle,
  AttachFileTwoTone,
  FindInPage,
  Send,
  SendTwoTone,
} from "@mui/icons-material";

import { useChatContext, Chat, ChatMessage } from "../../context/chatContext";
import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import CircularLoading from "../loading/circular";
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
  handleStartNewChat: () => void;
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
  handleStartNewChat,
}) => {
  return (
    <Box
      sx={{
        pt: 1,
        pb: 1,
        position: "relative",
        height: "80vh",
        maxHeight: "80vh",
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
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "space-evenly",
          border: "1px solid #ddd",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
          backgroundColor: "#b7b7b7",
        }}
      >
        <Tooltip title="Search chats" placement="top" arrow>
          <IconButton color="secondary">
            <FindInPage />
          </IconButton>
        </Tooltip>
        <Tooltip title="Create new chat" placement="top" arrow>
          <IconButton color="secondary" onClick={handleStartNewChat}>
            <AddCircle />
          </IconButton>
        </Tooltip>
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
  textControlsBackgroundColor: string;
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
  textControlsBackgroundColor,
}) => {
  return (
    <Box sx={{ pl: 2, pt: 1, pb: 1 }}>
      <Paper
        sx={{
          flex: 1,
          p: 2,
          height: "78vh",
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
          backgroundColor: textControlsBackgroundColor,
        }}
      >
        <IconButton
          disabled={!Boolean(selectedChat)}
          onClick={handleClickAttach}
          color="secondary"
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
          sx={{ ml: 1, mr: 1, backgroundColor: "#ffffff", borderRadius: "6px" }}
          disabled={!Boolean(selectedChat)}
          value={textMessage}
          onChange={handleTextMessageChange}
        />
        <IconButton
          disabled={!Boolean(selectedChat)}
          onClick={() => handleClickSend(name, toID)}
          color="secondary"
        >
          <Send />
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
    students,
    fetchAllStudents,
  } = useChatContext();
  const chats = useMemo(() => _chats, [_chats]);
  const messages = useMemo(() => _messages, [_messages]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [textMessage, setTextMessage] = useState<string>("");
  const [isStartNewChatOpen, setIsStartNewChatOpen] = useState<boolean>(false);
  const [isStartNewChatAutocompleteOpen, setIsStartNewChatAutocompleteOpen] =
    useState<boolean>(false);
  const [studentsAreLoading, setStudentsAreLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<string[]>([]);

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

  const handleOpenStartNewChat = () => setIsStartNewChatOpen(true);
  const handleCloseStartNewChat = () => setIsStartNewChatOpen(false);

  const handleOpenStartNewChatAutocomplete = async () => {
    // setAllStudents(["Alina", "Koala", "Koalita"]);
    setIsStartNewChatAutocompleteOpen(true);
    try {
      setStudentsAreLoading(true);
      const fetchedStudents = await fetchAllStudents();
      setAllStudents(fetchedStudents);
      setStudentsAreLoading(false);
    } catch (error) {
      console.error("Error fetching students: ", error);
      setStudentsAreLoading(false);
    }
  };
  const handleCloseStartNewChatAutocomplete = () => {
    setIsStartNewChatAutocompleteOpen(false);
    setAllStudents([]);
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
      <Grid container sx={{ height: "84vh" }}>
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
            handleStartNewChat={handleOpenStartNewChat}
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
            textControlsBackgroundColor={"#b7b7b7"}
          />
        </Grid>
      </Grid>
      <Dialog open={isStartNewChatOpen} onClose={handleCloseStartNewChat}>
        <DialogTitle>
          <Text variant="h6" fontFamily={heavyFont}>
            Start a new chat
          </Text>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ minWidth: 450 }}>
          <DialogContentText>
            <Text variant="body1" fontFamily={regularFont} fontWeight="bold">
              Select a user to start a new chat with:
            </Text>
          </DialogContentText>
          <Autocomplete
            sx={{ minWidth: 300 }}
            open={isStartNewChatAutocompleteOpen}
            onOpen={handleOpenStartNewChatAutocomplete}
            onClose={handleCloseStartNewChatAutocomplete}
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option: string) => option}
            options={allStudents}
            loading={studentsAreLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search for a user..."
                variant="outlined"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {studentsAreLoading ? <CircularLoading /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStartNewChat} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCloseStartNewChat}
            variant="contained"
            color="primary"
          >
            Start chat
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Chat;
