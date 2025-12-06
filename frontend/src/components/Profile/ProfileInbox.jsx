import React, { useEffect, useRef, useState } from "react";
import { backend_url, server } from "../../server";
import axios from "axios";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import { AiOutlineSend, AiOutlineMessage } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { RxCross1 } from "react-icons/rx";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import ImageModal from "../Common/ImageModal";
import { toast } from "react-toastify";

const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

// Helper function to format image URL
const getImageUrl = (image) => {
  if (!image) return null;
  
  // If image is an object with url property
  let imageUrl = image?.url || image;
  
  // If image is an array, get first element
  if (Array.isArray(imageUrl)) {
    imageUrl = imageUrl[0];
  }
  
  // If it's base64 (starts with data:image/)
  if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // If already a full URL (starts with http:// or https://)
  if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  
  // If it's a relative path, add backend_url
  if (typeof imageUrl === 'string' && imageUrl.length > 0) {
    // Remove leading slash if exists to avoid double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${backend_url}${cleanPath}`;
  }
  
  return imageUrl;
};

const ProfileInbox = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleGetMessage = (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text || "",
        images: data.images || null,
        createdAt: Date.now(),
      });
    };
    
    socketId.on("getMessage", handleGetMessage);
    
    return () => {
      socketId.off("getMessage", handleGetMessage);
    };
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          { withCredentials: true }
        );

        const conversations = response.data.conversations || [];
        const uniqueConversations = [];
        const seenMembers = new Map();

        conversations.forEach((conv) => {
          const membersKey = conv.members.sort().join('_');
          
          if (!seenMembers.has(membersKey)) {
            seenMembers.set(membersKey, conv);
            uniqueConversations.push(conv);
          } else {
            const existingConv = seenMembers.get(membersKey);
            const existingDate = new Date(existingConv.updatedAt || existingConv.createdAt || 0);
            const currentDate = new Date(conv.updatedAt || conv.createdAt || 0);
            
            if (currentDate > existingDate) {
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
        console.log(error);
      }
    };
    if (user?._id) {
      getConversation();
    }
  }, [user, messages]);

  useEffect(() => {
    if (user?._id) {
      socketId.emit("addUser", user._id);
      
      const handleGetUsers = (data) => {
        setOnlineUsers(data);
      };
      
      socketId.on("getUsers", handleGetUsers);
      
      return () => {
        socketId.off("getUsers", handleGetUsers);
      };
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((u) => u.userId === chatMembers);
    return online ? true : false;
  };

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
    if (currentChat?._id) {
      getMessage();
    }
  }, [currentChat]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();

    if (!currentChat) {
      toast.error("Vui lòng chọn cuộc trò chuyện!");
      return;
    }

    // Nếu chỉ có hình ảnh, đã được xử lý trong handleImageUpload
    if (images && !newMessage.trim()) {
      return;
    }

    // Nếu không có nội dung và không có hình ảnh, không gửi
    if (!newMessage.trim() && !images) {
      toast.error("Vui lòng nhập tin nhắn hoặc chọn hình ảnh!");
      return;
    }

    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    if (!receiverId) {
      toast.error("Không tìm thấy người nhận!");
      return;
    }

    const message = {
      sender: user?._id,
      text: newMessage,
      conversationId: currentChat?._id,
      images: images,
    };

    socketId.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
      images: images,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, message, {
          withCredentials: true,
        })
        .then((res) => {
          setMessages([...messages, res.data.message]);
          updateLastMessage();
        });
    } catch (error) {
      console.log(error);
      toast.error("Gửi tin nhắn thất bại!");
    }
  };

  const updateLastMessage = async () => {
    if (!currentChat) return;
    try {
      await axios
        .put(`${server}/conversation/update-last-message/${currentChat?._id}`, {
          lastMessage: newMessage || "Photo",
          lastMessageId: user?._id,
        }, {
          withCredentials: true,
        })
        .then((res) => {
          setNewMessage("");
          setImages();
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageUpload = async (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setImages(reader.result);
        if (currentChat) {
          imageSendingHandler(reader.result);
        }
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const imageSendingHandler = async (imageData) => {
    if (!currentChat) return;

    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    if (!receiverId) {
      toast.error("Không tìm thấy người nhận!");
      return;
    }

    socketId.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      images: imageData,
      text: "",
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, {
          images: imageData,
          sender: user?._id,
          text: newMessage || "",
          conversationId: currentChat?._id,
        }, {
          withCredentials: true,
        })
        .then((res) => {
          setImages();
          setMessages([...messages, res.data.message]);
          updateLastMessageForImage();
        });
    } catch (error) {
      console.log(error);
      toast.error("Gửi hình ảnh thất bại!");
    }
  };

  const updateLastMessageForImage = async () => {
    if (!currentChat) return;
    try {
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat?._id}`,
        {
          lastMessage: "Photo",
          lastMessageId: user?._id,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full min-h-[600px] bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl shadow-xl overflow-hidden">
      <div className="flex h-[calc(100vh-200px)]">
        {/* Conversation List */}
        <div className="w-[380px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-5 border-b border-purple-400">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <HiOutlineChatAlt2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Hộp Thư
                </h1>
                <p className="text-xs text-purple-100">
                  {conversations.length} cuộc trò chuyện
                </p>
              </div>
            </div>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {conversations && conversations.length > 0 ? (
              conversations.map((item, index) => (
                <InboxMessageList
                  data={item}
                  key={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={user?._id}
                  setUserData={setUserData}
                  userData={userData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
                  currentChatId={currentChat?._id}
                />
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <AiOutlineMessage className="text-purple-500" size={40} />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Chưa có cuộc trò chuyện nào</p>
                <p className="text-sm text-gray-500">Bắt đầu trò chuyện với shop ngay!</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-white">
          {open && currentChat ? (
            <InboxChatBox
              setOpen={setOpen}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessageHandler={sendMessageHandler}
              messages={messages}
              userId={user?._id}
              userData={userData}
              activeStatus={activeStatus}
              scrollRef={scrollRef}
              handleImageUpload={handleImageUpload}
              setSelectedImage={setSelectedImage}
              setImageModalOpen={setImageModalOpen}
              imageModalOpen={imageModalOpen}
              selectedImage={selectedImage}
              images={images}
              getImageUrl={getImageUrl}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <HiOutlineChatAlt2 className="text-purple-600" size={48} />
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-2">Chọn cuộc trò chuyện</p>
                <p className="text-gray-600">Chọn một cuộc trò chuyện từ bên trái để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage}
      />
    </div>
  );
};

const InboxMessageList = ({
  data,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  userData,
  online,
  setActiveStatus,
  currentChatId,
}) => {
  const [shop, setShop] = useState(null);
  const isActive = currentChatId === data._id;

  useEffect(() => {
    const shopId = data.members.find((member) => member !== me);
    const getShop = async () => {
      try {
        const res = await axios.get(`${server}/shop/get-shop-info/${shopId}`);
        setShop(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    if (shopId) {
      getShop();
    }
  }, [me, data]);

  return (
    <div
      className={`w-full flex items-center p-4 transition-all duration-200 border-b border-gray-100 cursor-pointer group ${
        isActive 
          ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-l-purple-500 shadow-sm" 
          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/30"
      }`}
      onClick={() => {
        setOpen(true);
        setCurrentChat(data);
        setUserData(shop);
        setActiveStatus(online);
      }}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-14 h-14 rounded-full overflow-hidden border-[3px] shadow-md transition-all duration-200 ${
          online 
            ? 'border-green-400 ring-2 ring-green-200' 
            : 'border-gray-300'
        } ${isActive ? 'ring-2 ring-purple-200' : ''}`}>
          <img
            src={`${backend_url}${shop?.avatar?.public_id}`}
            alt={shop?.name || "Shop"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        </div>
        {online && (
          <div className="w-4 h-4 bg-green-500 rounded-full absolute bottom-0 right-0 border-[3px] border-white shadow-md animate-pulse"></div>
        )}
      </div>
      <div className="pl-4 flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className={`text-base font-bold truncate ${
            isActive ? 'text-purple-700' : 'text-gray-800 group-hover:text-purple-600'
          }`}>
            {shop?.name || "Shop"}
          </h1>
          {data?.lastMessage && (
            <span className={`text-xs ml-2 flex-shrink-0 ${
              isActive ? 'text-purple-600' : 'text-gray-500'
            }`}>
              {format(data.updatedAt || data.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm truncate">
          {data?.lastMessageId !== me ? (
            <span className="text-gray-600">{shop?.name?.split(" ")[0] || "Shop"}: </span>
          ) : (
            <span className="text-purple-600 font-semibold">Bạn: </span>
          )}
          <span className={isActive ? 'text-gray-700' : 'text-gray-600'}>
            {data?.lastMessage || "Chưa có tin nhắn"}
          </span>
        </p>
      </div>
    </div>
  );
};

const InboxChatBox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  userId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
  setSelectedImage,
  setImageModalOpen,
  imageModalOpen,
  selectedImage,
  images,
  getImageUrl,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg border-b border-purple-400 flex-shrink-0 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full overflow-hidden border-4 ${
                  activeStatus ? 'border-green-400 ring-2 ring-green-200' : 'border-white'
                } shadow-xl transition-all duration-200`}>
                  <img
                    src={`${backend_url}${userData?.avatar?.public_id}`}
                    alt={userData?.name || "Shop"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                </div>
                {activeStatus && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-[3px] border-white shadow-lg animate-pulse"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-bold text-white">{userData?.name || "Shop"}</h1>
                  {activeStatus ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md flex items-center space-x-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-semibold rounded-full">
                      Offline
                    </span>
                  )}
                </div>
                {userData?.address && (
                  <p className="text-xs text-purple-100 mt-1 flex items-center">
                    <span className="mr-1">📍</span>
                    {userData.address}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 group"
            >
              <RxCross1 size={24} className="text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex w-full ${
                item.sender === userId ? "justify-end" : "justify-start"
              }`}
              ref={index === messages.length - 1 ? scrollRef : null}
            >
              {item.sender !== userId && (
                <img
                  src={`${backend_url}${userData?.avatar?.public_id}`}
                  className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0 border-2 border-white shadow-md"
                  alt={userData?.name || "Shop"}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              )}
              <div className={`flex flex-col max-w-[70%] ${
                item.sender === userId ? "items-end" : "items-start"
              }`}>
                {item.images && (
                  <div className="mb-2 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={getImageUrl(item.images)}
                      className="max-w-[300px] max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity border-2 border-gray-200 rounded-lg"
                      alt="Hình ảnh được chia sẻ"
                      onClick={() => {
                        setSelectedImage(getImageUrl(item.images));
                        setImageModalOpen(true);
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        if (!e.target.src.includes('placeholder')) {
                          e.target.src = "https://via.placeholder.com/300?text=Error+Loading+Image";
                        }
                        e.target.onerror = null; // Prevent infinite loop
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">📷 Nhấn để xem ảnh lớn</p>
                  </div>
                )}
                {item.text && (
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md ${
                      item.sender === userId
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                    }`}
                  >
                    <p className="break-words text-sm leading-relaxed">{item.text}</p>
                  </div>
                )}
                <p className={`text-xs mt-1.5 px-2 ${
                  item.sender === userId ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {format(item.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
              <AiOutlineMessage className="text-purple-500" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Chưa có tin nhắn nào</p>
            <p className="text-sm text-gray-400 mt-1">Bắt đầu cuộc trò chuyện!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        className="p-4 relative w-full flex items-center border-t border-gray-200 bg-white shadow-lg"
        onSubmit={sendMessageHandler}
      >
        <input
          type="file"
          id="image"
          className="hidden"
          onChange={handleImageUpload}
        />
        <label htmlFor="image" className="flex-shrink-0 mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer group">
          <TfiGallery className="text-gray-600 group-hover:text-purple-600 transition-colors" size={24} />
        </label>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Nhập tin nhắn của bạn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-gray-50 focus:bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={!newMessage && !images}
          className="flex-shrink-0 ml-3 p-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <AiOutlineSend size={22} />
        </button>
      </form>
    </div>
  );
};

export default ProfileInbox;

