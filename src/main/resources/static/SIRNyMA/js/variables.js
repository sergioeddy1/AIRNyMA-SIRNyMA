document.addEventListener("DOMContentLoaded", function () {
  // Elementos del DOM
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const container = document.getElementById("variablesContainer");
  const paginationContainer = document.getElementById("pagination");
  const processSelect = document.getElementById("processSelect");
  const temaSelect = document.getElementById("temaSelect");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  const unidadSection = document.getElementById("unidadAdministrativaSection");
  const sortSelect = document.getElementById("sortOptions");
  const alinMdeaCheckbox = document.getElementById("alinMdeaCheckbox");
  const alinOdsCheckbox = document.getElementById("alinOdsCheckbox");

  // Variables globales
  const params = new URLSearchParams(window.location.search);
  let itemsPerPage = parseInt(itemsPerPageSelect.value, 15);
  let currentPage = 1;
 
  let allData = [];
  let currentFilteredData = [];

  let currentSearchTerm = ""; // término activo para <mark>

// Apartado de filtros colapsable
 const toggleBtn = document.querySelector('[data-bs-target="#procCollapse"]');
    const collapseEl = document.getElementById('procCollapse');
    const labelEl = toggleBtn?.querySelector('.collapse-label');

    if (collapseEl && toggleBtn && labelEl) {
      collapseEl.addEventListener('shown.bs.collapse', () => { labelEl.textContent = 'Ocultar'; });
      collapseEl.addEventListener('hidden.bs.collapse', () => { labelEl.textContent = 'Mostrar'; });
    }
 
let renderLocked        = false;  // evita renders mientras aplicamos URL
let initialPaintDone    = false;  // ya hicimos el primer render “válido”


  // ==== PARCHE: globals seguros (evita "is not defined") ====
let procesosGlobal = window.procesosGlobal || [];

// Filtro por unidad: 'todas' | 'socio' | 'eco'
let unidadFiltro = 'todas';

// Sets por unidad (globales)
let socioSet = new Set();
let ecoSet   = new Set();

let clasifIndex = new Map();

function rebuildClasifIndex() {
  clasifIndex = new Map();
  const rows = (window.clasificacionesGlobal || []);
  rows.forEach(row => {
    const idVar = String(row.idVar);
    // El campo puede venir como "clasificaciones" (socio) o como string de econ ya mapeada
    const val = (row.clasificaciones || row.clase || row.clasificacion || "").toString().trim();
    if (!val) return;
    if (!clasifIndex.has(idVar)) clasifIndex.set(idVar, []);
    clasifIndex.get(idVar).push(val);
  });
}

  // Determina a qué unidad pertenece una variable
  function getUnidadDeVariable(variable) {
    // a) Económicas que vienen de la API nueva
    if (variable && variable._source === 'economicas-ultima') return 'eco';

    // b) Variables locales: inferimos por su proceso (si ese proceso proviene de 'economicas')
    try {
      const proc = Array.isArray(procesosGlobal)
        ? procesosGlobal.find(p => String(p.idPp) === String(variable.idPp))
        : null;
      if (proc && proc._source === 'economicas') return 'eco';
    } catch {}

    // c) Predeterminado: sociodemográficas
    return 'socio';
  }

  const radioSocio = document.getElementById("infoDemografica");
  const radioEco   = document.getElementById("infoEconomica");



  // Listeners
 radioSocio.addEventListener("change", () => {
  unidadFiltro = "socio";
  const temaActual = (temaSelect.value && temaSelect.value !== "Seleccione una temática") ? temaSelect.value : "";
  filtrarProcessSelectPorTema(temaActual);  // unidad + tema
  applyFilters();
  });

  radioEco.addEventListener("change", () => {
    unidadFiltro = "eco";
    const temaActual = (temaSelect.value && temaSelect.value !== "Seleccione una temática") ? temaSelect.value : "";
    filtrarProcessSelectPorTema(temaActual);  // unidad + tema
    applyFilters();
  });
  // ==== PARCHE: helpers faltantes usados más abajo ====




  function filterByUnidad(data) {
    if (!Array.isArray(data)) return [];
    if (unidadFiltro === 'todas') return data;
    return data.filter(v => getUnidadDeVariable(v) === (unidadFiltro === 'socio' ? 'socio' : 'eco'));
  }

  // ==== HELPERS: mapear API /indicadores/ultima al shape local de /api/variables ====

  function mapUltimaVariableToLocal(v, eventosList = []) {
    // ... (lo que ya tienes)
    const years = (Array.isArray(eventosList) ? eventosList : [])
      .map(e => parseInt(String(e.anioEvento ?? e.evento ?? '').trim(), 10))
      .filter(Number.isFinite);

    const minY = years.length ? Math.min(...years) : (v.anioReferencia || null);
    const maxY = years.length ? Math.max(...years) : (v.anioReferencia || new Date().getFullYear());

    function safeNameFromUrl(u) {
      try {
        if (!u || !/^https?:/i.test(String(u))) return null;
        const url = new URL(u);
        return url.searchParams.get("name");
      } catch { return null; }
    }

    const codIdenVar =
      (Array.isArray(v.microdatosList) && v.microdatosList[0]?.campo)
        ? v.microdatosList[0].campo
        : safeNameFromUrl(v.url);

      const clasificaciones =
      Array.isArray(v.clasificacionesList) && v.clasificacionesList.length > 0
        ? v.clasificacionesList
            .map(c => c.clase || c.clasificacion || c.nombre || "")
            .filter(c => c && c.trim() !== "")
        : [];

    return {
      idVar: v.idS || v.idA || (v.acronimo ? `${v.acronimo}-SD` : "SD"),
      idPp: v.acronimo || "SD",
      nomVar: v.variableA || v.variableS || "No disponible",
      tipoVar: "Primaria",
      codIdenVar,
      pregLit: v.pregunta || "-",
      tema: v.tema1 || null,
      subtema: v.subtema1 || null,
      tema2: v.tema2 || null,
      subtema2: v.subtema2 || null,
      categoria: v.universo || "-",
      varAsig: v.variableA || v.variableS || "No disponible",
      defVar: v.definicion || "-",
      fuente: v.fuente || "-",
      metodoCal: v.metodologia || "-",

      relTab: v.tabulados ? "Sí" : "No",
      relMicro: v.microdatos ? "Sí" : "No",
      alinMdea: v.mdea ? "Sí" : "No",
      alinOds: v.ods ? "Sí" : "No",
      comentVar: v.comentarioA || v.comentarioS || "-",

      vigInicial: minY ? String(minY) : null,
      vigFinal: years.length ? String(maxY) : "A la fecha",

      _source: "economicas-ultima",

      _microdatosList: Array.isArray(v.microdatosList) ? v.microdatosList : [],
      _tabuladosList: Array.isArray(v.tabuladosList) ? v.tabuladosList : [],
      _mdeasList: Array.isArray(v.mdeasList) ? v.mdeasList : [],
      _odsList: Array.isArray(v.odsList) ? v.odsList : [],

      // 👇 NUEVO: incluir las clasificaciones para usarlas como en /api/clasificaciones
      _clasificacionesList: clasificaciones,
      _eventosList: Array.isArray(eventosList) ? eventosList : [], // [{evento: 2023}, ...]
       _anioReferencia: Number.isFinite(v.anioReferencia) ? v.anioReferencia : null
    };
  }


  async function fetchVariablesDesdeUltima() {
    const urlUltima = "http://10.109.1.13:3002/api/indicadores/ultima";
    const res = await fetch(urlUltima);
    if (!res.ok) throw new Error(`ultima respondió ${res.status}`);
    const payload = await res.json();

    const registros = Array.isArray(payload) ? payload : [payload];
    const out = [];
    for (const reg of registros) {
      const lista = Array.isArray(reg.variableList) ? reg.variableList : [];
      const evs = Array.isArray(reg.eventosList) ? reg.eventosList : [];
      for (const v of lista) out.push(mapUltimaVariableToLocal(v, evs));
    }
    return out;
  }

  function mergeVariablesLocalYUltima(locales = [], ultima = []) {
    const map = new Map();
    // mete primero ultima (para que luego locales "pisen" si hay misma idVar)
    for (const v of (ultima || [])) if (v) {
      map.set(v.idVar || v.idS || v.idA, v);
    }
    for (const v of (locales || [])) if (v && v.idVar) {
      map.set(v.idVar, v);
    }
    return Array.from(map.values());
  }

  // 🔁 Integrar las clasificaciones de variables económicas
function mergeClasificacionesEconomicas(variablesUltima) {
  const ecoClasifs = [];

  (variablesUltima || []).forEach(v => {
    if (Array.isArray(v._clasificacionesList) && v._clasificacionesList.length) {
      v._clasificacionesList.forEach(cl => {
        ecoClasifs.push({
          idVar: v.idVar,
          clasificaciones: cl,
          _source: "economicas-ultima"
        });
      });
    }
  });

  // Fusiona con las ya existentes (socio)
  window.clasificacionesGlobal = (window.clasificacionesGlobal || []).concat(ecoClasifs);
}

  // Devuelve la "base" de variables para poblar el select de temáticas
function getBaseParaTemas() {
  let base = Array.isArray(allData) ? allData : [];

  // 1) Filtrar por unidad (usa tu getUnidadDeVariable)
  if (unidadFiltro === 'socio') {
    base = base.filter(v => getUnidadDeVariable(v) === 'socio');
  } else if (unidadFiltro === 'eco') {
    base = base.filter(v => getUnidadDeVariable(v) === 'eco');
  }

   // 2) (Opcional) Filtrar por procesos actualmente seleccionados
  const selectedProcesses = Array.from(processSelect?.selectedOptions || []).map(o => o.value);
  if (selectedProcesses.length) {
    base = base.filter(v => selectedProcesses.includes(v.idPp));
  }

  return base;
}

function repoblarTematicas() {
  if (!temaSelect) return;

  const prev = temaSelect.value; // guarda selección anterior
  const base = getBaseParaTemas();
  let temas = collectTematicas(base);

  // 🧹 Filtra vacíos, nulos o con solo guiones
  temas = temas.filter(t => t && t.trim() !== "" && t.trim() !== "-");

  // Elimina duplicados y ordena alfabéticamente
  temas = [...new Set(temas)].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  // Reconstruye opciones
  temaSelect.innerHTML = "";
  const placeholder = document.createElement('option');
  placeholder.value = "";
  placeholder.textContent = "Seleccione una temática";
  temaSelect.appendChild(placeholder);

  temas.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    temaSelect.appendChild(opt);
  });

  // Restaura selección si aún existe
  if (prev && temas.includes(prev)) {
    temaSelect.value = prev;
  } else {
    temaSelect.value = ""; // vuelve al placeholder
  }
}


