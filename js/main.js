// 1. Los datos de los botones viven en un array.
//    Para agregar un botón nuevo, solo añades una línea aquí.
const LINKS = [
    { href: "index.html",          icono: "fa-house",        label: "Inicio" ,  descripcion: "Vuelve a la página principal"},
    { href: "sobre-nosotros.html", icono: "fa-users-rays",   label: "Sobre nosotros" ,  descripcion: "Conoce más sobre nosotros"},
    { href: "contactanos.html",    icono: "fa-address-book", label: "Contáctanos",  descripcion: "Aquí puedes contactarnos"},
];

/* Webcomponent sidebar */
class AppSidebar extends HTMLElement {
    connectedCallback() {
        // 2. Nombre del archivo actual. Si está vacío (ruta "/"), es el inicio.
        const actual = location.pathname.split("/").pop() || "index.html";

        // 3. Con .map() convertimos cada objeto en un <li>
        const items = LINKS.map(({ href, icono, label, descripcion }) => `
            <li>
                <a class="link_nav" href="${href}" data-tooltip="${descripcion}" aria-label="${label}"
                   ${href === actual ? 'aria-current="page"' : ""}>
                    <i class="fa-solid ${icono}"></i>
                </a>
            </li>
        `).join("");

        // 4. Pintamos la sidebar
        this.innerHTML = `

            
            <nav class="nav_flotante" aria-label="Navegación principal">
                <ul class="ul_nav">
                    ${items}
                    <li>
                        <button class="link_nav btn_orientacion" type="button"
                         data-tooltip="Mueve la barra al otro lado"
                         aria-label="Cambiar orientación">
                            <i class="fa-solid fa-arrows-rotate"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        `;

        // 5. Orientación: recordar la elección y cambiarla con el botón
       const nav = this.querySelector(".nav_flotante");

if (localStorage.getItem("sidebar-lado") === "derecha") {
    nav.classList.add("derecha");
}

this.querySelector(".btn_orientacion").addEventListener("click", () => {
    const derecha = nav.classList.toggle("derecha");
    localStorage.setItem("sidebar-lado", derecha ? "derecha" : "izquierda");
});
    }
}
customElements.define("app-sidebar", AppSidebar);

/* Webcomponent navbar */


class AppNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="nav-movil">
        <div class="nav-movil__bar">
          <a href="index.html" class="nav-movil__brand">
            <img src="img/pelota-de-futbol.png" alt="Logo ParcheGol" width="36" height="36">
            <span>ParcheGol</span>
          </a>
          <button class="nav-movil__toggle" type="button"
                  data-bs-toggle="offcanvas" data-bs-target="#menuLateral"
                  aria-controls="menuLateral" aria-label="Abrir menú">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </header>

      <div class="offcanvas offcanvas-end oc-menu" tabindex="-1"
           id="menuLateral" aria-labelledby="menuLateralLabel">
        <div class="offcanvas-header">
          <h2 class="oc-titulo" id="menuLateralLabel">
            <img src="img/pelota-de-futbol.png" alt="" width="32" height="32">
            ParcheGol
          </h2>
          <button type="button" class="btn-close btn-close-white"
                  data-bs-dismiss="offcanvas" aria-label="Cerrar menú"></button>
        </div>

        <div class="offcanvas-body">
          <nav aria-label="Menú principal">

            <section class="oc-grupo">
              <h3 class="oc-grupo__titulo">Principal</h3>
              <ul class="oc-lista">
                <li><a class="oc-link" href="index.html" data-page="index.html">
                  <i class="fa-solid fa-house"></i><span>Inicio</span></a></li>
                <li><a class="oc-link" href="sobre-nosotros.html" data-page="sobre-nosotros.html">
                  <i class="fa-solid fa-circle-info"></i><span>Acerca de nosotros</span></a></li>
                <li><a class="oc-link" href="contactanos.html" data-page="contactanos.html">
                  <i class="fa-solid fa-envelope"></i><span>Contáctanos</span></a></li>
              </ul>
            </section>

            <!-- PLANTILLA PARA UNA NUEVA CATEGORÍA: copia desde aquí
            <section class="oc-grupo">
              <h3 class="oc-grupo__titulo">Nombre de la categoría</h3>
              <ul class="oc-lista">
                <li><a class="oc-link" href="pagina.html" data-page="pagina.html">
                  <i class="fa-solid fa-star"></i><span>Texto del enlace</span></a></li>
              </ul>
            </section>
            hasta aquí -->

          </nav>
        </div>
      </div>
    `;

    // Marca como activo el enlace de la página actual
    const actual = location.pathname.split('/').pop() || 'index.html';
    this.querySelectorAll('.oc-link').forEach(link => {
      if (link.dataset.page === actual) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }
}

customElements.define('app-navbar', AppNavbar);


/* Webcomponent footer */

class AppFooter extends HTMLElement {
    connectedCallback() {
        /* pintar el footer */
        this.innerHTML = `
           <footer>
    <div class="container-foot">
      <div class="row-foot">
        <div class="col-foot" id="company">
          <img src="img/pelota-de-futbol.png" alt="logo parcheGol" class="logo">
          <p>Conectamos a los amantes del fútbol con su pasión por el juego, facilitamos la prática del fútbol en los barrios. Reserva ahora!</p>
          <div class="copy">
            <p><small>&copy; 2026 ParcheGol. Todos los derechos reservados.
              </small></p>
          </div>
        </div>
        <div class="col-foot" id="useful-links">
          <h3 class="h3-foot">Links</h3>
          <div class="links">
            <a class="foot-link" href="index.html">Home</a>
            <a class="foot-link" href="sobre-nosotros.html">Acerca de nosotros</a>
            <a class="foot-link" href="contactanos.html">Contactanos</a>
          </div>
        </div>
        <div class="col-foot" id="contact">
          <h3 class="h3-foot">Contacto</h3>
          <div class="links">
            <a class="foot-link" href="https://github.com/JEPH204" target="_blank"><i class="fa-brands fa-github-alt"></i>JEPH204</a>
            <a class="foot-link" href="https://github.com/LuisaFersanchez08" target="_blank"><i
                class="fa-brands fa-github-alt"></i>LuisaFersanchez08</a>
            <a class="foot-link" href="https://github.com/MrD3kro" target="_blank"><i class="fa-brands fa-github-alt"></i>MrD3kro</a>
            <a class="foot-link" href="https://github.com/sorannycuesta" target="_blank"><i
                class="fa-brands fa-github-alt"></i>sorannycuesta</a>
            <a class="foot-link" href="https://github.com/Valencia0911" target="_blank"><i
                class="fa-brands fa-github-alt"></i>Valencia0911</a>
          </div>

        </div>
      </div>
    </div>
  </footer>
        `;
    }
}

customElements.define("app-footer", AppFooter);


document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("formContacto");

    function esSoloNumeros(texto) {
        if (texto === "") return false;

        for (let i = 0; i < texto.length; i++) {
            let caracter = texto[i];
            if (caracter < '0' || caracter > '9') {
                return false;
            }
        }
        return true;
    }

    
});


