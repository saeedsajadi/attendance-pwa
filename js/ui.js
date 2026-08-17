const UI = (function() {
  function init() {
    createToastContainer();
    createSideMenu();
    createInstallBanner();
    setupMenuListeners();
  }

  function createToastContainer() {
    if (document.getElementById('toast-container')) return;
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.className = 'toast-container';
    document.body.appendChild(div);
  }

  function toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type}`;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle'
    };
    
    toastEl.innerHTML = `
      <i class="fas ${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toastEl);
    
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(20px)';
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  }

  function createSideMenu() {
    if (document.getElementById('side-menu')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'side-menu-overlay';
    overlay.className = 'side-menu-overlay';
    overlay.innerHTML = `<div class="side-menu" id="side-menu">
      <div class="side-menu-header">
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <div style="width:40px;height:40px;border-radius:10px;background:white;display:flex;align-items:center;justify-content:center;">
            <i class="fas fa-clock" style="color:var(--primary);font-size:1.2rem;"></i>
          </div>
          <div>
            <div style="color:white;font-weight:700;">حضور و غیاب</div>
            <div style="color:rgba(255,255,255,0.7);font-size:0.75rem;">نسخه ۱.۰</div>
          </div>
        </div>
        <button class="menu-btn" id="close-menu" style="width:36px;height:36px;">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <nav style="display:flex;flex-direction:column;gap:0.25rem;">
        <a href="./index.html" class="side-menu-item">
          <i class="fas fa-home"></i> صفحه اصلی
        </a>
        <a href="./records.html" class="side-menu-item">
          <i class="fas fa-list"></i> مشاهده سوابق
        </a>
        <a href="./report.html" class="side-menu-item">
          <i class="fas fa-file-excel"></i> گزارش‌گیری
        </a>
        <a href="./settings.html" class="side-menu-item">
          <i class="fas fa-cog"></i> تنظیمات
        </a>
        <button class="side-menu-item" id="menu-install-btn" style="background:none;border:none;width:100%;text-align:right;">
          <i class="fas fa-download"></i> نصب برنامه
        </button>
      </nav>
      <div class="side-menu-footer">
        <i class="fas fa-shield-alt" style="margin-left:0.25rem;"></i>
        داده‌ها به صورت محلی در مرورگر ذخیره می‌شوند
      </div>
    </div>`;
    
    document.body.appendChild(overlay);
  }

  function createInstallBanner() {
    if (document.getElementById('install-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.className = 'install-banner';
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;">
          <i class="fas fa-clock" style="color:white;font-size:1.3rem;"></i>
        </div>
        <div>
          <div style="font-weight:700;color:#1f2937;">نصب اپلیکیشن</div>
          <div style="font-size:0.8rem;color:#6b7280;">دسترسی سریع‌تر و آفلاین</div>
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;">
        <button class="btn btn-primary" id="install-confirm" style="padding:0.5rem 1rem;font-size:0.85rem;">نصب</button>
        <button class="btn btn-outline" id="install-dismiss" style="padding:0.5rem 1rem;font-size:0.85rem;color:#6b7280;border-color:#d1d5db;">بعداً</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  function setupMenuListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#menu-btn') || e.target.closest('#menu-btn-records') || e.target.closest('#menu-btn-report') || e.target.closest('#menu-btn-settings')) {
        openMenu();
      }
      if (e.target.closest('#close-menu') || e.target.closest('#side-menu-overlay')) {
        closeMenu();
      }
      if (e.target.closest('#install-dismiss')) {
        hideInstallBanner();
      }
    });
  }

  function openMenu() {
    document.getElementById('side-menu-overlay').classList.add('active');
    document.getElementById('side-menu').classList.add('active');
  }

  function closeMenu() {
    document.getElementById('side-menu-overlay').classList.remove('active');
    document.getElementById('side-menu').classList.remove('active');
  }

  function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.add('show');
  }

  function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('show');
  }

  function createModal(id, title, content, footer = '') {
    if (document.getElementById(id)) return;
    
    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-weight:700;color:#1f2937;">${title}</h3>
          <button class="menu-btn" onclick="UI.closeModal('${id}')" style="width:32px;height:32px;background:#f3f4f6;color:#6b7280;border:none;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(id);
    });
    
    document.body.appendChild(modal);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  function confirmDialog(message, onConfirm, onCancel) {
    const id = 'confirm-modal-' + Date.now();
    const content = `<p style="color:#4b5563;">${message}</p>`;
    const footer = `
      <button class="btn btn-outline" onclick="UI.closeModal('${id}')" style="color:#6b7280;border-color:#d1d5db;">انصراف</button>
      <button class="btn btn-danger" id="${id}-confirm">تأیید</button>
    `;
    
    createModal(id, 'تأیید عملیات', content, footer);
    openModal(id);
    
    document.getElementById(id + '-confirm').addEventListener('click', () => {
      closeModal(id);
      if (onConfirm) onConfirm();
      setTimeout(() => document.getElementById(id)?.remove(), 400);
    });
    
    const cancelBtn = document.querySelector(`#${id} .modal-footer .btn-outline`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        setTimeout(() => document.getElementById(id)?.remove(), 400);
      });
    }
  }

  return {
    init, toast, openMenu, closeMenu,
    showInstallBanner, hideInstallBanner,
    createModal, openModal, closeModal, confirmDialog
  };
})();