import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/styles";
import { State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server, backend_url } from "../../server";
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
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const navigate = useNavigate();

  // Cập nhật phoneNumber khi user thay đổi
  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAvailableCoupons();
  }, [cart]);

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data } = await axios.get(`${server}/coupon/get-all-coupons`);
      if (data.success && data.couponCodes) {
        // Filter coupons that can be applied to items in cart
        const applicableCoupons = data.couponCodes.filter((coupon) => {
          if (!cart || cart.length === 0) return false;
          
          // Check if any item in cart matches the coupon's shopId
          const hasMatchingShop = cart.some((item) => item.shopId === coupon.shopId);
          if (!hasMatchingShop) return false;
          
          // If coupon has selectedProduct, MUST have that exact product in cart
          if (coupon.selectedProduct) {
            const hasMatchingProduct = cart.some((item) => 
              item.shopId === coupon.shopId && item.name === coupon.selectedProduct
            );
            return hasMatchingProduct;
          }
          
          // If no selectedProduct, coupon applies to all products from that shop
          return true;
        });
        setAvailableCoupons(applicableCoupons);
      }
    } catch (error) {
      // Error fetching coupons - silently fail, user can still checkout without coupons
    } finally {
      setLoadingCoupons(false);
    }
  };

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

  const handleCouponSelect = async (selectedCouponName) => {
    if (!selectedCouponName) {
      setCouponCode("");
      setCouponCodeData(null);
      setDiscountPrice(null);
      return;
    }

    setCouponCode(selectedCouponName);
    const name = selectedCouponName;

    await axios.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      const shopId = res.data.couponCode?.shopId;
      const selectedProduct = res.data.couponCode?.selectedProduct;
      const couponCodeValue = res.data.couponCode?.value;
      
      if (res.data.couponCode !== null) {
        // Filter items that match the coupon criteria
        let eligibleItems = cart && cart.filter((item) => {
          // Must match shopId
          if (item.shopId !== shopId) return false;
          // If coupon has selectedProduct, item must match that product
          if (selectedProduct && item.name !== selectedProduct) return false;
          return true;
        });

        if (!eligibleItems || eligibleItems.length === 0) {
          toast.error(selectedProduct 
            ? `Mã giảm giá chỉ áp dụng cho sản phẩm "${selectedProduct}"` 
            : "Mã giảm giá không hợp lệ cho cửa hàng này");
          setCouponCode("");
          setCouponCodeData(null);
          setDiscountPrice(null);
        } else {
          // Calculate discount only for eligible items
          const eligiblePrice = eligibleItems.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          toast.success("Áp dụng mã giảm giá thành công!");
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(res.data.couponCode);
        }
      }
      if (res.data.couponCode === null) {
        toast.error("Mã giảm giá không tồn tại!");
        setCouponCode("");
        setCouponCodeData(null);
        setDiscountPrice(null);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This is now handled by handleCouponSelect
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";

  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  // Calculate discount percentage

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 flex items-center justify-center gap-2">
            <FaTruck className="text-blue-600" />
            Thông Tin Giao Hàng
          </h1>
          <p className="text-gray-600 text-sm">Vui lòng điền đầy đủ thông tin để chúng tôi có thể giao hàng đến bạn</p>
        </div>

        <div className="w-full block lg:flex gap-4">
          <div className="w-full lg:w-[45%]">
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
          <div className="w-full lg:w-[55%] lg:mt-0 mt-4">
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentenge={discountPercentenge}
              availableCoupons={availableCoupons}
              loadingCoupons={loadingCoupons}
              handleCouponSelect={handleCouponSelect}
              cart={cart}
              couponCodeData={couponCodeData}
            />
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2"
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
  const [isSelectingSavedAddress, setIsSelectingSavedAddress] = useState(false);
  const previousCityRef = useRef(city);
  
  // Helper function to normalize city name for vietnamDistricts lookup
  const normalizeCityName = (cityName) => {
    if (!cityName) return "";
    // Try exact match first
    if (vietnamDistricts[cityName]) return cityName;
    // Try common variations
    const variations = {
      "Ho Chi Minh City": "Hồ Chí Minh",
      "TP Hồ Chí Minh": "Hồ Chí Minh",
      "Hồ Chí Minh": "Hồ Chí Minh",
      "Bà Rịa - Vũng Tàu": "Bà Rịa-Vũng Tàu",
      "Bà Rịa-Vũng Tàu": "Bà Rịa-Vũng Tàu",
    };
    if (variations[cityName]) return variations[cityName];
    // Try to find by removing common prefixes/suffixes
    const normalized = cityName.replace(/^(Thành phố|TP|Tỉnh)\s*/i, "").trim();
    if (vietnamDistricts[normalized]) return normalized;
    // Try to find by partial match
    for (const key in vietnamDistricts) {
      if (key.includes(cityName) || cityName.includes(key)) {
        return key;
      }
    }
    return cityName; // Return original if no match found
  };
  
  // Reset district when city changes manually (not when selecting saved address)
  useEffect(() => {
    // Only reset district if city was changed manually (not from saved address)
    if (city !== previousCityRef.current && city && !isSelectingSavedAddress) {
      const normalizedCity = normalizeCityName(city);
      // Check if current district is valid for new city
      if (district && vietnamDistricts[normalizedCity] && !vietnamDistricts[normalizedCity].includes(district)) {
        setDistrict("");
      } else if (!district) {
        // If no district, keep it empty
        setDistrict("");
      }
    }
    previousCityRef.current = city;
  }, [city, district, isSelectingSavedAddress, setDistrict]);
  
  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-3 md:p-4">
      {/* Compact Header */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-1.5">
            <FaMapMarkerAlt className="text-white text-base" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Địa chỉ giao hàng</h2>
        </div>
      </div>

      <form className="space-y-3">
        {/* Personal Info - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <HiUser className="text-blue-600 text-xs" />
              Họ và Tên
            </label>
            <input
              type="text"
              value={user && user.name}
              required
              readOnly
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <HiMail className="text-blue-600 text-xs" />
              Email
            </label>
            <input
              type="email"
              value={user && user.email}
              required
              readOnly
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <HiPhone className="text-blue-600 text-xs" />
              Số điện thoại
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Nhập số điện thoại"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <HiLocationMarker className="text-blue-600 text-xs" />
              Mã bưu điện
            </label>
            <input
              type="number"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
              placeholder="Nhập mã bưu điện"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <FaMapMarkerAlt className="text-blue-600 text-xs" />
              Tỉnh/Thành phố
            </label>
            <select
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
            <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
              <FaMapMarkerAlt className="text-blue-600 text-xs" />
              Quận/Huyện
            </label>
            <select
              className={`w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all ${
                !city ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!city}
            >
              <option value="">
                {city ? "Chọn quận/huyện" : "Chọn tỉnh/thành phố trước"}
              </option>
              {city && (() => {
                const normalizedCity = normalizeCityName(city);
                return vietnamDistricts[normalizedCity] && vietnamDistricts[normalizedCity].map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ));
              })()}
            </select>
          </div>
        </div>

        {/* Address Detail */}
        <div>
          <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
            <HiLocationMarker className="text-blue-600 text-xs" />
            Địa chỉ chi tiết
          </label>
          <input
            type="address"
            required
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            placeholder="Số nhà, tên đường, phường/xã..."
            className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* Saved Addresses - Collapsible */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          type="button"
          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition-colors"
          onClick={() => setUserInfo(!userInfo)}
        >
          <svg className={`w-3 h-3 transition-transform ${userInfo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {userInfo ? "Ẩn địa chỉ đã lưu" : "Chọn từ địa chỉ đã lưu"}
        </button>
        {userInfo && user && user.addresses && user.addresses.length > 0 && (
          <div className="mt-2 space-y-1.5 max-h-[200px] overflow-y-auto">
            {user.addresses.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                onClick={() => {
                  // Set flag to prevent district reset during address selection
                  setIsSelectingSavedAddress(true);
                  
                  // Set all address fields from saved address
                  if (item.address1) setAddress1(item.address1);
                  if (item.zipCode) setZipCode(item.zipCode);
                  if (item.phoneNumber) setPhoneNumber(item.phoneNumber);
                  
                  // Set city and district together
                  if (item.city) {
                    setCity(item.city);
                  }
                  
                  // Set district immediately (will be preserved by useEffect check)
                  if (item.district) {
                    setDistrict(item.district);
                  } else {
                    setDistrict("");
                  }
                  
                  // Reset flag after state updates
                  setTimeout(() => {
                    setIsSelectingSavedAddress(false);
                  }, 100);
                  
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xs text-gray-800 truncate">{item.addressType}</h3>
                  <p className="text-xs text-gray-600 truncate">{item.address1}</p>
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
  availableCoupons,
  loadingCoupons,
  handleCouponSelect,
  cart,
  couponCodeData,
}) => {
  // Helper function to check if a product is eligible for coupon discount
  const isProductEligibleForCoupon = (item) => {
    if (!couponCodeData) return false;
    
    // Must match shopId
    if (item.shopId !== couponCodeData.shopId) return false;
    
    // If coupon has selectedProduct, item must match that product
    if (couponCodeData.selectedProduct && item.name !== couponCodeData.selectedProduct) {
      return false;
    }
    
    return true;
  };

  // Calculate price for a product item
  const calculateProductPrice = (item) => {
    const originalPrice = item.discountPrice * item.qty;
    
    if (isProductEligibleForCoupon(item) && couponCodeData) {
      const discountAmount = (originalPrice * couponCodeData.value) / 100;
      const finalPrice = originalPrice - discountAmount;
      return {
        originalPrice,
        discountAmount,
        finalPrice,
        hasDiscount: true,
      };
    }
    
    return {
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      hasDiscount: false,
    };
  };
  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 md:p-5 sticky top-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b border-gray-200">
        Tóm tắt đơn hàng
      </h2>
      
      {/* Product List - Compact */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Sản phẩm ({cart?.length || 0})</h3>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {cart && cart.length > 0 ? (
            cart.map((item, index) => {
              const priceInfo = calculateProductPrice(item);
              const isEligible = isProductEligibleForCoupon(item);
              
              return (
                <div key={index} className="flex items-start gap-2 p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <img
                    src={`${backend_url}${item.images && item.images[0]}`}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-md border border-gray-200 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/48";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-gray-800 truncate mb-0.5">
                      {item.name}
                      {isEligible && (
                        <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded">
                          🎁
                        </span>
                      )}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-gray-600 mb-0.5">
                      <span>SL: <strong className="text-gray-800">{item.qty}</strong></span>
                    </div>
                    <div className="flex items-center justify-between">
                      {priceInfo.hasDiscount ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 line-through">
                            ${priceInfo.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-green-600 font-semibold text-xs">
                            ${priceInfo.finalPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-green-600 font-semibold text-xs">
                          ${priceInfo.finalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Giỏ hàng trống</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-600">Tạm tính:</span>
          <span className="text-gray-800 font-semibold text-sm">${subTotalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1">
          <span className="text-xs text-gray-600">Phí vận chuyển:</span>
          <span className="text-gray-800 font-semibold text-sm">${shipping.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-1 border-b border-gray-200 pb-2">
          <span className="text-xs text-gray-600">Giảm giá:</span>
          <span className="text-green-600 font-semibold text-sm">
            {discountPercentenge ? `-$${discountPercentenge.toFixed(2)}` : "-"}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-bold text-base">Tổng cộng:</span>
          <span className="text-blue-600 font-bold text-lg">${totalPrice}</span>
        </div>
      </div>

      {/* Coupon Code - Compact */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="mb-2">
          <label className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <span>🎁</span>
            Mã giảm giá
          </label>
          {loadingCoupons ? (
            <div className="text-center py-2 text-gray-500 text-xs">Đang tải...</div>
          ) : availableCoupons.length === 0 ? (
            <div className="text-center py-2 text-gray-500 text-xs">
              Không có mã khả dụng
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {availableCoupons.map((coupon, index) => {
                // Find matching product in cart for this coupon
                const matchingProduct = cart && cart.find((item) => {
                  if (item.shopId !== coupon.shopId) return false;
                  if (coupon.selectedProduct && item.name !== coupon.selectedProduct) return false;
                  return true;
                });
                
                const isApplicable = !!matchingProduct;
                const isSelected = couponCode === coupon.name;
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isApplicable) {
                        if (isSelected) {
                          handleCouponSelect("");
                        } else {
                          handleCouponSelect(coupon.name);
                        }
                      }
                    }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : isApplicable
                        ? "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                        : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Image */}
                      {matchingProduct && matchingProduct.images && matchingProduct.images[0] ? (
                        <img
                          src={`${backend_url}${matchingProduct.images[0]}`}
                          alt={matchingProduct.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">🎁</span>
                        </div>
                      )}
                      
                      {/* Coupon Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-800 truncate">
                              {coupon.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">
                              Giảm <span className="font-bold text-green-600">{coupon.value}%</span>
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-blue-600 text-lg">✓</span>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        {matchingProduct ? (
                          <div className="mt-1.5">
                            <p className="text-xs text-gray-700 font-medium truncate">
                              Áp dụng cho: {matchingProduct.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Số lượng: {matchingProduct.qty} × ${matchingProduct.discountPrice}
                            </p>
                          </div>
                        ) : coupon.selectedProduct ? (
                          <div className="mt-1.5">
                            <p className="text-xs text-red-600">
                              ⚠ Sản phẩm "{coupon.selectedProduct}" không có trong giỏ hàng
                            </p>
                          </div>
                        ) : (
                          <div className="mt-1.5">
                            <p className="text-xs text-gray-600">
                              Áp dụng cho tất cả sản phẩm của shop
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {couponCode && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-800">
                ✓ Đã áp dụng mã: <strong>{couponCode}</strong>
              </p>
              <button
                type="button"
                onClick={() => handleCouponSelect("")}
                className="mt-1 text-xs text-red-600 hover:text-red-800 underline"
              >
                Xóa mã giảm giá
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
