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
  let itemsPerPage = parseInt(15);
  let currentPage = 1;

  itemsPerPageSelect.addEventListener("change", () => {
    itemsPerPage = Number(10);
    currentPage= 1;
    applyFilters();
  })
 
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
 
window.renderLocked     = false;  // evita renders mientras aplicamos URL
window.initialPaintDone = false;  // ya hicimos el primer render “válido”


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

          const tieneDatosAbiertos = (v.datosabiertos === true || v.datosAbiertos === true);
          const datosAbiertosList =
          Array.isArray(v.datosAbiertosList) ? v.datosAbiertosList : [];
          
        // --- MICRODATOS: detectar lista embebida aunque v.microdatos sea false ---
        var microList = Array.isArray(v.microdatosList) ? v.microdatosList : [];

        var hasMicroEmbedded = false;
        for (var i = 0; i < microList.length; i++) {
          var m = microList[i] || {};
          var tabla = (m.tabla ? String(m.tabla).trim() : '');
          var campo = (m.campo ? String(m.campo).trim() : '');
          var urlAcc = !!m.urlAcceso;
          var urlDesc = !!m.urlDescriptor;
          var descr = !!m.descriptor;

          if (tabla !== '' || campo !== '' || urlAcc || urlDesc || descr) {
            hasMicroEmbedded = true;
            break;
          }
        }

        // si v.microdatos es true O hay lista embebida válida → actívalo
        var relMicroCalc = (v.microdatos === true) || hasMicroEmbedded ? "Sí" : "No";

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
      relAbiertos: tieneDatosAbiertos ? "Sí" : "No",
      relTab: v.tabulados ? "Sí" : "No",
      relMicro: relMicroCalc,
      alinMdea: v.mdea ? "Sí" : "No",
      alinOds: v.ods ? "Sí" : "No",
      comentVar: v.comentarioA || v.comentarioS || "-",

      vigInicial: minY ? String(minY) : null,
      vigFinal: years.length ? String(maxY) : "A la fecha",

      _source: "economicas-ultima",

      _microdatosList: microList,
      _tabuladosList: Array.isArray(v.tabuladosList) ? v.tabuladosList : [],
      _mdeasList: Array.isArray(v.mdeasList) ? v.mdeasList : [],
      _odsList: Array.isArray(v.odsList) ? v.odsList : [],
      _datosAbiertosList: datosAbiertosList,
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

function hasMicrodatos(variable) {
  if (!variable) return false;
  if (variable.relMicro === 'Sí') return true;
  // Económicas con lista embebida
  if (variable._source === 'economicas-ultima' &&
      Array.isArray(variable._microdatosList) &&
      variable._microdatosList.length > 0) {
    return true;
  }
  return false;
}

