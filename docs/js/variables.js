document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const container = document.getElementById("variablesContainer");
    const paginationContainer = document.getElementById("pagination");
    const processSelect = document.getElementById("processSelect");
    const temaSelect = document.getElementById("temaSelect"); // AÑADE ESTA LÍNEA SI NO LA TIENES
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const itemsPerPageSelect = document.getElementById("itemsPerPage"); // Selector de elementos por página
    const unidadSection = document.getElementById("unidadAdministrativaSection");
    const params = new URLSearchParams(window.location.search); // Obtener los parámetros de la URL
    const idPpParam = params.get("idPp"); // Obtener el valor del parámetro idPp
    const sortSelect = document.getElementById("sortOptions"); // Selector de ordenación
    const alinMdeaCheckbox = document.getElementById("alinMdeaCheckbox");
    const alinOdsCheckbox = document.getElementById("alinOdsCheckbox");
    

    let itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Número de elementos por página
    let currentPage = 1; // Página actual
    let procesosGlobal = [];
let allData = [];
let currentFilteredData = [];


// Llenar el select de procesos y aplicar filtro inicial si hay idPp en la URL
fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/proceso")
  .then(response => response.json())
  .then(data => {
    procesosGlobal = data;
    data.forEach(proc => {
      const option = document.createElement("option");
      option.value = proc.idPp;
      option.textContent = `• ${proc.pp} (${proc.idPp})`;
      processSelect.appendChild(option);
    });

    // Ahora carga las variables
    fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/variables")
      .then(response => response.json())
      .then(variables => {
        allData = variables;
        const urlParams = new URLSearchParams(window.location.search);
        const selectedIdPp = urlParams.get("idPp");

        if (selectedIdPp) {
          // Selecciona el proceso en el select
          Array.from(processSelect.options).forEach(option => {
            option.selected = option.value === selectedIdPp;
          });
          // Filtra y muestra solo las variables de ese proceso
          const filteredData = allData.filter(variable => variable.idPp === selectedIdPp);
          currentFilteredData = filteredData;
          renderPage(currentFilteredData, 1);
          setupPagination(currentFilteredData);
          updateVariableCounter(filteredData.length);
        } else {
          // Si no hay filtro, muestra todo
          currentFilteredData = allData;
          renderPage(allData, 1);
          setupPagination(allData);
          updateVariableCounter(allData.length);
        }
      });
  });

// Listener para cambios manuales en el select
processSelect.addEventListener("change", function () {
  const selectedOptions = Array.from(this.selectedOptions);
  const selectedValues = selectedOptions.map(opt => opt.value);

  checkMostrarUnidadSection();

  if (selectedValues.length === 0) {
    currentFilteredData = allData;
    renderPage(allData, 1);
    setupPagination(allData);
    updateVariableCounter(allData.length);
    return;
  }

  const filteredData = allData.filter(variable => selectedValues.includes(variable.idPp));
  currentFilteredData = filteredData;
  renderPage(currentFilteredData, 1);
  setupPagination(currentFilteredData);
  updateVariableCounter(filteredData.length);
});

    // Referencias a los checkboxes
const relTabCheckbox = document.getElementById("relTabCheckbox");
const relMicroCheckbox = document.getElementById("relMicroCheckbox");

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

// Función para filtrar por periodo de tiempo 
function populatePeriodFilters() {
  const periodInic = document.getElementById("periodInic");
  const periodFin = document.getElementById("periodFin");

  const yearsSet = new Set();

  allData.forEach(variable => {
    const startYear = parseInt(variable.vigInicial);
    const endRaw = variable.vigFinal;
    const endYear = endRaw.includes("A la fecha") ? new Date().getFullYear() : parseInt(endRaw);

    if (!isNaN(startYear)) yearsSet.add(startYear);
    if (!isNaN(endYear)) yearsSet.add(endYear);
  });

  const sortedYears = Array.from(yearsSet).sort((a, b) => a - b);

  // Agregar las opciones
  sortedYears.forEach(year => {
    const option1 = new Option(year, year);
    const option2 = new Option(year, year);
    periodInic.appendChild(option1);
    periodFin.appendChild(option2);
  });
}

