"use strict";

const express = require("express");

const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');

var User = require("./db").User;

router.get("/users", (req, res, next) => {
  User.findAll({ raw: true }).then(users => {
    console.log(users);

    res.status(200).redirect("/");
  });
});

router.post("/users", [

  check('firstName').exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "firstName"'),
  check('lastName').exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "lastName"'),
  check('emailAddress').exists({ checkNull: true, checkFalsy: true }).isEmail()
  .withMessage('Please provide a valid value for "emailAddress"'),
  check('password').exists({ checkNull: true, checkFalsy: true })
  .withMessage('Please provide a value for "password"'),

], (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });

  }
  const user = req.body;
  user.password = bcryptjs.hashSync(user.password);
  User.create(user)
    .then(() => {
      res.status(201).redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
