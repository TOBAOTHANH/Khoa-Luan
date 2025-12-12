import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState, useMemo } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { FiPackage, FiTrendingUp, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";
import { backend_url } from "../../server";
import { toast } from "react-toastify";

const AllProducts = () => {
  const { products, isLoading } = useSelector((state) => state.products);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getAllProductsShop(seller._id));
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      dispatch(deleteProduct(id));
      toast.success("Đã xóa sản phẩm thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Categorize products by status
  const categorizedProducts = useMemo(() => {
    const inStock = products.filter(item => item.stock > 0);
    const outOfStock = products.filter(item => item.stock === 0);
    const lowStock = products.filter(item => item.stock > 0 && item.stock <= 10);
    const bestSelling = products.filter(item => item.sold_out > 0).sort((a, b) => (b.sold_out || 0) - (a.sold_out || 0));
    
    return {
      all: products,
      inStock,
      outOfStock,
      lowStock,
      bestSelling
    };
  }, [products]);

  const columns = [
    {
      field: "image",
      headerName: "Hình ảnh",
      minWidth: 100,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        const product = products.find(p => p._id === params.row.id);
        const imageUrl = product?.images?.[0] 
          ? `${backend_url}${product.images[0]}`
          : "https://via.placeholder.com/80";
        return (
          <img
            src={imageUrl}
            alt={params.row.name}
            className="w-16 h-16 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80";
            }}
          />
        );
      },
    },
    {
      field: "name",
      headerName: "Tên Sản Phẩm",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Giá Sản Phẩm",
      minWidth: 120,
      flex: 0.7,
      renderCell: (params) => (
        <span className="font-bold text-green-600">{params.value}</span>
      ),
    },
    {
      field: "Stock",
      headerName: "Tồn Kho",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => {
        const stock = params.value;
        let color = "text-gray-600";
        if (stock === 0) color = "text-red-600 font-bold";
        else if (stock <= 10) color = "text-orange-600 font-semibold";
        else color = "text-green-600";
        return <span className={color}>{stock}</span>;
      },
    },
    {
      field: "sold",
      headerName: "Đã Bán",
      type: "number",
      minWidth: 100,
      flex: 0.6,
      renderCell: (params) => (
        <span className="text-blue-600 font-semibold">{params.value}</span>
      ),
    },
    {
      field: "Preview",
      flex: 0.8,
      minWidth: 100,
      headerName: "Xem Thông Tin Sản Phẩm",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Link to={`/product/${params.id}`}>
            <Button className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <AiOutlineEye size={20} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Edit",
      flex: 0.8,
      minWidth: 100,
      headerName: "Chỉnh Sửa Sản Phẩm",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Link to={`/dashboard-edit-product/${params.id}`}>
            <Button className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <AiOutlineEdit size={20} />
            </Button>
          </Link>
        );
      },
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: " Xóa Sản Phẩm",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Button 
            onClick={() => handleDelete(params.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <AiOutlineDelete size={20} />
          </Button>
        );
      },
    },
  ];

  const createRows = (productList) => {
    const rows = [];
    productList &&
      productList.forEach((item) => {
        rows.push({
          id: item._id,
          name: item.name,
          price: item.discountPrice + " " + "US$ ",
          Stock: item.stock,
          sold: item?.sold_out || 0,
          status: item.stock > 0 ? (item.stock <= 10 ? 'low' : 'inStock') : 'outOfStock'
        });
      });
    return rows;
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', count: categorizedProducts.all.length, icon: FiPackage, color: 'from-blue-500 to-blue-600' },
    { id: 'inStock', label: 'Còn hàng', count: categorizedProducts.inStock.length, icon: FiCheckCircle, color: 'from-green-500 to-green-600' },
    { id: 'lowStock', label: 'Sắp hết', count: categorizedProducts.lowStock.length, icon: FiAlertCircle, color: 'from-yellow-500 to-yellow-600' },
    { id: 'outOfStock', label: 'Hết hàng', count: categorizedProducts.outOfStock.length, icon: FiAlertCircle, color: 'from-red-500 to-red-600' },
    { id: 'bestSelling', label: 'Bán chạy', count: categorizedProducts.bestSelling.length, icon: FiTrendingUp, color: 'from-purple-500 to-purple-600' },
  ];

  const displayProducts = categorizedProducts[activeTab] || [];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 py-4 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <FiPackage className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Quản Lý Sản Phẩm
                    </h2>
                    <p className="text-purple-100 text-xs">
                      Tổng: {products?.length || 0} sản phẩm
                    </p>
                  </div>
                </div>
                <Link to="/dashboard-create-product">
                  <button className="flex items-center gap-1.5 bg-white text-purple-600 hover:bg-purple-50 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm">
                    <AiOutlinePlus size={16} />
                    Tạo Mới
                  </button>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md p-2 mb-4">
              <div className="flex flex-wrap gap-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={14} />
                      <span className="text-xs">{tab.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        isActive ? 'bg-white/30' : 'bg-gray-200'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products Display */}
            {displayProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg mb-4">
                  Chưa có sản phẩm nào
                </p>
                <Link to="/dashboard-create-product">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <AiOutlinePlus size={18} />
                    Tạo sản phẩm đầu tiên
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {displayProducts.map((product) => {
                  const imageUrl = product?.images?.[0] 
                    ? `${backend_url}${product.images[0]}`
                    : "https://via.placeholder.com/200";
                  
                  const stockStatus = product.stock === 0 
                    ? { label: 'Hết', color: 'from-red-500 to-red-600' }
                    : product.stock <= 10 
                    ? { label: 'Sắp hết', color: 'from-yellow-500 to-yellow-600' }
                    : { label: 'Còn', color: 'from-green-500 to-green-600' };

                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group"
                    >
                      {/* Product Image */}
                      <div className="relative h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/200";
                          }}
                        />
                        <div className={`absolute top-1.5 left-1.5 bg-gradient-to-r ${stockStatus.color} px-2 py-0.5 rounded text-xs font-semibold text-white`}>
                          {stockStatus.label}
                        </div>
                        {product.sold_out > 0 && (
                          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-purple-500 to-purple-600 px-2 py-0.5 rounded text-xs font-semibold text-white">
                            🔥 {product.sold_out}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-2.5">
                        <h3 className="text-sm font-bold text-gray-800 mb-1.5 line-clamp-2 min-h-[2.5rem]">
                          {product.name}
                        </h3>
                        
                        <div className="mb-2">
                          <p className="text-lg font-bold text-green-600">
                            ${product.discountPrice || 0}
                          </p>
                          {product.originalPrice && product.originalPrice > product.discountPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              ${product.originalPrice}
                            </p>
                          )}
                        </div>

                        {/* Stock and Sold Info */}
                        <div className="flex items-center justify-between mb-2 text-xs">
                          <span className={`font-semibold ${
                            product.stock === 0 
                              ? 'text-red-600' 
                              : product.stock <= 10 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            Kho: {product.stock}
                          </span>
                          <span className="text-blue-600 font-semibold">
                            Bán: {product.sold_out || 0}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-200">
                          <Link to={`/product/${product._id}`} className="flex-1">
                            <button className="w-full flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-2 rounded text-xs transition-all duration-200">
                              <AiOutlineEye size={14} />
                            </button>
                          </Link>
                          <Link to={`/dashboard-edit-product/${product._id}`} className="flex-1">
                            <button className="w-full flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium py-1.5 px-2 rounded text-xs transition-all duration-200">
                              <AiOutlineEdit size={14} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1.5 px-2 rounded text-xs transition-all duration-200"
                          >
                            <AiOutlineDelete size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Tổng</p>
                    <p className="text-lg font-bold text-gray-800">{products?.length || 0}</p>
                  </div>
                  <FiPackage className="text-blue-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Còn hàng</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedProducts.inStock.length}</p>
                  </div>
                  <FiCheckCircle className="text-green-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Sắp hết</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedProducts.lowStock.length}</p>
                  </div>
                  <FiAlertCircle className="text-yellow-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Bán chạy</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedProducts.bestSelling.length}</p>
                  </div>
                  <FiTrendingUp className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllProducts;
