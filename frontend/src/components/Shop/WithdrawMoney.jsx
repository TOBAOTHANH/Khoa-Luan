import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { loadSeller } from "../../redux/actions/user";
import { AiOutlineDelete } from "react-icons/ai";

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
      // Lấy danh sách withdraw requests
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

  // Tính số dư từ tất cả đơn hàng đã giao (giống như doanh thu sau phí)
  // KHÔNG trừ withdraw requests vì số dư là số tiền có thể rút, không phải số tiền sau khi trừ đi các yêu cầu rút tiền
  const calculatedBalance = useMemo(() => {
    if (!orders || orders.length === 0) {
      return 0;
    }
    
    const allDeliveredOrders = orders.filter(order => order.status === 'Delivered');
    const totalRevenue = allDeliveredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const serviceCharge = totalRevenue * 0.1;
    const netRevenue = totalRevenue - serviceCharge;
    
    // Số dư = doanh thu sau phí (không trừ withdraw requests)
    // Vì withdraw requests chỉ là yêu cầu, chưa chắc đã được duyệt
    const balance = parseFloat(netRevenue.toFixed(2));
    
    // Debug log
    console.log('WithdrawMoney - Orders:', orders.length);
    console.log('WithdrawMoney - Delivered orders:', allDeliveredOrders.length);
    console.log('WithdrawMoney - Total revenue:', totalRevenue);
    console.log('WithdrawMoney - Calculated balance:', balance);
    
    return balance;
  }, [orders]);

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
        console.log(error.response.data.message);
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
    toast.error("Bạn không có đủ số dư để rút tiền!");
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
        .then((res) => {
          toast.success("Yêu cầu rút tiền thành công!");
          // Reload orders và withdraws để cập nhật số dư
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
        })
        .catch((error) => {
          toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        });
    }
  };

  // Số dư được tính từ tất cả đơn hàng đã giao (giống như doanh thu sau phí)
  const availableBalance = calculatedBalance.toFixed(2);

  return (
    <div className="w-full h-[90vh] p-8">
      <div className="w-full bg-white h-full rounded flex items-center justify-center flex-col">
        <h5 className="text-[20px] pb-4">
          Số dư khả dụng: ${availableBalance}
        </h5>
        <div
          className={`${styles.button} text-white !h-[42px] !rounded`}
          onClick={() => (availableBalance < 50 ? error() : setOpen(true))}
        >
          Rút tiền
        </div>
      </div>
      {open && (
        <div className="w-full h-screen z-[9999] fixed top-0 left-0 flex items-center justify-center bg-[#0000004e]">
          <div
            className={`w-[95%] 800px:w-[50%] bg-white shadow rounded ${paymentMethod ? "h-[80vh] overflow-y-scroll" : "h-[unset]"
              } min-h-[40vh] p-3`}
          >
            <div className="w-full flex justify-end">
              <RxCross1
                size={25}
                onClick={() => setOpen(false) || setPaymentMethod(false)}
                className="cursor-pointer"
              />
            </div>
            {paymentMethod ? (
              <div>
                <h3 className="text-[22px] font-Poppins text-center font-[600]">
                  Thêm phương thức rút tiền mới:
                </h3>
                <form onSubmit={handleSubmit}>
                  <div>
                    <label>
                      Tên Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name=""
                      required
                      value={bankInfo.bankName}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, bankName: e.target.value })
                      }
                      id=""
                      placeholder="Enter your Bank name!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>
                  <div className="pt-2">
                    <label>
                      Quốc Gia Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name=""
                      value={bankInfo.bankCountry}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankCountry: e.target.value,
                        })
                      }
                      id=""
                      required
                      placeholder="Enter your bank Country!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>
                  <div className="pt-2">
                    <label>
                      Mã Swift Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name=""
                      id=""
                      required
                      value={bankInfo.bankSwiftCode}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankSwiftCode: e.target.value,
                        })
                      }
                      placeholder="Enter your Bank Swift Code!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>

                  <div className="pt-2">
                    <label>
                      Số Tài Khoản Ngân Hàng{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name=""
                      id=""
                      value={bankInfo.bankAccountNumber}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAccountNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter your bank account number!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>
                  <div className="pt-2">
                    <label>
                      Tên Chủ Tài Khoản Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name=""
                      required
                      value={bankInfo.bankHolderName}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankHolderName: e.target.value,
                        })
                      }
                      id=""
                      placeholder="Enter your bank Holder name!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>

                  <div className="pt-2">
                    <label>
                      Địa Chỉ Ngân Hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name=""
                      required
                      id=""
                      value={bankInfo.bankAddress}
                      onChange={(e) =>
                        setBankInfo({
                          ...bankInfo,
                          bankAddress: e.target.value,
                        })
                      }
                      placeholder="Enter your bank address!"
                      className={`${styles.input} mt-2`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`${styles.button} mb-3 text-white`}
                  >
                    Thêm
                  </button>
                </form>
              </div>
            ) : (
              <>
                <h3 className="text-[22px] font-Poppins">
                  Các Phương Thức Rút Tiền Có Sẵn:
                </h3>

                {seller && seller?.withdrawMethod ? (
                  <div>
                    <div className="800px:flex w-full justify-between items-center">
                      <div className="800px:w-[50%]">
                        <h5>
                          Số Tài Khoản Ngân Hàng:{" "}
                          {"*".repeat(
                            seller?.withdrawMethod.bankAccountNumber.length - 3
                          ) +
                            seller?.withdrawMethod.bankAccountNumber.slice(-3)}
                        </h5>
                        <h5>Tên Ngân Hàng: {seller?.withdrawMethod.bankName}</h5>
                      </div>
                      <div className="800px:w-[50%]">
                        <AiOutlineDelete
                          size={25}
                          className="cursor-pointer"
                          onClick={() => deleteHandler()}
                        />
                      </div>
                    </div>
                    <br />
                    <h4>Số Dư Có Sẵn: ${availableBalance}</h4>
                    <br />
                    <div className="800px:flex w-full items-center">
                      <input
                        type="number"
                        placeholder="Amount..."
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="800px:w-[100px] w-[full] border 800px:mr-3 p-1 rounded"
                      />
                      <button
                        className="bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out"
                        onClick={withdrawHandler}
                      >
                        Rút Tiền
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[18px] pt-2">
                      Không có phương thức rút tiền nào khả dụng!
                    </p>
                    <div className="w-full flex items-center">
                      <button
                        className="bg-gradient-to-r from-[#f63b60] to-[#ff6b8a] hover:from-[#e02d4f] hover:to-[#ff5577] text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 ease-in-out mt-4"
                        onClick={() => setPaymentMethod(true)}
                      >
                        Thêm mới
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawMoney;