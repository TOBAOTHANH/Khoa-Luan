const express = require("express");
const router = express.Router();
const Notification = require("../model/notification");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../ultis/ErrorHandler");
const { isAuthenticated } = require("../middleware/auth");

// Get all notifications for a user
router.get(
  "/get-all/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notifications = await Notification.find({ userId: req.params.userId })
        .sort({ createdAt: -1 })
        .limit(50);
      
      // Fix old notification links from /order/ to /user/order/ and update in database
      const updatedNotifications = [];
      for (const notif of notifications) {
        if (notif.type === "order_status" && notif.link && notif.link.startsWith("/order/") && !notif.link.startsWith("/user/order/")) {
          // Update old link format
          const orderId = notif.link.replace("/order/", "");
          const newLink = `/user/order/${orderId}`;
          // Update in database
          await Notification.findByIdAndUpdate(notif._id, { link: newLink }, { new: true });
          notif.link = newLink;
        }
        updatedNotifications.push(notif);
      }
      
      res.status(200).json({
        success: true,
        notifications: updatedNotifications,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Mark notification as read
router.put(
  "/mark-read/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }
      notification.read = true;
      await notification.save();
      
      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Mark all notifications as read
router.put(
  "/mark-all-read/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      await Notification.updateMany(
        { userId: req.params.userId, read: false },
        { $set: { read: true } }
      );
      
      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;

