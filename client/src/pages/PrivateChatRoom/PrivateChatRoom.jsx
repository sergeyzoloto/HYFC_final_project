import React, { useState, useEffect, useContext } from "react";
import Navbar from "../../components/NavBars/NavMain";
import UserList from "../../components/UserList";
import { MdSend } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import "./PrivateChatRoom.css";
import useGetPrivateChat from "../../hooks/useGetPrivateChat";
import Conversation from "../../components/Conversation";
import { AuthContext } from "../../context/AuthContext";
import useCreateMessage from "../../hooks/useCreateMessage";
import { logInfo } from "../../../../server/src/util/logging";

export const PrivateChatRoom = () => {
  const [webSocketConnection, setWebSocketConnection] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [textValue, setTextValue] = useState("");
  const { auth } = useContext(AuthContext);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { error, getPrivateChat, cancelPrivateChatFetch } =
    useGetPrivateChat(setChatId);

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:5000");
    setWebSocketConnection(webSocket);
    logInfo(webSocketConnection);
    webSocket.addEventListener("message", handleMessage);

    fetchUsers()
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch users:", error);
        setLoading(false);
      });

    return () => {
      webSocket.removeEventListener("message", handleMessage);
      webSocket.close();
    };
  }, []);

  const { createMessage } = useCreateMessage();

  const userId = auth.id;

  const handleMessage = (event) => {
    logInfo("New message:", event.data);
    // Handle incoming messages here
  };

  const handleTextChange = (event) => {
    setTextValue(event.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (textValue.trim().length === 0) {
      return;
    }

    const user = JSON.parse(localStorage.getItem("auth"));
    const newMessage = {
      user_id: user.id,
      message_text: textValue,
      chat_id: chatId,
    };

    try {
      createMessage(user, newMessage);
    } catch (error) {
      alert.error("Error sending message:", error);
    }

    setTextValue("");
  };

  const handleSendMessage = (e) => {
    sendMessage(e);
  };

  useEffect(() => {
    getPrivateChat(selectedUserId, userId);
  }, [selectedUserId]);

  useEffect(() => {
    return cancelPrivateChatFetch();
  }, []);

  useEffect(() => {
    if (error) {
      setChatId(null);
    }
  }, [error]);

  const handleUserClick = (id) => {
    setSelectedUserId(id);
  };

  async function fetchUsers() {
    try {
      const cachedUsers = getCachedUsers();
      if (cachedUsers) {
        return cachedUsers;
      }

      const response = await fetch("/api/users");
      const data = await response.json();

      cacheUsers(data);

      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  function getCachedUsers() {
    const cachedUsers = localStorage.getItem("cachedUsers");
    return cachedUsers ? JSON.parse(cachedUsers) : null;
  }

  function cacheUsers(users) {
    localStorage.setItem("cachedUsers", JSON.stringify(users));
  }

  return (
    <div>
      <Navbar />
      <div className="private-chat-page-container">
        <div className="users-list">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <UserList
              users={users}
              handleUserClick={handleUserClick}
              selectedUser={selectedUserId}
              avatarIcon={<FaUserCircle className="user-chat-icon" />}
            />
          )}
        </div>
        <div className="chat-section">
          <div className="chat-box">
            {!selectedUserId && (
              <div className="select-user-hint">
                Select a contact to continue
              </div>
            )}
            {chatId && <Conversation chatId={chatId} userId={userId} />}
          </div>
          {selectedUserId && (
            <div className="send-message-container">
              <textarea
                placeholder="Message"
                className="message-field"
                value={textValue}
                onChange={handleTextChange}
                required
              />
              <MdSend className="send-button" onClick={handleSendMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChatRoom;
