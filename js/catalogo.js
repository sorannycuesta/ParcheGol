const CLAVE_CANCHA = "canchasParcheGol";
const contenedorCatalogo = document.getElementById("contenedorCatalogo");
const estadoVacio = document.getElementById("estadoVacioCatalogo");
const contadorCatalogo = document.getElementById("contadorCatalogo");

function cargarCatalogoPublico() {
  // Con esto se lee el localStorage con JSON.parse (si no hay nada, devuelve array vacío)
  const canchasGuardadas = JSON.parse(localStorage.getItem(CLAVE_CANCHA)) || [];

  // Actualizamos el badge del contador superior para la cantidad de la canchas
  if (contadorCatalogo) {
    contadorCatalogo.textContent = `🟢 ${canchasGuardadas.length} ${canchasGuardadas.length === 1 ? "cancha" : "canchas"} disponibles`;
  }

  // Validamos si está vacío
  if (canchasGuardadas.length === 0) {
    contenedorCatalogo.innerHTML = "";
    if (estadoVacio) estadoVacio.style.display = "block";
      return;
  }

  if (estadoVacio) estadoVacio.style.display = "none";
  contenedorCatalogo.innerHTML = "";

  // Recorremos cada cancha registrada y armamos su card
  canchasGuardadas.forEach((cancha) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    // Convertimos los servicios booleanos de objeto a una lista de badges
    const serviciosHTML = Object.entries(cancha.servicios || {})
      .filter(([, incluido]) => incluido)
      .map(([servicio]) => {
        const nombresServicios = {
          hidratacion: "Hidratación",
          petos: "Petos incluidos",
          balones: "Balones"
        };
        return `<span class="badge bg-info bg-opacity-25 text-info border border-info small">✓ ${nombresServicios[servicio] || servicio}</span>`;
      }).join(" ");

    col.innerHTML = `
      <div class="card text-white border border-secondary h-100 shadow-sm bg-dark">
        <div class="position-relative">
          <img src="${cancha.imagen}" class="card-img-top" alt="Fotografía de ${cancha.titulo}" style="height: 180px; object-fit: cover;">
          <span class="badge bg-dark position-absolute top-0 start-0 m-2">${cancha.categoria}</span>
          <span class="badge bg-success position-absolute top-0 end-0 m-2">🟢 Libre</span>
        </div>
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title fw-bold">${cancha.titulo}</h5>
            <p class="small text-white mb-2">⚽ ${cancha.descripcion}</p>
            <p class="small text-white mb-2"><i class="bi bi-clock me-1"></i> Horario: ${cancha.disponibilidad.horaInicio} - ${cancha.disponibilidad.horaFin}</p>
            <div class="d-flex flex-wrap gap-1 mb-3">
              ${serviciosHTML || '<span class="text-muted small">Sin servicios extra</span>'}
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center border-top border-secondary pt-3 mt-auto">
            <div>
              <a href="${cancha.enlaceMaps}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-light btn-sm">
                <i class="bi bi-geo-alt"></i> Ver mapa
              </a>
            </div>
            <button class="btn btn-info fw-semibold px-4 text-dark" onclick="alert('Redirigiendo a reserva para: ${cancha.titulo}')">
              Reservar
            </button>
          </div>
        </div>
      </div>
    `;

    contenedorCatalogo.appendChild(col);
  });
}

// Se ejecuta automáticamente al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarCatalogoPublico();
});