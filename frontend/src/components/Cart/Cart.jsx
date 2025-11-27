import React, { useState, useEffect } from "react";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart, removeFromCart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import { backend_url } from "../../server";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user); // 👈 Lấy thông tin đăng nhập
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const quantityChangeHandler = (data) => {
    // 👇 Kiểm tra đăng nhập trước khi thay đổi số lượng
    if (!user) {
      toast.error("Vui lòng đăng nhập để thay đổi giỏ hàng!");
      navigate("/login");
      return;
    }

    dispatch(addTocart(data));
  };

 // ✅ Hàm thêm vào giỏ hàng có kiểm tra đăng nhập
  const addToCartHandler = (data) => {
    // 👇 Nếu chưa đăng nhập → chặn + chuyển hướng
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    const isItemExists = cart && cart.find((i) => i._id === data._id);
    if (isItemExists) {
      toast.error("Sản phẩm đã có trong giỏ hàng!");
    } else {
      if (data.stock < 1) {
        toast.error("Sản phẩm đã hết hàng!");
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
      }
    }
  };


  const handleCheckout = () => {
    // 👇 Kiểm tra đăng nhập trước khi checkout
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán!");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 z-[9999] backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setOpenCart(false);
        }
      }}
    >
      <div 
        className="fixed top-0 right-0 h-screen w-[85%] sm:w-[400px] lg:w-[420px] bg-white flex flex-col shadow-2xl z-[10000] transform transition-transform duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '100vh' }}
      >
        {cart && cart.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative px-6">
            <div className="absolute top-6 right-6">
              <RxCross1
                size={24}
                className="cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <IoBagHandleOutline size={64} className="text-gray-300 mb-4" />
            <h5 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống!</h5>
            <p className="text-base text-gray-500 text-center">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          </div>
        ) : (
          <>
            {/* Header - Fixed */}
            <div className="flex w-full justify-between items-center px-6 py-5 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center">
                <IoBagHandleOutline size={24} className="text-gray-700 mr-3" />
                <h5 className="text-lg font-semibold text-gray-800">
                  {cart && cart.length} sản phẩm
                </h5>
              </div>
              <RxCross1
                size={24}
                className="cursor-pointer text-gray-500 hover:text-red-500 transition-colors"
                onClick={() => setOpenCart(false)}
              />
            </div>

            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="w-full">
                {cart &&
                  cart.map((i, index) => (
                    <CartSingle
                      key={index}
                      data={i}
                      quantityChangeHandler={quantityChangeHandler}
                      removeFromCartHandler={removeFromCartHandler}
                      user={user}
                      navigate={navigate}
                    />
                  ))}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="px-6 py-5 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="mb-4 flex justify-between items-center">
                <span className="text-base font-semibold text-gray-700">Tổng tiền:</span>
                <span className="text-xl font-bold text-[#e44343]">USD${totalPrice.toFixed(2)}</span>
              </div>
              <div
                onClick={handleCheckout}
                className="h-12 flex items-center justify-center w-full bg-gradient-to-r from-[#e44343] to-[#d02222] hover:from-[#d02222] hover:to-[#c01e1e] rounded-lg cursor-pointer shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-200"
              >
                <span className="text-white text-base font-semibold">
                  Thanh toán ngay
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({
  data,
  quantityChangeHandler,
  removeFromCartHandler,
  user,
  navigate,
}) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
    // 👇 Kiểm tra đăng nhập trước
    if (!user) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa giỏ hàng!");
      navigate("/login");
      return;
    }

    if (data.stock < value + 1) {
      toast.error("Sản phẩm đã đạt giới hạn tồn kho!");
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    // 👇 Kiểm tra đăng nhập trước
    if (!user) {
      toast.error("Vui lòng đăng nhập để chỉnh sửa giỏ hàng!");
      navigate("/login");
      return;
    }

    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = { ...data, qty: value === 1 ? 1 : value - 1 };
    quantityChangeHandler(updateCartData);
  };

  return (
    <div className="border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="w-full flex items-start gap-4">
        {/* Product Image - Standardized */}
        <img
          src={`${backend_url}${data.images && data.images[0]}`}
          alt={data.name}
          className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80";
          }}
        />

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-800 mb-2 line-clamp-2">
            {data.name}
          </h3>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 mb-2">
            <button
              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => decrement(data)}
            >
              <HiOutlineMinus size={14} className="text-gray-700" />
            </button>
            <span className="text-base font-semibold text-gray-800 w-8 text-center">
              {value}
            </span>
            <button
              className="w-7 h-7 rounded-full bg-[#e44343] hover:bg-[#d02222] flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => increment(data)}
            >
              <HiPlus size={14} className="text-white" />
            </button>
          </div>

          {/* Price Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              ${data.discountPrice} × {value}
            </span>
          </div>
          <div className="mt-1">
            <span className="text-base font-bold text-[#e44343]">
              US${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeFromCartHandler(data)}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group"
        >
          <RxCross1
            size={18}
            className="text-gray-400 group-hover:text-red-500 transition-colors"
          />
        </button>
      </div>
    </div>
  );
};

export default Cart;
