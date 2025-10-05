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
    console.log("Product clicked:", product);

    
    window.location.reload();
  };

  return (
    <div>
      {data ? (
        <div className={`p-4 ${styles.section}`}>
          <h2
            className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}
          >
            Related Product
          </h2>
          <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
            {filteredProducts &&
              filteredProducts.map((product, index) => (
                <div
                  key={index}
                  onClick={() => handleProductClick(product)}
                >
                  <ProductCard data={product} />
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SuggestedProducts;
