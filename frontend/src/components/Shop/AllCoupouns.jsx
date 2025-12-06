import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineGift, AiOutlinePlus } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../Layout/Loader";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAllProductsShop } from "../../redux/actions/product";

const AllCoupons = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [coupouns, setCoupouns] = useState([]);
  const [minAmount, setMinAmout] = useState(null);
  const [maxAmount, setMaxAmount] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [value, setValue] = useState(null);
  const { seller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${server}/coupon/get-coupon/${seller._id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setIsLoading(false);
        setCoupouns(res.data.couponCodes);
      })
      .catch((error) => {
        setIsLoading(false);
      });
  }, [seller?._id]);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      axios.delete(`${server}/coupon/delete-coupon/${id}`, { withCredentials: true }).then((res) => {
        toast.success("Đã xóa mã giảm giá thành công!")
        // Reload coupons
        axios.get(`${server}/coupon/get-coupon/${seller._id}`, {
          withCredentials: true,
        }).then((res) => {
          setCoupouns(res.data.couponCodes);
        });
      })
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${server}/coupon/create-coupon-code`,
        {
          name,
          minAmount,
          maxAmount,
          selectedProduct: selectedProducts || null,
          value,
          shopId: seller._id,
        },
        { withCredentials: true }
      );
      
      toast.success(res.data.message || "Đã tạo mã giảm giá thành công!");
      
      setName("");
      setValue(null);
      setMinAmout(null);
      setMaxAmount(null);
      setSelectedProducts(null);
      setOpen(false);
      
      const couponsRes = await axios.get(`${server}/coupon/get-coupon/${seller._id}`, {
        withCredentials: true,
      });
      setCoupouns(couponsRes.data.couponCodes);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo mã giảm giá!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      field: "productImage",
      headerName: "Sản Phẩm",
      minWidth: 120,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        try {
          const coupon = coupouns.find(c => {
            const cId = c._id?.toString() || String(c._id);
            const rowId = params.row.id?.toString() || String(params.row.id);
            return cId === rowId;
          });
          
          if (!coupon) {
            return (
              <span className="text-xs text-gray-500">-</span>
            );
          }
          
          const productId = coupon.selectedProduct;
          
          // Nếu không có selectedProduct, hiển thị "Tất cả sản phẩm"
          if (!productId) {
            return (
              <span className="text-xs font-semibold text-gray-600">Tất cả sản phẩm</span>
            );
          }
          
          // Hiển thị ID sản phẩm
          return (
            <span className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {String(productId).substring(0, 24)}...
            </span>
          );
        } catch (error) {
          console.error("Error rendering product ID:", error);
          return (
            <span className="text-xs text-red-500">Lỗi</span>
          );
        }
      },
    },
    {
      field: "name",
      headerName: "Mã Giảm Giá",
      minWidth: 200,
      flex: 1.5,
    },
    {
      field: "price",
      headerName: "Giá Trị",
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <span className="font-bold text-green-600">{params.value}</span>
      ),
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 100,
      headerName: "Thao tác",
      type: "number",
      sortable: false,
      renderCell: (params) => {
        return (
          <Button 
            onClick={() => handleDelete(params.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <AiOutlineDelete size={20} />
          </Button>
        );
      },
    },
  ];

  const row = [];

  coupouns &&
    coupouns.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: item.value + " %",
        selectedProduct: item.selectedProduct,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-amber-50 to-orange-50 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                    <AiOutlineGift className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Quản Lý Mã Giảm Giá
                    </h1>
                    <p className="text-amber-100 text-sm">
                      Tổng số mã giảm giá: {coupouns.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpen(true);
                    // Load products when opening modal
                    if (seller?._id && (!products || products.length === 0)) {
                      setLoadingProducts(true);
                      dispatch(getAllProductsShop(seller._id))
                        .then(() => {
                          setLoadingProducts(false);
                        })
                        .catch((error) => {
                          console.error("Error loading products:", error);
                          setLoadingProducts(false);
                        });
                    }
                  }}
                  className="flex items-center gap-2 bg-white text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <AiOutlinePlus size={20} />
                  Tạo Mã Giảm Giá
                </button>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {coupouns.length === 0 ? (
                <div className="text-center py-12">
                  <AiOutlineGift className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-500 text-lg mb-4">Chưa có mã giảm giá nào</p>
                  <button
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <AiOutlinePlus size={18} />
                    Tạo mã giảm giá đầu tiên
                  </button>
                </div>
              ) : (
                <DataGrid
                  rows={row}
                  columns={columns}
                  pageSize={10}
                  disableSelectionOnClick
                  autoHeight
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: '1px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f9fafb',
                      fontWeight: 'bold',
                      borderBottom: '2px solid #e5e7eb',
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: '#fef3c7',
                    },
                  }}
                />
              )}
            </div>

            {/* Create Coupon Modal */}
            {open && (
              <div className="fixed top-0 left-0 w-full h-screen bg-black/60 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <AiOutlineGift className="text-white text-xl" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Tạo Mã Giảm Giá</h2>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <RxCross1 size={24} className="text-white" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên Mã Giảm Giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={name}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên mã giảm giá..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tỷ Lệ Giảm Giá (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="value"
                        value={value || ""}
                        required
                        min="1"
                        max="100"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Nhập tỷ lệ giảm giá (1-100)..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số Tiền Tối Thiểu
                        </label>
                        <input
                          type="number"
                          name="minAmount"
                          value={minAmount || ""}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          onChange={(e) => setMinAmout(e.target.value)}
                          placeholder="Số tiền tối thiểu..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số Tiền Tối Đa
                        </label>
                        <input
                          type="number"
                          name="maxAmount"
                          value={maxAmount || ""}
                          min="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          onChange={(e) => setMaxAmount(e.target.value)}
                          placeholder="Số tiền tối đa..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sản Phẩm Được Chọn (Tùy chọn)
                      </label>
                      {loadingProducts ? (
                        <div className="text-center py-4 text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                          <p className="mt-2 text-sm">Đang tải danh sách sản phẩm...</p>
                        </div>
                      ) : (
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                          value={selectedProducts || ""}
                          onChange={(e) => setSelectedProducts(e.target.value || null)}
                        >
                          <option value="">
                            Không chọn (Áp dụng cho tất cả sản phẩm)
                          </option>
                          {products && products.length > 0 ? (
                            products.map((i) => (
                              <option value={i._id} key={i._id || i.name}>
                                {i.name} - ${i.discountPrice}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              Chưa có sản phẩm nào
                            </option>
                          )}
                        </select>
                      )}
                      {!loadingProducts && products && products.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">
                          Vui lòng tạo sản phẩm trước khi chọn sản phẩm cho mã giảm giá
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          setName("");
                          setValue(null);
                          setMinAmout(null);
                          setMaxAmount(null);
                          setSelectedProducts(null);
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Đang tạo...
                          </span>
                        ) : (
                          'Tạo Mã Giảm Giá'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AllCoupons;