// Devuelve el Set de idPp permitidos según la unidad (socio/eco/todas)
function allowedPpsPorUnidad() {
  const base = new Set();
  (procesosGlobal || []).forEach(p => {
    const esEco = p._source === 'economicas';
    if (unidadFiltro === 'eco' && !esEco) return;
    if (unidadFiltro === 'socio' && esEco) return;
    base.add(p.idPp);
  });
  return base;
}

// Devuelve un Set de idPp que tienen variables con la temática seleccionada
function procesosParaTema(selectedTema) {
  const pps = new Set();
  if (!selectedTema) return pps;

  // 1) Filtra por unidad primero (si aplica)
  const allowedByUnidad = allowedPpsPorUnidad();

  // 2) Busca variables que coincidan con la temática (tema o tema2)
  (allData || []).forEach(v => {
    const matchTema = (v.tema && v.tema === selectedTema) || (v.tema2 && v.tema2 === selectedTema);
    if (!matchTema) return;
    if (allowedByUnidad.size && !allowedByUnidad.has(v.idPp)) return; // respeta unidad
    if (v.idPp) pps.add(v.idPp);
  });

  return pps;
}

function filtrarProcessSelectPorTema(selectedTema) {
  // Si no hay tema, mostrar procesos según la unidad; si hay tema, mostrar sólo los que lo tienen
  const targetSet = selectedTema
    ? procesosParaTema(selectedTema)
    : allowedPpsPorUnidad();

  // Mostrar/ocultar opciones del select y quitar selecciones que ya no apliquen
  Array.from(processSelect.options).forEach(opt => {
    const permitido = targetSet.size === 0 ? true : targetSet.has(opt.value);
    opt.hidden = !permitido;
    if (!permitido && opt.selected) opt.selected = false;
  });

  // Series de años:
  // - Si quedan procesos seleccionados válidos → esos
  // - Si no hay nada seleccionado, pero hay un targetSet → usar todos los permitidos
  const stillSelected = Array.from(processSelect.selectedOptions).map(o => o.value);
  if (stillSelected.length > 0) {
    populatePeriodFilters(stillSelected);
  } else if (targetSet && targetSet.size) {
    populatePeriodFilters(Array.from(targetSet));
  } else {
    populatePeriodFilters([]); // fallback: todos
  }

  // Actualiza los chips y aplica filtros
  renderSelectedTags(Array.from(processSelect.selectedOptions));
  applyFilters();
}



  // ==== FIN HELPERS /indicadores/ultima ====

  // trae y aplana /indicadores/ultima → array de variables en shape local
  async function fetchVariablesDesdeUltima() {
    const urlUltima = "http://10.109.1.13:3002/api/indicadores/ultima";
    const res = await fetch(urlUltima);
    if (!res.ok) throw new Error(`ultima respondió ${res.status}`);
    const payload = await res.json();

    const registros = Array.isArray(payload) ? payload : [payload];
    const out = [];
    for (const reg of registros) {
      const lista = Array.isArray(reg.variableList) ? reg.variableList : [];
      const evs = Array.isArray(reg.eventosList) ? reg.eventosList : [];
      for (const v of lista) out.push(mapUltimaVariableToLocal(v, evs)); // 👈 pasa eventosList
    }
    return out;
  }


  // fusiona dos listas de variables y de‑duplica por idVar (prioriza locales)
  function mergeVariablesLocalYUltima(locales, ultima) {
    const map = new Map();
    for (const v of ultima)  map.set(v.idVar, v);
    for (const v of locales) map.set(v.idVar, v); // pisa con locales si hay misma idVar
    return Array.from(map.values());
  }
  // ==== FIN HELPERS /indicadores/ultima ====

  // Mapeo de procesos de economicas
  function mapEconomicasProcesoToLocal(item) {
    const perPub = (item.periodicidadpublicacion && item.periodicidadpublicacion.trim())
      ? item.periodicidadpublicacion.trim()
      : (item.periodicidad || null);

    const grado = (String(item.iin || '').toLowerCase() === 'sí' || String(item.iin || '').toLowerCase() === 'si')
      ? "Información de Interés Nacional"
      : null;

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

  async function fetchProcesosEconomicas() {
    const urlProcesosEco = "http://10.109.1.13:3002/api/procesos/buscar?unidad=" +
                           encodeURIComponent("Unidad de Estadísticas Económicas");
    const res = await fetch(urlProcesosEco);
    if (!res.ok) throw new Error("procesos Económicas respondió " + res.status);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(mapEconomicasProcesoToLocal);
  }

  function mergeProcesos(locales, economicas) {
    const map = new Map();
    // primero eco
    for (const p of economicas) map.set(p.idPp, p);
    // pisa con locales (si quieres priorizar locales)
    for (const p of locales)   map.set(p.idPp, p);
    return Array.from(map.values());
  }



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
function populatePeriodFilters(selectedProcessIds = []) {
  const periodInic = document.getElementById("periodInic");
  const periodFin  = document.getElementById("periodFin");
  if (!periodInic || !periodFin) return;

  // 1) Obtener series por proceso
  const yearsSet = new Set();

  // Si no se seleccionó nada, usar todos los procesos (union)
  const procesosFuente = (selectedProcessIds.length
    ? procesosGlobal.filter(p => selectedProcessIds.includes(p.idPp))
    : procesosGlobal
  );

  procesosFuente.forEach(proc => {
    const serie = getProcessYearSeries(proc); // respeta overrides/caps/periodicidad
    serie.forEach(y => yearsSet.add(y));
  });

  // Si no hay nada que mostrar, sal
  if (yearsSet.size === 0) {
    periodInic.innerHTML = '<option value="">Inicio</option>';
    periodFin.innerHTML  = '<option value="">Fin</option>';
    return;
  }

  // 2) Ordenar y limpiar selects
  const sortedYears = Array.from(yearsSet).sort((a,b)=>a-b);
  periodInic.innerHTML = '<option value="">Inicio</option>';
  periodFin.innerHTML  = '<option value="">Fin</option>';

  // 3) Rellenar opciones con los años calculados
  sortedYears.forEach(y => {
    periodInic.appendChild(new Option(y, y));
    periodFin.appendChild(new Option(y, y));
  });

  // 4) Selecciones por defecto (min y max)
  const minY = sortedYears[0];
  const maxY = sortedYears[sortedYears.length - 1];
  periodInic.value = String(minY);
  periodFin.value  = String(maxY);

  // 5) Asegurar rango válido si el usuario cambia
  periodInic.onchange = () => {
    const start = parseInt(periodInic.value, 10);
    const end   = parseInt(periodFin.value, 10);
    if (Number.isFinite(start) && Number.isFinite(end) && start > end) {
      // mover fin hacia el mismo inicio
      periodFin.value = String(start);
    }
  };
  periodFin.onchange = () => {
    const start = parseInt(periodInic.value, 10);
    const end   = parseInt(periodFin.value, 10);
    if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
      // mover inicio hacia el mismo fin
      periodInic.value = String(end);
    }
  };
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
        const varEnd = (variable.vigFinal && String(variable.vigFinal).includes("A la fecha"))
          ? new Date().getFullYear()
          : parseInt(variable.vigFinal);

        // Si no hay años válidos, NO la descartes (déjala pasar)
        if (isNaN(varStart) || isNaN(varEnd)) return true;

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

if (unidadSection) unidadSection.style.display = "block";

    //Mostrar y ocultar seccion de filtros Unidad administrativa dependiendo de condicional 
    function checkMostrarUnidadSection() {
    if (unidadSection) unidadSection.style.display = "block";
    }

    // —— Skeletons helpers ——

// Procesos (select) ----------------------
function showProcessSkeleton() {
  try {
    processSelect.setAttribute('disabled', 'true');
  } catch {}
  // evita duplicar
  if (document.getElementById('processSelectSkeleton')) return;

  const sk = document.createElement('div');
  sk.id = 'processSelectSkeleton';
  sk.className = 'skeleton skeleton-select';
  processSelect.insertAdjacentElement('afterend', sk);
}
function hideProcessSkeleton() {
  processSelect?.removeAttribute('disabled');
  document.getElementById('processSelectSkeleton')?.remove();
}

// Variables (listado) --------------------
function showVariablesSkeleton(count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton skeleton-card mb-3';
    container.appendChild(card);
  }
  // opcional: un par de chips fantasmas arriba/derecha
  const chipsRow = document.createElement('div');
  chipsRow.className = 'd-flex gap-2 mb-3';
  chipsRow.innerHTML = `<span class="skeleton skeleton-chip"></span>
                        <span class="skeleton skeleton-chip"></span>`;
  container.prepend(chipsRow);
}
function hideVariablesSkeleton() {
  // Limpia solo si el contenedor tiene puros skeletons
  const onlySkeletons = Array.from(container.children).every(
    n => n.classList && (n.classList.contains('skeleton') || n.querySelector?.('.skeleton'))
  );
  if (onlySkeletons) container.innerHTML = "";
}

