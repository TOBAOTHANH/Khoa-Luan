import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useSelector, useDispatch } from "react-redux";
import { addTocart, removeFromCart } from "../redux/actions/cart";
import { toast } from "react-toastify";
import { backend_url } from "../server";
import { RxCross1 } from "react-icons/rx";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { AiOutlineShoppingCart, AiOutlineDelete } from "react-icons/ai";
import { FaShoppingBag } from "react-icons/fa";

const CartPage = () => {
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Initialize all items as selected
  React.useEffect(() => {
    if (cart && cart.length > 0) {
      setSelectedItems(new Set(cart.map((item) => item._id)));
    }
  }, [cart]);

  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
    // Remove from selected items
    const newSelected = new Set(selectedItems);
    newSelected.delete(data._id);
    setSelectedItems(newSelected);
  };

  const toggleItemSelection = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map((item) => item._id)));
    }
  };

  const quantityChangeHandler = (data) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thay đổi giỏ hàng!");
      navigate("/login");
      return;
    }
    dispatch(addTocart(data));
  };

  // Calculate totals for selected items only
  const selectedCartItems = cart.filter((item) => selectedItems.has(item._id));
  const totalPrice = selectedCartItems.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const handleCheckout = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tiếp tục thanh toán!");
      navigate("/login");
      return;
    }

    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
      return;
    }

    // Store selected items in localStorage for checkout
    localStorage.setItem("selectedCartItems", JSON.stringify(selectedCartItems));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FaShoppingBag className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Giỏ Hàng Của Bạn
              </h1>
              <p className="text-gray-600 mt-1">
                {cart && cart.length > 0
                  ? `${cart.length} sản phẩm trong giỏ hàng`
                  : "Giỏ hàng của bạn đang trống"}
              </p>
            </div>
          </div>
        </div>

        {cart && cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="p-6 bg-gray-100 rounded-full mb-6">
                <IoBagHandleOutline size={80} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Giỏ hàng trống!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Hãy thêm sản phẩm vào giỏ hàng của bạn để bắt đầu mua sắm
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <AiOutlineShoppingCart size={20} />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All Bar */}
              <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cart.length && cart.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">
                    Chọn tất cả ({selectedItems.size}/{cart.length})
                  </span>
                </label>
                <button
                  onClick={() => {
                    const selected = Array.from(selectedItems).map((id) =>
                      cart.find((item) => item._id === id)
                    );
                    selected.forEach((item) => {
                      if (item) removeFromCartHandler(item);
                    });
                  }}
                  disabled={selectedItems.size === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AiOutlineDelete size={18} />
                  Xóa đã chọn
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {cart &&
                  cart.map((item, index) => (
                    <CartItem
                      key={index}
                      data={item}
                      isSelected={selectedItems.has(item._id)}
                      onToggleSelect={() => toggleItemSelection(item._id)}
                      quantityChangeHandler={quantityChangeHandler}
                      removeFromCartHandler={removeFromCartHandler}
                      user={user}
                      navigate={navigate}
                    />
                  ))}
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Số sản phẩm đã chọn:</span>
                    <span className="font-semibold">{selectedCartItems.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng số lượng:</span>
                    <span className="font-semibold">
                      {selectedCartItems.reduce((acc, item) => acc + item.qty, 0)}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-800">
                        Tổng tiền:
                      </span>
                      <span className="text-2xl font-bold text-[#e44343]">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  <AiOutlineShoppingCart size={20} />
                  Thanh toán ({selectedItems.size})
                </button>

                <Link
                  to="/products"
                  className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const CartItem = ({
  data,
  isSelected,
  onToggleSelect,
  quantityChangeHandler,
  removeFromCartHandler,
  user,
  navigate,
}) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
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
    <div
      className={`bg-white rounded-xl shadow-lg p-5 transition-all duration-200 ${
        isSelected ? "ring-2 ring-blue-500 shadow-xl" : "hover:shadow-xl"
      }`}
    >
      <div className="flex gap-4">
        {/* Checkbox */}
        <div className="flex items-start pt-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Product Image */}
        <img
          src={`${backend_url}${data.images && data.images[0]}`}
          alt={data.name}
          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border-2 border-gray-200 flex-shrink-0"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/128";
          }}
        />

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <Link to={`/product/${data._id}`}>
                <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                  {data.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500">
                Còn lại: {data.stock} sản phẩm
              </p>
            </div>
            <button
              onClick={() => removeFromCartHandler(data)}
              className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <RxCross1
                size={20}
                className="text-gray-400 group-hover:text-red-500 transition-colors"
              />
            </button>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Số lượng:</span>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors"
                  onClick={() => decrement(data)}
                >
                  <HiOutlineMinus size={16} className="text-gray-700" />
                </button>
                <span className="text-lg font-bold text-gray-800 w-10 text-center">
                  {value}
                </span>
                <button
                  className="w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center cursor-pointer transition-colors"
                  onClick={() => increment(data)}
                >
                  <HiPlus size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm text-gray-500 line-through">
                ${(data.originalPrice || data.discountPrice).toFixed(2)}
              </p>
              <p className="text-xl font-bold text-[#e44343]">
                ${totalPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                ${data.discountPrice.toFixed(2)} × {value}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

