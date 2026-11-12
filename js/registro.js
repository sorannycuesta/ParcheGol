const form = document.getElementById("formRegistro");
const CLAVE_USUARIO = "usuarioParcheGol";

// Expresiones regulares adaptadas a la misma convención del proyecto
const regex = {
  nombre: /^[\p{L}\s.'’\-]{3,50}$/u,
  telefono: /^\d{10}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  passwordGlobal: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
};

const reglasRegexPassword = {
  largo: /.{8,}/,
  mayuscula: /[A-Z]/,
  minuscula: /[a-z]/,
  numero: /\d/,
  simbolo: /[@$!%*?&.#_-]/,
};

const elementos = {
  nombre: document.getElementById("nombre"),
  telefono: document.getElementById("telefono"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  confirmarPassword: document.getElementById("confirmarPassword"),
  togglePassword: document.getElementById("togglePassword"),
  iconoOjo: document.getElementById("iconoOjo"),
  barraProgreso: document.getElementById("barraProgreso"),
  textoFortaleza: document.getElementById("textoFortaleza"),
  reqLargo: document.getElementById("req-largo"),
  reqMayuscula: document.getElementById("req-mayuscula"),
  reqMinuscula: document.getElementById("req-minuscula"),
  reqNumero: document.getElementById("req-numero"),
  reqSimbolo: document.getElementById("req-simbolo"),
};

// Arreglo de campos siguiendo la misma arquitectura de admin.js
const campos = [
  { el: elementos.nombre, validar: (valor) => regex.nombre.test(valor.trim()) },
  { el: elementos.telefono, validar: (valor) => regex.telefono.test(valor.trim()) },
  { el: elementos.email, validar: (valor) => regex.email.test(valor.trim()) },
  { el: elementos.password, validar: (valor) => regex.passwordGlobal.test(valor) },
  { el: elementos.confirmarPassword, validar: (valor) => valor !== "" && valor === elementos.password.value },
];

function mostrarEstadoCampo(campo, correcto) {
  const contenedor = campo.el.closest(".mb-3, .mb-4, .admin-field");
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

// Validación progresiva idéntica a admin.js (blur e input)
campos.forEach((campo) => {
  campo.el.addEventListener("blur", () => validarCampo(campo));
  campo.el.addEventListener("input", () => {
    if (campo.el.classList.contains("is-valid") || campo.el.classList.contains("is-invalid")) {
      validarCampo(campo);
    }
  });
});

// Lógica visual de la barra de progreso y requisitos de la contraseña
function actualizarProgresoPassword(valor) {
  const evaluaciones = [
    { cumple: reglasRegexPassword.largo.test(valor), el: elementos.reqLargo },
    { cumple: reglasRegexPassword.mayuscula.test(valor), el: elementos.reqMayuscula },
    { cumple: reglasRegexPassword.minuscula.test(valor), el: elementos.reqMinuscula },
    { cumple: reglasRegexPassword.numero.test(valor), el: elementos.reqNumero },
    { cumple: reglasRegexPassword.simbolo.test(valor), el: elementos.reqSimbolo },
  ];

  let cumplidos = 0;

  evaluaciones.forEach(({ cumple, el }) => {
    if (!el) return;
    const icono = el.querySelector("i");
    el.classList.toggle("cumplido", cumple);

    if (cumple) {
      cumplidos++;
      if (icono) icono.className = "bi bi-check-circle-fill";
    } else {
      if (icono) icono.className = "bi bi-circle";
    }
  });

  const porcentaje = (cumplidos / evaluaciones.length) * 100;
  if (elementos.barraProgreso) {
    elementos.barraProgreso.style.width = `${porcentaje}%`;
    elementos.barraProgreso.className = "progress-bar";
  }

  if (elementos.textoFortaleza) {
    if (valor.length === 0) {
      elementos.textoFortaleza.textContent = "Sin definir";
      elementos.textoFortaleza.className = "strength-badge badge-neutral";
    } else if (porcentaje <= 40) {
      elementos.barraProgreso.classList.add("bg-danger");
      elementos.textoFortaleza.textContent = "Débil";
      elementos.textoFortaleza.className = "strength-badge badge-weak";
    } else if (porcentaje < 100) {
      elementos.barraProgreso.classList.add("bg-warning");
      elementos.textoFortaleza.textContent = "Media";
      elementos.textoFortaleza.className = "strength-badge badge-medium";
    } else {
      elementos.barraProgreso.classList.add("bg-success");
      elementos.textoFortaleza.textContent = "Fuerte";
      elementos.textoFortaleza.className = "strength-badge badge-strong";
    }
  }
}

// Mostrar / Ocultar contraseña con el botón del ojo
if (elementos.togglePassword) {
  elementos.togglePassword.addEventListener("click", () => {
    const esOculta = elementos.password.type === "password";
    elementos.password.type = esOculta ? "text" : "password";
    elementos.togglePassword.title = esOculta ? "Ocultar contraseña" : "Mostrar contraseña";

    if (elementos.iconoOjo) {
      elementos.iconoOjo.classList.toggle("bi-eye", !esOculta);
      elementos.iconoOjo.classList.toggle("bi-eye-slash", esOculta);
    }
  });
}

// Evento input específico para la barra de progreso de la contraseña
elementos.password.addEventListener("input", (e) => {
  actualizarProgresoPassword(e.target.value);

  // Sincronizar revalidación de confirmar contraseña si ya fue tocada
  if (elementos.confirmarPassword.value !== "" && 
     (elementos.confirmarPassword.classList.contains("is-valid") || elementos.confirmarPassword.classList.contains("is-invalid"))) {
    validarCampo(campos.find(c => c.el === elementos.confirmarPassword));
  }
});

function limpiarValidaciones() {
  campos.forEach(({ el }) => {
    el.classList.remove("is-valid", "is-invalid");
    const contenedor = el.closest(".mb-3, .mb-4, .admin-field");
    contenedor?.querySelector(".valid-feedback")?.classList.remove("d-block");
    contenedor?.querySelector(".invalid-feedback")?.classList.remove("d-block");
  });
  actualizarProgresoPassword("");
}

// Captura todos los datos del formulario para guardarlos en localStorage
function capturarDatosUsuario() {
  return {
    id: Date.now(),
    nombre: elementos.nombre.value.trim(),
    telefono: elementos.telefono.value.trim(),
    email: elementos.email.value.trim(),
    password: elementos.password.value,
    fechaRegistro: new Date().toISOString(),
  };
}

function guardarUsuario(usuario) {
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

// Manejo del envío del formulario (igual lógica que admin.js)
form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const todosValidos = campos.map(validarCampo).every(Boolean);

  if (!todosValidos) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }

  const usuario = capturarDatosUsuario();
  guardarUsuario(usuario);

  console.log("Usuario registrado y guardado en localStorage:", usuario);

  form.reset();
  limpiarValidaciones();
  
  if (elementos.password) elementos.password.type = "password";
  if (elementos.iconoOjo) elementos.iconoOjo.classList.replace("bi-eye-slash", "bi-eye");

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: "¡Registro exitoso!",
      text: "Tus datos se han guardado correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  }
});

form.addEventListener("reset", () => {
  window.setTimeout(limpiarValidaciones, 0);
});