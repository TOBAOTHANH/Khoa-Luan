import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const FeaturedProduct = () => {
  const {allProducts} = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      // Tính điểm xu hướng thị trường cho mỗi sản phẩm
      const productsWithTrendScore = allProducts.map((product) => {
        // Điểm ratings (0-5) - chiếm 40%
        const ratingScore = (product.ratings || 0) * 0.4;
        
        // Điểm số lượng reviews - chiếm 30%
        const reviewCount = product.reviews ? product.reviews.length : 0;
        const reviewScore = Math.min(reviewCount / 10, 1) * 0.3; // Normalize: 10 reviews = max
        
        // Điểm thời gian tạo mới - chiếm 30%
        // Sản phẩm mới hơn có điểm cao hơn
        const now = new Date();
        const createdAt = new Date(product.createdAt || now);
        const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24); // Số ngày
        // Sản phẩm trong 30 ngày gần đây có điểm cao nhất
        const recencyScore = Math.max(0, 1 - daysSinceCreation / 30) * 0.3;
        
        // Tổng điểm xu hướng
        const trendScore = ratingScore + reviewScore + recencyScore;
        
        return {
          ...product,
          trendScore
        };
      });
      
      // Sắp xếp theo điểm xu hướng giảm dần
      const sortedData = productsWithTrendScore.sort((a, b) => {
        // Nếu điểm xu hướng bằng nhau, ưu tiên sản phẩm mới hơn
        if (Math.abs(a.trendScore - b.trendScore) < 0.01) {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        }
        return b.trendScore - a.trendScore;
      });
      
      setData(sortedData);
    } else {
      setData([]);
    }
  }, [allProducts]);
   
  return (
    <div>
      <div className={`${styles.section}`}>
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <h1 className={`${styles.heading} text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                ⭐ Sản Phẩm Nổi Bật
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-lg">Sản phẩm được đánh giá cao và xu hướng</p>
        </div>
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
        {
            data && data.length !== 0 &&(
              <>
               {data && data.map((i, index) => <ProductCard data={i} key={index} />)}
              </>
            )
           }
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;