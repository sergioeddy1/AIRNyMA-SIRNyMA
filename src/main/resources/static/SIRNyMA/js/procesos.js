// procesos.js

// ---- Estado global para sincronizar cargas y contador ----
let isCargandoUnidad = false;         // evita cargas en paralelo
let contadorAnimFrame = null;         // requestAnimationFrame activo
let contadorTimeoutId = null;         // fallback si usas setTimeout (ya no lo usaremos)
let unidadToken = 0;                  // versión de carga; invalida renders viejos

// === Valores iniciales (roll-up global al entrar) ===
const GLOBAL_DEFAULTS = {
  unidades: 5,                 //  5
  procesosTotales: 45 + 64,    // 109
  procesosAmbientales: 31 + 15,// 46
  variablesAmbientales: 1165 + 195 // 1360 
};

// === Formatea números con espacio cada 3 dígitos ===
function formatNumberWithSpace(num) {
  // Acepta número o texto numerico; devuelve string formateado
  const n = Number(String(num).replace(/\s+/g, '').replace(/,/g, ''));
  if (!Number.isFinite(n)) return String(num);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Pinta los 4 contadores con esos valores (sin spinner)
function setSummaryDefaults() {
  animateCountTo('#scUnidades', GLOBAL_DEFAULTS.unidades, 0);
  animateCountTo('#scProcesosTotales', GLOBAL_DEFAULTS.procesosTotales, 0);
  animateCountTo('#scProcesosAmbientales', GLOBAL_DEFAULTS.procesosAmbientales, 0);
  animateCountTo('#scVariablesAmbientales', GLOBAL_DEFAULTS.variablesAmbientales, 0);

  // 🔹 Ajuste del texto del contador
  setTimeout(actualizarEtiquetaUnidades, 200);
}

// === Actualiza el texto del contador de unidades según su valor ===
function actualizarEtiquetaUnidades() {
  const contador = document.querySelector("#scUnidades");
  if (!contador) return;

  // Intentamos encontrar la etiqueta (puede ser el siguiente <div> o <span>)
  let etiqueta = contador.nextElementSibling;
  if (!etiqueta || !etiqueta.textContent.includes("Unidad")) {
    // búsqueda más robusta si el HTML cambia
    etiqueta = document.querySelector(".scard-label");
  }
  if (!etiqueta) return;

  // Obtener valor numérico limpio (soporta formato "1 234")
  const valorTexto = contador.textContent.replace(/\s+/g, '');
  const valor = parseInt(valorTexto || "0", 10);

  // Cambiar texto según singular o plural
  if (valor === 1) {
    etiqueta.textContent = "Unidad Administrativa";
  } else {
    etiqueta.textContent = "Unidades Administrativas";
  }
}

// --- Abre variables.html en otra pestaña ---
function handleVariableClick(idPp) {
  window.open(`variables.html?idPp=${encodeURIComponent(idPp)}`, '_blank');
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

// ======== Resumen: helpers de animación y actualización ========

// contador con animación suave (ahora formatea con espacios)
function animateCountTo(elOrSelector, toValue, ms = 350) {
  const el = (typeof elOrSelector === 'string') ? document.querySelector(elOrSelector) : elOrSelector;
  if (!el) return;

  const from = parseInt(String(el.textContent || '').replace(/\D/g,'')) || 0;
  const to = Math.max(0, Number(toValue) || 0);

  if (ms <= 0 || from === to) {
    el.textContent = formatNumberWithSpace(to);
    return;
  }

  const start = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const value = Math.round(from + (to - from) * t);
    el.textContent = formatNumberWithSpace(value);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// fija "Unidades Administrativas" una sola vez (o calcula del DOM si prefieres)
function initSummaryStaticCounters() {
  setSummaryDefaults();
  const totalUnidades = document.querySelectorAll(
    '.card-unidad, .card.disabled[data-grupo]'
  ).length || 5;
  const el = document.getElementById('scUnidades');
  if (el) el.textContent = formatNumberWithSpace(totalUnidades);
}

// Actualiza los 3 counters dinámicos de la unidad seleccionada
// - procesosTotales: todos los procesos de la unidad (sin filtrar por variables)
// - procesosAmbientales: solo procesos con >0 variables
// - totalVariables: suma de variables de los procesos de la unidad
function updateSummaryCounters({ procesosTotales, procesosAmbientales, totalVariables }) {
  animateCountTo('#scProcesosTotales', procesosTotales);
  animateCountTo('#scProcesosAmbientales', procesosAmbientales);
  animateCountTo('#scVariablesAmbientales', totalVariables);
}

// Utilidad: suma variables solo de los procesos dados
function sumVariablesForProcesos(procesos, conteoGlobal) {
  const ids = new Set((procesos||[]).map(p => p.idPp));
  let sum = 0;
  ids.forEach(id => { sum += (conteoGlobal[id] || 0); });
  return sum;
}

// ===== Spinners individuales por contador =====
const COUNTER_IDS = ['scUnidades','scProcesosTotales','scProcesosAmbientales','scVariablesAmbientales'];

function showCounterSpinner(id){
  const el = document.getElementById(id);
  if (!el) return;
  if (el.dataset.spinning === '1') return;
  el.dataset.prev = el.textContent;      // guarda el valor previo (con formato)
  el.dataset.spinning = '1';
  el.innerHTML = '<div class="spinner-border" role="status" aria-hidden="true"></div>';
}

function hideCounterSpinner(id){
  const el = document.getElementById(id);
  if (!el) return;
  if (el.dataset.spinning !== '1') return;
  el.dataset.spinning = '0';
  // restaura lo anterior, si no existe muestra 0 formateado
  el.innerHTML = el.dataset.prev ?? formatNumberWithSpace(0);
  delete el.dataset.prev;
}

// helpers para todos
function showAllSummarySpinners(){
  COUNTER_IDS.forEach(showCounterSpinner);
}
function hideAllSummarySpinners(){
  COUNTER_IDS.forEach(hideCounterSpinner);
}


// ======== Estado de unidad seleccionada y spinner global ========
let unidadSeleccionada = null; // 'socio' | 'eco' | null


// --- Título dinámico "Procesos de Producción ..." ---
function setProcesosTitle(unidad) {
  const el = document.getElementById('procesosTitle');
  if (!el) return;

  const base = 'Procesos de Producción';
  let sufijo = '';

  if (unidad === 'socio') {
    sufijo = ' de la Unidad de Estadísticas Sociodemográficas';
  } else if (unidad === 'eco') {
    sufijo = ' de la Unidad de Estadísticas Económicas';
  } // si es null/otro, sin sufijo

  el.textContent = base + sufijo;
}

function hasValidDesc(desc) {
  if (desc === undefined || desc === null) return false;
  const s = String(desc).trim().toLowerCase();
  if (!s) return false;
  if (s === '-' || s === 'null' || s === 'na') return false;
  return true;
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

  // Guardamos objetivo por separado
  const objetivo = (item.objetivo || '').trim() || null;
  const pobjeto  = (item.pobjeto  || '').trim() || null;

  // Para descPp usamos primero objetivo, luego pobjeto como respaldo
  const desc = objetivo || pobjeto || null;

  return {
    idPp: item.acronimo || "SD",
    pi: item.proceso || "No disponible",
    pp: item.proceso || "No disponible",
    dgaRespPp: null,
    perioProd: null,
    vigInicial: item.inicio ? String(item.inicio).slice(0, 4) : null,
    vigFinal: item.fin 
      ? (/^\d{4}/.test(String(item.fin)) ? String(item.fin).slice(0, 4) : String(item.fin)) 
      : null, 
    metGenInf: item.metodo || null,
    gradoMadur: grado,
    perPubResul: perPub || "No disponible",
    estatus: item.estatus || "Activo",

    // 👇 aquí va lo que usará la cara trasera
    descPp: desc || "No disponible",
    objetivo,          // <- campo extra por si lo quieres usar directo
    pobjeto,           // opcional

    comentPp: item.comentarioS || item.comentarioA || "-",
    responCaptura: null,
    _source: 'economicas',
    _unidad: item.unidad || null,
  };
}

// --- Render de tarjetas  ---
// --- Render de tarjetas  ---
function renderProcesos(procesos, conteo, container) {
  const counter = document.getElementById("procesosCounter");
  if (counter) counter.textContent = formatNumberWithSpace(procesos.length);
  container.innerHTML = "";

  if (!procesos.length) {
    container.innerHTML = `<div class="alert alert-warning text-center">No se encontraron procesos con estas caracteristicas</div>`;
    return;
  }


  procesos.forEach(proceso => {
    let extension = "png";
    const baseName = `/assets/${proceso.idPp}`;
    const iconoFallback = `/assets/no_disponible.png`;
    const iconoRutaMin = `${baseName}.${extension}`;
    const iconoRutaMay = `${baseName}.${extension.toUpperCase()}`;
    const iconoHTML = `
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

   const totalVars = conteo[proceso.idPp] || 0;

    const isEco   = (proceso._source === 'economicas');
    const isSocio = !isEco;

    const backText = isEco
      ? (proceso.objetivo || proceso.descPp || '')
      : (proceso.descPp || '');

    const canFlip = hasValidDesc(backText);
    const backLabel = isEco ? 'Objetivo:' : 'Descripción del proceso:';

    // FRONT
   const front = `
  <div class="flip-side flip-front">
    <div class="card h-100 shadow-sm rounded-3 position-relative proceso-card">

      ${proceso.gradoMadur === "Información de Interés Nacional" ? `
        <span class="badge bg-secondary position-absolute top-0 start-0 m-2"
              style="z-index:2; cursor: help;"
              data-bs-toggle="tooltip"
              data-bs-placement="right"
              title="Información de Interés Nacional">IIN</span>` : ""}

      <div class="card-body proceso-body">
        <!-- TÍTULO debajo del badge, ocupando todo el ancho -->
        <h5 class="card-title proceso-title fw-bold mb-2">
          ${proceso.pp || "Desconocido"}
        </h5>

        <!-- FILA: icono a la izquierda, info a la derecha -->
        <div class="row g-0 align-items-center">
          <div class="col-4 d-flex justify-content-center">
            ${iconoHTML}
          </div>
          <div class="col-8 ps-2">
            <div class="proceso-meta">
              <p class="card-text text-muted mb-1 small">
                ${proceso.idPp}
              </p>
              <p class="card-text mb-1 small">
                <strong>Estatus:</strong>
                <span class="badge ${getStatusClass(proceso.estatus)}">
                  ${proceso.estatus}
                </span>
              </p>
              <p class="card-text mb-1 small">
                <strong>Periodicidad:</strong>
                ${proceso.perioProd || "No disponible"}
              </p>
              <p class="card-text mb-1 small">
                <strong>Vigencia:</strong>
                ${mostrarVigencia(proceso.vigInicial, proceso.vigFinal)}
              </p>
              <p class="card-text mb-0 small">
                <strong>Total de variables ambientales:</strong>
                <span style="color: #08739c; font-family: 'Monaco', monospace; font-weight: bold; font-size: 1.1rem; text-decoration: underline; cursor: pointer;"
                      onclick="handleVariableClick('${proceso.idPp}')">
                  ${formatNumberWithSpace(totalVars)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      ${canFlip ? `
      <button type="button"
              class="btn btn-sm btn-outline-primary btn-flip"
              data-flip="1"
              title="Ver más información">
        <i class="bi bi-arrow-repeat"></i>
      </button>` : ``}
    </div>
  </div>
`;

    // BACK (solo si hay texto válido)
    const back = canFlip ? `
      <div class="flip-side flip-back">
        <div class="card h-100 shadow-sm rounded-3 p-3 position-relative proceso-card">
          <h6 class="fw-bold mb-2">
            ${proceso.pp || proceso.pi || proceso.idPp || 'Proceso'}
          </h6>
          <div class="proceso-desc small text-secondary">
            <strong>${backLabel}</strong><br>
            ${backText}
          </div>

          <button type="button"
                  class="btn btn-sm btn-outline-secondary btn-unflip"
                  data-unflip="1"
                  title="Volver">
            <i class="bi bi-arrow-90deg-left"></i>
          </button>
        </div>
      </div>
    ` : '';

    const card = `
      <div class="col-md-4 mb-4">
        <div class="flip-wrap">
          <div class="flip-card">
            ${front}
            ${back}
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', card);
  });

  // Tooltips Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el));
}


// --- Filtros y orden: reusables para cualquier lista de procesos ---
function wireFiltrosYOrden({ procesosGlobal, conteoGlobal, container }) {
  const selectPerio = document.getElementById("filtrarPeriodicidad");
  const ordenarSel  = document.getElementById("ordenarProcesos");

  // Llenar periodicidades únicas...
  selectPerio.innerHTML = `<option value="">Filtrar por periodicidad...</option>`;
  const periodicidadesUnicas = [...new Set(
    procesosGlobal.map(p => p.perPubResul).filter(Boolean)
  )].sort();
  periodicidadesUnicas.forEach(periodo => {
    const option = document.createElement("option");
    option.value = periodo;
    option.textContent = periodo;
    selectPerio.appendChild(option);
  });

  // ✅ Establece el orden por defecto a A-Z la primera vez
  if (!ordenarSel.dataset.init) {
    ordenarSel.value = "az";
    ordenarSel.dataset.init = "1";
  }

  function aplicarFiltrosYOrden() {
    let filtrados = [...procesosGlobal];

    const estatus      = document.getElementById("filtrarEstatus").value;
    const periodicidad = document.getElementById("filtrarPeriodicidad").value;
    const soloIIN      = document.getElementById("iinCheck").checked;
    let   orden        = document.getElementById("ordenarProcesos").value;

    if (estatus) {
      filtrados = filtrados.filter(p => (p.estatus || "").toLowerCase() === estatus.toLowerCase());
    }
    if (periodicidad) {
      filtrados = filtrados.filter(p => (p.perPubResul || "") === periodicidad);
    }
    if (soloIIN) {
      filtrados = filtrados.filter(p => (p.gradoMadur || "").toLowerCase() === "información de interés nacional");
    }

    // ✅ Si por alguna razón no hay valor, fuerza 'az'
    if (!orden) orden = "az";

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

  // Eventos...
  document.getElementById("filtrarEstatus").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("filtrarPeriodicidad").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("iinCheck").addEventListener("change", aplicarFiltrosYOrden);
  document.getElementById("ordenarProcesos").addEventListener("change", aplicarFiltrosYOrden);

  // Botón para restablecer filtros (si existe en el DOM)
  const resetBtn = document.getElementById("resetFiltrosBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Restaurar controles a valores por defecto
      const estatusEl = document.getElementById("filtrarEstatus");
      if (estatusEl) estatusEl.value = "";

      if (selectPerio) selectPerio.value = "";

      const iinEl = document.getElementById("iinCheck");
      if (iinEl) iinEl.checked = false;

      if (ordenarSel) {
        ordenarSel.value = "az";
        ordenarSel.dataset.init = "1";
      }

      // si hay un input de búsqueda, limpiar también (id ejemplo: buscarVariable)
      const buscar = document.getElementById("buscarVariable");
      if (buscar) buscar.value = "";

      // volver a aplicar filtros y re-render
      aplicarFiltrosYOrden();

      // opcional: devolver foco a primer control
      if (selectPerio) selectPerio.focus();
    });
  }

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

    // Calcula los totales (pero procesosTotales fijo = 45)
    const procesosTotales = 45; // fijo para esta unidad
    const procesosAmbientales = procesos.filter(p => (conteoGlobal[p.idPp] || 0) > 0).length;
    const totalVariables = sumVariablesForProcesos(procesos, conteoGlobal);

    // Oculta loader del listado y pinta tarjetas
    wireFiltrosYOrden({ procesosGlobal: procesos, conteoGlobal, container });

    // 🔹 Actualiza contadores al terminar
    hideAllSummarySpinners();                 // quita spinners primero
    animateCountTo('#scUnidades', 1, 0);      // Unidades = 1 (inmediato)
    actualizarEtiquetaUnidades();
    updateSummaryCounters({
      procesosTotales,                        // fijo 45
      procesosAmbientales,
      totalVariables
    });
    renderContadorVariablesUnidad(conteoGlobal, { animateMs: 350 });

  } catch (err) {
    hideAllSummarySpinners();
    removeLoader();
    console.error("Error cargando sociodemográficas", err);
    container.innerHTML = "<p class='text-danger text-center my-4'>Error al cargar los procesos.</p>";
  }
}


// --- Nuevo: Renderiza contador de variables ambientales por unidad ---
// --- Contador de variables por unidad (sin re-inicializaciones tardías) ---
function renderContadorVariablesUnidad(conteoGlobal, { animateMs = 350 } = {}) {
  const el = document.getElementById("contadorVariablesUnidad");
  if (!el) return;

  // Cancela animaciones/tiempos previos
  if (contadorAnimFrame) cancelAnimationFrame(contadorAnimFrame);
  if (contadorTimeoutId) clearTimeout(contadorTimeoutId);
  contadorAnimFrame = null;
  contadorTimeoutId = null;

  const total = Object.entries(conteoGlobal)
    .filter(([_, count]) => typeof count === "number" && count > 0)
    .reduce((acc, [, count]) => acc + count, 0);

  // Animación simple 0 -> total (opcional)
  const start = performance.now();
  const from = 0;
  const to = total;
  const myToken = unidadToken; // captura la versión actual

  const step = (now) => {
    // si cambió la versión (nueva carga), aborta esta animación
    if (myToken !== unidadToken) return;

    const t = Math.min(1, (now - start) / animateMs);
    const value = Math.round(from + (to - from) * t);
    el.textContent = formatNumberWithSpace(value);

    if (t < 1) {
      contadorAnimFrame = requestAnimationFrame(step);
    } else {
      contadorAnimFrame = null;
    }
  };

  // Si no quieres animación, pon animateMs = 0
  if (animateMs > 0) {
    el.textContent = formatNumberWithSpace(0);
    contadorAnimFrame = requestAnimationFrame(step);
  } else {
    el.textContent = formatNumberWithSpace(total);
  }
}



// --- Carga ECONÓMICAS (Base de datos nueva) ---
async function cargarEconomicas({ container }) {
  renderLoader(container, "Cargando procesos (Económicas)...");
  const urlProcesos = "http://10.109.1.13:1024/api/procesos/buscar?unidad=" +
                      encodeURIComponent("Unidad de Estadísticas Económicas");
  const urlVariablesEco = "http://10.109.1.13:1024/api/indicadores/ultima";

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

    procesos.forEach(p => { if (!(p.idPp in conteoGlobal)) conteoGlobal[p.idPp] = 0; });

    const procesosTotales = procesos.length;
    const procesosFiltrados = filtrarEconomicasSinVariables(procesos, conteoGlobal);
    const totalVariables = sumVariablesForProcesos(procesosFiltrados, conteoGlobal);

    // 🔹 Actualiza contadores individuales
    hideAllSummarySpinners();
    animateCountTo('#scUnidades', 1, 0);
    actualizarEtiquetaUnidades();
    updateSummaryCounters({
      procesosTotales,
      procesosAmbientales: procesosFiltrados.length,
      totalVariables
    });
    renderContadorVariablesUnidad(conteoGlobal, { animateMs: 350 });

    if (procesosFiltrados.length === 0) {
      removeLoader();
      container.innerHTML = `<div class="alert alert-info text-center">
        No hay procesos de la Unidad de Estadísticas Económicas con variables ambientales (&gt; 0).
      </div>`;
      const counter = document.getElementById("procesosCounter");
      if (counter) counter.textContent = formatNumberWithSpace(0);
      return;
    }

    wireFiltrosYOrden({ procesosGlobal: procesosFiltrados, conteoGlobal, container });

  } catch (err) {
    hideAllSummarySpinners();
    removeLoader();
    console.error("Error cargando Económicas", err);
    container.innerHTML = "<p class='text-danger text-center my-4'>Error al cargar los procesos (Económicas).</p>";
  }
}

function resetToGlobalView() {
  unidadSeleccionada = null;
  setProcesosTitle(null);
  setActiveUnidadCard(null);

  const seccion = document.getElementById("procesosSection");
  const container = document.getElementById("procesosContainer");
  if (container) container.innerHTML = "";
  if (seccion) seccion.hidden = true;

  hideAllSummarySpinners();

  // 🔹 Restaurar los valores globales de entrada
  animateCountTo('#scUnidades', GLOBAL_DEFAULTS.unidades, 0);
  animateCountTo('#scProcesosTotales', GLOBAL_DEFAULTS.procesosTotales, 0);
  animateCountTo('#scProcesosAmbientales', GLOBAL_DEFAULTS.procesosAmbientales, 0);
  animateCountTo('#scVariablesAmbientales', GLOBAL_DEFAULTS.variablesAmbientales, 0);

  // 🔹 Actualizar el texto del contador (singular/plural)
  actualizarEtiquetaUnidades();
}

// --- Arranque DOM ---
document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".navbar-nav .nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) link.classList.add("active");
  });

  const seccionProcesos = document.getElementById("procesosSection");
  const container = document.getElementById("procesosContainer");
  const btnSocio = document.getElementById("btnDireccionSociodemograficas");
  const btnEco   = document.getElementById("btnDireccionEconomicas");

  // Inicializa contadores globales dinamicos
   initSummaryStaticCounters(); // fija "Unidades Administrativas"

  // Handler común con candado + token
 const handleUnidadClick = async (btnEl, loaderFn, claveUnidad) => {
  if (isCargandoUnidad) return;

  // ¿segundo clic sobre la misma card? => deseleccionar (volver a global)
  const yaSeleccionada = btnEl.classList.contains('card-selected')
                      && unidadSeleccionada === claveUnidad;
  if (yaSeleccionada) {
    resetToGlobalView();   // vuelve a los 4 contadores globales y oculta la sección
    return;
  }

  // Seleccionar (o cambiar de unidad)
  isCargandoUnidad = true;
  unidadToken++;
  unidadSeleccionada = claveUnidad;

  // UI inmediata
  setActiveUnidadCard(btnEl);
  setProcesosTitle(claveUnidad);
  showAllSummarySpinners();
  prepararSeccion();                 // <- asegura seccion visible y limpia contenedor

  try {
    // IMPORTANTE: usa el 'container' ya tomado arriba (no lo busques de nuevo)
    await loaderFn({ container });
  } catch (err) {
    console.error("Error cargando unidad", err);
    container.innerHTML = "<p class='text-danger text-center my-4'>Error al cargar los procesos.</p>";
    hideAllSummarySpinners();
  } finally {
    isCargandoUnidad = false;
  }
};


  // Para evitar re-binds si este bloque se ejecutara dos veces por alguna razón:
 if (!btnSocio?.dataset.bound) {
    btnSocio.addEventListener("click", () => handleUnidadClick(btnSocio, cargarSociodemograficas, 'socio'));
    btnSocio.dataset.bound = "1";
  }
  if (!btnEco?.dataset.bound) {
    btnEco.addEventListener("click", () => handleUnidadClick(btnEco, cargarEconomicas, 'eco'));
    btnEco.dataset.bound = "1";
  }



  document.querySelectorAll('.mostrarGrupoBtn').forEach(card => {
    if (card.id === "btnDireccionSociodemograficas" || card.id === "btnDireccionEconomicas") return;
    if (!card.dataset.bound) {
      card.addEventListener('click', function () {
        alert("Información no disponible");
      });
      card.dataset.bound = "1";
    }
  });

  
    function prepararSeccion() {
    const seccionProcesos = document.getElementById("procesosSection");
    const container = document.getElementById("procesosContainer");
    if (!seccionProcesos) return;

    seccionProcesos.hidden = false;
    seccionProcesos.scrollIntoView({ behavior: 'smooth' });

    if (container) container.innerHTML = "";

    const counter = document.getElementById("procesosCounter");
    if (counter) counter.textContent = formatNumberWithSpace(0);

    const selPer = document.getElementById("filtrarPeriodicidad");
    if (selPer) selPer.innerHTML = `<option value="">Filtrar por periodicidad...</option>`;

    const contadorUnidad = document.getElementById("contadorVariablesUnidad");
    if (contadorUnidad) contadorUnidad.textContent = formatNumberWithSpace(0);

    if (contadorAnimFrame) cancelAnimationFrame(contadorAnimFrame);
    if (contadorTimeoutId) clearTimeout(contadorTimeoutId);
    contadorAnimFrame = null;
    contadorTimeoutId = null;
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

// --- Selección visual de cards de Unidad ---
function setActiveUnidadCard(cardEl, persist = false) {
  document.querySelectorAll('.card-unidad.card-selected').forEach(el => {
    el.classList.remove('card-selected');
    el.setAttribute('aria-pressed', 'false');
  });

  if (cardEl) {
    cardEl.classList.add('card-selected');
    cardEl.setAttribute('aria-pressed', 'true');
    if (persist && cardEl.id) {
      try { localStorage.setItem('unidadActiva', cardEl.id); } catch (e) {}
    }
  }
}


// Restaura selección si existiera (opcional)
function restoreUnidadCardSelection() {
  try {
    const saved = localStorage.getItem('unidadActiva');
    if (!saved) return;
    const el = document.getElementById(saved);
    if (el && el.classList.contains('card-unidad')) {
      setActiveUnidadCard(el, /*persist*/false);
    }
  } catch (e) {}
}

// Delegación: click en botones de flip/unflip dentro del contenedor de procesos
document.addEventListener('click', (e) => {
  const flipBtn = e.target.closest('[data-flip]');
  const unflipBtn = e.target.closest('[data-unflip]');

  if (flipBtn || unflipBtn) {
    e.preventDefault();
    e.stopPropagation();

    const flipCard = e.target.closest('.flip-wrap')?.querySelector('.flip-card');
    if (!flipCard) return;

    if (flipBtn)   flipCard.classList.add('flipped');
    if (unflipBtn) flipCard.classList.remove('flipped');
  }
});