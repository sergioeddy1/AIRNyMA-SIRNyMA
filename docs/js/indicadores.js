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
    porcentaje: 'Porcentaje (%)', 
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
 fetch('https://emperor-sydney-capability-youth.trycloudflare.com/api/indicadores_ambientales')
  .then(res => res.json())
  .then(data => {
    indicadoresData = data;
  });


  
 const tbody         = document.querySelector('.tabla-indicadores tbody');
  if (!tbody) return;

  const filtroAnio    = document.getElementById('filtroAnio');
  const ordenNombre   = document.getElementById('ordenNombre');
  const ordenAnio     = document.getElementById('ordenAnio');
  const buscaIndicador= document.getElementById('buscaIndicador');

  // Guardamos las filas originales
  const allRows = Array.from(tbody.querySelectorAll('tr.indicador-row'));

  function apply() {
    const year = filtroAnio?.value || '';
    const term = (buscaIndicador?.value || '').trim().toLowerCase();

    // 1) Filtrar por año y por texto del indicador (1a celda)
    let rows = allRows.filter(tr => {
      const okYear = !year || tr.dataset.anio === year;
      const name   = tr.cells[0]?.textContent?.toLowerCase() || '';
      const okTerm = !term || name.includes(term);
      return okYear && okTerm;
    });

    // 2) Ordenar por nombre (si procede)
    if (ordenNombre && ordenNombre.value) {
      const dir = ordenNombre.value === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const na = a.cells[0].textContent.trim().toLowerCase();
        const nb = b.cells[0].textContent.trim().toLowerCase();
        return na < nb ? -1*dir : na > nb ? 1*dir : 0;
      });
    }

    // 3) Ordenar por año (si procede)
    if (ordenAnio && ordenAnio.value) {
      const dir = ordenAnio.value === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const ya = parseInt(a.dataset.anio || '0', 10);
        const yb = parseInt(b.dataset.anio || '0', 10);
        return (ya - yb) * dir;
      });
    }

    // 4) Pintar
    tbody.innerHTML = '';
    rows.forEach(tr => tbody.appendChild(tr));
  }

  // Listeners
  filtroAnio?.addEventListener('change', apply);
  ordenNombre?.addEventListener('change', apply);
  ordenAnio?.addEventListener('change', apply);
  buscaIndicador?.addEventListener('input', apply);

  // Primer render
  apply();

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

      // ¿Este indicador es el 23? (usa la propiedad real que traes: id, idIndicador, etc.)
      const isGraficoImagen = Number(indicador.id) === 23;

      // HTML del bloque de “Gráfico / tendencia”
      const graficoHTML = isGraficoImagen
        ? `
          <div class="ratio ratio-16x9 d-flex align-items-center justify-content-center">
            <img src="/assets/graficoid_23.png"
                alt="Gráfico indicador 23"
                class="img-fluid rounded border">
          </div>`
        : `
          <div class="ratio ratio-16x9">
            <canvas id="indicadorChart"></canvas>
          </div>`;

 document.getElementById('indicadorModalBody').innerHTML = `
   <div class="container">
    <!-- Nombre del Indicador -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold text-uppercase small text-muted bg-light border rounded p-2">Nombre del indicador</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.nombreIndicador || ''}</div>
    </div>

    <!-- Tipo / Unidad -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Tipo de indicador</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.tipoIndicador || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Unidad de medida</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.unidadMedida || ''}</div>
    </div>

    <!-- Descripciones -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Descripción corta</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.descripcionCorta || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Descripción del valor (espacio/tiempo)</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.descripcionValor || ''}</div>
    </div>

    <!-- Definición / Fórmula / Alcance -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Definición de variables</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.definicionVariables || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Fórmula de cálculo</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.formulaCalculo || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Alcance (qué mide)</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.alcance || ''}</div>
    </div>

    <!-- Limitaciones / Relevancia -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Limitaciones (qué no mide)</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.limitaciones || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Relevancia</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.relevancia || ''}</div>
    </div>

      <!-- Gráfico -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4">
        <div class="fw-semibold small text-muted bg-light border rounded p-2">Gráfico / tendencia</div>
      </div>
      <div class="col-md-8 bg-light border rounded p-2">
        ${graficoHTML}
      </div>
    </div>


    <!-- Frase / Notas -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Frase de tendencia</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.fraseTendencia || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Notas de la serie</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.notasSerie || 'No aplica'}</div>
    </div>

    <!-- Cobertura / Desagregación / Periodo -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Cobertura</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.cobertura || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Desagregación</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.desagregacion || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Periodo disponible</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.periodoDisponible || ''}</div>
    </div>

    <!-- Método / Disponibilidad / Periodicidad -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Método de captura</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.metodoCaptura || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Disponibilidad de datos</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.disponibilidadDatos || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Periodicidad de los datos</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.periodicidadDatos || ''}</div>
    </div>
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Periodicidad de actualización</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.periodicidadActualizacion || ''}</div>
    </div>

    <!-- Políticas -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Relación con políticas ambientales / ODS</div></div>
      <div class="col-md-8 bg-light border rounded p-2">${indicador.relacionPoliticasAmbientales || ''}</div>
    </div>

    <!-- Tabla de datos -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Tabla de datos</div></div>
      <div class="col-md-8 bg-light border rounded p-2">
        <div id="tablaDatosContainer">${tablaHTML}</div>
      </div>
    </div>

    <!-- Fuente / Requisitos -->
    <div class="row align-items-start mb-3">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Fuente de datos</div></div>
      <div class="col-md-8 bg-light border rounded p-2 small text-muted">${indicador.fuenteDatos || ''}</div>
    </div>
    <div class="row align-items-start">
      <div class="col-md-4"><div class="fw-semibold small text-muted bg-light border rounded p-2">Requisitos de coordinación</div></div>
      <div class="col-md-8 bg-light border rounded p-2 small text-muted">${indicador.requisitosCoordinacion || ''}</div>
    </div>
  </div>

  `;
    const onShown = () => {
      if (!isGraficoImagen) {
        renderIndicadorChart('indicadorChart', indicador.tablaGraficos);
      }
      modalEl.removeEventListener('shown.bs.modal', onShown);
    };
    modalEl.addEventListener('shown.bs.modal', onShown);

    } else {
      document.getElementById('indicadorModalLabel').textContent = indicadorNombre;
      modalBody.innerHTML = `<p>No se encontró información adicional para este indicador.</p>`;
    }

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });
});
});

