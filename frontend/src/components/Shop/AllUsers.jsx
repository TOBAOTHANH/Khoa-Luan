import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsersForSeller } from "../../redux/actions/user";
import { HiOutlineUserGroup, HiOutlineSearch } from "react-icons/hi";
import { AiOutlineDelete, AiOutlineMail, AiOutlineUser } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";

const AllUsers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    dispatch(getAllUsersForSeller());
  }, [dispatch]);

  useEffect(() => {
    if (users) {
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${server}/user/seller-delete-user/${id}`, {
        withCredentials: true,
      });
      toast.success("Xóa người dùng thành công!");
      dispatch(getAllUsersForSeller());
      setOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const displayUsers = searchTerm ? filteredUsers : users || [];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <HiOutlineUserGroup className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Quản Lý Người Dùng
                </h2>
                <p className="text-blue-100 text-sm">
                  Tổng số người dùng: {displayUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <HiOutlineSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Users Grid */}
        {displayUsers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <HiOutlineUserGroup className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">
              {searchTerm ? "Không tìm thấy người dùng nào" : "Chưa có người dùng nào"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <AiOutlineUser className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {user.name || "Chưa có tên"}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {user.role || "User"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <AiOutlineMail className="text-blue-500" size={20} />
                      <span className="text-sm break-all">{user.email}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setUserId(user._id);
                          setOpen(true);
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out"
                      >
                        <AiOutlineDelete size={18} />
                        <span>Xóa người dùng</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {open && (
          <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <RxCross1 size={24} />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AiOutlineDelete className="text-red-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Xác nhận xóa
                </h3>
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn xóa người dùng này không? Hành động này
                  không thể hoàn tác.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleDelete(userId)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;

