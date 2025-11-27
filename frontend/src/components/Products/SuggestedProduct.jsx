import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { productData } from "../../static/data";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";

const SuggestedProducts = ({ data }) => {
  const { allProducts } = useSelector((state) => state.products);
  const [filteredProducts, setFilteredProducts] = useState();
  window.scrollTo(0, 0); // tự động scroll lên đầu trang khi chuyển qua trang khác
  useEffect(() => {
    const filtered =
      allProducts && allProducts.filter((i) => i.category === data.category);
    setFilteredProducts(filtered);
  }, [allProducts, data]);

  // Function to handle click event
  const handleProductClick = (product) => {
    // Navigate to product details page instead of reloading
    window.location.href = `/product/${product._id}`;
  };

  return (
    <div>
      {data ? (
        <div className={`p-4 ${styles.section} bg-gradient-to-br from-gray-50 to-white`}>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <span className="mr-3">✨</span>
              Sản phẩm liên quan
            </h2>
            <p className="text-gray-600">Các sản phẩm tương tự bạn có thể quan tâm</p>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-red-500 mt-3 rounded"></div>
          </div>
          
          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-6 mb-12">
              {filteredProducts
                .filter(product => product._id !== data._id) // Exclude current product
                .slice(0, 10) // Limit to 10 products
                .map((product, index) => (
                  <div
                    key={product._id || index}
                    onClick={() => handleProductClick(product)}
                    className="transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                  >
                    <ProductCard data={product} />
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500 text-lg">Không có sản phẩm liên quan nào</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProducts;
