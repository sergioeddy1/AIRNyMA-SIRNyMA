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
                const searchInput = document.getElementById("searchInput"); // Campo de búsqueda (si existe en la página)
                const container = document.getElementById("variablesContainer"); // Contenedor de resultados

                let allData = []; // Almacena todos los datos cargados inicialmente

                // Función para cargar todos los elementos al entrar a la página
                async function loadAllVariables() {
                    try {
                        const response = await fetch(`/api/variables`);
                        const data = await response.json();
                        allData = data; // Guardar todos los datos para restaurar el listado inicial

                        // Capturar el término de búsqueda de la URL
                        const urlParams = new URLSearchParams(window.location.search);
                        const searchTerm = urlParams.get("search");

                        if (searchTerm) {
                            // Si hay un término de búsqueda, realizar la búsqueda
                            if (searchInput) searchInput.value = searchTerm; // Mostrar el término en el campo de búsqueda (si existe)
                            searchVariables(searchTerm);
                        } else {
                            // Si no hay término de búsqueda, mostrar todos los datos
                            renderPage(allData, currentPage);
                            setupPagination(allData);
                        }
                    } catch (error) {
                        console.error("Error al cargar los datos:", error);
                        container.innerHTML = "<p class='text-center text-danger'>Ocurrió un error al cargar los datos. Inténtalo nuevamente.</p>";
                    }
                    addLiveSearch();
                }

                searchForm.addEventListener("submit", function (e) {
                  e.preventDefault();
                  const searchTerm = searchInput.value.trim();
                  if (searchTerm) {
                      window.location.href = `variables.html?search=${encodeURIComponent(searchTerm)}`;
                  }
            });

                // Función para realizar la búsqueda
                function addLiveSearch() {
                  if (!searchInput) return;

                  searchInput.addEventListener("input", () => {
                      const term = searchInput.value.trim().toLowerCase();

                      if (!term) {
                          renderPage(allData, 1);
                          setupPagination(allData);
                          return;
                      }

                      const filteredData = allData.filter(variable =>
                          variable.nomVar.toLowerCase().includes(term) ||
                          variable.defVar.toLowerCase().includes(term) ||
                          variable.varAsig.toLowerCase().includes(term)
                      );

                      currentPage = 1;

                      if (filteredData.length === 0) {
                          container.innerHTML = "<p class='text-center'>No se encontraron resultados para el término ingresado.</p>";
                          paginationContainer.innerHTML = "";
                      } else {
                          renderPage(filteredData, currentPage);
                          setupPagination(filteredData);
                      }
                  });
              }
                
                // Cargar todos los elementos al entrar a la página
                loadAllVariables();
            });

       
 document.getElementById("navbarSearchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const searchTerm = document.getElementById("searchInput").value.trim();
  if (searchTerm) {
    window.location.href = `variables.html?search=${encodeURIComponent(searchTerm)}`;
  }
});