// Función principal de filtrado
function filterByRelation() {
    let filtered = allData;

    const selectedStart = parseInt(document.getElementById("periodInic").value);
    const selectedEnd = parseInt(document.getElementById("periodFin").value);

//Filtro de periodo de tiempo
    if (!isNaN(selectedStart) && !isNaN(selectedEnd)) {
    filtered = filtered.filter(variable => {
        const varStart = parseInt(variable.vigInicial);
        let varEnd = variable.vigFinal.includes("A la fecha") ? new Date().getFullYear() : parseInt(variable.vigFinal);

        // Validación doble por seguridad
        if (isNaN(varStart) || isNaN(varEnd)) return false;

        return varStart <= selectedEnd && varEnd >= selectedStart;
    });
    }

    // Filtro de relación temática
    if (relTabCheckbox?.checked || relMicroCheckbox?.checked) {
        filtered = filtered.filter(variable => {
            const matchRelTab = relTabCheckbox?.checked ? variable.relTab === "Sí" : true;
            const matchRelMicro = relMicroCheckbox?.checked ? variable.relMicro === "Sí" : true;
            return matchRelTab && matchRelMicro;
        });
    }

    // Filtro de alineación con MDEA y ODS
    if (alinMdeaCheckbox?.checked || alinOdsCheckbox?.checked) {
        filtered = filtered.filter(variable => {
            const matchMdea = alinMdeaCheckbox?.checked ? variable.alinMdea === "Sí" : true;
            const matchOds = alinOdsCheckbox?.checked ? variable.alinOds === "Sí" : true;
            return matchMdea && matchOds;
        });
    }

    // Mostrar resultados
    currentFilteredData = filtered;
    currentPage = 1;
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);
}

// Escuchar cambios en TODOS los checkboxes
relTabCheckbox?.addEventListener("change", filterByRelation);
relMicroCheckbox?.addEventListener("change", filterByRelation);
alinMdeaCheckbox?.addEventListener("change", filterByRelation);
alinOdsCheckbox?.addEventListener("change", filterByRelation);

// Si tienes un formulario de búsqueda también, combínalo con este filtrado
searchForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    filterByRelation(); // Aquí podrías combinar también texto de búsqueda
});


    //Mostrar y ocultar seccion de filtros Unidad administrativa dependiendo de condicional 
    function checkMostrarUnidadSection() {
    const procesoValido = processSelect.value && processSelect.value !== "Seleccione un proceso de producción";
    const temaValido = temaSelect.value && temaSelect.value !== "Seleccione una temática";

    if (procesoValido && temaValido) {
        unidadSection.style.display = "block";
    } else {
        unidadSection.style.display = "none";
    }
    }


// Llenar dinámicamente el select desde https://jones-investors-participant-behaviour.trycloudflare.com/api/proceso
fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/proceso")
  .then(response => response.json())
  .then(data => {
    procesosGlobal = data;
    data.forEach(proc => {
      const option = document.createElement("option");
      option.value = proc.idPp;
      option.textContent = `• ${proc.pp} (${proc.idPp})`;
      processSelect.appendChild(option);
    });

processSelect.addEventListener("mousedown", function (e) {
  e.preventDefault();
  const option = e.target;
  option.selected = !option.selected;
  processSelect.dispatchEvent(new Event("change"));
});

    // Aquí ya está listo el select, ahora puedes verificar si hay idPp en la URL
    aplicarFiltroDesdeURL(); // <== Agrega esta línea aquí
  })
  .catch(error => console.error("Error al cargar procesos:", error));

// Cargar todas las variables
fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/variables")
  .then(response => response.json())
  .then(data => {
    allData = data;
    // Solo aplicar filtro desde URL o mostrar todo si no hay filtro
    aplicarFiltroDesdeURL();
  });

// Función que aplica el filtro si hay idPp en la URL
function aplicarFiltroDesdeURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedIdPp = urlParams.get("idPp");

  if (selectedIdPp) {
    const interval = setInterval(() => {
      if (processSelect.options.length > 0 && allData.length > 0) {
        clearInterval(interval);

        // Solo selecciona si no está ya seleccionado
        Array.from(processSelect.options).forEach(option => {
          if (option.value === selectedIdPp && !option.selected) {
            option.selected = true;
          }
        });

        processSelect.dispatchEvent(new Event("change"));
      }
    }, 100);
  } else {
    renderPage(allData, 1);
    setupPagination(allData);
    updateVariableCounter(allData.length);
  }
}

