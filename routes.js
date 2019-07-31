"use strict";

const express = require("express");

const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const auth = require("basic-auth");

var User = require("./db").User;
var Course = require("./db").Course;

// Authentication
const authenticateUser = (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  console.log(credentials);
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
          console.warn(
            `Authentication failure for username: ${user.emailAddress}`
          );
          res.status(401).json({
            message: "ACCESS DENIED"
          });
        }
      } else {
        console.warn(`User not found`);
        res.status(401).json({
          message: "ACCESS DENIED"
        });
      }
    });
  } else {
    console.warn("Auth header not found");
    res.status(401).json({
      message: "ACCESS DENIED"
    });
  }
};

// Returns the currently authenticated user
router.get("/users", authenticateUser, (req, res, next) => {
  const user = req.currentUser;
  res.json({
    id: user.id,
    name: user.firstName,
    lastname: user.lastName,
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
    // search if the email is already registered
    const user = req.body;
    User.findAndCountAll({
      where: {
        emailAddress: user.emailAddress
      }
    }).then(match => {
      if (match.count > 0) {
        res.status(400).json("User already registered");
      } else {
        user.password = bcryptjs.hashSync(user.password);
        User.create(user)
          .then(() => {
            res
              .status(201)
              .location("/")
              .end();
          })
          .catch(err => {
            res.status(500).json(err);
          });
      }
    });
  }
);

// Returns a list of courses (including the user that owns each course)
router.get("/courses", (req, res, next) => {
  Course.findAll({
    attributes: [
      "id",
      "title",
      "description",
      "estimatedTime",
      "materialsNeeded",
      "userId"
    ]
  })
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
  authenticateUser,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"'),
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

// Deletes a course and returns no content
router.delete("/courses/:id", authenticateUser, (req, res, next) => {
  const user = req.currentUser;

  Course.findByPk(req.params.id).then(course => {
    if (course) {
      if (course.userId === user.id) {
        course.destroy();
        res.status(204).end();
      } else {
        res
          .status(403)
          .json("ACCESS DENIED, YOUR ID DOESN'T MATCH THE COURSE ONE");
      }
    } else {
      res.status(400).json("Course not found");
    }
  });
});

// Updates a course and returns no content
router.put(
  "/courses/:id",
  authenticateUser,
  [
    check("title")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "title"'),
    check("description")
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage('Please provide a value for "description"')
  ],
  (req, res, next) => {
    const user = req.currentUser;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }

    Course.findByPk(req.params.id).then(course => {
      if (course) {
        if (course.userId === user.id) {
          course.update(req.body);
          res.status(204).end();
        } else {
          res
            .status(403)
            .json("ACCESS DENIED, YOUR ID DOESN'T MATCH THE COURSE ONE");
        }
      } else {
        res.status(400).json("Course not found");
      }
    });
  }
);

module.exports = router;
