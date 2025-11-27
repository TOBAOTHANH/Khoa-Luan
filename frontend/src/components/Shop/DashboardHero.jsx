import React, { useEffect, useState, useMemo } from "react";
import { AiOutlineArrowRight, AiOutlineMoneyCollect, AiOutlinePrinter } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { MdBorderClear } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { getAllProductsShop } from "../../redux/actions/product";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getOrderStatusInVietnamese } from "../../utils/orderStatus";

const DashboardHero = () => {
  const dispatch = useDispatch();
  const { orders = [] } = useSelector((state) => state.order || {});
  const { seller = {} } = useSelector((state) => state.seller || {});
  const { products = [] } = useSelector((state) => state.products || {});
  const [deliveredOrder, setDeliveredOrder] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'day', 'month', 'year'

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      dispatch(getAllProductsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  // Calculate revenue statistics
  const revenueStats = useMemo(() => {
    const now = new Date();
    let filteredOrders = orders;

    if (timeFilter === 'day') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      filteredOrders = orders.filter(order => new Date(order.createdAt) >= startOfDay);
    } else if (timeFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredOrders = orders.filter(order => new Date(order.createdAt) >= startOfMonth);
    } else if (timeFilter === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filteredOrders = orders.filter(order => new Date(order.createdAt) >= startOfYear);
    }

    const deliveredOrders = filteredOrders.filter(order => order.status === 'Delivered');
    const totalRevenue = deliveredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const serviceCharge = totalRevenue * 0.1;
    const netRevenue = totalRevenue - serviceCharge;
    const totalOrders = filteredOrders.length;
    const deliveredCount = deliveredOrders.length;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      netRevenue: netRevenue.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      totalOrders,
      deliveredCount,
      filteredOrders
    };
  }, [orders, timeFilter]);

  // Print invoice function
  const printInvoice = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const printWindow = window.open('', '_blank');
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa đơn #${order._id.slice(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HÓA ĐƠN BÁN HÀNG</h1>
          <p>Mã đơn hàng: #${order._id.slice(0, 8)}</p>
          <p>Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
        <div class="info">
          <h3>Thông tin khách hàng:</h3>
          <p>Tên: ${order.user?.name || 'N/A'}</p>
          <p>Điện thoại: ${order.user?.phoneNumber || 'N/A'}</p>
          <p>Địa chỉ: ${order.shippingAddress?.address1 || ''} ${order.shippingAddress?.address2 || ''}</p>
          <p>Thành phố: ${order.shippingAddress?.city || 'N/A'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.cart.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>US$${item.discountPrice}</td>
                <td>US$${(item.discountPrice * item.qty).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Tổng tiền: US$${order.totalPrice.toFixed(2)}</p>
          <p>Trạng thái: ${getOrderStatusInVietnamese(order.status)}</p>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };





  const availableBalance = seller?.availableBalance.toFixed(2);
  const columns = [
    { field: "id", headerName: "Id sản phẩm", minWidth: 150, flex: 0.7 },
    {
      field: "status",
      headerName: "Trạng Thái",
      minWidth: 130,
      flex: 0.7,
      cellClassName: (params) =>
        params.row.status === "Delivered" && "Succeeded" ? "greenColor" : "redColor",
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
      field: "actions",
      flex: 1,
      minWidth: 200,
      headerName: "Thao tác",
      type: "number",
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <Link to={`/dashboard/order/${params.id}`}>
            <Button variant="contained" color="primary" size="small">
              <AiOutlineArrowRight size={18} className="mr-1" />
              Chi tiết
            </Button>
          </Link>
          <Button 
            variant="contained" 
            color="secondary" 
            size="small"
            onClick={() => printInvoice(params.id)}
            startIcon={<AiOutlinePrinter />}
          >
            In hóa đơn
          </Button>
        </div>
      ),
    },
  ];

  const row = orders.map((item) => ({
    id: item._id,
    itemsQty: item.cart.reduce((acc, cartItem) => acc + (cartItem.qty || 0), 0),
    total: `US$ ${item.totalPrice || 0}`,
    status: getOrderStatusInVietnamese(item.status || ""),
  }));

  return (
    <div className="w-full p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h3 className="text-[28px] font-bold text-gray-800 pb-4 mb-6">Tổng Quan Shop</h3>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <AiOutlineMoneyCollect size={40} className="opacity-80" />
            <span className="text-sm opacity-90">Số dư</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">${availableBalance || "0.00"}</h3>
          <p className="text-sm opacity-90">(phí dịch vụ 10%)</p>
          <Link to="/dashboard-withdraw-money">
            <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-semibold transition-colors">
              Rút Tiền →
            </button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <MdBorderClear size={40} className="opacity-80" />
            <span className="text-sm opacity-90">Đơn hàng</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{revenueStats.totalOrders}</h3>
          <p className="text-sm opacity-90">Đã giao: {revenueStats.deliveredCount}</p>
          <Link to="/dashboard-orders">
            <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-semibold transition-colors">
              Xem Đơn Hàng →
            </button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <AiOutlineMoneyCollect size={40} className="opacity-80" />
            <span className="text-sm opacity-90">Sản phẩm</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">{products.length}</h3>
          <p className="text-sm opacity-90">Tổng số sản phẩm</p>
          <Link to="/dashboard-products">
            <button className="mt-4 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-semibold transition-colors">
              Xem Sản Phẩm →
            </button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <AiOutlineMoneyCollect size={40} className="opacity-80" />
            <span className="text-sm opacity-90">Doanh thu</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">${revenueStats.netRevenue}</h3>
          <p className="text-sm opacity-90">Sau phí dịch vụ</p>
        </div>
      </div>

      {/* Revenue Statistics Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[24px] font-bold text-gray-800">Thống Kê Doanh Thu</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeFilter('day')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeFilter === 'day' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeFilter('month')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeFilter === 'month' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeFilter('year')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeFilter === 'year' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Năm nay
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Tổng doanh thu</p>
            <h4 className="text-3xl font-bold text-green-600">${revenueStats.totalRevenue}</h4>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Doanh thu sau phí</p>
            <h4 className="text-3xl font-bold text-blue-600">${revenueStats.netRevenue}</h4>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
            <p className="text-sm text-gray-600 mb-2">Phí dịch vụ (10%)</p>
            <h4 className="text-3xl font-bold text-red-600">${revenueStats.serviceCharge}</h4>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[24px] font-bold text-gray-800">Đơn Hàng Mới Nhất</h3>
        </div>
        <div className="w-full min-h-[45vh]">
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
