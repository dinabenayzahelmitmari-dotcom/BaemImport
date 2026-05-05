import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Login from "../Login";

jest.mock("axios");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login page", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    axios.post.mockReset();
    window.localStorage.clear();
  });

  test("successful login calls API and navigates to home", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "token123",
        user: { _id: "u1", nombre: "Test", email: "test@example.com", rol: "cliente" },
      },
    });

    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("tu@email.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Tu contrasena"), "pass123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(axios.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "test@example.com",
      password: "pass123",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(window.localStorage.getItem("baem_token")).toBe("token123");
  });
});
