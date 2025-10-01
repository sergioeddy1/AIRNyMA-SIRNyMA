// --- Abre variables.html en otra pestaña ---
function handleVariableClick(idPp) {
  window.open(`variables.html?idPp=${idPp}`, '_blank');
}

// --- Helpers generales ---
function mostrarVigencia(vigInicial, vigFinal) {
  if (!vigInicial && !vigFinal) return "No disponible";
  if (vigInicial === vigFinal) return vigInicial || "No disponible";
  return `${vigInicial || "No disponible"} - ${vigFinal || "No disponible"}`;
}

function getStatusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "activo": return "bg-success";
    case "inactivo": return "bg-danger";
    case "pendiente": return "bg-warning text-dark";
    default: return "bg-secondary";
  }
}

// --- Normalizador: ECONÓMICAS → shape local (sociodemograficas) ---
function mapEconomicasToLocal(item) {
  // Periodicidad de publicación preferente
  const perPub = (item.periodicidadpublicacion && item.periodicidadpublicacion.trim()) 
                   ? item.periodicidadpublicacion.trim()
                   : (item.periodicidad || null);

  // Bandera IIN grado de madurez
  const grado = (String(item.iin || '').toLowerCase() === 'sí' || String(item.iin || '').toLowerCase() === 'si')
                  ? "Información de Interés Nacional"
                  : null;

  // Descripción: objetivo (+ pobjeto si existe)
  const desc = [item.objetivo, item.pobjeto].filter(Boolean).join(" ");

  return {
    idPp: item.acronimo || "SD",
    pi: item.proceso || "No disponible",
    pp: item.proceso || "No disponible",
    dgaRespPp: null,
    perioProd: null,
    vigInicial: item.inicio || null,
    vigFinal: item.fin || null,
    metGenInf: item.metodo || null,
    gradoMadur: grado,
    perPubResul: perPub || "No disponible",
    estatus: item.estatus || "Activo",
    descPp: desc || "No disponible",
    comentPp: item.comentarioS || item.comentarioA || "-",
    responCaptura: null,
    _source: 'economicas',
    _unidad: item.unidad || null,
  };
}

