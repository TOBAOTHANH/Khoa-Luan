import React, { useEffect, useState } from "react";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import styles from "../styles/styles";
import { getAllOrdersOfUser } from "../redux/actions/order";
import { backend_url, server } from "../server";
import { RxCross1 } from "react-icons/rx";
import { AiFillStar, AiOutlineStar, AiOutlineMessage } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";
import { getOrderStatusInVietnamese } from "../utils/orderStatus";

const UserOrderDetails = () => {
  const { orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(1);

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfUser(user._id));
  }, [dispatch, user._id]);

  const data = orders && orders.find((item) => item._id === id);

  const reviewHandler = async (e) => {
    await axios
      .put(
        `${server}/product/create-new-review`,
        {
          user,
          rating,
          comment,
          productId: selectedItem?._id,
          orderId: id,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success(res.data.message);
        dispatch(getAllOrdersOfUser(user._id));
        setComment("");
        setRating(null);
        setOpen(false);
      })
      .catch((error) => {
        toast.error(error);
      });
  };

  const refundHandler = async () => {
    await axios.put(`${server}/order/order-refund/${id}`, {
      status: "Processing refund"
    }).then((res) => {
      toast.success(res.data.message);
      dispatch(getAllOrdersOfUser(user._id));
    }).catch((error) => {
      toast.error(error.response.data.message);
    })
  };

  return (
    <div className={`py-4 min-h-screen ${styles.section} bg-gradient-to-br from-gray-50 to-gray-100`}>
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg shadow-lg">
              <BsFillBagFill size={30} color="white" />
            </div>
            <div>
              <h1 className="text-[28px] font-bold text-gray-800">Chi tiết đơn hàng</h1>
              <p className="text-sm text-gray-500">Theo dõi đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
            <h5 className="text-lg font-bold text-gray-800">
              #{data?._id?.slice(0, 8)}
            </h5>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Ngày đặt hàng</p>
            <h5 className="text-lg font-bold text-gray-800">
              {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </h5>
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
          Sản phẩm trong đơn hàng
        </h3>
        <div className="space-y-4">
          {data &&
            data?.cart.map((item, index) => {
              return (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="relative">
                    <img
                      src={`${backend_url}${item.images[0]}`}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-white"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  <div className="flex-1 ml-4">
                    <h5 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h5>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className="text-base">Số lượng: <strong className="text-gray-800">{item.qty}</strong></span>
                      <span className="text-base">Giá: <strong className="text-green-600">US${item.discountPrice}</strong></span>
                      <span className="text-base">Tổng: <strong className="text-blue-600">US${(item.discountPrice * item.qty).toFixed(2)}</strong></span>
                    </div>
                  </div>
                  {!item.isReviewed && data?.status === "Delivered" && (
                    <button
                      className="ml-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        setOpen(true);
                        setSelectedItem(item);
                      }}
                    >
                      ⭐ Viết đánh giá
                    </button>
                  )}
                </div>
              )
            })}
        </div>
        
        {/* Total Price */}
        <div className="mt-6 pt-4 border-t-2 border-gray-300">
          <div className="flex justify-end">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-lg shadow-lg">
              <p className="text-sm mb-1">Tổng tiền</p>
              <h5 className="text-2xl font-bold">US${data?.totalPrice?.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Review Popup - Improved Design */}
      {open && (
        <div className="w-full fixed top-0 left-0 h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="w-full flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Viết đánh giá sản phẩm</h2>
              <RxCross1
                size={28}
                onClick={() => setOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              />
            </div>
            
            {/* Product Info */}
            <div className="w-full flex items-center p-4 bg-gray-50 rounded-lg mb-6">
              <img
                src={`${backend_url}${selectedItem?.images[0]}`}
                alt={selectedItem?.name}
                className="w-20 h-20 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
              <div className="ml-4">
                <div className="text-lg font-semibold text-gray-800">{selectedItem?.name}</div>
                <h4 className="text-base text-gray-600">
                  US${selectedItem?.discountPrice} x {selectedItem?.qty}
                </h4>
              </div>
            </div>

            {/* Ratings */}
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-gray-800 mb-3">
                Đánh giá <span className="text-red-500">*</span>
              </h5>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((i) =>
                  rating >= i ? (
                    <AiFillStar
                      key={i}
                      className="cursor-pointer transform hover:scale-110 transition-transform"
                      color="rgb(246,186,0)"
                      size={35}
                      onClick={() => setRating(i)}
                    />
                  ) : (
                    <AiOutlineStar
                      key={i}
                      className="cursor-pointer transform hover:scale-110 transition-transform"
                      color="rgb(246,186,0)"
                      size={35}
                      onClick={() => setRating(i)}
                    />
                  )
                )}
                {rating > 0 && (
                  <span className="ml-3 text-lg font-semibold text-gray-700">
                    {rating}/5 sao
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Viết bình luận
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (tùy chọn)
                </span>
              </label>
              <textarea
                name="comment"
                cols="20"
                rows="5"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Sản phẩm của bạn như thế nào? Hãy viết cảm nhận của bạn!"
                className="w-full border-2 border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                Hủy
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={rating > 0 ? reviewHandler : null}
                disabled={rating === 0}
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
            <span className="mr-2">📍</span> Địa chỉ giao hàng
          </h4>
          <div className="space-y-2 text-gray-700">
            <p className="text-base">
              <strong>Địa chỉ:</strong> {data?.shippingAddress?.address1} {data?.shippingAddress?.address2}
            </p>
            <p className="text-base">
              <strong>Thành phố:</strong> {data?.shippingAddress?.city}
            </p>
            <p className="text-base">
              <strong>Quốc gia:</strong> {data?.shippingAddress?.country}
            </p>
            <p className="text-base">
              <strong>Điện thoại:</strong> {data?.user?.phoneNumber || 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
            <span className="mr-2">💳</span> Thông tin thanh toán
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Trạng thái thanh toán</p>
              <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                data?.paymentInfo?.status === 'succeeded' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data?.paymentInfo?.status ? getOrderStatusInVietnamese(data?.paymentInfo?.status) : "Chưa thanh toán"}
              </span>
            </div>
            {data?.status === "Delivered" && (
              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
                onClick={refundHandler}
              >
                <span>🔄 Yêu cầu hoàn tiền</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Link to="/" className="flex-1">
            <button className="w-full bg-gradient-to-r from-[#6443d1] to-[#7c5dd8] hover:from-[#5335b0] hover:to-[#6443d1] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2">
              <AiOutlineMessage size={18} />
              <span>Gửi tin nhắn cho shop</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
