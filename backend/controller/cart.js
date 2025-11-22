const express = require("express");
const router = express.Router();
const CartModel = require("../model/cart");
const { isAuthenticated } = require("../middleware/auth");


// Get cart by user ID
router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const cart = await CartModel.find({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post("/", isAuthenticated, async (req, res) => {
  const { userId, productId, qty } = req.body;

  try {
   let cartItem = await CartModel.findOne({ userId, productId });

    if (cartItem) {
      cartItem.qty += qty;
      await cartItem.save();
    } else {
      cartItem = new CartModel({ userId, productId, qty });
      await cartItem.save();
    }

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    await CartModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