// Escuchar cambios manuales del usuario en el select
processSelect.addEventListener("change", function () {
  const selectedOptions = Array.from(this.selectedOptions);
  const selectedValues = selectedOptions.map(opt => opt.value);

  // Mostrar tags arriba
  renderSelectedTags(selectedOptions);

  checkMostrarUnidadSection();

  if (selectedValues.length === 0) {
    renderPage(allData, 1);
    setupPagination(allData);
    updateVariableCounter(allData.length);
    return;
  }

  const filteredData = allData.filter(variable => selectedValues.includes(variable.idPp));

  if (filteredData.length === 0) {
    container.innerHTML = "<p class='text-center'>No hay variables para los procesos seleccionados.</p>";
    paginationContainer.innerHTML = "";
    updateVariableCounter(0);
    return;
  }

  currentPage = 1;
  currentFilteredData = filteredData;
  renderPage(currentFilteredData, currentPage);
  setupPagination(currentFilteredData);
  updateVariableCounter(filteredData.length);
});

 // Renderizar las etiquetas de los procesos seleccionados
 function renderSelectedTags(selectedOptions) {
  const container = document.getElementById("processSelectContainer");
  container.innerHTML = ""; // Limpiar primero

  // Usar un Set para evitar duplicados
  const seen = new Set();

  selectedOptions.forEach(option => {
    if (seen.has(option.value)) return; // Si ya existe, no lo agregues
    seen.add(option.value);

    const tag = document.createElement("div");
    tag.className = "badge bg-primary d-flex align-items-center";
    tag.style.paddingRight = "0.5rem";

    const text = document.createElement("span");
    text.textContent = option.textContent;
    text.style.marginRight = "0.5rem";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close btn-close-white btn-sm";
    closeBtn.setAttribute("aria-label", "Eliminar");
    closeBtn.onclick = () => {
      option.selected = false;
      processSelect.dispatchEvent(new Event("change"));
    };

    tag.appendChild(text);
    tag.appendChild(closeBtn);
    container.appendChild(tag);
  });
}
    
    // Filtrado por temática
    temaSelect.addEventListener("change", function () {
        const selectedValue = this.value;
        checkMostrarUnidadSection()
        if (!selectedValue || selectedValue === "Seleccione una temática") {
            renderPage(allData, 1);
            setupPagination(allData);
            return;
        }

        // Filtrar por coincidencia exacta en tema o tema2
        const filteredData = allData.filter(variable =>
            variable.tema === selectedValue || variable.tema2 === selectedValue
        );

        if (filteredData.length === 0) {
            container.innerHTML = "<p class='text-center'>No hay variables para la temática seleccionada.</p>";
            paginationContainer.innerHTML = "";
            return;
        }

        currentPage = 1;
            currentFilteredData = filteredData;
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);

    });
    

  /* Funcionalidad para borrar filtros */
  clearFiltersBtn.addEventListener("click", function () {
    // Limpiar campos de texto y selects
    searchInput.value = "";
    temaSelect.selectedIndex = 0;
    itemsPerPageSelect.selectedIndex = 0;
    sortSelect.selectedIndex = 0;

    // Limpiar select múltiple de procesos
    Array.from(processSelect.options).forEach(option => option.selected = false);

    // Limpiar chips visuales de procesos seleccionados
    const chipsContainer = document.getElementById("processSelectContainer");
    if (chipsContainer) chipsContainer.innerHTML = "";

    // Limpiar checkboxes
    relTabCheckbox.checked = false;
    relMicroCheckbox.checked = false;
    alinMdeaCheckbox.checked = false;
    alinOdsCheckbox.checked = false;

    // Limpiar selects de periodo
    const periodInic = document.getElementById("periodInic");
    const periodFin = document.getElementById("periodFin");
    if (periodInic) periodInic.selectedIndex = 0;
    if (periodFin) periodFin.selectedIndex = 0;

    // Ocultar sección de unidad administrativa
    if (unidadSection) unidadSection.style.display = "none";

    // Reiniciar datos y paginación
    currentPage = 1;
    currentFilteredData = [...allData];
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);
    updateVariableCounter(allData.length);

    // Eliminar parámetros de la URL sin recargar
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
});


    //Fetch para cargar los datos de proceso
    fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/proceso")
    .then(res => res.json())
    .then(data => {
        allData = data;
        populatePeriodFilters(); // llena los selects con los años
        filterByRelation();      // muestra los datos iniciales si deseas
    });

    // Función para cargar todos los elementos al entrar a la página
    async function loadAllVariables() {
    try {
        const response = await fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/variables');
        const data = await response.json();
        allData = data;
        currentFilteredData = [...allData];

        renderPage(currentFilteredData, currentPage);
        setupPagination(currentFilteredData);
        updateVariableCounter(allData.length);

        if (idPpParam) {
            processSelect.value = `proc${idPpParam}`;
            applyFilters();
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        container.innerHTML = "<p class='text-center text-danger'>Ocurrió un error al cargar los datos. Inténtalo nuevamente.</p>";
    }
}

// Buscar variables por término ingresado
function searchVariables(term) {
    if (!term) {
        renderPage(allData, currentPage);
        setupPagination(allData);
        return;
    }

    const termLower = term.toLowerCase();
    const filteredData = allData.filter(variable =>
        variable.nomVar.toLowerCase().includes(termLower) ||
        variable.defVar.toLowerCase().includes(termLower) ||
        variable.varAsig.toLowerCase().includes(termLower)
    );

    if (filteredData.length === 0) {
        container.innerHTML = "<p class='text-center'>No se encontraron resultados para el término ingresado.</p>";
        paginationContainer.innerHTML = "";
        return;
    }

    currentFilteredData = filteredData;
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);
}

