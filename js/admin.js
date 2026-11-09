// ============================================================
// PARCHEGOL - Administración del catálogo de canchas
// ============================================================

const form = document.getElementById("formCancha");
const listaCanchas = document.getElementById("listaCanchas");
const CLAVE_CANCHA = "canchasParcheGol";

// Configuración del horario: cambia estos valores para ajustar
// el rango permitido de apertura y cierre.
const RANGO_HORARIO = {
  minimo: "09:00",
  maximo: "20:00",
};

const TAMANO_MAXIMO_IMAGEN = 5 * 1024 * 1024; // 5 MB
const EXTENSION_IMAGEN = /\.(jpe?g|png|webp)$/i;

// Expresiones regulares para validar los campos del formulario.
const regex = {
  titulo: /^[\p{L}\p{N}][\p{L}\p{N}\s.'’()\-]{2,49}$/u,
  descripcion: /^[\s\S]{20,300}$/,
  categoria: /^(Fútbol 5|Fútbol 7|Microfútbol)$/,
  hora: /^(?:[01]\d|2[0-3]):[0-5]\d$/,
  capacidad: /^(?:[1-9]|[1-9]\d|100)$/,
  ubicacion: /^[\p{L}\p{N}][\p{L}\p{N}\s.,#°º\-/]{3,99}$/u,
  maps: /^https?:\/\/(?:www\.)?(?:google\.[a-z.]+\/maps(?:[/?#]|$)|maps\.google\.[a-z.]+(?:[/?#]|$)|maps\.app\.goo\.gl(?:[/?#]|$)|goo\.gl\/maps(?:[/?#]|$))/i,
};

const elementos = {
  imagen: document.getElementById("imagen"),
  vistaPrevia: document.getElementById("vistaPrevia"),
  placeholderImagen: document.getElementById("placeholderImagen"),
  titulo: document.getElementById("tituloCancha"),
  descripcion: document.getElementById("descripcion"),
  categoria: document.getElementById("categoria"),
  horaInicio: document.getElementById("horaInicio"),
  horaFin: document.getElementById("horaFin"),
  capacidad: document.getElementById("capacidad"),
  ubicacion: document.getElementById("ubicacion"),
  maps: document.getElementById("enlaceMaps"),
  lista: document.getElementById("listaCanchas"),
  estadoVacio: document.getElementById("estadoVacio"),
  contadorCanchas: document.getElementById("contadorCanchas"),
  contadorDescripcion: document.getElementById("contadorDescripcion"),
  errorDias: document.getElementById("errorDias"),
};

// Sincroniza los límites del selector horario con la configuración superior.
[elementos.horaInicio, elementos.horaFin].forEach((input) => {
  input.min = RANGO_HORARIO.minimo;
  input.max = RANGO_HORARIO.maximo;
});

// Lista en memoria: aquí se almacenan los registros capturados.
let canchas = [];
const vistasPrevias = new Map();
let urlImagenSeleccionada = null;
let siguienteId = 1;

const campos = [
  { el: elementos.titulo, validar: (valor) => regex.titulo.test(valor.trim()) },
  { el: elementos.descripcion, validar: (valor) => regex.descripcion.test(valor.trim()) },
  { el: elementos.categoria, validar: (valor) => regex.categoria.test(valor) },
  {
    el: elementos.horaInicio,
    validar: (valor) => esHoraValida(valor) && valor >= RANGO_HORARIO.minimo && valor < elementos.horaFin.value,
  },
  {
    el: elementos.horaFin,
    validar: (valor) => esHoraValida(valor) && valor <= RANGO_HORARIO.maximo && valor > elementos.horaInicio.value,
  },
  { el: elementos.capacidad, validar: (valor) => regex.capacidad.test(valor.trim()) },
  { el: elementos.ubicacion, validar: (valor) => regex.ubicacion.test(valor.trim()) },
  { el: elementos.maps, validar: (valor) => regex.maps.test(valor.trim()) },
];

function esHoraValida(valor) {
  return regex.hora.test(valor) && valor >= RANGO_HORARIO.minimo && valor <= RANGO_HORARIO.maximo;
}

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

// Validación progresiva: valida al salir y revalida mientras se corrige.
campos.forEach((campo) => {
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

// Revalidar ambos extremos cuando cambia cualquiera de las horas.
[elementos.horaInicio, elementos.horaFin].forEach((input) => {
  input.addEventListener("input", () => {
    const campoInicio = campos.find((campo) => campo.el === elementos.horaInicio);
    const campoFin = campos.find((campo) => campo.el === elementos.horaFin);
    if (elementos.horaInicio.classList.contains("is-valid") || elementos.horaInicio.classList.contains("is-invalid")) {
      validarCampo(campoInicio);
    }
    if (elementos.horaFin.classList.contains("is-valid") || elementos.horaFin.classList.contains("is-invalid")) {
      validarCampo(campoFin);
    }
  });
});

// Contador de caracteres de la descripción.
elementos.descripcion.addEventListener("input", () => {
  elementos.contadorDescripcion.textContent = elementos.descripcion.value.length;
});

// Imagen: extensión, tipo MIME y tamaño. La URL temporal solo se usa
// para mostrar la vista previa dentro de esta sesión del navegador.
function validarImagen() {
  const archivo = elementos.imagen.files[0];
  const contenedor = elementos.imagen.closest(".admin-field");
  const feedbackValido = contenedor.querySelector(".valid-feedback");
  const feedbackInvalido = contenedor.querySelector(".invalid-feedback");
  const correcto = Boolean(
    archivo &&
    EXTENSION_IMAGEN.test(archivo.name) &&
    ["image/jpeg", "image/png", "image/webp"].includes(archivo.type) &&
    archivo.size <= TAMANO_MAXIMO_IMAGEN
  );

  elementos.imagen.classList.toggle("is-valid", correcto);
  elementos.imagen.classList.toggle("is-invalid", !correcto);
  feedbackValido.classList.toggle("d-block", correcto);
  feedbackInvalido.classList.toggle("d-block", !correcto);
  return correcto;
}

function limpiarVistaPrevia() {
  if (urlImagenSeleccionada) {
    URL.revokeObjectURL(urlImagenSeleccionada);
    urlImagenSeleccionada = null;
  }
  elementos.vistaPrevia.removeAttribute("src");
  elementos.vistaPrevia.hidden = true;
  elementos.placeholderImagen.hidden = false;
}

elementos.imagen.addEventListener("change", () => {
  limpiarVistaPrevia();
  const archivo = elementos.imagen.files[0];
  if (!validarImagen()) return;

  urlImagenSeleccionada = URL.createObjectURL(archivo);
  elementos.vistaPrevia.src = urlImagenSeleccionada;
  elementos.vistaPrevia.hidden = false;
  elementos.placeholderImagen.hidden = true;
});

// Debe seleccionarse al menos un día.
function validarDias() {
  const seleccionados = document.querySelectorAll('input[name="dias"]:checked').length;
  const correcto = seleccionados > 0;
  elementos.errorDias.classList.toggle("d-block", !correcto);
  return correcto;
}

document.querySelectorAll(".dia-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", validarDias);
});

function obtenerDiasSeleccionados() {
  return Array.from(document.querySelectorAll('input[name="dias"]:checked'))
    .map((checkbox) => checkbox.value);
}

function obtenerServiciosSeleccionados() {
  return {
    hidratacion: document.getElementById("hidratacion").checked,
    petos: document.getElementById("petos").checked,
    balones: document.getElementById("balones").checked,
  };
}

// Captura los valores del formulario y construye el objeto que se agrega al catálogo.

function capturarDatosCancha(imagenBase64) {
  return {
    id: Date.now(), // Usamos timestamp para asegurar un ID único y persistente
    titulo: elementos.titulo.value.trim(),
    descripcion: elementos.descripcion.value.trim(),
    imagen: imagenBase64, // Aquí guardamos el string en Base64 para que persista en localStorage
    categoria: elementos.categoria.value,
    servicios: obtenerServiciosSeleccionados(),
    disponibilidad: {
      dias: obtenerDiasSeleccionados(),
      horaInicio: elementos.horaInicio.value,
      horaFin: elementos.horaFin.value,
    },
    capacidad: Number(elementos.capacidad.value),
    ubicacion: elementos.ubicacion.value.trim(),
    enlaceMaps: elementos.maps.value.trim(),
  };
}

/* function capturarDatosCancha() {
  const archivo = elementos.imagen.files[0];

  return {
    id: siguienteId++,
    titulo: elementos.titulo.value.trim(),
    descripcion: elementos.descripcion.value.trim(),
    imagen: {
      nombre: archivo.name,
      tipo: archivo.type,
    },
    categoria: elementos.categoria.value,
    servicios: obtenerServiciosSeleccionados(),
    disponibilidad: {
      dias: obtenerDiasSeleccionados(),
      horaInicio: elementos.horaInicio.value,
      horaFin: elementos.horaFin.value,
    },
    capacidad: Number(elementos.capacidad.value),
    ubicacion: elementos.ubicacion.value.trim(),
    enlaceMaps: elementos.maps.value.trim(),
  };
} */

function crearElemento(tag, clase, texto) {
  const elemento = document.createElement(tag);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

// Pinta una tarjeta del catálogo para cada cancha agregada.
function mostrarCancha(cancha) {
  elementos.estadoVacio?.remove();

  const tarjeta = crearElemento("article", "admin-court-card");
  const imagen = crearElemento("img", "admin-court-image");
  imagen.src = vistasPrevias.get(cancha.id);
  imagen.alt = `Fotografía de ${cancha.titulo}`;

  const cuerpo = crearElemento("div", "admin-court-body");
  const encabezado = crearElemento("div", "admin-court-topline");
  const titulo = crearElemento("h3", "admin-court-title", cancha.titulo);
  const categoria = crearElemento("span", "admin-category-tag", cancha.categoria);
  encabezado.append(titulo, categoria);

  const descripcion = crearElemento("p", "admin-court-description", cancha.descripcion);
  const datos = crearElemento("div", "admin-court-details");

  const capacidad = crearElemento("span", "admin-detail-item");
  capacidad.innerHTML = '<i class="bi bi-people"></i>';
  capacidad.append(document.createTextNode(` ${cancha.capacidad} jugadores`));

  const horario = crearElemento("span", "admin-detail-item");
  horario.innerHTML = '<i class="bi bi-clock"></i>';
  horario.append(document.createTextNode(` ${cancha.disponibilidad.horaInicio} – ${cancha.disponibilidad.horaFin}`));

  const dias = crearElemento("span", "admin-detail-item admin-days-detail");
  dias.innerHTML = '<i class="bi bi-calendar-week"></i>';
  dias.append(document.createTextNode(` ${cancha.disponibilidad.dias.join(", ")}`));
  datos.append(capacidad, horario, dias);

  const ubicacion = crearElemento("a", "admin-location-link", cancha.ubicacion);
  ubicacion.href = cancha.enlaceMaps;
  ubicacion.target = "_blank";
  ubicacion.rel = "noopener noreferrer";
  ubicacion.innerHTML = '<i class="bi bi-geo-alt me-1"></i>' + escaparHtml(cancha.ubicacion);

  const servicios = crearElemento("p", "admin-services");
  const serviciosIncluidos = Object.entries(cancha.servicios)
    .filter(([, incluido]) => incluido)
    .map(([servicio]) => ({
      hidratacion: "Hidratación",
      petos: "Petos",
      balones: "Balones",
    })[servicio]);
  servicios.textContent = serviciosIncluidos.length
    ? `Incluye: ${serviciosIncluidos.join(" · ")}`
    : "Sin servicios adicionales seleccionados";

  const acciones = crearElemento("div", "admin-card-actions");
  const botonEditar = crearElemento("button", "btn btn-sm btn-outline-primary", "Editar");
  botonEditar.type = "button";
  botonEditar.disabled = true;
  botonEditar.title = "Funcionalidad pendiente para una siguiente etapa";
  const botonEliminar = crearElemento("button", "btn btn-sm btn-outline-danger", "Eliminar");
  botonEliminar.classList.add("eliminar");
  botonEliminar.dataset.index = cancha.id;
  botonEliminar.type = "button";
  botonEliminar.title = "Eliminar una entrada del catalogo";
  acciones.append(botonEditar, botonEliminar);

  cuerpo.append(encabezado, descripcion, datos, ubicacion, servicios, acciones);
  tarjeta.append(imagen, cuerpo);
  elementos.lista.prepend(tarjeta);
}

// Escapa el texto antes de insertarlo dentro del enlace de ubicación.
function escaparHtml(texto) {
  return texto.replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caracter]);
}

function actualizarCatalogoJson() {
  console.log("Catálogo de canchas (JSON):");
  console.log(JSON.stringify(canchas, null, 2));
}

function actualizarContador() {
  const cantidad = canchas.length;
  elementos.contadorCanchas.textContent = `${cantidad} ${cantidad === 1 ? "cancha" : "canchas"}`;
}

function limpiarValidaciones() {
  campos.forEach(({ el }) => {
    el.classList.remove("is-valid", "is-invalid");
    const contenedor = el.closest(".admin-field");
    contenedor?.querySelector(".valid-feedback")?.classList.remove("d-block");
    contenedor?.querySelector(".invalid-feedback")?.classList.remove("d-block");
  });
  elementos.imagen.classList.remove("is-valid", "is-invalid");
  const bloqueImagen = elementos.imagen.closest(".admin-field");
  bloqueImagen.querySelector(".valid-feedback")?.classList.remove("d-block");
  bloqueImagen.querySelector(".invalid-feedback")?.classList.remove("d-block");
  elementos.errorDias.classList.remove("d-block");
  elementos.contadorDescripcion.textContent = "0";
}

function eliminarCancha(evento) {
  // Tu código aquí
  
  if( !evento.target.classList.contains("eliminar")){
    return;
  }else{
    
    let idCancha = Number(evento.target.dataset.index);

    console.log(idCancha);
   
    canchas.splice(Number(canchas.findIndex(element => element.id == idCancha)),1);

    guardarCancha();

    const encontrarCancha = evento.target.closest(".admin-court-card");
    encontrarCancha.remove();
   
    actualizarContador();
  }

}

function guardarCancha(){

      localStorage.setItem(CLAVE_CANCHA, JSON.stringify(canchas));

}

form.addEventListener("submit", (evento) => {
  // Evitamos que la página se recargue por defecto al enviar el formulario
  evento.preventDefault();

  // Ejecutamos las validaciones habituales de texto, imagen y días
  const camposValidos = campos.map(validarCampo).every(Boolean);
  const imagenValida = validarImagen();
  const diasValidos = validarDias();

  // Si algo falla, detenemos el proceso y enfocamos el primer error
  if (!camposValidos || !imagenValida || !diasValidos) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }

  // Con esto obtenemos el archivo de imagen que selecciono el usuario en el input
  const archivo = elementos.imagen.files[0];
  
  // 4. Creamos un lector de archivos (FileReader) nativo de JavaScript.
  // esta  parte es obligatorio pues es para convertir la imagen local en un texto largo (Base64) 
  // y poder guardarla en el localStorage.
  const lector = new FileReader();

  // Esta funcion se ejecuta automaticamente un segundo despues, cuando 
  // el lector termina de leer y transformar la imagen a Base64.
  lector.onload = function (e) {
    const imagenBase64 = e.target.result; // Aqui ya tenemos la imagen convertida a texto
    
    // Se capturan todos los datos del formulario, pasándole la imagen en Base64
    const cancha = capturarDatosCancha(imagenBase64);

    // Agregamos la nueva cancha al arreglo local y a las vistas previas
    canchas.push(cancha);
    vistasPrevias.set(cancha.id, imagenBase64);

    // Guardamos el arreglo completo de canchas en el localStorage del navegador transformandolo a texto JSON.
    guardarCancha();
    // Pintamos la tarjeta en pantalla, actualizamos contadores y consola
    mostrarCancha(cancha);
    actualizarContador();
    actualizarCatalogoJson();

    // Limpiamos variables temporales, reseteamos el formulario y borramos validaciones
    urlImagenSeleccionada = null;
    form.reset();
    limpiarVistaPrevia();
    limpiarValidaciones();
  };

  // Si el archivo existe, disparamos la lectura para que comience el proceso de FileReader
  if (archivo) {
    lector.readAsDataURL(archivo); 
  }
});

listaCanchas.addEventListener("click",eliminarCancha);




/* form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  // Se ejecutan todas las validaciones para mostrar los errores de una sola vez.
  const camposValidos = campos.map(validarCampo).every(Boolean);
  const imagenValida = validarImagen();
  const diasValidos = validarDias();

  if (!camposValidos || !imagenValida || !diasValidos) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }

  const cancha = capturarDatosCancha();
  canchas.push(cancha);
  vistasPrevias.set(cancha.id, urlImagenSeleccionada);

  mostrarCancha(cancha);
  actualizarContador();
  actualizarCatalogoJson();

  // La vista previa queda asociada a la tarjeta; se libera la referencia temporal
  // del formulario para que el siguiente registro pueda seleccionar otra imagen.
  urlImagenSeleccionada = null;
  form.reset();
  limpiarVistaPrevia();
  limpiarValidaciones();
}); */

// Funcion para cargar las canchas guardadas en el navegador al abrir la página
function cargarCanchasGuardadas() {
  const canchasGuardadas = JSON.parse(localStorage.getItem(CLAVE_CANCHA)) || [];
  
  canchasGuardadas.forEach(cancha => {
    canchas.push(cancha);
    vistasPrevias.set(cancha.id, cancha.imagen);
    mostrarCancha(cancha);
  });
  
  actualizarContador();
}

// Se ejecuta automáticamente al cargar la pagina de administracion
document.addEventListener("DOMContentLoaded", () => {
  cargarCanchasGuardadas();
});

form.addEventListener("reset", () => {
  // Espera a que el navegador restaure los valores por defecto del formulario.
  window.setTimeout(() => {
    limpiarVistaPrevia();
    limpiarValidaciones();
  }, 0);
});
