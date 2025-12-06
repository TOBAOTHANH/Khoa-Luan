import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { AiOutlineArrowRight, AiOutlineShopping, AiOutlineDollar } from "react-icons/ai";
import { FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import { getOrderStatusInVietnamese } from "../../utils/orderStatus";
import { format } from "timeago.js";

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
    { id: 'all', label: 'Tất cả', count: categorizedOrders.all.length, icon: AiOutlineShopping, color: 'from-blue-500 to-blue-600' },
    { id: 'processing', label: 'Đang xử lý', count: categorizedOrders.processing.length, icon: FiClock, color: 'from-yellow-500 to-yellow-600' },
    { id: 'shipping', label: 'Đang vận chuyển', count: categorizedOrders.shipping.length, icon: FiTruck, color: 'from-orange-500 to-orange-600' },
    { id: 'delivered', label: 'Đã giao hàng', count: categorizedOrders.delivered.length, icon: FiCheckCircle, color: 'from-green-500 to-green-600' },
    { id: 'refund', label: 'Hoàn tiền', count: categorizedOrders.refund.length, icon: FiXCircle, color: 'from-red-500 to-red-600' },
    { id: 'notPaid', label: 'Chưa thanh toán', count: categorizedOrders.notPaid.length, icon: AiOutlineDollar, color: 'from-purple-500 to-purple-600' },
  ];

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('đã giao') || statusLower.includes('thành công')) {
      return 'from-green-500 to-green-600';
    }
    if (statusLower.includes('đang vận chuyển') || statusLower.includes('shipping') || statusLower.includes('on the way')) {
      return 'from-orange-500 to-orange-600';
    }
    if (statusLower.includes('đang xử lý') || statusLower.includes('processing')) {
      return 'from-yellow-500 to-yellow-600';
    }
    if (statusLower.includes('hoàn tiền') || statusLower.includes('refund')) {
      return 'from-red-500 to-red-600';
    }
    if (statusLower.includes('chưa thanh toán') || statusLower.includes('not paid')) {
      return 'from-purple-500 to-purple-600';
    }
    return 'from-gray-500 to-gray-600';
  };

  const displayOrders = categorizedOrders[activeTab] || [];

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-4 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <AiOutlineShopping className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Quản Lý Đơn Hàng
                    </h2>
                    <p className="text-green-100 text-xs">
                      Tổng: {orders.length} đơn | Doanh thu: ${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs - Compact */}
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

            {/* Orders Display */}
            {displayOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FiPackage className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500 text-lg mb-2">
                  Chưa có đơn hàng nào
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'all' 
                    ? 'Bạn chưa có đơn hàng nào' 
                    : `Không có đơn hàng ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayOrders.map((order) => {
                  const status = getOrderStatusInVietnamese(order.status);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-2 hover:border-green-500"
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className={`bg-gradient-to-r ${statusColor} px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap`}>
                                {status}
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {format(order.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-gray-600 truncate">
                                {order._id.substring(0, 20)}...
                              </span>
                              <span className="text-xs text-gray-500">
                                • {order.cart?.length || 0} sp
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {order.user?.name || "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${order.totalPrice?.toFixed(2) || "0.00"}
                              </p>
                            </div>
                            <Link to={`/order/${order._id}`}>
                              <button className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap">
                                <span>Chi tiết</span>
                                <AiOutlineArrowRight size={14} />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Tổng đơn</p>
                    <p className="text-lg font-bold text-gray-800">{orders.length}</p>
                  </div>
                  <AiOutlineShopping className="text-blue-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Đã giao</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedOrders.delivered.length}</p>
                  </div>
                  <FiCheckCircle className="text-green-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Đang vận chuyển</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedOrders.shipping.length}</p>
                  </div>
                  <FiTruck className="text-orange-500" size={20} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-2 border-l-2 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Đang xử lý</p>
                    <p className="text-lg font-bold text-gray-800">{categorizedOrders.processing.length}</p>
                  </div>
                  <FiClock className="text-yellow-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllOrders;
