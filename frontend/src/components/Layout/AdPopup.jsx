import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const AdPopup = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Hiện popup sau khi load trang 1s
    const timer = setTimeout(() => {
      setShow(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setShow(false);

  if (!show) return null;

  return (
    // Khi bấm nền mờ → đóng popup
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleClose}
    >
      {/* Chặn click bên trong không đóng */}
      <div
        className="relative bg-white rounded-lg overflow-hidden shadow-lg max-w-md w-full"
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
        <img
          src="https://down-vn.img.susercontent.com/file/vn-11134258-820l4-mfwntmbxdg5r05.webp"
          alt="Ad"
          className="w-full h-auto"
        />
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Hàng Mới Về Sàn 🎉
          </h2>
          <p className="text-gray-700 mb-4">
            Giảm giá đến 50% cho sản phẩm mới ra mắt!
          </p>
          <Link
            to="/products"
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
