import React from "react";
import { AiOutlineLogin, AiOutlineMessage } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import {
  MdOutlineAdminPanelSettings,
  MdOutlineTrackChanges,
} from "react-icons/md";
import { TbAddressBook } from "react-icons/tb";
import { RxPerson } from "react-icons/rx";
import { Link } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ProfileSidebar = ({ setActive, active }) => {
  const {user} = useSelector((state) => state.user);
  const logoutHandler = () => {
    axios
      .get(`${server}/user/logout`, { withCredentials: true })
      .then((res) => {
        toast.success(res.data.message);
        window.location.href = "/";
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  };
  const menuItems = [
    { id: 1, icon: RxPerson, label: "Hồ sơ", color: "from-blue-500 to-blue-600" },
    { id: 2, icon: HiOutlineShoppingBag, label: "Đơn hàng", color: "from-green-500 to-green-600" },
    // { id: 3, icon: HiOutlineReceiptRefund, label: "Hoàn tiền", color: "from-orange-500 to-orange-600" },
    { id: 4, icon: AiOutlineMessage, label: "Hộp thư", color: "from-purple-500 to-purple-600" },
    // { id: 5, icon: MdOutlineTrackChanges, label: "Theo dõi đơn hàng", color: "from-cyan-500 to-cyan-600" },
    { id: 6, icon: RiLockPasswordLine, label: "Đổi mật khẩu", color: "from-red-500 to-red-600" },
    { id: 7, icon: TbAddressBook, label: "Địa chỉ", color: "from-indigo-500 to-indigo-600" },
  ];

  return (
    <div className="w-full bg-white shadow-lg rounded-2xl p-4 border border-gray-100">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 hidden 800px:block">Menu</h3>
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        
        if (item.isLink && item.path) {
          return (
            <Link key={item.id} to={item.path}>
              <div
                className={`flex items-center cursor-pointer w-full mb-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-gray-600"} />
                <span className={`pl-3 800px:block hidden font-medium ${isActive ? "text-white" : "text-gray-700"}`}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        }
        
        return (
          <div
            key={item.id}
            className={`flex items-center cursor-pointer w-full mb-3 p-3 rounded-xl transition-all duration-200 ${
              isActive
                ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActive(item.id)}
          >
            <Icon size={20} className={isActive ? "text-white" : "text-gray-600"} />
            <span className={`pl-3 800px:block hidden font-medium ${isActive ? "text-white" : "text-gray-700"}`}>
              {item.label}
            </span>
          </div>
        );
      })}
      
      {user && user?.role === "Admin" && (
        <Link to="/admin/dashboard">
          <div
            className={`flex items-center cursor-pointer w-full mb-3 p-3 rounded-xl transition-all duration-200 ${
              active === 8
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActive(8)}
          >
            <MdOutlineAdminPanelSettings
              size={20}
              className={active === 8 ? "text-white" : "text-gray-600"}
            />
            <span
              className={`pl-3 800px:block hidden font-medium ${
                active === 8 ? "text-white" : "text-gray-700"
              }`}
            >
              Bảng điều khiển Admin
            </span>
          </div>
        </Link>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div
          className="flex items-center cursor-pointer w-full p-3 rounded-xl transition-all duration-200 hover:bg-red-50 text-red-600 hover:text-red-700"
          onClick={logoutHandler}
        >
          <AiOutlineLogin size={20} />
          <span className="pl-3 800px:block hidden font-medium">Đăng xuất</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