// Actualizar el número total de variables mostradas
function updateVariableCounter(count) {
    const totalVariablesElement = document.getElementById('totalVariables');
    const current = parseInt(totalVariablesElement.textContent.replace(/,/g, '')) || 0;
    const duration = 1000; // Duración de la animación en ms
    const frameRate = 100;
    const totalFrames = Math.round(duration / (2000 / frameRate));
    let frame = 0;

    if (current === count) return;

    const step = (count - current) / totalFrames;

    function animate() {
        frame++;
        const value = Math.round(current + step * frame);
        // Mostrar el número con separador de miles
        totalVariablesElement.textContent = value.toLocaleString('en-US');
        if (frame < totalFrames) {
            requestAnimationFrame(animate);
        } else {
            totalVariablesElement.textContent = count.toLocaleString('en-US');
        }
    }
    animate();
}

// Funcion para la linea de tiempo 
let eventosGlobal = []; // Aquí almacenamos los eventos una sola vez

// 1. Cargar eventos antes de llamar a renderPage
fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/eventos')
  .then(res => res.json())
  .then(eventos => {
    eventosGlobal = eventos; // Guardamos todos los eventos en la variable global
    fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/variables')
      .then(res => res.json())
      .then(variables => {
        renderPage(variables, 1); // Llamamos a tu renderPage ya adaptada
      });
  });

const construirLineaDeTiempo = (eventos) => {
  eventos.sort((a, b) => parseInt(a.evento) - parseInt(b.evento));
  return `
    <ul class="timeline" id="timeline">
      ${eventos.map(evento => `
        <li class="li complete d-flex flex-column align-items-center">
          <div class="timestamp mb-2">
            <span class="date mb-2"> <a href="${evento.fuenteIden}" target="_blank" class="text-decoration-none">${evento.evento}</a></span>
          </div>
          <div class="status text-center"></div>
        </li>
      `).join('')}
    </ul>
  `;
};

