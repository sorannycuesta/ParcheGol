// ============================================================
// reserva.js - Reservas dinámicas desde el catálogo de canchas
// ============================================================

const formularioReserva = document.querySelector("#formReserva");
const listaReserva     = document.querySelector("#listaReservas");
const contador         = document.querySelector("#contadorReservas");
const canchaSelect     = document.querySelector("#canchaSelect");
const duracionInput    = document.querySelector("#duracionInput");
const costoInput       = document.querySelector("#valorInput");

const CLAVE_CANCHA  = "canchasParcheGol";
const CLAVE_RESERVA = "reservas";

// ============================================================
// Validaciones (mismo patrón que admin.js)
// ============================================================

const RANGO_HORARIO = { minimo: "09:00", maximo: "20:00" };

const regex = {
  nombre: /^[\p{L}][\p{L}\s.'’\-]{2,59}$/u,
  telefono: /^3\d{9}$/,
  hora: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  duracion: /^[1-3]$/,
};

// Inputs del formulario
const clienteInput   = document.querySelector("#clienteInput");
const telefonoInput  = document.querySelector("#telefonoInput");
const fechaInput     = document.querySelector("#fechaInput");
const horaInicioInput = document.querySelector("#horaInicioInput");
// canchaSelect y duracionInput ya están declarados arriba

// Helper: fecha de hoy en formato YYYY-MM-DD (zona local)
function hoyISO() {
  const hoy = new Date();
  const offset = hoy.getTimezoneOffset();
  return new Date(hoy.getTime() - offset * 60000).toISOString().slice(0, 10);
}

// Configuración de campos a validar
const camposReserva = [
  {
    el: canchaSelect,
    validar: (v) => Boolean(v) && canchas.some((c) => c.id == v),
  },
  {
    el: clienteInput,
    validar: (v) => regex.nombre.test(v.trim()),
  },
  {
    el: telefonoInput,
    validar: (v) => regex.telefono.test(v.trim()),
  },
  {
    el: fechaInput,
    validar: (v) => Boolean(v) && v >= hoyISO(),
  },
  {
    el: horaInicioInput,
    validar: (v) =>
      regex.hora.test(v) && v >= RANGO_HORARIO.minimo && v <= RANGO_HORARIO.maximo,
  },
  {
    el: duracionInput,
    validar: (v) => regex.duracion.test(String(v).trim()),
  },
];

// Mostrar estado visual (idéntico a admin.js)
function mostrarEstadoCampo(campo, correcto) {
  const contenedor = campo.el.closest(".admin-field");
  campo.el.classList.toggle("is-valid", correcto);
  campo.el.classList.toggle("is-invalid", !correcto);

  if (contenedor) {
    contenedor.querySelector(".valid-feedback")?.classList.toggle("d-block", correcto);
    contenedor.querySelector(".invalid-feedback")?.classList.toggle("d-block", !correcto);
  }
  return correcto;
}

function validarCampo(campo) {
  const correcto = campo.validar(campo.el.value);
  return mostrarEstadoCampo(campo, correcto);
}

// Validación progresiva
camposReserva.forEach((campo) => {
  campo.el.addEventListener("blur", () => validarCampo(campo));
  campo.el.addEventListener("input", () => {
    if (campo.el.classList.contains("is-valid") || campo.el.classList.contains("is-invalid")) {
      validarCampo(campo);
    }
  });
  campo.el.addEventListener("change", () => {
    if (campo.el.classList.contains("is-valid") || campo.el.classList.contains("is-invalid")) {
      validarCampo(campo);
    }
  });
});

// Canchas del catálogo y precio de la cancha actualmente seleccionada
let canchas = JSON.parse(localStorage.getItem(CLAVE_CANCHA) || "[]");
let reservas = JSON.parse(localStorage.getItem(CLAVE_RESERVA) || "[]");
let precioCanchaActual = 0;

// ---------- Utilidades ----------
function formatearPesos(valor) {
  return "$ " + Number(valor).toLocaleString("es-CO");
}

// ---------- Cargar canchas en el select ----------
function cargarCanchasEnSelect() {
  // Limpia todo menos la opción placeholder
  canchaSelect.innerHTML =
    '<option value="" selected disabled>Selecciona una cancha</option>';

  if (canchas.length === 0) {
    const opcion = document.createElement("option");
    opcion.disabled = true;
    opcion.textContent = "No hay canchas registradas";
    canchaSelect.appendChild(opcion);
    canchaSelect.disabled = true;
    return;
  }

  canchaSelect.disabled = false;

  canchas.forEach((cancha) => {
    const opcion = document.createElement("option");
    opcion.value = cancha.id;                 // id real, no índice
    opcion.textContent = `${cancha.titulo} - ${cancha.categoria}`;
    opcion.dataset.precio = cancha.precio;    // precio por hora
    canchaSelect.appendChild(opcion);
  });
}

// ---------- Actualizar costo total ----------
function actualizarCostoTotal() {
  const duracion = Number(duracionInput.value) || 0;
  const total = precioCanchaActual * duracion;
  costoInput.textContent = formatearPesos(total);
  return total;
}

function limpiarValidacionesReserva() {
  camposReserva.forEach(({ el }) => {
    el.classList.remove("is-valid", "is-invalid");
    const contenedor = el.closest(".admin-field");
    contenedor?.querySelector(".valid-feedback")?.classList.remove("d-block");
    contenedor?.querySelector(".invalid-feedback")?.classList.remove("d-block");
  });
}

formularioReserva.addEventListener("reset", () => {
  // setTimeout para que corra después del reset nativo
  setTimeout(() => {
    limpiarValidacionesReserva();
    duracionInput.value = 2;
    horaInicioInput.value = "18:00";
    precioCanchaActual = 0;
    actualizarCostoTotal();
  }, 0);
});

// ---------- Cambio de cancha ----------
canchaSelect.addEventListener("change", function () {
  const opcion = canchaSelect.selectedOptions[0];
  precioCanchaActual = Number(opcion?.dataset.precio) || 0;
  actualizarCostoTotal();

  const campo = camposReserva.find((c) => c.el === canchaSelect);
  if (canchaSelect.classList.contains("is-valid") || canchaSelect.classList.contains("is-invalid")) {
    validarCampo(campo);
  }
});

// ---------- Cambio de duración ----------
duracionInput.addEventListener("input", actualizarCostoTotal);

// ---------- Submit ----------
formularioReserva.addEventListener("submit", function (event) {
  event.preventDefault();

  // Validar todos los campos de una vez
  const todosValidos = camposReserva.map(validarCampo).every(Boolean);

  if (!todosValidos) {
    formularioReserva.querySelector(".is-invalid")?.focus();
    return;
  }

  const duracion   = Number(duracionInput.value);
  const costoTotal = precioCanchaActual * duracion;
  const canchaObj  = canchas.find((c) => c.id == canchaSelect.value);

  const reserva = {
    id: Date.now(),
    cancha: canchaObj?.titulo ?? "Cancha",
    canchaId: canchaSelect.value,
    nombreUsuario: clienteInput.value.trim(),
    telefono: telefonoInput.value.trim(),
    fecha: fechaInput.value,
    horaInicio: horaInicioInput.value,
    duracion: duracion,
    costo: costoTotal,
  };

  reservas.push(reserva);
  localStorage.setItem(CLAVE_RESERVA, JSON.stringify(reservas));

  mostrarReservas();
  formularioReserva.reset();
  limpiarValidacionesReserva();

  // Restaurar valores por defecto tras reset
  duracionInput.value = 2;
  horaInicioInput.value = "18:00";
  precioCanchaActual = 0;
  actualizarCostoTotal();

  Swal.fire({
    icon: "success",
    title: "Reserva creada",
    text: `Total: ${formatearPesos(costoTotal)}`,
    timer: 1800,
    showConfirmButton: false,
  });
});
// ---------- Render de reservas ----------
function mostrarReservas() {
  listaReserva.innerHTML = "";

  reservas.forEach(function (reserva) {
    const tarjetaReserva = document.createElement("div");
    tarjetaReserva.className = "tarjeta";

    tarjetaReserva.innerHTML = `
      <p class="cancha">Cancha reservada: ${reserva.cancha}</p>
      <p class="nombresuario">Nombre del usuario: ${reserva.nombreUsuario}</p>
      <p class="telefono">Número de teléfono: ${reserva.telefono}</p>
      <p class="fecha">Fecha de reserva: ${reserva.fecha}</p>
      <p class="horainicio">Hora de inicio del partido: ${reserva.horaInicio}</p>
      <p class="duracion">Duración del partido: ${reserva.duracion} horas</p>
    `;

    const costo = document.createElement("p");
    costo.textContent = "El costo total es: " + formatearPesos(reserva.costo);
    tarjetaReserva.appendChild(costo);

    const botonBorrar = document.createElement("button");
    botonBorrar.className = "botonEliminar";
    botonBorrar.textContent = "Eliminar reserva";
    botonBorrar.addEventListener("click", () => eliminarReserva(reserva.id));
    tarjetaReserva.appendChild(botonBorrar);

    listaReserva.appendChild(tarjetaReserva);
  });

  contador.textContent =
    reservas.length + (reservas.length === 1 ? " reserva" : " reservas");

  // Mostrar u ocultar estado vacío
  const emptyState = document.querySelector("#emptyState");
  if (emptyState) {
    emptyState.classList.toggle("d-none", reservas.length > 0);
  }
}

// ---------- Eliminar ----------
function eliminarReserva(id) {
  reservas = reservas.filter((reserva) => reserva.id !== id);
  localStorage.setItem(CLAVE_RESERVA, JSON.stringify(reservas));
  mostrarReservas();
}

// ---------- Init ----------
function iniciarReservas() {
  cargarCanchasEnSelect();
  mostrarReservas();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarReservas);
} else {
  iniciarReservas();
}
