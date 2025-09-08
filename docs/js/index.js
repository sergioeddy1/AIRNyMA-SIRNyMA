  // Script para el navbar
            document.addEventListener("DOMContentLoaded", function () {
                const currentPath = window.location.pathname.split("/").pop();
                const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

                navLinks.forEach(link => {
                const href = link.getAttribute("href");
                if (href === currentPath) {
                    link.classList.add("active");
                }
                });
            });
                        
            // Script para el Contenedor de temas de interes
            document.querySelectorAll('.tab-item').forEach(item => {
                item.addEventListener('click', () => {
                // Activar tab
                document.querySelectorAll('.tab-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Mostrar contenido
                const target = item.getAttribute('data-target');
                document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
                document.getElementById(target).classList.add('active');
                });
            });

            document.addEventListener("DOMContentLoaded", function () {
               

                // Obtener la URL actual
                const currentPage = window.location.pathname.split("/").pop();

                // Seleccionar todos los enlaces del nav-bar
                const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

                // Recorrer los enlaces y agregar la clase 'active' al enlace correspondiente
                navLinks.forEach(link => {
                    if (link.getAttribute("href") === currentPage) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            });

            document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.getElementById("searchInput");
  const container = document.getElementById("variablesContainer");
  // Trata de encontrar el contenedor de paginación (ajusta el id si es distinto)
  const paginationContainer =
    document.getElementById("paginationContainer") ||
    document.getElementById("pagination");

  // Usa las globales si ya las tienes; si no, asigna valores por defecto
  window.itemsPerPage = typeof itemsPerPage === 'number' ? itemsPerPage : 12;
  window.currentPage  = typeof currentPage  === 'number' ? currentPage  : 1;

  let allData = [];

  // ---- Helpers de render inline (sin renderPage) ----
  function renderListInline(data, page) {
    if (!container) return;
    if (!Array.isArray(data)) {
      container.innerHTML = "<p class='text-center text-muted'>Sin datos.</p>";
      return;
    }

    const start = (page - 1) * itemsPerPage;
    const slice = data.slice(start, start + itemsPerPage);

    // 🔧 Ajusta el template según tu diseño real (cards, rows, etc.)
    container.innerHTML = slice.map(v => `
      <div class="card mb-2">
        <div class="card-body">
          <h6 class="mb-1">${v.nomVar ?? '(sin nombre)'}</h6>
          <div class="text-muted small">${v.varAsig ?? ''}</div>
          <p class="mb-0">${v.defVar ?? ''}</p>
        </div>
      </div>
    `).join('') || "<p class='text-center text-muted'>No hay elementos para mostrar.</p>";
  }

  // ---- Carga inicial ----
  async function loadAllVariables() {
    try {
      const response = await fetch(`https://invision-comparing-cheap-construct.trycloudflare.com/api/variables`);
      const data = await response.json();
      allData = Array.isArray(data) ? data : [];

      const urlParams = new URLSearchParams(window.location.search);
      const searchTerm = urlParams.get("search");

      if (searchTerm) {
        if (searchInput) searchInput.value = searchTerm;
        searchVariables(searchTerm); // <-- si tienes esta función implementada
      } else {
        // ✅ sin renderPage: render inline + paginación
        renderListInline(allData, currentPage);
        if (typeof setupPagination === 'function' && paginationContainer) {
          setupPagination(allData);
        }
      }
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      if (container) {
        container.innerHTML = "<p class='text-center text-danger'>Ocurrió un error al cargar los datos. Inténtalo nuevamente.</p>";
      }
    }
    addLiveSearch();
  }

  // ---- Búsqueda en vivo ----
  function addLiveSearch() {
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      const term = searchInput.value.trim().toLowerCase();

      if (!term) {
        currentPage = 1;
        renderListInline(allData, currentPage);
        if (typeof setupPagination === 'function' && paginationContainer) {
          setupPagination(allData);
        }
        return;
      }

      const filtered = allData.filter(variable =>
        (variable.nomVar || '').toLowerCase().includes(term) ||
        (variable.defVar || '').toLowerCase().includes(term) ||
        (variable.varAsig || '').toLowerCase().includes(term)
      );

      currentPage = 1;

      if (!filtered.length) {
        if (container) container.innerHTML = "<p class='text-center'>No se encontraron resultados para el término ingresado.</p>";
        if (paginationContainer) paginationContainer.innerHTML = "";
      } else {
        renderListInline(filtered, currentPage);
        if (typeof setupPagination === 'function' && paginationContainer) {
          setupPagination(filtered);
        }
      }
    });
  }

  // ---- Form de búsqueda (no anidar otro DOMContentLoaded) ----
  const searchForm = document.getElementById('searchForm');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `variables.html?search=${encodeURIComponent(q)}`;
      }
    });
  }

  // Ejecuta
  loadAllVariables();
});


       
 document.getElementById("navbarSearchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const searchTerm = document.getElementById("searchInput").value.trim();
  if (searchTerm) {
    window.location.href = `variables.html?search=${encodeURIComponent(searchTerm)}`;
  }
});