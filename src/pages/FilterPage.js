import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Todo from './Todo'; // Importa el componente Todo
import "./FilterPage.css";

class FilterPage extends Component {
    state = {
      todos: [],
      filteredTodos: [],
      selectedOption: 'all',
    };
  
    cookies = new Cookies();
    token = this.cookies.get('token');
  
    componentDidMount = async () => {
      try {
        const userTodos = await axios.get('http://localhost:8000/api/v1/todos', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.setTodos(userTodos.data.todos);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
  
    setTodos = (tasks) => {
      this.setState({ todos: tasks, filteredTodos: tasks });
    };
  
    onFilterChange = (option) => {
      this.setState({ selectedOption: option }, this.filterOptionHandler);
    };
  
    filterOptionHandler = () => {
      switch (this.state.selectedOption) {
        case 'finished':
          this.setState({
            filteredTodos: this.state.todos.filter((task) => task.isChecked === true),
          });
          break;
        case 'unfinished':
          this.setState({
            filteredTodos: this.state.todos.filter((task) => task.isChecked === false),
          });
          break;
        default:
          this.setState({ filteredTodos: this.state.todos });
          break;
      }
    };
  
    render() {
      return (
        <div className="filter-container">
          <h1 className="title">Filter Tasks</h1>
          <div className="filter-form">
            <select onChange={(e) => this.onFilterChange(e.target.value)} className="filter-bar">
              <option value="all">All</option>
              <option value="finished">Finished</option>
              <option value="unfinished">Unfinished</option>
            </select>
          </div>
          <ul>
            {this.state.filteredTodos.map((todo) => (
              <Todo
                key={todo._id}
                todo={todo}
                todos={this.state.todos}
                setTodos={this.setTodos}
                token={this.token}
              />
            ))}
          </ul>
        </div>
      );
    }
  }
  
  export default FilterPage;