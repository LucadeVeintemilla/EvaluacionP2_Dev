import axios from "axios";
import React, { Component } from "react";
import "./TaskAdder.css";

class TaskAdder extends Component {
  state = { taskInput: "" };

  onFilterChange = (event) => {
    this.props.onFilterChange(event.target.value);
  };

  onFormSubmit = async (event) => {
    event.preventDefault();
    if (this.state.taskInput === "") {
      return alert("Nothing has been submited!");
    }

    try {
      const addingTodoData = await axios.post(
        "http://localhost:8000/api/v1/todos/",
        {
          name: "todos",
          TodoText: this.state.taskInput,
          isChecked: false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        }
      );
      console.log(addingTodoData);
      this.props.onSubmit([
        ...this.props.todos,
        {
          TodoText: this.state.taskInput,
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
        <form className="add-form" action="" onSubmit={this.onFormSubmit} role="form">
          <input
            onChange={(e) => this.setState({ taskInput: e.target.value })}
            placeholder="add task to do"
            value={this.state.taskInput}
            type="text"
          />
          <button type="submit">
            <i className="fas fa-plus"></i>
          </button>
          <div className="filter-bar"></div>
        </form>
      </div>
    );
  }
}



export default TaskAdder;
