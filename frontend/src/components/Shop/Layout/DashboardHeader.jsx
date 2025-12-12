import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineGift, AiOutlineHome } from 'react-icons/ai'
import { MdOutlineLocalOffer } from 'react-icons/md'
import { FiPackage, FiShoppingBag } from 'react-icons/fi'
import { BiMessageSquareDetail } from 'react-icons/bi'
import { backend_url } from '../../../server'

const DashboardHeader = () => {
  const { seller } = useSelector((state) => state.seller);
  
  const quickLinks = [
    {
      path: "/dashboard-coupouns",
      icon: AiOutlineGift,
      label: "Mã giảm giá",
      color: "from-amber-500 to-orange-500",
    },
    {
      path: "/dashboard-events",
      icon: MdOutlineLocalOffer,
      label: "Sự kiện",
      color: "from-pink-500 to-rose-500",
    },
    {
      path: "/dashboard-products",
      icon: FiShoppingBag,
      label: "Sản phẩm",
      color: "from-purple-500 to-indigo-500",
    },
    {
      path: "/dashboard-orders",
      icon: FiPackage,
      label: "Đơn hàng",
      color: "from-green-500 to-emerald-500",
    },
    {
      path: "/dashboard-messages",
      icon: BiMessageSquareDetail,
      label: "Tin nhắn",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="w-full h-[80px] bg-gradient-to-r from-white via-gray-50 to-white shadow-md sticky top-0 left-0 z-30 flex items-center justify-between px-4 md:px-8 border-b border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="https://i.postimg.cc/02N1SrVQ/z7182359798450-de2505e6bf07a8236cf420eede11cf00-removebg-preview.png"
            alt="Logo"
            className="h-12 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
          />
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800">Seller Dashboard</p>
            <p className="text-xs text-gray-500">Quản lý shop của bạn</p>
          </div>
        </Link>
      </div>

      {/* Quick Links & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Quick Links - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                to={link.path}
                className={`group relative p-2.5 rounded-lg bg-gradient-to-r ${link.color} text-white hover:shadow-lg transform hover:scale-110 transition-all duration-200`}
                title={link.label}
              >
                <Icon size={20} className="text-white" />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {link.label}
                  </div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Home Link */}
        <Link
          to="/"
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
          <AiOutlineHome size={18} />
          <span className="text-sm font-medium">Về trang chủ</span>
        </Link>

        {/* Profile Avatar */}
        <Link
          to={`/shop/${seller?._id}`}
          className="relative group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
            <img
              src={seller?.avatar?.public_id ? `${backend_url}${seller.avatar.public_id}` : "https://via.placeholder.com/50"}
              alt={seller?.name || "Shop"}
              className="relative w-12 h-12 rounded-full object-cover border-[3px] border-white shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/50";
              }}
            />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          {/* Tooltip */}
          <div className="absolute -bottom-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded whitespace-nowrap">
              {seller?.name || "Shop"}
            </div>
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default DashboardHeader
