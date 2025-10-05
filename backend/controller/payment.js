const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")(
  "sk_test_51QMRhABrcHqLqFmYJNWmBrOyJ2EWyEmSDr9ihRiI4B8LZm17eBNNlvahdkUNRAlnhzcT96vWDaI1ytWE81ykhhBf00n6DqqHom"
);

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Becodemy",
      },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({
      stripeApikey:
        "pk_test_51QMRhABrcHqLqFmYrH0UArhSE4zRoxVjPyZOMPpnwqUGhEH6BdqwpWSZLCGwtaUmfgXeHta0oWB5Kb6Z3igpJ0ml00dlvvqE2b",
    });
  })
);

module.exports = router;


