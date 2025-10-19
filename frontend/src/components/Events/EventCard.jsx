import React from "react";
import styles from "../../styles/styles";
import CountDown from "./CountDown";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import { backend_url } from "../../server";

const EventCard = ({ active, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user); // 👈 Lấy thông tin user từ Redux
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 👈 Dùng để điều hướng đến trang login

  const addToCartHandler = (data) => {
    // 👇 Kiểm tra đăng nhập trước
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login"); // 👈 Tự động điều hướng đến trang login
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

  return (
    <div
      className={`w-full block bg-white rounded-lg ${
        active ? "unset" : "mb-12"
      } lg:flex p-2`}
    >
      <div className="w-full lg:w-[30%] m-auto">
        {data?.images?.[0] ? (
          <img
            src={`${backend_url}${data.images[0]}`}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            No Image
          </div>
        )}
      </div>

      <div className="w-full lg:w-[50%] flex flex-col justify-center">
        <h2 className={`${styles.productTitle}`}>{data?.name || "No Name"}</h2>
        <p>{data?.description || "No Description"}</p>

        <div className="flex py-2 justify-between">
          <div className="flex">
            <h5 className="font-[500] text-[18px] text-[#d55b45] pr-3 line-through">
              {data?.originalPrice ? `${data.originalPrice}$` : "No Price"}
            </h5>
            <h5 className="font-bold text-[20px] text-[#333] font-Roboto">
              {data?.discountPrice
                ? `${data.discountPrice}$`
                : "No Discount Price"}
            </h5>
          </div>
          <span className="pr-3 font-[400] text-[17px] text-[#44a55e]">
            {data?.sold_out ? `${data.sold_out} sold` : "Đang Cập Nhật ..."}
          </span>
        </div>

        {data && <CountDown data={data} />}
        <br />

        <div className="flex items-center">
          <Link to={`/product/${data._id}?isEvent=true`}>
            <div className={`${styles.button} text-[#fff]`}>Xem Thêm</div>
          </Link>

          <div
            className={`${styles.button} text-[#fff] ml-5`}
            onClick={() => addToCartHandler(data)}
          >
            Thêm Vào Giỏ Hàng
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