function renderPage(data, page) {
  container.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  updateVariableCounter(data.length);

  paginatedData.forEach((variable, index) => {
    // 2. Filtrar los eventos que pertenecen a esta variable
    const eventosRelacionados = eventosGlobal.filter(ev => ev.idVar === variable.idVar);
    const timelineHTML = construirLineaDeTiempo(eventosRelacionados);

    // 3. Fuentes dinámicas
    const fuentesHTML = eventosRelacionados.map(ev => 
      `<a href="${ev.fuenteIden}" target="_blank" class="d-block text-decoration-underline small text-primary">${ev.evento}</a>`
    ).join('') || '<span class="text-muted">Sin fuentes disponibles</span>';

    const proceso = procesosGlobal.find(proc => proc.idPp === variable.idPp);

    const card = document.createElement('div');
    card.classList.add('accordion', 'mb-3');

    card.innerHTML = `
    <div class="accordion-item shadow-sm rounded-3 border-0">
        <h2 class="accordion-header custom-accordion-header" id="heading${index}">
            <button class="accordion-button collapsed fw-bold" type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapse${index}"
                aria-expanded="false"
                aria-controls="collapse${index}">
                ${variable.varAsig}
                ${proceso && proceso.pp ? `<span class="badge ms-2 bg-secondary">${proceso.pp}</span>` : ''}
            </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#variablesContainer">
          <div class="accordion-body">
               <!-- Cambia aquí: usa un div normal, NO d-flex -->
               <div class="mb-2">
                    <div class="mb-2 text-dark fw-semibold" style="font-size:1rem;">
                      Periodo de Pertinencia del Evento:
                    </div>
                    ${timelineHTML}
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary"><i class="bi bi-question-circle me-1"></i>Pregunta:</span>
                            <div class="ps-3">
                            <p>${variable.pregLit}</p>
                            </div>
                             <span class="fw-semibold text-secondary"><i class="bi bi-question-circle me-1"></i>Clasificación de la pregunta:</span>
                             <div class="ps-3">
                                ${getClasificacionesPorVariable(variable.idVar)}
                              </div>
                        </div>
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary"><i class="bi bi-info-circle me-1"></i>Definición:</span>
                            <div class="ps-3">${variable.defVar}</div>
                        </div>
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Nombre de la variable seleccionad, tal y como aparece en la fuente del evento en mención">
                                <i class="bi bi-tag me-1"></i>Variable Fuente:</span>
                            <span class="badge bg-info-subtle text-dark ms-1 fw-normal">${variable.nomVar}</span>
                        </div>
                    </div>
               
                    <div class="col-md-6">
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Conjunto objeto de cuantificación y caracterización para fines de estudio">
                               <i class="bi bi-diagram-3 me-1"></i>Categoría:</span>
                            <span class="badge bg-secondary-subtle text-dark ms-1 fw-normal">${variable.categoria}</span>
                        </div>
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Son enunciados genéricos referentes a campos específicos de interés y cuyo estudio constituye la justificación del proyecto estadístico">
                                <i class="bi bi-layers me-1"></i>Clasificación Temática:</span>
                            <div class="ps-3">
                                <span>Tema y Subtema 1:</span>
                                <span class="badge bg-success-subtle text-dark mb-1 fw-normal">${variable.tema}</span>/
                                <span class="badge bg-success-subtle text-dark mb-1 fw-normal">${variable.subtema}</span><br>
                                <span>Tema y Subtema 2:</span>
                                <span class="badge bg-success-subtle text-dark mb-1 fw-normal">${variable.tema2}</span>/
                                <span class="badge bg-success-subtle text-dark mb-1 fw-normal">${variable.subtema2}</span>
                            </div>
                        </div>
                        <div class="mb-2">
                            <span class="fw-semibold text-secondary"><i class="bi bi-link-45deg me-1"></i>Relación con Tabulados o Microdatos</span>
                            <div class="ps-3 d-flex flex-wrap gap-2">
                                <span class="badge bg-${variable.relTab === 'Sí' ? 'success badge-tabulado' : 'danger'}"
                                      style="cursor:pointer"
                                      data-idvar="${variable.idVar}"
                                      ${variable.relTab === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="tabulado"' : ''}
                                >${variable.relTab === 'Sí' ? 'Tabulados' : 'Sin Tabulados'}</span>
                                <span class="badge bg-${variable.relMicro === 'Sí' ? 'success badge-microdatos' : 'danger'}"
                                      style="cursor:pointer"
                                      data-idvar="${variable.idVar}"
                                      ${variable.relMicro === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="microdatos"' : ''}
                                >${variable.relMicro === 'Sí' ? 'Microdatos' : 'Sin Microdatos'}</span>
                            </div>
                        <span class="fw-semibold text-secondary"><i class="bi bi-link-45deg me-1"></i>Alineación con MDEA y ODS</span>
                            <div class="ps-3 d-flex flex-wrap gap-2">
                                <span class="badge bg-${variable.alinMdea === 'Sí' ? 'primary' : 'secondary'}">${variable.alinMdea === 'Sí' ? 'MDEA' : 'Sin MDEA'}</span>
                                <span class="badge bg-${variable.alinOds === 'Sí' ? 'primary' : 'secondary'}">${variable.alinOds === 'Sí' ? 'ODS' : 'Sin ODS'}</span>
                            </div>
                        </div>
                       ${renderComentarios(variable.comentVar)}
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    container.appendChild(card);

    // Inicializar tooltips
    const tooltips = card.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(el => new bootstrap.Tooltip(el));
  });
}



    // Función para configurar el paginador
    function setupPagination(data) {
        paginationContainer.innerHTML = ""; // Limpia el paginador antes de generarlo nuevamente
        const totalPages = Math.ceil(data.length / itemsPerPage);
        const maxVisiblePages = 5; // Número máximo de páginas visibles en el paginador

        // Botón "Anterior"
        if (currentPage > 1) {
            const prevLi = document.createElement("li");
            prevLi.classList.add("page-item");
            const prevA = document.createElement("a");
            prevA.classList.add("page-link");
            prevA.href = "#";
            prevA.textContent = "«";
            prevA.addEventListener("click", function (e) {
                e.preventDefault();
                currentPage--;
                renderPage(data, currentPage);
                setupPagination(data);
            });
            prevLi.appendChild(prevA);
            paginationContainer.appendChild(prevLi);
        }

        // Rango de páginas visibles
        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Mostrar "..." al inicio si hay páginas anteriores al rango visible
        if (startPage > 1) {
            const dotsLi = document.createElement("li");
            dotsLi.classList.add("page-item", "disabled");
            const dotsA = document.createElement("a");
            dotsA.classList.add("page-link");
            dotsA.href = "#";
            dotsA.textContent = "...";
            dotsLi.appendChild(dotsA);
            paginationContainer.appendChild(dotsLi);
        }

        // Números de página visibles
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement("li");
            li.classList.add("page-item");
            if (i === currentPage) li.classList.add("active");

            const a = document.createElement("a");
            a.classList.add("page-link");
            a.href = "#";
            a.textContent = i;
            a.addEventListener("click", function (e) {
                e.preventDefault();
                currentPage = i;
                renderPage(data, currentPage);
                setupPagination(data);
            });

            li.appendChild(a);
            paginationContainer.appendChild(li);
        }

        // Mostrar "..." al final si hay páginas posteriores al rango visible
        if (endPage < totalPages) {
            const dotsLi = document.createElement("li");
            dotsLi.classList.add("page-item", "disabled");
            const dotsA = document.createElement("a");
            dotsA.classList.add("page-link");
            dotsA.href = "#";
            dotsA.textContent = "...";
            dotsLi.appendChild(dotsA);
            paginationContainer.appendChild(dotsLi);
        }

        // Botón "Siguiente"
        if (currentPage < totalPages) {
            const nextLi = document.createElement("li");
            nextLi.classList.add("page-item");
            const nextA = document.createElement("a");
            nextA.classList.add("page-link");
            nextA.href = "#";
            nextA.textContent = "»";
            nextA.addEventListener("click", function (e) {
                e.preventDefault();
                currentPage++;
                renderPage(data, currentPage);
                setupPagination(data);
            });
            nextLi.appendChild(nextA);
            paginationContainer.appendChild(nextLi);
        }
    }

    // Manejar el evento de cambio en el selector de elementos por página
    itemsPerPageSelect.addEventListener("change", function () {
        itemsPerPage = parseInt(this.value, 10); // Actualizar el número de elementos por página
        currentPage = 1; // Reiniciar a la primera página
        renderPage(allData, currentPage); // Renderizar la nueva página
        setupPagination(allData); // Actualizar el paginador
    });

    // Manejar el evento de envío del formulario
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Evitar el comportamiento predeterminado del formulario
        const searchTerm = searchInput.value.trim();
        currentPage = 1; // Reiniciar a la primera página
        searchVariables(searchTerm); // Realizar la búsqueda
    });
    
    //Listener para los periodo de tiempo. 
    document.getElementById("periodInic").addEventListener("change", filterByRelation);
    document.getElementById("periodFin").addEventListener("change", filterByRelation);
    
    window.addEventListener("DOMContentLoaded", () => {
    populatePeriodFilters(); // Cargar filtros
    filterByRelation();      // Mostrar todo inicialmente
    });

    // Cargar todos los elementos al entrar a la página
    loadAllVariables();

    //Filtrado de ordemaniento de la A-Z 
        // Función para ordenar variables alfabéticamente
        sortSelect.addEventListener("change", function () {
        const sortOption = this.value;

        if (!sortOption) {
            // Si no se selecciona opción, mostrar sin ordenar
            renderPage(currentFilteredData, currentPage);
            setupPagination(currentFilteredData);
            return;
        }

        const sortedData = [...currentFilteredData].sort((a, b) => {
            const nameA = a.varAsig.toLowerCase();
            const nameB = b.varAsig.toLowerCase();

            if (sortOption === "az") {
                return nameA.localeCompare(nameB);
            } else if (sortOption === "za") {
                return nameB.localeCompare(nameA);
            }
            return 0;
        });

        currentPage = 1;
        currentFilteredData = sortedData;
        renderPage(currentFilteredData, currentPage);
        setupPagination(currentFilteredData);
    });
    
    // Función para aplicar todos los filtros activos
    function applyFilters() {
        let filteredData = [...allData];

        // Filtro por procesos de producción (múltiple)
        const selectedProcesses = Array.from(processSelect.selectedOptions).map(opt => opt.value);
        if (selectedProcesses.length > 0) {
            filteredData = filteredData.filter(variable => selectedProcesses.includes(variable.idPp));
        }

        // Filtro por temática
        const selectedTema = temaSelect.value;
        if (selectedTema && selectedTema !== "Seleccione una temática") {
            filteredData = filteredData.filter(variable =>
                variable.tema === selectedTema || variable.tema2 === selectedTema
            );
        }

        // Filtro de relación temática
        if (relTabCheckbox.checked || relMicroCheckbox.checked) {
            filteredData = filteredData.filter(variable => {
                const matchRelTab = relTabCheckbox.checked ? variable.relTab === "Sí" : true;
                const matchRelMicro = relMicroCheckbox.checked ? variable.relMicro === "Sí" : true;
                return matchRelTab && matchRelMicro;
            });
        }

        // Filtro de alineación con MDEA y ODS
        if (alinMdeaCheckbox.checked || alinOdsCheckbox.checked) {
            filteredData = filteredData.filter(variable => {
                const matchMdea = alinMdeaCheckbox.checked ? variable.alinMdea === "Sí" : true;
                const matchOds = alinOdsCheckbox.checked ? variable.alinOds === "Sí" : true;
                return matchMdea && matchOds;
            });
        }   

        // Filtro de búsqueda por término
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(variable =>
                variable.nomVar.toLowerCase().includes(searchTerm) ||
                variable.defVar.toLowerCase().includes(searchTerm) ||
                variable.varAsig.toLowerCase().includes(searchTerm)
            );
        }

        // Actualizar los datos filtrados y renderizar
        currentFilteredData = filteredData;
        currentPage = 1;
        renderPage(currentFilteredData, currentPage);
        setupPagination(currentFilteredData);
        updateVariableCounter(filteredData.length);
    }

    const selectedProcessesContainer = document.getElementById("selectedProcessesContainer");

function updateSelectedProcessesChips() {
    const selectedProcessesContainer = document.getElementById("selectedProcessesContainer");
    selectedProcessesContainer.innerHTML = "";
    const selectedOptions = Array.from(processSelect.selectedOptions);
    selectedOptions.forEach(option => {
        const chip = document.createElement("span");
        chip.className = "badge bg-primary text-white me-2 mb-1";
        chip.textContent = option.textContent;
        // Botón para quitar
        const removeBtn = document.createElement("span");
        removeBtn.innerHTML = '&times;';
        removeBtn.style.cursor = "pointer";
        removeBtn.className = "ms-2";
        removeBtn.onclick = () => {
            option.selected = false;
            updateSelectedProcessesChips();
            applyFilters();
        };
        chip.appendChild(removeBtn);
        selectedProcessesContainer.appendChild(chip);
    });
}

temaSelect.addEventListener("change", function () {
    checkMostrarUnidadSection();
    applyFilters();
});
relTabCheckbox.addEventListener("change", applyFilters);
relMicroCheckbox.addEventListener("change", applyFilters);
alinMdeaCheckbox.addEventListener("change", applyFilters);
alinOdsCheckbox.addEventListener("change", applyFilters);
document.getElementById("periodInic").addEventListener("change", applyFilters);
document.getElementById("periodFin").addEventListener("change", applyFilters);
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    applyFilters();
});
    // Evento para el botón de borrar filtros
    clearFiltersBtn.addEventListener("click", function () {
        // Limpiar los campos de los filtros
        searchInput.value = "";
        temaSelect.value = "";
        // Limpiar todas las opciones seleccionadas del select múltiple
        Array.from(processSelect.options).forEach(option => option.selected = false);
        updateSelectedProcessesChips(); // <-- Actualiza los chips visuales

        // Ocultar y limpiar la sección de unidad administrativa
        unidadSection.style.display = "none";

        // Restaurar el listado completo
        currentPage = 1;
        currentFilteredData = [...allData];
        renderPage(currentFilteredData, currentPage);
        setupPagination(currentFilteredData);
        updateVariableCounter(allData.length); // Actualizar el contador

        // Eliminar los parámetros de la URL sin recargar
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    });

    // Función para obtener parámetros de la URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Cuando cargue la página, buscar si hay un parámetro "search"
    document.addEventListener("DOMContentLoaded", () => {
        const searchTerm = getQueryParam("search");
        if (searchTerm) {
            // Asegúrate de que los datos estén cargados antes de buscar
            const checkDataLoaded = setInterval(() => {
                if (typeof allData !== 'undefined' && allData.length > 0) {
                    clearInterval(checkDataLoaded);
                    searchInput.value = searchTerm; // Mostrar el término en el input
                    searchVariables(searchTerm);    // Ejecutar la búsqueda
                }
            }, 100);
        }
    });

    // Evento delegado para mostrar información de tabulados y microdatos en el modal
    document.addEventListener("click", async function (e) {
        // Badge de Tabulados
        if (e.target.classList.contains("badge-tabulado")) {
            document.getElementById("infoModalLabel").textContent = "Detalle de la Relación con Tabulados"; // <-- Cambia el título
            const idVar = e.target.getAttribute("data-idvar");
            const modalBody = document.getElementById("infoModalBody");
            modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

            try {
                // 1. Obtener relaciones var-tab
                const resVarTab = await fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/var-tab');
                const dataVarTab = await resVarTab.json();

                // Filtrar todas las coincidencias por idVar
                const relaciones = dataVarTab.filter(rel => rel.idVar === idVar);

                if (relaciones.length === 0) {
                    modalBody.innerHTML = "<div class='text-danger'>No hay tabulados relacionados con esta variable.</div>";
                    return;
                }

                // 2. Obtener todos los tabulados
                const resTabulados = await fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/tabulado');
                const tabulados = await resTabulados.json();

                // 3. Construir HTML con las ligas y nuevos campos
                let contenido = "";

                relaciones.forEach(rel => {
                    const tabulado = tabulados.find(tab => tab.idTab === rel.idTab);
                    if (tabulado && (tabulado.ligaTab || tabulado.ligaDescTab)) {
                        contenido += `
                            <div class="mb-3 border-bottom pb-2">
                                ${tabulado.tituloTab ? `
                                <strong>Título del tabulado:</strong><br>
                                <span>${tabulado.tituloTab}</span><br>` : ''}
                                <strong>ID Tabulado:</strong> ${rel.idTab}<br>
                                <div class="row">
                                    <div class="col-6">
                                        ${tabulado.ligaTab ? `
                                        <strong>Liga Tabulado INEGI:</strong><br>
                                        <a href="${tabulado.ligaTab}" target="_blank" style="word-break: break-all;">Tabulado</a><br>` : ''}
                                    </div>
                                    <div class="col-6">
                                        ${tabulado.ligaDescTab ? `
                                        <strong>Liga de Descarga:</strong><br>
                                        <a href="${tabulado.ligaDescTab}" target="_blank" style="word-break: break-all;">Documento Directo</a><br>` : ''}
                                    </div>
                                </div>
                                ${(tabulado.numTab || tabulado.tipoTab) ? `
                                <strong>Información adicional:</strong><br>
                                ${tabulado.numTab ? `Número: ${tabulado.numTab}<br>` : ''}
                                ${tabulado.tipoTab ? `Tipo: ${tabulado.tipoTab}<br>` : ''}` : ''}
                            </div>
                        `;
                    }
                });

                modalBody.innerHTML = contenido || "<div class='text-danger'>No hay ligas disponibles para los tabulados relacionados.</div>";

            } catch (error) {
                console.error(error);
                modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información.</div>";
            }
        }


        // Badge de Microdatos
        if (e.target.classList.contains("badge-microdatos")) {
            document.getElementById("infoModalLabel").textContent = "Detalle de la Relación con Microdatos"; // <-- Cambia el título
            const idVar = e.target.getAttribute("data-idvar");
            const modalBody = document.getElementById("infoModalBody");
            modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";
            try {
                // Trae todos los microdatos y filtra por idVar
                const res = await fetch(`https://jones-investors-participant-behaviour.trycloudflare.com/api/microdatos`);
                const data = await res.json();
                // Busca el microdato que corresponde a la variable
                const info = Array.isArray(data)
                    ? data.find(micro => String(micro.idVar) === String(idVar))
                    : (data.idVar === idVar ? data : null);
                if (info && (info.ligaMicro || info.ligaDd)) {
                    modalBody.innerHTML = `
                    <div class="mb-2">
                        <strong class="mb-2">ID Variable:</strong><br> ${info.idVar}<br>
                        <strong>Liga Microdatos:</strong><br>
                        <a href="${info.ligaMicro}" target="_blank" style="word-break: break-all;">Página Microdatos INEGI</a>
                    </div>
                    <div class="mb-2">
                        <strong>Liga de Descarga:</strong><br>
                        <a href="${info.ligaDd}" target="_blank" style="word-break: break-all;">Documento Directo</a>
                    </div>
                    <div class="mb-2">
                        <strong>Tabla donde se encuentra:</strong><br>
                        ${info.nomTabla || "No disponible"}
                    </div>
                    <div class="mb-2">
                        <strong>Se localiza en el Campo:</strong><br>
                        ${info.nomCampo || "No disponible"}
                    </div>
                    <div class="mb-2">
                        <strong>Comentario:</strong><br>
                        ${info.comentMicro || "No disponible"}
                    </div>
                `;
                } else {
                    modalBody.innerHTML = "<div class='text-danger'>No hay información de microdatos disponible.</div>";
                }
            } catch {
                modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información.</div>";
            }
        }
    });

});

