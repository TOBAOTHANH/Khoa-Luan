import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineFileImage, AiOutlineProduct } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";

const CreateProduct = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [images, setImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Đã tạo sản phẩm thành công!");
      navigate("/dashboard");
      window.location.reload();
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e) => {
    e.preventDefault();
    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newForm = new FormData();
    images.forEach((image) => {
      newForm.append("images", image);
    });
    newForm.append("name", name);
    newForm.append("description", description);
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice);
    newForm.append("discountPrice", discountPrice);
    newForm.append("stock", stock);
    newForm.append("shopId", seller._id);
    dispatch(createProduct(newForm));
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <AiOutlineProduct className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Tạo Sản Phẩm Mới</h1>
              <p className="text-indigo-100 text-sm">Thêm sản phẩm mới vào shop của bạn</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mô Tả <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows="6"
                name="description"
                value={description}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết về sản phẩm..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Chọn Danh Mục</option>
                {categoriesData &&
                  categoriesData.map((i) => (
                    <option value={i.title} key={i.title}>
                      {i.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Price Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá Gốc
                </label>
                <input
                  type="number"
                  name="price"
                  value={originalPrice || ""}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Giá gốc..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Giá (Có Giảm Giá) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={discountPrice || ""}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Giá sau giảm..."
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tồn Kho <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={stock || ""}
                required
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                onChange={(e) => setStock(e.target.value)}
                placeholder="Số lượng tồn kho..."
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình Ảnh Sản Phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="upload"
                className="hidden"
                multiple
                onChange={handleImageChange}
                accept="image/*"
              />
              <div className="space-y-4">
                <label
                  htmlFor="upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <AiOutlineFileImage className="text-gray-400 group-hover:text-indigo-500 text-4xl mb-2" />
                    <p className="text-sm text-gray-500 group-hover:text-indigo-600">
                      <span className="font-semibold">Click để tải ảnh</span> hoặc kéo thả
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (Tối đa 10MB)</p>
                  </div>
                </label>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <RxCross1 size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={images.length === 0}
                className={`w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                  images.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {images.length === 0 ? 'Vui lòng tải ít nhất một hình ảnh' : 'Tạo Sản Phẩm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
