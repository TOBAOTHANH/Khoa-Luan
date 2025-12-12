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
  const searchQuery = searchParams.get("search");
  const {allProducts,isLoading} = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [exactMatches, setExactMatches] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Function to calculate relevance score for a product
  const calculateRelevanceScore = (product, searchTerm) => {
    if (!searchTerm) return 0;
    
    const term = searchTerm.toLowerCase().trim();
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const tags = (product.tags || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    let score = 0;
    
    // Exact name match - highest priority (100 points)
    if (name === term) {
      score += 100;
    }
    // Name starts with term (80 points)
    else if (name.startsWith(term)) {
      score += 80;
    }
    // Name contains term (60 points)
    else if (name.includes(term)) {
      score += 60;
    }
    
    // Category match (40 points)
    if (category.includes(term)) {
      score += 40;
    }
    
    // Tags match (30 points)
    if (tags.includes(term)) {
      score += 30;
    }
    
    // Description match (20 points)
    if (description.includes(term)) {
      score += 20;
    }
    
    // Word-by-word matching in name (bonus points)
    const termWords = term.split(/\s+/);
    const nameWords = name.split(/\s+/);
    termWords.forEach(word => {
      if (word.length > 2) { // Only count words longer than 2 characters
        nameWords.forEach(nameWord => {
          if (nameWord.includes(word) || word.includes(nameWord)) {
            score += 10;
          }
        });
      }
    });
    
    return score;
  };

  useEffect(() => {
    if (searchQuery) {
      // Search mode: filter and sort by relevance
      const term = searchQuery.toLowerCase().trim();
      
      if (!allProducts || allProducts.length === 0) {
        setExactMatches([]);
        setRelatedProducts([]);
        setData([]);
        return;
      }
      
      // Calculate relevance for all products
      const productsWithScore = allProducts.map(product => ({
        ...product,
        relevanceScore: calculateRelevanceScore(product, term)
      }));
      
      // Filter products with any relevance
      const relevantProducts = productsWithScore.filter(p => p.relevanceScore > 0);
      
      // Sort by relevance score (descending)
      relevantProducts.sort((a, b) => {
        // First sort by relevance score
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        // If same relevance, sort by sold_out (more popular first)
        return (b.sold_out || 0) - (a.sold_out || 0);
      });
      
      // Separate exact matches (high relevance) from related products
      const exact = relevantProducts.filter(p => p.relevanceScore >= 60);
      const related = relevantProducts.filter(p => p.relevanceScore > 0 && p.relevanceScore < 60);
      
      setExactMatches(exact);
      setRelatedProducts(related);
      setData([...exact, ...related]);
    } else if (categoryData) {
      // Category filter mode
      const d = allProducts && allProducts.filter((i) => i.category === categoryData);
      setData(d || []);
      setExactMatches([]);
      setRelatedProducts([]);
    } else {
      // All products mode
      const d = allProducts || [];
      setData(d);
      setExactMatches([]);
      setRelatedProducts([]);
    }
    //    window.scrollTo(0,0);
  }, [allProducts, searchQuery, categoryData]);

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
                {searchQuery 
                  ? `Kết quả tìm kiếm: "${searchQuery}"` 
                  : categoryData 
                    ? `Sản phẩm: ${categoryData}` 
                    : "Tất cả Sản phẩm"}
              </h1>
              <p className="text-gray-600">
                {data && data.length > 0 
                  ? `Tìm thấy ${data.length} sản phẩm` 
                  : "Không tìm thấy sản phẩm nào"}
              </p>
            </div>
            
            {/* Exact Matches Section (only show when searching) */}
            {searchQuery && exactMatches && exactMatches.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Sản phẩm chính xác ({exactMatches.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-6 mb-8">
                  {exactMatches.map((i, index) => (
                    <ProductCard data={i} key={`exact-${index}`} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Products Section (only show when searching) */}
            {searchQuery && relatedProducts && relatedProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Sản phẩm liên quan ({relatedProducts.length})
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-6 mb-8">
                  {relatedProducts.map((i, index) => (
                    <ProductCard data={i} key={`related-${index}`} />
                  ))}
                </div>
              </div>
            )}
            
            {/* All Products Grid (when not searching or no exact/related matches) */}
            {(!searchQuery || (exactMatches.length === 0 && relatedProducts.length === 0)) && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 xl:gap-6 mb-12">
                {data && data.map((i, index) => (
                  <ProductCard data={i} key={index} />
                ))}
              </div>
            )}
            
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
