/* login.js - Lógica del formulario de inicio de sesión */
Auth.redirigirSiAutenticado();

const formLogin = document.getElementById("formLogin");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const btnOjo = document.getElementById("togglePassword");
const iconoOjo = document.getElementById("iconoOjo");
const mensajeLogin = document.getElementById("mensajeLogin");

const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function marcar(input, correcto) {
  input.classList.toggle("is-valid", correcto);
  input.classList.toggle("is-invalid", !correcto);
  return correcto;
}

function validarEmail() {
  return marcar(inputEmail, regexEmail.test(inputEmail.value.trim()));
}

function validarPassword() {
  return marcar(inputPassword, inputPassword.value !== "");
}

function mostrarError(texto) {
  mensajeLogin.textContent = texto;
  mensajeLogin.classList.remove("d-none");
}

function ocultarError() {
  mensajeLogin.classList.add("d-none");
}

inputEmail.addEventListener("blur", validarEmail);
inputPassword.addEventListener("blur", validarPassword);
[inputEmail, inputPassword].forEach((el) => el.addEventListener("input", ocultarError));

btnOjo.addEventListener("click", () => {
  const oculta = inputPassword.type === "password";
  inputPassword.type = oculta ? "text" : "password";
  btnOjo.title = oculta ? "Ocultar contraseña" : "Mostrar contraseña";
  iconoOjo.classList.toggle("bi-eye", !oculta);
  iconoOjo.classList.toggle("bi-eye-slash", oculta);
});

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  ocultarError();

  const emailOk = validarEmail();
  const passOk = validarPassword();
  if (!emailOk || !passOk) {
    formLogin.querySelector(".is-invalid")?.focus();
    return;
  }

  const resultado = Auth.iniciarSesion(inputEmail.value, inputPassword.value);

  if (!resultado.ok) {
    mostrarError(resultado.error);
    inputPassword.value = "";
    inputPassword.focus();
    return;
  }

  const nombre = resultado.sesion.nombre.split(" ")[0];

  if (typeof Swal !== "undefined") {
    Swal.fire({
      icon: "success",
      title: `¡Hola, ${nombre}!`,
      timer: 1200,
      showConfirmButton: false,
    }).then(() => Auth.redirigirSegunRol());
  } else {
    Auth.redirigirSegunRol();
  }
});