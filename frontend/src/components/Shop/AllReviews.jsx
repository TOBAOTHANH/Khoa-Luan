import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllReviewsShop } from "../../redux/actions/product";
import { AiOutlineMessage, AiFillStar, AiOutlineStar } from "react-icons/ai";
import { HiOutlineUserGroup } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import Loader from "../Layout/Loader";
import Ratings from "../Products/Ratings";
import ImageModal from "../Common/ImageModal";

const AllReviews = () => {
  const dispatch = useDispatch();
  const { reviews, isLoading } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState('all');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [shopFeedback, setShopFeedback] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    dispatch(getAllReviewsShop());
  }, [dispatch]);

  // Categorize reviews by status
  const categorizedReviews = useMemo(() => {
    if (!reviews) return { all: [], responded: [], notResponded: [] };
    
    const responded = reviews.filter(review => review.shopFeedback && review.shopFeedback.trim() !== "");
    const notResponded = reviews.filter(review => !review.shopFeedback || review.shopFeedback.trim() === "");
    
    return {
      all: reviews,
      responded,
      notResponded
    };
  }, [reviews]);

  const handleFeedbackSubmit = async () => {
    if (!shopFeedback.trim() || !selectedReview) return;

    try {
      await axios.put(
        `${server}/product/add-shop-feedback`,
        {
          productId: selectedReview.productId,
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
      dispatch(getAllReviewsShop()); // Refresh reviews
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const displayReviews = categorizedReviews[activeTab] || [];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Phản Hồi Đánh Giá</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({categorizedReviews.all.length})
            </button>
            <button
              onClick={() => setActiveTab('responded')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'responded'
                  ? 'bg-green-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã phản hồi ({categorizedReviews.responded.length})
            </button>
            <button
              onClick={() => setActiveTab('notResponded')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === 'notResponded'
                  ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa phản hồi ({categorizedReviews.notResponded.length})
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {displayReviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <HiOutlineUserGroup className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg">
                  {activeTab === 'all' 
                    ? "Chưa có đánh giá nào" 
                    : activeTab === 'responded'
                    ? "Chưa có đánh giá nào đã được phản hồi"
                    : "Tất cả đánh giá đã được phản hồi"}
                </p>
              </div>
            ) : (
              displayReviews.map((review, index) => (
                <div
                  key={review._id || index}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      {review.productImage ? (
                        <img
                          src={`${backend_url}${review.productImage}`}
                          alt={review.productName || "Sản phẩm"}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            // Try with uploads/ prefix if first attempt fails
                            if (!e.target.src.includes('placeholder') && !e.target.src.includes('uploads/')) {
                              e.target.src = `${backend_url}uploads/${review.productImage}`;
                            } else {
                              e.target.src = "https://via.placeholder.com/150?text=No+Image";
                              e.target.onerror = null;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300">
                          <span className="text-gray-400 text-xs text-center px-2">Không có hình</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {/* Product Name */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {review.productName || "Sản phẩm"}
                      </h3>

                      {/* User Info & Rating */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">
                            {review.user?.name || "Khách hàng"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Ratings rating={review.rating} />
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : ""}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 mb-4 bg-white p-3 rounded-lg border border-gray-200">
                        {review.comment || "Không có bình luận"}
                      </p>

                      {/* Review Images */}
                      {review.reviewImages && review.reviewImages.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Ảnh minh chứng:</p>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {review.reviewImages.map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative group cursor-pointer"
                                onClick={() => {
                                  const imageUrls = review.reviewImages.map(i => `${backend_url}${i}`);
                                  setSelectedImages(imageUrls);
                                  setSelectedImageIndex(imgIndex);
                                  setImageModalOpen(true);
                                }}
                              >
                                <img
                                  src={`${backend_url}${img}`}
                                  alt={`Review image ${imgIndex + 1}`}
                                  className="w-full h-20 md:h-24 object-contain rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm bg-gray-50"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Shop Feedback */}
                      {review.shopFeedback && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center mb-2">
                            <AiOutlineMessage className="text-blue-600 mr-2" size={18} />
                            <span className="text-sm font-semibold text-blue-800">
                              Phản hồi từ shop:
                            </span>
                            {review.shopFeedbackDate && (
                              <span className="ml-2 text-xs text-gray-600">
                                {new Date(review.shopFeedbackDate).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-800">{review.shopFeedback}</p>
                        </div>
                      )}

                      {/* Add Feedback Button */}
                      {!review.shopFeedback && (
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setFeedbackOpen(true);
                          }}
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          💬 Phản hồi đánh giá
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackOpen && selectedReview && (
        <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">Phản hồi đánh giá</h3>
              <button
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedReview(null);
                  setShopFeedback("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RxCross1 size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Sản phẩm: <span className="font-semibold">{selectedReview.productName}</span></p>
              <p className="text-sm text-gray-600 mb-2">Khách hàng: <span className="font-semibold">{selectedReview.user?.name || "Khách hàng"}</span></p>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-600">Đánh giá:</span>
                <Ratings rating={selectedReview.rating} />
              </div>
              <p className="text-gray-700 italic">"{selectedReview.comment || "Không có bình luận"}"</p>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Phản hồi của bạn
              </label>
              <textarea
                value={shopFeedback}
                onChange={(e) => setShopFeedback(e.target.value)}
                placeholder="Viết phản hồi của bạn cho đánh giá này..."
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setFeedbackOpen(false);
                  setSelectedReview(null);
                  setShopFeedback("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!shopFeedback.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setSelectedImages([]);
        }}
        images={selectedImages}
        currentIndex={selectedImageIndex}
      />
    </>
  );
};

export default AllReviews;