// Script para el grafico de los indicadores
let indicadorChartInstance = null;

function getSerie(rawTablaGraficos) {
  const data = typeof rawTablaGraficos === 'string' ? JSON.parse(rawTablaGraficos) : rawTablaGraficos;
  return Array.isArray(data) ? data : (Array.isArray(data?.serie) ? data.serie : []);
}

function inferDatasets(serie) {
  if (!serie.length) return { labels: [], datasets: [] };
  // Eje X
  const labelKey = Object.keys(serie[0]).find(k => k.toLowerCase() === 'anio' || k.toLowerCase() === 'año' || k === 'periodo') || Object.keys(serie[0])[0];
  const labels = serie.map(r => r[labelKey]);

  // Posibles métricas conocidas (ajusta y amplía si quieres)
  const known = [
    { key: 'puntos',  label: 'Número de puntos' }, // id=24
    { key: 'calida',   label: 'Región cálida (%)' },
    { key: 'tropical', label: 'Región tropical (%)' },
    { key: 'templada', label: 'Región templada (%)' },
    { key: 'mineria_pct',  label: 'Minería (%)' }, // id = 17
    { key: 'indmanu_pct',  label: 'Industrias manufactureras (%)' }, // id = 17
    { key: 'variacion_pct', label: 'Variación porcentual (%)' }, // id=2
    { key: 'tasa_cambio',   label: 'Tasa de cambio' },            // id=5
    { key: 'porcentaje', label: 'Porcentaje (%)' },
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

function renderIndicadorChart(canvasId, tablaGraficos) {
  const serie = getSerie(tablaGraficos);
  const { labels, datasets } = inferDatasets(serie);
  const ctx = document.getElementById(canvasId);

  if (indicadorChartInstance) {
    indicadorChartInstance.destroy();
    indicadorChartInstance = null;
  }
  if (!labels.length || !datasets.length) return;

  // Detectar el eje X
  const sample = serie[0] || {};
  const labelKey = Object.keys(sample).find(k =>
    k.toLowerCase() === 'anio' || k.toLowerCase() === 'año' || k === 'periodo'
  ) || 'anio';
  let axisTitleX = (labelKey === 'periodo') ? 'Periodo' : 'Año';

  // Título Y por defecto
  let axisTitleY = 'Porcentaje (%)';
  if (serie.some(r => r.variacion_pct != null)) axisTitleY = 'Variación porcentual (%)';
  if (serie.some(r => r.tasa_cambio   != null)) axisTitleY = 'Tasa de cambio';

  // Caso id=24 (puntos): barras + título de eje Y numérico
  const isPuntosOnly =
    serie.some(r => r.puntos != null) &&
    !serie.some(r =>
      r.porcentaje != null || r.variacion_pct != null || r.tasa_cambio != null ||
      r.Mdi != null || r.mdi != null || r.Msap != null || r.msap != null ||
      r.vat_hm3 != null || r.vad_hm3 != null
    );

  const chartType = isPuntosOnly ? 'bar' : 'line';
  if (isPuntosOnly) axisTitleY = 'Número de puntos';

  // Ocultar y2 si no se usa
  const usaY2 = datasets.some(ds => ds.yAxisID === 'y2');

  indicadorChartInstance = new Chart(ctx, {
    type: chartType,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y:  { beginAtZero: true, title: { display: true, text: axisTitleY } },
        y2: { display: usaY2, beginAtZero: true, position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: usaY2, text: 'Porcentaje (%)' } },
        x:  { title: { display: true, text: axisTitleX } }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: isPuntosOnly ? {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-MX')}`
          } : {}
        }
      },
      // Mejoras visuales para barras (sólo aplica si es bar)
      ...(isPuntosOnly ? {
        datasets: {
          bar: { borderWidth: 0 }
        }
      } : {})
    }
  });
}