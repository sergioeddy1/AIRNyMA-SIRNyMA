let indicadoresData = [];

// --- Utils para tablaDatos -> tabla HTML ---
function parseTablaDatos(raw) {
  if (!raw) return null;
  try {
    // Puede llegar como string, JSONB, o con contenedor { serie: [...] }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.serie)) return data.serie;
    // Si no es array, intenta envolverlo si tiene estructura de filas sueltas
    return Array.isArray(data) ? data : null;
  } catch (e) {
    console.warn('No se pudo parsear tablaDatos:', e);
    return null;
  }
}

// Convierte claves a títulos más legibles
function humanizeKey(key) {
  const map = {
    anio: 'Año',
    area_urbana: 'Área urbana (km²)',
    vat: 'Vol. agua tratada (hm³)',
    vate: 'Tratada externamente (hm³)',
    vati: 'Tratada internamente (hm³)',
    vatr: 'Reciclada (hm³)',
    vart: 'Reusada (hm³)',
    vat_hm3: ' Volumen de agua tratada, reciclada o reusada (hm³)',
    vaa_hm3: 'Aprovechamiento anual (hm³)',
    vad_hm3: 'Volumen de descarga de agua residual (hm³)',
    total_obras_toma: 'Total obras de toma',
    obras_macromedidor_funcionando: 'Obras con macromedidor (func.)',
    total_tomas_domiciliarias: 'Total tomas domiciliarias',
    tomas_con_medidor_funcionando: 'Tomas con medidor (func.)',
    superficie_km2: 'Superficie (km²)',
    superficie_inicial_km2: 'Sup. inicial (km²)',
    superficie_final_km2: 'Sup. final (km²)',
    periodo: 'Periodo',
    Msap: 'Municipios o demarcaciones con servicio de agua potable',
    Mdi: 'Municipios o demarcaciones con difusión sobre gestión de agua y saneamiento'

  };
  return map[key] || key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

// Formato simple para números, pero año (anio) sin comas y como fecha
function fmt(val, key) {
  if (key === 'anio') {
    // Si es un número, lo muestra tal cual (sin comas)
    // Si es una fecha tipo '2021-01-01', solo muestra el año
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string' && /^\d{4}/.test(val)) return val.substring(0, 4);
    return val ?? '';
  }
  if (typeof val === 'number') return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(val);
  return val ?? '';
}

// Construye una tabla Bootstrap a partir de un array de objetos
function buildTableHTML(rows) {
  if (!rows || !rows.length) return '<div class="text-muted">No disponible</div>';

  // Columnas = unión de todas las claves
  const cols = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach(k => set.add(k));
      return set;
    }, new Set())
  );

  // Tabla
  let html = '<div class="table-responsive"><table class="table table-sm table-striped align-middle">';
  html += '<thead><tr>';
  cols.forEach(c => html += `<th>${humanizeKey(c)}</th>`);
  html += '</tr></thead><tbody>';

  rows.forEach(r => {
    html += '<tr>';
    cols.forEach(c => html += `<td>${fmt(r?.[c], c)}</td>`);
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}
// --- Fin Utils ---

document.addEventListener("DOMContentLoaded", function () {
  // Cargar datos de la API
  fetch('/api/indicadores_ambientales')
    .then(res => res.json())
    .then(data => {
      indicadoresData = data;
    });

  // Script para el navbar
  const currentPath = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
    }
  });

  // Script para el modal de indicadores
 document.querySelectorAll('.indicador-row').forEach(row => {
  row.style.cursor = 'pointer';
  row.addEventListener('click', function () {
    const indicadorNombre = this.getAttribute('data-indicador');
    const indicador = indicadoresData.find(i => i.nombreIndicador === indicadorNombre);

    const modalEl = document.getElementById('indicadorModal');
    const modalBody = document.getElementById('indicadorModalBody');

    if (indicador) {
      document.getElementById('indicadorModalLabel').textContent = indicador.nombreIndicador;

      // Parseo y tabla HTML
      const filasTabla = parseTablaDatos(indicador.tablaDatos);
      const tablaHTML = buildTableHTML(filasTabla);

  document.getElementById('indicadorModalBody').innerHTML = `
  <div class="container">
  <!-- Título interno -->
  <div class="mb-2">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Nombre del Indicador</div>
    <div class="bg-light border rounded p-2">${indicador.nombreIndicador || ''}</div>
  </div>

  <!-- Tipo y Unidad -->
  <div class="row g-3">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Tipo de indicador</div>
      <div class="bg-light border rounded p-2">${indicador.tipoIndicador || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Unidad de medida</div>
      <div class="bg-light border rounded p-2">${indicador.unidadMedida || ''}</div>
    </div>
  </div>

  <!-- Descripciones -->
  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Descripción corta del indicador</div>
    <div class="bg-light border rounded p-2">${indicador.descripcionCorta || ''}</div>
  </div>

  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Descripción del valor en el espacio/tiempo</div>
    <div class="bg-light border rounded p-2">${indicador.descripcionValor || ''}</div>
  </div>

  <!-- Definición y Fórmula / Alcance -->
  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Definición de variables</div>
    <div class="bg-light border rounded p-2 text-muted">${indicador.definicionVariables || ''}</div>
  </div>

  <div class="row g-3 mt-1">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Fórmula de cálculo</div>
      <div class="bg-light border rounded p-2 text-muted">${indicador.formulaCalculo || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Alcance (qué mide)</div>
      <div class="bg-light border rounded p-2">${indicador.alcance || ''}</div>
    </div>
  </div>

  <!-- Limitaciones / Relevancia -->
  <div class="row g-3 mt-1">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Limitaciones (qué no mide)</div>
      <div class="bg-light border rounded p-2">${indicador.limitaciones || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Relevancia</div>
      <div class="bg-light border rounded p-2">${indicador.relevancia || ''}</div>
    </div>
  </div>

  <!-- Gráfico -->
  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Gráfico / tendencia</div>
    <div class="bg-light border rounded p-2">
      <div class="ratio ratio-16x9">
        <canvas id="indicadorChart"></canvas>
      </div>
    </div>
  </div>

  <!-- Frase / Notas -->
  <div class="row g-3 mt-1">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Frase de tendencia</div>
      <div class="bg-light border rounded p-2">${indicador.fraseTendencia || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Notas sobre la serie</div>
      <div class="bg-light border rounded p-2">${indicador.notasSerie || 'No aplica'}</div>
    </div>
  </div>

  <!-- Cobertura / Desagregación / Periodo -->
  <div class="row g-3 mt-1">
    <div class="col-md-4">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Cobertura</div>
      <div class="bg-light border rounded p-2">${indicador.cobertura || ''}</div>
    </div>
    <div class="col-md-4">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Desagregación</div>
      <div class="bg-light border rounded p-2">${indicador.desagregacion || ''}</div>
    </div>
    <div class="col-md-4">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Periodo disponible</div>
      <div class="bg-light border rounded p-2">${indicador.periodoDisponible || ''}</div>
    </div>
  </div>

  <!-- Método / Disponibilidad / Periodicidad -->
  <div class="row g-3 mt-1">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Método de captura</div>
      <div class="bg-light border rounded p-2 text-muted">${indicador.metodoCaptura || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Disponibilidad y periodicidad</div>
      <div class="bg-light border rounded p-2 text-muted">
        <div><strong>Disponibilidad:</strong> ${indicador.disponibilidadDatos || ''}</div>
        <div><strong>Periodicidad de datos:</strong> ${indicador.periodicidadDatos || ''}</div>
        <div><strong>Actualización:</strong> ${indicador.periodicidadActualizacion || ''}</div>
      </div>
    </div>
  </div>

  <!-- Políticas -->
  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Relación con políticas u ODS</div>
    <div class="bg-light border rounded p-2 text-muted">${indicador.relacionPoliticasAmbientales || ''}</div>
  </div>

  <!-- Tabla -->
  <div class="mt-3">
    <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Tabla de datos</div>
    <div class="bg-light border rounded p-2">
      <div id="tablaDatosContainer">${tablaHTML}</div>
    </div>
  </div>

  <!-- Fuente / Requisitos -->
  <div class="row g-3 mt-1">
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Fuente de datos</div>
      <div class="bg-light border rounded p-2 small text-muted">${indicador.fuenteDatos || ''}</div>
    </div>
    <div class="col-md-6">
      <div class="fw-bold fs-6 border-start border-4 border-success ps-2">Requisitos de coordinación</div>
      <div class="bg-light border rounded p-2 small text-muted">${indicador.requisitosCoordinacion || ''}</div>
    </div>
  </div>
</div>
     
  `;
    const onShown = () => {
        renderIndicadorChart('indicadorChart', indicador.tablaDatos || indicador.tablaGraficos);
        modalEl.removeEventListener('shown.bs.modal', onShown);
      };
      modalEl.addEventListener('shown.bs.modal', onShown);

    } else {
      document.getElementById('indicadorModalLabel').textContent = indicadorNombre;
      modalBody.innerHTML = `<p>No se encontró información adicional para este indicador.</p>`;
      // ⛔️ No llames render aquí
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });
});
});

