import React, { useEffect, useState } from "react";
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateProduct, getProductById } from "../../redux/actions/product";
import { categoriesData } from "../../static/data";
import { toast } from "react-toastify";
import { backend_url } from "../../server";
import Loader from "../Layout/Loader";

const EditProduct = () => {
  const { id } = useParams();
  const { seller } = useSelector((state) => state.seller);
  const { success, error, singleProduct, isLoading } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (singleProduct) {
      setName(singleProduct.name || "");
      setDescription(singleProduct.description || "");
      setCategory(singleProduct.category || "");
      setTags(singleProduct.tags || "");
      setOriginalPrice(singleProduct.originalPrice || "");
      setDiscountPrice(singleProduct.discountPrice || "");
      setStock(singleProduct.stock || "");
      setExistingImages(singleProduct.images || []);
    }
  }, [singleProduct]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success("Cập nhật sản phẩm thành công!");
      navigate("/dashboard-products");
      window.location.reload();
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e) => {
    e.preventDefault();
    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newForm = new FormData();
    
    // Append new images if any
    images.forEach((image) => {
      newForm.append("images", image);
    });

    // Append existing images to keep
    newForm.append("existingImagesToKeep", JSON.stringify(existingImages));

    // Append product data
    newForm.append("name", name);
    newForm.append("description", description);
    newForm.append("category", category);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice);
    newForm.append("discountPrice", discountPrice);
    newForm.append("stock", stock);
    newForm.append("shopId", seller._id);

    dispatch(updateProduct(id, newForm));
  };

  if (isLoading && !singleProduct) {
    return <Loader />;
  }

  return (
    <div className="w-[90%] 800px:w-[50%] bg-white shadow h-[80vh] rounded-[4px] p-3 overflow-y-scroll">
      <h5 className="text-[30px] font-Poppins text-center">Chỉnh Sửa Sản Phẩm</h5>
      {/* edit product form */}
      <form onSubmit={handleSubmit}>
        <br />
        <div>
          <label className="pb-2">
            Tên Sản Phẩm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            required
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Mô Tả <span className="text-red-500">*</span>
          </label>
          <textarea
            cols="30"
            required
            rows="8"
            type="text"
            name="description"
            value={description}
            className="mt-2 appearance-none block w-full pt-2 px-3 border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả sản phẩm..."
          ></textarea>
        </div>
        <br />
        <div>
          <label className="pb-2">
            Danh Mục <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full mt-2 border h-[35px] rounded-[5px]"
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
        <br />
        <div>
          <label className="pb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={tags}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setTags(e.target.value)}
            placeholder="Nhập tags sản phẩm..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">Giá Gốc</label>
          <input
            type="number"
            name="price"
            value={originalPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder="Nhập giá gốc sản phẩm..."
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Giá (Có Giảm Giá) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={discountPrice}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setDiscountPrice(e.target.value)}
            placeholder="Nhập giá sản phẩm có giảm giá..."
            required
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Tồn Kho <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stock"
            value={stock}
            className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onChange={(e) => setStock(e.target.value)}
            placeholder="Nhập tồn kho sản phẩm..."
            required
          />
        </div>
        <br />
        <div>
          <label className="pb-2">
            Hình Ảnh
          </label>
          <input
            type="file"
            name=""
            id="upload"
            className="hidden"
            multiple
            onChange={handleImageChange}
          />
          <div className="w-full flex items-center flex-wrap">
            {/* Existing images */}
            {existingImages &&
              existingImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={`${backend_url}uploads/${imageUrl}`}
                    alt={`Existing ${index}`}
                    className="h-[120px] w-[120px] object-cover m-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <AiOutlineDelete size={16} />
                  </button>
                </div>
              ))}
            
            {/* New images */}
            {images &&
              images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`New ${index}`}
                    className="h-[120px] w-[120px] object-cover m-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <AiOutlineDelete size={16} />
                  </button>
                </div>
              ))}
            
            {/* Add image button */}
            <label htmlFor="upload">
              <AiOutlinePlusCircle size={30} className="mt-3" color="#555" />
            </label>
          </div>
          <br />
          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out mt-2"
            >
              Cập Nhật Sản Phẩm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

