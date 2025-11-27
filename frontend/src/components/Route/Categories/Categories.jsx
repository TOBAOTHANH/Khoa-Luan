import React from "react";
import { useNavigate } from "react-router-dom";
import { brandingData, categoriesData } from "../../../static/data";
import styles from "../../../styles/styles";

const Categories = () => {
  const navigate = useNavigate();
  const handleSubmit = (item) => {
    navigate(`/products?category=${encodeURIComponent(item.title)}`);
  };

  return (
    <>
      {/* Branding bỏ qua nếu chưa cần */}

      <div className={`${styles.section} bg-white p-6 rounded-xl mb-12 shadow-sm`} id="categories">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-teal-500 rounded-full"></div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                📦 Danh Mục Sản Phẩm
              </h1>
              <div className="w-12 h-1 bg-gradient-to-r from-teal-500 to-green-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-lg">Khám phá các danh mục sản phẩm đa dạng</p>
        </div>
        {/* Grid: mobile 2 cột, tablet 3–4 cột, desktop 5 cột */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {categoriesData?.map((i) => (
            <div
              key={i.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSubmit(i)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(i) : null)}
              className="
                group w-full h-44
                bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl shadow-md
                flex flex-col items-center justify-center text-center
                px-3
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-xl hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                cursor-pointer
              "
            >
              <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                <img
                  src={i.image_Url}
                  alt={i.title}
                  className="h-20 md:h-24 object-contain select-none pointer-events-none"
                  loading="lazy"
                />
              </div>
              <h5 className="text-sm md:text-base font-semibold text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {i.title}
              </h5>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Categories;