// Script para el grafico de los indicadores
let indicadorChartInstance = null;

function getSerie(rawTablaDatos) {
  const data = typeof rawTablaDatos === 'string' ? JSON.parse(rawTablaDatos) : rawTablaDatos;
  return Array.isArray(data) ? data : (Array.isArray(data?.serie) ? data.serie : []);
}

function inferDatasets(serie) {
  if (!serie.length) return { labels: [], datasets: [] };
  // Eje X
  const labelKey = Object.keys(serie[0]).find(k => k.toLowerCase() === 'anio' || k.toLowerCase() === 'año' || k === 'periodo') || Object.keys(serie[0])[0];
  const labels = serie.map(r => r[labelKey]);

  // Posibles métricas conocidas (ajusta y amplía si quieres)
  const known = [
    { key: 'vat_hm3', label: 'Agua tratada (hm³)' },
    { key: 'vad_hm3', label: 'Descarga de agua residual (hm³)' },
    { key: 'vate',    label: 'Tratada externamente (hm³)' },
    { key: 'vati',    label: 'Tratada internamente (hm³)' },
    { key: 'vatr',    label: 'Reciclada (hm³)' },
    { key: 'vart',    label: 'Reusada (hm³)' },
    { key: 'Msap',    label: 'Municipios con servicio' },
    { key: 'Mdi',     label: 'Municipios con difusión' },
    { key: 'mgs',     label: 'Municipios con programas' },
    { key: 'msap',    label: 'Municipios con servicio' },
    { key: 'area_urbana', label: 'Área urbana (km²)' },
    { key: 'superficie_km2', label: 'Superficie (km²)' },
    { key: 'total_obras_toma', label: 'Total obras de toma' },
    { key: 'tomas_con_medidor_funcionando', label: 'Tomas con medidor (func.)' },
    { key: 'total_tomas_domiciliarias', label: 'Total tomas domiciliarias' },
    { key: 'vat', label: 'Volumen agua tratada (hm³)' },
    { key: 'obras_macromedidor_funcionando', label: 'Obras con macromedidor (func.)' },
    { key: 'superficie_inicial_km2', label: 'Superficie inicial (km²)' },
    { key: 'superficie_final_km2',   label: 'Superficie final (km²)' }
  ];

  // datasets directos
  const datasets = known
    .filter(k => serie.some(r => r[k.key] != null))
    .map(k => ({
      label: k.label,
      data: serie.map(r => r[k.key] ?? null),
      tension: 0.25,
      borderWidth: 2,
      pointRadius: 5
    }));

  // cálculo opcional de % cuando hay Mdi/Msap
  const hasMsap = serie.some(r => r.Msap != null || r.msap != null);
  const hasMdi  = serie.some(r => r.Mdi  != null || r.mdi  != null);
  if (hasMsap && hasMdi) {
    const mdiKey  = serie[0].Mdi != null ? 'Mdi' : 'mdi';
    const msapKey = serie[0].Msap != null ? 'Msap' : 'msap';
    const pct = serie.map(r => (r[msapKey] ? +( (r[mdiKey] / r[msapKey]) * 100 ).toFixed(2) : null));
    datasets.push({
      label: '% Difusión sobre servicio (Mdi/Msap)',
      data: pct,
      yAxisID: 'y2',
      borderWidth: 2,
      pointRadius: 5
    });
  }

  return { labels, datasets };
}

function renderIndicadorChart(canvasId, tablaDatos) {
  const serie = getSerie(tablaDatos);
  const { labels, datasets } = inferDatasets(serie);
  const ctx = document.getElementById(canvasId);

  if (indicadorChartInstance) {
    indicadorChartInstance.destroy();
    indicadorChartInstance = null;
  }
  if (!labels.length || !datasets.length) return;

  indicadorChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Valores' } },
        y2: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Porcentaje (%)' } },
        x: { title: { display: true, text: 'Año' } }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });
}