// —— SPINNER en contador Total de Variables ——
function showCounterSpinner() {
  const cardBody = document.querySelector('#variableCounter .card .card-body');
  if (!cardBody || cardBody.querySelector('.counter-spinner')) return;

  const box = document.createElement('div');
  box.className = 'counter-spinner d-flex align-items-center gap-2 mt-1';
  box.innerHTML = `
    <div class="spinner-border spinner-border-sm text-secondary" role="status" aria-hidden="true"></div>
    <small class="text-secondary">Contando…</small>
  `;
  cardBody.appendChild(box);
}
function hideCounterSpinner() {
  document.querySelector('.counter-spinner')?.remove();
}

// —— SPINNER centrado en el listado de variables ——
function showListSpinner() {
  // no duplicar
  if (document.getElementById('listSpinner')) return;
  // asegurar posicionamiento relativo del contenedor
  if (!container.style.position) container.style.position = 'relative';

  const wrap = document.createElement('div');
  wrap.id = 'listSpinner';
  wrap.className = 'position-absolute top-50 start-50 translate-middle text-center';
  wrap.innerHTML = `
    <div class="spinner-border" role="status" aria-hidden="true"></div>
    <div class="mt-2 small text-secondary">Cargando variables…</div>
  `;
  container.appendChild(wrap);
}
function hideListSpinner() {
  document.getElementById('listSpinner')?.remove();
}

// 🔁 Permitir selección múltiple solo con clic (sin Ctrl)
processSelect.addEventListener("mousedown", function (e) {
  e.preventDefault(); // evita el comportamiento por defecto
  const option = e.target;
  if (option && option.tagName === "OPTION") {
    option.selected = !option.selected; // alterna selección
    processSelect.dispatchEvent(new Event("change")); // dispara evento manualmente
  }
});
let listenersWired = false;
// ✅ Listener de cambio del select de procesos
if (!listenersWired) {
  processSelect.addEventListener("change", () => {
    const selected = Array.from(processSelect.selectedOptions).map(o => o.value);
    populatePeriodFilters(selected);
    repoblarTematicas();
    handleProcessSelectChange(); // <-- mantiene el renderizado y contador
  });
  listenersWired = true;
}



function onUnidadChange() {
  unidadFiltro = radioSocio.checked ? 'socio' : (radioEco.checked ? 'eco' : 'todas');

  // Si los sets aún no se han poblado, deriva el allowedSet desde procesosGlobal
  let allowedSet = null;
  if (unidadFiltro === 'socio') {
    allowedSet = socioSet && socioSet.size ? socioSet
      : new Set((procesosGlobal || []).filter(p => getUnidadDeVariable({ idPp: p.idPp }) === 'socio').map(p => p.idPp));
  } else if (unidadFiltro === 'eco') {
    allowedSet = ecoSet && ecoSet.size ? ecoSet
      : new Set((procesosGlobal || []).filter(p => p._source === 'economicas').map(p => p.idPp));
  }

  // 1) Mostrar/ocultar opciones del select y quitar selecciones inválidas
  Array.from(processSelect.options).forEach(opt => {
    const allowed = (unidadFiltro === 'todas') ? true : (allowedSet ? allowedSet.has(opt.value) : true);
    opt.hidden = !allowed;
    if (!allowed && opt.selected) opt.selected = false;
  });

  // 2) Repoblar años:
  const stillSelected = Array.from(processSelect.selectedOptions).map(o => o.value);
  if (stillSelected.length > 0) {
    populatePeriodFilters(stillSelected);
  } else if (unidadFiltro !== 'todas' && allowedSet && allowedSet.size) {
    populatePeriodFilters(Array.from(allowedSet));
  } else {
    populatePeriodFilters([]); // todas las unidades
  }

  // (Opcional) limpia búsqueda/tema para evitar intersecciones imposibles
  searchInput.value = "";
  temaSelect.selectedIndex = 0;

  // En tu onUnidadChange (al final)
  repoblarTematicas();   // <- actualiza el select
  // 3) Aplicar filtros con la nueva base por unidad
  applyFilters();
    

  // 4) Asegurar visible
  if (unidadSection) unidadSection.style.display = "block";
}

radioSocio.addEventListener('change', onUnidadChange);
radioEco.addEventListener('change', onUnidadChange);


// Tras cargar procesos/variables:
populatePeriodFilters([]); // sin selección inicial -> usa unión de todos

// 🔍 Aplicar filtro desde la URL si hay `idPp`
let filtroURLAplicado = false;

function aplicarFiltroDesdeURL() {
  if (filtroURLAplicado) return;
  const urlParams    = new URLSearchParams(window.location.search);
  const selectedIdPp = urlParams.get("idPp");
  const searchTerm   = urlParams.get("search");

  // si no hay filtros en URL, solo dejar que el flujo normal pinte una vez
  if (!selectedIdPp && !searchTerm) return;

  // 🔒 bloquea renders “por defecto”
  renderLocked = true;

  const apply = () => {
    // 1) proceso (si viene)
    if (selectedIdPp) {
      Array.from(processSelect.options).forEach(opt => {
        opt.selected = (opt.value === selectedIdPp);
      });
      processSelect.dispatchEvent(new Event("change")); // esto ya pinta filtrado
    }

    // 2) search (si viene): se aplica sobre el estado actual (ya filtrado por proceso si lo había)
    if (searchTerm) {
      searchInput.value = searchTerm.trim();
      const base = (Array.isArray(currentFilteredData) && currentFilteredData.length)
        ? currentFilteredData
        : allData;

      const needle = searchTerm.toLowerCase();
      const filtered = base.filter(v =>
        (v.nomVar  && v.nomVar.toLowerCase().includes(needle)) ||
        (v.defVar  && v.defVar.toLowerCase().includes(needle)) ||
        (v.varAsig && v.varAsig.toLowerCase().includes(needle))
      );

      currentFilteredData = filtered;
      currentPage = 1;

      if (!filtered.length) {
        container.innerHTML = "<p class='text-center'>No se encontraron resultados para el término ingresado.</p>";
        paginationContainer.innerHTML = "";
        updateVariableCounter(0);
      } else {
        renderPage(currentFilteredData, currentPage);
        setupPagination(currentFilteredData);
        updateVariableCounter(filtered.length);
      }
    }

    // ✅ aplicar una única vez
    filtroURLAplicado = true;
    initialPaintDone  = true;

    // 🔓 suelta el candado
    renderLocked = false;
  };

  // esperamos a que select + datos estén listos
  const start = Date.now();
  (function waitReady(){
    const selectReady = processSelect && processSelect.options.length > 0;
    const dataReady   = Array.isArray(allData) && allData.length > 0;
    if (selectReady && dataReady) return apply();
    if (Date.now() - start > 10000) { // fallback por si algo falla
      renderLocked = false;
      return;
    }
    setTimeout(waitReady, 60);
  })();
}

// Utilidad

// ✅ Función central de cambio del select (REEMPLAZA LA TUYA)
function handleProcessSelectChange() {
  const selectedOptions = Array.from(processSelect.selectedOptions);
  renderSelectedTags(selectedOptions);   // chips
  checkMostrarUnidadSection();           // si lo necesitas visible siempre
  applyFilters();                        // 👈 aquí se combinan unidad + temática + proceso + demás
}

