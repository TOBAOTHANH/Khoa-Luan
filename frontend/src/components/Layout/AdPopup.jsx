import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdPopup = () => {
  const [show, setShow] = useState(false);
  const [ad, setAd] = useState(null);

  // Danh sách 5 quảng cáo khác nhau
  const ads = [
    {
      img: "https://down-vn.img.susercontent.com/file/vn-11134258-820l4-mfwntmbxdg5r05.webp",
      title: "Hàng Mới Về Sàn 🎉",
      desc: "Giảm giá đến 50% cho sản phẩm mới ra mắt!",
      link: "/products",
    },
    {
      img: "https://png.pngtree.com/template/20220330/ourlarge/pngtree-e-commerce-red-skin-care-products-moisturizing-set-beauty-banner-image_909477.jpg",
      title: "Siêu Sale Mỹ Phẩm 💄",
      desc: "Mua 1 tặng 1 cho tất cả sản phẩm dưỡng da!",
      link: "/category/beauty",
    },
    {
      img: "https://img.pikbest.com/background/20220119/red-e-commerce-product-promotion-background-picture_6224800.jpg!sw800",
      title: "Flash Sale Cuối Tuần ⚡",
      desc: "Giảm giá sốc chỉ hôm nay – Đừng bỏ lỡ!",
      link: "/flash-sale",
    },
    {
      img: "https://png.pngtree.com/png-vector/20230722/ourmid/pngtree-new-arrival-sale-banner-design-vector-png-image_8362190.png",
      title: "Hàng Mới Ra Mắt 🚀",
      desc: "Cập nhật xu hướng mới nhất – giá cực hời!",
      link: "/new-arrivals",
    },
    {
      img: "https://graphicsfamily.com/wp-content/uploads/edd/2022/12/E-commerce-Product-Banner-Design-scaled.jpg",
      title: "Ưu Đãi Đặc Biệt 🎁",
      desc: "Giảm thêm 20% khi thanh toán qua ShopeePay!",
      link: "/promotion",
    },
  ];

  useEffect(() => {
    // Chọn ngẫu nhiên 1 quảng cáo
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    setAd(randomAd);

    // Hiện popup sau khi load trang 1s
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setShow(false);

  if (!show || !ad) return null;

  return (
    // Khi bấm nền mờ → đóng popup
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleClose}
    >
      {/* Chặn click bên trong không đóng */}
      <div
        className="relative bg-white rounded-lg overflow-hidden shadow-lg max-w-md w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-2xl"
        >
          &times;
        </button>

        {/* Nội dung quảng cáo */}
        <img src={ad.img} alt="Ad" className="w-full h-auto" />
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">{ad.title}</h2>
          <p className="text-gray-700 mb-4">{ad.desc}</p>
          <Link
            to={ad.link}
            onClick={handleClose}
            className="inline-block bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
            aria-label="Mua Ngay"
          >
            Mua Ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdPopup;
