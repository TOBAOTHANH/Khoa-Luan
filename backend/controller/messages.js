const { upload } = require("../multer");
const Messages = require("../model/messages");
const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../ultis/ErrorHandler");

// create new message
router.post(
  "/create-new-message",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const messageData = req.body;
      let imageUrls = [];

      // Nếu có files từ FormData (upload trực tiếp)
      if (req.files && req.files.length > 0) {
        const files = req.files;
        imageUrls = files.map((file) => `${file.filename}`);
      }
      // Nếu có images từ body (base64 string hoặc array)
      else if (req.body.images) {
        // Nếu images là string (base64 hoặc filename), chuyển thành array
        if (typeof req.body.images === 'string') {
          imageUrls = [req.body.images];
        }
        // Nếu images là array
        else if (Array.isArray(req.body.images)) {
          imageUrls = req.body.images;
        }
      }

      messageData.conversationId = req.body.conversationId;
      messageData.sender = req.body.sender;
      messageData.text = req.body.text || "";

      // Lưu images - nếu là array thì lấy phần tử đầu, nếu là string thì dùng trực tiếp
      let imagesValue = undefined;
      if (imageUrls.length > 0) {
        // Nếu là array, lấy phần tử đầu (vì model chỉ lưu String)
        imagesValue = Array.isArray(imageUrls) ? imageUrls[0] : imageUrls;
      }

      const message = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: imagesValue,
      });

      await message.save();
      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      console.error("Error creating message:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// upload message image
router.post(
  "/upload-image",
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new ErrorHandler("Không có ảnh nào được upload", 400));
      }
      
      const imageUrl = req.file.filename;
      res.status(200).json({
        success: true,
        imageUrl: imageUrl,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all messages with conversation id
router.get(
  "/get-all-messages/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const messages = await Messages.find({
        conversationId: req.params.id,
      });

      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })
);


module.exports = router;