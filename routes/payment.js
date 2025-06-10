const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/create-payment-intent", isAuthenticated, async (req, res) => {
  try {
    const { title, price, offerId } = req.body;
    const amount = Math.round(Number(price) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      description: title,
      metadata: { offerId },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;