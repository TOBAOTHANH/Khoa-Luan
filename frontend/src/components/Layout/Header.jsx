import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlinePhone,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineBell,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import Cart from "../Cart/Cart";
import Wishlist from "../Whislist/Whislist";
import NotificationComponent from "../Notification/NotificationComponent";
import { RxCross1 } from "react-icons/rx";
import { backend_url } from "../../server";

const Header = ({ activeHeading }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { isSeller } = useSelector((state) => state.seller);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term) {
      setSearchData(null);
      return;
    }

    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    
    // Sort by name length (shorter names first) for better relevance
    if (filteredProducts && filteredProducts.length > 0) {
      const sortedProducts = [...filteredProducts].sort((a, b) => {
        // Calculate relevance: shorter names that match earlier are better
        const aIndex = a.name.toLowerCase().indexOf(term.toLowerCase());
        const bIndex = b.name.toLowerCase().indexOf(term.toLowerCase());
        
        // If both start with the term, sort by length
        if (aIndex === 0 && bIndex === 0) {
          return a.name.length - b.name.length;
        }
        // If one starts with term, prioritize it
        if (aIndex === 0) return -1;
        if (bIndex === 0) return 1;
        // Otherwise sort by length
        return a.name.length - b.name.length;
      });
      setSearchData(sortedProducts);
    } else {
      setSearchData(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Cleanup: restore body scroll when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Cleanup body scroll when search term is cleared
  useEffect(() => {
    if (!searchTerm) {
      document.body.style.overflow = 'auto';
    }
  }, [searchTerm]);

  return (
    <>
      <div className={`${styles.section}`}>
        <div className="hidden 800px:h-[50px] 800px:my-[20px] 800px:flex items-center justify-between">
          <div>
            <Link to="/">
              <img
                src="https://i.postimg.cc/02N1SrVQ/z7182359798450-de2505e6bf07a8236cf420eede11cf00-removebg-preview.png"
                alt="Logo"
                className="cursor-pointer h-[80px] object-contain"
              />
            </Link>
          </div>
          {/* search box */}
          <div className="w-[50%] relative z-50">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="h-[45px] w-full px-4 pr-12 border-2 border-blue-300 focus:border-blue-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all relative z-50"
            />
            <AiOutlineSearch
              size={24}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-blue-500 hover:text-blue-600 transition-colors z-50"
            />
           {searchTerm && searchData && searchData.length !== 0 ? (
              <div 
                className="absolute min-h-[200px] max-h-[60vh] overflow-y-auto bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] p-4 mt-2 w-full"
                onMouseEnter={(e) => {
                  // Prevent body scroll when hovering over dropdown
                  document.body.style.overflow = 'hidden';
                }}
                onMouseLeave={(e) => {
                  // Restore body scroll when leaving dropdown
                  document.body.style.overflow = 'auto';
                }}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc'
                }}
              >
                <div className="space-y-1">
                  {searchData &&
                    searchData.slice(0, 50).map((i, index) => {
                      return (
                        <Link 
                          key={i._id || index} 
                          to={`/product/${i._id}`}
                          onClick={() => {
                            setSearchTerm("");
                            setSearchData(null);
                            document.body.style.overflow = 'auto';
                          }}
                        >
                          <div className="w-full flex items-center p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                            <img
                              src={`${backend_url}${i.images && i.images[0]}`}
                              alt={i.name}
                              className="w-12 h-12 object-cover rounded-md mr-3 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50";
                              }}
                            />
                            <h1 className="text-gray-800 font-medium text-sm truncate">{i.name}</h1>
                          </div>
                        </Link>
                      );
                    })}
                </div>
                {searchData && searchData.length > 50 && (
                  <div className="text-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    Hiển thị 50/{searchData.length} kết quả
                  </div>
                )}
              </div>
            ) : searchTerm && searchData && searchData.length === 0 ? (
              <div className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] p-4 mt-2 w-full">
                <p className="text-gray-500 text-sm text-center py-4">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : null}
          </div>
          {/* hotline và bán hàng */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg shadow-md border border-blue-200 hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-md">
              <AiOutlinePhone size={20} />
            </div>
            <div className="text-gray-800">
              <div className="text-xs text-gray-600 font-medium">Hotline:</div>
              <div className="text-lg font-bold text-blue-700">0792.890.890</div>
            </div>  
          </div>

          <Link to={`${isSeller ? "/dashboard" : "/shop-login"}`}>
            <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out flex items-center justify-center gap-2 whitespace-nowrap">
              <span>{isSeller ? "Trang quản lý" : "Bán Hàng"}</span>
              <IoIosArrowForward size={18} />
            </button>
          </Link>
        </div>
      </div>
      <div
        className={`${
          active === true ? "shadow-lg fixed top-0 left-0 z-10 backdrop-blur-sm bg-opacity-95" : null
        } transition-all duration-300 hidden 800px:flex items-center justify-between w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 h-[70px] shadow-md`}
      >
        <div
          className={`${styles.section} relative ${styles.noramlFlex} justify-between`}
        >
          {/* categories */}
          <div onClick={() => setDropDown(!dropDown)}>
            <div className="relative h-[60px] mt-[10px] w-[270px] hidden 1000px:block">
              <BiMenuAltLeft size={30} className="absolute top-3 left-2" />
              <button
                className={`h-[100%] w-full flex justify-between items-center pl-10 bg-white font-sans text-lg font-[500] select-none rounded-t-md`}
              >
                Danh mục
              </button>
              <IoIosArrowDown
                size={20}
                className="absolute right-2 top-4 cursor-pointer"
                onClick={() => setDropDown(!dropDown)}
              />
              {dropDown ? (
                <DropDown
                  categoriesData={categoriesData}
                  setDropDown={setDropDown}
                />
              ) : null}
            </div>
          </div>
          {/* navitems */}
          <div className={`${styles.noramlFlex}`}>
            <Navbar active={activeHeading} />
          </div>

          <div className="flex">
            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px] group"
                onClick={() => setOpenWishlist(true)}
              >
                <AiOutlineHeart size={30} className="text-white/90 group-hover:text-white transition-colors" />
                <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-pink-500 to-red-500 w-5 h-5 p-0 m-0 text-white font-bold text-[11px] leading-tight text-center flex items-center justify-center shadow-lg">
                  {wishlist && wishlist.length}
                </span>
              </div>
            </div>

            {isAuthenticated && (
              <div className={`${styles.noramlFlex}`}>
                <NotificationComponent />
              </div>
            )}

            <div className={`${styles.noramlFlex}`}>
              <div
                className="relative cursor-pointer mr-[15px] group"
                onClick={() => setOpenCart(true)}
              >
                <AiOutlineShoppingCart
                  size={30}
                  className="text-white/90 group-hover:text-white transition-colors"
                />
                <span className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 w-5 h-5 p-0 m-0 text-white font-bold text-[11px] leading-tight text-center flex items-center justify-center shadow-lg">
                  {cart && cart.length}
                </span>
              </div>
            </div>

            <div className={`${styles.noramlFlex}`}>
              <div className="relative cursor-pointer mr-[15px]">
                {isAuthenticated ? (
                  <Link to="/profile">
                    <img
                      src={`${backend_url}${user.avatar?.public_id}`}
                      className="w-[35px] h-[35px] rounded-full"
                      alt=""
                    />
                  </Link>
                ) : (
                  <Link to="/login">
                    <CgProfile size={30} color="rgb(255 255 255 / 83%)" />
                  </Link>
                )}
              </div>
            </div>

            {/* cart popup */}
            {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

            {/* wishlist popup */}
            {openWishlist ? (
              <Wishlist setOpenWishlist={setOpenWishlist} />
            ) : null}
          </div>
        </div>
      </div>

      {/* mobile header */}
      <div
        className={`${
          active === true ? "shadow-lg fixed top-0 left-0 z-10" : null
        }
      w-full h-[60px] bg-gradient-to-r from-blue-600 to-blue-700 z-50 top-0 left-0 shadow-md 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between">
          <div>
            <BiMenuAltLeft
              size={40}
              className="ml-4"
              onClick={() => setOpen(true)}
            />
          </div>
          <div>
            <Link to="/">
              <img
                src="https://i.postimg.cc/02N1SrVQ/z7182359798450-de2505e6bf07a8236cf420eede11cf00-removebg-preview.png"
                alt=""
                className="cursor-pointer h-[50px] object-contain"
              />
            </Link>
          </div>
          <div>
            <div
              className="relative mr-[20px]"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={30} />
              <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px]  leading-tight text-center">
                {cart && cart.length}
              </span>
            </div>
          </div>
          {/* cart popup */}
          {openCart ? <Cart setOpenCart={setOpenCart} /> : null}

          {/* wishlist popup */}
          {openWishlist ? <Wishlist setOpenWishlist={setOpenWishlist} /> : null}
        </div>

        {/* header sidebar */}
        {open && (
          <div
            className={`fixed w-full bg-[#0000005f] z-20 h-full top-0 left-0`}
          >
            <div className="fixed w-[70%] bg-[#fff] h-screen top-0 left-0 z-10 overflow-y-scroll">
              <div className="w-full justify-between flex pr-3">
                <div>
                  <div
                    className="relative mr-[15px]"
                    onClick={() => setOpenWishlist(true) || setOpen(false)}
                  >
                    <AiOutlineHeart size={30} className="mt-5 ml-3" />
                    <span class="absolute right-0 top-0 rounded-full bg-[#3bc177] w-4 h-4 top right p-0 m-0 text-white font-mono text-[12px]  leading-tight text-center">
                      {wishlist && wishlist.length}
                    </span>
                  </div>
                </div>
                <RxCross1
                  size={30}
                  className="ml-4 mt-5"
                  onClick={() => setOpen(false)}
                />
              </div>

              <div className="my-8 w-[92%] m-auto h-[40px relative]">
                <input
                  type="search"
                  placeholder="Search Product..."
                  className="h-[40px] w-full px-2 border-[#3957db] border-[2px] rounded-md"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchData && (
                  <div className="absolute bg-[#fff] z-10 shadow w-full left-0 p-3">
                    {searchData.map((i) => {
                      const d = i.name;

                      const Product_name = d.replace(/\s+/g, "-");
                      return (
                        <Link to={`/product/${Product_name}`}>
                          <div className="flex items-center">
                            <img
                              src={i.image_Url[0]?.url}
                              alt=""
                              className="w-[50px] mr-2"
                            />
                            <h5>{i.name}</h5>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Navbar active={activeHeading} />
              <div className={`${styles.button} ml-4 !rounded-[4px]`}>
                <Link to="/shop-create">
                  <h1 className="text-[#fff] flex items-center">
                    Become Seller <IoIosArrowForward className="ml-1" />
                  </h1>
                </Link>
              </div>
              <br />
              <br />
              <br />

              <div className="flex w-full justify-center">
                {isAuthenticated ? (
                  <div>
                    <Link to="/profile">
                      <img
                        src={`${backend_url}${user.avatar?.public_id}`}
                        alt=""
                        className="w-[60px] h-[60px] rounded-full border-[3px] border-[#0eae88]"
                      />
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-[18px] pr-[10px] text-[#000000b7]"
                    >
                      Login /
                    </Link>
                    <Link
                      to="/sign-up"
                      className="text-[18px] text-[#000000b7]"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
