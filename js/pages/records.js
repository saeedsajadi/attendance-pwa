(function() {
  let currentFilter = 'all';
  let searchQuery = '';

  function init() {
    renderRecords();
    setupFilters();
    setupSearch();
    setupEditModal();
  }

  function getTypeLabel(type) {
    const labels = {
      work: 'کار',
      hourly_leave: 'مرخصی ساعتی',
      daily_leave: 'مرخصی روزانه',
      mission: 'ماموریت',
      overtime: 'اضافه‌کاری'
    };
    return labels[type] || type;
  }

  function getTypeIcon(type) {
    const icons = {
      work: 'fa-briefcase',
      hourly_leave: 'fa-clock',
      daily_leave: 'fa-umbrella-beach',
      mission: 'fa-car',
      overtime: 'fa-business-time'
    };
    return icons[type] || 'fa-circle';
  }

  function renderRecords() {
    const container = document.getElementById('records-container');
    if (!container) return;

    let records = DB.getAll();

    // Filter by type
    if (currentFilter !== 'all') {
      records = records.filter(r => r.type === currentFilter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      records = records.filter(r => 
        r.date.includes(q) || 
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    // Sort by date desc
    records.sort((a, b) => {
      const ma = moment(a.date, 'jYYYY/jMM/jDD');
      const mb = moment(b.date, 'jYYYY/jMM/jDD');
      return mb.valueOf() - ma.valueOf();
    });

    if (records.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>رکوردی یافت نشد</p>
        </div>
      `;
      return;
    }

    // Group by date
    const groups = {};
    records.forEach(r => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });

    let html = '';
    let stagger = 0;
    Object.keys(groups).forEach(date => {
      const dayRecords = groups[date];
      const dayName = DateUtils.getDayName(date);
      const totalDayMinutes = dayRecords.reduce((sum, r) => {
        if (r.checkIn && r.checkOut) {
          return sum + DateUtils.diffMinutes(r.checkIn, r.checkOut);
        }
        return sum;
      }, 0);

      html += `<div class="date-group animate-fade-in stagger-${Math.min(stagger, 5)}">
        <div class="date-group-header">
          <div class="date-group-title">${dayName} ${DateUtils.toPersianDigits(date)}</div>
          <div class="date-group-hours">${totalDayMinutes > 0 ? DateUtils.formatDuration(totalDayMinutes) : ''}</div>
        </div>`;

      dayRecords.forEach(r => {
        const duration = (r.checkIn && r.checkOut) 
          ? DateUtils.formatDuration(DateUtils.diffMinutes(r.checkIn, r.checkOut))
          : (r.checkIn ? 'در حال انجام...' : '');

        html += `
          <div class="record-row">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fas ${getTypeIcon(r.type)}" style="color:white;font-size:0.85rem;"></i>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge-${r.type}">${getTypeLabel(r.type)}</span>
                ${r.checkIn ? `<span style="color:rgba(255,255,255,0.9);font-size:0.85rem;"><i class="fas fa-sign-in-alt" style="margin-left:0.25rem;opacity:0.7;"></i>${DateUtils.toPersianDigits(r.checkIn)}</span>` : ''}
                ${r.checkOut ? `<span style="color:rgba(255,255,255,0.9);font-size:0.85rem;"><i class="fas fa-sign-out-alt" style="margin-left:0.25rem;opacity:0.7;"></i>${DateUtils.toPersianDigits(r.checkOut)}</span>` : ''}
              </div>
              ${duration ? `<div style="color:#fbbf24;font-size:0.8rem;font-weight:600;margin-top:0.25rem;">${duration}</div>` : ''}
              ${r.description ? `<div style="color:rgba(255,255,255,0.6);font-size:0.75rem;margin-top:0.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.description}</div>` : ''}
            </div>
            <div class="record-actions">
              <button class="btn-edit" onclick="RecordsPage.openEdit('${r.id}')" title="ویرایش"><i class="fas fa-pen" style="font-size:0.75rem;"></i></button>
              <button class="btn-delete" onclick="RecordsPage.deleteRecord('${r.id}')" title="حذف"><i class="fas fa-trash" style="font-size:0.75rem;"></i></button>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      stagger++;
    });

    container.innerHTML = html;
  }

  function setupFilters() {
    const container = document.getElementById('type-filters');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.type;
      renderRecords();
    });
  }

  function setupSearch() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderRecords();
    });
  }

  function openEdit(id) {
    const record = DB.getById(id);
    if (!record) return;

    document.getElementById('edit-id').value = record.id;
    document.getElementById('edit-date').value = record.date;
    document.getElementById('edit-type').value = record.type;
    document.getElementById('edit-checkin').value = record.checkIn || '';
    document.getElementById('edit-checkout').value = record.checkOut || '';
    document.getElementById('edit-desc').value = record.description || '';

    const timeGroup = document.getElementById('edit-time-group');
    if (record.type === 'daily_leave') {
      timeGroup.style.display = 'none';
    } else {
      timeGroup.style.display = 'block';
    }

    UI.openModal('edit-modal');
  }

  function setupEditModal() {
    const typeSelect = document.getElementById('edit-type');
    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        const timeGroup = document.getElementById('edit-time-group');
        timeGroup.style.display = e.target.value === 'daily_leave' ? 'none' : 'block';
      });
    }

    const saveBtn = document.getElementById('edit-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const id = document.getElementById('edit-id').value;
        const type = document.getElementById('edit-type').value;
        const checkIn = document.getElementById('edit-checkin').value || null;
        const checkOut = document.getElementById('edit-checkout').value || null;
        const description = document.getElementById('edit-desc').value;

        if (type !== 'daily_leave' && checkIn && checkOut) {
          const diff = DateUtils.diffMinutes(checkIn, checkOut);
          if (diff <= 0) {
            UI.toast('ساعت خروج باید بعد از ورود باشد', 'error');
            return;
          }
        }

        DB.update(id, { type, checkIn, checkOut, description });
        UI.closeModal('edit-modal');
        UI.toast('رکورد با موفقیت ویرایش شد', 'success');
        renderRecords();
      });
    }
  }

  function deleteRecord(id) {
    UI.confirmDialog('آیا از حذف این رکورد اطمینان دارید؟', () => {
      DB.remove(id);
      UI.toast('رکورد حذف شد', 'success');
      renderRecords();
    });
  }

  // Expose for inline onclick
  window.RecordsPage = { openEdit, deleteRecord };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();