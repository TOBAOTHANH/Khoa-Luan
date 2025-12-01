// Hàm helper để chuyển đổi trạng thái đơn hàng từ tiếng Anh sang tiếng Việt
export const getOrderStatusInVietnamese = (status) => {
  const statusMap = {
    "Processing": "Đang xử lý",
    "Transferred to delivery partner": "Đã chuyển cho đối tác vận chuyển",
    "Shipping": "Đang vận chuyển",
    "Received": "Đã nhận",
    "On the way": "Đang trên đường",
    "Delivered": "Đã giao hàng",
    "Processing refund": "Đang xử lý hoàn tiền",
    "Refund Success": "Hoàn tiền thành công",
    "Succeeded": "Thành công",
    "Not Paid": "Chưa thanh toán"
  };
  
  return statusMap[status] || status;
};

// Hàm để lấy danh sách các option trạng thái bằng tiếng Việt
export const getOrderStatusOptions = (isRefund = false) => {
  if (isRefund) {
    return [
      { value: "Processing refund", label: "Đang xử lý hoàn tiền" },
      { value: "Refund Success", label: "Hoàn tiền thành công" }
    ];
  }
  
  return [
    { value: "Processing", label: "Đang xử lý" },
    { value: "Transferred to delivery partner", label: "Đã chuyển cho đối tác vận chuyển" },
    { value: "Shipping", label: "Đang vận chuyển" },
    { value: "Received", label: "Đã nhận" },
    { value: "On the way", label: "Đang trên đường" },
    { value: "Delivered", label: "Đã giao hàng" }
  ];
};

