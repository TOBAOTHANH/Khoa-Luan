import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const FeaturedProduct = () => {
  const {allProducts} = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  // Mapping category và keywords với phụ kiện
  const getAccessoryMapping = () => {
    return {
      phone: {
        keywords: ["điện thoại", "phone", "smartphone", "mobile", "iphone", "samsung", "xiaomi", "oppo", "vivo"],
        accessories: ["ốp lưng", "tai nghe", "sạc", "cáp", "dán màn hình", "pin dự phòng", "bao da", "kính cường lực"]
      },
      desktop: {
        keywords: ["máy tính để bàn", "desktop", "pc", "máy tính bàn", "computer", "workstation"],
        accessories: ["chuột", "tai nghe", "bàn phím", "loa", "webcam", "microphone", "tai nghe gaming", "chuột gaming"]
      },
      laptop: {
        keywords: ["laptop", "notebook", "máy tính xách tay", "macbook"],
        accessories: ["tai nghe", "chuột", "túi đựng", "bàn phím", "loa", "webcam", "chuột không dây", "tai nghe bluetooth"]
      },
      monitor: {
        keywords: ["màn hình", "monitor", "display", "screen"],
        accessories: ["giá treo", "cáp", "kính bảo vệ mắt", "khăn lau", "giá treo màn hình"]
      },
      refrigerator: {
        keywords: ["tủ lạnh", "refrigerator", "fridge"],
        accessories: []
      },
      washing: {
        keywords: ["máy giặt", "washing", "washing machine"],
        accessories: []
      },
      airconditioner: {
        keywords: ["máy lạnh", "air conditioner", "airconditioner", "điều hòa"],
        accessories: []
      }
    };
  };

  // Function to get related products based on recent history only
  const getRelatedProductsFromHistory = (products) => {
    if (!products || products.length === 0) return [];
    
    try {
      // Chỉ lấy 1-2 từ khóa tìm kiếm gần nhất
      const searchKeywords = JSON.parse(localStorage.getItem('searchKeywordsHistory') || '[]').slice(0, 2);
      
      // Chỉ lấy 3-5 sản phẩm xem gần nhất
      const viewedProducts = JSON.parse(localStorage.getItem('viewedProductsHistory') || '[]').slice(0, 5);
      
      // If no recent history, return empty array (will fall back to default)
      if (searchKeywords.length === 0 && viewedProducts.length === 0) {
        return [];
      }
      
      // Lấy category và tags từ các sản phẩm gần nhất
      const recentCategories = new Set();
      const recentTags = new Set();
      const recentProductNames = [];
      
      viewedProducts.forEach(p => {
        if (p.category) recentCategories.add(p.category.toLowerCase());
        if (p.tags) {
          const tags = p.tags.toLowerCase().split(',').map(t => t.trim()).filter(t => t);
          tags.forEach(tag => recentTags.add(tag));
        }
        if (p.name) recentProductNames.push(p.name.toLowerCase());
      });
      
      // Tìm category phụ kiện phù hợp
      const accessoryMapping = getAccessoryMapping();
      const relatedAccessories = new Set();
      
      // Kiểm tra từ các sản phẩm gần nhất để tìm phụ kiện liên quan
      recentProductNames.forEach(productName => {
        for (const [key, value] of Object.entries(accessoryMapping)) {
          const isMatch = value.keywords.some(keyword => 
            productName.includes(keyword)
          );
          if (isMatch && value.accessories.length > 0) {
            value.accessories.forEach(acc => relatedAccessories.add(acc.toLowerCase()));
          }
        }
      });
      
      // Kiểm tra từ khóa tìm kiếm
      searchKeywords.forEach(keyword => {
        for (const [key, value] of Object.entries(accessoryMapping)) {
          const isMatch = value.keywords.some(kw => keyword.includes(kw) || kw.includes(keyword));
          if (isMatch && value.accessories.length > 0) {
            value.accessories.forEach(acc => relatedAccessories.add(acc.toLowerCase()));
          }
        }
      });
      
      // Score products based on relevance to recent history and trend
      const scoredProducts = products.map(product => {
        // Calculate trend score
        const ratingScore = (product.ratings || 0) * 0.4;
        const reviewCount = product.reviews ? product.reviews.length : 0;
        const reviewScore = Math.min(reviewCount / 10, 1) * 0.3;
        const now = new Date();
        const createdAt = new Date(product.createdAt || now);
        const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 1 - daysSinceCreation / 30) * 0.3;
        const trendScore = ratingScore + reviewScore + recencyScore;
        
        // Calculate history relevance score
        let historyScore = 0;
        const productCategory = (product.category || '').toLowerCase();
        const productTags = (product.tags || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        // Loại trừ các sản phẩm đã xem
        const wasRecentlyViewed = viewedProducts.some(p => p._id === product._id);
        if (wasRecentlyViewed) {
          return { ...product, trendScore, historyScore: 0, combinedScore: 0 };
        }
        
        // Kiểm tra category match với sản phẩm gần nhất (ưu tiên cao nhất)
        if (recentCategories.has(productCategory)) {
          historyScore += 100;
        }
        
        // Kiểm tra tag matches với sản phẩm gần nhất
        recentTags.forEach(tag => {
          if (tag.length > 2) {
            if (productTags.includes(tag) || productName.includes(tag)) {
              historyScore += 50;
            }
          }
        });
        
        // Kiểm tra từ khóa tìm kiếm gần nhất
        searchKeywords.forEach(keyword => {
          if (productName.includes(keyword)) {
            historyScore += 80;
          }
          if (productCategory.includes(keyword)) {
            historyScore += 60;
          }
          if (productTags.includes(keyword)) {
            historyScore += 40;
          }
        });
        
        // Kiểm tra phụ kiện liên quan
        relatedAccessories.forEach(accessory => {
          if (productName.includes(accessory) || 
              productCategory.includes(accessory) || 
              productTags.includes(accessory)) {
            historyScore += 70; // Phụ kiện có điểm cao
          }
        });
        
        // Combine trend score with history relevance
        // History relevance gets 60% weight, trend score gets 40% weight
        const combinedScore = (historyScore * 0.6) + (trendScore * 100 * 0.4);
        
        return { 
          ...product, 
          trendScore,
          historyScore,
          combinedScore 
        };
      });
      
      // Chỉ lấy sản phẩm có historyScore > 0 (liên quan) và sắp xếp
      const relevantProducts = scoredProducts
        .filter(p => p.historyScore > 0)
        .sort((a, b) => {
          if (Math.abs(a.combinedScore - b.combinedScore) > 0.01) {
            return b.combinedScore - a.combinedScore;
          }
          if (Math.abs(a.trendScore - b.trendScore) > 0.01) {
            return b.trendScore - a.trendScore;
          }
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      
      return relevantProducts;
    } catch (error) {
      console.error('Error getting related products from history:', error);
      return [];
    }
  };

  useEffect(() => {
    if (allProducts && allProducts.length > 0) {
      // Try to get related products from history
      const relatedProducts = getRelatedProductsFromHistory(allProducts);
      
      if (relatedProducts.length > 0) {
        // Use related products if available
        setData(relatedProducts);
      } else {
        // Fall back to default: trend-based products
        const productsWithTrendScore = allProducts.map((product) => {
          const ratingScore = (product.ratings || 0) * 0.4;
          const reviewCount = product.reviews ? product.reviews.length : 0;
          const reviewScore = Math.min(reviewCount / 10, 1) * 0.3;
          const now = new Date();
          const createdAt = new Date(product.createdAt || now);
          const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
          const recencyScore = Math.max(0, 1 - daysSinceCreation / 30) * 0.3;
          const trendScore = ratingScore + reviewScore + recencyScore;
          
          return {
            ...product,
            trendScore
          };
        });
        
        const sortedData = productsWithTrendScore.sort((a, b) => {
          if (Math.abs(a.trendScore - b.trendScore) < 0.01) {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          }
          return b.trendScore - a.trendScore;
        });
        
        setData(sortedData);
      }
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