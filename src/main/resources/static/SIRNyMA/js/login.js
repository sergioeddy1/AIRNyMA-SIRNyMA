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

        // Feedback visual temporal
        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = 'Ingresando...';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = 'Iniciar sesión';
          // aquí simularíamos redirección tras login correcto:
          // window.location.href = '/';
          errorBox.textContent = 'Funcionalidad de demo: no se realizó autenticación real.';
          errorBox.hidden = false;
        }, 900);
      });
    })();