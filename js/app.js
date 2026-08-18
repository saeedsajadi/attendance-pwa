(function() {
  let deferredPrompt = null;

  function init() {
    registerSW();
    setupInstallPrompt();
    UI.init();
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js?v=3')
        .then(reg => {
          console.log('SW registered:', reg.scope);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          });
        })
        .catch(err => console.error('SW registration failed:', err));

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      UI.showInstallBanner();
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('#install-confirm') || e.target.closest('#menu-install-btn')) {
        e.preventDefault();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              UI.toast('اپلیکیشن نصب شد!', 'success');
            }
            deferredPrompt = null;
            UI.hideInstallBanner();
          });
        } else {
          UI.toast('نصب از منوی مرورگر امکان‌پذیر است', 'info');
        }
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      UI.hideInstallBanner();
      UI.toast('اپلیکیشن با موفقیت نصب شد', 'success');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();