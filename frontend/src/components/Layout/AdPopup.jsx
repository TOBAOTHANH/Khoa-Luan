import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdPopup = () => {
  const [show, setShow] = useState(false);
  const [ad, setAd] = useState(null);

  // Danh sách 5 quảng cáo khác nhau
  const ads = [
    {
    img: "https://cdnv2.tgdd.vn/mwg-static/tgdd/Banner/f3/2c/f32c5b6d226b1346b9734f6dd0f34441.png",
    title: "Hàng Công Nghệ Mới Về 🎉",
    desc: "Giảm giá đến 50% cho laptop, điện thoại và phụ kiện mới nhất!",
    link: "/products",
  },
  {
    img: "https://www.hoco.vn/data/Product/tai-nghe-airpods-ew03-plus-co-pop-up-LnQFQotzor9BAHCiX3D4.jpg",
    title: "Siêu Sale Tai Nghe 🎧",
    desc: "Mua 1 tặng 1 – Âm thanh đỉnh cao, giá cực thấp!",
    link: "/products",
  },
  {
    img: "https://vending-cdn.kootoro.com/torov-cms/upload/image/1685592825763-gi%C3%A1%20qu%E1%BA%A3ng%20c%C3%A1o%20tr%C3%AAn%20tivi.jpg",
    title: "Flash Sale TV & Màn Hình ⚡",
    desc: "Giảm giá sốc lên đến 50% – chỉ trong hôm nay!",
    link: "/products",
  },
  {
    img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:1036:450/q:90/plain/https://dashboard.cellphones.com.vn/storage/690x300_iPhone_17_Pro_Opensale_v3.png",
    title: "Siêu Phẩm Smartphone 🚀",
    desc: "Cập nhật mẫu điện thoại hot nhất – giá chỉ từ 30.99 triệu!",
    link: "/products",
  },
  {
    img: "https://img.freepik.com/free-psd/electronic-gadgets-sale-web-banner-template_23-2149823854.jpg",
    title: "Ưu Đãi Đặc Biệt 🎁",
    desc: "Giảm thêm 10% khi thanh toán bằng ví điện tử!",
    link: "/products",
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
