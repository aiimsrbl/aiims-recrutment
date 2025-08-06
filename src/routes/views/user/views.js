"use strict";
const UAParser = require('ua-parser-js');
const needle = require("needle");
const passport = require("passport");
const moment = require("moment");
const Razorpay = require("razorpay");
require('dotenv').config();
const axios = require('axios');
const qs = require('querystring');
const mail = require("../../../utils/mail");
const mailFormats = require("../../../lib/mailFormats");
const config = require("../../../config/config");
const Application = require("../../../model/application");
const Users = require("../../../model/users");
const crypto = require("crypto");
const redisClient = require('../../../../redisClient');
const { putEntry } = require('../../../utils/operation.js');

let instance = new Razorpay({
  key_id: config.razor_pay.key_id,
  key_secret: config.razor_pay.key_secret,
});

function encrypt(input, key) {
  const iv = key.slice(0, 16);
  const cipher = crypto.createCipheriv("aes-128-cbc", key.slice(0, 16), iv);
  let encrypted = cipher.update(input, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

function decrypt(cipherText, key) {
  const iv = key.slice(0, 16);
  const decipher = crypto.createDecipheriv("aes-128-cbc", key.slice(0, 16), iv);
  let decryptedData = decipher.update(cipherText, "base64", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
}

let views = {
  intitate: async function (req, res) {
    try {
      console.log(req.body, "============================");
      const { amount, application_id, registration_number } = req.body;
      if (!amount && !application_id && !registration_number) {
        res.send({
          status: 400,
          message:
            "Amount, application_id, and registration_number is required.",
        });
      }
      const paidAmount = amount / 100;
      const min = 100; // Minimum value (inclusive)
      const max = 999; // Maximum value (inclusive)

      const randomThreeDigitNumber =
        Math.floor(Math.random() * (max - min + 1)) + min;
      console.log(
        randomThreeDigitNumber,
        "randomThreeDigitNumber data================="
      );

      const sbiEpayConfig = config.sbiEPay;
      var TotalDueAmount = paidAmount;
      var MerchantOrderNo = `${application_id}-${randomThreeDigitNumber}`;
      const {
        MerchantId,
        Array_key,
        OperatingMode,
        MerchantCountry,
        MerchantCurrency,
        OtherDetails,
        SuccessURL,
        FailURL,
        AggregatorId,
        MerchantCustomerID,
        Paymode,
        Accesmedium,
        TransactionSource,
      } = sbiEpayConfig;

      var Single_Request =
        MerchantId +
        "|" +
        OperatingMode +
        "|" +
        MerchantCountry +
        "|" +
        MerchantCurrency +
        "|" +
        TotalDueAmount +
        "|" +
        registration_number +
        "|" +
        SuccessURL +
        "|" +
        FailURL +
        "|" +
        AggregatorId +
        "|" +
        MerchantOrderNo +
        "|" +
        MerchantCustomerID +
        "|" +
        Paymode +
        "|" +
        Accesmedium +
        "|" +
        TransactionSource;
      console.log("Request String:--------------\n" + Single_Request);
      var value = encrypt(Single_Request, Array_key);
      var Single_Paramresponce = value;

      await Application.findOneAndUpdate(
        { _id: application_id },
        {
          razorpay_order_id: MerchantOrderNo,
          razorpay_signature: Single_Paramresponce,
        },
        { new: true }
      );

      const data = {
        Single_Paramresponce: Single_Paramresponce,
        MerchantId: MerchantId,
      };
      res.render("user/initiatePayment", data);
    } catch (error) {
      console.log(error, "error==========");
      throw error;
    }
  },

  fetchPaymentStatus: async function (req, res) {
    try {
      console.log("response sbiepay===============");
      console.log(req.body, "body===========");
      const { encData, Bank_Code, merchIdVal } = req.body;

      if (!encData && !merchIdVal) {
        throw new Error(
          `Something Went wrong. We can't fetch the order status.`
        );
      }
      const sbiEpayConfig = config.sbiEPay;
      const decryptData = decrypt(encData, sbiEpayConfig.Array_key).split("|");

      const _id = decryptData[0].split("-");
      const transationId = decryptData[1];
      const status = decryptData[2];

      // const amount = dataArray[3];
      // const currency = dataArray[4];
      // const message = dataArray[7];
      // const timestamp = dataArray[10];
      // const country = dataArray[11];
      // const applicationId = dataArray[13];

      const keys = {
        applicat_id: decryptData[0],
        transationId: decryptData[1],
        status: decryptData[2],
        amount: decryptData[3],
        currency: decryptData[4],
        paymentMode: decryptData[5],
        registrationNo: decryptData[6],
        message: decryptData[7],
        key9: decryptData[8],
        key10: decryptData[9],
        paymentDate: decryptData[10],
        country: decryptData[11],
        key13: decryptData[12],
        merchantId: decryptData[13],
        key15: decryptData[14],
      };

      if (status === "SUCCESS" || status === "FAIL") {
        await Application.updateOne(
          { _id: _id[0], paymentStatus: { $ne: "TEST" } },
          {
            $set: {
              paymentStatus: status,
              razorpay_payment_id: transationId,
              sbi_pay_log: [keys],
            },
            $push: { transationLog: keys },
          }
        ).exec();
      } else {
        await Application.updateOne(
          { _id: _id[0], paymentStatus: { $ne: "TEST" } },
          {
            $set: { sbi_pay_log: [keys] },
            $push: { transationLog: keys },
          }
        ).exec();
      }

      console.log(status, "status==============");

      const applicationData = await Application.findOne({ _id: _id[0] }).exec();

      console.log(applicationData, "application data===========");
      const data = {
        email: applicationData.applicantEmail,
        registration_number: applicationData.registrationNumber,
        razorpay_order_id: applicationData.razorpay_order_id,
        razorpay_payment_id: applicationData.sbi_pay_log[0].transationId,
        razorpay_signature: applicationData.razorpay_signature,
        amount: applicationData.applicationfee,
        application_id: _id[0],
        message: applicationData.sbi_pay_log[0].message,
      };

      if (status === "SUCCESS") {
        let mailParams = {
          to: data.email,
          subject: "Payment Status",
          html: mailFormats.paymentSuccess(data),
        };

        mail.send(mailParams, function (error, info) {
          if (error) {
            console.log("Error in sending payment status mail");
            console.log(error);
          } else {
            console.log("Payment status email sent: " + info.response);
          }

          return cb(err, result);
        });
        res.render(`user/success`, data);
      } else {
        res.render(`user/failed`, data);
      }

      // res.render(`user/application-success?application_id=${_id}`, {
      //     post: true,
      //     success: true,
      //     data: applicationData,
      // });
    } catch (error) {
      console.log(error, "error==========");
      throw error;
    }
  },

  doubleVarification: async function (req, res) {
    try {
      const queryParams = req.query.application_id;

      const application = await Application.findOne({
        _id: queryParams,
      }).exec();

      if (!application) {
        throw new Error(`Application not found with this _id: ${queryParams}.`);
      }

      if (!application.sbi_pay_log) {
        throw new Error(`Traction not availabe in the database.`);
      }

      const sbiEpayTransaction = application.sbi_pay_log;

      const sbiEpayConfig = config.sbiEPay;
      const {
        MerchantId,
        Array_key,
        OperatingMode,
        MerchantCountry,
        MerchantCurrency,
        OtherDetails,
        SuccessURL,
        FailURL,
        AggregatorId,
        MerchantCustomerID,
        Paymode,
        Accesmedium,
        TransactionSource,
      } = sbiEpayConfig;

      const axios = require("axios");
      const qs = require("qs");
      let data = qs.stringify({
        queryRequest: `|${MerchantId}|${sbiEpayTransaction[0].applicat_id}|${sbiEpayTransaction[0].amount}`,
        aggregatorId: AggregatorId,
        merchantId: MerchantId,
      });

      let configReq = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://www.sbiepay.sbi/payagg/statusQuery/getStatusQuery",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: data,
      };
      console.log("Request", configReq);
      axios
        .request(configReq)
        .then((response) => {
          console.log(
            response,
            "Respone=================of double varification"
          );
          // if(application.status === response.status)
        })
        .catch((error) => {
          console.log(error, "Error inside double varification.");
          return res.redirect("/my-jobs");
        });
    } catch (error) {
      throw new Error(`double verification failed.`, error);
    } finally {
      return res.redirect("/my-jobs");
    }
  },

  home: function (req, res) {
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/management/advertisement/fetch/active",
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error) {
          return res.render("user/index.ejs", {
            post: false,
            success: false,
            msg:
              "Failed! Cannot retrive advertisement at the moment. Please try again after some time. " +
              data[0].body.error,
          });
        }
        res.render("user/index.ejs", {
          post: false,
          success: true,
          adv: data[0].body,
          moment,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("user/index.ejs", {
          post: true,
          success: false,
          msg: "Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.",
        });
      });
  },

  login: function (req, res) {
    if (req.user) {
      if (req.user.role !== "APPLICANT") {
        return res.redirect("/logout");
      }
      return res.redirect("/");
    }
    return res.render("user/login.ejs", {
      _csrf: req.csrfToken(),
      post: false,
    });
  },


  profile: function (req, res) {
    Users.findOne({ _id: req.user.id }, function (err, result) {
      if (err) {
        return res.render("user/profile.ejs", {
          post: true,
          success: false,
          data: {},
        });
      }
      res.render("user/profile.ejs", {
        post: true,
        success: true,
        data: result,
      });
    });
  },

  myJobs: function (req, res) {
    Application.find(
      { user: req.user.id, paymentStatus: { $ne: "TEST" } },
      function (err, result) {
        if (err) {
          return res.render("user/my-jobs.ejs", {
            post: true,
            success: false,
            data: [],
          });
        }
        res.render("user/my-jobs.ejs", {
          post: true,
          success: true,
          data: result,
        });
      }
    );
  },

  applicationSuccess: function (req, res) {
    // return res.redirect('/');

    let applicationId = req.query.application_id;

    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/applicant/application/fetch/" +
        applicationId,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (!data[0].body._id || data[0].body.user !== req.user.id) {
          return res.redirect("/logout");
        }

        if (data[0].body.error) {
          return res.render("user/application-success.ejs", {
            post: false,
            success: false,
            applicationId: data[0].body._id,
            registrationNumber: "",
            orderId: "",
            keyId: "",
            amount: -1,
            msg:
              "Failed! Cannot retrive advertisement at the moment. Please try again after some time. " +
              data[0].body.error,
          });
        }

        if (data[0].body.applicationfee == 0) {
          return res.render("user/application-success.ejs", {
            applicationId: data[0].body._id,
            registrationNumber: data[0].body.registrationNumber,
            orderId: "NA",
            amount: data[0].body.applicationfee,
            advRefNo: data[0].body.advRefNo,
          });
        }
        let options = {
          amount: data[0].body.applicationfee * 100, // amount in the smallest currency unit converted to rupees
          currency: "INR",
          receipt: data[0].body._id,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          }
          res.render("user/application-success.ejs", {
            applicationId: data[0].body._id,
            registrationNumber: data[0].body.registrationNumber,
            orderId: order.id,
            keyId: config.razor_pay.key_id,
            amount: data[0].body.applicationfee * 100,
            applicantName: data[0].body.applicantName,
            applicantEmail: data[0].body.applicantEmail,
            applicantMobile: data[0].body.applicantMobile,
            advRefNo: data[0].body.advRefNo,
          });
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("user/application-success.ejs", {
          post: true,
          success: false,
          applicationId: data[0].body._id,
          registrationNumber: "",
          orderId: "",
          keyId: "",
          amount: -1,
          msg: "Failed! Cannot retrive advertisement at the moment. Please try again after some time. Internal Server Error.",
        });
      });
  },

  verifyPayment: function (req, res) {
    var isVerified = false;
    console.log("sig req.body============== ", req.body);
    if (!req.body.skipAmount) {
      let body =
        req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

      let crypto = require("crypto");
      let expectedSignature = crypto
        .createHmac("sha256", config.razor_pay.key_secret)
        .update(body.toString())
        .digest("hex");
      // console.log("sig generated " ,expectedSignature);

      if (expectedSignature === req.body.razorpay_signature) {
        isVerified = true;
      }
    } else {
      isVerified = true;
    }
    console.log(isVerified, "isVerified==============");
    if (isVerified) {
      let needleOptions = {
        gzip: true,
        headers: req.headers,
      };

      let updateData = {
        application_id: req.body.application_id,
        razorpay_order_id: req.body.razorpay_order_id || "NA",
        razorpay_payment_id: req.body.razorpay_payment_id || "NA",
        razorpay_signature: req.body.razorpay_signature || "NA",
      };

      let requestData = [
        needle(
          "POST",
          req.protocol +
          "://" +
          req.get("host") +
          "/api/applicant/application/update",
          updateData,
          needleOptions
        ),
      ];

      Promise.all(requestData)
        .then((data) => {
          if (data[0].body.error) {
            res.json({
              success: false,
              msg: "Unable to update payment in DB.",
            });
          }

          let params = {
            name: req.user.name,

            registration_number: req.body.registration_number,
            razorpay_order_id: req.body.razorpay_order_id || "NA",
            razorpay_payment_id: req.body.razorpay_payment_id || "NA",
            razorpay_signature: req.body.razorpay_signature || "NA",
          };

          let mailParams = {
            to: req.user.email,
            subject: "AIIMS Recruitment Payment Details",
            html: mailFormats.paymentSuccess(params),
          };

          mail.send(mailParams, function (error, info) {
            if (error) {
              console.log("Error in sending welcome mail");
              console.log(error);
            } else {
              console.log("Payment Successful email sent: " + info.response);
            }
          });

          res.json({
            success: true,
            msg: "Payment Verified successfully.",
          });
        })
        .catch((err) => {
          console.log(err);
          res.json({
            success: false,
            msg: "Internal Server error.",
          });
        });
    } else {
      res.json({
        success: false,
        msg: "Invalid payment signature.",
      });
    }
  },

  printApplicationForm: function (req, res) {
    let applicationId = req.query.application_id;

    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/applicant/application/fetch/" +
        applicationId,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (!data[0].body._id || data[0].body.user !== req.user.id) {
          return res.redirect("/logout");
        }
        if (data[0].body.advId == config.form3_id) {
          res.render("user/print-application-3.ejs", {
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else if (data[0].body.advId == config.form4_id) {
          res.render("user/print-application-4.ejs", {
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else if (data[0].body.advId == config.form5_id) {
          res.render("user/print-application-5.ejs", {
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else {
          if (data[0].body.advId == config.form2_id) {
            res.render("user/print-application-2.ejs", {
              success: true,
              data: data[0].body,
              moment: moment,
            });
          } else {
            res.render("user/print-application.ejs", {
              success: true,
              data: data[0].body,
              moment: moment,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("print-application.ejs", {
          post: true,
          success: false,
          applicationId: data[0].body._id,
          registrationNumber: "",
          orderId: "",
          keyId: "",
          amount: -1,
          msg: "Failed! Cannot retrive form at the moment. Please try again after some time. Internal Server Error.",
        });
      });
  },

  editApplicationForm: function (req, res) {
    let applicationId = req.query.application_id;

    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/applicant/application/fetch/" +
        applicationId,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (!data[0].body._id || data[0].body.user !== req.user.id) {
          return res.redirect("/logout");
        }
        if (data[0].body.advId == config.form3_id) {
          res.render("user/edit-application-3.ejs", {
            _csrf: req.csrfToken(),
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else if (data[0].body.advId == config.form4_id) {
          res.render("user/edit-application-4.ejs", {
            _csrf: req.csrfToken(),
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else {
          if (data[0].body.advId == config.form2_id) {
            res.render("user/edit-application-2.ejs", {
              _csrf: req.csrfToken(),
              success: true,
              data: data[0].body,
              moment: moment,
            });
          } else if (data[0].body.advId == config.form5_id) {
            res.render("user/edit-application-jr.ejs", {
              _csrf: req.csrfToken(),
              success: true,
              data: data[0].body,
              moment: moment,
            });
          } else {
            res.render("user/edit-application-sr.ejs", {
              _csrf: req.csrfToken(),
              success: true,
              data: data[0].body,
              moment: moment,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("edit-application-2.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: false,
          applicationId: data[0].body._id,
          registrationNumber: "",
          orderId: "",
          keyId: "",
          amount: -1,
          msg: "Failed! Cannot retrive form at the moment. Please try again after some time. Internal Server Error.",
        });
      });
  },

  printAdmitCard: function (req, res) {
    let applicationId = req.query.application_id;

    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/applicant/application/fetch/" +
        applicationId,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (!data[0].body._id || data[0].body.user !== req.user.id) {
          return res.redirect("/logout");
        }
        if (
          data[0].body.advRefNo == "AIIMS/RBL/REC/NF/2024/319" ||
          data[0].body.advRefNo == "AIIMS/Rbl/Rec/Nusring/Faculty/2024/318"
        ) {
          res.render("user/admit-card-tech.ejs", {
            success: true,
            data: data[0].body,
            moment: moment,
          });
        } else {
          res.render("user/admit-card-2.ejs", {
            success: true,
            data: data[0].body,
            moment: moment,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("admit-card.ejs", {
          post: true,
          success: false,
          applicationId: data[0].body._id,
          registrationNumber: "",
          orderId: "",
          keyId: "",
          amount: -1,
          msg: "Failed! Cannot retrive form at the moment. Please try again after some time. Internal Server Error.",
        });
      });
  },

  checkDuplicateApplication: function (req, res) {
    let query = {
      paymentStatus: "SUCCESS",
      user: req.user.id,
      post: req.body.post,
      advRefNo: req.body.advRefNo,
      department: req.body.department,
    };

    Application.find(query, function (err, result) {
      console.log(result);
      if (err) {
        res.json({
          success: false,
          err: "Internal Server Error",
        });
      }
      if (result && result.length) {
        res.json({
          success: false,
          err: "You had already applied for this post. If you apply again for the same advertisement with same post and department then your application can be cancelled without any notification.",
        });
      } else {
        res.json({
          success: true,
          err: "",
        });
      }
    });
  },

  forgotPassword: function (req, res) {
    if (req.user) {
      return res.redirect("/");
    }
    res.render("user/forgot-password.ejs", {
      _csrf: req.csrfToken(),
      post: false,
    });
  },

  register: function (req, res) {
    if (req.user) {
      if (req.user.role !== "APPLICANT") {
        return res.redirect("/logout");
      }
      return res.redirect("/");
    }
    res.render("user/register.ejs", {
      _csrf: req.csrfToken(),
      post: false,
    });
  },

  registerPost: function (req, res, next) {
    const userId = req?.user?.id;
    const userAgent = req.headers['user-agent'];
    let reqBody = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      custom: "hello",
    };
    // if (reqBody.password !== reqBody.confirmPassword){
    //     return res.render('user/register.ejs', {
    //         _csrf: req.csrfToken(),
    //         post: true,
    //         success: false,
    //         msg: 'Registration Failed!. Password and Confirm Password do not match.'
    //     });
    // }
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "POST",
        req.protocol + "://" + req.get("host") + "/api/register",
        reqBody,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then(async (data) => {
        if (data[0].body.error) {
          await putEntry(userId, `Registration Failed of (${req.body.email})`, userAgent);
          return res.render("user/register.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            success: false,
            msg: "Registration Failed! " + data[0].body.error,
          });
        }
        await putEntry(userId, `Registration Successfull of (${req.body.email})`, userAgent);
        res.render("user/register.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: true,
          msg: "Registration successfull.",
        });
      })
      .catch(async (err) => {
        console.log(err);
        await putEntry(userId, `Registration Failed of (${req.body.email})`, userAgent);
        res.render("user/register.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: false,
          msg: "Registration Failed!. Internal Server Error.",
        });
      });
  },

  verifyEmail: function (req, res) {
    let reqBody = {
      token: req.query.token,
      id: req.query.id,
    };
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "POST",
        req.protocol + "://" + req.get("host") + "/api/verify-email",
        reqBody,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error) {
          return res.render("user/verify-email.ejs", {
            _csrf: req.csrfToken(),
            msg: "Email Verification Failed! " + data[0].body.error,
          });
        }
        res.render("user/verify-email.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          msg: "Email verified successfully.",
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("user/verify-email.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          msg: "Email Verification Failed!. Internal Server Error.",
        });
      });
  },


  loginPost: async function (req, res, next) {
    const { email, password, 'g-recaptcha-response': captcha } = req.body;
    req.body.role = 'APPLICANT';

    if (!captcha) {
      return res.render('user/login.ejs', {
        _csrf: req.csrfToken(),
        post: true,
        msg: 'Please complete the CAPTCHA.',
      });
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    try {
      const { data } = await axios.post(
        verifyUrl,
        qs.stringify({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha,
          remoteip: req.ip,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      if (!data.success) {

        return res.render('user/login.ejs', {
          _csrf: req.csrfToken(),
          post: true,
          msg: 'CAPTCHA verification failed. Try again.',
        });
      }

      passport.authenticate('local', async function (err, user, info) {
        if (err) return next(err);

        if (!user) {
          await putEntry(user.id, `Login Failed of (${req.body.email})`, req.headers['user-agent']);
          return res.render('user/login.ejs', {
            _csrf: req.csrfToken(),
            post: true,
            msg: 'Invalid email or password.',
          });
        }

        req.logIn(user, async function (err) {
          if (err) return next(err);
          const userId = user?.id?.toString(); // ✅ Normalized
          const sessionKey = `user-session:${userId}`;
          const sessionId = req.sessionID;
          try {
            const oldSessionId = await redisClient.get(sessionKey);

            if (oldSessionId && oldSessionId !== sessionId) {
              req.sessionStore.destroy(oldSessionId, (err) => {
                if (err) console.error('⚠️ Failed to destroy old session:', err);
              });
            }

            redisClient.set(sessionKey, sessionId);
            await putEntry(user.id, 'LoggedIn', req.headers['user-agent']);



          } catch (redisErr) {
            await putEntry(user.id, `Login Failed of (${req.body.email})`, req.headers['user-agent']);
            console.error('⚠️ Redis session tracking error:', redisErr);
          }

          return res.redirect(req.query?.redirect_url || '/');
        });

      })(req, res, next);

    } catch (err) {
      console.error('⚠️ CAPTCHA verification error:', err);

      let csrfToken;
      try {
        csrfToken = req.csrfToken();
      } catch (csrfErr) {
        csrfToken = '';
      }

      return res.render('user/login.ejs', {
        _csrf: csrfToken,
        post: true,
        msg: 'An error occurred during CAPTCHA verification.',
      });
    }
  },

  forgotPasswordPost: async (req, res) => {
    const captcha = req.body['g-recaptcha-response'];
    const userId = req?.user?.id;
    const userAgent = req.headers['user-agent'];
    if (!captcha) {
      return res.render("user/forgot-password.ejs", {
        _csrf: req.csrfToken(),
        post: true,
        success: false,
        msg: "Please complete the CAPTCHA.",
      });
    }

    try {
      const { data } = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        qs.stringify({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captcha,
          remoteip: req.ip,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      if (!data.success) {
        return res.render("user/forgot-password.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: false,
          msg: "CAPTCHA verification failed. Please try again.",
        });
      }

      // CAPTCHA passed → proceed with password reset logic

      let needleOptions = {
        gzip: true,
        headers: req.headers,
      };
      let requestData = [
        needle(
          "POST",
          req.protocol + "://" + req.get("host") + "/api/request-password-reset",
          req.body,
          needleOptions
        ),
      ];

      Promise.all(requestData)
        .then(async (data) => {
          if (data[0].body.error) {
            await putEntry(userId, `Forgot-Password Failed for (${req.body.email})`, userAgent);
            return res.render("user/forgot-password.ejs", {
              _csrf: req.csrfToken(),
              post: true,
              success: false,
              msg: "Password Reset Failed! " + data[0].body.error,
            });
          }
          await putEntry(userId, `Forgot-Password Success for (${req.body.email})`, userAgent);
          res.render("user/forgot-password.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            success: true,
            msg: "Email with password reset link sent successfully. Please check your mail.",
          });
        })
        .catch(async (err) => {
          console.log(err);
          await putEntry(userId, `Forgot-Password Failed for (${req.body.email})`, userAgent);
          res.render("user/forgot-password.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            success: false,
            msg: "Password Reset Failed!. Internal Server Error.",
          });
        });

    } catch (err) {
      console.error("CAPTCHA verification failed:", err);
      return res.render("user/forgot-password.ejs", {
        _csrf: req.csrfToken(),
        post: true,
        success: false,
        msg: "An error occurred during CAPTCHA verification.",
      });
    }
  },

  logout: function (req, res) {

    if (req.user) {
      const userId = req.user.id;
      const userAgent = req.headers['user-agent'];
      req.logout(function (err) {
        if (err) {
          console.log(err);
        }
        req.session.destroy(async function (err) {
          if (err) console.log(err);
          await putEntry(userId, 'Logout', userAgent);
          res.redirect("/");
        });
      });
    } else {
      res.redirect("/");
    }
  },

  resetPassword: function (req, res) {
    if (req.user) {
      return res.redirect("/");
    }
    res.render("user/reset-password.ejs", {
      _csrf: req.csrfToken(),
      post: false,
    });
  },

  resetPasswordPost: async function (req, res) {
    const userId = req?.user?.id;
    const userAgent = req.headers['user-agent'];
    let reqBody = {
      token: req.query.token,
      id: req.query.id,
      password: req.body.password,
      confirm_password: req.body.confirmPassword,
    };
    if (reqBody.password !== reqBody.confirm_password) {
      await putEntry(userId, 'Password-Reset (Failed)', userAgent);
      res.render("user/reset-password.ejs", {
        _csrf: req.csrfToken(),
        post: true,
        success: false,
        msg: "Password Reset Failed!. Password and Confirm Password do not match.",
      });
    }
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "POST",
        req.protocol + "://" + req.get("host") + "/api/reset-password",
        reqBody,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then(async (data) => {
        if (data[0].body.error) {
          await putEntry(userId, 'Password-Reset (Failed)', userAgent);
          return res.render("user/reset-password.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            success: false,
            msg: "Password Reset Failed! " + data[0].body.error,
          });
        }
        await putEntry(userId, 'Password-Reset (Success)', userAgent);
        res.render("user/reset-password.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: true,
          msg: "Password reset successfull. Please login.",
        });
      })
      .catch(async (err) => {
        console.log(err);
        await putEntry(userId, 'Password-Reset (Failed)', userAgent);
        res.render("user/reset-password.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          success: false,
          msg: "Password reset Failed!. Internal Server Error.",
        });
      });
  },

  changePassword: function (req, res) {
    res.render("password-change.ejs", {
      _csrf: req.csrfToken(),
      post: false,
    });
  },

  changePasswordPost: function (req, res) {
    const userId = req?.user?.id;
    const userAgent = req.headers['user-agent'];
    let reqBody = {
      old_password: req.body.old_password,
      password: req.body.password,
      confirm_password: req.body.confirm_password,
    };
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "POST",
        req.protocol + "://" + req.get("host") + "/api/change-password",
        reqBody,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then(async (data) => {
        if (data[0].body.error) {
          await putEntry(userId, 'Password-Change (Failed)', userAgent);
          return res.render("password-change.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            msg: "Password Change Failed! " + data[0].body.error,
          });
        }
        await putEntry(userId, 'Password-Change (Success)', userAgent);
        res.render("password-change.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          msg: "Password changed successfully.",
        });
      })
      .catch(async (err) => {
        console.log(err);
        await putEntry(userId, 'Password-Change (Failed)', userAgent);
        res.render("password-change.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          msg: "Password Change Failed!. Internal Server Error.",
        });
      });
  },

  applicationForm: function (req, res) {
    // return res.redirect('/');
    if (req.user.role === "MANAGEMENT") {
      return res.redirect("/management/dashboard");
    }

    // if(req.query.advertisement_id != config.form2_id){
    //     res.status(404);
    //     return res.render('commons/error-page.ejs', {
    //         statusCode: 404,
    //         error: 'Page Not Found',
    //         description: 'Oops!!!! you tried to access a page which is not available. go back to Home',
    //     });
    // }

    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };

    let requestData = [
      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/management/advertisement/fetch/" +
        req.query.advertisement_id,
        req.body,
        needleOptions
      ),

      needle(
        "GET",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/management/department/fetch/active",
        req.body,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error || data[1].body.error) {
          return res.render("user/application-form.ejs", {
            _csrf: req.csrfToken(),
            success: false,
            adv: [],
            dep: [],
            msg: data[0].body.error,
          });
        }
        if (req.query.advertisement_id == config.form3_id) {
          res.render("user/application-form-3.ejs", {
            _csrf: req.csrfToken(),
            success: false,
            adv: data[0].body,
            dep: data[1].body,
          });
        } else if (req.query.advertisement_id == config.form4_id) {
          res.render("user/application-form-4.ejs", {
            _csrf: req.csrfToken(),
            success: false,
            adv: data[0].body,
            dep: data[1].body,
          });
        } else if (req.query.advertisement_id == config.form5_id) {
          res.render("user/application-form-5.ejs", {
            _csrf: req.csrfToken(),
            success: false,
            adv: data[0].body,
            dep: data[1].body,
          });
        } else {
          if (req.query.advertisement_id == config.form2_id) {
            res.render("user/application-form-2.ejs", {
              _csrf: req.csrfToken(),
              success: false,
              adv: data[0].body,
              dep: data[1].body,
            });
          } else {
            res.render("user/application-form.ejs", {
              _csrf: req.csrfToken(),
              success: false,
              adv: data[0].body,
              dep: data[1].body,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.render("user/application-form.ejs", {
          _csrf: req.csrfToken(),
          success: false,
          adv: [],
          dep: [],
          msg: "Internal Server Error.",
        });
      });
  },

  applicationFormPost: function (req, res) {
    // return res.redirect('/');

    let data = { ...req.body, file: req.files, content_type: "image/png" };

    console.log(req.files);

    let needleOptions = {
      gzip: true,
      headers: req.headers,
      multipart: true,
      json: true,
    };

    let requestData = [
      needle(
        "POST",
        req.protocol +
        "://" +
        req.get("host") +
        "/api/applicant/application/create/",
        data,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error) {
          return res.render("user/application-success.ejs", {
            _csrf: req.csrfToken(),
            success: false,
          });
        }
        res.render("user/application-success.ejs", {
          _csrf: req.csrfToken(),
          success: false,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("user/application-success.ejs", {
          _csrf: req.csrfToken(),
          success: false,
        });
      });
  },

  editProfile: function (req, res) {
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "GET",
        req.protocol + "://" + req.get("host") + "/api/profile",
        req.body,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error) {
          return res.render("edit-profile.ejs", {
            _csrf: req.csrfToken(),
            post: false,
            success: false,
            msg: data[0].body.error,
          });
        }
        res.render("edit-profile.ejs", {
          _csrf: req.csrfToken(),
          post: false,
          user: data[0].body,
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("edit-profile.ejs", {
          _csrf: req.csrfToken(),
          success: false,
          post: false,
          msg: "Internal Server Error.",
        });
      });
  },

  editProfilePost: function (req, res) {
    let needleOptions = {
      gzip: true,
      headers: req.headers,
    };
    let requestData = [
      needle(
        "POST",
        req.protocol + "://" + req.get("host") + "/api/edit-profile",
        req.body,
        needleOptions
      ),
    ];

    Promise.all(requestData)
      .then((data) => {
        if (data[0].body.error) {
          return res.render("edit-profile.ejs", {
            _csrf: req.csrfToken(),
            post: true,
            msg: "Edit Profile Failed! " + data[0].body.error,
          });
        }
        res.render("edit-profile.ejs", {
          _csrf: req.csrfToken(),
          post: true,
          msg: "Profile changed successfully! ",
        });
      })
      .catch((err) => {
        console.log(err);
        res.render("edit-profile.ejs", {
          _csrf: req.csrfToken(),
          success: false,
          post: true,
          msg: "Edit Profile Failed! Internal Server Error.",
        });
      });
  },
};

module.exports = views;