// Almacenar y recuperar término de búsqueda en localStorage
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const storedTerm = localStorage.getItem("variableSearchTerm");
  if (storedTerm && searchInput) {
    searchInput.value = storedTerm;
    localStorage.removeItem("variableSearchTerm");
    // Simula Enter para disparar la búsqueda automáticamente
    const event = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(event);
    if (typeof searchInput.form !== "undefined" && searchInput.form) {
      searchInput.form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  }
});
// Cargar clasificaciones antes de renderizar variables
fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/clasificaciones')
  .then(res => res.json())
  .then(clasificaciones => {
    clasificacionesGlobal = clasificaciones;
    // Ahora carga las variables y eventos como ya lo haces
    fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/eventos')
      .then(res => res.json())
      .then(eventos => {
        eventosGlobal = eventos;
        fetch('https://jones-investors-participant-behaviour.trycloudflare.com/api/variables')
          .then(res => res.json())
          .then(variables => {
            renderPage(variables, 1);
          });
      });
  });

function getClasificacionesPorVariable(idVar) {
  // Filtra las clasificaciones que correspondan a la variable y descarta vacíos, nulos o '-'
  const clasifs = clasificacionesGlobal
    .filter(clasif => clasif.idVar === idVar)
    .map(clasif => clasif.clasificaciones)
    .filter(val => val && val.trim() !== '' && val.trim() !== '-');

  // Puedes mostrar como lista o como badges
  if (clasifs.length > 0) {
    // Como lista
    return `<ul class="mb-0 ps-3">${clasifs.map(c => `<li>${c}</li>`).join('')}</ul>`;
    // O como badges:
    // return clasifs.map(c => `<span class="badge bg-secondary me-1 mb-1">${c}</span>`).join('');
  } else {
    return '<span class="text-muted">Sin clasificación</span>';
  }
}

// Nueva función para renderizar comentarios
function renderComentarios(comentario) {
  if (
    !comentario ||
    comentario.trim() === '' ||
    comentario.trim() === '-' ||
    comentario.trim().toLowerCase() === 'nula' ||
    comentario.trim().toLowerCase() === 'null' ||
    comentario.trim().toLowerCase() === 'n/a'
  ) {
    return ''; // No mostrar nada
  }
  return `
    <div class="mb-2">
      <span class="fw-semibold text-secondary"><i class="bi bi-asterisk me-1"></i>Extras:</span>
      <div class="ps-3 small">
        <div><span>Comentarios:</span> ${comentario}</div>
      </div>
    </div>
  `;
}