// Verificar sesión antes de inicializar el comportamiento de la página
(function () {
  const sesionStr = localStorage.getItem('sirnmaUser') || sessionStorage.getItem('sirnmaUser');

  if (!sesionStr) {
    // No hay sesión → mandar a login (ruta relativa desde docs/)
    window.location.href = './login.html';
    return;
  }

  const sesion = JSON.parse(sesionStr);
  console.log('Usuario autenticado:', sesion.nombre || sesion.username || sesion.id);
})();

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('myCarousel');
  if (!carousel) return;

  const videos = carousel.querySelectorAll('video.bg-media');

  videos.forEach((vid) => {
    // Asegura flags para autoplay en todos los navegadores
    vid.muted = true;
    vid.playsInline = true;
    vid.autoplay = true;
    vid.loop = true;
    vid.preload = 'auto';

    // Arranca reproducción en segundo plano y NO la pauses después.
    // Así, cuando entras al slide, el video ya va corriendo.
    const tryPlay = () => {
      const p = vid.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => { /* algunos navegadores bloquean si aún no es visible; no pasa nada */ });
      }
    };

    // Si ya tiene datos, intenta jugar; si no, cuando cargue metadatos
    if (vid.readyState >= 2) { // HAVE_CURRENT_DATA
      tryPlay();
    } else {
      vid.addEventListener('loadeddata', tryPlay, { once: true });
      vid.addEventListener('canplay', tryPlay, { once: true });
      vid.addEventListener('canplaythrough', tryPlay, { once: true });
    }
  });

  // Importante: NO reseteamos currentTime ni pausamos al cambiar de slide.
  // Bootstrap no pausa videos automáticamente; simplemente cambia clases.
  // Si tenías handlers de slide/slid que tocaban los videos, elimínalos.
});

// Logout handler: botón en las páginas que dependen de esta sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('sirnmaUser');
    sessionStorage.removeItem('sirnmaUser');
    // Redirigir al login (ruta relativa desde docs/)
    window.location.href = './login.html';
  });
}