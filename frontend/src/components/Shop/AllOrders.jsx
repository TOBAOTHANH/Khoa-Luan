import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight } from "react-icons/ai";
import { getOrderStatusInVietnamese } from "../../utils/orderStatus";

const AllOrders = () => {
  const { orders, isLoading } = useSelector((state) => state.order);
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getAllOrdersOfShop(seller._id));
  }, [dispatch]);

  // Categorize orders by status
  const categorizedOrders = useMemo(() => {
    const processing = orders.filter(item => item.status === "Processing");
    const shipping = orders.filter(item => 
      item.status === "Shipping" || 
      item.status === "On the way" || 
      item.status === "Transferred to delivery partner" ||
      item.status === "Received"
    );
    const delivered = orders.filter(item => item.status === "Delivered" || item.status === "Succeeded");
    const refund = orders.filter(item => 
      item.status === "Processing refund" || 
      item.status === "Refund Success"
    );
    const notPaid = orders.filter(item => item.status === "Not Paid");
    
    return {
      all: orders,
      processing,
      shipping,
      delivered,
      refund,
      notPaid
    };
  }, [orders]);

  const columns = [
    { field: "id", headerName: "Mã Đơn Hàng", minWidth: 150, flex: 0.7 },

    {
      field: "status",
      headerName: "Trạng Thái",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) => {
        return params.row.status === "Đã giao hàng" || params.row.status === "Thành công" ? "greenColor" : "redColor";
      },
    },
    {
      field: "itemsQty",
      headerName: "Số Lượng Sản Phẩm",
      type: "number",
      minWidth: 130,
      flex: 0.7,
    },
    {
      field: "total",
      headerName: "Tổng Giá",
      type: "number",
      minWidth: 130,
      flex: 0.8,
    },

    {
      field: " ",
      flex: 1,
      minWidth: 150,
      headerName: "",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/order/${params.id}`}>
              <Button>
                <AiOutlineArrowRight size={20} />
              </Button>
            </Link>
          </>
        );
      },
    },
  ];

  const createRows = (orderList) => {
    const rows = [];
    orderList &&
      orderList.forEach((item) => {
        rows.push({
          id: item._id,
          itemsQty: item.cart.length,
          total: "US$ " + item.totalPrice,
          status: getOrderStatusInVietnamese(item.status),
        });
      });
    return rows;
  };

  const tabs = [
    { id: 'all', label: 'Tất cả', count: categorizedOrders.all.length, activeClass: 'bg-blue-500', inactiveClass: 'bg-gray-100' },
    { id: 'processing', label: 'Đang xử lý', count: categorizedOrders.processing.length, activeClass: 'bg-yellow-500', inactiveClass: 'bg-gray-100' },
    { id: 'shipping', label: 'Đang vận chuyển', count: categorizedOrders.shipping.length, activeClass: 'bg-orange-500', inactiveClass: 'bg-gray-100' },
    { id: 'delivered', label: 'Đã giao hàng', count: categorizedOrders.delivered.length, activeClass: 'bg-green-500', inactiveClass: 'bg-gray-100' },
    { id: 'refund', label: 'Hoàn tiền', count: categorizedOrders.refund.length, activeClass: 'bg-red-500', inactiveClass: 'bg-gray-100' },
    { id: 'notPaid', label: 'Chưa thanh toán', count: categorizedOrders.notPaid.length, activeClass: 'bg-purple-500', inactiveClass: 'bg-gray-100' },
  ];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? `${tab.activeClass} text-white shadow-lg transform scale-105`
                    : `${tab.inactiveClass} text-gray-700 hover:bg-gray-200`
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Order Table */}
          <div className="bg-white rounded-lg">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {tabs.find(t => t.id === activeTab)?.label} - {categorizedOrders[activeTab]?.length || 0} đơn hàng
              </h3>
            </div>
            <DataGrid
              rows={createRows(categorizedOrders[activeTab])}
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

export default AllOrders;
