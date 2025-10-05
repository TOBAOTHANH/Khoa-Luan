const express = require('express');
const ErrorHandler = require('./middleware/error');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/', express.static('uploads'));
app.use('/uploads', express.static('uploads'));

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://frontend-one-kappa-74.vercel.app',
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' })); // Tăng giới hạn lên 50MB cho JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Tăng giới hạn lên 50MB cho form data

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
// config

if (process.env.NODE_ENV !== 'PRODUCTION') {
  require('dotenv').config({
    path: 'config/.env',
  });
}

// import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const event = require("./controller/event");
const coupon = require("./controller/coupounCode");
const payment = require("./controller/payment");
const order = require("./controller/order");
const conversation = require("./controller/conversation");
const message = require("./controller/messages");
const withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/message", message);
app.use("/api/v2/order", order);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/event", event);
app.use("/api/v2/coupon", coupon);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);

// it's for error handling
app.use(ErrorHandler);

module.exports = app;
