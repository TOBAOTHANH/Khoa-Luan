import React, { useState } from "react";
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
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen z-10">
      <div className="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%] bg-white flex flex-col overflow-y-scroll justify-between shadow-sm">
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className="flex w-full justify-end pt-5 pr-5 fixed top-3 right-3">
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <h5>Giỏ hàng trống!</h5>
          </div>
        ) : (
          <>
            <div>
              <div className="flex w-full justify-end pt-5 pr-5">
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpenCart(false)}
                />
              </div>

              {/* Item length */}
              <div className={`${styles.noramlFlex} p-4`}>
                <IoBagHandleOutline size={25} />
                <h5 className="pl-2 text-[20px] font-[500]">
                  {cart && cart.length} sản phẩm
                </h5>
              </div>

              <br />
              <div className="w-full border-t">
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

            <div className="px-5 mb-3">
              {/* checkout buttons */}
              <div
                onClick={handleCheckout}
                className={`h-[45px] flex items-center justify-center w-[100%] bg-[#e44343] rounded-[5px] cursor-pointer`}
              >
                <h1 className="text-[#fff] text-[18px] font-[600]">
                  Thanh toán ngay (USD${totalPrice})
                </h1>
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
    <div className="border-b p-4">
      <div className="w-full flex items-center">
        <div>
          <div
            className={`bg-[#e44343] border border-[#e4434373] rounded-full w-[25px] h-[25px] ${styles.noramlFlex} justify-center cursor-pointer`}
            onClick={() => increment(data)}
          >
            <HiPlus size={18} color="#fff" />
          </div>
          <span className="pl-[10px]">{data.qty}</span>
          <div
            className="bg-[#a7abb14f] rounded-full w-[25px] h-[25px] flex items-center justify-center cursor-pointer"
            onClick={() => decrement(data)}
          >
            <HiOutlineMinus size={16} color="#7d879c" />
          </div>
        </div>

        <img
          src={`${backend_url}${data.images && data.images[0]}`}
          alt=""
          className="w-[130px] h-min ml-2 mr-2 rounded-[5px]"
        />

        <div className="pl-[5px]">
          <h1>{data.name}</h1>
          <h4 className="font-[400] text-[15px] text-[#00000082]">
            ${data.discountPrice} × {value}
          </h4>
          <h4 className="font-[600] text-[17px] pt-[3px] text-[#d02222] font-Roboto">
            US${totalPrice}
          </h4>
        </div>

        <RxCross1
          size={18}
          className="cursor-pointer ml-10"
          onClick={() => removeFromCartHandler(data)}
        />
      </div>
    </div>
  );
};

export default Cart;
