import React, { useState } from "react";
import styles from "../../styles/styles";
import { State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { vietnamDistricts } from "../../utils/vietnamDistricts";
import { HiLocationMarker, HiMail, HiPhone, HiUser } from "react-icons/hi";
import { FaMapMarkerAlt, FaTruck } from "react-icons/fa";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("VN"); // Mặc định là Việt Nam
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [zipCode, setZipCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const navigate = useNavigate();

  // Cập nhật phoneNumber khi user thay đổi
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const paymentSubmit = () => {
    if (
      address1 === "" ||
      zipCode === null ||
      country === "" ||
      city === "" ||
      district === ""
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ giao hàng!");
    } else {
      const shippingAddress = {
        address1,
        zipCode,
        country,
        city,
        district,
        phoneNumber,
      };

      // Tạo user object với phoneNumber đã cập nhật
      const userWithUpdatedPhone = {
        ...user,
        phoneNumber: phoneNumber,
      };

      const orderData = {
        cart,
        totalPrice,
        subTotalPrice,
        shipping,
        discountPrice,
        shippingAddress,
        user: userWithUpdatedPhone,
      };

      // update local storage with the updated orders array
      localStorage.setItem("latestOrder", JSON.stringify(orderData));
      navigate("/payment");
    }
  };

  const subTotalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  // this is shipping cost variable
  const shipping = subTotalPrice * 0.005;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode;

    await axios.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      const shopId = res.data.couponCode?.shopId;
      const couponCodeValue = res.data.couponCode?.value;
      if (res.data.couponCode !== null) {
        const isCouponValid =
          cart && cart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Mã giảm giá không hợp lệ cho cửa hàng này");
          setCouponCode("");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          toast.success("Áp dụng mã giảm giá thành công!");
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(res.data.couponCode);
          setCouponCode("");
        }
      }
      if (res.data.couponCode === null) {
        toast.error("Mã giảm giá không tồn tại!");
        setCouponCode("");
      }
    });
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";

  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  console.log(discountPercentenge);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <FaTruck className="text-blue-600" />
            Thông Tin Giao Hàng
          </h1>
          <p className="text-gray-600 text-lg">Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng đến bạn</p>
        </div>

        <div className="w-full block lg:flex gap-8">
          <div className="w-full lg:w-[65%]">
          <ShippingInfo
            user={user}
            country={country}
            city={city}
            setCity={setCity}
            district={district}
            setDistrict={setDistrict}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
            address1={address1}
            setAddress1={setAddress1}
            zipCode={zipCode}
            setZipCode={setZipCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
          />
          </div>
          <div className="w-full lg:w-[35%] lg:mt-0 mt-8">
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentenge={discountPercentenge}
            />
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-lg"
            onClick={paymentSubmit}
          >
            <span>Tiếp tục đến thanh toán</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  city,
  setCity,
  district,
  setDistrict,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  zipCode,
  setZipCode,
  phoneNumber,
  setPhoneNumber,
}) => {
  // Reset district when city changes
  useEffect(() => {
    setDistrict("");
  }, [city, setDistrict]);
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-3">
            <FaMapMarkerAlt className="text-white text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h2>
        </div>
        <p className="text-gray-600 ml-14">Vui lòng điền đầy đủ thông tin bên dưới</p>
      </div>

      <form className="space-y-6">
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <HiUser className="text-blue-600" />
              Họ và Tên
            </label>
            <input
              type="text"
              value={user && user.name}
              required
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <HiMail className="text-blue-600" />
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={user && user.email}
              required
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <HiPhone className="text-blue-600" />
              Số điện thoại
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <HiLocationMarker className="text-blue-600" />
              Mã bưu điện
            </label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              placeholder="Nhập mã bưu điện"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Tỉnh/Thành phố
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {State &&
                State.getStatesOfCountry(country).map((item) => (
                  <option key={item.isoCode} value={item.name}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="text-blue-600" />
              Quận/Huyện
            </label>
            <select
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                !city ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!city}
            >
              <option value="">
                {city ? "Chọn quận/huyện" : "Chọn tỉnh/thành phố trước"}
              </option>
              {city && vietnamDistricts[city] &&
                vietnamDistricts[city].map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Address Detail */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <HiLocationMarker className="text-blue-600" />
            Địa chỉ chi tiết
          </label>
          <input
            type="address"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Số nhà, tên đường, phường/xã..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* Saved Addresses */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 transition-colors"
          onClick={() => setUserInfo(!userInfo)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {userInfo ? "Ẩn địa chỉ đã lưu" : "Chọn từ địa chỉ đã lưu"}
        </button>
        {userInfo && user && user.addresses && user.addresses.length > 0 && (
          <div className="mt-4 space-y-3">
            {user.addresses.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => {
                  setAddress1(item.address1 || "");
                  setZipCode(item.zipCode || "");
                  setCity(item.city || "");
                  setDistrict(item.district || "");
                  if (item.phoneNumber) {
                    setPhoneNumber(item.phoneNumber);
                  }
                  setUserInfo(false);
                }}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mr-3"
                  checked={address1 === item.address1}
                  onChange={() => {}}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.addressType}</h3>
                  <p className="text-sm text-gray-600">{item.address1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
        Tóm tắt đơn hàng
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Tạm tính:</span>
          <span className="text-gray-800 font-semibold text-lg">${subTotalPrice}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Phí vận chuyển:</span>
          <span className="text-gray-800 font-semibold text-lg">${shipping.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200 pb-4">
          <span className="text-gray-600 font-medium">Giảm giá:</span>
          <span className="text-green-600 font-semibold text-lg">
            {discountPercentenge ? `-$${discountPercentenge}` : "-"}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-bold text-xl">Tổng cộng:</span>
          <span className="text-blue-600 font-bold text-2xl">${totalPrice}</span>
        </div>
      </div>

      {/* Coupon Code */}
      <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-gray-200">
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            Mã giảm giá
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
