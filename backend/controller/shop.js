const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const sendMail = require('../ultis/sendMail');
const sendToken = require('../ultis/jwtToken');
const Shop = require('../model/shop');
const { isSeller, isAuthenticated, isAdmin } = require('../middleware/auth');
const { promiseHooks } = require('v8');
const { upload } = require('../multer');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../ultis/ErrorHandler');
const sendShopToken = require('../ultis/shopToken');
const shop = require('../model/shop');
//create shop
router.post('/create-shop', upload.single('file'), async (req, res, next) => {
  try {
    // Lấy email và chuyển về chữ thường, loại bỏ khoảng trắng
    const email = req.body.email.trim().toLowerCase();
    const { name, password, phoneNumber, zipCode, address } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const sellerEmail = await Shop.findOne({ email });
    if (sellerEmail) {
      return res.status(400).json({
        success: false,
        message:
          'Người dùng đã tồn tại, vui lòng đăng nhập thay vì tạo tài khoản mới.',
      });
    }

    // Xử lý địa chỉ nếu nó là mảng
    let shopAddress = address;
    if (Array.isArray(shopAddress)) {
      shopAddress = shopAddress.join(', ');
    }

    // Tiếp tục tạo shop
    const filename = req.file.filename;
    const fileUrl = path.join('/uploads', filename);
    const public_id = filename;

    const seller = {
      name,
      email,
      password,
      avatar: {
        url: fileUrl,
        public_id,
      },
      address: shopAddress,
      phoneNumber,
      zipCode,
    };

    const activationToken = createActivationToken(seller);
    // const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;
    const isProduction = process.env.NODE_ENV === 'production';
    const activationUrl = isProduction
      ? `https://khoa-luan-av1v.vercel.app/.app/activation/${activationToken}`
      : `http://localhost:3000/seller/activation/${activationToken}`;

    // Gửi email kích hoạt
    await sendMail({
      email: seller.email,
      subject: 'Kích hoạt tài khoản của bạn',
      message: `Xin chào ${seller.name}, vui lòng nhấp vào liên kết để kích hoạt tài khoản của bạn: ${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `Vui lòng kiểm tra email của bạn: ${seller.email} để kích hoạt shop!`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// router.post("/create-shop", upload.single("file"), async (req, res, next) => {
//     try{
//          const{email} = req.body;
//          const sellerEmail = await Shop.findOne({email});
//          if (sellerEmail) {
//             const filename = req.file.filename;
//             const filePath = `uploads/${filename}`;
//             fs.unlink(filePath, (err) => {
//               if (err) {
//                 console.log(err);
//                 return res.status(500).json({ message: "Error deleting file" });
//               }
//             });
//             return next(new ErrorHandler("User already exists", 400));
//           }
//            // Kiểm tra nếu địa chỉ chưa được cung cấp
//         if (!address) {
//           return res.status(400).json({ message: "Địa chỉ không được xác định" });
//       }
//     // Chuyển đổi địa chỉ thành chuỗi nếu nó là mảng
//     let shopAddress = address;
//     if (Array.isArray(shopAddress)) {
//         shopAddress = shopAddress.join(", "); // Nối các phần tử của mảng thành một chuỗi
//     }
//           // If email doesn't exist, create a new user
//     const filename = req.file.filename;
//     const fileUrl = path.join("/uploads", filename);

//     const public_id = filename;

//     const seller = {
//       name: req.body.name,
//       email: email,
//       password: req.body.password,
//       avatar: {
//         url: fileUrl,
//         public_id,
//       },
//       address: shopAddress,
//       phoneNumber: req.body.phoneNumber,
//         zipCode: req.body.zipCode,
//     };
//     const activationToken = createActivationToken(seller);

//     const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

//      try {
//       await sendMail({
//         email: seller.email,
//         subject: "Activate your account",
//         message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
//       });
//       res.status(201).json({
//         success: true,
//         message: `please check your email:- ${seller.email} to activate your shop !`,
//       });
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }

//     }catch(error){
//         return next(new ErrorHandler(error.message, 400));
//     }
// });

// create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: '5m',
  });
};

// activate user
router.post(
  '/activation',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      // Verify the activation token
      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler('Token không hợp lệ', 400));
      }

      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      // Check if the user already exists before activation
      let seller = await Shop.findOne({ email: email });

      if (seller) {
        return next(new ErrorHandler('Người dùng đã tồn tại', 400));
      }

      // Create a new shop after activation
      seller = await Shop.create({
        name,
        email,
        avatar,
        password,
        zipCode,
        address,
        phoneNumber,
      });

      // Send token after successful activation
      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// login shop
router.post(
  '/login-shop',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler('Vui lòng điền đầy đủ tất cả các trường!', 400));
      }

      const user = await Shop.findOne({ email }).select('+password');

      if (!user) {
        return next(new ErrorHandler("Người dùng không tồn tại!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler('Vui lòng cung cấp thông tin chính xác', 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// load shop
router.get(
  '/getSeller',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id); // Sử dụng req.seller

      if (!seller) {
        return next(new ErrorHandler("Người bán không tồn tại", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// log out shop
router.get(
  '/logout',
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie('seller_token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.status(201).json({
        success: true,
        message: 'Đăng xuất thành công!',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// get shop info
router.get(
  '/get-shop-info/:id',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// all shop --- for admin
router.get(
  '/admin-all-seller',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//delete seller by admin
router.delete(
  '/delete-seller/:id',
  isAuthenticated,
  isAdmin('Admin'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);
      if (!seller) {
        return next(
          new ErrorHandler('Không tìm thấy người bán với id này', 404)
        );
      }
      await Shop.findByIdAndDelete(req.params.id);
      res.status(201).json({
        success: true,
        message: 'Người dùng đã được xóa thành công',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller avatar
router.put(
  '/update-avatar',
  isSeller,
  upload.single('image'),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await Shop.findById(req.seller.id);

      // Xóa avatar cũ nếu tồn tại
      if (existsUser.avatar?.url) {
        const existsAvatarPath = `uploads/${existsUser.avatar.public_id}`;
        if (fs.existsSync(existsAvatarPath)) {
          fs.unlinkSync(existsAvatarPath);
        }
      }

      // Lấy thông tin file mới
      const file = req.file;
      const public_id = req.body.public_id || file.originalname; // Dùng tên đầy đủ của file (bao gồm đuôi file)
      const url = `uploads/${public_id}`; // Xây dựng URL từ public_id

      existsUser.avatar = { public_id, url };
      await existsUser.save();

      res.status(201).json({
        success: true,
        seller: existsUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller info
router.put(
  '/update-seller-info',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const shop = await Shop.findOne(req.seller._id);

      if (!shop) {
        return next(new ErrorHandler('Không tìm thấy người dùng', 400));
      }

      shop.name = name;
      shop.description = description;
      shop.address = address;
      shop.phoneNumber = phoneNumber;
      shop.zipCode = zipCode;

      await shop.save();

      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// update seller withdraw methods --- sellers
router.put(
  '/update-payment-methods',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { withdrawMethod } = req.body;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, {
        withdrawMethod,
      });

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);
// delete seller withdraw merthods --- only seller
router.delete(
  '/delete-withdraw-method/',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new ErrorHandler('Không tìm thấy người bán với id này', 400));
      }

      seller.withdrawMethod = null;

      await seller.save();

      res.status(201).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Recalculate available balance based on actual delivered orders and withdrawals
router.post(
  '/recalculate-balance',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const Order = require('../model/order');
      const Withdraw = require('../model/withdraw');
      
      const seller = await Shop.findById(req.seller._id);
      
      if (!seller) {
        return next(new ErrorHandler('Không tìm thấy người bán với id này', 400));
      }

      // Tính tổng doanh thu từ các orders đã delivered
      const deliveredOrders = await Order.find({
        'cart.shopId': seller._id.toString(),
        status: 'Delivered'
      });

      let totalRevenue = 0;
      deliveredOrders.forEach(order => {
        totalRevenue += order.totalPrice || 0;
      });

      // Tính phí dịch vụ (10%)
      const serviceCharge = totalRevenue * 0.1;
      const netRevenue = totalRevenue - serviceCharge;

      // Tính tổng số tiền đã rút
      const withdrawals = await Withdraw.find({
        'seller._id': seller._id.toString()
      });

      let totalWithdrawn = 0;
      withdrawals.forEach(withdraw => {
        totalWithdrawn += withdraw.amount || 0;
      });

      // Tính lại số dư = doanh thu ròng - số tiền đã rút
      const recalculatedBalance = netRevenue - totalWithdrawn;

      // Cập nhật số dư
      seller.availableBalance = Math.max(0, recalculatedBalance); // Đảm bảo không âm
      await seller.save();

      res.status(200).json({
        success: true,
        message: 'Đã tính lại số dư thành công',
        data: {
          totalRevenue: totalRevenue.toFixed(2),
          serviceCharge: serviceCharge.toFixed(2),
          netRevenue: netRevenue.toFixed(2),
          totalWithdrawn: totalWithdrawn.toFixed(2),
          recalculatedBalance: seller.availableBalance.toFixed(2),
          oldBalance: (seller.availableBalance - (recalculatedBalance - (seller.availableBalance || 0))).toFixed(2)
        },
        seller
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
