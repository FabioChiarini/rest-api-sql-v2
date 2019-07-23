"use strict";

var User = require("./db").User;
const express = require("express");

const router = express.Router();

router.get("/users", (req, res, next) => {
  res.json({
    message: "WORKING"
  });
});

router.post("/users", (req, res, next) => {
  const user = req.body;

  User.create(user);

  res.status(201).end();
});

module.exports = router;
