const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../ultis/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const CoupounCode = require("../model/coupounCode");
const User = require("../model/user");
const sendMail = require("../ultis/sendMail");
const Notification = require("../model/notification");

// create coupoun code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const isCoupounCodeExists = await CoupounCode.find({
        name: req.body.name,
      });
      if (isCoupounCodeExists.length !== 0) {
        return next(new ErrorHandler("Mã giảm giá đã tồn tại!", 400));
      }
      const coupounCode = await CoupounCode.create(req.body);
      
      // Send response immediately, then process notifications/emails in background
      res.status(201).json({
        success: true,
        coupounCode,
        message: "Mã giảm giá đã được tạo thành công! Đang gửi thông báo cho khách hàng...",
      });
      
      // Process notifications and emails in background (non-blocking)
      setImmediate(async () => {
        try {
          const users = await User.find({ role: "user" }).select('_id name email').lean();
          const shop = await Shop.findById(req.body.shopId).select('name').lean();
          
          if (!users || users.length === 0) return;
          
          // Prepare email template once
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .voucher-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
                .voucher-code { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
                .discount { font-size: 32px; color: #e74c3c; font-weight: bold; }
                .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Mã Giảm Giá Mới!</h1>
                </div>
                <div class="content">
                  <p>Xin chào {{USER_NAME}},</p>
                  <p>Chúng tôi có tin vui cho bạn! Shop <strong>${shop?.name || 'Cửa hàng'}</strong> vừa tạo mã giảm giá mới:</p>
                  <div class="voucher-box">
                    <div class="voucher-code">${req.body.name}</div>
                    <div class="discount">Giảm ${req.body.value}%</div>
                    ${req.body.minAmount ? `<p>Áp dụng cho đơn từ $${req.body.minAmount}</p>` : ''}
                  </div>
                  <p>Hãy nhanh tay săn sale và sử dụng mã này để nhận được ưu đãi tốt nhất!</p>
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout" class="button">Săn Sale Ngay</a>
                </div>
              </div>
            </body>
            </html>
          `;
          
          // Batch create notifications
          const notifications = users.map(user => ({
            userId: user._id,
            type: "voucher_new",
            title: "🎉 Mã giảm giá mới - Săn sale ngay!",
            message: `Shop ${shop?.name || 'Cửa hàng'} vừa tạo mã giảm giá "${req.body.name}" - Giảm ${req.body.value}%! Hãy nhanh tay săn sale ngay!`,
            link: `/checkout`,
            createdAt: new Date(),
          }));
          
          // Bulk insert notifications
          await Notification.insertMany(notifications);
          
          // Send emails in parallel (but limit concurrency to avoid overwhelming email server)
          const BATCH_SIZE = 10;
          for (let i = 0; i < users.length; i += BATCH_SIZE) {
            const batch = users.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map(async (user) => {
                try {
                  const personalizedHtml = emailHtml.replace('{{USER_NAME}}', user.name);
                  await sendMail({
                    email: user.email,
                    subject: `🎉 Mã giảm giá mới từ ${shop?.name || 'Cửa hàng'}!`,
                    message: personalizedHtml,
                    html: personalizedHtml,
                  });
                } catch (emailError) {
                  console.error(`Error sending email to ${user.email}:`, emailError);
                }
              })
            );
          }
          
          console.log(`Successfully sent ${users.length} voucher notifications`);
        } catch (error) {
          console.error("Error processing voucher notifications:", error);
        }
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
// get all coupons of a shop
router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find({ shopId: req.seller.id });
      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
// delete coupoun code of a shop
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findByIdAndDelete(req.params.id);
      if (!couponCode) {
        return next(new ErrorHandler("Mã giảm giá không tồn tại!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Mã giảm giá đã được xóa thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all coupons for customers
router.get(
  "/get-all-coupons",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCodes = await CoupounCode.find().populate('shopId', 'name avatar');
      res.status(200).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
module.exports = router;
