import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import ProductDetails from "../components/Products/ProductDetails";
import SuggestedProduct from "../components/Products/SuggestedProduct";
import { useSelector } from "react-redux";

const ProductDetailsPage = () => {
  const { allProducts } = useSelector((state) => state.products);
  const { allEvents } = useSelector((state) => state.events);
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [searchParams] = useSearchParams();
  const eventData = searchParams.get("isEvent");

  useEffect(() => {
    if (eventData !== null) {
      const data = allEvents && allEvents.find((i) => i._id === id);
      setData(data);
    } else {
      const data = allProducts && allProducts.find((i) => i._id === id);
      setData(data);
      
      // Lưu lịch sử xem sản phẩm vào localStorage
      if (data && data._id) {
        try {
          const viewedProducts = JSON.parse(localStorage.getItem('viewedProductsHistory') || '[]');
          
          // Remove if already exists
          const filtered = viewedProducts.filter((p) => p._id !== data._id);
          
          // Add to beginning with timestamp
          filtered.unshift({
            _id: data._id,
            name: data.name,
            category: data.category,
            tags: data.tags,
            viewedAt: new Date().toISOString()
          });
          
          // Limit to 20 most recent
          const limited = filtered.slice(0, 20);
          
          localStorage.setItem('viewedProductsHistory', JSON.stringify(limited));
        } catch (error) {
          console.error('Error saving viewed product history:', error);
        }
      }
    }
  }, [allProducts, allEvents, id, eventData]);

  return (
    <div>
      <Header />
      <ProductDetails data={data} />
      <Footer />
    </div>
  );
};

export default ProductDetailsPage;

