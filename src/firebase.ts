import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, Database } from 'firebase/database';
import { SystemData } from './types';
import { DEFAULT_GROUP_PRICES, ALL_PERMISSIONS, getTodayKey } from './utils';

const firebaseConfig = {
  databaseURL: "https://eman-system1-default-rtdb.firebaseio.com/"
};

let app: FirebaseApp | null = null;
let db: Database | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getDatabase(app);
} catch (e) {
  console.warn("Firebase initialization warning (will fallback to LocalStorage):", e);
}

export const LOCAL_STORAGE_KEY = 'eman_center_system_data_v2';

export const INITIAL_SYSTEM_DATA: SystemData = {
  students: [],
  attendanceHistory: {},
  attendanceToday: {},
  scanLogTimes: {},
  scanLogOrder: [],
  payments: {},
  usersList: [
    { username: "admin", pass: "2468", role: "admin", permissions: [...ALL_PERMISSIONS] }
  ],
  groupPrices: { ...DEFAULT_GROUP_PRICES }
};

export function loadLocalData(): SystemData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('center_data');
    if (raw) {
      const parsed = JSON.parse(raw);
      const todayKey = getTodayKey();
      return {
        students: Array.isArray(parsed.students) ? parsed.students : [],
        attendanceHistory: parsed.attendanceHistory || {},
        attendanceToday: (parsed.attendanceHistory && parsed.attendanceHistory[todayKey]) ? parsed.attendanceHistory[todayKey] : (parsed.attendanceToday || {}),
        scanLogTimes: parsed.scanLogTimes || {},
        scanLogOrder: Array.isArray(parsed.scanLogOrder) ? Array.from(new Set(parsed.scanLogOrder as string[])) : [],
        payments: parsed.payments || {},
        usersList: (Array.isArray(parsed.usersList) && parsed.usersList.length > 0) ? parsed.usersList : INITIAL_SYSTEM_DATA.usersList,
        groupPrices: parsed.groupPrices ? { ...DEFAULT_GROUP_PRICES, ...parsed.groupPrices } : { ...DEFAULT_GROUP_PRICES }
      };
    }
  } catch (e) {
    console.error("Failed to load local storage data:", e);
  }
  return { ...INITIAL_SYSTEM_DATA };
}

export function saveLocalDataOnly(data: SystemData) {
  try {
    const todayKey = getTodayKey();
    if (!data.attendanceHistory) data.attendanceHistory = {};
    data.attendanceHistory[todayKey] = data.attendanceToday;

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem('center_data', JSON.stringify(data));
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }
}

export async function saveSystemData(data: SystemData): Promise<boolean> {
  saveLocalDataOnly(data);
  if (navigator.onLine && db) {
    try {
      const systemRef = ref(db, 'center_data');
      await set(systemRef, data);
      return true;
    } catch (e) {
      console.warn("Failed to sync to Firebase:", e);
      return false;
    }
  }
  return true;
}

export function subscribeToSystemData(onDataReceived: (data: SystemData) => void): () => void {
  if (!db) return () => {};
  try {
    const systemRef = ref(db, 'center_data');
    const unsubscribe = onValue(systemRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const todayKey = getTodayKey();
        const merged: SystemData = {
          students: Array.isArray(val.students) ? val.students : [],
          attendanceHistory: val.attendanceHistory || {},
          attendanceToday: (val.attendanceHistory && val.attendanceHistory[todayKey]) ? val.attendanceHistory[todayKey] : (val.attendanceToday || {}),
          scanLogTimes: val.scanLogTimes || {},
          scanLogOrder: Array.isArray(val.scanLogOrder) ? Array.from(new Set(val.scanLogOrder as string[])) : [],
          payments: val.payments || {},
          usersList: (Array.isArray(val.usersList) && val.usersList.length > 0) ? val.usersList : INITIAL_SYSTEM_DATA.usersList,
          groupPrices: val.groupPrices ? { ...DEFAULT_GROUP_PRICES, ...val.groupPrices } : { ...DEFAULT_GROUP_PRICES }
        };
        saveLocalDataOnly(merged);
        onDataReceived(merged);
      }
    }, (error) => {
      console.warn("Firebase listener error:", error);
    });
    return () => unsubscribe();
  } catch (e) {
    console.warn("Error subscribing to Firebase:", e);
    return () => {};
  }
}
