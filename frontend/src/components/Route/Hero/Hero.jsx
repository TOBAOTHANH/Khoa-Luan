import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../../styles/styles";

/**
 * Hero (đã sửa trực tiếp):
 * - Bố cục chia 3 cột: Trái (carousel) chiếm 2 cột, Phải: 2 thẻ promo xếp dọc.
 * - Tự chạy slide, có dot điều hướng, overlay, CTA.
 * - Giữ import styles để tương thích dự án cũ.
 */
const slides = [
  {
    id: 1,
    image:
      "https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg",
    title: "Tư vấn & lắp đặt PC văn phòng",
    bullets: [
      { k: "CPU", v: "i5-12400" },
      { k: "RAM", v: "8GB" },
      { k: "SSD", v: "256GB" },
      { k: "Main", v: "H610" },
    ],
    priceLabel: "Giá chỉ từ",
    price: "5.999.000đ",
    cta: { text: "Xem cấu hình", to: "/products?tag=pc-office" },
    description:
      "Thi công phòng máy, tối ưu hiệu năng văn phòng – bảo hành chính hãng.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1920&auto=format&fit=crop",
    title: "Workstation dựng phim/đồ hoạ",
    bullets: [
      { k: "CPU", v: "Ryzen 7" },
      { k: "RAM", v: "32GB" },
      { k: "SSD", v: "1TB NVMe" },
      { k: "GPU", v: "RTX 4070" },
    ],
    priceLabel: "Bộ siêu ưu đãi",
    price: "28.990.000đ",
    cta: { text: "Đặt cấu hình", to: "/products?tag=workstation" },
    description: "Cấu hình tối ưu cho render/ghi hình chuyên nghiệp.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?q=80&w=1920&auto=format&fit=crop",
    title: "PC Gaming RGB mạnh mẽ",
    bullets: [
      { k: "CPU", v: "i5/i7 Gen mới" },
      { k: "RAM", v: "16-32GB" },
      { k: "GPU", v: "RTX 30/40 Series" },
      { k: "SSD", v: "1TB NVMe" },
    ],
    priceLabel: "Combo sẵn quà",
    price: "18.490.000đ",
    cta: { text: "Xem ưu đãi", to: "/products?tag=pc-gaming" },
    description: "FPS cao – tản nhiệt mát – LED sống động.",
  },
];

const rightCards = [
  {
    id: "office",
    image:
      "https://images.unsplash.com/photo-1559163499-413811fb2344?q=80&w=1600&auto=format&fit=crop",
    title: "LAPTOP VĂN PHÒNG",
    sub: "› Bảo hành lên đến 36 tháng",
    price: "3.950.000đ",
    to: "/products?category=Laptop",
  },
  {
    id: "gaming",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    title: "LAPTOP GAMING/ĐỒ HOẠ",
    sub: "› Bảo hành lên đến 36 tháng",
    price: "16.499.000đ",
    to: "/products?category=Laptop",
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="w-full " style={{ marginTop: '0.5cm' }}>
      <div className={`${styles.section} grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[420px]`}>
        {/* LEFT: BIG CAROUSEL (span 2 cols) */}
        <div className="relative col-span-1 lg:col-span-2 rounded-xl overflow-hidden shadow-sm min-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </AnimatePresence>

          {/* overlay gradient cho chữ nổi */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          {/* content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-10 py-8">
            <h1 className="text-white text-2xl lg:text-4xl font-extrabold leading-tight max-w-[760px] drop-shadow">
              {slide.title}
            </h1>
            {slide.description && (
              <p className="mt-2 text-white/90 max-w-[720px]">
                {slide.description}
              </p>
            )}

            {/* spec chips */}
            {slide.bullets?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {slide.bullets.map((b) => (
                  <span
                    key={b.k}
                    className="inline-flex items-center gap-2 rounded-md bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 shadow"
                  >
                    <span className="opacity-70">{b.k}:</span> {b.v}
                  </span>
                ))}
              </div>
            )}

            {/* price bar */}
            <div className="mt-5 inline-flex items-center gap-3">
              <span className="text-white/90 text-sm uppercase tracking-wide">
                {slide.priceLabel}
              </span>
              <span className="bg-red-600 text-white font-black text-2xl lg:text-3xl rounded-lg px-4 py-2 shadow-lg">
                {slide.price}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-6">
              <Link
                to={slide.cta.to}
                className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:translate-y-[-1px] hover:shadow-md transition"
              >
                {slide.cta.text}
              </Link>
            </div>

            {/* dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`slide-${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === current ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: STACKED PROMO CARDS */}
        <div className="grid grid-rows-2 gap-4">
          {rightCards.map((card) => (
            <Link
              to={card.to}
              key={card.id}
              className="relative rounded-xl overflow-hidden shadow-sm group min-h-[180px]"
            >
              <div
                className="absolute inset-0 bg-center bg-cover"
                style={{ backgroundImage: `url(${card.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 via-indigo-800/50 to-transparent group-hover:from-indigo-900/70 transition" />
              <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                <h3 className="text-white text-xl lg:text-2xl font-extrabold drop-shadow">
                  {card.title}
                </h3>
                <p className="text-white/85 text-sm mt-1">{card.sub}</p>
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className="bg-white text-indigo-700 text-lg font-black rounded-md px-3 py-1 shadow">
                    Giá từ {card.price}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
