// ============================================================
// PARCHEGOL - Reservas (requiere sesión: ver Auth.protegerPagina en reserva.html)
// ============================================================

const sesion = Auth.obtenerSesion();
const esAdmin = Auth.esAdmin();

const CLAVE_CANCHA = "canchasParcheGol";
const formularioReserva = document.querySelector("#formReserva");
const listaReserva = document.querySelector("#listaReservas");
const contador = document.querySelector("#contadorReservas");
const precioHora = 15000;
const duracionInput = document.querySelector("#duracionInput");
const costoInput = document.querySelector("#valorInput");
const selectCancha = document.querySelector("#canchaSelect");
const inputNombre = document.querySelector("#clienteInput");
const inputTelefono = document.querySelector("#telefonoInput");
const inputFecha = document.querySelector("#fechaInput");
const inputHora = document.querySelector("#horaInicioInput");

let reservas = JSON.parse(localStorage.getItem("reservas") || "[]");

function escaparHtml(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
}

function hoyISO() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

// ---------- Select de canchas: usa las que registró el administrador ----------
function cargarCanchasEnSelect() {
    const canchasCatalogo = JSON.parse(localStorage.getItem(CLAVE_CANCHA) || "[]");
    if (canchasCatalogo.length === 0) return; // sin catálogo se dejan las opciones de ejemplo

    selectCancha.innerHTML = '<option value="" selected disabled>Selecciona una cancha</option>';
    canchasCatalogo.forEach((c) => {
        const opcion = document.createElement("option");
        opcion.value = String(c.id);
        opcion.textContent = `${c.titulo} - ${c.categoria}`;
        selectCancha.appendChild(opcion);
    });
}

// ---------- Datos que vienen del buscador / catálogo (?cancha=&fecha=&hora=) ----------
function precargarDesdeUrl() {
    const params = new URLSearchParams(window.location.search);

    const cancha = params.get("cancha");
    if (cancha) {
        const candidatos = [cancha, cancha.replace(/^cancha/i, "")];
        const valor = candidatos.find((v) => selectCancha.querySelector(`option[value="${CSS.escape(v)}"]`));
        if (valor) selectCancha.value = valor;
    }

    const fecha = params.get("fecha");
    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) inputFecha.value = fecha;

    const hora = params.get("hora");
    if (hora && /^\d{2}:\d{2}$/.test(hora)) inputHora.value = hora;
}

function precargarNombre() {
    if (sesion && !inputNombre.value) inputNombre.value = sesion.nombre;
}

// ---------- Costo ----------
function actualizarCosto() {
    const costoTotal = Number(duracionInput.value || 0) * precioHora;
    costoInput.textContent = "$ " + costoTotal.toLocaleString("es-CO");
}
duracionInput.addEventListener("input", actualizarCosto);

// ---------- Guardar ----------
formularioReserva.addEventListener("submit", function guardarReserva(event) {
    event.preventDefault();

    const duracion = Number(duracionInput.value);
    const telefono = inputTelefono.value.trim();

    if (!/^\d{10}$/.test(telefono)) {
        Swal.fire({ icon: "error", title: "Teléfono inválido", text: "Ingresa un número de 10 dígitos." });
        inputTelefono.focus();
        return;
    }
    if (!inputFecha.value || inputFecha.value < hoyISO()) {
        Swal.fire({ icon: "error", title: "Fecha inválida", text: "Elige una fecha de hoy en adelante." });
        inputFecha.focus();
        return;
    }
    if (!(duracion >= 1 && duracion <= 3)) {
        Swal.fire({ icon: "error", title: "Duración inválida", text: "La duración debe ser de 1 a 3 horas." });
        duracionInput.focus();
        return;
    }

    const reserva = {
        id: Date.now(),
        usuarioEmail: sesion.email, // a quién pertenece la reserva
        cancha: selectCancha.value,
        canchaNombre: selectCancha.options[selectCancha.selectedIndex].text,
        nombreUsuario: inputNombre.value.trim(),
        telefono,
        fecha: inputFecha.value,
        horaInicio: inputHora.value,
        duracion,
        costo: duracion * precioHora,
    };

    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    formularioReserva.reset();
    precargarNombre();
    actualizarCosto();
    mostrarReservas();

    Swal.fire({ icon: "success", title: "¡Reserva agendada!", timer: 1800, showConfirmButton: false });
});

// ---------- Listado: cada cliente ve las suyas; el administrador ve todas ----------
function reservasVisibles() {
    return esAdmin ? reservas : reservas.filter((r) => r.usuarioEmail === sesion.email);
}

function mostrarReservas() {
    listaReserva.innerHTML = "";
    const visibles = reservasVisibles();

    visibles.forEach(function (reserva) {
        const tarjetaReserva = document.createElement("div");
        tarjetaReserva.className = "tarjeta";

        tarjetaReserva.innerHTML = `
            <p class="cancha">Cancha reservada: ${escaparHtml(reserva.canchaNombre || reserva.cancha)}</p>
            <p class="nombresuario">Nombre del usuario: ${escaparHtml(reserva.nombreUsuario)}</p>
            <p class="telefono"> Numero de teléfono: ${escaparHtml(reserva.telefono)}</p>
            <p class="fecha"> Fecha de reserva: ${escaparHtml(reserva.fecha)}</p>
            <p class="horainicio"> Hora de inicio del partido: ${escaparHtml(reserva.horaInicio)}</p>
            <p class="duracion"> Duración del partido: ${escaparHtml(reserva.duracion)} horas</p>
        `;

        const costo = document.createElement("p");
        costo.textContent = "El costo total es : $" + Number(reserva.costo).toLocaleString("es-CO");

        const botonBorrar = document.createElement("button");
        botonBorrar.className = "botonEliminar";
        botonBorrar.textContent = "Eliminar reserva";
        botonBorrar.addEventListener("click", function () {
            eliminarReserva(reserva.id);
        });

        listaReserva.appendChild(tarjetaReserva);
        tarjetaReserva.appendChild(costo);
        tarjetaReserva.appendChild(botonBorrar);
    });

    contador.textContent = visibles.length + (visibles.length === 1 ? " reserva" : " reservas");
}

function eliminarReserva(id) {
    const reserva = reservas.find((r) => r.id === id);
    // Solo el dueño o el administrador pueden borrar
    if (!reserva || (!esAdmin && reserva.usuarioEmail !== sesion.email)) return;

    reservas = reservas.filter((r) => r.id !== id);
    localStorage.setItem("reservas", JSON.stringify(reservas));
    mostrarReservas();
}

// ---------- Inicio ----------
inputFecha.min = hoyISO();
cargarCanchasEnSelect();
precargarDesdeUrl();
precargarNombre();
actualizarCosto();
mostrarReservas();