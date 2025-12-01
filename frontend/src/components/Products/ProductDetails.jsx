import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsShop, getAllProducts } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import { toast } from "react-toastify";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import Ratings from "./Ratings";
import axios from "axios";
import AccessoryRecommendations from "./AccessoryRecommendations";

const ProductDetails = ({ data }) => {
  const [count, setCount] = useState(1);
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { products } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllProductsShop(data && data?.shop._id));
    if (wishlist && wishlist.find((i) => i._id === data?._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [data, wishlist]);
  const decrementCount = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  const incrementCount = () => {
    setCount(count + 1);
  };
  

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);
    if (isItemExists) {
      toast.error("Item already in cart!");
    } else {
      if (data.stock < 1) {
        toast.error("Product stock limited!");
      } else {
        const cartData = { ...data, qty: count };
        dispatch(addTocart(cartData));
        toast.success("Item added to cart successfully!");
      }
    }
  };

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + product.reviews.length, 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + product.reviews.reduce((sum, review) => sum + review.rating, 0),
      0
    );

  const avg = totalRatings / totalReviewsLength || 0;

  const averageRating = avg.toFixed(2);

  const handleMessageSubmit = async () => {
    if (isAuthenticated) {
      // Tạo groupTitle từ userId + sellerId để đảm bảo mỗi cặp user-seller chỉ có 1 conversation
      // Thay vì dùng product._id để tránh tạo nhiều conversation cho cùng 1 shop
      const userId = user._id;
      const sellerId = data.shop._id;
      const groupTitle = `${userId}_${sellerId}`;
      
      await axios
        .post(`${server}/conversation/create-new-conversation`, {
          groupTitle,
          userId,
          sellerId,
        })
        .then((res) => {
          navigate(`/inbox?${res.data.conversation._id}`);
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Failed to create conversation");
        });
    } else {
      toast.error("Please login to create a conversation");
    }
  };
  

  return (
    <div className="bg-white">
      {data ? (
        <div className={`${styles.section} w-[90%] 800px:w-[80%]`}>
          <div className="w-full py-5">
            <div className="block w-full 800px:flex">
              <div className="w-full 800px:w-[50%]">
                <img
                  src={`${backend_url}${data && data.images[select]}`}
                  alt=""
                  className="w-[80%]"
                />
                <div className="w-full flex">
                  {data &&
                    data.images.map((i, index) => (
                      <div
                        className={`${
                          select === 0 ? "border" : "null"
                        } cursor-pointer`}
                      >
                        <img
                          src={`${backend_url}${i}`}
                          alt=""
                          className="h-[200px] overflow-hidden mr-3 mt-3"
                          onClick={() => setSelect(index)}
                        />
                      </div>
                    ))}
                  <div
                    className={`${
                      select === 1 ? "border" : "null"
                    } cursor-pointer`}
                  ></div>
                </div>
              </div>
              <div className="w-full 800px:w-[50%] pt-5">
                <h1 className={`${styles.productTitle}`}>{data.name}</h1>
                {/* <p>{data.description}</p> */}
                <div className="flex pt-3">
                  <h4 className={`${styles.productDiscountPrice}`}>
                    {data.discountPrice}$
                  </h4>
                  <h3 className={`${styles.price}`}>
                    {data.originalPrice ? data.originalPrice + "$" : null}
                  </h3>
                </div>
                <div className="flex items-center mt-12 justify-between pr-3">
                  <div>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={decrementCount}
                    >
                      -
                    </button>
                    <span className="bg-gray-200 text-gray-800 font-medium px-4 py-[11px]">
                      {count}
                    </span>
                    <button
                      className="bg-gradient-to-r from-teal-400 to-teal-500 text-white font-bold rounded-l px-4 py-2 shadow-lg hover:opacity-75 transition duration-300 ease-in-out"
                      onClick={incrementCount}
                    >
                      +
                    </button>
                  </div>
                  <div>
                    {click ? (
                      <AiFillHeart
                        size={22}
                        className="cursor-pointer "
                        onClick={() => removeFromWishlistHandler(data)}
                        color={click ? "red" : "#333"}
                        title="Xóa khỏi danh sách yêu thích"
                      />
                    ) : (
                      <AiOutlineHeart
                        size={22}
                        className="cursor-pointer "
                        onClick={() => addToWishlistHandler(data)}
                        color={click ? "red" : "#333"}
                        title="Thêm vào danh sách yêu thích"
                      />
                    )}
                  </div>
                </div>
                <div
                  className="!mt-6 w-full"
                  onClick={() => addToCartHandler(data._id)}
                >
                  <button className="w-full bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 whitespace-nowrap">
                    <AiOutlineShoppingCart size={20} />
                    <span>Thêm vào giỏ hàng</span>
                  </button>
                </div>
                {/* Phụ kiện khuyến nghị */}
                <AccessoryRecommendations product={data} />
                
                <div className="flex items-center pt-8">
                  <Link to={`/shop/preview/${data?.shop._id}`}>
                    <img
                      src={`${backend_url}${data?.shop?.avatar.public_id}`}
                      alt=""
                      className="w-[50px] h-[50px] rounded-full mr-2"
                    />
                  </Link>
                  <div className="pr-8">
                    <Link to={`/shop/preview/${data?.shop._id}`}>
                      <h3 className={`${styles.shop_name} pb-1 pt-1`}>
                        {data.shop.name}
                      </h3>
                    </Link>
                    <h5 className="pb-3 text-[15px]">
                      <Ratings rating={data?.ratings} />
                    </h5>
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-[#6443d1] to-[#7c5dd8] hover:from-[#5335b0] hover:to-[#6443d1] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 whitespace-nowrap mt-4"
                    onClick={handleMessageSubmit}
                  >
                    <AiOutlineMessage size={18} />
                    <span>Gửi tin nhắn</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ProductDetailsInfo data={data} products={products} totalReviewsLength={totalReviewsLength} averageRating={averageRating} />
          <br />
          <br />
        </div>
      ) : null}
    </div>
  );
};
const ProductDetailsInfo = ({ data, products, totalReviewsLength, averageRating }) => {
  const [active, setActive] = useState(1);
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [shopFeedback, setShopFeedback] = useState("");
  const dispatch = useDispatch();
  const isShopOwner = seller?._id === data?.shop?._id || user?.role === "Seller";

  return (
    <div className="bg-[#f5f6fb] px-3 800px:px-10 py-2 rounded ">
      <div className="w-full flex justify-between border-b pt-10 pb-2">
        <div className="relative">
          <h5
            className={
              "text-[#000] text-[18px] px-1 font-[600] cursor-pointer 800px:text-[20px]"
            }
            onClick={() => setActive(1)}
          >
            Chi tiết sản phẩm
          </h5>
          {active === 1 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
        <div className="relative">
          <h5
            className={
              "text-[#000] text-[18px] px-1 font-[600] cursor-pointer 800px:text-[20px]"
            }
            onClick={() => setActive(2)}
          >
            Đánh giá sản phẩm
          </h5>
          {active === 2 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
        <div className="relative">
          <h5
            className={
              "text-[#000] text-[18px] px-1 font-[600] cursor-pointer 800px:text-[20px]"
            }
            onClick={() => setActive(3)}
          >
            Thông tin người bán
          </h5>
          {active === 3 ? (
            <div className={`${styles.active_indicator}`} />
          ) : null}
        </div>
      </div>
      {active === 1 ? (
        <>
          <p className="py-2 text-[18px] leading-8 pb-10 whitespace-pre-line ">
            {data.description}
          </p>
        </>
      ) : null}
      {active === 2 ? (
        <div className="w-full min-h-[40vh] flex flex-col items-center py-3 overflow-y-scroll">
          {data &&
            data.reviews.map((item, index) => (
              <div key={index} className="w-full mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="flex items-start">
                  <img
                    src={`${backend_url}${item.user?.avatar?.public_id || item.user?.avatar?.url}`}
                    alt={item.user?.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50";
                    }}
                  />
                  <div className="pl-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h1 className="font-semibold text-gray-800">{item.user?.name || 'Khách hàng'}</h1>
                        <Ratings rating={item.rating || data?.ratings} />
                        <span className="text-sm text-gray-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{item.comment}</p>
                    
                    {/* Shop Feedback */}
                    {item.shopFeedback && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-semibold text-blue-800">💬 Phản hồi từ shop:</span>
                          {item.shopFeedbackDate && (
                            <span className="ml-2 text-xs text-gray-600">
                              {new Date(item.shopFeedbackDate).toLocaleDateString('vi-VN')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800">{item.shopFeedback}</p>
                      </div>
                    )}
                    
                    {/* Add Feedback Button for Shop Owner */}
                    {isShopOwner && !item.shopFeedback && (
                      <button
                        onClick={() => {
                          setSelectedReview(item);
                          setFeedbackOpen(true);
                        }}
                        className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        💬 Phản hồi đánh giá
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          <div className="w-full flex justify-center">
            {data && data.reviews.length === 0 && (
              <div className="text-center py-8">
                <h5 className="text-gray-500 text-lg">Chưa có đánh giá cho sản phẩm này!</h5>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {active === 3 && (
        <div className="w-full block 800px:flex p-5">
          <div className="w-full 800px:w-[50%]">
            <Link to={`/shop/preview/${data.shop._id}`}>
              <div className="flex items-center">
                <img
                  src={`${backend_url}${data?.shop?.avatar.public_id}`}
                  className="w-[50px] h-[50px] rounded-full"
                  alt=""
                />
                <div className="pl-3">
                  <h3 className={`${styles.shop_name}`}>{data.shop.name}</h3>
                  <h5 className="pb-2 text-[15px]">(4/5) Đánh giá</h5>
                </div>
              </div>
            </Link>
            <p className="pt-2">{data.shop.description}</p>
          </div>
          <div className="w-full 800px:w-[50%] mt-5 800px:flex flex-col items-end">
            <div className="text-left">
              <h5 className="font-[600]">
                Joined on:{" "}
                <span className="font-[500]">
                  {data.shop?.createdAt?.slice(0, 10)}
                </span>
              </h5>
              <h5 className="font-[600] pt-3">
                Total Products:{" "}
                <span className="font-[500]">
                  {products && products.length}
                </span>
              </h5>
              <h5 className="font-[600] pt-3">
                Tổng đánh giá: <span className="font-[500]">{totalReviewsLength}</span>
              </h5>
              <Link to="/">
                <div
                  className={`${styles.button} !rounded-[4px] !h-[39,5px] mt-3`}
                >
                  <h4 className="text-white">Xem cửa hàng</h4>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Shop Feedback Modal */}
      {feedbackOpen && selectedReview && (
        <div className="w-full fixed top-0 left-0 h-screen bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-6">
            <div className="w-full flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Phản hồi đánh giá</h2>
              <RxCross1
                size={28}
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedReview(null);
                  setShopFeedback("");
                }}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              />
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Đánh giá từ: <strong>{selectedReview.user?.name}</strong></p>
              <p className="text-gray-700">{selectedReview.comment}</p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Phản hồi của shop <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                value={shopFeedback}
                onChange={(e) => setShopFeedback(e.target.value)}
                placeholder="Viết phản hồi cho đánh giá này..."
                className="w-full border-2 border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedReview(null);
                  setShopFeedback("");
                }}
              >
                Hủy
              </button>
              <button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  if (shopFeedback.trim()) {
                    try {
                      await axios.put(
                        `${server}/product/add-shop-feedback`,
                        {
                          productId: data._id,
                          reviewId: selectedReview._id,
                          userId: selectedReview.user?._id,
                          shopFeedback: shopFeedback.trim(),
                        },
                        { withCredentials: true }
                      );
                      toast.success("Phản hồi đánh giá thành công!");
                      setFeedbackOpen(false);
                      setSelectedReview(null);
                      setShopFeedback("");
                      // Reload products to update the review with shop feedback
                      dispatch(getAllProducts());
                      // Also reload shop products
                      if (data?.shop?._id) {
                        dispatch(getAllProductsShop(data.shop._id));
                      }
                      // Small delay to ensure state is updated before reload
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    } catch (error) {
                      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
                    }
                  }
                }}
                disabled={!shopFeedback.trim()}
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
