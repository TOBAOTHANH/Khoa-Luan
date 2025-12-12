const express = require("express");
const router = express.Router();
const ErrorHandler = require("../ultis/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
 const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap = new Map();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId).push(item);
      }

      // create an order for each shop
      const orders = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get orders by month and year for seller
router.get(
  "/get-seller-orders-by-date/:shopId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const shopId = req.params.shopId;

      if (!month || !year) {
        return next(new ErrorHandler("Vui lòng cung cấp tháng và năm", 400));
      }

      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (monthNum < 1 || monthNum > 12) {
        return next(new ErrorHandler("Tháng không hợp lệ", 400));
      }

      // Create date range for the month
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

      const orders = await Order.find({
        "cart.shopId": shopId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
        month: monthNum,
        year: yearNum,
        count: orders.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Không tìm thấy đơn hàng với id này", 400));
      }
      // Track if we've updated products for this order
      let productsUpdated = false;
      
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
        productsUpdated = true;
      }

      const oldStatus = order.status;
      order.status = req.body.status;

      // Chỉ cộng số dư khi order chuyển từ status khác sang "Delivered" lần đầu tiên
      if (req.body.status === "Delivered" && oldStatus !== "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * .10;
        await updateSellerInfo(order.totalPrice - serviceCharge);
        
        // Update sold_out when order is delivered (in case it wasn't updated at "Transferred to delivery partner")
        if (!productsUpdated) {
          order.cart.forEach(async (o) => {
            await updateOrderOnDelivered(o._id, o.qty);
          });
        }
      }

      await order.save({ validateBeforeSave: false });

      // Create notification for user about order status change
      if (oldStatus !== req.body.status && order.user?._id) {
        try {
          const Notification = require("../model/notification");
          const { backend_url } = require("../server");
          
          // Delete old notifications for this order with same type
          await Notification.deleteMany({
            userId: order.user._id.toString(),
            type: "order_status",
            $or: [
              { link: `/user/order/${order._id}` },
              { link: `/order/${order._id}` },
              { link: { $regex: `order/${order._id}` } }
            ],
          });

          // Get first product image for notification
          const firstProductImage = order.cart && order.cart.length > 0 && order.cart[0].images && order.cart[0].images[0]
            ? `${backend_url}${order.cart[0].images[0]}`
            : null;

          // Status messages with detailed descriptions
          const statusConfig = {
            "Processing": {
              message: "Đơn hàng của bạn đang được xử lý",
              description: `Đơn hàng #${order._id.toString().slice(0, 8)} đang được shop chuẩn bị. Bạn sẽ nhận được thông báo khi đơn hàng được gửi đi.`,
              link: `/user/order/${order._id}`,
            },
            "Transferred to delivery partner": {
              message: "Đơn hàng đã được chuyển cho đơn vị vận chuyển",
              description: `Đơn hàng #${order._id.toString().slice(0, 8)} đã được shop đóng gói và chuyển cho đơn vị vận chuyển. Đơn hàng sẽ được giao đến bạn trong thời gian sớm nhất.`,
              link: `/user/order/${order._id}`,
            },
            "Shipping": {
              message: "Đơn hàng đang được vận chuyển",
              description: `Đơn hàng #${order._id.toString().slice(0, 8)} đang trên đường đến bạn. Hãy chuẩn bị sẵn sàng để nhận hàng!`,
              link: `/user/order/${order._id}`,
            },
            "Delivered": {
              message: "Đơn hàng đã được giao thành công",
              description: `Đơn hàng #${order._id.toString().slice(0, 8)} đã được giao thành công! Hãy đánh giá sản phẩm để giúp shop cải thiện dịch vụ.`,
              link: `/user/order/${order._id}`, // Will be updated to review page
            },
            "Processing refund": {
              message: "Yêu cầu hoàn tiền đang được xử lý",
              description: `Yêu cầu hoàn tiền cho đơn hàng #${order._id.toString().slice(0, 8)} đang được xử lý. Bạn sẽ nhận được thông báo khi có kết quả.`,
              link: `/user/order/${order._id}`,
            },
            "Refund Success": {
              message: "Hoàn tiền thành công",
              description: `Yêu cầu hoàn tiền cho đơn hàng #${order._id.toString().slice(0, 8)} đã được chấp nhận. Tiền sẽ được hoàn về tài khoản của bạn trong 3-5 ngày làm việc.`,
              link: `/user/order/${order._id}`,
            },
          };

          const config = statusConfig[req.body.status] || {
            message: `Đơn hàng của bạn đã được cập nhật: ${req.body.status}`,
            description: `Trạng thái đơn hàng #${order._id.toString().slice(0, 8)} đã thay đổi.`,
            link: `/user/order/${order._id}`,
          };

          // For Delivered status, link to user order page (user can review from there)
          // The order page already has review buttons for each product
          const notificationLink = req.body.status === "Delivered" 
            ? `/user/order/${order._id}` 
            : config.link;

          await Notification.create({
            userId: order.user._id.toString(),
            type: "order_status",
            title: "Cập nhật trạng thái đơn hàng",
            message: config.message,
            description: config.description,
            imageUrl: firstProductImage,
            link: notificationLink,
          });
        } catch (notifError) {
          console.error("Error creating order status notification:", notifError);
        }
      }

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);
        if (product) {
          product.stock -= qty;
          product.sold_out += qty;
          await product.save({ validateBeforeSave: false });
        }
      }

      async function updateOrderOnDelivered(id, qty) {
        const product = await Product.findById(id);
        if (product) {
          // Update stock and sold_out when order is delivered
          // This handles cases where order was directly set to "Delivered" 
          // without going through "Transferred to delivery partner"
          product.stock = Math.max(0, product.stock - qty);
          product.sold_out = (product.sold_out || 0) + qty;
          await product.save({ validateBeforeSave: false });
        }
      }

      async function updateSellerInfo(amount) {
        const seller = await Shop.findById(req.seller.id);
        
        // Cộng dồn số dư thay vì ghi đè
        seller.availableBalance = (seller.availableBalance || 0) + amount;

        await seller.save();
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Không tìm thấy đơn hàng với id này", 400));
      }

      const oldStatus = order.status;
      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      // Create notification for user about refund request
      if (oldStatus !== req.body.status && order.user?._id) {
        try {
          const Notification = require("../model/notification");
          const { backend_url } = require("../server");
          
          // Delete old notifications for this order with same type
          await Notification.deleteMany({
            userId: order.user._id.toString(),
            type: "order_status",
            $or: [
              { link: `/user/order/${order._id}` },
              { link: `/order/${order._id}` },
              { link: { $regex: `order/${order._id}` } }
            ],
          });

          // Get first product image for notification
          const firstProductImage = order.cart && order.cart.length > 0 && order.cart[0].images && order.cart[0].images[0]
            ? `${backend_url}${order.cart[0].images[0]}`
            : null;

          // Create new notification
          await Notification.create({
            userId: order.user._id.toString(),
            type: "order_status",
            title: "Yêu cầu hoàn tiền",
            message: "Yêu cầu hoàn tiền của bạn đã được gửi và đang được xử lý",
            description: `Yêu cầu hoàn tiền cho đơn hàng #${order._id.toString().slice(0, 8)} đang được xử lý. Bạn sẽ nhận được thông báo khi có kết quả.`,
            imageUrl: firstProductImage,
            link: `/user/order/${order._id}`,
          });
        } catch (notifError) {
          console.error("Error creating refund notification:", notifError);
        }
      }

      res.status(200).json({
        success: true,
        order,
        message: "Yêu cầu hoàn tiền đơn hàng thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Không tìm thấy đơn hàng với id này", 400));
      }

      const oldStatus = order.status;
      order.status = req.body.status;

      await order.save();

      // Create notification for user about refund success
      if (oldStatus !== req.body.status && order.user?._id) {
        try {
          const Notification = require("../model/notification");
          const { backend_url } = require("../server");
          
          // Delete old notifications for this order with same type
          await Notification.deleteMany({
            userId: order.user._id.toString(),
            type: "order_status",
            $or: [
              { link: `/user/order/${order._id}` },
              { link: `/order/${order._id}` },
              { link: { $regex: `order/${order._id}` } }
            ],
          });

          // Get first product image for notification
          const firstProductImage = order.cart && order.cart.length > 0 && order.cart[0].images && order.cart[0].images[0]
            ? `${backend_url}${order.cart[0].images[0]}`
            : null;

          // Create new notification
          await Notification.create({
            userId: order.user._id.toString(),
            type: "order_status",
            title: "Hoàn tiền thành công",
            message: "Yêu cầu hoàn tiền của bạn đã được chấp nhận và hoàn tiền thành công",
            description: `Yêu cầu hoàn tiền cho đơn hàng #${order._id.toString().slice(0, 8)} đã được chấp nhận. Tiền sẽ được hoàn về tài khoản của bạn trong 3-5 ngày làm việc.`,
            imageUrl: firstProductImage,
            link: `/user/order/${order._id}`,
          });
        } catch (notifError) {
          console.error("Error creating refund success notification:", notifError);
        }
      }

      res.status(200).json({
        success: true,
        message: "Hoàn tiền đơn hàng thành công!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o) => {
          await updateOrder(o._id, o.qty);
        });
      }

      async function updateOrder(id, qty) {
        const product = await Product.findById(id);

        product.stock += qty;
        product.sold_out -= qty;

        await product.save({ validateBeforeSave: false });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
