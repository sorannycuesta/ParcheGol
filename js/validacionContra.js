const form = document.getElementById("formRegistro");
const CLAVE_USUARIO = "usuarioParcheGol";

const reglasRegex = {
  largo: /.{8,}/,
  mayuscula: /[A-Z]/,
  minuscula: /[a-z]/,
  numero: /\d/,
  simbolo: /[@$!%*?&.#_-]/,
};

const regexGlobalPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/;

const elementos = {
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

const campos = [
  {
    el: elementos.password,
    validar: (valor) => regexGlobalPassword.test(valor),
  },
  {
    el: elementos.confirmarPassword,
    validar: (valor) => valor !== "" && valor === elementos.password.value,
  },
];

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

function actualizarProgresoPassword(valor) {
  const evaluaciones = [
    { cumple: reglasRegex.largo.test(valor), el: elementos.reqLargo },
    { cumple: reglasRegex.mayuscula.test(valor), el: elementos.reqMayuscula },
    { cumple: reglasRegex.minuscula.test(valor), el: elementos.reqMinuscula },
    { cumple: reglasRegex.numero.test(valor), el: elementos.reqNumero },
    { cumple: reglasRegex.simbolo.test(valor), el: elementos.reqSimbolo },
  ];

  let cumplidos = 0;

  evaluaciones.forEach(({ cumple, el }) => {
    const icono = el.querySelector("i");
    el.classList.toggle("cumplido", cumple);

    if (cumple) {
      cumplidos++;
      icono.className = "bi bi-check-circle-fill";
    } else {
      icono.className = "bi bi-circle";
    }
  });

  const porcentaje = (cumplidos / evaluaciones.length) * 100;
  elementos.barraProgreso.style.width = `${porcentaje}%`;
  elementos.barraProgreso.className = "progress-bar";

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

// Mostrar / Ocultar contraseña
elementos.togglePassword.addEventListener("click", () => {
  const esOculta = elementos.password.type === "password";
  elementos.password.type = esOculta ? "text" : "password";
  elementos.togglePassword.title = esOculta ? "Ocultar contraseña" : "Mostrar contraseña";

  elementos.iconoOjo.classList.toggle("bi-eye", !esOculta);
  elementos.iconoOjo.classList.toggle("bi-eye-slash", esOculta);
});

// Validación y progreso en tiempo real
elementos.password.addEventListener("input", (e) => {
  actualizarProgresoPassword(e.target.value);

  if (elementos.password.classList.contains("is-valid") || elementos.password.classList.contains("is-invalid")) {
    validarCampo(campos[0]);
  }

  if (
    elementos.confirmarPassword.value !== "" &&
    (elementos.confirmarPassword.classList.contains("is-valid") ||
      elementos.confirmarPassword.classList.contains("is-invalid"))
  ) {
    validarCampo(campos[1]);
  }
});

elementos.password.addEventListener("blur", () => validarCampo(campos[0]));

elementos.confirmarPassword.addEventListener("input", () => {
  if (
    elementos.confirmarPassword.classList.contains("is-valid") ||
    elementos.confirmarPassword.classList.contains("is-invalid")
  ) {
    validarCampo(campos[1]);
  }
});

elementos.confirmarPassword.addEventListener("blur", () => validarCampo(campos[1]));

function limpiarTodo() {
  campos.forEach(({ el }) => {
    el.classList.remove("is-valid", "is-invalid");
    const contenedor = el.closest(".admin-field");
    contenedor?.querySelector(".valid-feedback")?.classList.remove("d-block");
    contenedor?.querySelector(".invalid-feedback")?.classList.remove("d-block");
  });

  actualizarProgresoPassword("");
}

function capturarDatosUsuario() {
  const datosPrevios = JSON.parse(localStorage.getItem(CLAVE_USUARIO)) || {};
  return {
    ...datosPrevios,
    password: elementos.password.value,
    fechaActualizacion: new Date().toISOString(),
  };
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const todosValidos = campos.map(validarCampo).every(Boolean);

  if (!todosValidos) {
    form.querySelector(".is-invalid")?.focus();
    return;
  }

  const usuario = capturarDatosUsuario();
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));

  form.reset();
  limpiarTodo();
  elementos.password.type = "password";
  elementos.iconoOjo.classList.replace("bi-eye-slash", "bi-eye");

  // Si ya tienes SweetAlert2 cargado como en admin.html, puedes dar feedback visual:
  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: "¡Contraseña guardada!",
      text: "Se ha almacenado correctamente en localStorage.",
      timer: 1800,
      showConfirmButton: false,
    });
  }
});