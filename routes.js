"use strict";

const express = require("express");

const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

var User = require("./db").User;
var Course = require("./db").Course;

const authenticateUser = (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    User.findAll().then(users => {
      const user = users.find(u => u.emailAddress === credentials.name);
      if (user) {
        const authenticated = bcryptjs.compareSync(
          credentials.pass,
          user.password
        );

        if (authenticated) {
          console.log(`Welcome back dear ${user.firstName} ${user.lastName}`);
          req.currentUser = user;
          next();
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      } else {
        message = `User ${user.emailAddress} not found`;
      }
    });
  } else {
    message = `Auth header not found`;
  }

  if (message) {
    console.warn(message);
    res.status(401).json({
      message: "ACCESS DENIED"
    });
  }
};

// Returns the currently authenticated user
router.get("/users", authenticateUser, (req, res, next) => {
  const user = req.currentUser;

  res.json({
    name: user.firstName,
    username: user.emailAddress
  });
});

// Creates a user, sets the Location header to "/", and returns no content
router.post(
  "/users",
  [
    check("firstName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("lastName")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "lastName"'),
    check("emailAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid value for "emailAddress"'),
    check("password")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "password"')
  ],
  (req, res, next) => {
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
        res.status(500).json(err);
      });
  }
);

// Returns a list of courses (including the user that owns each course)
router.get("/courses", (req, res, next) => {
  Course.findAll()
    .then(courses => {
      res
        .json(courses)
        .status(200)
        .end();
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

// Creates a course, sets the Location header to the URI for the course, and returns no content
router.post(
  "/courses",
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "firstName"'),
    check("userId")
      .exists({ checkNull: true, checkFalsy: true })
      .isNumeric()
      .withMessage('Please provide a value for "userId"')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    const course = req.body;

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    Course.create(course)
      .then(createdCourse => {
        console.log(createdCourse);
        res
          .location(`/api/courses/${createdCourse.id}`)
          .status(201)
          .end();
      })
      .catch(err => {
        res.status(500).json(err);
      });
  }
);

// Returns a the course (including the user that owns the course) for the provided course ID
router.get("/courses/:id", (req, res, next) => {
  Course.findByPk(req.params.id)
    .then(course => {
      if (course) {
        res.status(200).json(course);
      } else {
        res.status(400).json("Course not found");
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

module.exports = router;
