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

      <div className={`${styles.section} bg-white p-6 rounded-lg mb-12`} id="categories">
        {/* Grid: mobile 2 cột, tablet 3–4 cột, desktop 5 cột */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categoriesData?.map((i) => (
            <div
              key={i.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSubmit(i)}
              onKeyDown={(e) => (e.key === "Enter" ? handleSubmit(i) : null)}
              className="
                group w-full h-40
                bg-white border border-gray-200 rounded-2xl shadow-sm
                flex flex-col items-center justify-center text-center
                px-3
                transition-transform duration-200
                hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40
                cursor-pointer
              "
            >
              <img
                src={i.image_Url}
                alt={i.title}
                className="h-12 md:h-14 object-contain mb-2 select-none pointer-events-none"
                loading="lazy"
              />
              <h5 className="text-sm md:text-base font-medium leading-tight line-clamp-2">
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
