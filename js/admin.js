const form = document.getElementById("formContacto");

const campos = [
  {
    el: document.getElementById("nombre"),
    // Letras (con tildes y ñ) y espacios, de 3 a 20 caracteres
    valido: (v) => /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]{3,20}$/.test(v),
  },
  {
    el: document.getElementById("contactanos"),
    // Exactamente 10 dígitos
    valido: (v) => /^\d{10}$/.test(v),
  },
  {
    el: document.getElementById("email"),
    // Mínimo una letra antes de la @, dominio y subdominios con letras/números/guiones,
    // y extensión final solo con letras (2 a 24)
    valido: (v) =>
      /^(?=[^@]*[A-Za-z])[\w.%+-]+@([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/.test(v),
  },
  {
    el: document.getElementById("mensaje"),
    valido: (v) => v.length >= 10 && v.length <= 500,
  },
];

function validar({ el, valido }) {
  const ok = valido(el.value.trim());
  el.classList.toggle("is-valid", ok);
  el.classList.toggle("is-invalid", !ok);

  // Muestra el mensaje que corresponde dentro del mismo bloque .mb-3
  const bloque = el.closest(".mb-3");
  bloque.querySelector(".valid-feedback").classList.toggle("d-block", ok);
  bloque.querySelector(".invalid-feedback").classList.toggle("d-block", !ok);

  return ok;
}
campos.forEach((campo) => {
  // Valida al salir del campo
  campo.el.addEventListener("blur", () => validar(campo));

  // Mientras escribe, revalida solo si ya se había validado antes
  campo.el.addEventListener("input", () => {
    if (campo.el.classList.contains("is-valid") || campo.el.classList.contains("is-invalid")) {
      validar(campo);
    }
  });
});

// El teléfono solo acepta números mientras se escribe
document.getElementById("contactanos").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  // map (y no some/every directo) para que valide y pinte TODOS los campos
  const todoOk = campos.map(validar).every(Boolean);

  if (todoOk) {
    form.submit(); // envía a Formspree con el action del form
  }
});