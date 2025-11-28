import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { useEffect } from "react";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import { FaCreditCard, FaPaypal, FaMoneyBillWave } from "react-icons/fa";
import { HiLockClosed } from "react-icons/hi";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);
  }, []);

  const createOrder = (data, actions) => {
    return actions.order
    .create({
        purchase_units: [
          {
            description: "Sunflower",
            amount: {
              currency_code: "USD",
              value: orderData?.totalPrice,
            },
          },
        ],
        // not needed if a shipping address is actually needed
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;
      
      let paymentInfo = payer;
      
      if (paymentInfo !== undefined) {
        paypalPaymentHandler(paymentInfo);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
    .post(`${server}/order/create-order`, order, config)
    .then((res) => {
        setOpen(false);
        // Lưu order IDs vào localStorage
        if (res.data.orders && res.data.orders.length > 0) {
          const orderIds = res.data.orders.map(o => o._id);
          localStorage.setItem("latestOrderIds", JSON.stringify(orderIds));
        }
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
        window.location.reload();
      });
  };
  
  const paymentData = {
    amount: Math.round(orderData?.totalPrice * 100),
  };
  
  const paymentHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${server}/payment/process`,
        paymentData,
        config
      );

      const client_secret = data.client_secret;
      
      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymnentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            type: "Credit Card",
          };

          await axios
          .post(`${server}/order/create-order`, order, config)
          .then((res) => {
              setOpen(false);
              // Lưu order IDs vào localStorage
              if (res.data.orders && res.data.orders.length > 0) {
                const orderIds = res.data.orders.map(o => o._id);
                localStorage.setItem("latestOrderIds", JSON.stringify(orderIds));
              }
              navigate("/order/success");
              toast.success("Order successful!");
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));
              window.location.reload();
            });
          }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      type: "Cash On Delivery",
    };

    await axios
    .post(`${server}/order/create-order`, order, config)
    .then((res) => {
      setOpen(false);
      // Lưu order IDs vào localStorage
      if (res.data.orders && res.data.orders.length > 0) {
        const orderIds = res.data.orders.map(o => o._id);
        localStorage.setItem("latestOrderIds", JSON.stringify(orderIds));
      }
      navigate("/order/success");
      toast.success("Order successful!");
      localStorage.setItem("cartItems", JSON.stringify([]));
      localStorage.setItem("latestOrder", JSON.stringify([]));
      window.location.reload();
    });
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Thanh Toán</h1>
          <p className="text-gray-600">Vui lòng chọn phương thức thanh toán phù hợp với bạn</p>
        </div>
        <div className="w-full block lg:flex gap-8">
          <div className="w-full lg:w-[65%]">
            <PaymentInfo
              user={user}
              open={open}
              setOpen={setOpen}
              onApprove={onApprove}
              createOrder={createOrder}
              paymentHandler={paymentHandler}
              cashOnDeliveryHandler={cashOnDeliveryHandler}
            />
          </div>
          <div className="w-full lg:w-[35%] lg:mt-0 mt-8">
            <CartData orderData={orderData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({
  user,
  open,
  setOpen,
  onApprove,
  createOrder,
  paymentHandler,
  cashOnDeliveryHandler,
}) => {
  const [select, setSelect] = useState(1);
  
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8">
      {/* Security Badge */}
      <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200">
        <HiLockClosed className="text-green-500 text-xl mr-2" />
        <span className="text-sm text-gray-600 font-medium">Giao dịch được bảo mật và mã hóa</span>
      </div>

      {/* Payment Methods */}
      <div className="space-y-6">
        {/* Credit Card Option */}
        <div className="border-2 rounded-xl overflow-hidden transition-all duration-300"
          style={{ borderColor: select === 1 ? '#3b82f6' : '#e5e7eb' }}>
          <div 
            className="flex items-center p-5 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
            onClick={() => setSelect(1)}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4"
              style={{ borderColor: select === 1 ? '#3b82f6' : '#9ca3af' }}>
              {select === 1 && (
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              )}
            </div>
            <FaCreditCard className="text-2xl text-blue-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800 flex-1">
              Thanh toán bằng thẻ tín dụng/ghi nợ
            </h4>
          </div>

          {/* Card Form */}
          {select === 1 && (
            <div className="p-6 bg-gray-50">
              <form className="w-full" onSubmit={paymentHandler}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên trên thẻ
                    </label>
                    <input
                      required
                      placeholder={user && user.name}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={user && user.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày hết hạn
                    </label>
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <CardExpiryElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              lineHeight: 1.5,
                              color: "#1f2937",
                            },
                            empty: {
                              color: "#9ca3af",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số thẻ
                    </label>
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <CardNumberElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              lineHeight: 1.5,
                              color: "#1f2937",
                            },
                            empty: {
                              color: "#9ca3af",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <div className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                      <CardCvcElement
                        options={{
                          style: {
                            base: {
                              fontSize: "16px",
                              lineHeight: 1.5,
                              color: "#1f2937",
                            },
                            empty: {
                              color: "#9ca3af",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Xác nhận thanh toán
                </button>
              </form>
            </div>
          )}
        </div>

        {/* PayPal Option */}
        <div className="border-2 rounded-xl overflow-hidden transition-all duration-300"
          style={{ borderColor: select === 2 ? '#0070ba' : '#e5e7eb' }}>
          <div 
            className="flex items-center p-5 cursor-pointer bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-200"
            onClick={() => setSelect(2)}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4"
              style={{ borderColor: select === 2 ? '#0070ba' : '#9ca3af' }}>
              {select === 2 && (
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              )}
            </div>
            <FaPaypal className="text-2xl text-blue-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800 flex-1">
              Thanh toán bằng PayPal
            </h4>
          </div>

          {/* PayPal Form */}
          {select === 2 && (
            <div className="p-6 bg-gray-50">
              <button
                onClick={() => setOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <FaPaypal className="text-xl" />
                <span>Thanh toán với PayPal</span>
              </button>
              {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
                  <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
                      <h3 className="text-xl font-semibold text-gray-800">Thanh toán PayPal</h3>
                      <RxCross1
                        size={28}
                        className="cursor-pointer text-gray-500 hover:text-gray-800 transition-colors"
                        onClick={() => setOpen(false)}
                      />
                    </div>
                    <div className="p-8">
                      <PayPalScriptProvider
                        options={{
                          "client-id":
                            "AQpQWnKpHrKdhMSiXKt2Ttlw2eEsJEtf01JOvgjfpU4BIYkDTKPK8BOPYNjYNYWeQmMeS3i0AMnX2KFK",
                        }}
                      >
                        <PayPalButtons
                          style={{ layout: "vertical" }}
                          onApprove={onApprove}
                          createOrder={createOrder}
                        />
                      </PayPalScriptProvider>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cash on Delivery Option */}
        <div className="border-2 rounded-xl overflow-hidden transition-all duration-300"
          style={{ borderColor: select === 3 ? '#10b981' : '#e5e7eb' }}>
          <div 
            className="flex items-center p-5 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-200"
            onClick={() => setSelect(3)}
          >
            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4"
              style={{ borderColor: select === 3 ? '#10b981' : '#9ca3af' }}>
              {select === 3 && (
                <div className="w-3 h-3 bg-green-600 rounded-full" />
              )}
            </div>
            <FaMoneyBillWave className="text-2xl text-green-600 mr-3" />
            <h4 className="text-lg font-semibold text-gray-800 flex-1">
              Thanh toán khi nhận hàng (COD)
            </h4>
          </div>
          {select === 3 && (
            <div className="p-6 bg-gray-50">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý:</strong> Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng. 
                  Vui lòng chuẩn bị đúng số tiền để thanh toán.
                </p>
              </div>
              <form className="w-full" onSubmit={cashOnDeliveryHandler}>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  Xác nhận đặt hàng
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping = orderData?.shipping?.toFixed(2);
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 sticky top-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
        Tóm tắt đơn hàng
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Tạm tính:</span>
          <span className="text-gray-800 font-semibold text-lg">${orderData?.subTotalPrice}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Phí vận chuyển:</span>
          <span className="text-gray-800 font-semibold text-lg">${shipping}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-gray-200 pb-4">
          <span className="text-gray-600 font-medium">Giảm giá:</span>
          <span className="text-green-600 font-semibold text-lg">
            {orderData?.discountPrice ? `-$${orderData.discountPrice}` : "-"}
          </span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-bold text-xl">Tổng cộng:</span>
          <span className="text-blue-600 font-bold text-2xl">${orderData?.totalPrice}</span>
        </div>
      </div>

      {/* Order Items Preview */}
      {orderData?.cart && orderData.cart.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm trong đơn hàng</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {orderData.cart.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                <img
                  src={item.images && item.images[0] ? `${backend_url}${item.images[0]}` : 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Số lượng: {item.qty}</p>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  ${(item.qty * item.discountPrice).toFixed(2)}
                </p>
              </div>
            ))}
            {orderData.cart.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                + {orderData.cart.length - 3} sản phẩm khác
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;