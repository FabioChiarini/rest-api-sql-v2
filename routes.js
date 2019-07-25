"use strict";

const express = require("express");

const router = express.Router();
const { check, validationResult } = require('express-validator')

var User = require("./db").User;

router.get("/users", (req, res, next) => {

/*
  let users_list = [];
  User.findAll({ raw: true }).then(users => {
    console.log(users.length);
    var users_parse = JSON.parse(users)
    console.log(users_parse);
    /*
    let i;
    for (i = 0; i < users.lenth; i += 1){
      console.log(users[i]);
      users_list.push(users[i]);
    }
    res.json(users_list);
  });*/
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
  console.log(user);
  User.create(user)
    .then(() => {
      res.status(201).redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
