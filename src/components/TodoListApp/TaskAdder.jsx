import axios from "axios";
import React, { Component } from "react";
import DOMPurify from "dompurify";
import "./TaskAdder.css";
import validator from "validator";

class TaskAdder extends Component {
  state = { taskInput: "" };

  //event handler
  onFilterChange = (event) => {
    this.props.onFilterChange(event.target.value);
  };

  onFormSubmit = async (event) => {
    event.preventDefault();

    // Validation for input
    if (this.state.taskInput === "") {
      return alert("Nothing has been submitted!");
    }

    if (!validator.isAlphanumeric(this.state.taskInput.replace(/ /g, ''))) {
      return alert("Task input contains invalid characters!");
    }

    // Sanitize the task input
    const sanitizedTaskInput = DOMPurify.sanitize(this.state.taskInput);

    // Add the sanitized task input to the server
    try {
      const addingTodoData = await axios.post(
        "http://localhost:8000/api/v1/todos/",
        {
          // To server
          name: "todos",
          TodoText: sanitizedTaskInput,
          isChecked: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`, // Means the header has token
          },
        }
      );
      console.log(addingTodoData);
      this.props.onSubmit([
        ...this.props.todos,
        {
          // Not going to server
          TodoText: sanitizedTaskInput,
          isChecked: false,
          _id: addingTodoData.data.data._id,
        },
      ]);
      this.setState({ taskInput: "" });
    } catch (error) {
      console.log(error.response);
    }
  };

  render() {
    return (
      <div className="todo-container">
        <h1 className="title">Your Todo List</h1>
        <form className="add-form" action="" onSubmit={this.onFormSubmit}>
          <input
            onChange={(e) => this.setState({ taskInput: e.target.value })}
            placeholder="add task to do"
            value={this.state.taskInput}
            type="text"
          />
          <button type="submit">
            <i className="fas fa-plus"></i>
          </button>
          <div className="filter-bar">
            <i className="fas fa-sort-down"></i>
            <select
              onChange={this.onFilterChange}
              value={this.props.selectedFilter}
            >
              <option value="all"> All</option>
              <option value="finished"> Finished</option>
              <option value="unfinished"> Unfinished</option>
            </select>
          </div>
        </form>
      </div>
    );
  }
}

export default TaskAdder;
