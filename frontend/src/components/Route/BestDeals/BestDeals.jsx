import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCard";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const { allProducts } = useSelector((state) => state.products);
  useEffect(() => {
    const allProductsData = allProducts ? [...allProducts] : [];
    // Sắp xếp theo số lượng đã bán (sold_out) - sản phẩm hot nhất
    const sortedData = allProductsData?.sort((a, b) => {
      const soldA = a.sold_out || 0;
      const soldB = b.sold_out || 0;
      return soldB - soldA;
    });
    // Lấy top 10 sản phẩm bán chạy nhất
    const topProducts = sortedData && sortedData.slice(0, 10);
    setData(topProducts);
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
