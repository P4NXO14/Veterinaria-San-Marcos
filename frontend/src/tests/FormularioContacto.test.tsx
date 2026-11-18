import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen} from "@testing-library/react";
import FormularioContacto from "../componentes/organismos/FormularioContacto";
import {guardarMensajeContacto} from "../datos/mensajesContacto";
import type {Sesion} from "../datos/usuarios";

vi.mock("../datos/mensajesContacto",() => ({
    guardarMensajeContacto: vi.fn()
}));

const sesionPrueba: Sesion = {
    rut: "123456785",
    nombre: "Francisco",
    apellidos: "Prueba",
    correo: "cliente@gmail.com",
    rol: "cliente"
};

beforeEach(() => {
    vi.mocked(guardarMensajeContacto).mockReset();
});

afterEach(() => {
    cleanup();
});

function mostrarFormulario() {
    render(
        <FormularioContacto sesion={sesionPrueba} />
    );
}

function completarFormulario(
    nombre: string,
    correo: string,
    comentario: string,
    password = ""
) {
    fireEvent.change(
        screen.getByLabelText("Nombre:"),{
            target: {value: nombre}
        }
    );

    fireEvent.change(
        screen.getByLabelText("Correo electronico:"),{
            target: {value: correo}
        }
    );

    fireEvent.change(
        screen.getByLabelText("Comentario:"),{
            target: {value: comentario}
        }
    );

    fireEvent.change(
        screen.getByLabelText("Contraseña para enviar la consulta:"),{
            target: {value: password}
        }
    );
}

function enviarFormulario() {
    fireEvent.click(
        screen.getByRole("button",{
            name: "Enviar Mensaje"
        })
    );
}

describe("Formulario de Contacto",() => {
    it("muestra los campos del formulario",() => {
        mostrarFormulario();

        expect(screen.getByLabelText("Nombre:")).toBeInTheDocument();
        expect(screen.getByLabelText("Correo electronico:")).toBeInTheDocument();
        expect(screen.getByLabelText("Comentario:")).toBeInTheDocument();
        expect(screen.getByLabelText("Contraseña para enviar la consulta:")).toBeInTheDocument();

        expect(
            screen.getByRole("button",{
                name: "Enviar Mensaje"
            })
        ).toBeInTheDocument();
    });

    it("rechaza un nombre vacio",() => {
        mostrarFormulario();
        enviarFormulario();

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("El nombre es obligatorio");

        expect(guardarMensajeContacto).not.toHaveBeenCalled();
    });

    it("rechaza un correo electronico invalido",() => {
        mostrarFormulario();

        completarFormulario(
            "Francisco",
            "correo-invalido",
            "Necesito consultar por una vacuna",
            "Clave123"
        );

        enviarFormulario();

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("Ingresa un correo valido");

        expect(guardarMensajeContacto).not.toHaveBeenCalled();
    });

    it("rechaza el envio sin contraseña",() => {
        mostrarFormulario();

        completarFormulario(
            "Francisco",
            "consulta@gmail.com",
            "Necesito reservar una consulta"
        );

        enviarFormulario();

        expect(
            screen.getByRole("alert")
        ).toHaveTextContent("La contraseña debe tener entre 4 y 10 caracteres");

        expect(guardarMensajeContacto).not.toHaveBeenCalled();
    });

    it("envia correctamente un mensaje valido",() => {
        mostrarFormulario();

        completarFormulario(
            "Francisco",
            "consulta@gmail.com",
            "Necesito reservar una consulta",
            "Clave123"
        );

        enviarFormulario();

        expect(guardarMensajeContacto).toHaveBeenCalledTimes(1);

        expect(guardarMensajeContacto).toHaveBeenCalledWith({
            nombre: "Francisco",
            correo: "consulta@gmail.com",
            comentario: "Necesito reservar una consulta"
        },{
            correo: "cliente@gmail.com",
            password: "Clave123"
        });
    });
});