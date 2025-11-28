import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "react-lottie";
import animationData from "../Assests/animations/107043-success.json";
import { AiFillCheckCircle } from "react-icons/ai";
import { HiShoppingBag } from "react-icons/hi";
import { MdLocalShipping } from "react-icons/md";

const OrderSuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Success />
      <Footer />
    </div>
  );
};

const Success = () => {
  const navigate = useNavigate();
  const [orderIds, setOrderIds] = React.useState([]);
  
  React.useEffect(() => {
    // Lấy order IDs từ localStorage
    const savedOrderIds = localStorage.getItem("latestOrderIds");
    if (savedOrderIds) {
      try {
        const ids = JSON.parse(savedOrderIds);
        setOrderIds(ids);
        // Xóa sau khi đã lấy
        localStorage.removeItem("latestOrderIds");
      } catch (error) {
        console.error("Error parsing order IDs:", error);
      }
    }
  }, []);
  
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  
  const handleViewOrder = () => {
    if (orderIds && orderIds.length > 0) {
      // Link đến đơn hàng đầu tiên
      navigate(`/user/order/${orderIds[0]}`);
    } else {
      // Fallback về profile nếu không có order ID
      navigate("/profile");
    }
  };
  
  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-2xl w-full">
        {/* Main Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10"></div>
            <div className="relative z-10">
              <div className="inline-block mb-4 transform transition-all duration-500 hover:scale-110">
                <AiFillCheckCircle className="text-white text-7xl drop-shadow-lg" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">
                Đặt Hàng Thành Công! 🎉
              </h1>
              <p className="text-green-100 text-lg">
                Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Lottie options={defaultOptions} width={250} height={250} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-green-100 rounded-full opacity-20 animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Đơn hàng của bạn đã được xác nhận
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Chúng tôi đã nhận được đơn hàng của bạn và đang xử lý. 
                Bạn sẽ nhận được email xác nhận trong vài phút tới.
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 transform transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 rounded-full p-3">
                    <HiShoppingBag className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Đơn hàng đã được tạo</h3>
                    <p className="text-sm text-gray-600">Mã đơn hàng sẽ được gửi qua email</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 transform transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-500 rounded-full p-3">
                    <MdLocalShipping className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Đang chuẩn bị giao hàng</h3>
                    <p className="text-sm text-gray-600">Sẽ được giao trong 2-5 ngày</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/products")}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <HiShoppingBag className="text-xl" />
                <span>Tiếp tục mua sắm</span>
              </button>
              <button
                onClick={handleViewOrder}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 hover:border-green-500 hover:text-green-600"
              >
                Xem đơn hàng của tôi
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Thông tin quan trọng
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Bạn có thể theo dõi đơn hàng trong phần "Đơn hàng của tôi"</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Mọi thắc mắc vui lòng liên hệ hotline: 1900-xxxx</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Email xác nhận đã được gửi đến địa chỉ email của bạn</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
