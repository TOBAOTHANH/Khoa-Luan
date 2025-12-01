const express = require('express');
const router = express.Router();
const Event = require('../model/event');
const { upload } = require('../multer');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const Shop = require('../model/shop');
const ErrorHandler = require('../ultis/ErrorHandler');
const { isSeller, isAdmin, isAuthenticated } = require('../middleware/auth');
const fs = require('fs');

router.post(
  '/create-event',
  upload.array('images'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler('ID cửa hàng không hợp lệ!', 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const eventData = req.body;
        eventData.images = imageUrls;
        eventData.shop = shop;
        const product = await Event.create(eventData);
        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
// get all events
router.get('/get-all-events', async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});
// get all events of a shop
router.get(
  '/get-all-events/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
// delete event of a shop
router.delete(
  '/delete-shop-event/:id',

  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      // Tìm sự kiện cần xóa
      const eventData = await Event.findById(productId);

      // Kiểm tra nếu không tìm thấy sự kiện
      if (!eventData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sự kiện với id này!',
        });
      }

      // Xóa sự kiện trước để phản hồi ngay lập tức
      await Event.findByIdAndDelete(productId);

      // Phản hồi thành công ngay sau khi xóa sự kiện
      res.status(200).json({
        success: true,
        message: 'Sự kiện đã được xóa thành công!',
      });

      // Xóa hình ảnh sau khi đã phản hồi thành công
      const deleteFiles = eventData.images.map(async (imageUrl) => {
        const filePath = `uploads/${imageUrl}`;
        try {
          await fs.promises.unlink(filePath);
        } catch (err) {
          console.error(`Failed to delete file ${filePath}:`, err);
        }
      });

      // Dùng Promise.all để đảm bảo xóa tất cả file cùng lúc
      await Promise.all(deleteFiles);
    } catch (error) {
      return next(
        new ErrorHandler(error.message || 'Something went wrong', 400)
      );
    }
  })
);

// all event --- for admin
router.get(
  '/admin-all-events',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const Event = require("../model/event");
// const { upload } = require("../multer");
// const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const Shop = require("../model/shop");
// const ErrorHandler = require("../ultis/ErrorHandler");
// const { isSeller } = require("../middleware/auth");
// const fs = require("fs");

// //create Product
// router.post("/create-event", upload.array("images"), catchAsyncErrors(async (req, res, next) => {
//     try {
//         const shopId = req.body.shopId;
//         const shop = await Shop.findById(shopId);
//         if (!shop) {
//             return next(new ErrorHandler("Shop id is invalid", 404));
//         } else {
//             const files = req.files;
//             const imageUrls = files.map((file) => `${file.filename}`);
//             const eventData = req.body;
//             eventData.images = imageUrls;
//             eventData.shop = shop;

//             const product = await Event.create(eventData);
//             res.status(201).json({
//                 success: true,
//                 product,
//             });
//         }
//     } catch (error) {
//         return next(new ErrorHandler(error.message, 400));
//     }
// }));

// // get all products
// router.get("/get-all-events/:id", catchAsyncErrors(async (req, res, next) => {
//     try {
//         const events = await Event.find({ shopId: req.params.id });
//         res.status(200).json({
//             success: true,
//             events,
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error, 400));
//     }
// }));

// //delete product
// router.delete("/delete-shop-event/:id", isSeller, catchAsyncErrors(async (req, res, next) => {
//     try {
//         const productId = req.params.id;

//         const eventData= await Event.findById(productId);

//         eventData.images.forEach((imageUrl) => {
//             const filename = imageUrl;
//             const filePath = `uploads/${filename}`;
//             fs.unlink(filePath, (err) => {
//                 if (err) {
//                     console.log(err);
//                 }
//             });
//         });

//         const event= await Event.findByIdAndDelete(productId);
//         if (!event) {
//             return next(new ErrorHandler("Event not found with this id!", 500));

//         }

//         res.status(201).json({
//             success: true,
//             message: "event is deleted",
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error, 400));
//     }
// }))

// module.exports = router;
