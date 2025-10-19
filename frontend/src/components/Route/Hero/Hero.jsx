import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../../styles/styles";

const slides = [
  {
    id: 1,
    image:
      "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    title: "Khám Phá Thế Giới Mua Sắm Hiện Đại",
    description:
      "Từ thiết bị điện tử thông minh, thời trang sành điệu đến đồ gia dụng tiện ích – tất cả chỉ trong một cú nhấp chuột. Ưu đãi độc quyền mỗi ngày, mua sắm thả ga không lo về giá!",
  },
  {
    id: 2,
    image:
      "https://phanmemniemtin.com/Uploads/2022_09_24_09_30_17_1c225b0d41e485badcf5.jpg",
    title: "Công Nghệ Dẫn Đầu – Giá Luôn Thấp!",
    description:
      "Laptop, điện thoại, tai nghe, phụ kiện chính hãng – cập nhật liên tục xu hướng công nghệ mới nhất. Bảo hành toàn quốc, giao hàng siêu tốc!",
  },
  {
    id: 3,
    image:
      "https://gooccho.vn/wp-content/uploads/2018/12/thiet-ke-noi-that-phong-khach-lien-phong-an.jpg",
    title: "Không Gian Sống Đẳng Cấp – Trang Trí Ngay Hôm Nay",
    description:
      "Biến ngôi nhà của bạn thành tổ ấm hoàn hảo với đồ nội thất và trang trí tinh tế. Chất lượng vượt trội, phong cách hiện đại, giá siêu ưu đãi!",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative min-h-[50vh] 800px:min-h-[50vh] w-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute top-0 left-0 w-full h-full bg-cover bg-center ${styles.noramlFlex}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          {/* Overlay mờ giúp chữ nổi hơn */}
          <div className="absolute top-0 left-0 w-full h-full bg-black/25 z-[1]" />

          {/* Nội dung */}
          <div className={`${styles.section} w-[90%] 800px:w-[60%] relative z-[2]`}>
            <h1 className="text-[32px] 800px:text-[52px] text-white font-[700] capitalize leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">
              {slide.title}
            </h1>
            <p className="pt-4 text-[16px] font-[Poppins] font-[400] text-white/90 leading-[1.6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {slide.description}
            </p>
            <Link to="/products" className="inline-block">
              <div className={`${styles.button} mt-5`}>
                <span className="text-[#fff] font-[Poppins] text-[16px]">
                  Mua Sắm Ngay
                </span>
              </div>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Hero;
