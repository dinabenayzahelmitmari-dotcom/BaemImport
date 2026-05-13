
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Login from "../Login";

// Mock de cliente HTTP para controlar respuestas del backend.
jest.mock("axios");

const mockNavigate = jest.fn();
// Mantiene el router real y solo sustituye useNavigate para verificar redireccion.
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login page", () => {
  beforeEach(() => {
    // Reinicia estado compartido entre pruebas.
    mockNavigate.mockClear();
    axios.post.mockReset();
    window.localStorage.clear();
  });

  test("successful login calls API and navigates to home", async () => {
    // Simula respuesta exitosa de autenticacion.
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

    // Reproduce interaccion real del usuario en el formulario.
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("tu@email.com"), "test@example.com");
    await user.type(screen.getByPlaceholderText("Tu contraseÃ±a"), "pass123");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(axios.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "test@example.com",
      password: "pass123",
    });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(window.localStorage.getItem("baem_token")).toBe("token123");
  });
});