// Renderiza los "chips" de procesos seleccionados
function renderSelectedTags(selectedOptions) {
  const chips = document.getElementById("processSelectContainer");
  if (!chips) return;
  chips.replaceChildren(); // limpia seguro

  selectedOptions.forEach((opt) => {
    // Toma el texto visible del <option>
    const label =
      (typeof opt.label === "string" && opt.label.trim()) ? opt.label :
      (typeof opt.text  === "string" && opt.text.trim())  ? opt.text  :
      (opt.textContent || "").trim()                      ? opt.textContent.trim() :
      String(opt.value);

    const tag = document.createElement("span");
    tag.className = "badge bg-primary d-inline-flex align-items-center me-2 mb-1";
    tag.style.paddingRight = "0.5rem";

    // 🔒 No uses innerHTML para el texto; usa textNode
    tag.append(document.createTextNode(label));

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "btn-close btn-close-white btn-sm ms-2";
    closeBtn.setAttribute("aria-label", "Eliminar");
    closeBtn.addEventListener("click", () => {
      opt.selected = false; // des-selecciona el proceso
      processSelect.dispatchEvent(new Event("change")); // re-filtra y repinta
    });

    tag.append(closeBtn);
    chips.appendChild(tag);
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
    

clearFiltersBtn.addEventListener("click", function () {
  // 0) Romper el highlight
  currentSearchTerm = "";                 // ⬅️ quita el término global
  searchInput.value = "";                 // limpia el input

  // 1) Campos/selects
  temaSelect.selectedIndex = 0;           // o "" si tu placeholder es opción vacía
  itemsPerPageSelect.selectedIndex = 0;
  sortSelect.selectedIndex = 0;

  // 2) Procesos múltiple
  Array.from(processSelect.options).forEach(option => {
    option.selected = false;
    option.hidden = false;               // vuelve a mostrar todos
  });

  // 3) Chips visuales
  const chipsContainer = document.getElementById("processSelectContainer");
  if (chipsContainer) chipsContainer.innerHTML = "";

  // 4) Checkboxes
  relTabCheckbox.checked = false;
  relMicroCheckbox.checked = false;
  alinMdeaCheckbox.checked = false;
  alinOdsCheckbox.checked = false;

  // 5) Periodos
  const periodInic = document.getElementById("periodInic");
  const periodFin  = document.getElementById("periodFin");
  if (periodInic) periodInic.selectedIndex = 0;
  if (periodFin)  periodFin.selectedIndex  = 0;

  // 6) Unidad (mantener visible, limpiar selección)
  if (radioSocio) radioSocio.checked = false;
  if (radioEco)   radioEco.checked   = false;
  if (unidadSection) unidadSection.style.display = "block";
  unidadFiltro = "todas";

  // 7) Repoblar catálogos dependientes
  repoblarTematicas();                   // todas las unidades
  const temaActual = "";                 // sin tema
  filtrarProcessSelectPorTema?.(temaActual); // si tienes esta función

  // 8) Re-render sin highlight (porque currentSearchTerm="", ver paso 0)
  currentPage = 1;
  currentFilteredData = [...allData];
  renderPage(currentFilteredData, currentPage);
  setupPagination(currentFilteredData);
  updateVariableCounter(allData.length);

  // 9) Limpiar querystring
  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.replaceState({}, document.title, newUrl);
});

    // Función para cargar todos los elementos al entrar a la página


// Buscar variables por término ingresado
function searchVariables(term) {
  if (!term) {
    renderPage(allData, 1);
    setupPagination(allData);
    return;
  }

  const filteredData = allData.filter(variable =>
    variable.nomVar.toLowerCase().includes(term.toLowerCase()) ||
    variable.defVar.toLowerCase().includes(term.toLowerCase()) ||
    variable.varAsig.toLowerCase().includes(term.toLowerCase())
  );

  if (filteredData.length === 0) {
    container.innerHTML = "<p class='text-center'>No se encontraron resultados.</p>";
    paginationContainer.innerHTML = "";
  } else {
    renderPage(filteredData, 1);
    setupPagination(filteredData);
  }
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

// Ordenar variables alfabéticamente por varAsig al cargar y al aplicar filtros
function sortVariablesAZ(data) {
  return [...data].sort((a, b) => {
    const nameA = (a.varAsig || "").toLowerCase();
    const nameB = (b.varAsig || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

// 🔁 CARGA INICIAL “TODO ANTES DE PINTAR”
showProcessSkeleton();
showVariablesSkeleton(8);

// NUEVOS spinners
showCounterSpinner();
showListSpinner();

Promise.all([
  fetch("/api/proceso").then(r => r.json()),
  fetchProcesosEconomicas(),                 // procesosEco
  fetch("/api/variables").then(r => r.json()),
  fetchVariablesDesdeUltima(),               // ← variablesUltima (económicas mapeadas)
  fetch("/api/eventos").then(r => r.json()),
  fetch("/api/clasificaciones").then(r => r.json())
])
.then(([procesosLocal, procesosEco, variablesLocal, variablesUltima, eventos, clasificaciones]) => {
  // 1) Procesos (merge locales + eco)
  procesosGlobal = mergeProcesos(procesosLocal, procesosEco);

  // 2) Globals auxiliares
  window.eventosGlobal = eventos;

  // 3) Clasificaciones base (socio)
  window.clasificacionesGlobal = clasificaciones;

  // 4) Variables (merge socio + eco) y orden A-Z si quieres
  allData = sortVariablesAZ(
    mergeVariablesLocalYUltima(variablesLocal, variablesUltima)
  );

  // 5) Armar sets por unidad
  socioSet = new Set(
    (procesosGlobal || [])
      .filter(p => p._source !== "economicas")
      .map(p => p.idPp)
  );
  ecoSet = new Set(
    (procesosGlobal || [])
      .filter(p => p._source === "economicas")
      .map(p => p.idPp)
  );

  // 6) ⚠️ Mezclar clasificaciones de económicas en el arreglo global
  mergeClasificacionesEconomicas(variablesUltima);
  window.clasificacionesGlobal = clasificacionesGlobal;
  rebuildClasifIndex(); 

  // 7) Poblar select de procesos solo con los que tienen variables
  const idPpConVars = new Set(allData.map(v => v.idPp).filter(Boolean));
  processSelect.innerHTML = "";
  procesosGlobal
    .filter(p => idPpConVars.has(p.idPp))
    .sort((a, b) => (a.pp || "").localeCompare(b.pp || ""))
    .forEach(proc => {
      const opt = document.createElement("option");
      opt.value = proc.idPp;
      opt.textContent = `• ${proc.pp} · [${proc.idPp}]`;
      processSelect.appendChild(opt);
    });

  // 8) Si ya hay unidad marcada, aplicar inmediatamente
  if (radioSocio?.checked || radioEco?.checked) {
    onUnidadChange();
  }

  // 9) Periodos y temáticas iniciales
  populatePeriodFilters([]);
  repoblarTematicas();

  // 10) Si hay tema ya seleccionado, filtra el select de procesos por ese tema (unidad + tema)
  const temaActual = (temaSelect.value && temaSelect.value !== "Seleccione una temática") ? temaSelect.value : "";
  filtrarProcessSelectPorTema(temaActual);

  // 11) Aplica filtros de URL (puede pintar)
  aplicarFiltroDesdeURL();

  // 12) Primer render si aún no se pintó
  currentFilteredData = [...allData];
  currentPage = 1;
  if (!initialPaintDone && !renderLocked) {
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);
    updateVariableCounter(allData.length);
    initialPaintDone = true;
  }

  hideProcessSkeleton();
  hideVariablesSkeleton();
  hideCounterSpinner();
  hideListSpinner();
})
.catch(err => {
  console.error("Error en carga inicial:", err);
  hideProcessSkeleton();
  hideVariablesSkeleton();
  hideCounterSpinner();
  hideListSpinner();
  container.innerHTML = `<div class="alert alert-danger">No se pudo cargar la información inicial.</div>`;
});

// 1. Cargar eventos antes de llamar a renderPage
// --- Helpers: leer periodicidad, rango y último año por proceso ---
// Deshabilitar anchors en el nodo destacado (amarillo) a nivel global:

// Tope general si vigFinal == "A la fecha" (cuando no haya override específico)
const DEFAULT_END_YEAR_CAP = 2025;

// Reglas por proceso (idPp)
const SPECIAL_RULES = {
  CPV: {
    seriesOverride: [1895,1900,1910,1921,1930,1940,1950,1960,1970,1980,1990,1995,2000,2005,2010,2020],
    capYear: 2020,
    greenFromYear: 1950,
    noLinks: true, // además de DISABLE_LINKS_ON_HIT global, forzamos en CPV
  },
  EIC:   { periodicityOverride: 5, capYear: 2020 },
  ENIGH: { capYear: 2024, greenFromYear: 2016 },
  ENADID: {
  seriesOverride: [1992, 1997, 2006, 2009, 2014, 2018],
  capYear: 2023,
  lastYearOverride: 2018
  },
  ENBIARE: { seriesOverride: [2021], capYear: 2021 },
  EM: { capYear: 2024 },
  ENUT: { seriesOverride: [2002, 2009, 2014, 2019], capYear: 2019 },
  ENILEMS: {
    seriesOverride: [2012, 2016, 2019],
    capYear: 2019,
    lastYearOverride: 2019   // ⬅️ Fuerza el nodo amarillo en 2019 para todas las variables
  },
  ENIF: { periodicityOverride: 3, capYear: 2024 },
  EFL: { capYear: 2019 },
  ENTI: { periodicityOverride: 3, capYear: 2022 },
  ENASIC: { seriesOverride: [2022], capYear: 2022 },
  ENCO: { lastYearOverride: 2021 }, // resaltar 2021 en amarillo
};



function normIdPp(id) {
  return String(id || '').trim().toUpperCase();
}
// Helpers existentes (usa los que ya tienes)
function parseYearSafe(v) {
  const n = parseInt(String(v).trim(), 10);
  return Number.isFinite(n) ? n : null;
}

function parsePeriodicidadAnios(s) {
  if (!s) return 1;
  const txt = String(s).toLowerCase();
  if (txt.includes('anual')) return 1;
  if (txt.includes('bienal')) return 2;
  if (txt.includes('trienal')) return 3;
  if (txt.includes('quinquenal')) return 5;
  const m = txt.match(/cada\s+(\d+)\s*años?/);
  if (m) return Math.max(1, parseInt(m[1], 10));
  return 1;
}

function buildYearSeries(startYear, endYear, step) {
  const years = [];
  for (let y = startYear; y <= endYear; y += step) years.push(y);
  if (years.length && years[years.length - 1] !== endYear) years.push(endYear);
  return years;
}

// Resolver fin de vigencia con reglas
function resolveEndYear(proc) {
  const rule = SPECIAL_RULES[normIdPp(proc.idPp)];
  if (rule?.capYear) return rule.capYear;

  const v = String(proc.vigFinal || '').toLowerCase();
  if (v.includes('fecha')) return DEFAULT_END_YEAR_CAP; // 2020 por defecto
  return parseYearSafe(proc.vigFinal);
}

// Serie por proceso (override > periodicidad)
function getProcessYearSeries(proc) {
  const rule = SPECIAL_RULES[normIdPp(proc.idPp)];

  if (Array.isArray(rule?.seriesOverride)) {
    let years = rule.seriesOverride
      .map(y => parseInt(y, 10))
      .filter(Number.isFinite);

    // Si capYear es mayor que el último año de la serie, agrégalo
    if (rule.capYear && !years.includes(rule.capYear)) {
      years.push(rule.capYear);
    }

    years = years.filter(y => y <= rule.capYear); // sigue filtrando por capYear
    return years.sort((a,b)=>a-b);
  }

  const startYear = parseYearSafe(proc.vigInicial);
  const endYear = resolveEndYear(proc);
  if (!startYear || !endYear || endYear < startYear) return [];

  const step = rule?.periodicityOverride ?? parsePeriodicidadAnios(proc.perPubResul || proc.perioProd || 'Anual');
  let years = buildYearSeries(startYear, endYear, step);
  if (years.length && years[years.length - 1] !== endYear) years.push(endYear);
  return years.sort((a,b)=>a-b);
}

function getEventYearsForVar(idVar, eventosRelacionados, variableOpt) {
  // 1) Usa lo que te pasaron (backend local)
  let fuente = Array.isArray(eventosRelacionados) ? eventosRelacionados : [];

  // 2) Si está vacío y la variable es económica con _eventosList, úsalo
  if ((!fuente.length) && variableOpt && variableOpt._source === 'economicas-ultima' && Array.isArray(variableOpt._eventosList)) {
    fuente = variableOpt._eventosList.map(e => ({ evento: e.evento ?? e.anioEvento }));
  }

  const años = new Set();
  for (const ev of fuente) {
    const y = parseInt(String(ev.anioEvento ?? ev.evento ?? '').trim(), 10);
    if (Number.isFinite(y)) años.add(y);
  }
  return Array.from(años).sort((a,b)=>a-b);
}


// ⚠️ Reemplaza sólo esta función
function construirLineaDeTiempoVariable(variable, eventosRelacionados) {
  try {
    const proc = procesosGlobal?.find(p => p.idPp === variable.idPp);
    if (!proc) return construirLineaDeTiempo(eventosRelacionados);

    // Serie base (rango por proceso)
    let years = getProcessYearSeries(proc);
    if (!years.length) return construirLineaDeTiempo(eventosRelacionados);

    // VERDES: años con evento
    const eventYears = getEventYearsForVar(variable.idVar, eventosRelacionados, variable);
    const greenYearsSet = new Set(eventYears);

    // AMARILLO: año de referencia (económicas) o último evento
    const rule = SPECIAL_RULES[normIdPp(proc.idPp)];
    let hitYear = null;

    if (variable._source === 'economicas-ultima' && Number.isFinite(variable._anioReferencia)) {
      hitYear = variable._anioReferencia;
    }
    if (!hitYear && rule && rule.lastYearOverride) {
      hitYear = rule.lastYearOverride;
    }
    if (!hitYear && eventYears.length) {
      hitYear = eventYears[eventYears.length - 1];
    }

    if (hitYear && !years.includes(hitYear)) {
      years.push(hitYear);
      years.sort((a,b)=>a-b);
    }

    // 🔹 Construcción de los nodos del timeline
    const items = years.map(y => {
      const isHit   = (hitYear === y);
      const isGreen = !isHit && greenYearsSet.has(y);
      const liClass = isHit ? 'complete-hit'
                    : (isGreen ? 'complete-green' : 'complete-neutral');

      const tooltipAttr = isHit
        ? `data-bs-toggle="tooltip" data-bs-placement="top" title="Año de referencia de la variable (${y})"`
        : (isGreen
            ? `data-bs-toggle="tooltip" data-bs-placement="top" title="Año en el que se capturó la variable"`
            : `data-bs-toggle="tooltip" data-bs-placement="top" title="Año del periodo del proceso"`);

      const inner = `<span class="tl-year" ${tooltipAttr}>${y}</span>`;

      return `
        <li class="li ${liClass} d-flex flex-column align-items-center">
          <div class="timestamp mb-2">
            <span class="date mb-2">${inner}</span>
          </div>
          <div class="status text-center"></div>
        </li>
      `;
    }).join('');

    // 🟡🟢⚪️ Leyenda textual
    const legend = `
      <div class="timeline-legend mt-2 text-center small">
        <div class="d-flex justify-content-center flex-wrap gap-4">
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-neutral"></span>
            <span>Periodo del proceso al que pertenece la variable</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-green"></span>
            <span>Periodo en el que ha sido capturada la variable</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-yellow"></span>
            <span>Periodo en el que se referencia esta variable</span>
          </div>
        </div>
      </div>
    `;

    return `<ul class="timeline" id="timeline">${items}</ul>${legend}`;
  } catch (err) {
    console.error('Error en construirLineaDeTiempoVariable:', err);
    return construirLineaDeTiempo(eventosRelacionados);
  }
}


// Devuelve un array de temáticas únicas (tema y tema2) de la "base" que le pases
function collectTematicas(baseData) {
  const set = new Set();
  (baseData || []).forEach(v => {
    if (v?.tema && String(v.tema).trim())  set.add(String(v.tema).trim());
    if (v?.tema2 && String(v.tema2).trim()) set.add(String(v.tema2).trim());
  });
  // orden alfabético
  return Array.from(set).sort((a,b) => a.localeCompare(b));
}




function renderPage(data, page) {
  container.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
 

  updateVariableCounter(data.length);

  paginatedData.forEach((variable, index) => {
    // 2. Filtrar los eventos que pertenecen a esta variable
      // ...dentro de renderPage, antes de construir card.innerHTML
    // dentro de renderPage, por cada variable...
    const evs = Array.isArray(window.eventosGlobal) ? window.eventosGlobal : [];
    const eventosRelacionados = evs.filter(ev => String(ev.idVar) === String(variable.idVar));

    // asegura que SIEMPRE existirá timelineHTML
    let timelineHTML = "";
    try {
      timelineHTML = construirLineaDeTiempoVariable(variable, eventosRelacionados);
    } catch (e) {
      console.warn("Fallo timeline; uso fallback neutral:", e);
      // fallback mínimo si tu helper no está disponible
      const label = (variable.vigInicial || variable.vigFinal) 
        ? `${variable.vigInicial || "?"} - ${variable.vigFinal || "?"}`
        : "Sin periodo";
      timelineHTML = `<div class="small text-muted">${label}</div>`;
    }

    // 3. Fuentes dinámicas

    const proceso = procesosGlobal.find(proc => proc.idPp === variable.idPp);

    // Badge de proceso: acrónimo si es económicas; idPp si es sociodemográficas
    const esEco = (getUnidadDeVariable(variable) === 'eco');
    const textoProc = esEco ? (proceso?.idPp || variable.idPp || '—') : (variable.idPp || '—');
    const badgeProcHTML = textoProc
      ? `<span class="badge ms-2 bg-secondary" title="${proceso?.pp || textoProc}">${textoProc}</span>`
      : '';


    const card = document.createElement('div');
    card.classList.add('accordion', 'mb-3');

    const term = currentSearchTerm; // 👈 usa el término global
     const unit = getUnidadDeVariable(variable);              // 'eco' | 'socio'
    const unitCls = (unit === 'eco') ? 'acc-eco' : 'acc-socio';



    // Campos que quieres resaltar (usa el original si no hay término)
    const hVarAsig  = variable.varAsig  ? highlightTerm(variable.varAsig,  term) : "";
    const hPregLit  = variable.pregLit  ? highlightTerm(variable.pregLit,  term) : "";
    const hDefVar   = variable.defVar   ? highlightTerm(variable.defVar,   term) : "";
    const hNomVar   = variable.nomVar   ? highlightTerm(variable.nomVar,   term) : "";
    const hCategoria= variable.categoria? highlightTerm(variable.categoria,term) : "";
    const hTema     = variable.tema     ? highlightTerm(variable.tema,     term) : "";
    const hSubtema  = variable.subtema  ? highlightTerm(variable.subtema,  term) : "";
    const hTema2    = variable.tema2    ? highlightTerm(variable.tema2,    term) : "";
    const hSubtema2 = variable.subtema2 ? highlightTerm(variable.subtema2, term) : "";


   
            card.innerHTML = `
            <div class="accordion-item shadow-sm rounded-3 border-0 ${unitCls}">
              <h2 class="accordion-header custom-accordion-header" id="heading${index}">
                <button class="accordion-button collapsed " type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse${index}"
                  aria-expanded="false"
                  aria-controls="collapse${index}">
                  <span class="var-nombre">${hVarAsig}</span>
                  ${badgeProcHTML}
                </button>
              </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#variablesContainer">
                  <div class="accordion-body">
                    <div class="mb-2">
                      <div class="mb-2 text-dark fw-semibold" style="font-size:1rem;">Periodo de Pertinencia del Evento:</div>
                      ${timelineHTML}
                    </div>
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Pregunta elaborada cuyo objetivo es obtener una respuesta directa y explícita basada en información específica y detallada proporcionada por un informante">
                            <i class="bi bi-question-circle me-1"></i>Pregunta:</span>
                          <div class="ps-3">
                            <p>${hPregLit}
                          </div>

                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Ordenamiento de todas y cada una de las modalidades cualitativas o intervalos numéricos admitidos por una variable">
                            <i class="bi bi-question-circle me-1"></i>Clasificación de la variable correspondiente a la pregunta:</span>
                          <div class="ps-3">
                            ${getClasificacionesPorVariableHighlighted(variable.idVar, term)} <!-- 👈 (ver paso 4) -->
                          </div>
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Concepto o termino que incluya sus aspectos principales brindando un contexto de la variable">
                            <i class="bi bi-info-circle me-1"></i>Definición:</span>
                          <div class="ps-3">${hDefVar}</div> <!-- 👈 -->
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Nombre de la variable seleccionada, tal y como aparece en la fuente del evento en mención">
                            <i class="bi bi-tag me-1"></i>Variable Fuente:</span>
                          <span class="text-dark ms-1 fw-normal">${hNomVar}</span> <!-- 👈 -->
                        </div>
                      </div>

                      <div class="col-md-6">
                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Conjunto objeto de cuantificación y caracterización para fines de estudio">
                            <i class="bi bi-diagram-3 me-1"></i>Categoría:</span>
                          <span class="text-dark ms-1 fw-normal">${hCategoria}</span> <!-- 👈 -->
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Son enunciados genéricos referentes a campos específicos de interés y cuyo estudio constituye la justificación del proyecto estadístico">
                            <i class="bi bi-layers me-1"></i>Clasificación Temática:</span>
                          <div class="ps-3">
                            <span>Tema y Subtema 1:</span>
                            <span class="text-dark mb-1 fw-normal">${hTema}</span> / 
                            <span class="text-dark mb-1 fw-normal">${hSubtema}</span><br>
                            <span>Tema y Subtema 2:</span>
                            <span class="text-dark mb-1 fw-normal">${hTema2}</span> / 
                            <span class="text-dark mb-1 fw-normal">${hSubtema2}</span>
                          </div>
                        </div>
                          <div class="mb-2">
                             <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left"
                                   data-bs-title="Verifica si la variable seleccionada cuenta con información disponible en relación a tabulados publicados o en microdatos">
                               <i class="bi bi-link-45deg me-1"></i>Relación con Tabulados o Microdatos
                             </span>
                             <div class="ps-3 d-flex flex-wrap gap-2">
                               <span class="badge bg-${variable.relTab === 'Sí' ? 'success badge-tabulado' : 'danger'}"
                                     style="cursor:pointer"
                                     data-idvar="${variable.idVar}"
                                     ${variable.relTab === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="tabulado"' : ''}>
                                 ${variable.relTab === 'Sí' ? 'Tabulados' : 'Sin Tabulados'}
                               </span>

                               <span class="badge bg-${variable.relMicro === 'Sí' ? 'success badge-microdatos' : 'danger'}"
                                     style="cursor:pointer"
                                     data-idvar="${variable.idVar}"
                                     ${variable.relMicro === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="microdatos"' : ''}>
                                 ${variable.relMicro === 'Sí' ? 'Microdatos' : 'Sin Microdatos'}
                               </span>
                             </div>

                             <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left"
                                   data-bs-title="Verifica si la variable seleccionada está alineada con la estructura del MDEA o con los ODS.">
                               <i class="bi bi-link-45deg me-1"></i>Alineación con MDEA y ODS
                             </span>
                             <div class="ps-3 d-flex flex-wrap gap-2">
                               <span class="badge ${variable.alinMdea === 'Sí' ? 'bg-primary badge-mdea' : 'bg-secondary'}"
                                     style="cursor:${variable.alinMdea === 'Sí' ? 'pointer' : 'default'}"
                                     data-idvar="${variable.idVar}"
                                     ${variable.alinMdea === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="mdea"' : ''}>
                                 ${variable.alinMdea === 'Sí' ? 'MDEA' : 'Sin MDEA'}
                               </span>

                               <span class="badge ${variable.alinOds === 'Sí' ? 'bg-primary badge-ods' : 'bg-secondary'}"
                                     style="cursor:${variable.alinOds === 'Sí' ? 'pointer' : 'default'}"
                                     data-idvar="${variable.idVar}"
                                     ${variable.alinOds === 'Sí' ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="ods"' : ''}>
                                 ${variable.alinOds === 'Sí' ? 'ODS' : 'Sin ODS'}
                               </span>
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
      paginationContainer.innerHTML = "";
      const totalPages = Math.ceil(data.length / itemsPerPage);
      const maxVisiblePages = 5;

      if (totalPages <= 1) return; // nada que paginar

      // === Botón "Primera página" (solo si ya avanzaste) ===
      if (currentPage > 1) {
        const firstLi = document.createElement("li");
        firstLi.classList.add("page-item");
        const firstA = document.createElement("a");
        firstA.classList.add("page-link");
        firstA.href = "#";
        firstA.textContent = "Primera página";
        firstA.style.backgroundColor = "#003057";
        firstA.style.color = "#fff";
        firstA.addEventListener("click", function (e) {
          e.preventDefault();
          currentPage = 1;
          renderPage(data, currentPage);
          setupPagination(data);
        });
        firstLi.appendChild(firstA);
        paginationContainer.appendChild(firstLi);
      }

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
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      // "..." al inicio
      if (startPage > 1) {
        const dotsLi = document.createElement("li");
        dotsLi.classList.add("page-item", "disabled");
        const dotsA = document.createElement("a");
        dotsA.classList.add("page-link");
        dotsA.href = "#";
        dotsA.textContent = "...";
        dotsA.style.backgroundColor = "#003057";
        dotsA.style.color = "#fff";
        dotsLi.appendChild(dotsA);
        paginationContainer.appendChild(dotsLi);
      }

      // Números
      for (let i = startPage; i <= endPage; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        if (i === currentPage) li.classList.add("active");

        const a = document.createElement("a");
        a.classList.add("page-link");
        a.href = "#";
        a.textContent = i;
        a.style.backgroundColor = "#003057";
        a.style.color = "#fff";
        a.addEventListener("click", function (e) {
          e.preventDefault();
          currentPage = i;
          renderPage(data, currentPage);
          setupPagination(data);
        });

        li.appendChild(a);
        paginationContainer.appendChild(li);
      }

      // "..." al final
      if (endPage < totalPages) {
        const dotsLi = document.createElement("li");
        dotsLi.classList.add("page-item", "disabled");
        const dotsA = document.createElement("a");
        dotsA.classList.add("page-link");
        dotsA.href = "#";
        dotsA.textContent = "...";
        dotsA.style.backgroundColor = "#003057";
        dotsA.style.color = "#fff";
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

      // Botón "Última Página"
      if (totalPages > 1 && currentPage < totalPages) {
        const lastLi = document.createElement("li");
        lastLi.classList.add("page-item");
        const lastA = document.createElement("a");
        lastA.classList.add("page-link");
        lastA.href = "#";
        lastA.textContent = "Última Página";
        lastA.style.backgroundColor = "#003057";
        lastA.style.color = "#fff";
        lastA.addEventListener("click", function (e) {
          e.preventDefault();
          currentPage = totalPages;
          renderPage(data, currentPage);
          setupPagination(data);
        });
        lastLi.appendChild(lastA);
        paginationContainer.appendChild(lastLi);
      }
    }


    // Manejar el evento de cambio en el selector de elementos por página
    itemsPerPageSelect.addEventListener("change", function () {
      itemsPerPage = parseInt(this.value, 15);
      currentPage = 1;
      const base = (currentFilteredData && currentFilteredData.length) ? currentFilteredData : filterByUnidad(allData);
      renderPage(base, currentPage);
      setupPagination(base);
    });


    // Manejar el evento de envío del formulario
   searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const searchTerm = searchInput.value.trim();
      currentSearchTerm = searchTerm;  // ⬅️ clave
      currentPage = 1;
      searchVariables(searchTerm);
    });
    //Listener para los periodo de tiempo. 
    document.getElementById("periodInic").addEventListener("change", filterByRelation);
    document.getElementById("periodFin").addEventListener("change", filterByRelation);
    
    window.addEventListener("DOMContentLoaded", () => {
    populatePeriodFilters(); // Cargar filtros
    filterByRelation();      // Mostrar todo inicialmente
    });

    // Cargar todos los elementos al entrar a la página
  

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
    // 1) Base por unidad
  let filteredData = filterByUnidad(allData);

  // 2) Temática
  const selectedTema = temaSelect.value;
  if (selectedTema && selectedTema !== "Seleccione una temática") {
    filteredData = filteredData.filter(v =>
      (v.tema   && v.tema   === selectedTema) ||
      (v.tema2  && v.tema2  === selectedTema)
    );
  }

  // 3) Procesos (intersección con lo anterior, no lo sobreescribe)
  const selectedProcesses = Array.from(processSelect.selectedOptions).map(o => o.value);
  if (selectedProcesses.length > 0) {
    filteredData = filteredData.filter(v => selectedProcesses.includes(v.idPp));
  }
  // 4) Checkboxes
  if (relTabCheckbox.checked || relMicroCheckbox.checked) {
    filteredData = filteredData.filter(v => {
      const okTab   = relTabCheckbox.checked  ? v.relTab   === "Sí" : true;
      const okMicro = relMicroCheckbox.checked? v.relMicro === "Sí" : true;
      return okTab && okMicro;
    });
  }
  if (alinMdeaCheckbox.checked || alinOdsCheckbox.checked) {
    filteredData = filteredData.filter(v => {
      const okMdea = alinMdeaCheckbox.checked ? v.alinMdea === "Sí" : true;
      const okOds  = alinOdsCheckbox.checked  ? v.alinOds  === "Sí" : true;
      return okMdea && okOds;
    });
  }

  // 5) Búsqueda

 // 5) Búsqueda (incluye clasificaciones)
currentSearchTerm = (searchInput.value || "").trim();        // 👈 sincroniza el término activo
const needle = currentSearchTerm.toLowerCase();

if (needle) {
  filteredData = filteredData.filter(v => {
    // match en los campos de la variable
    const f =
      (v.categoria && v.categoria.toLowerCase().includes(needle)) ||
      (v.tema      && v.tema.toLowerCase().includes(needle)) ||
      (v.tema2     && v.tema2.toLowerCase().includes(needle)) ||
      (v.subtema   && v.subtema.toLowerCase().includes(needle)) ||
      (v.subtema2  && v.subtema2.toLowerCase().includes(needle)) ||
      (v.pregLit   && v.pregLit.toLowerCase().includes(needle)) ||
      (v.nomVar    && v.nomVar.toLowerCase().includes(needle)) ||
      (v.defVar    && v.defVar.toLowerCase().includes(needle)) ||
      (v.varAsig   && v.varAsig.toLowerCase().includes(needle));

    if (f) return true;

    // match en CLASIFICACIONES de esa variable
    const list = clasifIndex.get(String(v.idVar)) || [];
    return list.some(c => (c || "").toLowerCase().includes(needle));
  });
}

  // Ordena A-Z antes de mostrar
  filteredData = sortVariablesAZ(filteredData);

  currentFilteredData = filteredData;
  currentPage = 1;
  renderPage(currentFilteredData, currentPage);
  setupPagination(currentFilteredData);
  updateVariableCounter(filteredData.length);
}




temaSelect.addEventListener("change", function () {
  const temaActual = (temaSelect.value && temaSelect.value !== "Seleccione una temática")
    ? temaSelect.value
    : "";

  // Rehacer las opciones del select de procesos según UNIDAD + TEMÁTICA
  filtrarProcessSelectPorTema(temaActual);

  // Mantener visible la sección (si aplica)
  checkMostrarUnidadSection();

  // Delegar en la función central
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
  currentSearchTerm = (searchInput.value || "").trim(); // sincroniza
  currentPage = 1;
  applyFilters(); // ya filtra campos + clasificaciones y hace render
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
        const checkDataLoaded = setInterval(() => {
        if (typeof allData !== 'undefined' && allData.length > 0) {
            clearInterval(checkDataLoaded);
            searchInput.value = searchTerm;
            currentSearchTerm = searchTerm;
            currentPage = 1;
            searchVariables(searchTerm);
        }
        }, 100);
    }
    });

    // Evento delegado para mostrar información de tabulados y microdatos en el modal
 // === REEMPLAZA COMPLETO TU LISTENER ACTUAL POR ESTE ===
document.addEventListener("click", async function (e) {
  // Utilidad: busca la variable en allData por idVar
  function getVariableByIdVar(idVar) {
    return (Array.isArray(allData) ? allData : []).find(v => String(v.idVar) === String(idVar));
  }

  // ============ TABULADOS ============
  if (e.target.classList.contains("badge-tabulado")) {
    document.getElementById("infoModalLabel").textContent = "Detalle de la Relación con Tabulados";
    const idVar = e.target.getAttribute("data-idvar");
    const modalBody = document.getElementById("infoModalBody");
    modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

    try {
      const variable = getVariableByIdVar(idVar);

      // 1) Si la variable viene de Económicas y trae tabulados embebidos, úsalo
      if (variable && variable._source === "economicas-ultima" && Array.isArray(variable._tabuladosList) && variable._tabuladosList.length) {
        const html = variable._tabuladosList.map(t => `
          <div class="mb-3 border-bottom pb-2">
            <strong>${t.tabulado || "Tabulado"}</strong><br>
            ${t.tipo ? `<span class="small text-muted">${t.tipo}</span><br>` : ""}
            <div class="row">
              <div class="col-6">
                ${t.urlAcceso ? `<strong>Acceso:</strong> <a href="${t.urlAcceso}" target="_blank" style="word-break: break-all;">Abrir</a>` : ""}
              </div>
              <div class="col-6">
                ${t.urlDescarga ? `<strong>Descarga:</strong> <a href="${t.urlDescarga}" target="_blank" style="word-break: break-all;">Descargar</a>` : ""}
              </div>
            </div>
            ${t.comentarioA ? `<div class="small mt-1">${t.comentarioA}</div>` : ""}
          </div>
        `).join("");
        modalBody.innerHTML = html || "<div class='text-danger'>No hay tabulados disponibles.</div>";
        return;
      }

      // 2) Fallback a tus endpoints locales
      const resVarTab = await fetch('/api/var-tab');
      const dataVarTab = await resVarTab.json();
      const relaciones = Array.isArray(dataVarTab) ? dataVarTab.filter(rel => rel.idVar === idVar) : [];

      if (!relaciones.length) {
        modalBody.innerHTML = "<div class='text-danger'>No hay tabulados relacionados con esta variable.</div>";
        return;
      }

      const resTabulados = await fetch('/api/tabulado');
      const tabulados = await resTabulados.json();

      const contenido = relaciones.map(rel => {
        const tabulado = Array.isArray(tabulados) ? tabulados.find(tab => tab.idTab === rel.idTab) : null;
        if (!tabulado) return "";
        return `
          <div class="mb-3 border-bottom pb-2">
            ${tabulado.tituloTab ? `<strong>Título del tabulado:</strong><br><span>${tabulado.tituloTab}</span><br>` : ''}
            <div class="row">
              <div class="col-6">
                ${tabulado.ligaTab ? `<strong>Liga Tabulado INEGI:</strong><br><a href="${tabulado.ligaTab}" target="_blank" style="word-break: break-all;">Tabulado</a><br>` : ''}
              </div>
              <div class="col-6">
                ${tabulado.ligaDescTab ? `<strong>Liga de Descarga:</strong><br><a href="${tabulado.ligaDescTab}" target="_blank" style="word-break: break-all;">Documento Directo</a><br>` : ''}
              </div>
            </div>
            ${(tabulado.numTab || tabulado.tipoTab) ? `
              <strong>Información adicional:</strong><br>
              ${tabulado.numTab ? `Número: ${tabulado.numTab}<br>` : ''}
              ${tabulado.tipoTab ? `Tipo: ${tabulado.tipoTab}<br>` : ''}` : ''}
          </div>
        `;
      }).join("");

      modalBody.innerHTML = contenido || "<div class='text-danger'>No hay ligas disponibles para los tabulados relacionados.</div>";
    } catch (error) {
      console.error(error);
      document.getElementById("infoModalBody").innerHTML = "<div class='text-danger'>Error al cargar la información.</div>";
    }
  }

  // ============ MICRODATOS ============
  if (e.target.classList.contains("badge-microdatos")) {
    document.getElementById("infoModalLabel").textContent = "Detalle de la Relación con Microdatos";
    const idVar = e.target.getAttribute("data-idvar");
    const modalBody = document.getElementById("infoModalBody");
    modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

    try {
      const variable = getVariableByIdVar(idVar);

      // 1) Si viene de Económicas y trae microdatos embebidos, úsalo
      if (variable && variable._source === "economicas-ultima" && Array.isArray(variable._microdatosList) && variable._microdatosList.length) {
        const html = variable._microdatosList.map(m => `
          <div class="mb-2 border-bottom pb-2">
            ${m.urlAcceso ? `<div><strong>Acceso:</strong> <a href="${m.urlAcceso}" target="_blank" style="word-break: break-all;">${m.urlAcceso}</a></div>` : ""}
            ${m.urlDescriptor ? `<div><strong>Descriptor:</strong> <a href="${m.urlDescriptor}" target="_blank" style="word-break: break-all;">${m.urlDescriptor}</a></div>` : ""}
            ${(m.tabla || m.campo) ? `<div><strong>Ubicación:</strong> ${m.tabla || "-"} / ${m.campo || "-"}</div>` : ""}
            ${m.descriptor ? `<div class="small text-muted">${m.descriptor}</div>` : ""}
          </div>
        `).join("");
        modalBody.innerHTML = html || "<div class='text-danger'>No hay microdatos disponibles.</div>";
        return;
      }

      // 2) Fallback a /api/microdatos
      const res = await fetch(`/api/microdatos`);
      const data = await res.json();
      const info = Array.isArray(data)
        ? data.find(micro => String(micro.idVar) === String(idVar))
        : (data && data.idVar === idVar ? data : null);

      if (info && (info.ligaMicro || info.ligaDd || info.nomTabla || info.nomCampo)) {
        modalBody.innerHTML = `
          ${info.ligaMicro ? `
            <div class="mb-2"><strong>Liga Microdatos:</strong><br>
            <a href="${info.ligaMicro}" target="_blank" style="word-break: break-all;">Página Microdatos INEGI</a></div>` : ""}

          ${info.ligaDd ? `
            <div class="mb-2"><strong>Liga de Descarga:</strong><br>
            <a href="${info.ligaDd}" target="_blank" style="word-break: break-all;">Documento Directo</a></div>` : ""}

          ${(info.nomTabla || info.nomCampo) ? `
            <div class="mb-2"><strong>Ubicación:</strong><br>
              ${info.nomTabla || "No disponible"} / ${info.nomCampo || "No disponible"}
            </div>` : ""}

          <div class="mb-2">${renderComentarios(info.comentMicro || "-")}</div>
        `;
      } else {
        modalBody.innerHTML = "<div class='text-danger'>No hay información de microdatos disponible.</div>";
      }
    } catch (err) {
      console.error(err);
      modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información.</div>";
    }
  }

  // ============ MDEA ============
  if (e.target.classList.contains("badge-mdea")) {
    document.getElementById("infoModalLabel").textContent = "Alineación de la variable con el MDEA";
    const idVar = e.target.getAttribute("data-idvar");
    const modalBody = document.getElementById("infoModalBody");
    modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

    const fmt = (s) => (s || "-").toString().replace(/_/g, " ").replace(/\s+/g, " ").trim();

    try {
      const variable = getVariableByIdVar(idVar);

      // 1) Económicas con mdeas embebidos
      if (variable && variable._source === "economicas-ultima" && Array.isArray(variable._mdeasList) && variable._mdeasList.length) {
        modalBody.innerHTML = variable._mdeasList.map(m => `
          <div class="mb-2 border-bottom pb-2">
            <div><strong>Componente:</strong> ${formatIdWithDots(m.componente)} ${fmt(m.componenteNombre)}</div>
            <div><strong>Subcomponente:</strong> ${formatIdWithDots(m.subcomponente)} ${fmt(m.subcomponenteNombre)}</div>
            <div><strong>Tema:</strong> ${formatIdWithDots(m.tema)} ${fmt(m.temaNombre)}</div>
            <div><strong>Estadística 1:</strong> ${formatIdWithDots(m.estadistica1)} ${fmt(m.estadistica1Nombre)}</div>
            ${m.estadistica2 ? `<div><strong>Estadística 2:</strong> ${formatIdWithDots(m.estadistica2)} ${fmt(m.estadistica2Nombre)}</div>` : ""}
          </div>
        `).join("");
        return;
      }

      // 2) Fallback a /api/mdea (tu lógica original – uno por idVar)
      const res = await fetch(`/api/mdea`);
      const data = await res.json();
      const info = Array.isArray(data)
        ? data.find(mdea => String(mdea.idVar) === String(idVar))
        : (data && data.idVar === idVar ? data : null);

      if (info) {
        modalBody.innerHTML = `
          <div class="mb-2"><strong>Componente:</strong><br>${fmt(info.compo)}${fmt(info.componenteNombre)}</div>
          <div class="mb-2"><strong>Subcomponente:</strong><br>${fmt(info.subcompo)}</div>
          <div class="mb-2"><strong>Tópico:</strong><br>${fmt(info.topico)}</div>
          <div class="mb-2"><strong>Variable del MDEA:</strong><br>${fmt(info.estAmbiental)}</div>
          <div class="mb-2"><strong>Estadístico del MDEA:</strong><br>${(info.estadMdea ?? "No disponible")}</div>
        `;
      } else {
        modalBody.innerHTML = "<div class='text-danger'>No hay información del MDEA para esta variable.</div>";
      }
    } catch (err) {
      console.error(err);
      modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información del MDEA.</div>";
    }
  }

  // ============ ODS ============
  if (e.target.classList.contains("badge-ods")) {
    document.getElementById("infoModalLabel").textContent = "Alineación de la variable con los ODS";
    const idVar = e.target.getAttribute("data-idvar");
    const modalBody = document.getElementById("infoModalBody");
    modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

    const fmt = (s) => (s || "-").toString().replace(/_/g, " ").replace(/\s+/g, " ").trim();

    try {
      const variable = getVariableByIdVar(idVar);

      // 1) Económicas con ods embebidos
      if (variable && variable._source === "economicas-ultima" && Array.isArray(variable._odsList) && variable._odsList.length) {
        modalBody.innerHTML = `
          <div class="mb-2"><strong>ODS Relacionados:</strong></div>
          <div class="list-group">
            ${variable._odsList.map(o => `
              <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between align-items-start">
                  <h6 class="mb-1">ODS: ${formatIdWithDots(o.objetivo)} ${fmt(o.objetivoNombre)}</h6>
                </div>
                <div class="small mb-1"><strong>Meta:</strong> ${formatIdWithDots(o.meta)} ${fmt(o.metaNombre)}</div>
                <div class="small mb-1"><strong>Indicador:</strong> ${formatIdWithDots(o.indicador)} ${fmt(o.indicadorNombre)}</div>
              </div>
            `).join("")}
          </div>
        `;
        return;
      }

      // 2) Fallback a /api/ods (pueden ser varias relaciones por variable)
      const res = await fetch(`/api/ods`);
      const data = await res.json();
      const registros = Array.isArray(data)
        ? data.filter(ods => String(ods.idVar) === String(idVar))
        : (data && data.idVar === idVar ? [data] : []);

      if (!registros.length) {
        modalBody.innerHTML = "<div class='text-danger'>No hay información de ODS para esta variable.</div>";
        return;
      }

      const varTitle = fmt((getVariableByIdVar(idVar)?.varAsig) || idVar);
      const contenido = `
        <div class="mb-2"><strong>${varTitle}</strong></div>
        <div class="list-group">
          ${registros.map(info => `
            <div class="list-group-item">
              <div class="d-flex w-100 justify-content-between align-items-start">
                <h6 class="mb-1">ODS: ${fmt(info.ods)}</h6>
              </div>
              <div class="small mb-1"><strong>Meta ODS detectada:</strong> ${fmt(info.meta)}</div>
              <div class="small mb-1"><strong>Indicador ODS:</strong> ${fmt(info.indicador)}</div>
              ${info.comentOds && info.comentOds.trim() !== "-" ? `<div class="small text-muted">${info.comentOds}</div>` : ""}
            </div>
          `).join("")}
        </div>
      `;
      modalBody.innerHTML = contenido;
    } catch (err) {
      console.error(err);
      modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información de ODS.</div>";
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
// Si decides conservar ese bloque, ajústalo así:
fetch('/api/clasificaciones')
  .then(res => res.json())
  .then(clasificaciones => {
    clasificacionesGlobal = clasificaciones;
    return fetch('/api/eventos').then(res => res.json());
  })
  .then(eventos => {
    eventosGlobal = eventos;
    // Solo re-render si ya hicimos el primer pintado y SIN romper filtros
    if (initialPaintDone && !renderLocked) {
      const base = (currentFilteredData && currentFilteredData.length) ? currentFilteredData : allData;
      renderPage(base, currentPage);
      setupPagination(base);
    }
  })
  .catch(console.error);



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

function getClasificacionesPorVariableHighlighted(idVar, term) {
  const clasifs = clasificacionesGlobal
    .filter(c => c.idVar === idVar)
    .map(c => c.clasificaciones)
    .filter(val => val && val.trim() !== '' && val.trim() !== '-');

  if (!clasifs.length) return '<span class="text-muted">Sin clasificación</span>';
  const html = clasifs
    .map(c => `<li>${term ? highlightTerm(c, term) : c}</li>`)
    .join('');
  return `<ul class="mb-0 ps-3">${html}</ul>`;
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
    <div class="mb-2 ms-1">
      <span class="fw-semibold">Comentario:</span>
      <div>${comentario}</div>
    </div>
  `;
}

// Espera al menos 1000ms antes de mostrar el contenido principal
window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("mainContent").style.display = "";
  }, 2000);
});

function formatIdWithDots(id) {
  if (!id) return "";
  const str = String(id).trim();
  // Divide cada caracter por punto, incluyendo letras
  return str.split("").join(".");
}

// Resaltar término de búsqueda en los resultados
function highlightTerm(text, term) {
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="custom-highlight">$1</mark>');
}


