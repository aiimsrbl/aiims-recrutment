"use strict";

module.exports = {
  // used in verify mail link
  protocol: process.env.PROTOCOL || "https",
  website_url: process.env.URL || "localhost:4001",
  session_redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    // password: process.env.REDIS_PASSWORD || '11aa22bb33cc44dd55ee66ff',
    db: process.env.REDIS_DB || 1,
  },
  session: {
    key: process.env.SESSION_ID || "recruitment_.sid",
    secret: process.env.SESSION_SECRET || "11aa22bb33cc44dd55ee",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "1a1a2b2b3c3c4d4d5e5e6f6f",
  },
  bcrypt: {
    salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  },
  crypto: {
    byte_length: process.env.CRYPTO_BYTE_LENGTH || 32,
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.COOKIE_SECURE || false,
    httpOnly: true,
   // maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 30 * 24 * 60 * 60 * 1000, // in ms
    maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 5 * 60 * 1000, // in ms
  },
  mongodb: {
    host: process.env.MONGODB_HOST || "localhost",
    port: process.env.MONGODB_PORT || "27017",
    username: process.env.MONGODB_USERNAME || "",
    password: process.env.MONGODB_PASSWORD || "",
    auth_db: process.env.MONGODB_AUTH_DB || "admin",
    app_db: process.env.MONGODB_APP_DB || "recruitment",
  },
  node_mailer: {
    service: process.env.NM_SERVICE || "gmail",
    auth: {
      user: process.env.NM_AUTH_USER || "",
      pass: process.env.NM_AUTH_PASSWORD || "",
    },
  },
  razor_pay: {
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SRQToIEtujR1eY",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "fBiJ4OHdmOxOXzPvVzmMwFpL",
  },
  sbiEPay: {
    MerchantId: process.env.marchantId || "1002346",
    Array_key:
      process.env.encriptionKey ||
      "JdkosJNDsQ9/VK1cs7kfgvug6cMWyTnU7cWC/NdpvfU=",
    OperatingMode: process.env.OperatingMode || "DOM",
    MerchantCountry: process.env.MerchantCountry || "IN",
    MerchantCurrency: process.env.MerchantCurrency || "INR",
    OtherDetails: "NA",
    SuccessURL: "https://www.recruitment.aiimsrbl.edu.in/api/sbiepayresponse",
    FailURL: "https://www.recruitment.aiimsrbl.edu.in/api/sbiepayresponse",
    AggregatorId: "SBIEPAY",
    MerchantCustomerID: "5",
    Paymode: "NB",
    Accesmedium: "ONLINE",
    TransactionSource: "ONLINE",
  },
  f1_id: process.env.F1_ID || "6337540c4ba84486781961d1",
  f2_id: process.env.F2_ID || "66e2936062eb0d8d51115b31",
  f3_id: process.env.F3_ID || "66c84947bd0f6e64292e5d38",
  form2_id: process.env.FORM2_ID || "66e2936062eb0d8d51115b31",
  form3_id: process.env.FORM3_ID || "66c84947bd0f6e64292e5d38",
  form4_id: process.env.FORM4_ID || "66e28fb162eb0d8d51115b2c",
  form5_id: process.env.FORM5_ID || "653bd042ce6b8d8c44c5c1c2",
};
