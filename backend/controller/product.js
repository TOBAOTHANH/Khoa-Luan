const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Shop = require("../model/shop");
const ErrorHandler = require("../ultis/ErrorHandler");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const fs = require("fs");
const { upload } = require("../multer");
// create product
router.post(  // dùng cái này cho local
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;
        const product = await Product.create(productData);
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
// router.post(   // dùng cái này cho cloudinary
//   "/create-product",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const shopId = req.body.shopId;
//       const shop = await Shop.findById(shopId);
//       if (!shop) {
//         return next(new ErrorHandler("Shop Id is invalid!", 400));
//       } else {
//         let images = [];

//         if (typeof req.body.images === "string") {
//           images.push(req.body.images);
//         } else {
//           images = req.body.images;
//         }
      
//         const imagesLinks = [];
      
//         for (let i = 0; i < images.length; i++) {
//           const result = await cloudinary.v2.uploader.upload(images[i], {
//             folder: "products",
//           });
      
//           imagesLinks.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//           });
//         }
      
//         const productData = req.body;
//         productData.images = imagesLinks;
//         productData.shop = shop;

//         const product = await Product.create(productData);

//         res.status(201).json({
//           success: true,
//           product,
//         });
//       }
//     } catch (error) {
//       return next(new ErrorHandler(error, 400));
//     }
//   })
// );

// get all products of a shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
// delete product of a shop
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const productData = await Product.findById(productId);
      productData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return next(new ErrorHandler("Không tìm thấy sản phẩm với id này!", 500));
      }
      res.status(201).json({
        success: true,
        message: "Sản phẩm đã được xóa thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get single product by id
router.get(
  "/get-product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new ErrorHandler("Không tìm thấy sản phẩm với id này!", 404));
      }
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// update product of a shop
router.put(
  "/update-shop-product/:id",
  isSeller,
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId);
      
      if (!product) {
        return next(new ErrorHandler("Không tìm thấy sản phẩm với id này!", 404));
      }

      // Check if seller is authenticated
      if (!req.seller || !req.seller._id) {
        return next(new ErrorHandler("Người bán chưa được xác thực!", 401));
      }

      // Check if seller owns this product
      // Convert both to string for comparison (shopId might be string or ObjectId)
      const productShopId = product.shopId ? product.shopId.toString() : null;
      const sellerId = req.seller._id ? req.seller._id.toString() : null;
      
      // Debug logging (can be removed later)
      console.log("Product ShopId:", productShopId);
      console.log("Seller ID:", sellerId);
      console.log("Match:", productShopId === sellerId);
      
      if (productShopId !== sellerId) {
        return next(new ErrorHandler("Bạn không có quyền cập nhật sản phẩm này!", 403));
      }

      // Handle images
      // If existingImagesToKeep is provided, use it; otherwise keep all existing images
      let imagesToKeep = [];
      if (req.body.existingImagesToKeep) {
        try {
          imagesToKeep = JSON.parse(req.body.existingImagesToKeep);
        } catch (e) {
          imagesToKeep = [];
        }
      } else {
        imagesToKeep = product.images || [];
      }

      // Handle new images if provided
      if (req.files && req.files.length > 0) {
        // Delete old images that are not in the keep list
        product.images.forEach((imageUrl) => {
          if (!imagesToKeep.includes(imageUrl)) {
            const filename = imageUrl;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
        // Add new images
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        product.images = [...imagesToKeep, ...imageUrls];
      } else {
        // No new images, just update the existing images list
        // Delete images that are not in the keep list
        product.images.forEach((imageUrl) => {
          if (!imagesToKeep.includes(imageUrl)) {
            const filename = imageUrl;
            const filePath = `uploads/${filename}`;
            fs.unlink(filePath, (err) => {
              if (err) {
                console.log(err);
              }
            });
          }
        });
        product.images = imagesToKeep;
      }

      // Update product fields
      if (req.body.name) product.name = req.body.name;
      if (req.body.description) product.description = req.body.description;
      if (req.body.category) product.category = req.body.category;
      if (req.body.tags !== undefined) product.tags = req.body.tags;
      if (req.body.originalPrice !== undefined) product.originalPrice = req.body.originalPrice;
      if (req.body.discountPrice !== undefined) product.discountPrice = req.body.discountPrice;
      if (req.body.stock !== undefined) product.stock = req.body.stock;

      await product.save();

      res.status(200).json({
        success: true,
        product,
        message: "Sản phẩm đã được cập nhật thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// get all products
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({createdAt: -1});
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);


// review for a product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating,comment, productId} = req.body;

      const product = await Product.findById(productId);

      const review = {
        user,
        rating,
        comment,
        productId,
      };

      const isReviewed = product.reviews.find(
        (rev) => rev.user._id === req.user._id
      );

      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user._id === req.user._id) {
            (rev.rating = rating), (rev.comment = comment), (rev.user = user);
          }
        });
      } else {
        product.reviews.push(review);
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        avg += rev.rating;
      });

      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

   
      res.status(200).json({
        success: true,
        message: "Đánh giá thành công!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// shop feedback for review
router.put(
  "/add-shop-feedback",
  isAuthenticated,
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, reviewId, userId, shopFeedback } = req.body;

      const product = await Product.findById(productId);

      if (!product) {
        return next(new ErrorHandler("Không tìm thấy sản phẩm", 404));
      }

      // Check if shop owns this product
      if (product.shopId !== req.seller.id) {
        return next(new ErrorHandler("Bạn không có quyền phản hồi đánh giá này", 403));
      }

      // Find review by reviewId or userId
      let review = null;
      if (reviewId) {
        review = product.reviews.find(
          (rev) => rev._id && rev._id.toString() === reviewId
        );
      }
      
      if (!review && userId) {
        review = product.reviews.find(
          (rev) => rev.user && rev.user._id && rev.user._id.toString() === userId
        );
      }

      if (!review) {
        return next(new ErrorHandler("Không tìm thấy đánh giá", 404));
      }

      review.shopFeedback = shopFeedback;
      review.shopFeedbackDate = Date.now();

      await product.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        message: "Phản hồi đánh giá thành công!",
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// get all reviews for a shop
router.get(
  "/get-all-reviews-shop",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.seller.id });
      
      // Collect all reviews with product info
      const allReviews = [];
      products.forEach((product) => {
        product.reviews.forEach((review) => {
          allReviews.push({
            ...review.toObject(),
            productId: product._id,
            productName: product.name,
            productImage: product.images && product.images.length > 0 ? product.images[0] : null,
          });
        });
      });

      // Sort by createdAt descending (newest first)
      allReviews.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      res.status(200).json({
        success: true,
        reviews: allReviews,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// all products --- for admin
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


module.exports = router;
