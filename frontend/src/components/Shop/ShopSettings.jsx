import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShopSettings = () => {
  const { user, error, successMessage } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ""
  );
  const [address, setAddress] = useState(seller && seller.address);
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipcode] = useState(seller && seller.zipCode);

  const dispatch = useDispatch();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("public_id", file.name); // Lưu tên đầy đủ của hình ảnh

    await axios
      .put(`${server}/shop/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((response) => {
        toast.success("Đã cập nhật avatar thành công!");
        window.location.reload();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Cập nhật avatar thất bại.");
      });
  };


  const updateHandler = async (e) => {
    e.preventDefault();

    await axios
      .put(
        `${server}/shop/update-seller-info`,
        {
          name,
          address,
          zipCode,
          phoneNumber,
          description,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Đã cập nhật thông tin cửa hàng thành công!");
        dispatch(loadSeller());
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-3xl font-bold text-white mb-1">Cài Đặt Shop</h2>
          <p className="text-gray-200 text-sm">Quản lý thông tin cửa hàng của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Avatar Section */}
          <div className="w-full flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200 blur-xl"></div>
              <img
                src={`${backend_url}${seller?.avatar?.public_id}`}
                alt=""
                className="relative w-[200px] h-[200px] rounded-full cursor-pointer border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-200"
              />
              <div className="w-[40px] h-[40px] bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px] shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
                <input
                  type="file"
                  id="image"
                  className="hidden"
                  onChange={handleImage}
                />
                <label htmlFor="image" className="cursor-pointer">
                  <AiOutlineCamera className="text-white" size={20} />
                </label>
              </div>
            </div>
          </div>

          {/* shop info */}
          <form
            aria-aria-required={true}
            className="space-y-6"
            onSubmit={updateHandler}
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Cửa Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={seller?.name || "Nhập tên cửa hàng"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả Cửa Hàng
              </label>
              <textarea
                placeholder={seller?.description || "Nhập mô tả cửa hàng"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Địa Chỉ Cửa Hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder={seller?.address || "Nhập địa chỉ cửa hàng"}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={seller?.phoneNumber || "Nhập số điện thoại"}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mã Bưu Điện <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder={seller?.zipCode || "Nhập mã bưu điện"}
                  value={zipCode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                Cập Nhật Thông Tin Cửa Hàng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;
