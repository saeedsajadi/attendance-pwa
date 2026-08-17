(function() {

  function init() {
    if (typeof $ !== 'undefined') {
      $('#manual-date, #leave-date').pDatepicker({
        format: 'YYYY/MM/DD',
        autoClose: true,
        initialValue: false,
        position: 'auto'
      });
    }

    document.getElementById('manual-date').value = DateUtils.todayJalali();
    document.getElementById('leave-date').value = DateUtils.todayJalali();

    document.getElementById('manual-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('manual-date').value;
      const type = document.getElementById('manual-type').value;
      const checkIn = document.getElementById('manual-checkin').value;
      const checkOut = document.getElementById('manual-checkout').value;
      const description = document.getElementById('manual-desc').value;

      if (!date || !checkIn) {
        UI.toast('تاریخ و ساعت ورود الزامی است', 'error');
        return;
      }

      if (DateUtils.isFutureDate(date)) {
        UI.toast('تاریخ نمی‌تواند در آینده باشد', 'error');
        return;
      }

      if (checkOut && DateUtils.diffMinutes(checkIn, checkOut) <= 0) {
        UI.toast('ساعت خروج باید بعد از ورود باشد', 'error');
        return;
      }

      const existing = DB.getAll().find(r => 
        r.date === date && r.type === type && r.checkIn === checkIn
      );
      if (existing) {
        UI.toast('رکورد تکراری با این ساعت ورود وجود دارد', 'error');
        return;
      }

      DB.add({ date, type, checkIn, checkOut: checkOut || null, description });
      UI.toast('رکورد دستی ثبت شد', 'success');
      e.target.reset();
      document.getElementById('manual-date').value = DateUtils.todayJalali();
    });

    document.getElementById('leave-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const date = document.getElementById('leave-date').value;
      const description = document.getElementById('leave-desc').value;

      if (!date) {
        UI.toast('تاریخ الزامی است', 'error');
        return;
      }

      if (DateUtils.isFutureDate(date)) {
        UI.toast('تاریخ نمی‌تواند در آینده باشد', 'error');
        return;
      }

      const existing = DB.getAll().find(r => r.date === date && r.type === 'daily_leave');
      if (existing) {
        UI.toast('برای این تاریخ قبلاً مرخصی روزانه ثبت شده', 'error');
        return;
      }

      DB.add({ date, type: 'daily_leave', checkIn: null, checkOut: null, description });
      UI.toast('مرخصی روزانه ثبت شد', 'success');
      e.target.reset();
      document.getElementById('leave-date').value = DateUtils.todayJalali();
    });

    document.getElementById('manual-type').addEventListener('change', (e) => {
      const timeGroup = document.getElementById('manual-time-group');
      if (e.target.value === 'daily_leave') {
        timeGroup.style.display = 'none';
      } else {
        timeGroup.style.display = 'block';
      }
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      const data = DB.exportToJSON();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_attendance_${DateUtils.todayJalali().replace(/\//g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      UI.toast('فایل پشتیبان دانلود شد', 'success');
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const success = DB.importFromJSON(event.target.result);
          if (success) {
            UI.toast('داده‌ها با موفقیت بازگردانی شدند', 'success');
          } else {
            UI.toast('فایل نامعتبر است', 'error');
          }
        } catch (err) {
          UI.toast('خطا در خواندن فایل', 'error');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('btn-clear-all').addEventListener('click', () => {
      UI.confirmDialog('همه داده‌ها حذف خواهند شد. این عمل غیرقابل بازگشت است. ادامه می‌دهید؟', () => {
        DB.clearAll();
        UI.toast('تمام داده‌ها حذف شدند', 'success');
      });
    });

    if (window.location.hash) {
      const el = document.querySelector(window.location.hash + '-section');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();