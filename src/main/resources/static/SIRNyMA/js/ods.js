(function () {
  const sesionStr = localStorage.getItem('sirnmaUser') || sessionStorage.getItem('sirnmaUser');

  if (!sesionStr) {
    // No hay sesión → mandar a login
    window.location.href = '../pages/login.html'; // ajusta la ruta
    return;
  }

  const sesion = JSON.parse(sesionStr);
  console.log('Usuario autenticado:', sesion.username);
/* TItutlos para los contenedores dinamicos de los ODS */
const odsTitles = {
  "1": "Objetivo 1: Poner fin a la pobreza en todas sus formas en todo el mundo",
  "2": "Objetivo 2: Poner fin al hambre, lograr la seguridad alimentaria y la mejora de la nutrición y promover la agricultura sostenible",
  "3": "Objetivo 3: Garantizar una vida sana y promover el bienestar para todos en todas las edades",
  "4": "Objetivo 4: Garantizar una educación inclusiva, equitativa y de calidad y promover oportunidades de aprendizaje durante toda la vida para todos",
  "5": "Objetivo 5: Lograr la igualdad de género y empoderar a todas las mujeres y las niñas",
  "6": "Objetivo 6: Garantizar la disponibilidad y la gestión sostenible del agua y el saneamiento para todos",
  "7": "Objetivo 7: Garantizar el acceso a una energía asequible, fiable, sostenible y moderna para todos",
  "8": "Objetivo 8: Promover el crecimiento económico sostenido, inclusivo y sostenible, el empleo pleno y productivo y el trabajo decente para todos",
  "9": "Objetivo 9: Construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación",
  "10": "Objetivo 10: Reducir la desigualdad en y entre los países",
  "11": "Objetivo 11: Lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles",
  "12": "Objetivo 12: Garantizar modalidades de consumo y producción sostenibles",
  "13": "Objetivo 13: Adoptar medidas urgentes para combatir el cambio climático y sus efectos",
  "14": "Objetivo 14: Conservar y utilizar en forma sostenible los océanos, los mares y los recursos marinos para el desarrollo sostenible",
  "15": "Objetivo 15: Proteger, restablecer y promover el uso sostenible de los ecosistemas terrestres, gestionar sosteniblemente los bosques, luchar contra la desertificación, detener e invertir la degradación de las tierras y detener la pérdida de biodiversidad",
  "16": "Objetivo 16: Promover sociedades pacíficas e inclusivas para el desarrollo sostenible, proporcionar acceso a la justicia para todos y construir instituciones eficaces, responsables e inclusivas a todos los niveles",
  "17": "Objetivo 17: Fortalecer los medios de ejecución y revitalizar la Alianza Mundial para el Desarrollo Sostenible"
};

 const odsColors = {
                  "1": "#e5233d",
                  "2": "#dda73a",
                  "3": "#4ca146",
                  "4": "#c7212f",
                  "5": "#ef402d",
                  "6": "#27bfe6",
                  "7": "#fbc412",
                  "8": "#a31c44",
                  "9": "#f26a2e",
                  "10": "#e01483",
                  "11": "#f89d2a",
                  "12": "#bf8d2c",
                  "13": "#407f46",
                  "14": "#1f97d4",
                  "15": "#59ba47",
                  "16": "#136a9f",
                  "17": "#14496b"
                };

const descripcionesODS = {
  1: "El Objetivo 1 de los ODS busca erradicar la pobreza extrema para 2030. Aunque había avances, la pandemia de COVID-19 los revirtió, sumando casi 90 millones de personas a esta condición. Para finales de 2022, se estimaba que el 8.4% de la población mundial (670 millones) seguía en pobreza extrema. Si no hay cambios, en 2030 podrían ser 575 millones, principalmente en África subsahariana. También preocupa el aumento del hambre y los precios de alimentos desde 2015.",
  2: "El Objetivo 2 busca erradicar el hambre para 2030. Desde 2015, el hambre ha aumentado por la pandemia, conflictos, cambio climático y desigualdad. En 2022, 735 millones de personas sufrían hambre crónica y 2400 millones enfrentaban inseguridad alimentaria. Además, 2000 millones no tuvieron acceso a alimentos seguros, 148 millones de niños presentaron retraso en el crecimiento y 45 millones sufrieron emaciación. Esta situación requiere atención urgente y acción global coordinada.",
  3: "El Objetivo 3 busca garantizar salud y bienestar para todos. Se han logrado avances importantes: 146 países han mejorado la mortalidad infantil, las muertes por sida bajaron 52% desde 2010, y 47 países eliminaron al menos una enfermedad tropical. Sin embargo, persisten desigualdades en el acceso a la salud. La COVID-19 frenó el progreso, redujo la vacunación infantil y aumentó las muertes por tuberculosis y malaria. Para alcanzar las metas de los ODS, se requiere mayor inversión en sistemas sanitarios y fortalecer la resiliencia ante futuras amenazas.",
  4: "El Objetivo 4 busca garantizar una educación inclusiva, equitativa y de calidad para todos. A pesar de los avances, la pandemia de COVID-19 interrumpió la educación de millones de estudiantes. En 2020, se estimó que 1.6 mil millones de estudiantes se vieron afectados por el cierre de escuelas. Además, persisten desigualdades en el acceso a la educación, especialmente para niñas y grupos vulnerables. Para 2030, se requiere un esfuerzo renovado para asegurar que todos los jóvenes y adultos tengan la oportunidad de aprender y desarrollarse plenamente.",
  5: "El Objetivo 5 busca lograr la igualdad de género y empoderar a todas las mujeres y niñas. A pesar de algunos avances, la pandemia de COVID-19 ha exacerbado las desigualdades de género. En 2020, se estimó que 1 de cada 3 mujeres había sufrido violencia física o sexual en su vida. Además, las mujeres siguen enfrentando barreras en el acceso a la educación, la salud y el empleo. Para 2030, se requiere un compromiso renovado para eliminar todas las formas de discriminación y violencia contra las mujeres y niñas.",
  6: "El Objetivo 6 busca garantizar la disponibilidad y gestión sostenible del agua y el saneamiento para todos. A pesar de los avances, el acceso al agua potable y al saneamiento sigue siendo un desafío en muchas partes del mundo. En 2020, se estimó que 2 mil millones de personas carecían de acceso a agua potable segura y 3.6 mil millones no contaban con servicios de saneamiento gestionados de manera segura. Para 2030, se requiere una acción urgente para garantizar el acceso universal a agua y saneamiento de calidad.",
  7: "El Objetivo 7 busca garantizar el acceso a energía asequible, confiable, sostenible y moderna para todos. A pesar de los avances en el acceso a la electricidad, aún hay 759 millones de personas sin este servicio. Además, la transición hacia fuentes de energía renovable es lenta. Para 2030, se requiere un aumento en la inversión en infraestructura energética y en tecnologías limpias para asegurar un acceso equitativo a la energía.",
  8: "El Objetivo 8 busca promover el crecimiento económico sostenido, inclusivo y sostenible, el empleo pleno y productivo y el trabajo decente para todos. A pesar de algunos avances, la pandemia de COVID-19 ha tenido un impacto devastador en el empleo y los ingresos. En 2020, se estima que 255 millones de empleos se perdieron, y muchos trabajadores enfrentan condiciones laborales precarias. Para 2030, se requiere un enfoque renovado en la creación de empleo y la protección de los derechos laborales.",
  9: "El Objetivo 9 busca construir infraestructuras resilientes, promover la industrialización inclusiva y sostenible y fomentar la innovación. A pesar de algunos avances, la pandemia de COVID-19 ha afectado gravemente a las industrias y las cadenas de suministro. Para 2030, se requiere un aumento en la inversión en infraestructura y en investigación y desarrollo para fomentar la innovación y la sostenibilidad.",
  10: "El Objetivo 10 busca reducir la desigualdad en y entre los países. A pesar de algunos avances, la pandemia de COVID-19 ha exacerbado las desigualdades existentes. En 2020, el 1% más rico de la población mundial poseía más del doble de la riqueza del 90% más pobre. Para 2030, se requiere un compromiso renovado para abordar las desigualdades y garantizar que todos tengan la oportunidad de prosperar.",
  11: "El Objetivo 11 busca lograr que las ciudades y los asentamientos humanos sean inclusivos, seguros, resilientes y sostenibles. A pesar de algunos avances, la pandemia de COVID-19 ha puesto de relieve las vulnerabilidades de las ciudades, incluidos el acceso a servicios básicos y la vivienda. Para 2030, se requiere un enfoque renovado en la planificación urbana y la inversión en infraestructura sostenible.",
  12: "El Objetivo 12 busca garantizar modalidades de consumo y producción sostenibles. A pesar de algunos avances, la pandemia de COVID-19 ha puesto de relieve la necesidad de repensar nuestros patrones de consumo y producción. Para 2030, se requiere un compromiso renovado para promover la sostenibilidad en todos los sectores y garantizar que los recursos naturales se gestionen de manera sostenible.",
  13: "El Objetivo 13 busca combatir el cambio climático. Este fenómeno, causado por actividades humanas, avanza más rápido de lo previsto y amenaza la vida en la Tierra. Sus efectos incluyen fenómenos extremos, aumento del nivel del mar y riesgos para el desarrollo global. Si no se actúa, podría provocar migraciones masivas e inestabilidad. Para limitar el calentamiento a 1.5 °C, las emisiones deben reducirse a la mitad para 2030. Se requieren acciones urgentes, ambiciosas y transformadoras para lograr cero emisiones netas y garantizar un futuro sostenible.",
  14: "El Objetivo 14 busca conservar y usar sosteniblemente los océanos y recursos marinos. Los océanos cubren el 75% de la superficie terrestre, contienen el 97% del agua del planeta y son esenciales para la vida. Proveen alimentos, medicinas, energía, y ayudan a reducir la contaminación y los daños por tormentas. Sin embargo, enfrentan amenazas graves como la contaminación plástica, la acidificación y el cambio climático. Para proteger este ecosistema vital, se requiere una gestión responsable, mayor inversión en ciencia oceánica y acciones urgentes para revertir el daño ambiental.",
  15: "El Objetivo 15 busca proteger los ecosistemas terrestres y detener la pérdida de biodiversidad. Estos ecosistemas son clave para la vida humana y el desarrollo económico, pero enfrentan una triple crisis: cambio climático, contaminación y degradación. Entre 2015 y 2019, se perdieron más de 100 millones de hectáreas de tierras productivas al año, afectando a 1300 millones de personas. La agricultura causa el 90% de la deforestación mundial. Para revertir esta tendencia, se requiere transformar nuestra relación con la naturaleza y aplicar el Marco Mundial Kunming-Montreal, que establece metas claras para 2030 y 2050.",
  16: "El Objetivo 16 promueve sociedades pacíficas, inclusivas y justas. Busca garantizar seguridad, acceso a la justicia y fortalecer instituciones responsables. Sin embargo, los conflictos violentos, como la guerra en Ucrania, han aumentado las muertes civiles y frenado el progreso. La violencia armada, la corrupción y la falta de Estado de derecho afectan gravemente a los más vulnerables. Para avanzar, se requiere colaboración entre gobiernos, sociedad civil y comunidades, fortaleciendo el Estado de derecho, los derechos humanos y la participación inclusiva.",
  17: "El Objetivo 17 busca fortalecer la cooperación global para el desarrollo sostenible. La Agenda 2030 requiere alianzas entre gobiernos, sector privado y sociedad civil. Sin embargo, los países de ingresos bajos y medios enfrentan altos niveles de deuda, agravados por la pandemia, inflación y tasas de interés. Aunque la asistencia oficial al desarrollo aumentó en 2022, gran parte se destinó a refugiados y ayuda a Ucrania. Es urgente movilizar más recursos y cumplir los compromisos internacionales para que nadie se quede atrás.",
};

  document.addEventListener("DOMContentLoaded", function () {
      // Activar link activo
      const currentPath = window.location.pathname.split("/").pop();
      const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) link.classList.add("active");
      })
      ;

      // Variables globales
      let data = [];
      let filteredData = {};
      let itemsPerPage = 10;
      let currentPage = 1;

      // Función para contar metas por ODS
      function contarMetasEspecificasPorODS(data) {
      const contador = {};

      data.forEach(variable => {
        const metaCompleta = variable.meta; 

        if (metaCompleta && metaCompleta.startsWith("Meta_")) {
          const meta = metaCompleta.replace("Meta_", ""); 
          const [ods] = meta.split("."); 

          if (!contador[ods]) contador[ods] = {};
          if (!contador[ods][meta]) contador[ods][meta] = 0;

          contador[ods][meta]++;
        }
      });

      return contador;
    }


      function updateVariableCounter(metaNumber, count) {
        const counterElement = document.getElementById(`contador-ods-${metaNumber}`);
        if (counterElement) counterElement.textContent = count;
      }

      function renderItems(items, container, paginationContainer, metaNumber) {
        container.innerHTML = "";
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(items.length / itemsPerPage);

        function renderPage(page) {
          container.innerHTML = "";
          const start = (page - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const pageItems = items.slice(start, end);

          updateVariableCounter(metaNumber, items.length);

          
          pageItems.forEach(item => {
            const card = document.createElement("div");
            card.classList.add("col-12", "mb-3");
            card.innerHTML = `
              <div class="card shadow-sm border-0 rounded-4">
                <div class="card-body">
                  <h5 class="card-title fw-bold text-primary mb-3">${item.varAsig}</h5>
                  <p class="card-text mb-2">
                    <span class="fw-semibold text-success">ODS:</span> ${item.ods.replace(/_/g, ' ')}
                  </p>
                  <p class="card-text mb-3">
                    <span class="fw-semibold text-secondary">Meta ODS detectada:</span> ${item.meta.replace(/_/g, ' ')}
                  </p>
                  <h6 class="text-uppercase text-muted small mb-2">Clasificación Temática</h6>
                  <ul class="list-unstyled ps-3">
                    <li class="mb-1"><i class="bi bi-check-circle text-success me-1"></i><strong>Indicador ODS:</strong> ${item.indicador.replace(/_/g, ' ')}</li>
                    <li class="mb-1"><i class="bi bi-graph-up-arrow text-warning me-1"></i><strong>Nivel de Contribución:</strong> ${item.nivContOds}</li>
                    ${renderComentarios(item.comentOds)}
                  </ul>
                </div>
              </div>`;
            container.appendChild(card);
          });
        }

        function renderPagination() {
          paginationContainer.innerHTML = "";
          const maxPagesToShow = 10;
          let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
          let endPage = startPage + maxPagesToShow - 1;

          if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
          }

          // Botón de página 1 y puntos suspensivos al inicio
          if (startPage > 1) {
            addPageButton(1);
            if (startPage > 2) addEllipsis();
          }

          // Botones de páginas visibles
          for (let i = startPage; i <= endPage; i++) {
            addPageButton(i);
          }

          // Puntos suspensivos y botón de última página
          if (endPage < totalPages) {
            if (endPage < totalPages - 1) addEllipsis();
            addPageButton(totalPages);
          }

          function addPageButton(page) {
            const li = document.createElement("li");
            li.classList.add("page-item");
            if (page === currentPage) li.classList.add("active");
            const a = document.createElement("a");
            a.classList.add("page-link");
            a.href = "#";
            a.textContent = page;
            a.addEventListener("click", e => {
              e.preventDefault();
              currentPage = page;
              renderPage(currentPage);
              renderPagination();
            });
            li.appendChild(a);
            paginationContainer.appendChild(li);
          }

          function addEllipsis() {
            const li = document.createElement("li");
            li.classList.add("page-item", "disabled");
            const span = document.createElement("span");
            span.classList.add("page-link");
            span.textContent = "...";
            li.appendChild(span);
            paginationContainer.appendChild(li);
          }
        }

        renderPage(currentPage);
        if (totalPages > 1) renderPagination();
        }
      

      // Fetch data y mostrar contadores
      fetch("/api/ods")
        .then(response => response.json())
        .then(responseData => {
          data = responseData;

          // Agrupar por número de meta
          filteredData = data.reduce((acc, item) => {
            const metaNumber = item.meta.match(/\d+/)?.[0];
            if (metaNumber) {
              if (!acc[metaNumber]) acc[metaNumber] = [];
              acc[metaNumber].push(item);
            }
            return acc;
          }, {});

          const totalPorODS = {};

        // Recorremos todos los datos y sumamos por número de ODS
        data.forEach(item => {
          const metaCompleta = item.meta;
          if (metaCompleta && metaCompleta.startsWith("Meta_")) {
            const meta = metaCompleta.replace("Meta_", "");
            const [ods] = meta.split(".");
            if (!totalPorODS[ods]) totalPorODS[ods] = 0;
            totalPorODS[ods]++;
          }
        });

        // Pintar contador externo (debajo de la imagen)
        for (const ods in totalPorODS) {
          const count = totalPorODS[ods];
          const counterElement = document.getElementById(`contador-ods-${ods}`);
          if (counterElement) counterElement.textContent = count;
        }

        // Pintar contador interno dentro de cada tarjeta dinámica
        for (const ods in totalPorODS) {
          const grupo = ods >= 1 && ods <= 6 ? "1_6" :
                        ods >= 7 && ods <= 12 ? "7_12" :
                        ods >= 13 && ods <= 17 ? "13_17" : "";

          const internoId = `contadorInterno${grupo}`;
          const internoElement = document.getElementById(internoId);

          // Solo insertar si el contador interno existe y no se ha insertado aún (para evitar sobrescribir)
          if (internoElement && !internoElement.dataset.odsSet) {
            internoElement.innerHTML = `
              <strong>Total de relaciones ODS ${ods}:</strong>
              <a class="text-primary text-decoration-underline" style="font-family: Monaco;">${totalPorODS[ods]}</a>
            `;
            internoElement.dataset.odsSet = "true"; // Flag para no sobreescribir si hay varios ODS en el grupo
          }
        }

          // Mostrar metas específicas
          const metasPorODS = contarMetasEspecificasPorODS(data);
          console.log("Metas por ODS:", metasPorODS);
          for (const ods in metasPorODS) {
            const metaObj = metasPorODS[ods];
            const container = document.getElementById(`result-Objetivo${ods}`);
            if (container) {
              container.innerHTML = "<h6 class='fw-bold text-muted mb-2'>Metas ODS detectadas:</h6><ul class='list-unstyled'>";
              for (const meta in metaObj) {
                container.innerHTML += `
                
                  <li class="mb-1">
                    <i class="bi bi-check-circle-fill text-success me-1"></i>
                    <strong>${meta}:</strong> ${metaObj[meta]} variable(s)
                  </li>`;
              }
              container.innerHTML += "</ul>";
            }

            // Crear nuevo canvas
            const canvas = document.createElement("canvas");
            canvas.id = `grafico-ods-${ods}`;
            canvas.style.maxHeight = "500px";
            canvas.style.maxWidth = "800px";
            canvas.style.width = "100%";
            canvas.style.display = "none"; // Oculto por defecto

            // Determinar el área de gráfico según el grupo
            let chartAreaId = "";
            if (ods >= 1 && ods <= 6) chartAreaId = "chartArea1_6";
            else if (ods >= 7 && ods <= 12) chartAreaId = "chartArea7_12";
            else if (ods >= 13 && ods <= 17) chartAreaId = "chartArea13_17";

            if (chartAreaId) {
              const chartArea = document.getElementById(chartAreaId);
              if (chartArea) {
                chartArea.appendChild(canvas);
              }
            }

            // Definir colores únicos por ODS (puedes ajustar)
            const colorBase = {
              "1": "rgba(255, 99, 132, 0.7)",
              "2": "rgba(255, 159, 64, 0.7)",
              "3": "rgba(255, 205, 86, 0.7)",
              "4": "rgba(75, 192, 192, 0.7)",
              "5": "rgba(54, 162, 235, 0.7)",
              "6": "rgba(153, 102, 255, 0.7)",
              "7": "rgba(201, 203, 207, 0.7)",
              "8": "rgba(100, 181, 246, 0.7)",
              "9": "rgba(255, 112, 67, 0.7)",
              "10": "rgba(124, 179, 66, 0.7)",
              "11": "rgba(0, 172, 193, 0.7)",
              "12": "rgba(255, 238, 88, 0.7)",
              "13": "rgba(67, 160, 71, 0.7)",
              "14": "rgba(41, 182, 246, 0.7)",
              "15": "rgba(139, 195, 74, 0.7)",
              "16": "rgba(121, 85, 72, 0.7)",
              "17": "rgba(156, 39, 176, 0.7)"
            };

            const color = colorBase[ods] || "rgba(229, 35, 61, 0.7)";

            // Crear gráfico
            new Chart(canvas, {
              type: "bar",
              data: {
                labels: Object.keys(metaObj).map(meta => `Meta ${meta}`),
                datasets: [{
                  label: "Variables por Meta",
                  data: Object.values(metaObj),
                  backgroundColor: color,
                  borderColor: color.replace("0.7", "1"),
                  borderWidth: 1,
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    ticks: {
                      autoSkip: false,
                      maxRotation: 45,
                      minRotation: 0
                    }
                  },
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Número de variables"
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: context => `${context.parsed.y} variable(s)`
                    }
                  }
                }
              }
            });

            // Determinar el área de metas según el grupo
            let metasResumenId = "";
            if (ods >= 1 && ods <= 6) metasResumenId = "metasResumen1_6";
            else if (ods >= 7 && ods <= 12) metasResumenId = "metasResumen7_12";
            else if (ods >= 13 && ods <= 17) metasResumenId = "metasResumen13_17";

            if (metasResumenId) {
              const metasResumen = document.getElementById(metasResumenId);
              if (metasResumen) {
                metasResumen.innerHTML = "<ul class='list-unstyled'>";
                for (const meta in metaObj) {
                  metasResumen.innerHTML += `
                    <li class="mb-1">
                      <i class="bi bi-check-circle-fill text-success me-1"></i>
                      <strong>${meta}:</strong> ${metaObj[meta]} variable(s)
                    </li>`;
                }
                metasResumen.innerHTML += "</ul>";
              }
            }
          }
        })
        
        .catch(error => console.error("Error al obtener los datos de la API:", error));

      // Eventos de clic en imágenes
      document.querySelectorAll("img[data-ods]").forEach(img => {
        img.addEventListener("click", function () {
          const ods = parseInt(img.getAttribute("data-ods"), 10);
          let descripcionDivId = "";
          if (ods >= 1 && ods <= 6) descripcionDivId = "descripcionODS1_6";
          else if (ods >= 7 && ods <= 12) descripcionDivId = "descripcionODS7_12";
          else if (ods >= 13 && ods <= 17) descripcionDivId = "descripcionODS13_17";

          if (descripcionDivId && descripcionesODS[ods]) {
            document.getElementById(descripcionDivId).innerHTML = `
              <div class="p-3 mb-3 rounded-3 shadow-sm" style="background: #f8fafc; border-left: 6px solid #0d6efd;">
                <span class="fw-semibold" style="font-size:1rem;">
                  ${descripcionesODS[ods]}
                </span>
              </div>
            `;
          }
        });
      });

      // Eventos de clic en imágenes
      document.querySelectorAll("img[data-ods]").forEach(img => {
        img.addEventListener("click", function () {
          const ods = this.getAttribute("data-ods");
          const group = this.getAttribute("data-group");
          const contenedorId = `contenedorGrupo${group}`;
          const container = document.getElementById(`OdsContainer${group}`);
          const paginationContainer = document.getElementById(`pagination${group}`);
          actualizarContadorInterno(ods, "1_6");
          actualizarContadorInterno(ods, "7_12");
          actualizarContadorInterno(ods, "13_17");

          document.querySelectorAll('[id^="contenedorGrupo"]').forEach(div => div.classList.add('d-none'));

          const contenedor = document.getElementById(contenedorId);
          const grafico = document.getElementById(`grafico-ods-${ods}`);

          if (contenedor.dataset.meta === ods) {
            container.innerHTML = "";
            paginationContainer.innerHTML = "";
            contenedor.classList.add("d-none");
            delete contenedor.dataset.meta;
            // Oculta el gráfico también
            if (grafico) grafico.style.display = "none";
            return;
          }

          if (contenedor) {
            contenedor.classList.remove("d-none");
            contenedor.dataset.meta = ods;
            if (filteredData[ods]) {
              renderItems(filteredData[ods], container, paginationContainer, ods);
              contenedor.scrollIntoView({ behavior: "smooth" });
            } else {
              container.innerHTML = "<p class='text-center'>No hay datos disponibles para este objetivo.</p>";
              paginationContainer.innerHTML = "";
            }
          }
          // Oculta todos los gráficos
          document.querySelectorAll("canvas[id^='grafico-ods-']").forEach(c => c.style.display = "none");
          // Muestra solo el gráfico correspondiente en el área de cards
          if (grafico) grafico.style.display = "block";

          // Determina el id del título según el grupo
          let titleId = "";
          if (group === "1_6") titleId = "odsDynamicTitle1_6";
          else if (group === "7_12") titleId = "odsDynamicTitle7_12";
          else if (group === "13_17") titleId = "odsDynamicTitle13_17";

          const titleElement = document.getElementById(titleId);
          if (titleElement) {
            titleElement.textContent = odsTitles[ods] || "";
            if (titleElement) {
            titleElement.textContent = odsTitles[ods] || "";
            
            // Aplicar color dinámico de fondo según ODS
            const bgColor = odsColors[ods] || "#333";
            titleElement.style.backgroundColor = bgColor;
            titleElement.style.color = "#fff";
            titleElement.style.padding = "12px";
            titleElement.style.borderRadius = "8px";
            titleElement.style.fontWeight = "bold";
            titleElement.style.boxShadow = `0 0 10px ${bgColor}55`;
          }
          }

          // Actualiza el resumen de metas SOLO para el ODS seleccionado
          let metasResumenId = "";
          if (group === "1_6") metasResumenId = "metasResumen1_6";
          else if (group === "7_12") metasResumenId = "metasResumen7_12";
          else if (group === "13_17") metasResumenId = "metasResumen13_17";

          const metasPorODS = contarMetasEspecificasPorODS(data);
          const metaObj = metasPorODS[ods] || {};

          if (metasResumenId) {
            const metasResumen = document.getElementById(metasResumenId);
            if (metasResumen) {
              metasResumen.innerHTML = "<ul class='list-unstyled'>";
              for (const meta in metaObj) {
                const color = odsColors[ods] || "#0d6efd"; // Fallback al azul Bootstrap
                metasResumen.innerHTML += `
                  <li class="mb-1 meta-item btn badge text-white" 
                      data-meta="${meta}" data-ods="${ods}"
                      style="
                        background-color: ${color}; 
                        font-size: 0.85rem;           /* ⬅️ antes 0.95rem */
                        margin: 3px; 
                        padding: 6px 10px;           /* ⬅️ antes 8px 12px */
                        border-radius: 20px;">
                    <i class="bi bi-check-circle-fill text-white me-1"></i>
                    <strong>${meta}:</strong> 
                    <span class="hover-effect" style="color: black;">${metaObj[meta]} Relaciones</span>
                  </li>`;
              }
              metasResumen.innerHTML += "</ul>";
            }
            document.addEventListener("click", function (e) {
              const metaItem = e.target.closest(".meta-item");
              if (metaItem) {
                const meta = metaItem.getAttribute("data-meta");
                const ods = metaItem.getAttribute("data-ods");
                const group = ods >= 1 && ods <= 6 ? "1_6" :
                              ods >= 7 && ods <= 12 ? "7_12" : 
                              ods >= 13 && ods <= 17 ? "13_17" : "";

                const contenedor = document.getElementById(`contenedorGrupo${group}`);
                const container = document.getElementById(`OdsContainer${group}`);
                const paginationContainer = document.getElementById(`pagination${group}`);

                // Oculta todos los contenedores de grupo
                document.querySelectorAll('[id^="contenedorGrupo"]').forEach(div => div.classList.add('d-none'));
                contenedor.classList.remove('d-none');

                // Mostrar el contenedor de cards de variables y la paginación
                if (container) container.classList.remove('d-none');
                if (paginationContainer) paginationContainer.classList.remove('d-none');

                // Filtrar por meta exacta
                const metaFiltrada = data.filter(item => item.meta === `Meta_${meta}`);

                // Renderizar solo las variables de esa meta
                renderItems(metaFiltrada, container, paginationContainer, meta);
                contenedor.scrollIntoView({ behavior: "smooth" });
     

                // Opcional: actualizar el título también
                const titleId = group === "1_6" ? "odsDynamicTitle1_6" :
                                group === "7_12" ? "odsDynamicTitle7_12" :
                                "odsDynamicTitle13_17";

                const titleElement = document.getElementById(titleId);
                if (titleElement) titleElement.textContent = `Meta ${meta} - ${odsTitles[ods]}`;

                  // Actualizar contador interno también
                  const internoId = group === "1_6" ? "contadorInterno1_6" :
                                    group === "7_12" ? "contadorInterno7_12" :
                                    "contadorInterno13_17";

                  const internoElement = document.getElementById(internoId);
                  if (internoElement) {
                    internoElement.innerHTML = `
                      <strong>Total de relaciones ODS ${ods}:</strong>
                      <a class="text-primary text-decoration-underline" style="font-family: Monaco;">${totalPorODS[ods] || 0}</a>
                    `;
                  }

              }
            });

          }
        });
      });

      const itemsPerPageSelect = document.getElementById("itemsPerPage");
      if (!itemsPerPageSelect) {
        // Opcional: log para depurar cuándo no existe
        // console.warn('#itemsPerPage no está presente en el DOM en este momento');
        return; // Evita el TypeError
      }


      // Cambio de cantidad por página
     itemsPerPageSelect.addEventListener("change", function () {
     itemsPerPage = parseInt(this.value, 10);
     currentPage = 1;

     const visibleContainer = [...document.querySelectorAll('[id^="contenedorGrupo"]')]
       .find(div => !div.classList.contains("d-none"));

     if (!visibleContainer) return;

     const group = visibleContainer.id.replace("contenedorGrupo", "");
     const container = document.getElementById(`OdsContainer${group}`);
     const paginationContainer = document.getElementById(`pagination${group}`);
     const targetMeta = visibleContainer.dataset.meta;

    if (targetMeta && filteredData[targetMeta]) {
    renderItems(filteredData[targetMeta], container, paginationContainer, targetMeta);
      }
    });

    function actualizarContadorInterno(odsSeleccionado, group) {
      const internoId = `contadorInterno${group}`;
      const contadorElemento = document.getElementById(internoId);

      // Obtener valor actual del contador ya cargado
      const contadorSpan = document.getElementById(`contador-ods-${odsSeleccionado}`);
      const totalRelaciones = contadorSpan ? contadorSpan.textContent.trim() : "0";

      // Color ODS (igual al título)
      const color = odsColors[odsSeleccionado] || "#0d6efd";

      if (contadorElemento) {
        contadorElemento.innerHTML = `
      <div class="d-flex justify-content-center">
        <button type="button"
          class="btn btn-sm mostrar-todas-ods my-1 px-2"
          data-ods="${odsSeleccionado}"
          style="
            background-color: ${color};
            color: #fff;
            font-size: 0.92rem;
            padding: 4px 14px;
            border-radius: 12px;
            border: none;
            box-shadow: 0 1px 4px 0 #0001;
            white-space: normal;
            font-weight: 500;
            transition: background 0.2s;
            width: auto;
            min-width: unset;
            max-width: 100%;
            display: inline-block;
          ">
          <strong>Total de relaciones ODS ${odsSeleccionado}:</strong>
          <span style="font-family: Monaco;">${totalRelaciones}</span>
        </button>
      </div>
    `;
      }
    }

    });

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
    <li class="mb-1"><i class="bi bi-chat-left-text text-info me-1"></i><strong>Comentario:</strong> ${comentario} </li>
  `;
}

// Oculta todos los contenedores de cards de variables al inicio
document.querySelectorAll('[id^="OdsContainer"]').forEach(div => div.classList.add('d-none'));
document.querySelectorAll('[id^="pagination"]').forEach(div => div.classList.add('d-none'));

})();

