import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { AiOutlineDelete, AiOutlineDollar, AiOutlineBank } from "react-icons/ai";
import { HiOutlineCash } from "react-icons/hi";

const WithdrawMoney = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { seller } = useSelector((state) => state.seller);
  const { orders = [] } = useSelector((state) => state.order || {});
  const [withdraws, setWithdraws] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(50);
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankCountry: "",
    bankSwiftCode: null,
    bankAccountNumber: null,
    bankHolderName: "",
    bankAddress: "",
  });

  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllOrdersOfShop(seller._id));
      axios
        .get(`${server}/withdraw/get-seller-withdraw-request`, {
          withCredentials: true,
        })
        .then((res) => {
          setWithdraws(res.data.withdraws || []);
        })
        .catch((error) => {
          console.log(error.response?.data?.message);
        });
    }
  }, [dispatch, seller?._id]);

  // Sử dụng availableBalance từ shop thay vì tính lại từ orders
  const calculatedBalance = useMemo(() => {
    if (seller?.availableBalance !== undefined && seller?.availableBalance !== null) {
      return parseFloat(seller.availableBalance.toFixed(2));
    }
    return 0;
  }, [seller?.availableBalance]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const withdrawMethod = {
      bankName: bankInfo.bankName,
      bankCountry: bankInfo.bankCountry,
      bankSwiftCode: bankInfo.bankSwiftCode,
      bankAccountNumber: bankInfo.bankAccountNumber,
      bankHolderName: bankInfo.bankHolderName,
      bankAddress: bankInfo.bankAddress,
    };

    setPaymentMethod(false);

    await axios
      .put(
        `${server}/shop/update-payment-methods`,
        {
          withdrawMethod,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("Đã thêm phương thức rút tiền thành công!");
        dispatch(loadSeller());
        setBankInfo({
          bankName: "",
          bankCountry: "",
          bankSwiftCode: null,
          bankAccountNumber: null,
          bankHolderName: "",
          bankAddress: "",
        });
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      });
  };

  const deleteHandler = async () => {
    await axios
      .delete(`${server}/shop/delete-withdraw-method`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success("Đã xóa phương thức rút tiền thành công!");
        dispatch(loadSeller());
      });
  };

  const error = () => {
    toast.error("Bạn không có đủ số dư để rút tiền! (Tối thiểu $50)");
  };

  const withdrawHandler = async () => {
    if (withdrawAmount < 50 || withdrawAmount > calculatedBalance) {
      toast.error("Bạn không thể rút số tiền này!");
    } else {
      const amount = withdrawAmount;
      await axios
        .post(
          `${server}/withdraw/create-withdraw-request`,
          { amount },
          { withCredentials: true }
        )
        .then(async (res) => {
          toast.success("Yêu cầu rút tiền thành công!");
          // Reload seller data để cập nhật availableBalance
          await dispatch(loadSeller());
          if (seller?._id) {
            dispatch(getAllOrdersOfShop(seller._id));
            // Reload withdraws để cập nhật danh sách và số tiền đang chờ
            try {
              const withdrawRes = await axios.get(
                `${server}/withdraw/get-seller-withdraw-request`,
                { withCredentials: true }
              );
              setWithdraws(withdrawRes.data.withdraws || []);
            } catch (error) {
              console.error("Error reloading withdraws:", error.response?.data?.message);
            }
          }
          setOpen(false);
          setWithdrawAmount(50);
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        });
    }
  };

  const availableBalance = calculatedBalance.toFixed(2);
  // Tính tổng số tiền đang chờ rút (status: Processing, pending, processing - không phải succeed)
  const pendingWithdraws = useMemo(() => {
    return withdraws
      .filter(w => {
        const status = (w.status || '').toLowerCase();
        return status === 'processing' || status === 'pending';
      })
      .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
  }, [withdraws]);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const recalculateBalance = async () => {
    setIsRecalculating(true);
    try {
      const res = await axios.post(
        `${server}/shop/recalculate-balance`,
        {},
        { withCredentials: true }
      );
      toast.success(res.data.message || "Đã tính lại số dư thành công!");
      dispatch(loadSeller());
      if (seller?._id) {
        dispatch(getAllOrdersOfShop(seller._id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tính lại số dư");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <HiOutlineCash className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Rút Tiền</h1>
                <p className="text-emerald-100 text-sm">Quản lý và rút tiền từ shop</p>
              </div>
            </div>
            <button
              onClick={recalculateBalance}
              disabled={isRecalculating}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecalculating ? "Đang tính..." : "Tính lại số dư"}
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <AiOutlineDollar className="text-emerald-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Số dư
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              ${availableBalance}
            </h3>
            <p className="text-sm text-gray-600">Số dư khả dụng</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AiOutlineBank className="text-orange-600 text-2xl" />
              </div>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                Đang chờ
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">
              ${pendingWithdraws.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600">Yêu cầu rút tiền đang chờ</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <button
              onClick={() => (availableBalance < 50 ? error() : setOpen(true))}
              disabled={availableBalance < 50}
              className={`inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              <HiOutlineCash size={24} />
              Rút Tiền
            </button>
            {availableBalance < 50 && (
              <p className="text-sm text-red-600 mt-3">
                Số dư tối thiểu để rút tiền là $50
              </p>
            )}
          </div>
        </div>

        {/* Withdraw Modal */}
        {open && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <HiOutlineCash className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {paymentMethod ? "Thêm Phương Thức Rút Tiền" : "Rút Tiền"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setPaymentMethod(false);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <RxCross1 size={24} className="text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {paymentMethod ? (
                  <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên Ngân Hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankInfo.bankName}
                          onChange={(e) =>
                            setBankInfo({ ...bankInfo, bankName: e.target.value })
                          }
                          placeholder="Nhập tên ngân hàng..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Quốc Gia Ngân Hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bankInfo.bankCountry}
                          onChange={(e) =>
                            setBankInfo({
                              ...bankInfo,
                              bankCountry: e.target.value,
                            })
                          }
                          required
                          placeholder="Nhập quốc gia ngân hàng..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mã Swift Ngân Hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankInfo.bankSwiftCode || ""}
                          onChange={(e) =>
                            setBankInfo({
                              ...bankInfo,
                              bankSwiftCode: e.target.value,
                            })
                          }
                          placeholder="Nhập mã Swift..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Số Tài Khoản Ngân Hàng{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={bankInfo.bankAccountNumber || ""}
                          onChange={(e) =>
                            setBankInfo({
                              ...bankInfo,
                              bankAccountNumber: e.target.value,
                            })
                          }
                          required
                          placeholder="Nhập số tài khoản..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên Chủ Tài Khoản <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankInfo.bankHolderName}
                          onChange={(e) =>
                            setBankInfo({
                              ...bankInfo,
                              bankHolderName: e.target.value,
                            })
                          }
                          placeholder="Nhập tên chủ tài khoản..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Địa Chỉ Ngân Hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankInfo.bankAddress}
                          onChange={(e) =>
                            setBankInfo({
                              ...bankInfo,
                              bankAddress: e.target.value,
                            })
                          }
                          placeholder="Nhập địa chỉ ngân hàng..."
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(false)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                          Quay lại
                        </button>
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                        >
                          Thêm Phương Thức
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Phương Thức Rút Tiền
                      </h3>

                      {seller && seller?.withdrawMethod ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <AiOutlineBank className="text-blue-600 text-xl" />
                                <h4 className="font-bold text-gray-800">{seller?.withdrawMethod.bankName}</h4>
                              </div>
                              <div className="space-y-2 text-sm text-gray-700">
                                <p>
                                  <span className="font-semibold">Số tài khoản:</span>{" "}
                                  {"*".repeat(
                                    seller?.withdrawMethod.bankAccountNumber.length - 3
                                  ) +
                                    seller?.withdrawMethod.bankAccountNumber.slice(-3)}
                                </p>
                                <p>
                                  <span className="font-semibold">Chủ tài khoản:</span>{" "}
                                  {seller?.withdrawMethod.bankHolderName}
                                </p>
                                <p>
                                  <span className="font-semibold">Quốc gia:</span>{" "}
                                  {seller?.withdrawMethod.bankCountry}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteHandler()}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <AiOutlineDelete
                                size={24}
                                className="text-red-500 hover:text-red-700"
                              />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-6 text-center border-2 border-dashed border-gray-300">
                          <AiOutlineBank className="mx-auto text-gray-400 mb-3" size={48} />
                          <p className="text-gray-600 mb-4">
                            Chưa có phương thức rút tiền nào
                          </p>
                          <button
                            onClick={() => setPaymentMethod(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                          >
                            <AiOutlineBank size={18} />
                            Thêm Phương Thức
                          </button>
                        </div>
                      )}
                    </div>

                    {seller && seller?.withdrawMethod && (
                      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">
                          Số Dư Có Sẵn: <span className="text-emerald-600">${availableBalance}</span>
                        </h4>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Số Tiền Muốn Rút
                            </label>
                            <input
                              type="number"
                              placeholder="Nhập số tiền..."
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              min="50"
                              max={availableBalance}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Tối thiểu: $50 | Tối đa: ${availableBalance}
                            </p>
                          </div>
                          <button
                            onClick={withdrawHandler}
                            className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 whitespace-nowrap"
                          >
                            Rút Tiền
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawMoney;
