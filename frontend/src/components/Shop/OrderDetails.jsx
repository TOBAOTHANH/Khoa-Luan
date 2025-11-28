import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles/styles";
import { BsFillBagFill } from "react-icons/bs";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { backend_url, server } from "../../server";
import axios from "axios";
import { toast } from "react-toastify";
import { getOrderStatusInVietnamese, getOrderStatusOptions } from "../../utils/orderStatus";

const OrderDetails = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  const data = orders && orders.find((item) => item._id === id);
  useEffect(() => {
    if (data?.status) {
      setStatus((prevStatus) => prevStatus || data.status); // Chỉ cập nhật nếu prevStatus rỗng
    }
  }, [data]);
  const orderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/update-order-status/${id}`,
        {
          status,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Đã cập nhật đơn hàng!");
        setStatus(res.data.updatedStatus || status); // Giữ nguyên trạng thái hoặc cập nhật từ phản hồi
        navigate("/dashboard-orders");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };
  //-------------------------------------------------///
  const options = useMemo(() => {
    if (data?.status === "Processing refund" || data?.status === "Refund Success") {
      return getOrderStatusOptions(true);
    }
    return getOrderStatusOptions(false);
  }, [data?.status]);
  //-------------------------------------------------///

  const refundOrderUpdateHandler = async (e) => {
    await axios
      .put(
        `${server}/order/order-refund-success/${id}`,
        {
          status,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Đã cập nhật đơn hàng!");
        dispatch(getAllOrdersOfShop(seller._id));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  }

  console.log(data?.status);


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
              <p className="text-sm text-gray-500">Quản lý và theo dõi đơn hàng</p>
            </div>
          </div>
          <Link to="/dashboard-orders">
            <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              ← Danh sách đơn hàng
            </div>
          </Link>
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
            data?.cart.map((item, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <div className="relative">
                  <img
                    src={`${backend_url}${item.images[0]?.url || item.images[0]}`}
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
              </div>
            ))}
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
          <div className="space-y-3">
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
            {data?.paymentInfo?.type && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                <p className="text-base font-semibold text-gray-800">{data.paymentInfo.type}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Update */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-xl font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200 flex items-center">
          <span className="mr-2">🔄</span> Cập nhật trạng thái đơn hàng
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Trạng thái hiện tại: 
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                {getOrderStatusInVietnamese(data?.status || 'Processing')}
              </span>
            </label>
            {data?.status !== "Processing refund" && data?.status !== "Refund Success" && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full md:w-[300px] mt-2 border-2 border-gray-300 h-[45px] rounded-lg px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {options.map((option, index) => (
                  <option value={option.value} key={index}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {(data?.status === "Processing refund" || data?.status === "Refund Success") && (
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full md:w-[300px] mt-2 border-2 border-gray-300 h-[45px] rounded-lg px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getOrderStatusOptions(true)
                  .slice(
                    getOrderStatusOptions(true).findIndex(opt => opt.value === data?.status)
                  )
                  .map((option, index) => (
                    <option value={option.value} key={index}>
                      {option.label}
                    </option>
                  ))}
              </select>
            )}
          </div>
          <button
            className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
            onClick={data?.status !== "Processing refund" ? orderUpdateHandler : refundOrderUpdateHandler}
          >
            <span>💾 Cập nhật trạng thái</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;