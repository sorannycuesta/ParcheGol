/* auth.js - Manejo de usuarios y sesión de ParcheGol (simulado con localStorage)
   Cargar ANTES que cualquier otro script que use Auth. */
const Auth = (() => {
  const CLAVE_USUARIOS = "usuariosParcheGol";
  const CLAVE_SESION = "sesionParcheGol";
  const CLAVE_PENDIENTE = "reservaPendienteParcheGol";
  const CLAVE_USUARIO_VIEJO = "usuarioParcheGol"; // la que usaba registro.js antes

  const ROL_CLIENTE = "cliente";
  const ROL_ADMIN = "administrador";

  // Destino por defecto según el rol
  const RUTAS = {
    [ROL_CLIENTE]: "index.html",
    [ROL_ADMIN]: "admin.html",
  };

  // Admin de prueba (sin backend no hay otra forma de tener uno)
  const ADMIN_INICIAL = {
    id: 1,
    nombre: "Administrador ParcheGol",
    telefono: "3000000000",
    email: "admin@parchegol.com",
    password: "Admin#2026",
    rol: ROL_ADMIN,
    fechaRegistro: "2026-01-01T00:00:00.000Z",
  };

  function leer(clave, defecto) {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : defecto;
    } catch {
      return defecto;
    }
  }

  function escribir(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  }

  function normalizarEmail(email) {
    return String(email).trim().toLowerCase();
  }

  /* ---------- Usuarios ---------- */

  function obtenerUsuarios() {
    return leer(CLAVE_USUARIOS, []);
  }

  // Crea el admin si no existe y migra el usuario viejo de registro.js
  function inicializar() {
    const usuarios = obtenerUsuarios();
    let cambio = false;

    if (!usuarios.some((u) => u.rol === ROL_ADMIN)) {
      usuarios.push(ADMIN_INICIAL);
      cambio = true;
    }

    const viejo = leer(CLAVE_USUARIO_VIEJO, null);
    if (viejo && !usuarios.some((u) => normalizarEmail(u.email) === normalizarEmail(viejo.email))) {
      usuarios.push({ ...viejo, rol: ROL_CLIENTE });
      cambio = true;
    }
    if (viejo) localStorage.removeItem(CLAVE_USUARIO_VIEJO);

    if (cambio) escribir(CLAVE_USUARIOS, usuarios);
  }

  // Lo usa registro.js. Siempre registra como cliente.
  function registrarUsuario(datos) {
    const usuarios = obtenerUsuarios();
    const email = normalizarEmail(datos.email);

    if (usuarios.some((u) => normalizarEmail(u.email) === email)) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }

    const usuario = { ...datos, email, rol: ROL_CLIENTE };
    usuarios.push(usuario);
    escribir(CLAVE_USUARIOS, usuarios);
    return { ok: true, usuario };
  }

  /* ---------- Sesión ---------- */

  function iniciarSesion(email, password) {
    const usuario = obtenerUsuarios().find((u) => normalizarEmail(u.email) === normalizarEmail(email));

    // Mismo mensaje para correo o contraseña mal: no revela cuál falló
    if (!usuario || usuario.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }

    // La sesión NO guarda la contraseña
    const sesion = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      inicio: new Date().toISOString(),
    };
    escribir(CLAVE_SESION, sesion);
    return { ok: true, sesion };
  }

  function obtenerSesion() {
    return leer(CLAVE_SESION, null);
  }

  function estaAutenticado() {
    return obtenerSesion() !== null;
  }

  function obtenerRol() {
    return obtenerSesion()?.rol ?? null; // null = visitante
  }

  function esAdmin() {
    return obtenerRol() === ROL_ADMIN;
  }

  function cerrarSesion(destino = "index.html") {
    localStorage.removeItem(CLAVE_SESION);
    localStorage.removeItem(CLAVE_PENDIENTE);
    window.location.href = destino;
  }

  /* ---------- Reserva pendiente (visitante que debe loguearse) ---------- */

  function guardarReservaPendiente(url = window.location.pathname.split("/").pop() + window.location.search) {
    sessionStorage.setItem(CLAVE_PENDIENTE, url);
  }

  function tomarReservaPendiente() {
    const url = sessionStorage.getItem(CLAVE_PENDIENTE);
    sessionStorage.removeItem(CLAVE_PENDIENTE);
    return url;
  }

  /* ---------- Redirección ---------- */

  function rutaPorRol(rol) {
    return RUTAS[rol] ?? "index.html";
  }

  // Después del login: si había una reserva pendiente va ahí (solo clientes), si no al destino del rol
  function redirigirSegunRol() {
    const rol = obtenerRol();
    if (!rol) {
      window.location.href = "login.html";
      return;
    }
    const pendiente = rol === ROL_CLIENTE ? tomarReservaPendiente() : null;
    window.location.href = pendiente || rutaPorRol(rol);
  }

  /* ---------- Guards de página ---------- */

  // Páginas solo para admin:  Auth.protegerPagina([Auth.ROL_ADMIN])
  // Páginas que exigen sesión (ej. reservar): Auth.protegerPagina()  -> cualquier rol logueado
  function protegerPagina(rolesPermitidos = null) {
    const rol = obtenerRol();

    if (!rol) {
      guardarReservaPendiente();
      document.documentElement.style.display = "none"; // evita que se vea el contenido
      window.location.replace("login.html");
      return false;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
      document.documentElement.style.display = "none";
      window.location.replace(rutaPorRol(rol));
      return false;
    }
    return true;
  }

  // Para login/registro: si ya hay sesión no tiene sentido mostrarlos
  function redirigirSiAutenticado() {
    if (estaAutenticado()) {
      window.location.replace(rutaPorRol(obtenerRol()));
    }
  }

  inicializar();

  return {
    ROL_CLIENTE,
    ROL_ADMIN,
    obtenerUsuarios,
    registrarUsuario,
    iniciarSesion,
    cerrarSesion,
    obtenerSesion,
    obtenerRol,
    estaAutenticado,
    esAdmin,
    guardarReservaPendiente,
    redirigirSegunRol,
    protegerPagina,
    redirigirSiAutenticado,
  };
})();