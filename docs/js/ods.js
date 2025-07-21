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

  document.addEventListener("DOMContentLoaded", function () {
      // Activar link activo
      const currentPath = window.location.pathname.split("/").pop();
      const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
      navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPath) link.classList.add("active");
      });

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
                    <li class="mb-1"><i class="bi bi-graph-up-arrow text-warning me-1"></i><strong>Nivel de Contribución:</strong> ${item.nivContOdss}</li>
                    <li class="mb-1"><i class="bi bi-chat-left-text text-info me-1"></i><strong>Comentario:</strong> ${item.comentOds}</li>
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
      fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/ods")
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

          // Mostrar contador total por meta
          for (const meta in filteredData) {
            const count = filteredData[meta].length;
            const counterElement = document.getElementById(`contador-ods-${meta}`);
            if (counterElement) counterElement.textContent = count;
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
                metasResumen.innerHTML = "<h6 class='fw-bold text-muted mb-2'>Metas ODS detectadas:</h6><ul class='list-unstyled'>";
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
          const ods = this.getAttribute("data-ods");
          const group = this.getAttribute("data-group");
          const contenedorId = `contenedorGrupo${group}`;
          const container = document.getElementById(`OdsContainer${group}`);
          const paginationContainer = document.getElementById(`pagination${group}`);

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
              metasResumen.innerHTML = "<h6 class='fw-bold text-muted mb-2'>Metas ODS detectadas:</h6><ul class='list-unstyled'>";
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
        });
      });

      // Cambio de cantidad por página
      document.getElementById("itemsPerPage").addEventListener("change", function () {
        itemsPerPage = parseInt(this.value, 10);
        currentPage = 1;
        const visibleContainer = [...document.querySelectorAll('[id^="contenedorGrupo"]')]
          .find(div => !div.classList.contains("d-none"));

        if (visibleContainer) {
          const group = visibleContainer.id.replace("contenedorGrupo", "");
          const container = document.getElementById(`OdsContainer${group}`);
          const paginationContainer = document.getElementById(`pagination${group}`);
          const targetMeta = visibleContainer.dataset.meta;

          if (targetMeta && filteredData[targetMeta]) {
            renderItems(filteredData[targetMeta], container, paginationContainer, targetMeta);
          }
        }
      });

    });
