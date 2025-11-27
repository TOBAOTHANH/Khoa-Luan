import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { backend_url } from "../../server";
import { AiOutlineGift, AiOutlineCheck } from "react-icons/ai";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";

const AccessoryRecommendations = ({ product }) => {
  const { allProducts } = useSelector((state) => state.products);
  const { cart } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [recommendedAccessories, setRecommendedAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState(new Set());

  useEffect(() => {
    if (!product || !allProducts) return;

    // Xác định category và tìm phụ kiện phù hợp
    const productName = product.name?.toLowerCase() || "";
    const productCategory = product.category?.toLowerCase() || "";
    
    // Mapping category và keywords với phụ kiện
    const accessoryMapping = {
      // Điện thoại
      phone: {
        keywords: ["điện thoại", "phone", "smartphone", "mobile", "iphone", "samsung", "xiaomi", "oppo", "vivo"],
        accessories: ["ốp lưng", "tai nghe", "sạc", "cáp", "dán màn hình", "pin dự phòng", "bao da", "kính cường lực"]
      },
      // Máy tính để bàn
      desktop: {
        keywords: ["máy tính để bàn", "desktop", "pc", "máy tính bàn", "computer", "workstation"],
        accessories: ["chuột", "tai nghe", "bàn phím", "loa", "webcam", "microphone", "tai nghe gaming", "chuột gaming"]
      },
      // Laptop
      laptop: {
        keywords: ["laptop", "notebook", "máy tính xách tay", "macbook"],
        accessories: ["tai nghe", "chuột", "túi đựng", "bàn phím", "loa", "webcam", "chuột không dây", "tai nghe bluetooth"]
      },
      // Màn hình
      monitor: {
        keywords: ["màn hình", "monitor", "display", "screen"],
        accessories: ["giá treo", "cáp", "kính bảo vệ mắt", "khăn lau", "giá treo màn hình"]
      }
    };

    // Tìm category phù hợp
    let matchedCategory = null;
    for (const [key, value] of Object.entries(accessoryMapping)) {
      const isMatch = value.keywords.some(keyword => 
        productName.includes(keyword) || productCategory.includes(keyword)
      );
      if (isMatch) {
        matchedCategory = key;
        break;
      }
    }

    if (!matchedCategory) {
      setRecommendedAccessories([]);
      return;
    }

    // Tìm các sản phẩm phụ kiện phù hợp
    const targetAccessories = accessoryMapping[matchedCategory].accessories;
    const filtered = allProducts.filter(item => {
      if (item._id === product._id) return false; // Loại trừ sản phẩm hiện tại
      if (!item.stock || item.stock < 1) return false; // Chỉ hiển thị sản phẩm còn hàng
      
      const itemName = item.name?.toLowerCase() || "";
      const itemCategory = item.category?.toLowerCase() || "";
      const itemTags = item.tags?.toLowerCase() || "";
      
      // Kiểm tra xem sản phẩm có chứa từ khóa phụ kiện không
      return targetAccessories.some(accessory => {
        const accessoryLower = accessory.toLowerCase();
        return itemName.includes(accessoryLower) || 
               itemCategory.includes(accessoryLower) ||
               itemTags.includes(accessoryLower);
      });
    });

    // Giới hạn 3-5 sản phẩm
    setRecommendedAccessories(filtered.slice(0, 5));
  }, [product, allProducts]);

  const handleAccessoryToggle = (accessoryId) => {
    const newSelected = new Set(selectedAccessories);
    if (newSelected.has(accessoryId)) {
      newSelected.delete(accessoryId);
    } else {
      newSelected.add(accessoryId);
    }
    setSelectedAccessories(newSelected);
  };

  const handleAddSelectedToCart = () => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    if (selectedAccessories.size === 0) {
      toast.info("Vui lòng chọn ít nhất một phụ kiện!");
      return;
    }

    selectedAccessories.forEach(accessoryId => {
      const accessory = recommendedAccessories.find(a => a._id === accessoryId);
      if (accessory) {
        const isItemExists = cart && cart.find((i) => i._id === accessoryId);
        if (!isItemExists && accessory.stock > 0) {
          const cartData = { ...accessory, qty: 1 };
          dispatch(addTocart(cartData));
        }
      }
    });

    toast.success(`Đã thêm ${selectedAccessories.size} phụ kiện vào giỏ hàng!`);
    setSelectedAccessories(new Set());
  };

  if (!recommendedAccessories || recommendedAccessories.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200 shadow-md">
      <div className="flex items-center mb-3">
        <AiOutlineGift className="text-orange-600 mr-2" size={24} />
        <h3 className="text-lg font-bold text-gray-800">Phụ Kiện Khuyến Mãi</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Chọn Phụ Kiện Bạn Thích Và Thêm Vào Giỏ Hàng
      </p>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {recommendedAccessories.map((accessory, index) => {
          const isSelected = selectedAccessories.has(accessory._id);
          return (
            <div
              key={accessory._id || index}
              className={`flex items-center p-3 bg-white rounded-lg transition-all duration-200 border-2 cursor-pointer ${
                isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
              }`}
              onClick={() => handleAccessoryToggle(accessory._id)}
            >
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
              }`}>
                {isSelected && <AiOutlineCheck className="text-white" size={14} />}
              </div>
              <img
                src={`${backend_url}${accessory.images?.[0]}`}
                alt={accessory.name}
                className="w-16 h-16 object-cover rounded-md mr-3"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/64";
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 truncate">
                  {accessory.name}
                </h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-orange-600 font-bold text-base">
                    {accessory.discountPrice}$
                  </span>
                  {accessory.originalPrice && (
                    <span className="text-gray-400 text-xs line-through ml-2">
                      {accessory.originalPrice}$
                    </span>
                  )}
                </div>
                {accessory.stock < 1 && (
                  <span className="text-red-500 text-xs mt-1">Hết hàng</span>
                )}
              </div>
              <div className="ml-2 text-right">
                {isSelected ? (
                  <span className="text-orange-600 text-sm font-semibold">Đã chọn</span>
                ) : (
                  <span className="text-blue-600 text-sm font-semibold">Chọn</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAccessories.size > 0 && (
        <button
          onClick={handleAddSelectedToCart}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out"
        >
          Thêm {selectedAccessories.size} phụ kiện vào giỏ hàng
        </button>
      )}
    </div>
  );
};

export default AccessoryRecommendations;

