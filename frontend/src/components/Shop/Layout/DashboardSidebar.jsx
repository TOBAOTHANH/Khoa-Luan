import React, { useRef, useEffect } from "react";
import { AiOutlineFolderAdd, AiOutlineGift, AiOutlineMessage, AiOutlineFileExcel } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { Link, useLocation } from "react-router-dom";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineUserGroup, HiOutlineCash } from "react-icons/hi";

const DashboardSideBar = ({ active }) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Restore scroll position on mount and location change
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const savedScrollPos = sessionStorage.getItem('sidebarScrollPos');
    if (savedScrollPos) {
      // Restore scroll position after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (sidebar) {
          sidebar.scrollTop = parseInt(savedScrollPos, 10);
        }
      }, 50);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 1,
      path: "/dashboard",
      icon: RxDashboard,
      label: "Tổng Quan Shop",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      path: "/dashboard-orders",
      icon: FiShoppingBag,
      label: "Tất cả Đơn Hàng",
      color: "from-green-500 to-green-600",
    },
    {
      id: 3,
      path: "/dashboard-products",
      icon: FiPackage,
      label: "Tất cả Sản Phẩm",
      color: "from-purple-500 to-purple-600",
      description: "Quản lý sản phẩm",
    },
    {
      id: 4,
      path: "/dashboard-create-product",
      icon: AiOutlineFolderAdd,
      label: "Tạo Sản Phẩm Mới",
      color: "from-indigo-500 to-indigo-600",
      description: "Thêm sản phẩm mới",
    },
    {
      id: 5,
      path: "/dashboard-events",
      icon: MdOutlineLocalOffer,
      label: "Tất cả Sự Kiện",
      color: "from-pink-500 to-pink-600",
      description: "Quản lý sự kiện",
    },
    {
      id: 6,
      path: "/dashboard-create-event",
      icon: VscNewFile,
      label: "Tạo Sự Kiện Mới",
      color: "from-rose-500 to-rose-600",
      description: "Tạo sự kiện khuyến mãi",
    },
    {
      id: 7,
      path: "/dashboard-withdraw-money",
      icon: HiOutlineCash,
      label: "Rút Tiền",
      color: "from-emerald-500 to-emerald-600",
      description: "Rút tiền từ shop",
    },
    {
      id: 8,
      path: "/dashboard-messages",
      icon: BiMessageSquareDetail,
      label: "Liên Hệ Khách Hàng",
      color: "from-cyan-500 to-cyan-600",
      description: "Tin nhắn khách hàng",
    },
    {
      id: 9,
      path: "/dashboard-coupouns",
      icon: AiOutlineGift,
      label: "Mã Giảm Giá",
      color: "from-amber-500 to-amber-600",
      description: "Quản lý mã giảm giá",
    },
    {
      id: 12,
      path: "/dashboard-users",
      icon: HiOutlineUserGroup,
      label: "Tất cả Người Dùng",
      color: "from-teal-500 to-teal-600",
      description: "Danh sách người dùng",
    },
    {
      id: 13,
      path: "/dashboard-reviews",
      icon: AiOutlineMessage,
      label: "Phản Hồi Đánh Giá",
      color: "from-violet-500 to-violet-600",
      description: "Đánh giá khách hàng",
    },
    {
      id: 14,
      path: "/dashboard-export-invoices",
      icon: AiOutlineFileExcel,
      label: "Xuất Hóa Đơn Excel",
      color: "from-lime-500 to-lime-600",
    },
    {
      id: 11,
      path: "/settings",
      icon: CiSettings,
      label: "Cài Đặt",
      color: "from-gray-500 to-gray-600",
    },
  ];

  const isActive = (itemId) => {
    return active === itemId || location.pathname === menuItems.find(item => item.id === itemId)?.path;
  };

  return (
    <div 
      ref={sidebarRef}
      className="w-full h-[calc(100vh-80px)] bg-gradient-to-b from-white to-gray-50 shadow-lg border-r border-gray-200 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      style={{ 
        position: 'sticky',
        top: '80px',
        scrollBehavior: 'auto', 
        overscrollBehavior: 'contain',
        alignSelf: 'flex-start'
      }}
    >
      {/* Compact Header - Removed for cleaner look */}

      {/* Menu Items */}
      <div className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const itemActive = isActive(item.id);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                // Save scroll position before navigation
                if (sidebarRef.current) {
                  const scrollTop = sidebarRef.current.scrollTop;
                  sessionStorage.setItem('sidebarScrollPos', scrollTop.toString());
                }
              }}
              className={`group relative flex items-center p-3 rounded-xl transition-all duration-300 ${
                itemActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-xl`
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {/* Active indicator */}
              {itemActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white rounded-r-full shadow-lg"></div>
              )}
              
              {/* Icon with enhanced styling */}
              <div
                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 ${
                  itemActive
                    ? "bg-white bg-opacity-25 shadow-lg"
                    : "bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-gray-200 group-hover:to-gray-300"
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-all duration-300 ${
                    itemActive 
                      ? "text-white" 
                      : "text-gray-600 group-hover:text-gray-800"
                  }`}
                />
              </div>
              
              {/* Label and Description */}
              <div className="hidden 800px:block ml-3 flex-1">
                <span
                  className={`block font-semibold text-[15px] transition-colors ${
                    itemActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </span>
                {item.description && (
                  <span
                    className={`block text-xs mt-0.5 transition-colors ${
                      itemActive ? "text-white text-opacity-80" : "text-gray-500 group-hover:text-gray-600"
                    }`}
                  >
                    {item.description}
                  </span>
                )}
              </div>

              {/* Active checkmark */}
              {itemActive && (
                <div className="hidden 800px:block ml-auto">
                  <div className="w-5 h-5 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                    <svg 
                      className="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Hover arrow for non-active items */}
              {!itemActive && (
                <div className="hidden 800px:block ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg 
                    className="w-4 h-4 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardSideBar;
