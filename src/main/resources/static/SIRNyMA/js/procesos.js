// Esta función debe estar FUERA del DOMContentLoaded para que sea accesible desde el HTML generado
     function handleVariableClick(idPp) {
         window.open(`variables.html?idPp=${idPp}`, '_blank');
     }
     document.addEventListener("DOMContentLoaded", async function () {
         const currentPath = window.location.pathname.split("/").pop();
         const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
         navLinks.forEach(link => {
             const href = link.getAttribute("href");
             if (href === currentPath) {
                 link.classList.add("active");
             }
         });
         const btnMostrar = document.getElementById("btnDireccionSociodemograficas");
         const seccionProcesos = document.getElementById("procesosSection");
         const container = document.getElementById("procesosContainer");
         let procesosGlobal = [];
         let conteoGlobal = [];
         if (btnMostrar && seccionProcesos) {
             btnMostrar.addEventListener("click", async function () {
                 seccionProcesos.hidden = false;
                 seccionProcesos.scrollIntoView({ behavior: 'smooth' });
                 try {
                     const procesos = await fetch("/api/proceso").then(res => res.json());
                     const variables = await fetch("/api/variables").then(res => res.json());
                     procesosGlobal = procesos;
                     conteoGlobal = {};
                     procesos.forEach(proceso => {
                         const relacionadas = variables.filter(v => v.idPp === proceso.idPp);
                         conteoGlobal[proceso.idPp] = relacionadas.length;
                     });
                    // Asignar elementos
                     const iinCheckbox = document.getElementById("iinCheck");
                     const selectPerio = document.getElementById("filtrarPeriodicidad");
                     // Llenar select de periodicidad con valores únicos desde procesosGlobal
                     selectPerio.innerHTML = `<option value="">Filtrar por periodicidad...</option>`; // Limpiar y agregar default
                     const periodicidadesUnicas = [...new Set(procesosGlobal.map(p => p.perPubResul).filter(Boolean))];
                     periodicidadesUnicas.sort();
                     periodicidadesUnicas.forEach(periodo => {
                     const option = document.createElement("option");
                     option.value = periodo;
                     option.textContent = periodo;
                     selectPerio.appendChild(option);
                     });
                     // Centraliza los filtros y el orden
                     function aplicarFiltrosYOrden() {
                         let filtrados = [...procesosGlobal];
                         // Filtros
                         const estatus = document.getElementById("filtrarEstatus").value;
                         const periodicidad = document.getElementById("filtrarPeriodicidad").value;
                         const soloIIN = document.getElementById("iinCheck").checked;
                         const orden = document.getElementById("ordenarProcesos").value;
                         if (estatus) {
                             filtrados = filtrados.filter(p =>
                                 (p.estatus || "").toLowerCase() === estatus.toLowerCase()
                             );
                         }
                         if (periodicidad) {
                             filtrados = filtrados.filter(p => (p.perPubResul || "") === periodicidad);
                         }
                         if (soloIIN) {
                             filtrados = filtrados.filter(p =>
                                 (p.gradoMadur || "").toLowerCase() === "información de interés nacional"
                             );
                         }
                         // Orden SOLO sobre los filtrados
                         if (orden === "az" || orden === "za") {
                             filtrados.sort((a, b) => {
                                 const nombreA = (a.pp || "").toLowerCase();
                                 const nombreB = (b.pp || "").toLowerCase();
                                 return orden === "az"
                                     ? nombreA.localeCompare(nombreB)
                                     : nombreB.localeCompare(nombreA);
                             });
                         } else if (orden === "mayor-menor" || orden === "menor-mayor") {
                             filtrados.sort((a, b) => {
                                 const countA = conteoGlobal[a.idPp] || 0;
                                 const countB = conteoGlobal[b.idPp] || 0;
                                 return orden === "mayor-menor" ? countB - countA : countA - countB;
                             });
                         }
                         renderProcesos(filtrados, conteoGlobal);
                     }
                     // Modifica renderProcesos para mostrar mensaje si no hay resultados
                     function renderProcesos(procesos, conteo) {
                         const counter = document.getElementById("procesosCounter");
                         if (counter) counter.textContent = procesos.length;
                         container.innerHTML = "";
                         if (!procesos.length) {
                             container.innerHTML = `<div class="alert alert-warning text-center">No se encontraron procesos con estas caracteristicas</div>`;
                             return;
                         }
                         procesos.forEach(proceso => {
    // Detecta extensión según idPp (puedes personalizar si tienes un mapeo de extensiones)
    let extension = "png";
    const extensionesGif = ["ENADID", "ENIGH", "CAAS", "ENCEVI", "MSM", "ESMNG"]; // agrega aquí los idPp que son gif
    let iconoHTML = ""; // Inicializa iconoHTML

if (proceso.idPp === "CPV") {
  if (extensionesGif.includes(proceso.idPp)) extension = "gif";
  const iconoRuta = `/assets/${proceso.idPp}.${extension}`;
  const iconoFallback = `/assets/no_disponible.png`;
  iconoHTML = `
    <img src="${iconoRuta}" 
         class="img-fluid proceso-icon rounded-start" 
         alt="Icono ${proceso.idPp}" 
         style="max-height: 80px; object-fit: contain; filter: invert(1);"
         onerror="this.onerror=null;this.src='${iconoFallback}';">
  `;
} else {
  if (extensionesGif.includes(proceso.idPp)) extension = "gif";
  const iconoRuta = `/assets/${proceso.idPp}.${extension}`;
  const iconoFallback = `/assets/no_disponible.png`;
  iconoHTML = `
    <img src="${iconoRuta}" 
         class="img-fluid proceso-icon rounded-start" 
         alt="Icono ${proceso.idPp}" 
         style="max-height: 80px; object-fit: contain;"
         onerror="this.onerror=null;this.src='${iconoFallback}';">
  `;
}

    const card = `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm rounded-3 p-2 position-relative">
                ${proceso.gradoMadur === "Información de Interés Nacional" ? `
                    <span class="badge bg-secondary position-absolute top-0 start-0 m-2 "
                          style="z-index:2; cursor: help;"
                          data-bs-toggle="tooltip"
                          data-bs-placement="right"
                          title="Información de Interés Nacional">
                    IIN
                    </span>
                ` : ""}
                <div class="row g-0 d-flex align-items-center">
                    <div class="col-4 d-flex justify-content-center">
                        ${iconoHTML}
                    </div>
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
                        }

                        function getStatusClass(status) {
                            switch ((status || "").toLowerCase()) {
                                case "activo": return "bg-success";
                                case "inactivo": return "bg-danger";
                                case "pendiente": return "bg-warning text-dark";
                                default: return "bg-secondary";
                            }
                        }

                        // Eventos para aplicar filtros y orden
                        document.getElementById("filtrarEstatus").addEventListener("change", aplicarFiltrosYOrden);
                        document.getElementById("filtrarPeriodicidad").addEventListener("change", aplicarFiltrosYOrden);
                        document.getElementById("iinCheck").addEventListener("change", aplicarFiltrosYOrden);
                        document.getElementById("ordenarProcesos").addEventListener("change", aplicarFiltrosYOrden);

                        // Botón reset filtros
                        document.getElementById("resetFiltrosBtn").addEventListener("click", () => {
                            document.getElementById("ordenarProcesos").selectedIndex = 0;
                            document.getElementById("filtrarEstatus").selectedIndex = 0;
                            document.getElementById("filtrarPeriodicidad").selectedIndex = 0;
                            document.getElementById("iinCheck").checked = false;
                            aplicarFiltrosYOrden();
                        });

                        // Siempre muestra todos los procesos al inicio
                        aplicarFiltrosYOrden();

                    } catch (err) {
                        console.error("Error cargando datos", err);
                        container.innerHTML = "<p class='text-danger'>Error al cargar los procesos.</p>";
                    }
                });
            }

            // Inicializar tooltips de Bootstrap
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function (tooltipTriggerEl) {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Cards de unidad administrativa
            const cards = document.querySelectorAll('.mostrarGrupoBtn');
            cards.forEach(card => {
                card.addEventListener('click', function () {
                    if (this.id !== "btnDireccionSociodemograficas") {
                        alert("Información no disponible");
                    }
                });
            });
        });

        function mostrarVigencia(vigInicial, vigFinal) {
            if (!vigInicial && !vigFinal) return "No disponible";
            if (vigInicial === vigFinal) return vigInicial || "No disponible";
            return `${vigInicial || "No disponible"} - ${vigFinal || "No disponible"}`;
        }


