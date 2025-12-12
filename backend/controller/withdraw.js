const Shop = require('../model/shop');
const ErrorHandler = require('../ultis/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const express = require('express');
const { isSeller, isAuthenticated, isAdmin } = require('../middleware/auth');
const Withdraw = require('../model/withdraw');
const sendMail = require('../ultis/sendMail');
//const sendMail = require("../utils/sendMail");
const router = express.Router();

//create withdraw request--- only for seller
router.post(
  '/create-withdraw-request',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { amount } = req.body;

      // Validate amount
      if (!amount || amount < 50) {
        return next(new ErrorHandler("Số tiền rút tối thiểu là $50", 400));
      }

      // Get shop with current balance
      const shop = await Shop.findById(req.seller._id);
      
      if (!shop) {
        return next(new ErrorHandler("Không tìm thấy shop", 404));
      }

      const currentBalance = shop.availableBalance || 0;
      
      // Check if balance is sufficient
      if (currentBalance < amount) {
        return next(new ErrorHandler("Số dư không đủ để rút tiền", 400));
      }

      const data = {
        seller: req.seller,
        amount,
      };

      // Create withdraw request first
      const withdraw = await Withdraw.create(data);

      // Update shop balance
      shop.availableBalance = currentBalance - amount;
      await shop.save();

      // Send email notification
      try {
        await sendMail({
          email: req.seller.email,
          subject: 'Yêu cầu rút tiền',
          message: `Xin chào ${req.seller.name}, Yêu cầu rút tiền của bạn với số tiền ${amount}$ đang được xử lý. Sẽ mất từ 3 đến 7 ngày để xử lý! `,
        });
      } catch (error) {
        console.error("Error sending email:", error);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get all withdraws --- admnin
router.get(
  '/get-all-withdraw-request',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find().sort({ createdAt: -1 });

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// get withdraw requests for seller
router.get(
  '/get-seller-withdraw-request',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const withdraws = await Withdraw.find({ 
        'seller._id': req.seller._id 
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// update withdraw request ---- admin
router.put(
  "/update-withdraw-request/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { sellerId } = req.body;

      const withdraw = await Withdraw.findByIdAndUpdate(
        req.params.id,
        {
          status: "succeed",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      const seller = await Shop.findById(sellerId);

      const transection = {
        _id: withdraw._id,
        amount: withdraw.amount,
        updatedAt: withdraw.updatedAt,
        status: withdraw.status,
      };

      seller.transections = [...seller.transections, transection];

      await seller.save();

      try {
        await sendMail({
          email: seller.email,
          subject: "Xác nhận thanh toán",
          message: `Xin chào ${seller.name}, Yêu cầu rút tiền của bạn với số tiền ${withdraw.amount}$ đang được thực hiện. Thời gian giao dịch phụ thuộc vào quy định của ngân hàng, thường mất từ 3 đến 7 ngày.`,
        });
      } catch (error) {
        return next(new ErrorHandler(error.message, 500));
      }
      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