// --- Render de tarjetas  ---
function renderProcesos(procesos, conteo, container) {
  const counter = document.getElementById("procesosCounter");
  if (counter) counter.textContent = procesos.length;
  container.innerHTML = "";

  if (!procesos.length) {
    container.innerHTML = `<div class="alert alert-warning text-center">No se encontraron procesos con estas caracteristicas</div>`;
    return;
  }

  procesos.forEach(proceso => {
   let iconoHTML = "";

  
    // Comportamiento normal para las demás unidades
    let extension = "png";
    const extensionesGif = ["ENADID", "ENIGH", "CAAS", "ENCEVI", "MSM", "ESMNG"];
    if (extensionesGif.includes(proceso.idPp)) extension = "gif";

    const baseName = `/assets/${proceso.idPp}`;
    const iconoFallback = `/assets/no_disponible.png`;
    const iconoRutaMin = `${baseName}.${extension}`;
    const iconoRutaMay = `${baseName}.${extension.toUpperCase()}`;

    iconoHTML = `
        <img src="${iconoRutaMin}" 
            class="img-fluid proceso-icon rounded-start" 
            alt="Icono ${proceso.idPp}" 
            style="max-height: 80px; object-fit: contain; ${proceso.idPp === "CPV" ? "filter: invert(1);" : ""}"
            onerror="
            if (this.src.includes('.png') && !this.src.includes('.PNG')) {
                this.onerror = null;
                this.src = '${iconoRutaMay}';
            } else {
                this.onerror = null;
                this.src = '${iconoFallback}';
            }
            ">
    `;
    

    const card = `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm rounded-3 p-2 position-relative">
          ${proceso.gradoMadur === "Información de Interés Nacional" ? `
            <span class="badge bg-secondary position-absolute top-0 start-0 m-2"
                  style="z-index:2; cursor: help;"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title="Información de Interés Nacional">IIN</span>` : ""}
          <div class="row g-0 d-flex align-items-center">
            <div class="col-4 d-flex justify-content-center">${iconoHTML}</div>
            <div class="col-8">
              <div class="card-body p-2">
                <h5 class="card-title fw-bold mb-1">${proceso.pp || "Desconocido"}</h5>
                <p class="card-text text-muted mb-1">${proceso.idPp}</p>
                <p class="card-text mb-1">
                  <strong style="font-size: 0.85rem">Estatus:</strong>
                  <span class="badge ${getStatusClass(proceso.estatus)}">${proceso.estatus}</span>
                </p>
                <p class="card-text mb-1" style="font-size: 0.85rem">
                  <strong style="font-size: 0.85rem">Periodicidad:</strong>
                  ${proceso.perPubResul || "No disponible"}
                </p>
                <p class="card-text mb-1" style="font-size: 0.85rem">
                  <strong style="font-size: 0.85rem">Vigencia:</strong>
                  ${mostrarVigencia(proceso.vigInicial, proceso.vigFinal)}
                </p>
                <p class="card-text mb-0">
                  <strong style="font-size: 0.85rem">Total Variables Ambientales:</strong>
                  <span style="color: #08739c; font-family: 'Monaco', monospace; font-weight: bold; font-size: 1.2rem; text-decoration: underline; cursor: pointer;"
                        onclick="handleVariableClick('${proceso.idPp}')">
                    ${conteo[proceso.idPp] || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    container.innerHTML += card;
  });

  // Tooltips Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}

// --- Filtros y orden: reusables para cualquier lista de procesos ---
function wireFiltrosYOrden({ procesosGlobal, conteoGlobal, container }) {
  const selectPerio = document.getElementById("filtrarPeriodicidad");

  // Llenar periodicidades únicas
  selectPerio.innerHTML = `<option value="">Filtrar por periodicidad...</option>`;
  const periodicidadesUnicas = [...new Set(
    procesosGlobal
      .map(p => p.perPubResul)
      .filter(Boolean)
  )].sort();
  periodicidadesUnicas.forEach(periodo => {
    const option = document.createElement("option");
    option.value = periodo;
    option.textContent = periodo;
    selectPerio.appendChild(option);
  });

  function aplicarFiltrosYOrden() {
    let filtrados = [...procesosGlobal];

    const estatus = document.getElementById("filtrarEstatus").value;
    const periodicidad = document.getElementById("filtrarPeriodicidad").value;
    const soloIIN = document.getElementById("iinCheck").checked;
    const orden = document.getElementById("ordenarProcesos").value;

    if (estatus) {
      filtrados = filtrados.filter(p => (p.estatus || "").toLowerCase() === estatus.toLowerCase());
    }
    if (periodicidad) {
      filtrados = filtrados.filter(p => (p.perPubResul || "") === periodicidad);
    }
    if (soloIIN) {
      filtrados = filtrados.filter(p => (p.gradoMadur || "").toLowerCase() === "información de interés nacional");
    }

    if (orden === "az" || orden === "za") {
      filtrados.sort((a, b) => {
        const A = (a.pp || "").toLowerCase();
        const B = (b.pp || "").toLowerCase();
        return orden === "az" ? A.localeCompare(B) : B.localeCompare(A);
      });
    } else if (orden === "mayor-menor" || orden === "menor-mayor") {
      filtrados.sort((a, b) => {
        const countA = conteoGlobal[a.idPp] || 0;
        const countB = conteoGlobal[b.idPp] || 0;
        return orden === "mayor-menor" ? countB - countA : countA - countB;
      });
    }

    renderProcesos(filtrados, conteoGlobal, container);
  }

  // Eventos
  document.getElementById("filtrarEstatus").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("filtrarPeriodicidad").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("iinCheck").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("ordenarProcesos").addEventListener("change", aplicarFiltrosYOrden);

  // Botón reset
  document.getElementById("resetFiltrosBtn").addEventListener("click", () => {
    document.getElementById("ordenarProcesos").selectedIndex = 0;
    document.getElementById("filtrarEstatus").selectedIndex = 0;
    document.getElementById("filtrarPeriodicidad").selectedIndex = 0;
    document.getElementById("iinCheck").checked = false;
    aplicarFiltrosYOrden();
  });

  // Primera pintada
  aplicarFiltrosYOrden();
}

// -- HELPERS para conteo y filtrado --

// Helper de carga para mostrar un loader
function renderLoader(container, text = "Cargando procesos...") {
  if (!container) return;
  container.innerHTML = `
    <div id="procesosLoader" class="d-flex flex-column align-items-center justify-content-center py-5">
      <div class="spinner-border" role="status" aria-hidden="true"></div>
      <div class="mt-3 text-muted small">${text}</div>
    </div>
  `;
}
// Helper para remover el loader. 
function removeLoader() {
  const el = document.getElementById("procesosLoader");
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

// Helper: intenta obtener el idPp de un registro de variable aunque el esquema cambie
function getVariableIdPp(v) {
  return (
    v.idPp ||
    v.acronimo ||
    v.id_pp ||
    (v.proceso && (v.proceso.idPp || v.proceso.acronimo)) ||
    null
  );
}


// Conteo específico para /api/indicadores/ultima
// Estructura: [ { idA, variableList:[ { acronimo, ... }, ... ] }, ... ]
function buildConteoPorIdPpDesdeUltima(ultimaPayload) {
  const counts = {};
  const registros = Array.isArray(ultimaPayload) ? ultimaPayload : (ultimaPayload ? [ultimaPayload] : []);

  for (const reg of registros) {
    const lista = Array.isArray(reg.variableList) ? reg.variableList : [];
    for (const v of lista) {
      const key = (v.acronimo || v.idPp || v.id_pp || "").toString().trim();
      if (!key) continue;
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return counts;
}


//  Helper: construye un índice de conteo { idPp: cantidad } en O(n)
function buildConteoPorIdPp(variables) {
  const counts = {};
  for (const v of variables || []) {
    const key = getVariableIdPp(v);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

// Oculta procesos con 0 variables solo para la fuente Económicas
function filtrarEconomicasSinVariables(procesos, conteo) {
  return procesos.filter(p => {
    if (p._source === 'economicas') {
      return (conteo[p.idPp] || 0) > 0; // solo deja los que tienen > 0
    }
    return true; // otras unidades pasan completas
  });
}

// --- Carga SOCIODEMOGRÁFICAS (sin cambios de fuente) ---
async function cargarSociodemograficas({ container }) {
  renderLoader(container, "Cargando procesos (Sociodemográficas)...");
  try {
    const procesos  = await fetch("/api/proceso").then(res => res.json());
    const variables = await fetch("/api/variables").then(res => res.json());

    const conteoGlobal = buildConteoPorIdPp(variables);
    procesos.forEach(p => { if (!(p.idPp in conteoGlobal)) conteoGlobal[p.idPp] = 0; });

    // Nuevo: Renderiza contador de variables ambientales por unidad
    renderContadorVariablesUnidad(conteoGlobal, "Sociodemográficas");

    wireFiltrosYOrden({ procesosGlobal: procesos, conteoGlobal, container });
  } catch (err) {
    removeLoader();
    console.error("Error cargando sociodemográficas", err);
    container.innerHTML = "<p class='text-danger text-center my-4'>Error al cargar los procesos.</p>";
  }
}

// --- Nuevo: Renderiza contador de variables ambientales por unidad ---
function renderContadorVariablesUnidad(conteoGlobal) {
  const contadorUnidad = document.getElementById("contadorVariablesUnidad");
  if (contadorUnidad) {
    // Muestra 0 mientras se carga la nueva unidad
    contadorUnidad.textContent = "0";
    // Calcula el total después de un breve tiempo (simula espera de servidor)
    setTimeout(() => {
      const totalVariables = Object.entries(conteoGlobal)
        .filter(([_, count]) => typeof count === "number" && count > 0)
        .reduce((acc, [, count]) => acc + count, 0);
      contadorUnidad.textContent = `${totalVariables}`;
    }, 300); // Puedes ajustar el tiempo si lo deseas
  }
}


// --- Carga ECONÓMICAS (Base de datos nueva) ---
async function cargarEconomicas({ container }) {
  renderLoader(container, "Cargando procesos (Económicas)...");

  const urlProcesos = "http://10.109.1.13:3002/api/procesos/buscar?unidad=" + 
                      encodeURIComponent("Unidad de Estadísticas Económicas");
  const urlVariablesEco = "http://10.109.1.13:3002/api/indicadores/ultima";

  try {
    const economicasRaw = await fetch(urlProcesos).then(r => r.json());
    const procesos = economicasRaw.map(mapEconomicasToLocal);

    let conteoGlobal = {};
    try {
      const payloadUltima = await fetch(urlVariablesEco).then(r => r.json());
      conteoGlobal = buildConteoPorIdPpDesdeUltima(payloadUltima);
    } catch (e) {
      try {
        const variablesLocal = await fetch("/api/variables").then(r => r.json());
        conteoGlobal = buildConteoPorIdPp(variablesLocal);
      } catch (e2) {
        conteoGlobal = {};
      }
    }

    procesos.forEach(p => {
      if (!(p.idPp in conteoGlobal)) conteoGlobal[p.idPp] = 0;
    });

    // Nuevo: Renderiza contador de variables ambientales por unidad
    renderContadorVariablesUnidad(conteoGlobal, "Económicas");

    const procesosFiltrados = filtrarEconomicasSinVariables(procesos, conteoGlobal);

    if (procesosFiltrados.length === 0) {
      removeLoader();
      container.innerHTML = `<div class="alert alert-info text-center">
        No hay procesos de la Unidad de Estadísticas Económicas con variables ambientales (&gt; 0).
      </div>`;
      const counter = document.getElementById("procesosCounter");
      if (counter) counter.textContent = "0";
      return;
    }

    wireFiltrosYOrden({ procesosGlobal: procesosFiltrados, conteoGlobal, container });
  } catch (err) {
    removeLoader();
    container.innerHTML = "<p class='text-danger text-center my-4'>Error al cargar los procesos (Económicas).</p>";
  }
}


// --- Arranque DOM ---
document.addEventListener("DOMContentLoaded", async function () {
  // Nav activo
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) link.classList.add("active");
  });

  const seccionProcesos = document.getElementById("procesosSection");
  const container = document.getElementById("procesosContainer");

  // Botones de las unidades (usa estos IDs en tus cards)
  const btnSocio = document.getElementById("btnDireccionSociodemograficas");
  const btnEco   = document.getElementById("btnDireccionEconomicas"); // <- agrega este botón en tu HTML

  function prepararSeccion() {
    if (!seccionProcesos) return;
    seccionProcesos.hidden = false;
    seccionProcesos.scrollIntoView({ behavior: 'smooth' });
    // Limpia contenedor y contador de procesos
    if (container) container.innerHTML = "";
    const counter = document.getElementById("procesosCounter");
    if (counter) counter.textContent = "0";
    // Limpia selects por si cambia la fuente
    document.getElementById("filtrarPeriodicidad").innerHTML = `<option value="">Filtrar por periodicidad...</option>`;
    // Limpia el contador de variables ambientales
    const contadorUnidad = document.getElementById("contadorVariablesUnidad");
    if (contadorUnidad) contadorUnidad.textContent = "0";
  }

  if (btnSocio && seccionProcesos && container) {
    btnSocio.addEventListener("click", async () => {
      try {
        prepararSeccion();
        await cargarSociodemograficas({ container });
      } catch (err) {
        console.error("Error cargando sociodemográficas", err);
        container.innerHTML = "<p class='text-danger'>Error al cargar los procesos.</p>";
      }
    });
  }

  if (btnEco && seccionProcesos && container) {
    btnEco.addEventListener("click", async () => {
      try {
        prepararSeccion();
        await cargarEconomicas({ container });
      } catch (err) {
        console.error("Error cargando económicas", err);
        container.innerHTML = "<p class='text-danger'>Error al cargar los procesos (Económicas).</p>";
      }
    });
  }

  // Cards genéricas que aún no están disponibles
  document.querySelectorAll('.mostrarGrupoBtn').forEach(card => {
    card.addEventListener('click', function () {
      if (this.id !== "btnDireccionSociodemograficas" && this.id !== "btnDireccionEconomicas") {
        alert("Información no disponible");
      }
    });
  });
});

