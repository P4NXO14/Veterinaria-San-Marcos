import {afterEach,describe,expect,it,vi} from "vitest";
import {cleanup,render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter} from "react-router-dom";
import Encabezado from "../componentes/organismos/Encabezado";
import type {Sesion} from "../datos/usuarios";

afterEach(() => {
  cleanup();
});

function mostrarEncabezado(
  sesion: Sesion | null = null,
  onCerrarSesion = vi.fn()
) {
  render(
    <MemoryRouter>
      <Encabezado
        sesion={sesion}
        onCerrarSesion={onCerrarSesion}
      />
    </MemoryRouter>
  );
}

describe("Componente Encabezado", () => {

  it("abre y cierra el menu movil", async () => {
    const usuario = userEvent.setup();

    mostrarEncabezado();

    const boton = screen.getByRole("button", {
      name: "Abrir menu"
    });

    expect(boton).toHaveAttribute(
      "aria-expanded",
      "false"
    );

    await usuario.click(boton);

    expect(boton).toHaveAttribute(
      "aria-expanded",
      "true"
    );

    await usuario.click(boton);

    expect(boton).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

});