    // Pequeña lógica de validación/UX para probar localmente.
    (function () {
      const form = document.getElementById('loginForm');
      const errorBox = document.getElementById('loginError');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        errorBox.hidden = true;
        const user = document.getElementById('userInput').value.trim();
        const pass = document.getElementById('passwordInput').value.trim();

        if (!user || !pass) {
          errorBox.textContent = 'Por favor completa usuario y contraseña.';
          errorBox.hidden = false;
          errorBox.classList.add('visible');
          return;
        }

        // Log para depuración
        console.log('[login] usuario:', user);
        console.log('[login] remember:', document.getElementById('remember').checked);

        // Si quieres enviar el formulario al backend descomenta la línea siguiente:
        // form.submit();

        // O realizar fetch si prefieres AJAX (ejemplo):
        // fetch(form.action, { method: 'POST', body: new FormData(form) }).then(...)

        // Feedback visual mientras se realiza la validación remota
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = 'Ingresando...';

        const API_URL = 'http://10.109.1.63:8080/api/usuarios';

        // Llamada GET para obtener usuarios y validar localmente.
        // Nota: si el backend ofrece un endpoint de autenticación (POST), preferir ese.
        fetch(API_URL, { method: 'GET' })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error('Respuesta del servidor: ' + res.status);
            }
            return res.json();
          })
          .then((users) => {
            // users puede ser un arreglo o un objeto. Normalizamos a arreglo.
            const list = Array.isArray(users) ? users : (users && users.items) ? users.items : [];

            // Campos posibles para usuario/clave en la API
            const usernameFields = ['username', 'user', 'usuario', 'email', 'correo'];
            const passwordFields = ['password', 'pass', 'contrasena', 'clave'];

            function getField(obj, candidates) {
              for (const f of candidates) {
                if (Object.prototype.hasOwnProperty.call(obj, f)) return obj[f];
              }
              return undefined;
            }

            const matched = list.find(u => {
              const remoteUser = (getField(u, usernameFields) || '').toString();
              return remoteUser.toLowerCase() === user.toLowerCase();
            });

            if (!matched) {
              throw new Error('Usuario no encontrado.');
            }

            const remotePass = getField(matched, passwordFields);
            // Comparación directa: si el backend tiene hash, esto fallará.
            if (remotePass === undefined) {
              throw new Error('El usuario existe pero no se puede validar contraseña desde este endpoint. Use un endpoint de autenticación.');
            }

            if (remotePass.toString() !== pass) {
              throw new Error('Contraseña incorrecta.');
            }

            // Login correcto: redirigir a página principal
            window.location.href = '/SIRNyMA/pages/index.html';
          })
          .catch((err) => {
            console.error('[login] error de autenticación:', err);
            errorBox.textContent = 'Error al iniciar sesión: ' + (err.message || 'Problema de conexión. Asegure CORS en el servidor.');
            errorBox.hidden = false;
            errorBox.classList.add('visible');
          })
          .finally(() => {
            btn.disabled = false;
            btn.textContent = 'Iniciar sesión';
          });
      });
    })();