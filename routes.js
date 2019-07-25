"use strict";

const express = require("express");

const router = express.Router();

var User = require("./db").User;

router.get("/users", (req, res, next) => {
  let users_list = [];
  User.findAll({ raw: true }).then(users => {
    //console.log(users[0]);
    for (user in users) {
      console.log(user.id);
      users_list.push(user);
    }
    res.json(users_list);
  });
});

router.post("/users", (req, res, next) => {
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
