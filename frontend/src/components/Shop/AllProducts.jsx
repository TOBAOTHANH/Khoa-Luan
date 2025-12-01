import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState, useMemo } from "react";
import { AiOutlineDelete, AiOutlineEye, AiOutlineEdit } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { deleteProduct } from "../../redux/actions/product";
import Loader from "../Layout/Loader";

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
      window.location.reload();
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
    { field: "id", headerName: "Id Sản Phẩm", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Tên Sản Phẩm",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Giá Sản Phẩm",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Stock",
      headerName: "Tồn Kho",
      type: "number",
      minWidth: 80,
      flex: 0.5,
    },

    {
      field: "sold",
      headerName: "Đã Bán",
      type: "number",
      minWidth: 130,
      flex: 0.6,
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
          <>
            <Link to={`/product/${params.id}`}>
              <Button>
                <AiOutlineEye size={20} />
              </Button>
            </Link>
          </>
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
          <>
            <Link to={`/dashboard-edit-product/${params.id}`}>
              <Button>
                <AiOutlineEdit size={20} />
              </Button>
            </Link>
          </>
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
          <>
            <Button onClick={() => handleDelete(params.id)}>
              <AiOutlineDelete size={20} />
            </Button>
          </>
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
    { id: 'all', label: 'Tất cả', count: categorizedProducts.all.length, color: 'blue' },
    { id: 'inStock', label: 'Còn hàng', count: categorizedProducts.inStock.length, color: 'green' },
    { id: 'lowStock', label: 'Sắp hết', count: categorizedProducts.lowStock.length, color: 'yellow' },
    { id: 'outOfStock', label: 'Hết hàng', count: categorizedProducts.outOfStock.length, color: 'red' },
    { id: 'bestSelling', label: 'Bán chạy', count: categorizedProducts.bestSelling.length, color: 'purple' },
  ];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý sản phẩm</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg transform scale-105`
                    : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {tabs.find(t => t.id === activeTab)?.label} - {categorizedProducts[activeTab]?.length || 0} sản phẩm
              </h3>
            </div>
            <DataGrid
              rows={createRows(categorizedProducts[activeTab])}
              columns={columns}
              pageSize={10}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #e5e7eb',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f9fafb',
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AllProducts;
