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
                        const procesos = await fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/proceso").then(res => res.json());
                        const variables = await fetch("https://jones-investors-participant-behaviour.trycloudflare.com/api/variables").then(res => res.json());

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

                        // Función para aplicar filtros combinados
                        function aplicarFiltros() {
                        let filtrados = [...procesosGlobal];

                        const estatus = document.getElementById("filtrarEstatus").value;
                        const periodicidad = selectPerio.value;
                        const soloIIN = iinCheckbox.checked;

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

                       
                        renderProcesos(filtrados, conteoGlobal);
                        }

                        // Eventos para aplicar filtros combinados
                        document.getElementById("filtrarEstatus").addEventListener("change", aplicarFiltros);
                        selectPerio.addEventListener("change", aplicarFiltros);
                        iinCheckbox.addEventListener("change", aplicarFiltros);

                        // Botón reset filtros
                        document.getElementById("resetFiltrosBtn").addEventListener("click", () => {
                        document.getElementById("ordenarProcesos").selectedIndex = 0;
                        document.getElementById("filtrarEstatus").selectedIndex = 0;
                        selectPerio.selectedIndex = 0;
                        iinCheckbox.checked = false;
                        renderProcesos(procesosGlobal, conteoGlobal);
                        });



                        // Siempre muestra todos los procesos al inicio
                        renderProcesos(procesosGlobal, conteoGlobal);

                    } catch (err) {
                        console.error("Error cargando datos", err);
                        container.innerHTML = "<p class='text-danger'>Error al cargar los procesos.</p>";
                    }
                });
            }

            function renderProcesos(procesos, conteo) {
                // Actualiza el contador dinámicamente
                const counter = document.getElementById("procesosCounter");
                if (counter) counter.textContent = procesos.length;

                container.innerHTML = "";
                procesos.forEach(proceso => {
                    
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
                                        <img src="/assets/iconsociodemografica.png" class="img-fluid proceso-icon rounded-start" alt="Icono" style="max-height: 80px;">
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
                                                ${proceso.perioProd || "No disponible"}
                                            </p>
                                            <p class="card-text mb-1" style="font-size: 0.85rem">
                                                <strong style="font-size: 0.85rem">Vigencia:</strong>
                                                ${mostrarVigencia(proceso.vigInicial, proceso.vigFinal)}
                                            </p>
                                            <p class="card-text mb-0">  
                                                <strong>Total Variables:</strong>
                                                 <span style="color: #08739c; text-decoration: underline; cursor: pointer; font-weight: bold;"
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

            // Filtro de orden
            document.getElementById("ordenarProcesos").addEventListener("change", function () {
                const orden = this.value;
                if (!orden || procesosGlobal.length === 0) {
                    renderProcesos(procesosGlobal, conteoGlobal);
                    return;
                }

                let sorted = [];

                if (orden === "az" || orden === "za") {
                    sorted = [...procesosGlobal].sort((a, b) => {
                        const nombreA = (a.pp || "").toLowerCase();
                        const nombreB = (b.pp || "").toLowerCase();
                        return orden === "az"
                            ? nombreA.localeCompare(nombreB)
                            : nombreB.localeCompare(nombreA);
                    });
                } else if (orden === "mayor-menor" || orden === "menor-mayor") {
                    sorted = [...procesosGlobal].sort((a, b) => {
                        const countA = conteoGlobal[a.idPp] || 0;
                        const countB = conteoGlobal[b.idPp] || 0;
                        return orden === "mayor-menor" ? countB - countA : countA - countB;
                    });
                }

                renderProcesos(sorted, conteoGlobal);
            });

            // Filtro de estatus
            document.getElementById("filtrarEstatus").addEventListener("change", function () {
                const estatusSeleccionado = this.value;

                if (!estatusSeleccionado) {
                    renderProcesos(procesosGlobal, conteoGlobal);
                    return;
                }

                let filtrados = [];

                renderProcesos(filtrados, conteoGlobal);
            });

            // Inicializar tooltips de Bootstrap
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function (tooltipTriggerEl) {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Botón de limpiar filtros
            document.getElementById("resetFiltrosBtn").addEventListener("click", function () {
                document.getElementById("ordenarProcesos").selectedIndex = 0;
                document.getElementById("filtrarEstatus").selectedIndex = 0;
                renderProcesos(procesosGlobal, conteoGlobal);
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

       
