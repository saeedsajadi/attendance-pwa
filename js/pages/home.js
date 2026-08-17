(function() {
  let timerInterval = null;

  function init() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderStatus();
    renderStats();
    setupMainButton();
  }

  function updateDateTime() {
    const el = document.getElementById('datetime-display');
    if (el) {
      const time = DateUtils.getCurrentTime();
      const date = DateUtils.todayJalaliFull();
      el.innerHTML = `<span>${date}</span><span style="margin:0 0.5rem;">|</span><span>${DateUtils.toPersianDigits(time)}</span>`;
    }
  }

  function renderStatus() {
    const container = document.getElementById('status-card');
    if (!container) return;

    const todayRecords = DB.getTodayRecords();
    const openRecord = todayRecords.find(r => r.checkIn && !r.checkOut);
    const completedRecords = todayRecords.filter(r => r.checkIn && r.checkOut);
    const checkInTime = openRecord ? openRecord.checkIn : null;

    let totalMinutes = 0;
    completedRecords.forEach(r => {
      totalMinutes += DateUtils.diffMinutes(r.checkIn, r.checkOut);
    });

    if (openRecord) {
      const elapsed = DateUtils.diffMinutes(checkInTime, DateUtils.getCurrentTime());
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(245,158,11,0.3);">
            <i class="fas fa-briefcase" style="color:white;font-size:1.4rem;"></i>
          </div>
          <div style="flex:1;">
            <div style="color:white;font-weight:700;font-size:1.1rem;">در حال کار</div>
            <div style="color:rgba(255,255,255,0.8);font-size:0.85rem;">ورود: ${DateUtils.toPersianDigits(checkInTime)}</div>
            <div style="color:#fbbf24;font-weight:700;font-size:0.95rem;margin-top:0.25rem;" id="live-timer">${DateUtils.formatDuration(elapsed)}</div>
          </div>
        </div>
      `;
      startLiveTimer(checkInTime);
    } else if (completedRecords.length > 0) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#34d399,#10b981);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(16,185,129,0.3);">
            <i class="fas fa-check-circle" style="color:white;font-size:1.4rem;"></i>
          </div>
          <div style="flex:1;">
            <div style="color:white;font-weight:700;font-size:1.1rem;">کار امروز تمام شد</div>
            <div style="color:rgba(255,255,255,0.8);font-size:0.85rem;">${completedRecords.length} رکورد ثبت شده</div>
            <div style="color:#34d399;font-weight:700;font-size:0.95rem;margin-top:0.25rem;">جمع: ${DateUtils.formatDuration(totalMinutes)}</div>
          </div>
        </div>
      `;
      stopLiveTimer();
    } else {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:1rem;">
          <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#60a5fa,#3b82f6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(59,130,246,0.3);">
            <i class="fas fa-coffee" style="color:white;font-size:1.4rem;"></i>
          </div>
          <div style="flex:1;">
            <div style="color:white;font-weight:700;font-size:1.1rem;">آماده برای شروع</div>
            <div style="color:rgba(255,255,255,0.8);font-size:0.85rem;">امروز هنوز ورودی ثبت نشده</div>
            <div style="color:#60a5fa;font-weight:700;font-size:0.95rem;margin-top:0.25rem;">روز خوبی داشته باشید!</div>
          </div>
        </div>
      `;
      stopLiveTimer();
    }

    updateMainButton(!!openRecord, checkInTime);
  }

  function startLiveTimer(checkInTime) {
    stopLiveTimer();
    const update = () => {
      const elapsed = DateUtils.diffMinutes(checkInTime, DateUtils.getCurrentTime());
      const el = document.getElementById('live-timer');
      if (el) el.textContent = DateUtils.formatDuration(elapsed);
    };
    update();
    timerInterval = setInterval(update, 1000);
  }

  function stopLiveTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateMainButton(isWorking, checkInTime) {
    const btn = document.getElementById('main-action-btn');
    if (!btn) return;

    if (isWorking) {
      btn.className = 'main-action-btn main-btn-orange pulse';
      btn.innerHTML = `
        <i class="fas fa-sign-out-alt" style="font-size:2rem;"></i>
        <span style="font-size:1.1rem;font-weight:700;">خروج</span>
        <span style="font-size:0.75rem;opacity:0.9;">${DateUtils.toPersianDigits(checkInTime || '')}</span>
      `;
    } else {
      btn.className = 'main-action-btn main-btn-green';
      btn.innerHTML = `
        <i class="fas fa-sign-in-alt" style="font-size:2rem;"></i>
        <span style="font-size:1.1rem;font-weight:700;">ورود</span>
      `;
    }
  }

  function setupMainButton() {
    const btn = document.getElementById('main-action-btn');
    if (!btn) return;

    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      const today = DateUtils.todayJalali();
      const now = DateUtils.getCurrentTime();

      if (DB.hasOpenRecordToday()) {
        const last = DB.getTodayLastRecord();
        if (last) {
          DB.update(last.id, { checkOut: now });
          UI.toast(`خروج ساعت ${DateUtils.toPersianDigits(now)} ثبت شد`, 'success');
        }
      } else {
        DB.add({
          date: today,
          type: 'work',
          checkIn: now,
          checkOut: null,
          description: ''
        });
        UI.toast(`ورود ساعت ${DateUtils.toPersianDigits(now)} ثبت شد`, 'success');
      }

      renderStatus();
      renderStats();
    });
  }

  function renderStats() {
    const stats = DB.getStats();
    const workDaysEl = document.getElementById('stat-workdays');
    const hoursEl = document.getElementById('stat-hours');
    const leavesEl = document.getElementById('stat-leaves');

    if (workDaysEl) workDaysEl.textContent = DateUtils.toPersianDigits(stats.workDays);
    if (hoursEl) hoursEl.textContent = DateUtils.toPersianDigits(Math.round(stats.totalMinutes / 60));
    if (leavesEl) leavesEl.textContent = DateUtils.toPersianDigits(stats.leaveCount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();