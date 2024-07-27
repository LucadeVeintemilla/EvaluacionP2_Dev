const { Router } = require("express");
const { check, validationResult } = require("express-validator");

const {
  protect,
  signup,
  login,
  getMe,
  getUser,
} = require("../controllers/authController");

const router = Router();

//router.post("/signup", signup);
router.post(
  "/signup",
  [
    check('username').isAlphanumeric().trim().escape().withMessage('Invalid username.'),
    check('email').isEmail().normalizeEmail().withMessage('Invalid email.'),
    check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long.'),
    // Add other validations as needed
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  signup
);

//router.post("/login", login);
router.post(
  "/login",
  [
    check('email').isEmail().normalizeEmail().withMessage('Invalid email.'),
    check('password').isLength({ min: 6 }).trim().escape().withMessage('Password must be at least 6 characters long.'),
    // Add other validations as needed
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  login
);

router.use(protect);
router.get("/me", getMe, getUser);

module.exports = router;
