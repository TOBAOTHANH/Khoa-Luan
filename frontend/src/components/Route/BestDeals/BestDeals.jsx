import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const { allProducts } = useSelector((state) => state.products);
  
  // Mapping category và keywords với phụ kiện (tương tự AccessoryRecommendations)
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
      
      // Score products based on relevance to recent history
      const scoredProducts = products.map(product => {
        let score = 0;
        const productCategory = (product.category || '').toLowerCase();
        const productTags = (product.tags || '').toLowerCase();
        const productName = (product.name || '').toLowerCase();
        
        // Loại trừ các sản phẩm đã xem
        const wasRecentlyViewed = viewedProducts.some(p => p._id === product._id);
        if (wasRecentlyViewed) {
          return { ...product, relevanceScore: 0 }; // Không hiển thị sản phẩm đã xem
        }
        
        // Kiểm tra category match với sản phẩm gần nhất (ưu tiên cao nhất)
        if (recentCategories.has(productCategory)) {
          score += 100;
        }
        
        // Kiểm tra tag matches với sản phẩm gần nhất
        recentTags.forEach(tag => {
          if (tag.length > 2) { // Chỉ xét tag có độ dài > 2
            if (productTags.includes(tag) || productName.includes(tag)) {
              score += 50;
            }
          }
        });
        
        // Kiểm tra từ khóa tìm kiếm gần nhất
        searchKeywords.forEach(keyword => {
          if (productName.includes(keyword)) {
            score += 80;
          }
          if (productCategory.includes(keyword)) {
            score += 60;
          }
          if (productTags.includes(keyword)) {
            score += 40;
          }
        });
        
        // Kiểm tra phụ kiện liên quan
        relatedAccessories.forEach(accessory => {
          if (productName.includes(accessory) || 
              productCategory.includes(accessory) || 
              productTags.includes(accessory)) {
            score += 70; // Phụ kiện có điểm cao
          }
        });
        
        return { ...product, relevanceScore: score };
      });
      
      // Chỉ lấy sản phẩm có điểm > 0 (liên quan) và sắp xếp
      const relevantProducts = scoredProducts
        .filter(p => p.relevanceScore > 0)
        .sort((a, b) => {
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          return (b.sold_out || 0) - (a.sold_out || 0);
        });
      
      return relevantProducts.slice(0, 10); // Return top 10
    } catch (error) {
      console.error('Error getting related products from history:', error);
      return [];
    }
  };
  
  useEffect(() => {
    const allProductsData = allProducts ? [...allProducts] : [];
    
    // Try to get related products from history
    const relatedProducts = getRelatedProductsFromHistory(allProductsData);
    
    if (relatedProducts.length > 0) {
      // Use related products if available
      setData(relatedProducts);
    } else {
      // Fall back to default: top selling products
      const sortedData = allProductsData?.sort((a, b) => {
        const soldA = a.sold_out || 0;
        const soldB = b.sold_out || 0;
        return soldB - soldA;
      });
      const topProducts = sortedData && sortedData.slice(0, 10);
      setData(topProducts || []);
    }
  }, [allProducts]);


  return (
    <div>
      <div className={`${styles.section}`}>
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
              <h1 className={`${styles.heading} text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent`}>
                🔥 Sản Phẩm Bán Chạy
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-lg">Những sản phẩm được yêu thích nhất</p>
        </div>
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12 border-0">
          {
            data && data.length !== 0 && (
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

export default BestDeals;
