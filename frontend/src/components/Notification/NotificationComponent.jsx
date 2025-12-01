import React, { useEffect, useState } from "react";
import axios from "axios";
import { server, backend_url } from "../../server";
import { useSelector } from "react-redux";
import { AiOutlineBell } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const NotificationComponent = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?._id]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(
        `${server}/notification/get-all/${user._id}`,
        { withCredentials: true }
      );
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter(n => !n.read).length || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${server}/notification/mark-read/${notificationId}`,
        {},
        { withCredentials: true }
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer mr-[15px] group"
        onClick={() => setOpen(!open)}
      >
        <AiOutlineBell size={30} className="text-white/90 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 w-5 h-5 p-0 m-0 text-white font-bold text-[11px] leading-tight text-center flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      {open && (
        <div className="absolute right-0 top-16 w-80 bg-white rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <h3 className="font-bold text-lg">Thông báo</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={index}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 ${
                    !notif.read ? 'bg-blue-50 border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => {
                    if (!notif.read) {
                      markAsRead(notif._id);
                    }
                    if (notif.link) {
                      navigate(notif.link);
                    }
                    setOpen(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Notification Image */}
                    {notif.imageUrl ? (
                      <img
                        src={notif.imageUrl}
                        alt="Notification"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">
                          {notif.type === 'order_status' ? '📦' : 
                           notif.type === 'voucher_new' ? '🎁' : 
                           notif.type === 'review_feedback' ? '⭐' : '🔔'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-800 text-sm">{notif.title}</h4>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 font-medium">{notif.message}</p>
                      {notif.description && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{notif.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;

