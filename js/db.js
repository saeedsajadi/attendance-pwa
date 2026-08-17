const DB = (function() {
  const STORAGE_KEY = 'attendance_v2';

  function getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('DB read error:', e);
      return [];
    }
  }

  function saveAll(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (e) {
      console.error('DB write error:', e);
      return false;
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function add(record) {
    const records = getAll();
    const newRecord = {
      id: generateId(),
      date: record.date,
      type: record.type || 'work',
      checkIn: record.checkIn || null,
      checkOut: record.checkOut || null,
      description: record.description || ''
    };
    records.push(newRecord);
    saveAll(records);
    return newRecord;
  }

  function update(id, updates) {
    const records = getAll();
    const index = records.findIndex(r => r.id === id);
    if (index === -1) return null;
    records[index] = { ...records[index], ...updates };
    saveAll(records);
    return records[index];
  }

  function remove(id) {
    const records = getAll();
    const filtered = records.filter(r => r.id !== id);
    saveAll(filtered);
    return filtered.length < records.length;
  }

  function getById(id) {
    return getAll().find(r => r.id === id);
  }

  function getByDate(date) {
    return getAll().filter(r => r.date === date);
  }

  function getTodayRecords() {
    const today = DateUtils.todayJalali();
    return getAll().filter(r => r.date === today);
  }

  function getLastRecord() {
    const records = getAll();
    return records.length > 0 ? records[records.length - 1] : null;
  }

  function getTodayLastRecord() {
    const today = DateUtils.todayJalali();
    const todayRecords = getAll().filter(r => r.date === today);
    return todayRecords.length > 0 ? todayRecords[todayRecords.length - 1] : null;
  }

  function hasOpenRecordToday() {
    const last = getTodayLastRecord();
    return last && last.checkIn && !last.checkOut;
  }

  function exportToJSON() {
    return JSON.stringify(getAll(), null, 2);
  }

  function importFromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data)) throw new Error('Invalid format');
      saveAll(data);
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getStats() {
    const records = getAll();
    const workDays = new Set(records.filter(r => r.type === 'work' && r.checkIn).map(r => r.date)).size;
    const totalMinutes = records.reduce((sum, r) => {
      if (r.checkIn && r.checkOut) {
        return sum + DateUtils.diffMinutes(r.checkIn, r.checkOut);
      }
      return sum;
    }, 0);
    const leaveCount = records.filter(r => r.type === 'daily_leave').length;
    return { workDays, totalMinutes, leaveCount };
  }

  function getRecordsByDateRange(fromDate, toDate, types = []) {
    const records = getAll();
    return records.filter(r => {
      const m = moment(r.date, 'jYYYY/jMM/jDD');
      const from = moment(fromDate, 'jYYYY/jMM/jDD');
      const to = moment(toDate, 'jYYYY/jMM/jDD');
      const inRange = m.isBetween(from, to, 'day', '[]');
      const typeMatch = types.length === 0 || types.includes(r.type);
      return inRange && typeMatch;
    });
  }

  return {
    getAll, add, update, remove,
    getById, getByDate, getTodayRecords,
    getLastRecord, getTodayLastRecord,
    hasOpenRecordToday, exportToJSON,
    importFromJSON, clearAll, getStats,
    getRecordsByDateRange
  };
})();