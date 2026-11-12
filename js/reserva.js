// Local Storage 

const formularioReserva = document.querySelector("#formReserva");
const listaReserva = document.querySelector("#listaReservas");
const contador = document.querySelector("#contadorReservas");
const precioHora = 15000;
const duracionInput = document.querySelector("#duracionInput");
const costoInput = document.querySelector("#valorInput");



let reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

duracionInput.addEventListener("input", function (){

    const duracion = duracionInput.value;
    const costoTotal = duracion * precioHora;
    costoInput.value = "$" +
    costoTotal.toLocaleString("es-CO");


}
)


formularioReserva.addEventListener("submit", function guardarReserva(event) {
    event.preventDefault();

    const duracion = document.querySelector("#duracionInput").value;
    const costoTotal = duracion * precioHora;
    const reserva = {
        id: Date.now(),
        cancha: document.querySelector("#canchaSelect").value,
        nombreUsuario: document.querySelector("#clienteInput").value,
        telefono: document.querySelector("#telefonoInput").value,
        fecha: document.querySelector("#fechaInput").value,
        horaInicio: document.querySelector("#horaInicioInput").value,
        duracion: document.querySelector("#duracionInput").value,
        costo: costoTotal

    }

    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    mostrarReservas();

}
)


function mostrarReservas() {

    listaReserva.innerHTML = "";

    reservas.forEach(function (reserva) {

        const tarjetaReserva = document.createElement("div");
        tarjetaReserva.className = "tarjeta";

        tarjetaReserva.innerHTML = `
            <p class="cancha">Cancha reservada: ${reserva.cancha}</p>
            <p class="nombresuario">Nombre del usuario: ${reserva.nombreUsuario}</p>
            <p class="telefono"> Numero de teléfono: ${reserva.telefono}</p>
            <p class="fecha"> Fecha de reserva: ${reserva.fecha}</p>
            <p class="horainicio"> Hora de inicio del partido:${reserva.horaInicio}</p>
            <p class="duracion"> Duración del partido: ${reserva.duracion} horas</p>
        `;
        const duracion = document.querySelector("#duracionInput").value;
        const costoTotal = duracion * precioHora;

        const costo = document.createElement("p");
        costo.textContent = "El costo total es : $" +
            costoTotal.toLocaleString("es-CO");



        const botonBorrar = document.createElement("button");
        botonBorrar.className = "botonEliminar";
        botonBorrar.textContent = "Eliminar reserva";
        botonBorrar.addEventListener("click", function () {
            eliminarReserva(reserva.id);

        }
        )


        listaReserva.appendChild(tarjetaReserva)
        tarjetaReserva.appendChild(costo);
        tarjetaReserva.appendChild(botonBorrar);


    });

    if (reservas.length === 1) {
        contador.textContent = reservas.length + "  reserva  ";
    }
    else {
        contador.textContent = reservas.length + "  reservas  ";
    }


}


function eliminarReserva(id) {
    reservas = reservas.filter(function (reserva) {


        return reserva.id !== id;
    }
    )

    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
}

mostrarReservas();







