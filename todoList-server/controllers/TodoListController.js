const catchAsync = require("../utils/catchAsync");
const { User } = require("../models/UserModel");
const { Todo } = require("../models/TodoModel");
const Joi = require('joi');
const AppError = require("../utils/appError");
const DOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

// Inicializa DOMPurify con JSDOM para sanitizar las salidas del servidor
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Definición del esquema de validación con Joi
const todoSchema = Joi.object({
  name: Joi.string().required(),
  TodoText: Joi.string().required(),
});

// Función auxiliar para encontrar usuario
async function findUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

// Obtener todas las tareas del usuario
exports.getAllMyTodos = catchAsync(async (req, res, next) => {
  const user = await findUserById(req.user.id);
  const todos = await Todo.find({ _id: { $in: user.todoList } });

  // Sanitiza los datos antes de enviarlos
  const sanitizedTodos = todos.map(todo => ({
    _id: purify.sanitize(todo._id),
    name: purify.sanitize(todo.name),
    TodoText: purify.sanitize(todo.TodoText),
    isChecked: todo.isChecked
  }));

  return res.status(200).json({
    status: "success",
    results: sanitizedTodos.length,
    data: {
      todos: sanitizedTodos,
    },
  });
});

// Obtener una tarea específica
exports.getTodo = catchAsync(async (req, res, next) => {
  const user = await findUserById(req.user.id);
  const todo = await Todo.findOne({ _id: req.params.id, _id: { $in: user.todoList } });

  if (!todo) {
    return next(new AppError("Todo not found or not owned by you", 404));
  }

  const sanitizedTodo = {
    _id: purify.sanitize(todo._id),
    name: purify.sanitize(todo.name),
    TodoText: purify.sanitize(todo.TodoText),
    isChecked: todo.isChecked
  };

  return res.status(200).json({
    status: "success",
    data: {
      todo: sanitizedTodo,
    },
  });
});

// Crear una nueva tarea
exports.createTodo = catchAsync(async (req, res, next) => {
  const { error } = todoSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { name, TodoText } = req.body;
  const sanitizedData = {
    name: purify.sanitize(name),
    TodoText: purify.sanitize(TodoText)
  };

  const todo = await Todo.create(sanitizedData);

  const user = await findUserById(req.user.id);
  user.todoList.push(todo._id);
  await user.save();

  return res.status(201).json({
    status: "success",
    data: todo
  });
});

// Eliminar una tarea
exports.deleteTodo = catchAsync(async (req, res, next) => {
  const user = await findUserById(req.user.id);
  const todo = await Todo.findOneAndRemove({ _id: req.params.id, _id: { $in: user.todoList } });

  if (!todo) {
    return next(new AppError("Todo not found or not owned by you", 404));
  }

  user.todoList = user.todoList.filter(id => !id.equals(todo._id));
  await user.save();

  return res.status(204).send();
});

// Actualizar una tarea
exports.updateTodo = catchAsync(async (req, res, next) => {
  const user = await findUserById(req.user.id);
  const todo = await Todo.findOne({ _id: req.params.id, _id: { $in: user.todoList } });

  if (!todo) {
    return next(new AppError("Todo not found or not owned by you", 404));
  }

  const { error } = todoSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const sanitizedData = {
    name: purify.sanitize(req.body.name),
    TodoText: purify.sanitize(req.body.TodoText)
  };

  await Todo.findByIdAndUpdate(todo._id, sanitizedData, { new: true });

  return res.status(200).json({
    status: "success",
  });
});
