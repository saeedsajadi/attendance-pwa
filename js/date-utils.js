const DateUtils = (function() {
  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  const persianDays = [
    'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
  ];

  const persianDaysShort = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  function ensureMoment() {
    if (typeof moment === 'undefined') {
      throw new Error('moment.js not loaded');
    }
    return moment;
  }

  function now() {
    const m = ensureMoment();
    return m().format('HH:mm:ss');
  }

  function todayJalali() {
    const m = ensureMoment();
    return m().format('jYYYY/jMM/jDD');
  }

  function todayJalaliFull() {
    const m = ensureMoment();
    const d = m();
    const dayName = persianDays[d.day()];
    const monthName = persianMonths[d.jMonth()];
    return `${dayName} ${d.jDate()} ${monthName} ${d.jYear()}`;
  }

  function formatJalali(dateStr, format = 'jYYYY/jMM/jDD') {
    const m = ensureMoment();
    return m(dateStr, 'jYYYY/jMM/jDD').format(format);
  }

  function parseJalali(dateStr) {
    const m = ensureMoment();
    return m(dateStr, 'jYYYY/jMM/jDD');
  }

  function getDayName(dateStr) {
    const m = ensureMoment();
    const d = m(dateStr, 'jYYYY/jMM/jDD');
    return persianDays[d.day()];
  }

  function getMonthName(monthIndex) {
    return persianMonths[monthIndex] || '';
  }

  function isValidJalali(dateStr) {
    const m = ensureMoment();
    return m(dateStr, 'jYYYY/jMM/jDD', true).isValid();
  }

  function isFutureDate(dateStr) {
    const m = ensureMoment();
    const input = m(dateStr, 'jYYYY/jMM/jDD');
    const today = m().startOf('day');
    return input.isAfter(today);
  }

  function isSameDay(dateStr1, dateStr2) {
    const m = ensureMoment();
    return m(dateStr1, 'jYYYY/jMM/jDD').isSame(
      m(dateStr2, 'jYYYY/jMM/jDD'), 'day'
    );
  }

  function diffMinutes(time1, time2) {
    const [h1, m1, s1 = 0] = time1.split(':').map(Number);
    const [h2, m2, s2 = 0] = time2.split(':').map(Number);
    const total1 = h1 * 60 + m1 + s1 / 60;
    const total2 = h2 * 60 + m2 + s2 / 60;
    return total2 - total1;
  }

  function formatDuration(minutes) {
    if (minutes <= 0) return '۰ دقیقه';
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m} دقیقه`;
    if (m === 0) return `${h} ساعت`;
    return `${h} ساعت و ${m} دقیقه`;
  }

  function toPersianDigits(str) {
    const persian = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
    return String(str).replace(/[0-9]/g, w => persian[+w]);
  }

  function toEnglishDigits(str) {
    const persianToEnglishMap = {
        '۰': '0',
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9'
    };

    return String(str).replace(/[۰-۹]/g, (w) => persianToEnglishMap[w] || w);
  }

  function getCurrentTime() {
    const m = ensureMoment();
    return m().format('HH:mm:ss');
  }

  function addDaysToJalali(dateStr, days) {
    const m = ensureMoment();
    return m(dateStr, 'jYYYY/jMM/jDD').add(days, 'days').format('jYYYY/jMM/jDD');
  }

  return {
    now, todayJalali, todayJalaliFull,
    formatJalali, parseJalali, getDayName,
    getMonthName, isValidJalali, isFutureDate,
    isSameDay, diffMinutes, formatDuration,
    toPersianDigits, toEnglishDigits, getCurrentTime, addDaysToJalali,
    persianMonths, persianDays, persianDaysShort
  };
})();