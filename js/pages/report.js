(function() {
  let currentReportData = [];

  function init() {
    if (typeof $ !== 'undefined') {
      $('#report-from, #report-to').pDatepicker({
        format: 'YYYY/MM/DD',
        autoClose: true,
        initialValue: false,
        position: 'auto'
      });
    }

    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('btn-excel').addEventListener('click', downloadExcel);
    document.getElementById('btn-share').addEventListener('click', shareReport);
    document.getElementById('btn-print').addEventListener('click', () => window.print());
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

  function generateReport() {
    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;

    if (!fromDate || !toDate) {
      UI.toast('لطفاً بازه تاریخ را مشخص کنید', 'error');
      return;
    }

    const checkedTypes = Array.from(document.querySelectorAll('#report-types input:checked')).map(cb => cb.value);
    if (checkedTypes.length === 0) {
      UI.toast('حداقل یک نوع رکورد انتخاب کنید', 'error');
      return;
    }

    currentReportData = DB.getRecordsByDateRange(fromDate, toDate, checkedTypes);

    currentReportData.sort((a, b) => {
      const ma = moment(a.date, 'jYYYY/jMM/jDD');
      const mb = moment(b.date, 'jYYYY/jMM/jDD');
      return mb.valueOf() - ma.valueOf();
    });

    const tbody = document.getElementById('report-tbody');
    const resultsDiv = document.getElementById('report-results');
    const emptyDiv = document.getElementById('report-empty');
    const summaryDiv = document.getElementById('report-summary');

    if (currentReportData.length === 0) {
      resultsDiv.style.display = 'none';
      emptyDiv.style.display = 'block';
      emptyDiv.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>رکوردی در این بازه یافت نشد</p>
        </div>
      `;
      return;
    }

    let totalMinutes = 0;
    let html = '';

    currentReportData.forEach(r => {
      const duration = (r.checkIn && r.checkOut)
        ? DateUtils.formatDuration(DateUtils.diffMinutes(r.checkIn, r.checkOut))
        : '-';

      if (r.checkIn && r.checkOut) {
        totalMinutes += DateUtils.diffMinutes(r.checkIn, r.checkOut);
      }

      html += `
        <tr>
          <td>${DateUtils.toPersianDigits(r.date)}</td>
          <td>${DateUtils.getDayName(r.date)}</td>
          <td><span class="badge badge-${r.type}">${getTypeLabel(r.type)}</span></td>
          <td>${r.checkIn ? DateUtils.toPersianDigits(r.checkIn) : '-'}</td>
          <td>${r.checkOut ? DateUtils.toPersianDigits(r.checkOut) : '-'}</td>
          <td>${duration}</td>
          <td>${r.description || '-'}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    summaryDiv.innerHTML = `جمع کل ساعات: ${DateUtils.formatDuration(totalMinutes)} | تعداد رکورد: ${DateUtils.toPersianDigits(currentReportData.length)}`;
    
    const printRange = document.getElementById('print-range');
    if (printRange) {
      printRange.textContent = `بازه: ${DateUtils.toPersianDigits(fromDate)} تا ${DateUtils.toPersianDigits(toDate)}`;
    }
    
    resultsDiv.style.display = 'block';
    emptyDiv.style.display = 'none';
  }

  function downloadExcel() {
    if (currentReportData.length === 0) {
      UI.toast('ابتدا گزارش را تولید کنید', 'error');
      return;
    }

    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;

    const data = currentReportData.map(r => ({
      'تاریخ': r.date,
      'روز هفته': DateUtils.getDayName(r.date),
      'نوع': getTypeLabel(r.type),
      'ورود': r.checkIn || '',
      'خروج': r.checkOut || '',
      'مدت (دقیقه)': (r.checkIn && r.checkOut) ? DateUtils.diffMinutes(r.checkIn, r.checkOut) : 0,
      'توضیحات': r.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'گزارش');
    const filename = `گزارش_حضور_غیاب_از_${fromDate.replace(/\//g, '_')}_تا_${toDate.replace(/\//g, '_')}.xlsx`;
    XLSX.writeFile(wb, filename);

    UI.toast('فایل اکسل دانلود شد', 'success');
  }

  async function shareReport() {
    if (currentReportData.length === 0) {
      UI.toast('ابتدا گزارش را تولید کنید', 'error');
      return;
    }

    const fromDate = document.getElementById('report-from').value;
    const toDate = document.getElementById('report-to').value;

    const data = currentReportData.map(r => ({
      'تاریخ': r.date,
      'روز هفته': DateUtils.getDayName(r.date),
      'نوع': getTypeLabel(r.type),
      'ورود': r.checkIn || '',
      'خروج': r.checkOut || '',
      'مدت (دقیقه)': (r.checkIn && r.checkOut) ? DateUtils.diffMinutes(r.checkIn, r.checkOut) : 0,
      'توضیحات': r.description || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'گزارش');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `گزارش_حضور_غیاب_از_${fromDate.replace(/\//g, '_')}_تا_${toDate.replace(/\//g, '_')}.xlsx`;
    const file = new File([blob], filename, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'گزارش حضور و غیاب',
          text: `گزارش از ${fromDate} تا ${toDate}`
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          UI.toast('خطا در اشتراک‌گذاری', 'error');
        }
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      UI.toast('مرورگر شما از اشتراک فایل پشتیبانی نمی‌کند. فایل دانلود شد.', 'info');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();