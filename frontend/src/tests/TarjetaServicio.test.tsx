import {afterEach,describe,expect,it,vi} from "vitest";
import {cleanup,render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from "react-router-dom";
import TarjetaServicio from "../componentes/moleculas/TarjetaServicio";
import {servicios} from "../datos/servicios";

const servicio = servicios.find(
  (item) => item.id === "SV001"
);

function mostrarTarjeta(
  onSolicitarCita = vi.fn()
) {
  if (!servicio) {
    throw new Error("No se encontro el servicio SV001");
  }

  render(
    <MemoryRouter>
      <TarjetaServicio
        servicio={servicio}
        onSolicitarCita={onSolicitarCita}
      />
    </MemoryRouter>
  );
}

afterEach(() => {
  cleanup();
});

describe("Componente TarjetaServicio", () => {

  it("muestra el nombre del servicio", () => {
    mostrarTarjeta();

    expect(
      screen.getByRole("heading", {
        name: "Consulta general"
      })
    ).toBeInTheDocument();
  });

  it("muestra los detalles al presionar Ver detalle", async () => {
    const usuario = userEvent.setup();

    mostrarTarjeta();

    const boton = screen.getByRole("button", {
      name: "Ver detalle"
    });

    expect(boton).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    await usuario.click(boton);

    expect(
      screen.getByText("Codigo:")
    ).toBeInTheDocument();

    expect(
      screen.getByText("SV001")
    ).toBeInTheDocument();

    expect(boton).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("contiene el enlace correcto a la ficha completa", () => {
    mostrarTarjeta();

    const enlace = screen.getByRole("link", {
      name: "Ver ficha completa"
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/servicios/SV001"
    );
  });

  it("ejecuta la solicitud de cita con el servicio correcto", async () => {
    const usuario = userEvent.setup();

    const solicitarCita = vi.fn();

    mostrarTarjeta(solicitarCita);

    const boton = screen.getByRole("button", {
      name: "Solicitar Cita"
    });

    await usuario.click(boton);

    expect(solicitarCita).toHaveBeenCalledTimes(1);

    expect(solicitarCita).toHaveBeenCalledWith(
      "SV001"
    );
  });

});