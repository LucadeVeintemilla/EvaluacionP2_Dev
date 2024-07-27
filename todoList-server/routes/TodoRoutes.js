const { Router } = require("express");
const { check, validationResult } = require("express-validator");

const {
  protect,
  signup,
  login,
  getMe,
  getUser,
} = require("../controllers/authController");
const {
  getAllMyTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/TodoListController");

const router = Router();

router.use(protect);
router.get("/", getAllMyTodos);
router.get("/:id", getTodo);

//router.post("/", createTodo);
//router.patch("/:id", updateTodo);

router.post(
  "/",
  [
    check('TodoText').isString().trim().escape().withMessage('Invalid task text.'),
    // Add other validations as needed
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createTodo
);

router.patch(
  "/:id",
  [
    check('TodoText').optional().isString().trim().escape().withMessage('Invalid task text.'),
    check('isChecked').optional().isBoolean().withMessage('Invalid check status.'),
    // Add other validations as needed
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  updateTodo
);

router.delete("/:id", deleteTodo);

// router.get("/me", getMe, getUser);

module.exports = router;
