import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import styles from "../../styles/styles";
import { TfiGallery } from "react-icons/tfi";
import socketIO from "socket.io-client";
import { format } from "timeago.js";
import ImageModal from "../Common/ImageModal";
const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const DashboardMessages = () => {
  const { seller, isLoading } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [images, setImages] = useState();
  const [open, setOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
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
  }, [seller, messages]);

  useEffect(() => {
    if (seller) {
      const sellerId = seller?._id;
      socketId.emit("addUser", sellerId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
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
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member.id !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
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
      lastMessageId: seller._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: seller._id,
      })
      .then((res) => {
        console.log(res.data.conversation);
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
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      images: e,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, {
          images: e,
          sender: seller._id,
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
        lastMessageId: seller._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ beahaviour: "smooth" });
  }, [messages]);

  return (
    <div className="w-[90%] bg-gradient-to-br from-white to-gray-50 m-5 h-[85vh] overflow-y-scroll rounded-xl shadow-lg border border-gray-100">
      {!open && (
        <>
          <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-t-xl shadow-md z-10">
            <h1 className="text-center text-2xl font-bold text-white">
              Tất cả tin nhắn
            </h1>
            <p className="text-center text-cyan-100 text-sm mt-1">
              {conversations?.length || 0} cuộc trò chuyện
            </p>
          </div>
          {/* All messages list */}
          {conversations &&
            conversations.map((item, index) => (
              <MessageList
                data={item}
                key={index}
                index={index}
                setOpen={setOpen}
                setCurrentChat={setCurrentChat}
                me={seller._id}
                setUserData={setUserData}
                userData={userData}
                online={onlineCheck(item)}
                setActiveStatus={setActiveStatus}
                isLoading={isLoading}
              />
            ))}
        </>
      )}

      {open && (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          setMessages={setMessages}
          handleImageUpload={handleImageUpload}
          setSelectedImage={setSelectedImage}
          setImageModalOpen={setImageModalOpen}
          imageModalOpen={imageModalOpen}
          selectedImage={selectedImage}
        />
      )}
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
  online,
  setActiveStatus,
  isLoading,
}) => {
  console.log(data);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/dashboard-messages?${id}`);
    setOpen(true);
  };
  const [active, setActive] = useState(0);

  useEffect(() => {
    const userId = data.members.find((user) => user != me);

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/user/user-info/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`w-full flex p-4 mx-2 my-2 rounded-xl transition-all duration-200 ${
        active === index 
          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg transform scale-[1.02]" 
          : "bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md"
      } cursor-pointer`}
      onClick={(e) =>
        setActive(index) ||
        handleClick(data._id) ||
        setCurrentChat(data) ||
        setUserData(user) ||
        setActiveStatus(online)
      }
    >
      <div className="relative">
        <img
          src={`${backend_url}${user?.avatar?.url}`}
          alt=""
          className="w-[50px] h-[50px] rounded-full border-2 border-white shadow-md"
        />
        {online ? (
          <div className="w-[14px] h-[14px] bg-green-400 rounded-full absolute top-0 right-0 border-2 border-white" />
        ) : (
          <div className="w-[14px] h-[14px] bg-gray-400 rounded-full absolute top-0 right-0 border-2 border-white" />
        )}
      </div>
      <div className="pl-3 flex-1">
        <h1 className={`text-lg font-semibold ${active === index ? "text-white" : "text-gray-800"}`}>
          {user?.name}
        </h1>
        <p className={`text-sm ${active === index ? "text-cyan-100" : "text-gray-600"} truncate`}>
          {!isLoading && data?.lastMessageId !== user?._id
            ? "Bạn:"
            : user?.name?.split?.(" ")[0] + ": "}{" "}
          {data?.lastMessage || "Chưa có tin nhắn"}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setSelectedImage,
  setImageModalOpen,
  imageModalOpen,
  selectedImage,
  scrollRef,
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* message header */}
      <div className="w-full flex p-4 items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={`${backend_url}${userData?.avatar?.url}`}
              alt=""
              className="w-[60px] h-[60px] rounded-full border-2 border-white shadow-lg"
            />
            {activeStatus && (
              <div className="w-[16px] h-[16px] bg-green-400 rounded-full absolute bottom-0 right-0 border-2 border-white"></div>
            )}
          </div>
          <div className="pl-3">
            <h1 className="text-lg font-bold text-white">{userData?.name}</h1>
            <p className="text-cyan-100 text-sm">
              {activeStatus ? "🟢 Đang hoạt động" : "⚫ Không hoạt động"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <AiOutlineArrowRight
            size={24}
            className="cursor-pointer text-white"
          />
        </button>
      </div>

      {/* messages */}
      <div className="px-4 h-[65vh] py-4 overflow-y-scroll bg-gradient-to-b from-gray-50 to-white">
        {messages &&
          messages.map((item, index) => {
            return (
              <div
                className={`flex w-full my-2 ${item.sender === sellerId ? "justify-end" : "justify-start"
                  }`}
                ref={scrollRef}
              >
                {item.sender !== sellerId && (
                  <img
                    src={`${backend_url}${userData?.avatar?.url}`}
                    className="w-[40px] h-[40px] rounded-full mr-3 border-2 border-white shadow-md"
                    alt=""
                  />
                )}
                {item.images && (
                  <div className="mb-2">
                    <img
                      src={item.images?.url || item.images}
                      className="max-w-[250px] max-h-[250px] object-contain rounded-xl mr-2 cursor-pointer hover:opacity-90 transition-opacity border-2 border-gray-200 shadow-md"
                      alt="Hình ảnh được chia sẻ"
                      onClick={() => {
                        setSelectedImage(item.images?.url || item.images);
                        setImageModalOpen(true);
                      }}
                      onError={(e) => {
                        e.target.src = item.images?.url || item.images || "https://via.placeholder.com/300";
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">📷 Nhấn để xem ảnh lớn</p>
                  </div>
                )}
                {item.text !== "" && (
                  <div>
                    <div
                      className={`w-max max-w-[70%] p-3 rounded-2xl shadow-md ${
                        item.sender === sellerId 
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
                          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      }`}
                    >
                      <p className="break-words">{item.text}</p>
                    </div>
                    <p className={`text-xs pt-1 px-1 ${item.sender === sellerId ? "text-gray-500" : "text-gray-600"}`}>
                      {format(item.createdAt)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* send message input */}
      <form
        aria-required={true}
        className="p-4 relative w-full flex justify-between items-center bg-white border-t border-gray-200"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            name=""
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={20} />
          </label>
        </div>
        <div className="w-full">
          <input
            type="text"
            required
            placeholder="Nhập tin nhắn của bạn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Gửi" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={selectedImage}
      />
    </div>
  );
};

export default DashboardMessages;
