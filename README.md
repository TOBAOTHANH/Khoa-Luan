# 🛒 Hệ Thống Thương Mại Điện Tử (E-Commerce Platform)

Hệ thống thương mại điện tử đầy đủ tính năng với giao diện hiện đại, hỗ trợ đa người bán, thanh toán trực tuyến và chat real-time.

## 📋 Mục Lục

- [Cách Cài Đặt](#-cách-cài-đặt)
- [Cách Chạy Chương Trình](#-cách-chạy-chương-trình)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Hình Ảnh Giao Diện](#-hình-ảnh-giao-diện)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Tính Năng](#-tính-năng)

## 🚀 Cách Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js** (phiên bản 14.x trở lên)
- **MongoDB** (cài đặt local hoặc sử dụng MongoDB Atlas)
- **npm** hoặc **yarn**

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd Khoa-Luan
```

### Bước 2: Cài Đặt Dependencies cho Backend

```bash
npm install
```

### Bước 3: Cài Đặt Dependencies cho Frontend

```bash
cd frontend
npm install
cd ..
```

### Bước 4: Cài Đặt Dependencies cho Socket Server

```bash
cd socket
npm install
cd ..
```

### Bước 5: Cấu Hình Environment Variables

Tạo file `.env` trong thư mục `backend/config/` với nội dung:

```env
# Database
DB_URL=mongodb://localhost:27017/your-database-name
# hoặc MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database-name

# Server
PORT=8000
NODE_ENV=development

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_EXPIRES=7d
ACTIVATION_SECRET=your-activation-secret-here

# Email Configuration (SMTP)
SMPT_HOST=smtp.gmail.com
SMPT_PORT=587
SMPT_MAIL=your-email@gmail.com
SMPT_PASSWORD=your-app-password

# Stripe Payment
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_API_KEY=your-stripe-publishable-key

# PayPal (nếu sử dụng)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

Tạo file `.env` trong thư mục `socket/` với nội dung:

```env
PORT=4000
```

### Bước 6: Tạo Thư Mục Uploads

Đảm bảo thư mục `uploads/` tồn tại ở thư mục gốc để lưu trữ hình ảnh:

```bash
mkdir uploads
```

## ▶️ Cách Chạy Chương Trình

### Chạy Backend Server

Mở terminal thứ nhất và chạy:

```bash
npm run dev
```

Backend server sẽ chạy tại: `http://localhost:8000`

### Chạy Frontend

Mở terminal thứ hai và chạy:

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

### Chạy Socket Server (Real-time Messaging)

Mở terminal thứ ba và chạy:

```bash
cd socket
npm start
```

Socket server sẽ chạy tại: `http://localhost:4000`

### Lưu Ý

- Đảm bảo MongoDB đang chạy trước khi khởi động backend
- Cần chạy cả 3 server (Backend, Frontend, Socket) để ứng dụng hoạt động đầy đủ
- Kiểm tra các biến môi trường đã được cấu hình đúng

## 💻 Công Nghệ Sử Dụng

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (với Mongoose ODM)
- **JWT (JSON Web Token)** - Authentication & Authorization
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service
- **Stripe** - Payment gateway
- **PayPal** - Payment gateway
- **Socket.io** - Real-time communication
- **CORS** - Cross-origin resource sharing
- **Cookie-parser** - Cookie handling

### Frontend

- **React.js** - UI library
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI (MUI)** - React component library
- **Framer Motion** - Animation library
- **React Icons** - Icon library
- **React Lottie** - Animation components
- **React Toastify** - Toast notifications
- **Socket.io Client** - Real-time client
- **Stripe React** - Stripe payment integration
- **PayPal React** - PayPal payment integration
- **Browser Image Compression** - Image optimization

### Development Tools

- **Nodemon** - Auto-restart server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🖼️ Hình Ảnh Giao Diện

### Trang Chủ
![Trang Chủ](screenshots/homepage.png)
*Giao diện trang chủ với banner, sản phẩm nổi bật và danh mục*

### Trang Sản Phẩm
![Sản Phẩm](screenshots/products.png)
*Danh sách sản phẩm với bộ lọc và tìm kiếm*

### Chi Tiết Sản Phẩm
![Chi Tiết Sản Phẩm](screenshots/product-details.png)
*Trang chi tiết sản phẩm với hình ảnh, mô tả và đánh giá*

### Giỏ Hàng
![Giỏ Hàng](screenshots/cart.png)
*Giao diện giỏ hàng với tổng tiền và mã giảm giá*

### Thanh Toán
![Thanh Toán](screenshots/checkout.png)
*Trang thanh toán với nhiều phương thức thanh toán*

### Dashboard Người Bán
![Dashboard Người Bán](screenshots/seller-dashboard.png)
*Dashboard quản lý cửa hàng cho người bán*

### Dashboard Admin
![Dashboard Admin](screenshots/admin-dashboard.png)
*Dashboard quản lý hệ thống cho admin*

### Chat Real-time
![Chat](screenshots/chat.png)
*Giao diện chat real-time giữa người mua và người bán*

### Trang Profile
![Profile](screenshots/profile.png)
*Trang quản lý thông tin cá nhân và đơn hàng*

> **Lưu ý:** Thêm các hình ảnh screenshot vào thư mục `screenshots/` và cập nhật đường dẫn trong README.

## 📁 Cấu Trúc Dự Án

```
Khoa-Luan/
├── backend/                 # Backend API
│   ├── config/             # Cấu hình
│   ├── controller/         # Controllers
│   ├── db/                 # Database connection
│   ├── middleware/         # Middleware (auth, error handling)
│   ├── model/              # Database models
│   ├── ultis/              # Utilities (JWT, email, etc.)
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
├── frontend/               # React Frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── redux/          # Redux store, actions, reducers
│       ├── routes/         # Route configurations
│       └── styles/         # CSS styles
├── socket/                 # Socket.io server
│   └── index.js            # Socket server
├── uploads/                # Uploaded files (images)
└── package.json            # Root package.json
```

## ✨ Tính Năng

### Cho Người Mua
- ✅ Đăng ký/Đăng nhập tài khoản
- ✅ Duyệt và tìm kiếm sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý wishlist
- ✅ Thanh toán online (Stripe, PayPal)
- ✅ Theo dõi đơn hàng
- ✅ Chat real-time với người bán
- ✅ Đánh giá và nhận xét sản phẩm
- ✅ Áp dụng mã giảm giá

### Cho Người Bán
- ✅ Đăng ký cửa hàng
- ✅ Quản lý sản phẩm (thêm, sửa, xóa)
- ✅ Quản lý đơn hàng
- ✅ Tạo sự kiện khuyến mãi
- ✅ Tạo mã giảm giá
- ✅ Quản lý rút tiền
- ✅ Chat với khách hàng
- ✅ Xem thống kê bán hàng

### Cho Admin
- ✅ Quản lý người dùng
- ✅ Quản lý người bán
- ✅ Quản lý sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý sự kiện
- ✅ Quản lý yêu cầu rút tiền
- ✅ Xem thống kê tổng quan

## 👥 Tác Giả

**Nhóm Long Nam**

## 📄 License

ISC

---

**Lưu ý:** Đây là dự án khóa luận. Vui lòng cấu hình đúng các biến môi trường và đảm bảo MongoDB đang chạy trước khi sử dụng.

