
const form = document.getElementById("formLogin");
const CLAVE_USUARIO = "usuarioParcheGol";
const CLAVE_SESION = "sesionParcheGol";

const elementos = {
    email: document.getElementById("email"),
    password: document.getElementById("password")
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Recuperar usuario registrado
    const usuario = JSON.parse(localStorage.getItem(CLAVE_USUARIO));

    // Validar que exista un usuario
    if (!usuario) {
        alert("No hay usuarios registrados. Regístrate primero.");
        return;
    }

    // Validar correo y contraseña
    if (usuario.email !== elementos.email.value || usuario.password !== elementos.password.value) {
        alert("Correo o contraseña incorrectos.");
        return;
    }

    // Crear objeto de sesión
    const sesion = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
    };

    // Guardar sesión
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));

    // Redirigir al inicio
    window.location.href = "index.html";
});
