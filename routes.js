"use strict";

const express = require("express");

const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

var User = require("./db").User;


const authenticateUser = (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    User.findAll().then(users => {
      const user = users.find(u => u.emailAddress === credentials.name)
      if(user) {
      
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
  
  
        if (authenticated) {
          console.log(`Welcome back dear ${user.username}`)
          req.currentUser = user;
        } else {
            message = `Authentication failure for username: ${user.username}`;
        }
        
      } else {
        message = `User ${user.username} not found`;
      }
    });
    


  } else {
      message = `Auth header not found`;
    }

    if (message) {
      console.warn(message);
      res.status(401).json({
        message: 'ACCESS DENIED'
      });
    } else {
      next();
    }
  }


router.get("/users", authenticateUser, (req, res, next) => {
  const user = req.currentUser;

  res.JSON({
    name: user.name,
    username: user.username
  })
  /*
  User.findAll({ raw: true }).then(users => {
    console.log(users);

    res.status(200).redirect("/");
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
