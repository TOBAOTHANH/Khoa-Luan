import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const {allProducts,isLoading} = useSelector((state) => state.products);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (categoryData === null) {
      const d = allProducts;
      allProducts && allProducts.filter((a, b) => a.sold_out - b.sold_out);
      setData(d);
    } else {
      const d =
      allProducts && allProducts.filter((i) => i.category === categoryData);
      setData(d);
    }
    //    window.scrollTo(0,0);
  }, [allProducts]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Header activeHeading={3} />
          <div className={`${styles.section} py-8`}>
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {categoryData ? `Sản phẩm: ${categoryData}` : "Tất cả Sản phẩm"}
              </h1>
              <p className="text-gray-600">
                {data && data.length > 0 
                  ? `Tìm thấy ${data.length} sản phẩm` 
                  : "Không tìm thấy sản phẩm nào"}
              </p>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-6 mb-12">
              {data && data.map((i, index) => (
                <ProductCard data={i} key={index} />
              ))}
            </div>
            
            {/* Empty State */}
            {data && data.length === 0 && (
              <div className="text-center py-20">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                  <svg
                    className="w-16 h-16 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Không tìm thấy sản phẩm
                </h2>
                <p className="text-gray-600">
                  Vui lòng thử lại với bộ lọc khác hoặc quay lại sau
                </p>
              </div>
            )}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;
