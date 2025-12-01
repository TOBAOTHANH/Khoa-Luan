import { Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../styles/styles";
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
    // Load coupons
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
  }, [dispatch, seller?._id]);

  // Load products only when opening the form
  useEffect(() => {
    if (open && seller?._id && (!products || products.length === 0)) {
      setLoadingProducts(true);
      dispatch(getAllProductsShop(seller._id)).finally(() => {
        setLoadingProducts(false);
      });
    }
  }, [open, seller?._id, dispatch]);

  const handleDelete = async (id) => {
    axios.delete(`${server}/coupon/delete-coupon/${id}`, { withCredentials: true }).then((res) => {
      toast.success("Đã xóa mã giảm giá thành công!")
    })
    window.location.reload();
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
          selectedProduct: selectedProducts || null, // Backend expects selectedProduct (singular)
          value,
          shopId: seller._id,
        },
        { withCredentials: true }
      );
      
      toast.success(res.data.message || "Đã tạo mã giảm giá thành công!");
      
      // Reset form
      setName("");
      setValue(null);
      setMinAmout(null);
      setMaxAmount(null);
      setSelectedProducts(null);
      setOpen(false);
      
      // Reload coupons list
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
    { field: "id", headerName: "Id", minWidth: 150, flex: 0.7 },
    {
      field: "name",
      headerName: "Mã Giảm Giá",
      minWidth: 180,
      flex: 1.4,
    },
    {
      field: "price",
      headerName: "Giá Trị",
      minWidth: 100,
      flex: 0.6,
    },
    {
      field: "Delete",
      flex: 0.8,
      minWidth: 120,
      headerName: "",
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

  const row = [];

  coupouns &&
    coupouns.forEach((item) => {
      row.push({
        id: item._id,
        name: item.name,
        price: item.value + " %",
        sold: 10,
      });
    });

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="w-full mx-8 pt-1 mt-10 bg-white">
          <div className="w-full flex justify-end">
            <button
              className="bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out mr-3 mb-3"
              onClick={() => setOpen(true)}
            >
              Tạo Mã Giảm Giá
            </button>
          </div>
          <DataGrid
            rows={row}
            columns={columns}
            pageSize={10}
            disableSelectionOnClick
            autoHeight
          />
          {open && (
            <div className="fixed top-0 left-0 w-full h-screen bg-[#00000062] z-[20000] flex items-center justify-center">
              <div className="w-[90%] 800px:w-[40%] h-[80vh] bg-white rounded-md shadow p-4">
                <div className="w-full flex justify-end">
                  <RxCross1
                    size={30}
                    className="cursor-pointer"
                    onClick={() => setOpen(false)}
                  />
                </div>
                <h5 className="text-[30px] font-Poppins text-center">
                  Tạo Mã Giảm Giá
                </h5>
                {/* create coupoun code */}
                <form onSubmit={handleSubmit} aria-required={true}>
                  <br />
                  <div>
                    <label className="pb-2">
                      Tên Mã Giảm Giá <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={name}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên mã giảm giá..."
                    />
                  </div>
                  <br />
                  <div>
                    <label className="pb-2">
                      Tỷ Lệ Giảm Giá{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="value"
                      value={value}
                      required
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Nhập tỷ lệ giảm giá cho mã giảm giá của bạn..."
                    />
                  </div>
                  <br />
                  <div>
                    <label className="pb-2">Số Tiền Tối Thiểu</label>
                    <input
                      type="number"
                      name="value"
                      value={minAmount}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setMinAmout(e.target.value)}
                      placeholder="Nhập số tiền tối thiểu cho mã giảm giá của bạn..."
                    />
                  </div>
                  <br />
                  <div>
                    <label className="pb-2">Số Tiền Tối Đa</label>
                    <input
                      type="number"
                      name="value"
                      value={maxAmount}
                      className="mt-2 appearance-none block w-full px-3 h-[35px] border border-gray-300 rounded-[3px] placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Nhập số tiền tối đa cho mã giảm giá của bạn..."
                    />
                  </div>
                  <br />
                  <div>
                    <label className="pb-2">Sản Phẩm Được Chọn (Tùy chọn)</label>
                    {loadingProducts ? (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        Đang tải danh sách sản phẩm...
                      </div>
                    ) : (
                      <select
                        className="w-full mt-2 border h-[35px] rounded-[5px]"
                        value={selectedProducts || ""}
                        onChange={(e) => setSelectedProducts(e.target.value || null)}
                        disabled={loadingProducts}
                      >
                        <option value="">
                          Không chọn (Áp dụng cho tất cả sản phẩm)
                        </option>
                        {products && products.length > 0 ? (
                          products.map((i) => (
                            <option value={i.name} key={i._id || i.name}>
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
                      <p className="text-sm text-gray-500 mt-1">
                        Vui lòng tạo sản phẩm trước khi chọn sản phẩm cho mã giảm giá
                      </p>
                    )}
                  </div>
                  <br />
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out mt-2 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Đang tạo...' : 'Tạo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AllCoupons;
