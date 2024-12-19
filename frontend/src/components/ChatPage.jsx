import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "../redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import axios from "axios";
import { setMessages } from "../redux/chatSlice";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    try {
      const BASE_URL = import.meta.env.VITE_SERVER_URL;
      const res = await axios.post(
        `${BASE_URL}/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-screen w-full">
      {/* Sidebar */}
      <div className="w-full md:w-1/2 lg:w-1/3 pr-8 border-r border-gray-300 overflow-y-auto h-[40vh] md:h-full">
        <h1 className="font-bold text-lg mb-4">{user?.username}</h1>
        <hr className="mb-4 border-gray-300 w-full" />
        <div className="space-y-4">
          {suggestedUsers.map((suggestedUser, index) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={index}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer rounded-md"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{suggestedUser?.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div className="flex w-full flex-col flex-1 h-full">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{selectedUser?.username}</span>
            </div>
          </div>

          {/* Messages Section */}
          <div className="flex-1 overflow-y-auto p-4">
            <Messages selectedUser={selectedUser} />
          </div>

          {/* Input Section */}
          <div className="flex items-center p-4 border-t border-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Type a message..."
            />
            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center justify-center flex-1 p-8">
          <MessageCircleCode className="w-32 h-32 mb-4 text-gray-500" />
          <h1 className="font-medium text-lg">Your messages</h1>
          <span className="text-sm text-gray-500">
            Send a message to start a chat.
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
