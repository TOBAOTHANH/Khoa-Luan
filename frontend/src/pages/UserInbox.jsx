import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { backend_url, server } from "../server";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import styles from "../styles/styles";
const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const UserInbox = () => {
  const { user, loading } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const resonse = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          {
            withCredentials: true,
          }
        );

        // Loại bỏ duplicate conversations dựa trên members
        // Nếu có nhiều conversation với cùng members (userId và sellerId), chỉ giữ lại conversation mới nhất
        const conversations = resonse.data.conversations || [];
        const uniqueConversations = [];
        const seenMembers = new Map();

        conversations.forEach((conv) => {
          // Tạo key từ members đã sắp xếp để so sánh
          const membersKey = conv.members.sort().join('_');
          
          if (!seenMembers.has(membersKey)) {
            seenMembers.set(membersKey, conv);
            uniqueConversations.push(conv);
          } else {
            // Nếu đã có conversation với cùng members, so sánh thời gian và giữ lại conversation mới hơn
            const existingConv = seenMembers.get(membersKey);
            const existingDate = new Date(existingConv.updatedAt || existingConv.createdAt || 0);
            const currentDate = new Date(conv.updatedAt || conv.createdAt || 0);
            
            if (currentDate > existingDate) {
              // Thay thế conversation cũ bằng conversation mới hơn
              const index = uniqueConversations.findIndex(c => c._id === existingConv._id);
              if (index !== -1) {
                uniqueConversations[index] = conv;
                seenMembers.set(membersKey, conv);
              }
            }
          }
        });

        setConversations(uniqueConversations);
      } catch (error) {
        // console.log(error);
      }
    };
    getConversation();
  }, [user, messages]);

  useEffect(() => {
    if (user) {
      const sellerId = user?._id;
      socketId.emit("addUser", sellerId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);

    return online ? true : false;
  };

  // get messages
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.log(error);
      }
    };
    getMessage();
  }, [currentChat]);

  // create new message
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    socketId.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        await axios
          .post(`${server}/message/create-new-message`, message)
          .then((res) => {
            setMessages([...messages, res.data.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      })
      .then((res) => {
        setNewMessage("");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleImageUpload = async (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setImages(reader.result);
        imageSendingHandler(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const imageSendingHandler = async (e) => {
    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socketId.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      images: e,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, {
          images: e,
          sender: user._id,
          text: newMessage,
          conversationId: currentChat._id,
        })
        .then((res) => {
          setImages();
          setMessages([...messages, res.data.message]);
          updateLastMessageForImage();
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessageForImage = async () => {
    await axios.put(
      `${server}/conversation/update-last-message/${currentChat._id}`,
      {
        lastMessage: "Photo",
        lastMessageId: user._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header luôn hiển thị */}
      <Header />
      
      <div className="flex h-[calc(100vh-140px)]">
        {/* Danh sách conversations - luôn hiển thị bên trái */}
        <div className="w-[350px] ml-20 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
          <div className="px-4 py-4 border-b border-gray-200">
            <h1 className="text-xl font-Poppins font-semibold text-gray-800">
              All Messages
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations && conversations.length > 0 ? (
              conversations.map((item, index) => (
                <MessageList
                  data={item}
                  key={index}
                  index={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={user?._id}
                  setUserData={setUserData}
                  userData={userData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
                  loading={loading}
                  currentChatId={currentChat?._id}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 px-4">
                <p className="text-lg">No conversations yet</p>
                <p className="text-sm mt-2">Start chatting with shops!</p>
              </div>
            )}
          </div>
        </div>

        {/* Khung chat bên phải */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {open && currentChat ? (
            <SellerInbox
              setOpen={setOpen}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessageHandler={sendMessageHandler}
              messages={messages}
              sellerId={user._id}
              userData={userData}
              activeStatus={activeStatus}
              scrollRef={scrollRef}
              handleImageUpload={handleImageUpload}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-xl font-semibold mb-2">Select a conversation</p>
                <p className="text-sm">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
  loading,
  currentChatId,
}) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const isActive = currentChatId === data._id;
  
  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/shop/get-shop-info/${userId}`);
        setUser(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 ${
        isActive ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
      } cursor-pointer`}
      onClick={(e) => {
        handleClick(data._id);
        setCurrentChat(data);
        setUserData(user);
        setActiveStatus(online);
      }}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${
          online ? 'border-green-400' : 'border-gray-300'
        }`}>
          <img
            src={`${backend_url}${user?.avatar?.public_id}`}
            alt={user?.name || "Shop"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
        {online && (
          <div className="w-3.5 h-3.5 bg-green-500 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
        )}
      </div>
      <div className="pl-4 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-gray-800 truncate">{user?.name || "Shop"}</h1>
          {data?.lastMessage && (
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {format(data.updatedAt || data.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">
          {!loading && data?.lastMessageId !== userData?._id
            ? <span className="text-blue-600 font-medium">You: </span>
            : <span className="text-gray-500">{userData?.name?.split(" ")[0] || "Shop"}: </span>}
          {data?.lastMessage || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* message header - Profile User đẹp hơn - CỐ ĐỊNH */}
      <div className="w-full bg-white shadow-sm border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar với border đẹp */}
              <div className="relative">
                <div className={`w-16 h-16 rounded-full overflow-hidden border-4 ${
                  activeStatus ? 'border-green-400' : 'border-gray-300'
                } shadow-lg`}>
                  <img
                    src={`${backend_url}${userData?.avatar?.public_id}`}
                    alt={userData?.name || "Shop"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                {/* Online status indicator */}
                {activeStatus && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                )}
              </div>
              
              {/* Shop Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-800">{userData?.name || "Shop"}</h1>
                  {activeStatus ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                      Online
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                      Offline
                    </span>
                  )}
                </div>
                {userData?.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{userData.description}</p>
                )}
                {userData?.address && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-1">📍</span>
                    {userData.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* messages container - CHỈ PHẦN NÀY CUỘN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* messages - có thể cuộn */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
          {messages && messages.length > 0 ? (
            messages.map((item, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  item.sender === sellerId ? "justify-end" : "justify-start"
                }`}
                ref={index === messages.length - 1 ? scrollRef : null}
              >
                <div className={`flex items-end space-x-2 max-w-[70%] ${
                  item.sender === sellerId ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  {/* Avatar chỉ hiển thị cho tin nhắn của shop */}
                  {item.sender !== sellerId && (
                    <img
                      src={`${backend_url}${userData?.avatar?.url}`}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt={userData?.name || "Shop"}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  )}
                  
                  {/* Message content */}
                  <div className={`flex flex-col ${
                    item.sender === sellerId ? "items-end" : "items-start"
                  }`}>
                    {item.images && (
                      <div className="mb-2">
                        <img
                          src={`${item.images?.url}`}
                          className="max-w-[300px] max-h-[300px] object-cover rounded-lg shadow-md"
                          alt="Shared image"
                        />
                      </div>
                    )}
                    {item.text !== "" && (
                      <div className="space-y-1">
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm ${
                            item.sender === sellerId
                              ? "bg-blue-600 text-white rounded-tr-sm"
                              : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{item.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 px-2 ${
                          item.sender === sellerId ? "text-right" : "text-left"
                        }`}>
                          {format(item.createdAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-lg">No messages yet</p>
                <p className="text-sm mt-2">Start the conversation!</p>
              </div>
            </div>
          )}
        </div>

        {/* send message input - CỐ ĐỊNH */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          <form
            aria-required={true}
            className="flex items-center space-x-3"
            onSubmit={sendMessageHandler}
          >
            {/* Image upload button */}
            <label htmlFor="image" className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors">
              <input
                type="file"
                name=""
                id="image"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
              <TfiGallery className="text-gray-600" size={24} />
            </label>
            
            {/* Message input */}
            <div className="flex-1 relative">
              <input
                type="text"
                required
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                <AiOutlineSend size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserInbox;
