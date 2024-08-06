import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect'; // Add this import

import axios from "axios";
import TaskAdder from "../components/TodoListApp/TaskAdder";

jest.mock("axios");

describe("TaskAdder Component", () => {
  const mockOnSubmit = jest.fn();
  const mockOnFilterChange = jest.fn();
  const mockToken = "test-token";
  const mockTodos = [];

  beforeEach(() => {
    render(
      <TaskAdder
        onSubmit={mockOnSubmit}
        onFilterChange={mockOnFilterChange}
        token={mockToken}
        todos={mockTodos}
      />
    );
  });

  test("renders TaskAdder component", () => {
    expect(screen.getByPlaceholderText("add task to do")).toBeInTheDocument();
    expect(screen.getByText("Your Todo List")).toBeInTheDocument();
  });

  test("updates state on input change", () => {
    const input = screen.getByPlaceholderText("add task to do");
    fireEvent.change(input, { target: { value: "New Task" } });
    expect(input.value).toBe("New Task");
  });

  test("submits form with valid input", async () => {
    const input = screen.getByPlaceholderText("add task to do");
    fireEvent.change(input, { target: { value: "New Task" } });

    axios.post.mockResolvedValue({
      data: {
        data: {
          _id: "123",
        },
      },
    });

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        ...mockTodos,
        {
          TodoText: "New Task",
          isChecked: false,
          _id: "123",
        },
      ]);
    });

    expect(input.value).toBe("");
  });

  test("shows alert on empty input submission", () => {
    window.alert = jest.fn();
    const form = screen.getByRole("form");
    fireEvent.submit(form);
    expect(window.alert).toHaveBeenCalledWith("Nothing has been submited!");
  });
  test("handles axios error", async () => {
    const input = screen.getByPlaceholderText("add task to do");
    fireEvent.change(input, { target: { value: "New Task" } });
  
    axios.post.mockRejectedValue({
      response: {
        data: "Error",
      },
    });
  
    // Mock console.log
    console.log = jest.fn();
  
    const form = screen.getByRole("form");
    fireEvent.submit(form);
  
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith({ data: "Error" });
    });
  });
});