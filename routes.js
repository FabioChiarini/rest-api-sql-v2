"use strict";


const express = require("express");

const router = express.Router();

var User = require("./db").User;

router.get("/users", (req, res, next) => {
  res.json({
    message: "WORKING"
  });
});

router.post("/users", (req, res, next) => {
  const user = req.body;
  console.log(req.body);
  User.create(user);
  

  res.status(201).end();
});

module.exports = router;
