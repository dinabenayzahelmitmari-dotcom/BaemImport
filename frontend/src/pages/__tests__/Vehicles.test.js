
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Vehicles from "../Vehicles";

// Mock de peticiones para no depender del backend real.
jest.mock("axios");

const mockNavigate = jest.fn();
// Conserva el comportamiento real del router salvo la navegacion.
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Vehicles page", () => {
  beforeEach(() => {
    // Limpia mocks entre pruebas para evitar falsos positivos.
    mockNavigate.mockClear();
    axios.get.mockReset();
  });

  test("loads vehicles list on mount", async () => {
    // Datos simulados que deberia devolver /api/vehicles.
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: "v1", marca: "BMW", modelo: "Serie 1", anio: 2020, estado: "disponible", precio: 20000 },
      ],
    });

    render(
      <MemoryRouter>
        <Vehicles />
      </MemoryRouter>
    );

    expect(screen.getByText(/vehÃ­culos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });
});
