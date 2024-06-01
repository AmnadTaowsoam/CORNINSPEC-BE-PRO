const express = require("express");
const router = express.Router();
const { body, validationResult, query, param } = require("express-validator");
const asyncHandler = require("express-async-handler");

const UserModel = require("../models/userModel");

const validateRegistration = [
  body("username", "Username is required").not().isEmpty().trim().escape(),
  body("password", "Password must be at least 5 characters").isLength({min: 5,}),
  body("email", "Invalid email address").isEmail().normalizeEmail(),
  body("roles", "Role is required").not().isEmpty().trim().escape(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array()); // Log detailed errors to the console
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    console.log("Registration request body:", req.body); // Log the request body
    const { username, password, email, roles } = req.body; // เพิ่ม role ที่นี่

    const userExists = await UserModel.findUserByUsername(username, email);
    console.log("Does user exist?:", userExists);
    if (userExists) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const newUser = await UserModel.createUser({
      username,
      password,
      email,
      roles, // เพิ่ม role ที่นี่
    });
    console.log("New user created:", newUser); // Log the new user details

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  })
);

router.get(
  "/exists",
  [query("username").not().isEmpty().trim().escape()],
  asyncHandler(async (req, res) => {
    const { username } = req.query;
    console.log(`Checking existence for username: ${username}`);
    try {
      const user = await UserModel.findUserByUsername(username);
      if (user) {
        console.log(`User exists: ${username}`);
        return res.status(200).json({
          exists: true
        });
      } else {
        console.log(`User does not exist: ${username}`);
        return res.status(404).json({ exists: false });
      }
    } catch (error) {
      console.error(`Error checking existence for ${username}: ${error}`);
      return res.status(500).json({ error: "Database query failed" });
    }
  })
);

// Handler for POST request to register a user
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      const users = await UserModel.getAllUsers(); // or UserModel.getAllUsers()
      res.json(users);
    } catch (error) {
      console.error("Failed to retrieve users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

// Handler for DELETE request to delete a user
router.delete(
  "/users/:id",
  [param("id").isNumeric().withMessage("Valid user ID is required")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userExists = await UserModel.findUserById(id);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    await UserModel.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  })
);

module.exports = router;
