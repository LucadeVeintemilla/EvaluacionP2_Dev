const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "User Must Have A Username"],
    unique: [true, "Username Must Be Unique"],
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
  },
  email: {
    type: String,
    required: [true, "User Must Have An Email"],
    unique: [true, "Email Must Be Unique"],
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "User Must Have A Password"],
    minlength: [8, "Password must be at least 8 characters"],
  },
  passwordChangedAt: {
    type: Date,
  },
  todoList: [
    {
      type: Schema.ObjectId,
      ref: "Todo",
    },
  ],
});

UserSchema.pre(/^find/, function (next) {
  // Populate todoList field
  this.populate("todoList");
  next();
});

UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Set the passwordChangedAt field
  if (this.isModified("password") || this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // ensures the passwordChangedAt is set before token issued
  }

  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < passwordChangedTimestamp;
  }
  return false;
};

module.exports = mongoose.model("User", UserSchema);
