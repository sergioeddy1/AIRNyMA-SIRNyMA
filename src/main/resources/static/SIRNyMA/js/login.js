// login.js
(function () {
  const form = document.getElementById('loginForm');
  const errorBox = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  // Base del backend: ajustada a tu IP/puerto
  const API_BASE = 'http://10.109.1.63:8080';
  const USUARIOS_ENDPOINT = `${API_BASE.replace(/\/$/, '')}/api/usuarios`;

  function mostrarError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    errorBox.classList.add('visible');
  }

  function limpiarError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
    errorBox.classList.remove('visible');
  }

  function esHashBcrypt(valor) {
    return typeof valor === 'string' && valor.startsWith('$2');
  }

  // Valida que el correo sea del dominio @inegi.org.mx
  function esCorreoInegi(correo) {
    return typeof correo === 'string' && /^[A-Za-z0-9._%+-]+@inegi\.org\.mx$/i.test(correo);
  }

  async function autenticarUsuario(nombreIngresado, passwordPlano) {
    // Intentamos filtrar en backend primero (si tu controlador soporta ?username=)
    try {
      let resp = await fetch(`${USUARIOS_ENDPOINT}?username=${encodeURIComponent(nombreIngresado)}`);
      if (!resp.ok) {
        // si el backend no soporta filtro por query param, fallback a obtener todo
        resp = await fetch(USUARIOS_ENDPOINT);
        if (!resp.ok) throw new Error('No se pudo consultar el servicio de usuarios.');
      }

      const data = await resp.json();

      // data puede ser un objeto (usuario) o un array
      let usuario = null;
      if (Array.isArray(data)) {
        usuario = data.find(u =>
          (u.username && u.username.toLowerCase() === nombreIngresado.toLowerCase()) ||
          (u.usuario && u.usuario.toLowerCase() === nombreIngresado.toLowerCase()) ||
          (u.nombre && u.nombre.toLowerCase() === nombreIngresado.toLowerCase()) ||
          (u.email && u.email.toLowerCase() === nombreIngresado.toLowerCase())
        );
      } else if (data) {
        // backend devolvió un único usuario (posible cuando se usa filtro en server)
        usuario = data;
      }

      if (!usuario) {
        return { ok: false, reason: 'Usuario no encontrado.' };
      }

      // Normaliza posibles nombres de campo de contraseña
      const almacenado = usuario.password || usuario.passHash || usuario.contrasena || usuario.clave || usuario.passwordHash;

      if (!almacenado) {
        return { ok: false, reason: 'El usuario no tiene contraseña registrada.' };
      }

      // Si parece un hash bcrypt, compara con bcrypt (la página debe cargar bcryptjs)
      if (esHashBcrypt(almacenado)) {
        const coincide = await bcrypt.compare(passwordPlano, almacenado);
        if (!coincide) return { ok: false, reason: 'Contraseña incorrecta.' };
        return { ok: true, usuario };
      }

      // Si no es hash, comparar texto plano (parche temporal)
      if (passwordPlano === almacenado) {
        return { ok: true, usuario };
      }

      return { ok: false, reason: 'Contraseña incorrecta.' };
    } catch (err) {
      console.error('[login] error al consultar usuarios:', err);
      throw new Error('No se pudo consultar el servicio de usuarios.');
    }
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    limpiarError();

    const user = document.getElementById('userInput').value.trim();
    const pass = document.getElementById('passwordInput').value.trim();
    const rememberCheckbox = document.getElementById('remember');

    if (!user || !pass) {
      mostrarError('Por favor completa usuario y contraseña.');
      return;
    }

    // Validar que el usuario sea un correo con dominio @inegi.org.mx
    if (!esCorreoInegi(user)) {
      mostrarError('Por favor ingresa un correo con dominio @inegi.org.mx.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Validando...';

    try {
      const resultado = await autenticarUsuario(user, pass);

      if (!resultado.ok) {
        mostrarError(resultado.reason || 'Usuario o contraseña inválidos.');
        btn.disabled = false;
        btn.textContent = 'Iniciar sesión';
        return;
      }

      const usuario = resultado.usuario;

      const payloadSesion = {
        id: usuario.id,
        nombre: usuario.username || usuario.usuario || usuario.nombre,
        loginAt: new Date().toISOString()
      };

      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('sirnmaUser', JSON.stringify(payloadSesion));
      } else {
        sessionStorage.setItem('sirnmaUser', JSON.stringify(payloadSesion));
      }

      btn.textContent = 'Ingresando...';

      // Redirigir a la ruta de tu index dentro de la estructura del proyecto
      window.location.href = '/SIRNyMA/pages/index.html';

    } catch (err) {
      console.error('[login] Error autenticando:', err);
      mostrarError('Ocurrió un error al intentar iniciar sesión. Intenta de nuevo más tarde.');
      btn.disabled = false;
      btn.textContent = 'Iniciar sesión';
    }
  });
})();
