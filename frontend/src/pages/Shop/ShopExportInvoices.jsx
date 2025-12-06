import React, { useState, useEffect } from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSidebar";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { 
  AiOutlineDownload, 
  AiOutlineFileExcel, 
  AiOutlineCalendar,
  AiOutlineInfoCircle 
} from "react-icons/ai";
import { 
  FiFileText, 
  FiTrendingUp,
  FiDollarSign 
} from "react-icons/fi";
import { 
  HiOutlineDocumentReport,
  HiOutlineCheckCircle 
} from "react-icons/hi";
import { getOrderStatusInVietnamese } from "../../utils/orderStatus";

const ShopExportInvoices = () => {
  const { seller = {} } = useSelector((state) => state.seller || {});
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  const [orderStats, setOrderStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Fetch order statistics for selected month/year
  const fetchOrderStats = async () => {
    if (!seller?._id) return;
    
    setIsLoadingStats(true);
    try {
      const { data } = await axios.get(
        `${server}/order/get-seller-orders-by-date/${seller._id}`,
        {
          params: {
            month: exportMonth,
            year: exportYear,
          },
          withCredentials: true,
        }
      );

      if (data.success && data.orders) {
        const deliveredOrders = data.orders.filter(
          (order) => order.status === "Delivered"
        );
        const totalRevenue = deliveredOrders.reduce(
          (sum, order) => sum + (order.totalPrice || 0),
          0
        );
        const serviceCharge = totalRevenue * 0.1;
        const netRevenue = totalRevenue - serviceCharge;

        setOrderStats({
          totalOrders: data.orders.length,
          deliveredOrders: deliveredOrders.length,
          totalRevenue: totalRevenue.toFixed(2),
          netRevenue: netRevenue.toFixed(2),
          serviceCharge: serviceCharge.toFixed(2),
        });
      } else {
        setOrderStats({
          totalOrders: 0,
          deliveredOrders: 0,
          totalRevenue: "0.00",
          netRevenue: "0.00",
          serviceCharge: "0.00",
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setOrderStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchOrderStats();
  }, [exportMonth, exportYear, seller?._id]);

  // Export invoices to Excel
  const exportInvoicesToExcel = async () => {
    if (!seller?._id) {
      toast.error("Không tìm thấy thông tin shop!");
      return;
    }

    setIsExporting(true);
    try {
      const { data } = await axios.get(
        `${server}/order/get-seller-orders-by-date/${seller._id}`,
        {
          params: {
            month: exportMonth,
            year: exportYear,
          },
          withCredentials: true,
        }
      );

      if (!data.success || !data.orders || data.orders.length === 0) {
        toast.warning(
          `Không có hóa đơn nào trong tháng ${exportMonth}/${exportYear}`
        );
        setIsExporting(false);
        return;
      }

      // Prepare data for Excel
      const excelData = [];

      data.orders.forEach((order, index) => {
        // Add order header row
        excelData.push({
          "STT": index + 1,
          "Mã đơn hàng": order._id.slice(0, 8),
          "Ngày tạo": new Date(order.createdAt).toLocaleDateString("vi-VN"),
          "Tên khách hàng": order.user?.name || "N/A",
          "Số điện thoại": order.user?.phoneNumber || "N/A",
          "Địa chỉ": `${order.shippingAddress?.address1 || ""} ${
            order.shippingAddress?.address2 || ""
          }`.trim() || "N/A",
          "Thành phố": order.shippingAddress?.city || "N/A",
          "Quận/Huyện": order.shippingAddress?.district || "N/A",
          "Tổng tiền": order.totalPrice || 0,
          "Trạng thái": getOrderStatusInVietnamese(order.status),
          "Phương thức thanh toán": order.paymentInfo?.type || "N/A",
          "Ngày thanh toán": order.paidAt
            ? new Date(order.paidAt).toLocaleDateString("vi-VN")
            : "N/A",
        });

        // Add product details for this order
        if (order.cart && order.cart.length > 0) {
          order.cart.forEach((item) => {
            excelData.push({
              "STT": "",
              "Mã đơn hàng": "",
              "Ngày tạo": "",
              "Tên khách hàng": "",
              "Số điện thoại": "",
              "Địa chỉ": "",
              "Thành phố": "",
              "Quận/Huyện": "",
              "Tổng tiền": "",
              "Trạng thái": "",
              "Phương thức thanh toán": "",
              "Ngày thanh toán": "",
              "Sản phẩm": item.name || "N/A",
              "Số lượng": item.qty || 0,
              "Đơn giá": item.discountPrice || 0,
              "Thành tiền": (item.discountPrice || 0) * (item.qty || 0),
            });
          });
        }

        // Add empty row between orders
        excelData.push({});
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Hóa đơn");

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 15 }, // Mã đơn hàng
        { wch: 12 }, // Ngày tạo
        { wch: 20 }, // Tên khách hàng
        { wch: 15 }, // Số điện thoại
        { wch: 30 }, // Địa chỉ
        { wch: 15 }, // Thành phố
        { wch: 15 }, // Quận/Huyện
        { wch: 12 }, // Tổng tiền
        { wch: 15 }, // Trạng thái
        { wch: 20 }, // Phương thức thanh toán
        { wch: 15 }, // Ngày thanh toán
        { wch: 30 }, // Sản phẩm
        { wch: 10 }, // Số lượng
        { wch: 12 }, // Đơn giá
        { wch: 12 }, // Thành tiền
      ];
      ws["!cols"] = colWidths;

      // Generate filename
      const monthNames = [
        "Thang01",
        "Thang02",
        "Thang03",
        "Thang04",
        "Thang05",
        "Thang06",
        "Thang07",
        "Thang08",
        "Thang09",
        "Thang10",
        "Thang11",
        "Thang12",
      ];
      const filename = `HoaDon_${monthNames[exportMonth - 1]}_${exportYear}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success(`Đã xuất ${data.orders.length} hóa đơn ra file Excel!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất hóa đơn!");
    } finally {
      setIsExporting(false);
    }
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={14} />
        </div>
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                  <AiOutlineFileExcel className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    Xuất Hóa Đơn Excel
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Xuất hóa đơn theo tháng/năm ra file Excel
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
              {/* Date Selection Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AiOutlineCalendar className="text-blue-600 text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Chọn Thời Gian
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Month Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tháng
                    </label>
                    <div className="relative">
                      <select
                        value={exportMonth}
                        onChange={(e) => setExportMonth(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all hover:border-blue-400"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <option key={month} value={month}>
                              {monthNames[month - 1]}
                            </option>
                          )
                        )}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Year Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Năm
                    </label>
                    <div className="relative">
                      <select
                        value={exportYear}
                        onChange={(e) => setExportYear(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer transition-all hover:border-blue-400"
                      >
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - 2 + i
                        ).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Cards */}
              {isLoadingStats ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : orderStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <FiFileText className="text-blue-600 text-2xl" />
                      <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded-full">
                        Tổng đơn
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-blue-700">
                      {orderStats.totalOrders}
                    </h3>
                    <p className="text-sm text-blue-600 mt-1">đơn hàng</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <HiOutlineCheckCircle className="text-green-600 text-2xl" />
                      <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded-full">
                        Đã giao
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">
                      {orderStats.deliveredOrders}
                    </h3>
                    <p className="text-sm text-green-600 mt-1">đơn hàng</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <FiDollarSign className="text-purple-600 text-2xl" />
                      <span className="text-xs font-semibold text-purple-700 bg-purple-200 px-2 py-1 rounded-full">
                        Doanh thu
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-700">
                      ${orderStats.totalRevenue}
                    </h3>
                    <p className="text-sm text-purple-600 mt-1">tổng cộng</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <FiTrendingUp className="text-orange-600 text-2xl" />
                      <span className="text-xs font-semibold text-orange-700 bg-orange-200 px-2 py-1 rounded-full">
                        Sau phí
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-orange-700">
                      ${orderStats.netRevenue}
                    </h3>
                    <p className="text-sm text-orange-600 mt-1">sau phí 10%</p>
                  </div>
                </div>
              ) : null}

              {/* Export Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={exportInvoicesToExcel}
                  disabled={isExporting || (orderStats && orderStats.totalOrders === 0)}
                  className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Đang xuất...</span>
                    </>
                  ) : (
                    <>
                      <AiOutlineDownload className="text-2xl" />
                      <span>Xuất Hóa Đơn Excel</span>
                    </>
                  )}
                </button>
                {orderStats && orderStats.totalOrders === 0 && (
                  <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                    <AiOutlineInfoCircle />
                    Không có hóa đơn nào trong tháng {exportMonth}/{exportYear}
                  </p>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <HiOutlineDocumentReport className="text-white text-2xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Thông tin về file Excel
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        File Excel sẽ chứa tất cả thông tin đơn hàng trong tháng/năm đã chọn
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        Mỗi đơn hàng bao gồm thông tin khách hàng, sản phẩm, giá tiền và trạng thái
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        File sẽ được tự động tải xuống với tên:{" "}
                        <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono text-xs">
                          HoaDon_ThangXX_YYYY.xlsx
                        </code>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopExportInvoices;