function hasDatosAbiertos(variable) {
  if (!variable) return false;
  // Económicas: requiere bandera + lista embebida con elementos
  if (variable._source === 'economicas-ultima') {
    return variable.relAbiertos === 'Sí' &&
           Array.isArray(variable._datosAbiertosList) &&
           variable._datosAbiertosList.length > 0;
  }
  // Socio: usa bandera relAbiertos si existe
  return variable.relAbiertos === 'Sí';
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


  // Helperrs de ODS
// === util de extracción (1..17) ===
function getOdsObjectiveNumber(val) {
  if (val == null) return null;
  if (typeof val === 'object' && val.objetivo != null) return getOdsObjectiveNumber(val.objetivo);
  const m = String(val).match(/(\d{1,2})/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return (Number.isFinite(n) && n >= 1 && n <= 17) ? n : null;
}

// Objetivo: nunca insertar puntos. "12" => "12"
function formatOdsObjetivo(val) {
  const n = getOdsObjectiveNumber(val);
  return (n != null) ? String(n) : (val ?? "-");
}

// Meta/Indicador: si ya trae puntos, respetar; si no, forzar OO.x(.y...)
function formatOdsComposite(val) {
  if (val == null) return "-";
  const s = String(val).trim();
  if (s.includes(".")) return s;                 // ya viene formateado (p. ej. "12.2", "12.1.1")
  const digits = s.replace(/\D/g, "");           // "122" -> "122"
  if (digits.length <= 2) return String(parseInt(digits || "0", 10) || "-"); // "12" -> "12"
  const obj = String(parseInt(digits.slice(0, 2), 10)); // "12"
  const rest = digits.slice(2).split("").join(".");     // "2" -> "2", "11" -> "1.1"
  return `${obj}.${rest}`;                       // "122" -> "12.2", "1211" -> "12.1.1"
}

// === util de asset (ODS0010_es.jpg, ..., ODS0170_es.jpg) ===
function odsAssetPath(objNum) {
  const code = String(objNum * 10).padStart(4, "0");
  return `/assets/ODS${code}_es.jpg`; // servido desde src/main/resources/static/assets
}

// === genera las miniaturas con data-ods ===
function buildOdsThumbsImgs(idVar, objNums) {
  return objNums.map(n => `
    <img
      src="${odsAssetPath(n)}"
      alt="ODS ${n}"
      class="ods-thumb badge-ods"
      data-idvar="${idVar}"
      data-ods="${n}"
      data-type="ods"
      data-bs-toggle="modal"
      data-bs-target="#infoModal"
      loading="lazy"
      title="ODS ${n}"
    >
  `).join("");
}

function cleanUnderscores(text) {
  if (text == null) return "-";
  return String(text).replace(/_/g, " ").trim();
}

let __odsCache__ = null;
async function fetchOdsOnce() {
  if (__odsCache__) return __odsCache__;
  const res = await fetch('/api/ods');
  const data = await res.json();
  __odsCache__ = Array.isArray(data) ? data : (data ? [data] : []);
  return __odsCache__;
}


// Helpers de MDEA //

// Nombre estándar por componente MDEA (1..6)
const MDEA_COMPONENTS = {
  1: "Condiciones y calidad ambiental",
  2: "Recursos ambientales y su uso",
  3: "Residuos y actividades humanas relacionadas",
  4: "Eventos extremos y desastres",
  5: "Asentamientos humanos y salud ambiental",
  6: "Protección ambiental y participación ciudadana"
};

// Quita número al final: "… salud ambiental 5" -> "… salud ambiental"
function stripTrailingNumber(text) {
  if (text == null) return "-";
  return String(text).replace(/\s*\b\d+\b\s*$/, "").trim();
}

// "253b1 Fertilizantes naturales" -> { code:"253b1", name:"Fertilizantes naturales" }
function splitCodeAndName(text) {
  const s = String(text || "").trim();
  if (!s) return { code: "", name: "" };
  const m = s.match(/^([0-9A-Za-z]+)\s*(.*)$/);
  return m ? { code: m[1], name: m[2] } : { code: "", name: s };
}

// Convierte códigos MDEA a formato punteado:
// Convierte a formato punteado (solo para ECONÓMICAS):
// "25"->"2.5", "253"->"2.5.3", "253b"->"2.5.3.b", "253b1"->"2.5.3.b.1"
function dotifyMdeaCode(code) {
  const raw = String(code || "").trim();
  if (!raw) return "-";
  const parts = [];
  for (const ch of raw) {
    if (/\d/.test(ch)) parts.push(ch);
    else if (/[A-Za-z]/.test(ch)) parts.push(ch.toLowerCase());
  }
  return parts.length ? parts.join(".") : raw;
}

// Detecta número de componente (1..6) en varios formatos/campos
function getMdeaComponentNumber(val) {
  if (val == null) return null;
  if (typeof val === 'object' && val.componente != null) return getMdeaComponentNumber(val.componente);
  const m = String(val).match(/(\d{1,2})\b/);
  const n = m ? parseInt(m[1], 10) : null;
  return Number.isFinite(n) ? n : null;
}

// Devuelve "N. Nombre estandarizado" o "Componente N" si no está en el mapa
// Etiqueta estándar del componente "N. Nombre"
function getMdeaComponentLabel(num) {
  const MDEA_COMPONENTS = {
    1: "Condiciones y calidad ambiental",
    2: "Recursos ambientales y su uso",
    3: "Residuos y actividades humanas relacionadas",
    4: "Eventos extremos y desastres",
    5: "Asentamientos humanos y salud ambiental",
    6: "Protección ambiental y participación ciudadana"
  };
  return (MDEA_COMPONENTS[num] ? `${num}. ${MDEA_COMPONENTS[num]}` : `Componente ${num}`);
}

// Intenta obtener un nombre legible del componente (eco: viene en componenteNombre;
// socio: puede venir algo tipo "Residuos 3", entonces quitamos el número final)
function getMdeaComponentName(source) {
  if (!source) return "-";
  if (typeof source === 'object' && source.componenteNombre) return String(source.componenteNombre).trim();
  const s = String(source).trim();
  // "Residuos 3" -> "Residuos"
  const name = s.replace(/\b\d+\b\s*$/,'').trim();
  return name || s;
}

// Construye el HTML de chips MDEA
function buildMdeaChips(idVar, compArray) {
  // compArray = [{ num:2, name:"lo que venga..."}, ...]  (name ya no se usa para la etiqueta)
  const seen = new Set();
  const ordered = [];
  compArray.forEach(c => {
    if (!c || c.num == null) return;
    if (!seen.has(c.num)) { seen.add(c.num); ordered.push(c); }
  });
  if (!ordered.length) {
    return `<span class="badge bg-secondary disabled badge-mdea" style="pointer-events:none;cursor:default;">Sin MDEA</span>`;
  }

  // orden ascendente por número de componente
  ordered.sort((a,b) => a.num - b.num);

  return ordered.map(c => `
    <button type="button"
            class="btn mdea-chip mdea-chip--${c.num}"
            data-idvar="${idVar}"
            data-mdea-comp="${c.num}"
            data-bs-toggle="modal"
            data-bs-target="#infoModal"
            title="Componente ${c.num}">
      ${getMdeaComponentLabel(c.num)}
    </button>
  `).join("");
}
// ==== FIN HELPERS MDEA/ODS ====

    // Referencias a los checkboxes
const relTabCheckbox = document.getElementById("relTabCheckbox");
const relMicroCheckbox = document.getElementById("relMicroCheckbox");
const chkRelAbiertos  = document.getElementById("chkRelAbiertos"); // ← NUEVO

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
    if (relTabCheckbox?.checked || relMicroCheckbox?.checked || chkRelAbiertos?.checked) {
      filtered = filtered.filter(variable => {
        const matchRelTab    = relTabCheckbox?.checked   ? variable.relTab === "Sí" : true;
        const matchRelMicro  = relMicroCheckbox?.checked ? hasMicrodatos(variable)  : true;
        const matchAbiertos  = chkRelAbiertos?.checked   ? hasDatosAbiertos(variable) : true;
        return matchRelTab && matchRelMicro && matchAbiertos;
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
chkRelAbiertos?.addEventListener("change", filterByRelation);
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
    window.initialPaintDone = true;
  window.renderLocked = false;
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
          //renderPage(allData, 1);
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
  chkRelAbiertos.checked = false; // ← NUEVO
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
    if (!totalVariablesElement) return;

    // Lee valor actual, acepta comas o espacios
    const raw = String(totalVariablesElement.textContent || '').replace(/[^0-9]/g, '');
    const current = parseInt(raw, 10) || 0;
    const to = Math.max(0, Number(count) || 0);

    // Formateador con espacio como separador de miles: 1719 -> "1 719"
    function formatWithSpace(n) {
      return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    if (current === to) {
      totalVariablesElement.textContent = formatWithSpace(to);
      return;
    }

    const duration = 600; // ms de animación
    const start = performance.now();
    const from = current;

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * t);
      totalVariablesElement.textContent = formatWithSpace(value);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
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
  if (!window.initialPaintDone && !window.renderLocked) {
    renderPage(currentFilteredData, currentPage);
    setupPagination(currentFilteredData);
    updateVariableCounter(allData.length);
    window.initialPaintDone = true;
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
const DEFAULT_END_YEAR_CAP = 2024;

// Reglas por proceso (idPp)
const SPECIAL_RULES = {
  
  CPV: {
    seriesOverride: [1895,1900,1910,1921,1930,1940,1950,1960,1970,1980,1990,1995,2000,2005,2010,2020],
    capYear: 2020,
    greenFromYear: 1950,
    noLinks: true, // además de DISABLE_LINKS_ON_HIT global, forzamos en CPV
  },
  EIC:   {  capYear: 2015 },
  ENIGH: { capYear: 2022, greenFromYear: 2016 },
  ENADID: {
  seriesOverride: [1992, 1997, 2006, 2009, 2014, 2018],
  capYear: 2023,
  lastYearOverride: 2023
  },
  ENBIARE: { seriesOverride: [2021], capYear: 2021 },
  EM: { capYear: 2023 },
  ENUT: { seriesOverride: [2002, 2009, 2014, 2019], capYear: 2019 },
  ENILEMS: {
    seriesOverride: [2012, 2016, 2019],
    capYear: 2019,
    lastYearOverride: 2019   // ⬅️ Fuerza el nodo amarillo en 2019 para todas las variables
  },
  ENASEM: {  capYear: 2021,
    lastYearOverride: 2021 },
  ENIF: { seriesOverride: [2012, 2015, 2018, 2021], capYear: 2021, lastYearOverride: 2021},
  EFL: { capYear: 2019 },
  ENTI: { periodicityOverride: 3, capYear: 2022 },
  ENASIC: { seriesOverride: [2022], capYear: 2022 },
  ENCO: { lastYearOverride: 2021, capYear: 2021 }, // resaltar 2021 en amarillo
    ENA: {
    seriesOverride: [2012, 2014, 2017, 2019],
    capYear: 2019
  },
};

const ECON_CAPS = {
  ATUS:   2023,
  BCMM:   2024,
  EAC:    2024,
  EAEC:   2024,
  EAIM:   2024,
  EAT:    2024,
  EFIPEM: 2023,
  EIMM:   2024,
  EMIM:   2024,
  ENA:    2019,
  ENAF:   2020,
  ESGRM:  2024,
  ETUP:   2024,
  IMMEX:  2025,
  RAECIS: 2023,
  RENEM:  2024,
};

// Fusiona ECON_CAPS dentro de SPECIAL_RULES como capYear (sin pisar otras reglas)
for (const [idPp, cap] of Object.entries(ECON_CAPS)) {
  SPECIAL_RULES[idPp] = { ...(SPECIAL_RULES[idPp] || {}), capYear: cap };
}

// Regla global: el nodo destacado (amarillo) no tiene link
const DISABLE_LINKS_ON_HIT = false;

// Lista de respaldo de procesos que consideramos Sociodemográficos.
// (Si tu backend ya expone proc.unidad === 'Sociodemográficas', esto es solo fallback.)
const SOCIODEMOG_PP = new Set([
  'CPV','ENADID','ENIGH','ENUT','ENOE','ENASIC','ENBIARE','ENILEMS','ENTI','ENIF','ENCO'
]);

function isSociodemografica(variable, proc) {
  const uVar  = (variable?._unidad || '').toLowerCase();
  const uProc = (proc?.unidad || '').toLowerCase();
  const idpp  = normIdPp(proc?.idPp || variable?.idPp || '');
  return (
    uVar.includes('sociodemogr') ||
    uProc.includes('sociodemogr') ||
    SOCIODEMOG_PP.has(idpp)
  );
}

const ECON_PP = new Set(Object.keys(ECON_CAPS)); // o declara explícitamente los idPp económicos

function isEconomica(variable, proc) {
  const uVar  = (variable?._unidad || '').toLowerCase();
  const uProc = (proc?.unidad || '').toLowerCase();
  const idpp  = normIdPp(proc?.idPp || variable?.idPp || '');
  return (
    (variable?._source === 'economicas-ultima') ||
    uVar.includes('económ') ||
    uProc.includes('económ') ||
    ECON_PP.has(idpp)
  );
}

// Construye un mapa { año:number -> url:string } usando fuenteIden
function mapEnlacesPorAnio(eventos, idVar) {
  const map = new Map();
  if (!Array.isArray(eventos)) return map;
  for (const ev of eventos) {
    if ((ev?.idVar || '').trim() !== String(idVar).trim()) continue;
    const y = parseInt(String(ev?.evento ?? ev?.anioEvento ?? '').trim(), 10);
    const url = (ev?.fuenteIden || '').trim();
    if (Number.isFinite(y) && url && !map.has(y)) {
      map.set(y, url);
    }
  }
  return map;
}

// Envuelve el año como enlace (target _blank) cuando hay URL
function wrapYearWithLink(y, url) {
  const safe = encodeURI(url);
  return `<a class="tl-link" href="${safe}" target="_blank" rel="noopener noreferrer" aria-label="Abrir fuente del ${y}">${y}</a>`;
}


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

    // Años con evento (para colorear en verde)
    const eventYears = getEventYearsForVar(variable.idVar, eventosRelacionados, variable);
    const greenYearsSet = new Set(eventYears);

    // Determinar año "hit" (amarillo)
    
    const rule = SPECIAL_RULES[normIdPp(proc.idPp)];
    const esEco = isEconomica(variable, proc);
    let hitYear = null;

    // 1) ECONÓMICAS: usar SIEMPRE el año más reciente con evento
    if (esEco && eventYears.length) {
      hitYear = eventYears[eventYears.length - 1]; // max (eventYears viene ascendente)
    }

    // 2) Si no es Económica (o no hay eventos), respeta overrides por proceso
    if (!hitYear && rule && rule.lastYearOverride) {
      hitYear = rule.lastYearOverride;
    }

    // 3) SOCIODEMOGRÁFICAS u otros: si hay eventos, usar el más reciente
    if (!hitYear && eventYears.length) {
      hitYear = eventYears[eventYears.length - 1];
    }

    // 4) ÚLTIMO recurso (solo si NO es económica): permitir _anioReferencia
    if (!hitYear && variable._source !== 'economicas-ultima' && Number.isFinite(variable._anioReferencia)) {
      hitYear = variable._anioReferencia;
    }

    // Asegura que el HIT se vea aunque quede fuera del rango/override
    if (hitYear && !years.includes(hitYear)) {
      years.push(hitYear);
      years.sort((a,b)=>a-b);
    }


    // Enlaces por año SOLO si la variable/proceso es Sociodemográfica
    const sociodemo = isSociodemografica(variable, proc);
    const enlacesPorAnio = sociodemo ? mapEnlacesPorAnio(eventosRelacionados, variable.idVar) : new Map();

    // Construcción de nodos
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

      // Si es hit (amarillo), NO poner enlace jamás (regla global)
      // Si no es hit y hay fuenteIden para ese año, envolver en <a>
     // Permitir enlaces incluso en años hit (amarillo)
      let yearHtml = `<span class="tl-year" ${tooltipAttr}>${y}</span>`;
      if (enlacesPorAnio.has(y)) {
        const url = enlacesPorAnio.get(y);
        yearHtml = `<span class="tl-year" ${tooltipAttr}>${wrapYearWithLink(y, url)}</span>`;
      }
      return `
        <li class="li ${liClass} d-flex flex-column align-items-center">
          <div class="timestamp mb-2">
            <span class="date mb-2">${yearHtml}</span>
          </div>
          <div class="status text-center"></div>
        </li>
      `;
    }).join('');

    // Leyenda textual
    const legend = `
      <div class="timeline-legend mt-2 text-center small">
        <div class="d-flex justify-content-center flex-wrap gap-4">
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-neutral"></span>
            <span>Año del Proceso de Producción sin información disponible de la variable</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-green"></span>
            <span>Año del Proceso de Producción con información disponible de la variable</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="legend-box legend-yellow"></span>
            <span>Año de la información presentada</span>
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
  data = Array.isArray(data) ? data : [];
  const total = data.length;

  // Siempre actualizar contador (para que muestre 0 cuando corresponde)
  updateVariableCounter(total);

  // Si no hay elementos tras aplicar filtros/búsqueda -> mostrar mensaje amable
  if (total === 0) {
    paginationContainer.innerHTML = "";

    // Si ya hay datos cargados en el sistema pero el filtrado devolvió 0,
    // mostramos el mensaje específico solicitado.
    if (Array.isArray(allData) && allData.length > 0) {
      container.innerHTML = `<div class="alert alert-warning text-center">No se encontraron elementos relacionados con la busqueda</div>`;
    } else {
      // Si no existe ningún dato cargado (carga inicial vacía), mostrar card vacía con spinners
      container.innerHTML = `
        <div class="card shadow-sm border-0">
          <div class="card-body text-center py-5">
            <h5 class="card-title mb-2">Cargando...</h5>
            <p class="card-text text-muted mb-4">Desplegando el listado de variables.</p>
            <div class="d-flex justify-content-center gap-3">
              <div class="spinner-grow text-secondary" role="status" style="width:1.25rem; height:1.25rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <div class="spinner-grow text-secondary" role="status" style="width:1.25rem; height:1.25rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
              <div class="spinner-grow text-secondary" role="status" style="width:1.25rem; height:1.25rem;">
                <span class="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </div>`;
    }
    return;
  }

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
    // dentro de renderPage, donde defines los badges:
   // ya tienes esEco calculado arriba
    const esEco = (getUnidadDeVariable(variable) === 'eco');
    const esSocio = !esEco;

    const badgeAbiertosHTML = (() => {
      if (esSocio) {
        // SOCIO: abre modal y la lógica del listener pintará "En proceso de captura"
        return `
          <span class="badge bg-secondary badge-datosabiertos"
                style="cursor:pointer"
                data-idvar="${variable.idVar}"
                data-bs-toggle="modal"
                data-bs-target="#infoModal">
            Datos Abiertos
          </span>`;
      }

      // ECO con datos embebidos
      if (variable.relAbiertos === 'Sí' &&
          Array.isArray(variable._datosAbiertosList) &&
          variable._datosAbiertosList.length) {
        return `
          <span class="badge bg-success badge-datosabiertos"
                style="cursor:pointer"
                data-idvar="${variable.idVar}"
                data-bs-toggle="modal"
                data-bs-target="#infoModal">
            Datos Abiertos
          </span>`;
      }

      // ECO sin datos: badge gris que NO abre modal
      return `
      <span class="badge bg-danger badge-datosabiertos disabled"
            style="cursor:default; pointer-events:none;">
        Sin Datos Abiertos
      </span>`;
    })();


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
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Pregunta utilizada para recolectar esta variable en el cuestionario">
                            <i class="bi bi-question-circle me-1"></i>Pregunta:</span>
                          <div class="ps-3">
                            <p>${hPregLit}
                          </div>

                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Respuestas posibles de la pregunta de captación. Si la pregunta es abierta, este campo puede no aplicarse">
                            <i class="bi bi-question-circle me-1"></i>Clasificación:</span>
                          <div class="ps-3">
                            ${getClasificacionesPorVariableHighlighted(variable.idVar, term)} <!-- 👈 (ver paso 4) -->
                          </div>
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Descripción detallada de la variable tal como aparece en la Fuente<sup>1</sup>">
                            <i class="bi bi-info-circle me-1"></i>Definición:</span>
                          <div class="ps-3">${hDefVar}</div> <!-- 👈 -->
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Denominación de la variable proporcionada por la Fuente<sup>1</sup>">
                            <i class="bi bi-tag me-1"></i>Variable Fuente<sup>1</sup>:</span>
                          <span class="text-dark ms-1 fw-normal">${hNomVar}</span> <!-- 👈 -->
                        </div>
                      <br>
                      <br>
                      <br>
                      <br>
                      <br>
                      <br>
                      <br>
                        <p style="font-size: 9px;"> <sup>1</sup>Fuente:Origen de identificación de la variable proporcionada por:
                      <br>
                      la Iniciativa de Documentación de Datos(DDI), el Descriptor de archivos (FD), 
                      <br>
                      Cuestionario o Esquema conceptual.</p>
                      </div>
                      

                      <div class="col-md-6">
                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Cnjunto de personas, elementos o unidades que se estudian y cuanrifican por la variable">
                            <i class="bi bi-diagram-3 me-1"></i>Categoría:</span>
                          <span class="text-dark ms-1 fw-normal">${hCategoria}</span> <!-- 👈 -->
                        </div>

                        <div class="mb-2">
                          <span class="fw-semibold text-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Tema al que se relaciona la variable">
                            <i class="bi bi-layers me-1"></i>Temática:</span>
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
                                   data-bs-title="Disponibilidad de los datos de la variable según los productos de información: tabulados, microdatos o datos abiertos">
                               <i class="bi bi-link-45deg me-1"></i>Consulta de datos en:
                             </span>
                             <div class="ps-3 d-flex flex-wrap gap-2">
                                <span class="badge bg-${variable.relTab === 'Sí' ? 'success badge-tabulado' : 'danger disabled'}"
                                    style="
                                        cursor:${variable.relTab === 'Sí' ? 'pointer' : 'default'};
                                        ${variable.relTab !== 'Sí' ? 'pointer-events:none;' : ''}
                                      "
                                      data-idvar="${variable.idVar}"
                                      ${variable.relTab === 'Sí'
                                        ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="tabulado"'
                                        : ''}>
                                  ${variable.relTab === 'Sí' ? 'Tabulados' : 'Sin Tabulados'}
                                </span>

                                ${(() => {
                                    const active = hasMicrodatos(variable);
                                    return `
                                      <span class="badge ${active ? 'bg-success badge-microdatos' : 'bg-danger disabled'}"
                                            style="cursor:${active ? 'pointer' : 'default'};${!active ? 'pointer-events:none;' : ''}"
                                            data-idvar="${variable.idVar}"
                                            ${active ? 'data-bs-toggle="modal" data-bs-target="#infoModal" data-type="microdatos"' : ''}>
                                        ${active ? 'Microdatos' : 'Sin Microdatos'}
                                      </span>
                                    `;
                                  })()}
                                ${badgeAbiertosHTML} <!-- 👈 NUEVO -->
                             </div>

                           <!-- 🔹 Bloque ODS -->
                            <span class="fw-semibold text-secondary mt-2"
                                  data-bs-toggle="tooltip" data-bs-placement="left"
                                  data-bs-title="Objetivos del Desarrollo Sostenible (ODS) a los que contribuye la variable">
                              <i class="bi bi-globe me-1"></i>Alineación con los ODS
                            </span>
                            <div class="ps-3 d-flex flex-wrap gap-2 ods-thumbs-wrap">
                            ${
                              (variable.alinOds !== 'Sí')
                                ? `<span class="badge bg-secondary disabled badge-ods" style="pointer-events:none;cursor:default;">Sin ODS</span>`
                                : (() => {
                                    // Económicas con lista embebida:
                                    if (Array.isArray(variable._odsList) && variable._odsList.length) {
                                      const set = new Set(
                                        variable._odsList
                                          .map(o => getOdsObjectiveNumber(o?.objetivo))
                                          .filter(n => n != null)
                                      );
                                      return set.size
                                        ? buildOdsThumbsImgs(variable.idVar, [...set])
                                        : `<span class="badge bg-secondary disabled badge-ods" style="pointer-events:none;cursor:default;">Sin ODS</span>`;
                                    }
                                    // Sociodemográficas (o casos sin _odsList): contenedor para carga perezosa
                                    return `<div class="ods-thumbs" data-idvar="${variable.idVar}"></div>`;
                                  })()
                            }
                          </div>

                            <!-- 🔹 Bloque MDEA -->
                              <span class="fw-semibold text-secondary"
                                    data-bs-toggle="tooltip" data-bs-placement="left"
                                    data-bs-title="Verifica el componente MDEA con el que se alinea la variable.">
                                <i class="bi bi-diagram-3 me-1"></i>Alineación con el MDEA
                              </span>
                              <div class="ps-3 d-flex flex-wrap gap-2 mdea-chips-wrap">
                                ${
                                  (variable.alinMdea !== 'Sí')
                                    ? `<span class="badge bg-secondary disabled badge-mdea" style="pointer-events:none;cursor:default;">Sin MDEA</span>`
                                    : (() => {
                                        // ECONÓMICAS con lista embebida
                                        if (Array.isArray(variable._mdeasList) && variable._mdeasList.length) {
                                         const comps = (variable._mdeasList || [])
                                          .map(m => ({ num: getMdeaComponentNumber(m.componente) }))
                                          .filter(x => x.num != null);
                                        return buildMdeaChips(variable.idVar, comps);
                                        }
                                        // SOCIO u otros: contenedor para carga perezosa
                                        return `<div class="mdea-chips" data-idvar="${variable.idVar}"></div>`;
                                      })()
                                }
                              </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    container.appendChild(card);

  // === Inicializar tooltips (robusto, compatible con <sup>) ===
const tooltips = card.querySelectorAll('[data-bs-toggle="tooltip"]');
if (tooltips.length) {
  const initTooltips = () => {
    try {
      // Detectar versión de Bootstrap
      const bsVersion = bootstrap?.Tooltip?.VERSION || '5.x';

      // --- Caso Bootstrap 5.0 a 5.2 ---
      if (parseFloat(bsVersion) < 5.3) {
        const allowListWithSup = {
          ...bootstrap.Tooltip.Default.allowList,
          sup: [] // permitir <sup> sin atributos
        };

        const cfg = {
          html: true,
          sanitize: true,
          allowList: allowListWithSup,
          container: 'body'
        };

        tooltips.forEach(el => new bootstrap.Tooltip(el, cfg));
      }

      // --- Caso Bootstrap 5.3 o superior ---
      else {
        // Usa DOMPurify si está disponible (recomendado)
        const sanitizeFn = (content) =>
          window.DOMPurify
            ? DOMPurify.sanitize(content, { ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'sup', 'sub', 'span'] })
            : content;

        const cfg = {
          html: true,
          sanitizeFn,
          container: 'body'
        };

        tooltips.forEach(el => new bootstrap.Tooltip(el, cfg));
      }

    } catch (err) {
      console.warn('Error inicializando tooltips con HTML, intentando fallback:', err);
      // Fallback sin HTML
      try {
        tooltips.forEach(el => new bootstrap.Tooltip(el));
      } catch (e) {
        console.error('Error en fallback de tooltips:', e);
      }
    }
  };

  // Ejecutar inicialización
  initTooltips();
}

    // Inicializar de MDEA perezoso
    // Carga perezosa de chips MDEA cuando no vienen embebidos
      let __mdeaCache__ = null;
      async function fetchMdeaOnce() {
        if (__mdeaCache__ != null) return __mdeaCache__;
        const res = await fetch('/api/mdea');
        const data = await res.json();
        // el endpoint a veces regresa 1 registro o arreglo
        __mdeaCache__ = Array.isArray(data) ? data : (data ? [data] : []);
        return __mdeaCache__;
      }

      const lazyMdea = card.querySelectorAll('.mdea-chips');
      lazyMdea.forEach(async (box) => {
        const idVar = box.getAttribute('data-idvar');
        const paintEmpty = () => {
          box.outerHTML = `<span class="badge bg-secondary disabled badge-mdea"
                                style="pointer-events:none;cursor:default;">Sin MDEA</span>`;
        };
        try {
          const all = await fetchMdeaOnce();
          // para socio, muchas veces hay UN registro por variable
          const registros = all.filter(r => String(r.idVar) === String(idVar));
          if (!registros.length) return paintEmpty();

          // Construye lista de componentes detectados
          const comps = [];
            registros.forEach(r => {
              const num = getMdeaComponentNumber(r.componente ?? r.compo ?? r.componenteNombre ?? r.componenteId ?? r.componenteCodigo);
              if (num != null) comps.push({ num });
            });
            box.outerHTML = `<div class="d-flex flex-wrap gap-2">
              ${buildMdeaChips(idVar, comps)}
            </div>`;
        } catch (err) {
          console.error('MDEA lazy error:', err);
          paintEmpty();
        }
      });


    // Cargar thumbs ODS por variable (sólo cuando no vienen embebidos)
   // Poblar thumbnails ODS cuando no vienen embebidos (socio, etc.)
            const lazyThumbs = card.querySelectorAll('.ods-thumbs');
      lazyThumbs.forEach(async (box) => {
        const idVar = box.getAttribute('data-idvar');

        // Helper para pintar “Sin ODS”
        const paintEmpty = () => {
          box.outerHTML = `<span class="badge bg-secondary disabled badge-ods"
                                style="pointer-events:none;cursor:default;">Sin ODS</span>`;
        };

        try {
          const all = await fetchOdsOnce(); // usa caché
          // Filtra registros de esta variable (acepta objeto único o array)
          const registros = all.filter(ods => String(ods.idVar) === String(idVar));

          if (!registros.length) return paintEmpty();

          // Extrae objetivo 1..17 desde campos 'ods' o 'objetivo'
          const set = new Set(
            registros
              .map(o => getOdsObjectiveNumber(o?.ods ?? o?.objetivo))
              .filter(n => n != null)
          );

          if (set.size === 0) return paintEmpty();

          // Ordena ascendente y pinta
          const ordered = [...set].sort((a, b) => a - b);

          box.outerHTML = `<div class="d-flex flex-wrap gap-2">
            ${buildOdsThumbsImgs(idVar, ordered)}
          </div>`;
        } catch (err) {
          console.error('ODS lazy error:', err);
          paintEmpty();
        }
      });
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
      itemsPerPage = parseInt(this.value, 10);
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
  if (relTabCheckbox.checked || relMicroCheckbox.checked || chkRelAbiertos.checked) {
    filteredData = filteredData.filter(v => {
      const okTab     = relTabCheckbox.checked   ? v.relTab === "Sí" : true;
      const okMicro   = relMicroCheckbox.checked ? hasMicrodatos(v)  : true;
      const okAbiertos= chkRelAbiertos.checked   ? hasDatosAbiertos(v) : true;
      return okTab && okMicro && okAbiertos;
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
chkRelAbiertos.addEventListener("change", applyFilters);
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
            // ${t.comentarioA ? `<div class="small mt-1">${t.comentarioA}</div>` : ""}
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
    // ECONÓMICAS con microdatos embebidos
           if (variable && variable._source === "economicas-ultima" &&
              Array.isArray(variable._microdatosList) && variable._microdatosList.length) {

            const html = variable._microdatosList.map(m => {
              const comentario = String(m.comentarioA || "").trim();
              const showLabMsg =
                comentario.includes("Datos disponibles en el laboratorio de microdatos") ||
                comentario.includes("Microdatos disponibles en el laboratorio de microdatos");

              // mensaje resaltado con estilo INEGI
              const labMsgHTML = showLabMsg
                ? `<div class="microdatos-lab-msg mt-3">
                    ${comentario.match(/(Datos disponibles en el laboratorio de microdatos|Microdatos disponibles en el laboratorio de microdatos)/)[0]}
                  </div>`
                : "";

                 return `
                  <div class="mb-3 border-bottom pb-2">
                    ${m.urlAcceso ? `<div><strong>Acceso:</strong> <a href="${m.urlAcceso}" target="_blank" style="word-break: break-all;">${m.urlAcceso}</a></div>` : ""}
                    ${m.urlDescriptor ? `<div><strong>Descriptor:</strong> <a href="${m.urlDescriptor}" target="_blank" style="word-break: break-all;">${m.urlDescriptor}</a></div>` : ""}
                    ${(m.tabla || m.campo) ? `<div><strong>Ubicación:</strong> ${m.tabla || "-"} / ${m.campo || "-"}</div>` : ""}
                    ${m.descriptor ? `<div class="small text-muted">${m.descriptor}</div>` : ""}
                    ${labMsgHTML || (comentario && comentario !== "-" ? `<div class="small text-muted mt-1">${comentario}</div>` : "")}
                  </div>
                `;
              }).join("");

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
        `;
      } else {
        modalBody.innerHTML = "<div class='text-danger'>No hay información de microdatos disponible.</div>";
      }
    } catch (err) {
      console.error(err);
      modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información.</div>";
    }
  }

  // ============ DATOS ABIERTOS ============
  if (e.target.classList.contains("badge-datosabiertos")) {
  if (e.target.classList.contains("disabled")) return; // ← evita abrir modal

    const labelEl = document.getElementById("infoModalLabel");
    const bodyEl  = document.getElementById("infoModalBody");

    // Limpieza inmediata para evitar "arrastres"
    if (labelEl) labelEl.textContent = "Detalle de la Relación con Datos Abiertos";
    if (bodyEl)  bodyEl.innerHTML = "<div class='text-center'>Cargando...</div>";

    const idVar  = e.target.getAttribute("data-idvar");
    // Utilidad como en tus otros bloques
    function getVariableByIdVar(id) {
      return (Array.isArray(allData) ? allData : []).find(v => String(v.idVar) === String(id));
    }

    try {
      const variable = getVariableByIdVar(idVar);
      const unidad   = getUnidadDeVariable(variable);

      // SOCIO: mostrar leyenda dentro del modal
      if (unidad === 'socio') {
        if (bodyEl) {
          bodyEl.innerHTML = `
            <div class="alert alert-info mb-0">En proceso de captura</div>`;
        }
        return;
      }

      // ECO con datos embebidos correctamente
      if (variable &&
          variable.relAbiertos === 'Sí' &&
          Array.isArray(variable._datosAbiertosList) &&
          variable._datosAbiertosList.length) {

        const contenido = variable._datosAbiertosList.map(r => `
          <div class="mb-3 border-bottom pb-2">
            ${r.urlAcceso ? `
              <div class="mb-1">
                <strong>Acceso:</strong><br>
                <a href="${r.urlAcceso}" target="_blank" style="word-break: break-all;">${r.urlAcceso}</a>
              </div>` : ""}

            ${r.urlDescarga ? `
              <div class="mb-1">
                <strong>Descarga:</strong><br>
                <a href="${r.urlDescarga}" target="_blank" style="word-break: break-all;">${r.urlDescarga}</a>
              </div>` : ""}

            ${(r.tabla || r.campo) ? `
              <div class="mb-1">
                <strong>Ubicación:</strong><br>
                ${r.tabla || "No disponible"} / ${r.campo || "No disponible"}
              </div>` : ""}

            ${r.descriptor ? `
              <div class="mb-1">
                <strong>Descriptor:</strong><br>${r.descriptor}
              </div>` : ""}

            ${r.comentarioA && r.comentarioA !== "-" ? `
              <div class="small text-muted mt-1">${r.comentarioA}</div>` : ""}
          </div>
        `).join("");

        if (bodyEl) bodyEl.innerHTML = contenido || "<div class='text-danger'>No hay información disponible.</div>";
        return;
      }

      // ECO sin lista (si por alguna razón llegara aquí)
      if (bodyEl) {
        bodyEl.innerHTML = "<div class='alert alert-warning mb-0'>No se encontraron registros de Datos Abiertos para esta variable.</div>";
      }
    } catch (err) {
      console.error(err);
      if (bodyEl) bodyEl.innerHTML = "<div class='text-danger'>Error al cargar Datos Abiertos.</div>";
    }
  }


  // ============ MDEA (chips) ============
if (e.target.closest(".mdea-chip")) {
  const trigger = e.target.closest(".mdea-chip");
  const idVar   = trigger.getAttribute("data-idvar");
  const compNum = parseInt(trigger.getAttribute("data-mdea-comp"), 10);

  const modalTitle = document.getElementById("infoModalLabel");
  const modalBody  = document.getElementById("infoModalBody");
  if (modalTitle) modalTitle.textContent = `Alineación con MDEA (Componente ${compNum})`;
  if (modalBody)  modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

  const fmt = (s) => (s || "-").toString().replace(/_/g, " ").replace(/\s+/g, " ").trim();

  function getVariableByIdVar(id) {
    return (Array.isArray(allData) ? allData : []).find(v => String(v.idVar) === String(id));
  }

  (async () => {
    try {
      const variable = getVariableByIdVar(idVar);

     // 1) ECONÓMICAS con lista embebida
          if (variable && variable._source === "economicas-ultima" &&
              Array.isArray(variable._mdeasList) && variable._mdeasList.length) {

            const lista = variable._mdeasList.filter(m => getMdeaComponentNumber(m.componente) === compNum);
            if (!lista.length) {
              modalBody.innerHTML = "<div class='text-danger'>No hay información MDEA para ese componente.</div>";
              return;
            }

            // ✅ Mostrar: CÓDIGO (punteado) + NOMBRE. Sin guiones si no hay nombre.
            modalBody.innerHTML = lista.map(m => {
              // Preferimos los campos *Nombre* del endpoint
              const scName = (m.subcomponenteNombre || "").trim();
              const tName  = (m.temaNombre || "").trim();
              const e1Name = (m.estadistica1Nombre || "").trim();
              const e2Name = (m.estadistica2Nombre || "").trim();

              // Códigos crudos
              const scCode = (m.subcomponente || "").trim();
              const tCode  = (m.tema || "").trim();
              const e1Code = (m.estadistica1 || "").trim();
              const e2Code = (m.estadistica2 || "").trim();

              // Código punteado (25→2.5, 253b1→2.5.3.b.1)
              const scDot = scCode ? dotifyMdeaCode(scCode) : "";
              const tDot  = tCode  ? dotifyMdeaCode(tCode)  : "";
              const e1Dot = e1Code ? dotifyMdeaCode(e1Code) : "";
              const e2Dot = e2Code ? dotifyMdeaCode(e2Code) : "";

              // Línea helper: muestra "COD NOMBRE" si hay nombre; si no, solo COD; si no hay nada, no imprime
              const line = (label, codeDot, name) => {
                if (!codeDot && !name) return "";
                const text = name ? `${codeDot} ${name}` : codeDot;
                return `<div><strong>${label}:</strong> ${text}</div>`;
              };

              const lineComponente = `<div><strong>Componente:</strong> ${compNum} ${fmt(m.componenteNombre)}</div>`;
              const lineSubcomp    = line("Subcomponente", scDot, scName);
              const lineTema       = line("Tema",          tDot,  tName);
              const lineE1         = line("Estadística 1", e1Dot, e1Name);
              const lineE2         = line("Estadística 2", e2Dot, e2Name);

              return `
                <div class="mb-2 border-bottom pb-2">
                  ${lineComponente}
                  ${lineSubcomp}
                  ${lineTema}
                  ${lineE1}
                  ${lineE2}
                  <!-- contribución/comentario ocultos a petición -->
                </div>
              `;
            }).join("");
            return;
}


      // 2) SOCIO (fallback /api/mdea). Puede venir 1 registro; filtramos por compNum si posible
      const all = await fetch('/api/mdea').then(r => r.json()).then(d => Array.isArray(d) ? d : (d ? [d] : []));
      let registros = all.filter(r => String(r.idVar) === String(idVar));

      if (!registros.length) {
        modalBody.innerHTML = "<div class='text-danger'>No hay información del MDEA para esta variable.</div>";
        return;
      }

      // Si hay varios, intenta filtrar por componente numérico detectado en campos comunes
      const byComp = registros.filter(r => {
        const n = getMdeaComponentNumber(r.componente ?? r.compo ?? r.componenteNombre ?? r.componenteId ?? r.componenteCodigo);
        return n === compNum;
      });
      if (byComp.length) registros = byComp;

      // Render (mantén tu formato original, pero encabezando con el componente)
     modalBody.innerHTML = registros.map(info => {
        const num  = getMdeaComponentNumber(
          info.componente ?? info.compo ?? info.componenteNombre ?? info.componenteId ?? info.componenteCodigo
        ) ?? compNum;

        // 👇 elimina el número repetido al final (ej. “...salud ambiental 5” → “...salud ambiental”)
        const compNameRaw = (info.componenteNombre ?? info.componente ?? info.compo ?? "");
        const compNameNoEdges = String(compNameRaw)
        .replace(/^\s*\d+\s*[.\-:]?\s*/, "")   // inicio
        .replace(/\s*\b\d+\b\s*$/, "")         // final
        .trim();

       const lineComponente = `<div><strong>Componente:</strong> ${fmt(compNameNoEdges)}</div>`;

        const lineSubcomp = (info.subcompo || info.subcomponente)
          ? `<div><strong>Subcomponente:</strong> ${fmt(info.subcompo ?? info.subcomponente)}</div>` : "";
        const lineTema = (info.topico || info.tema)
          ? `<div><strong>Tema/Tópico:</strong> ${fmt(info.topico ?? info.tema)}</div>` : "";
        const lineE1 = (info.estAmbiental || info.estadistica1)
          ? `<div><strong>Estadística 1:</strong> ${fmt(info.estAmbiental ?? info.estadistica1)}</div>` : "";
        const lineE2 = (info.estadistica2)
          ? `<div><strong>Estadística 2:</strong> ${fmt(info.estadistica2)}</div>` : "";

        return `
          <div class="mb-2 border-bottom pb-2">
            ${lineComponente}
            ${lineSubcomp}
            ${lineTema}
            ${lineE1}
            ${lineE2}
          </div>
        `;
      }).join("");

    } catch (err) {
      console.error(err);
      modalBody.innerHTML = "<div class='text-danger'>Error al cargar la información del MDEA.</div>";
    }
  })();
}


  // ============ ODS ============
if (e.target.closest(".badge-ods")) {
  const trigger = e.target.closest(".badge-ods");  // <- asegura capturar el elemento correcto
  if (trigger.classList.contains("disabled")) return;

  const clickedOds = trigger.getAttribute("data-ods"); // 1..17 o null
  const idVar      = trigger.getAttribute("data-idvar");

  const modalTitle = document.getElementById("infoModalLabel");
  const modalBody  = document.getElementById("infoModalBody");

  if (modalTitle) {
    modalTitle.textContent = clickedOds
      ? `Alineación de la variable con los ODS (ODS ${clickedOds})`
      : "Alineación de la variable con los ODS";
  }
  if (modalBody) modalBody.innerHTML = "<div class='text-center'>Cargando...</div>";

  const fmt = (s) => (s || "-").toString().replace(/_/g, " ").replace(/\s+/g, " ").trim();

  try {
    function getVariableByIdVar(id) {
      return (Array.isArray(allData) ? allData : []).find(v => String(v.idVar) === String(id));
    }
    const variable = getVariableByIdVar(idVar);

    // 1) Económicas con _odsList embebido
    if (variable && variable._source === "economicas-ultima" &&
        Array.isArray(variable._odsList) && variable._odsList.length) {

      let lista = variable._odsList;
      if (clickedOds) {
        const target = parseInt(clickedOds, 10);
        lista = lista.filter(o => getOdsObjectiveNumber(o?.objetivo) === target);
      }

      if (!lista.length) {
        modalBody.innerHTML = "<div class='text-danger'>No hay información de ODS para ese objetivo.</div>";
        return;
      }

          modalBody.innerHTML = `
          <div class="mb-2"><strong>${fmt(variable.varAsig || idVar)}</strong></div>
          <div class="list-group">
            ${lista.map(o => {
              const objNum = formatOdsObjetivo(o.objetivo); 
              const objNom = fmt(o.objetivoNombre);         
              const meta   = formatOdsComposite(o.meta);    
              const ind    = formatOdsComposite(o.indicador)

              return `
                <div class="list-group-item">
                  <div class="d-flex w-100 justify-content-between align-items-start">
                    <h6 class="mb-1">ODS: ${objNum} ${objNom}</h6>
                  </div>
                  <div class="small mb-1"><strong>Meta ODS detectada:</strong> ${meta}</div>
                  <div class="small mb-1"><strong>Indicador ODS:</strong> ${ind}</div>
                </div>
              `;
            }).join("")}
          </div>
      `;
      return;
    }

    // 2) Fallback a /api/ods (sociodemo, etc.)
    const res = await fetch(`/api/ods`);
    const data = await res.json();
    let registros = Array.isArray(data)
      ? data.filter(ods => String(ods.idVar) === String(idVar))
      : (data && String(data.idVar) === String(idVar) ? [data] : []);

    if (clickedOds) {
      const target = parseInt(clickedOds, 10);
      registros = registros.filter(r => getOdsObjectiveNumber(r?.ods ?? r?.objetivo) === target);
    }

    if (!registros.length) {
      modalBody.innerHTML = "<div class='text-danger'>No hay información de ODS para ese objetivo.</div>";
      return;
    }

    const varTitle = fmt((variable?.varAsig) || idVar);
       modalBody.innerHTML = `
          <div class="mb-2"><strong>${varTitle}</strong></div>
          <div class="list-group">
            ${registros.map(info => {
              const objNum = formatOdsObjetivo(info.ods ?? info.objetivo);
              const objNom = fmt(info.odsNombre || info.objetivoNombre || info.ods);
              // 👇 limpiamos guiones y mantenemos formato 12.2 / 12.2.1
              const meta = cleanUnderscores(formatOdsComposite(info.meta));
              const ind  = cleanUnderscores(formatOdsComposite(info.indicador));

              return `
                <div class="list-group-item">
                  <div class="d-flex w-100 justify-content-between align-items-start">
                    <h6 class="mb-1">ODS: ${objNum} ${objNom}</h6>
                  </div>
                  <div class="small mb-1"><strong>Meta ODS detectada:</strong> ${meta}</div>
                  <div class="small mb-1"><strong>Indicador ODS:</strong> ${ind}</div>
                  ${info.comentOds && info.comentOds.trim() !== "-" ? `<div class="small text-muted">${cleanUnderscores(info.comentOds)}</div>` : ""}
                </div>
              `;
            }).join("")}
          </div>
        `;


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

// ---- Nota de fuente al final de la página (texto pequeño, no altera layout) ----


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
    if (window.initialPaintDone && !window.renderLocked) { 
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