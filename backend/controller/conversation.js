const Conversation = require("../model/conversation");
const express = require("express");
const router = express.Router();
const ErrorHandler = require("../ultis/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isSeller, isAuthenticated } = require("../middleware/auth");

router.post(
    "/create-new-conversation",
    catchAsyncErrors(async (req, res, next) => {
      try {
        const { groupTitle, userId, sellerId } = req.body;
  
        // Kiểm tra xem đã có conversation giữa userId và sellerId chưa
        // (không phụ thuộc vào groupTitle để tránh duplicate khi click vào sản phẩm khác nhau)
        const isConversationExist = await Conversation.findOne({
          members: { $all: [userId, sellerId] }
        });
  
        if (isConversationExist) {
          // Nếu đã có conversation, cập nhật groupTitle nếu cần và trả về conversation hiện có
          if (groupTitle && isConversationExist.groupTitle !== groupTitle) {
            isConversationExist.groupTitle = groupTitle;
            await isConversationExist.save();
          }
          res.status(201).json({
            success: true,
            conversation: isConversationExist,
          });
        } else {
          // Tạo conversation mới với groupTitle từ userId + sellerId để đảm bảo unique
          const newGroupTitle = groupTitle || `${userId}_${sellerId}`;
          const conversation = await Conversation.create({
            members: [userId, sellerId],
            groupTitle: newGroupTitle,
          });
  
          res.status(201).json({
            success: true,
            conversation,
          });
        }
      } catch (error) {
        return next(new ErrorHandler(error.response?.message || error.message), 500);
      }
    })
);

// get seller conversations
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error), 500);
    }
  })
);

// get user conversations
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error) {
      return next(new ErrorHandler(error), 500);
    }
  })
);


// update the last message
router.put(
  "/update-last-message/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { lastMessage, lastMessageId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage,
        lastMessageId,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      return next(new ErrorHandler(error), 500);
    }
  })
);

module.exports = router;