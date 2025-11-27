import React from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";
import styles from "../../styles/styles";

/**
 * Navbar – phiên bản "điện máy" chuyên nghiệp (bỏ chấm bên trái)
 * - Màu nền: gradient xanh navy → cyan
 * - Active: dùng vàng nhạt (amber) để nổi bật kiểu Điện Máy Xanh
 */
const Navbar = ({ active }) => {
  return (
    <nav className={`w-full block 800px:${styles.noramlFlex}`}>
      <div className="w-full flex justify-center">
        {/* Nền thanh menu: gradient navy → cyan, kính mờ nhẹ */}
        <div
          className="
            rounded-full
            bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500
            backdrop-blur-sm
            px-3 py-2
            shadow-xl shadow-blue-500/30
            border border-white/20
            hover:shadow-2xl hover:shadow-blue-500/40
            transition-all duration-300
          "
        >
          <ul className="flex items-center gap-1 800px:gap-2">
            {navItems?.map((item, index) => {
              const isActive = active === index + 1;
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "group relative inline-flex items-center",
                      "px-5 py-2 rounded-full",
                      "text-sm 800px:text-base font-semibold tracking-wide",
                      isActive
                        ? "text-white"
                        : "text-white/90 hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-white/80 focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-sky-900",
                      "transition-all"
                    ].join(" ")}
                  >
                    {/* Tiêu đề menu */}
                    <span>{item.title}</span>

                    {/* Underline trượt khi hover/active */}
                    <span
                      className={[
                        "pointer-events-none absolute left-3 right-3 -bottom-1 h-[3px] rounded-full",
                        "transition-all duration-300 ease-out",
                        isActive
                          ? "bg-amber-400 opacity-100"
                          : "bg-white/70 opacity-0 group-hover:opacity-100"
                      ].join(" ")}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
