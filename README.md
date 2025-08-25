# AIRNyMA - SIRNyMA

Este proyecto es un portal web para la consulta, filtrado y visualización de variables, procesos, indicadores y objetivos relacionados con información ambiental y estadística, desarrollado para el inventario SIIERNMA del INEGI.

## Características principales

- **Visualización de procesos de producción**: Consulta y filtra procesos estadísticos y geográficos.
- **Listado y filtrado de variables**: Búsqueda avanzada, filtros por proceso, temática, periodo de tiempo, alineación con MDEA/ODS, relación con tabulados y microdatos.
- **Indicadores ambientales**: Consulta de indicadores con detalles y visualización gráfica.
- **ODS**: Relación de variables y procesos con los Objetivos de Desarrollo Sostenible.
- **Interfaz moderna**: Uso de Bootstrap, componentes interactivos, tooltips y modales.
- **Paginación y ordenamiento**: Navegación eficiente por grandes volúmenes de datos.
- **Loader de carga**: Pantalla de carga para mejorar la experiencia de usuario.
- **Soporte para chips de selección múltiple**: Visualización de procesos seleccionados como badges/chips.

## Estructura del proyecto

```
src/
└── main/
    └── resources/
        └── static/
            └── SIRNyMA/
                ├── js/
                │   ├── variables.js
                │   ├── procesos.js
                │   ├── indicadores.js
                │   └── index.js
                └── pages/
                    ├── index.html
                    ├── variables.html
                    ├── procesos.html
                    ├── indicadores.html
                    └── ...
```

## Instalación y ejecución

1. **Clona el repositorio**  
   ```bash
   git clone <url-del-repositorio>
   ```

2. **Coloca los archivos de datos y API**  
   Asegúrate de que los endpoints `/api/proceso`, `/api/variables`, `/api/clasificaciones`, `/api/eventos`, etc. estén disponibles y devuelvan los datos requeridos en formato JSON.

3. **Coloca el favicon**  
   Pon tu archivo `favicon.ico` o `favicon.png` en la carpeta `/assets/` y agrega la referencia en el `<head>` de tus páginas HTML:
   ```html
   <link rel="icon" type="image/png" href="/assets/favicon.png">
   ```

4. **Abre el archivo `index.html`**  
   Puedes abrirlo directamente en tu navegador o servirlo desde un servidor web local.

## Dependencias

- [Bootstrap 5](https://getbootstrap.com/)
- [Chart.js](https://www.chartjs.org/) (para gráficos en indicadores)
- [Bootstrap Icons](https://icons.getbootstrap.com/) (opcional, para iconos)

## Personalización

- **Filtros y chips**: Puedes modificar los filtros en `variables.js` y los chips de selección múltiple en el HTML y JS.
- **Carga de datos**: Los datos se obtienen vía fetch desde endpoints `/api/...`. Puedes adaptar estos endpoints a tu backend.
- **Loader**: El loader se muestra al inicio durante al menos 1 segundo. Puedes personalizar su estilo en el HTML y CSS.

## Notas

- El proyecto está preparado para manejar grandes volúmenes de datos y múltiples filtros combinados.
- Si necesitas agregar nuevos filtros, solo extiende la función `applyFilters` en `variables.js`.
- El código está modularizado para facilitar su mantenimiento y extensión.

## Licencia

Este proyecto es propiedad de INEGI. Uso interno y académico.

---

**Desarrollado por el equipo AIRNyMA -
