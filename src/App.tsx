import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NetworkStatus } from './components/NetworkStatus';
import { AuthOverlay } from './components/AuthOverlay';
import {
  EditUserModal,
  ChangeStatusModal,
  EditStudentModal,
  EditGradeModal,
} from './components/Modals';

import { AttendanceScannerTab } from './components/tabs/AttendanceScannerTab';
import { AddStudentTab } from './components/tabs/AddStudentTab';
import { DailyReportTab } from './components/tabs/DailyReportTab';
import { CumulativeGradesTab } from './components/tabs/CumulativeGradesTab';
import { PayExpensesTab } from './components/tabs/PayExpensesTab';
import { FinancialStatsTab } from './components/tabs/FinancialStatsTab';
import { ExamGradesTab } from './components/tabs/ExamGradesTab';
import { DirectMessagingTab } from './components/tabs/DirectMessagingTab';
import { ManageStudentsTab } from './components/tabs/ManageStudentsTab';
import { UsersManagementTab } from './components/tabs/UsersManagementTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { ParentPortalView } from './components/ParentPortalView';

import {
  Student,
  UserAccount,
  SystemData,
  WhatsAppQueueItem,
} from './types';
import {
  loadLocalData,
  saveSystemData,
  subscribeToSystemData,
} from './firebase';
import {
  getTodayKey,
  getMonthKey,
  playBeep,
  speakStudentName,
  openWhatsApp,
  formatWhatsAppPhone,
  normalizeArabic,
  getGradeIndex,
} from './utils';

export default function App() {
  const [data, setData] = useState<SystemData>(loadLocalData);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('attendance-scan-tab');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [enableVoice, setEnableVoice] = useState<boolean>(true);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [whatsappQueue, setWhatsappQueue] = useState<WhatsAppQueueItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('admin') || params.get('panel') === 'admin') {
        sessionStorage.setItem('is_admin_mode', 'true');
        return false;
      }
      if (sessionStorage.getItem('is_admin_mode') === 'true' && !params.has('student') && params.get('portal') !== 'parent') {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  });
  const [parentPortalInitialBarcode, setParentPortalInitialBarcode] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('student') || params.get('code') || '';
    } catch {
      return '';
    }
  });

  // Modals state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [changingStatusInfo, setChangingStatusInfo] = useState<{
    student: Student;
    dateKey: string;
    currentStatus: string;
  } | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingGradeStudent, setEditingGradeStudent] = useState<Student | null>(
    null
  );

  // 1. Initial Data & Realtime Firebase Sync
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setIsDarkTheme(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Firebase real-time subscription
    const unsubscribe = subscribeToSystemData((cloudData) => {
      setData(cloudData);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // 2. Global Enter key for WhatsApp queue
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && whatsappQueue.length > 0) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          target.tagName !== 'SELECT'
        ) {
          e.preventDefault();
          openNextWhatsApp();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [whatsappQueue]);

  // Helper to commit state changes & sync
  const updateData = useCallback(
    async (updater: (prev: SystemData) => SystemData) => {
      setData((prev) => {
        const next = updater(prev);
        saveSystemData(next);
        return next;
      });
    },
    []
  );

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Permissions helper
  const hasPermission = (permKey: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions?.includes(permKey) || false;
  };

  // Auth
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('is_admin_mode');
    setIsParentPortalOpen(true);
  };

  // WhatsApp Queue Engine
  const openNextWhatsApp = () => {
    if (whatsappQueue.length === 0) return;
    const nextItem = whatsappQueue[0];
    setWhatsappQueue((prev) => prev.slice(1));
    openWhatsApp(nextItem.phone, nextItem.message);
  };

  // --- Handlers ---

  // 1. Attendance Scan
  const handleBarcodeScanned = (
    barcode: string,
    selectedGrade: string,
    selectedDays: string
  ) => {
    const student = data.students.find((s) => s.barcode === barcode);
    if (!student) {
      playBeep('error');
      return;
    }

    if (
      student.groupGrade !== selectedGrade ||
      student.groupDays !== selectedDays
    ) {
      playBeep('error');
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const statusToday: 'حضور' | 'تأخير' =
      now.getMinutes() > 15 ? 'تأخير' : 'حضور';

    updateData((prev) => {
      const todayKey = getTodayKey();
      const nextAttendanceToday = {
        ...prev.attendanceToday,
        [barcode]: statusToday,
      };
      const nextHistory = {
        ...prev.attendanceHistory,
        [todayKey]: nextAttendanceToday,
      };

      // Add points & total attendance if not already scanned today
      const alreadyScanned = prev.scanLogOrder.includes(barcode);
      const nextStudents = prev.students.map((s) => {
        if (s.barcode === barcode) {
          return {
            ...s,
            totalAttendanceDays: alreadyScanned
              ? s.totalAttendanceDays
              : (s.totalAttendanceDays || 0) + 1,
            points: alreadyScanned ? s.points : (s.points || 0) + 5,
          };
        }
        return s;
      });

      // Maintain scan order without duplicates
      const nextOrder = [barcode, ...prev.scanLogOrder.filter((b) => b !== barcode)];
      const nextTimes = { ...prev.scanLogTimes, [barcode]: nowIso };

      return {
        ...prev,
        students: nextStudents,
        attendanceToday: nextAttendanceToday,
        attendanceHistory: nextHistory,
        scanLogOrder: nextOrder,
        scanLogTimes: nextTimes,
      };
    });

    playBeep('success');
    speakStudentName(student.name, enableVoice);
  };

  // Manual Attendance
  const handleManualAttendance = () => {
    const code = prompt('ادخل باركود الطالب للتعويض اليدوي:');
    if (!code) return;
    const cleanCode = code.trim();
    const student = data.students.find((s) => s.barcode === cleanCode);
    if (!student) {
      alert('❌ طالب غير مسجل!');
      return;
    }

    const now = new Date();
    const statusToday: 'حضور' | 'تأخير' =
      now.getMinutes() > 15 ? 'تأخير' : 'حضور';

    updateData((prev) => {
      const todayKey = getTodayKey();
      const nextAttendanceToday = {
        ...prev.attendanceToday,
        [cleanCode]: statusToday,
      };
      const nextHistory = {
        ...prev.attendanceHistory,
        [todayKey]: nextAttendanceToday,
      };

      const alreadyScanned = prev.scanLogOrder.includes(cleanCode);
      const nextStudents = prev.students.map((s) => {
        if (s.barcode === cleanCode) {
          return {
            ...s,
            totalAttendanceDays: alreadyScanned
              ? s.totalAttendanceDays
              : (s.totalAttendanceDays || 0) + 1,
            points: alreadyScanned ? s.points : (s.points || 0) + 5,
          };
        }
        return s;
      });

      const nextOrder = [
        cleanCode,
        ...prev.scanLogOrder.filter((b) => b !== cleanCode),
      ];
      const nextTimes = { ...prev.scanLogTimes, [cleanCode]: now.toISOString() };

      return {
        ...prev,
        students: nextStudents,
        attendanceToday: nextAttendanceToday,
        attendanceHistory: nextHistory,
        scanLogOrder: nextOrder,
        scanLogTimes: nextTimes,
      };
    });

    alert(`✅ تم إثبات حضور الطالب/ة (${student.name}) تعويض يدوي بنجاح!`);
  };

  // Finish Group Attendance
  const handleFinishGroupAttendance = (
    selectedGrade: string,
    selectedDays: string
  ) => {
    if (
      !confirm(
        `هل أنت متأكد من حفظ وإرسال تقرير الغياب والتأخير لـ (${selectedGrade} - ${selectedDays})؟ سيتم تجهيز رسائل الواتساب للغائبين والمتأخرين.`
      )
    )
      return;

    const groupStudents = data.students.filter(
      (s) => s.groupGrade === selectedGrade && s.groupDays === selectedDays
    );

    const newQueue: WhatsAppQueueItem[] = [];

    updateData((prev) => {
      const todayKey = getTodayKey();
      const nextAttendanceToday = { ...prev.attendanceToday };

      const nextStudents = prev.students.map((student) => {
        if (
          student.groupGrade === selectedGrade &&
          student.groupDays === selectedDays
        ) {
          const isScanned = prev.scanLogOrder.includes(student.barcode);
          const currentStatus = nextAttendanceToday[student.barcode];

          if (isScanned) {
            if (currentStatus === 'تأخير') {
              const timeObj = prev.scanLogTimes[student.barcode];
              const timeStr = timeObj
                ? new Date(timeObj).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : new Date().toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
              newQueue.push({
                phone: student.parentPhone,
                message: `تنبيه من منظومة الأستاذة إيمان الدمشتي 📐\nنفيدكم بعلم أن الطالب/ة: (${student.name})\nقد وصل متأخراً اليوم عن الموعد المحدد لحصة الرياضيات (${timeStr}).`,
                studentName: student.name,
              });
            }
            return student;
          } else {
            // Absent
            nextAttendanceToday[student.barcode] = 'غائب';
            newQueue.push({
              phone: student.parentPhone,
              message: `تنبيه من منظومة الأستاذة إيمان الدمشتي 📐\nنفيدكم بعلم أن الطالب/ة: (${student.name})\nقد تغيب اليوم عن حضور حصة الرياضيات.`,
              studentName: student.name,
            });
            return {
              ...student,
              totalAbsentDays: (student.totalAbsentDays || 0) + 1,
            };
          }
        }
        return student;
      });

      // Clear scanned students only for THIS group
      const groupBarcodes = new Set<string>(groupStudents.map((s) => s.barcode));
      const nextOrder = prev.scanLogOrder.filter((b) => !groupBarcodes.has(b));
      const nextTimes = { ...prev.scanLogTimes };
      groupBarcodes.forEach((b: string) => delete nextTimes[b]);

      const nextHistory = {
        ...prev.attendanceHistory,
        [todayKey]: nextAttendanceToday,
      };

      return {
        ...prev,
        students: nextStudents,
        attendanceToday: nextAttendanceToday,
        attendanceHistory: nextHistory,
        scanLogOrder: nextOrder,
        scanLogTimes: nextTimes,
      };
    });

    if (newQueue.length > 0) {
      setWhatsappQueue(newQueue);
    } else {
      alert('✅ تم حفظ المجموعة بنجاح! لا توجد حالات غياب أو تأخير لإرسالها.');
    }
  };

  // 2. Add Student
  const handleAddStudent = (newStudent: Student) => {
    const todayKey = getTodayKey();
    const monthKey = getMonthKey();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateData((prev) => {
      const nextPayments = { ...prev.payments };
      if (!nextPayments[monthKey]) nextPayments[monthKey] = {};
      nextPayments[monthKey][`card_${newStudent.barcode}`] = {
        amount: 30,
        date: todayKey,
        time: timeStr,
        note: 'ثمن كارت الاشتراك',
        studentName: newStudent.name,
        barcode: newStudent.barcode,
      };

      return {
        ...prev,
        students: [...prev.students, newStudent],
        payments: nextPayments,
      };
    });

    // WhatsApp Message
    const msg = `تم الاشتراك مع ميس إيمان الدمشتي.\nوقيمة الكارت 30 جنيه.`;
    openWhatsApp(newStudent.parentPhone, msg);
  };

  // 3. Update Student Status
  const handleUpdateStudentStatus = (
    barcode: string,
    newStatus: 'حضور' | 'تأخير' | 'غائب'
  ) => {
    if (!changingStatusInfo) return;
    const { dateKey } = changingStatusInfo;
    const todayKey = getTodayKey();

    updateData((prev) => {
      const nextHistory = { ...prev.attendanceHistory };
      if (!nextHistory[dateKey]) nextHistory[dateKey] = {};
      nextHistory[dateKey][barcode] = newStatus;

      const nextToday =
        dateKey === todayKey
          ? { ...prev.attendanceToday, [barcode]: newStatus }
          : prev.attendanceToday;

      return {
        ...prev,
        attendanceHistory: nextHistory,
        attendanceToday: nextToday,
      };
    });

    setChangingStatusInfo(null);
  };

  // 4. Update Student Details
  const handleUpdateStudent = (updated: Student, oldBarcode: string) => {
    updateData((prev) => {
      const nextStudents = prev.students.map((s) =>
        s.barcode === oldBarcode ? updated : s
      );

      // If barcode changed, remap today's records
      let nextToday = { ...prev.attendanceToday };
      let nextTimes = { ...prev.scanLogTimes };
      let nextOrder = [...prev.scanLogOrder];

      if (oldBarcode !== updated.barcode) {
        if (nextToday[oldBarcode]) {
          nextToday[updated.barcode] = nextToday[oldBarcode];
          delete nextToday[oldBarcode];
        }
        if (nextTimes[oldBarcode]) {
          nextTimes[updated.barcode] = nextTimes[oldBarcode];
          delete nextTimes[oldBarcode];
        }
        const idx = nextOrder.indexOf(oldBarcode);
        if (idx !== -1) nextOrder[idx] = updated.barcode;
      }

      return {
        ...prev,
        students: nextStudents,
        attendanceToday: nextToday,
        scanLogTimes: nextTimes,
        scanLogOrder: nextOrder,
      };
    });

    setEditingStudent(null);
  };

  // 5. Delete Student (Safe cascading)
  const handleDeleteStudent = (barcode: string) => {
    const student = data.students.find((s) => s.barcode === barcode);
    if (!student) return;

    if (
      confirm(
        `هل أنت متأكد من حذف الطالب (${student.name}) نهائياً من المنظومة؟`
      )
    ) {
      updateData((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.barcode !== barcode),
        scanLogOrder: prev.scanLogOrder.filter((b) => b !== barcode),
      }));
      alert('✅ تم حذف الطالب بنجاح!');
    }
  };

  // 6. Pay Expenses
  const handlePayExpenses = (student: Student, amount: number) => {
    const todayKey = getTodayKey();
    const monthKey = getMonthKey();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

    updateData((prev) => {
      const nextPayments = { ...prev.payments };
      if (!nextPayments[monthKey]) nextPayments[monthKey] = {};
      nextPayments[monthKey][student.barcode] = {
        amount,
        date: todayKey,
        time: timeStr,
        note: `اشتراك شهر ${monthKey}`,
        studentName: student.name,
        barcode: student.barcode,
      };

      return {
        ...prev,
        payments: nextPayments,
      };
    });

    const msg = `تم استلام اشتراك شهر ${monthKey} للطالب/ة: ${student.name}\nالمبلغ: ${amount} ج.م\nبتاريخ: ${todayKey}`;
    openWhatsApp(student.parentPhone, msg);
  };

  // 7. Exam Grade
  const handleSaveGrade = (
    student: Student,
    examTitle: string,
    score: number,
    maxScore: number,
    percent: number
  ) => {
    updateData((prev) => {
      const nextStudents = prev.students.map((s) => {
        if (s.barcode === student.barcode) {
          const oldScores = s.totalExamScores || [];
          return {
            ...s,
            totalExamScores: [...oldScores, percent],
            lastExamTitle: examTitle,
            lastExamScore: `${score} من ${maxScore} (${percent}%)`,
          };
        }
        return s;
      });

      return {
        ...prev,
        students: nextStudents,
      };
    });

    let evalText = '';
    if (percent >= 85) evalText = 'ممتاز جداً 🌟 واصل التألق!';
    else if (percent >= 70) evalText = 'جيد جداً 👍 نتطلع للمزيد من النجاح.';
    else evalText = 'تحذير عاجل! مستوى الطالب يحتاج متابعة فورية.';

    const msg = `نتيجة اختبار الرياضيات: (${examTitle})\nالطالب/ة: ${student.name}\nالدرجة: ${score} من ${maxScore} (${percent}%)\nالتقييم: ${evalText}`;
    openWhatsApp(student.parentPhone, msg);
  };

  // 8. Edit Grade & Points
  const handleSaveEditedGrade = (
    barcode: string,
    lastTitle: string,
    lastScore: string,
    points: number
  ) => {
    updateData((prev) => {
      const nextStudents = prev.students.map((s) => {
        if (s.barcode === barcode) {
          return {
            ...s,
            lastExamTitle: lastTitle,
            lastExamScore: lastScore,
            points,
          };
        }
        return s;
      });

      return {
        ...prev,
        students: nextStudents,
      };
    });

    setEditingGradeStudent(null);
  };

  // 9. Users Management
  const handleAddUser = (newUser: UserAccount) => {
    updateData((prev) => ({
      ...prev,
      usersList: [...prev.usersList, newUser],
    }));
    alert(`✅ تم إضافة حساب (${newUser.username}) بنجاح!`);
  };

  const handleUpdateUser = (updated: UserAccount, origUsername: string) => {
    updateData((prev) => ({
      ...prev,
      usersList: prev.usersList.map((u) =>
        u.username === origUsername ? updated : u
      ),
    }));
    setEditingUser(null);
    alert('✅ تم تعديل حساب المستخدم وصلاحياته بنجاح!');
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`هل أنت متأكد من حذف حساب (${username})؟`)) {
      updateData((prev) => ({
        ...prev,
        usersList: prev.usersList.filter((u) => u.username !== username),
      }));
      alert('تم الحذف بنجاح!');
    }
  };

  // 10. Change Password & Prices
  const handleChangePassword = (newPass: string) => {
    if (!currentUser) return;
    updateData((prev) => {
      const nextUsers = prev.usersList.map((u) =>
        u.username === currentUser.username ? { ...u, pass: newPass } : u
      );
      return { ...prev, usersList: nextUsers };
    });
    setCurrentUser((prev) => (prev ? { ...prev, pass: newPass } : null));
  };

  const handleSaveGroupPrice = (grade: string, price: number) => {
    updateData((prev) => ({
      ...prev,
      groupPrices: { ...prev.groupPrices, [grade]: price },
    }));
  };

  // 11. Clear All Data
  const handleClearAllData = () => {
    if (
      confirm(
        '🚨 تحذير خطير جداً: هل أنت متأكد من مسح جميع بيانات الطلاب والسجلات نهائياً؟ لا يمكن التراجع عن هذه الخطوة!'
      )
    ) {
      const confirmWord = prompt('اكتب كلمة (مسح) للتأكيد النهائي:');
      if (confirmWord === 'مسح') {
        updateData((prev) => ({
          ...prev,
          students: [],
          attendanceHistory: {},
          attendanceToday: {},
          scanLogTimes: {},
          scanLogOrder: [],
          payments: {},
        }));
        alert('🗑️ تم مسح كافة البيانات بنجاح!');
      }
    }
  };

  // PDF Export Helpers (Pure print / browser rendering with perfect Arabic support)
  const exportAbsencePDF = () => {
    const todayStr = getTodayKey();
    const sorted = [...data.students].sort((a, b) => {
      const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
      if (gDiff !== 0) return gDiff;
      return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
    });

    const rows = sorted
      .map((s) => {
        const status = data.attendanceToday[s.barcode];
        if (status === 'غائب' || status === 'تأخير') {
          return `
            <tr>
              <td style="border:1px solid #ddd; padding:10px; font-family:monospace;">${s.barcode}</td>
              <td style="border:1px solid #ddd; padding:10px; font-weight:bold;">${s.name}</td>
              <td style="border:1px solid #ddd; padding:10px;">${s.groupGrade}</td>
              <td style="border:1px solid #ddd; padding:10px; font-weight:bold; color:${
                status === 'تأخير' ? '#d97706' : '#dc2626'
              };">${status}</td>
            </tr>
          `;
        }
        return '';
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>تقرير غياب وتأخير اليوم - ${todayStr}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 30px; direction: rtl; color: #111; }
            h2 { text-align: center; color: #b45309; font-size: 24px; margin-bottom: 5px; }
            p { text-align: center; color: #666; font-size: 14px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; text-align: right; }
            th { background: #fef3c7; color: #92400e; padding: 12px; border: 1px solid #ddd; }
          </style>
        </head>
        <body onload="window.print()">
          <h2>📋 تقرير غياب وتأخير الطلاب اليومي - ميس إيمان الدمشتي</h2>
          <p>تاريخ التقرير: ${todayStr}</p>
          <table>
            <thead>
              <tr>
                <th>الباركود</th>
                <th>اسم الطالب</th>
                <th>الصف الدراسي</th>
                <th>الحالة اليوم</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                `<tr><td colspan="4" style="text-align:center; padding:20px; color:#666;">لا توجد حالات غياب أو تأخير مسجلة لهذا اليوم.</td></tr>`
              }
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const exportExamsPDF = () => {
    const todayStr = getTodayKey();
    const sorted = [...data.students].sort((a, b) => {
      const gDiff = getGradeIndex(a.groupGrade) - getGradeIndex(b.groupGrade);
      if (gDiff !== 0) return gDiff;
      return normalizeArabic(a.name).localeCompare(normalizeArabic(b.name), 'ar');
    });

    const rows = sorted
      .map((s) => {
        const validScores = (s.totalExamScores || []).filter((n) => !isNaN(n));
        const avg =
          validScores.length > 0
            ? Math.round(
                validScores.reduce((acc, curr) => acc + curr, 0) /
                  validScores.length
              )
            : 0;

        return `
          <tr>
            <td style="border:1px solid #ddd; padding:10px; font-family:monospace;">${s.barcode}</td>
            <td style="border:1px solid #ddd; padding:10px; font-weight:bold;">${s.name}</td>
            <td style="border:1px solid #ddd; padding:10px;">${s.groupGrade}</td>
            <td style="border:1px solid #ddd; padding:10px;">${s.lastExamScore || 'لا يوجد'}</td>
            <td style="border:1px solid #ddd; padding:10px; font-weight:bold; color:#0284c7;">${avg}%</td>
          </tr>
        `;
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>سجل درجات الاختبارات التراكمي - ${todayStr}</title>
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;900&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Tajawal', sans-serif; padding: 30px; direction: rtl; color: #111; }
            h2 { text-align: center; color: #0369a1; font-size: 24px; margin-bottom: 5px; }
            p { text-align: center; color: #666; font-size: 14px; margin-bottom: 25px; }
            table { width: 100%; border-collapse: collapse; text-align: right; }
            th { background: #e0f2fe; color: #075985; padding: 12px; border: 1px solid #ddd; }
          </style>
        </head>
        <body onload="window.print()">
          <h2>📊 سجل درجات واختبارات الطلاب التراكمي - ميس إيمان الدمشتي</h2>
          <p>تاريخ التصدير: ${todayStr}</p>
          <table>
            <thead>
              <tr>
                <th>الباركود</th>
                <th>اسم الطالب</th>
                <th>الصف الدراسي</th>
                <th>آخر امتحان ودرجته</th>
                <th>متوسط الدرجات</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows ||
                `<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">لا يوجد طلاب مسجلين في المنظومة.</td></tr>`
              }
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'attendance-scan-tab':
        return '📡 جهاز سكانر الحضور مع الفحص التلقائي والتأخير';
      case 'add-student-tab':
        return '➕ تسجيل طالب جديد وكارت اشتراك';
      case 'stats-tab':
        return '📋 تقرير الحضور اليومي والسابقي';
      case 'cumulative-report-tab':
        return '📊 سجل درجات ونسب الطلاب التراكمية';
      case 'pay-expenses-tab':
        return '💳 نافذة سداد الاشتراكات الشهرية';
      case 'expenses-tab':
        return '💰 الإيرادات والإحصاء المالي العام';
      case 'grades-tab':
        return '📝 رصد درجات الاختبارات وتوجيه الرسائل';
      case 'whatsapp-engine-tab':
        return '🚀 نظام المراسلة الفردية المباشرة';
      case 'manage-students-tab':
        return '❌ لوحة التحكم وإدارة وتعديل بيانات الطلاب';
      case 'users-tab':
        return '👥 إدارة حسابات المستخدمين والصلاحيات';
      case 'settings-tab':
        return '🔑 إعدادات كلمة المرور وأسعار المجموعات';
      case 'parent-portal-tab':
        return '🌐 بوابة متابعة أولياء الأمور الإلكترونية';
      default:
        return 'منظومة الأستاذة إيمان الدمشتي';
    }
  };

  if (isParentPortalOpen) {
    return (
      <ParentPortalView
        data={data}
        initialBarcode={parentPortalInitialBarcode}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        showAdminButton={false}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Auth Screen Overlay */}
      {!isAuthenticated && (
        <AuthOverlay
          usersList={data.usersList}
          onLogin={handleLogin}
          onOpenParentPortal={() => {
            setIsParentPortalOpen(true);
            setParentPortalInitialBarcode('');
          }}
        />
      )}

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId)}
        currentUser={currentUser}
        hasPermission={hasPermission}
        onExportAbsencePDF={exportAbsencePDF}
        onExportExamsPDF={exportExamsPDF}
        isDarkTheme={isDarkTheme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto p-4 md:p-8">
        <NetworkStatus
          isOnline={isOnline}
          queue={whatsappQueue}
          onOpenNextWhatsApp={openNextWhatsApp}
        />

        <Header
          title={getPageTitle()}
          enableVoice={enableVoice}
          onToggleVoice={() => setEnableVoice(!enableVoice)}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Tab Content Router */}
        <div
          className="p-4 md:p-8 rounded-3xl border shadow-xl flex-1 mb-8"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          {activeTab === 'attendance-scan-tab' && (
            <AttendanceScannerTab
              students={data.students}
              scanLogOrder={data.scanLogOrder}
              scanLogTimes={data.scanLogTimes}
              attendanceToday={data.attendanceToday}
              payments={data.payments}
              onBarcodeScanned={handleBarcodeScanned}
              onManualAttendance={handleManualAttendance}
              onFinishGroupAttendance={handleFinishGroupAttendance}
            />
          )}

          {activeTab === 'add-student-tab' && hasPermission('add_student') && (
            <AddStudentTab
              students={data.students}
              onAddStudent={handleAddStudent}
            />
          )}

          {activeTab === 'stats-tab' && (
            <DailyReportTab
              students={data.students}
              attendanceHistory={data.attendanceHistory}
              attendanceToday={data.attendanceToday}
              onOpenStatusModal={(student, dateKey, currentStatus) =>
                setChangingStatusInfo({ student, dateKey, currentStatus })
              }
            />
          )}

          {activeTab === 'cumulative-report-tab' && (
            <CumulativeGradesTab
              students={data.students}
              onOpenEditGradeModal={(student) => setEditingGradeStudent(student)}
            />
          )}

          {activeTab === 'pay-expenses-tab' && hasPermission('pay_expenses') && (
            <PayExpensesTab
              students={data.students}
              groupPrices={data.groupPrices}
              onPayExpenses={handlePayExpenses}
            />
          )}

          {activeTab === 'expenses-tab' && hasPermission('view_revenues') && (
            <FinancialStatsTab
              students={data.students}
              payments={data.payments}
            />
          )}

          {activeTab === 'grades-tab' && hasPermission('add_grades') && (
            <ExamGradesTab
              students={data.students}
              onSaveGrade={handleSaveGrade}
            />
          )}

          {activeTab === 'whatsapp-engine-tab' &&
            hasPermission('send_messages') && (
              <DirectMessagingTab students={data.students} />
            )}

          {activeTab === 'manage-students-tab' &&
            currentUser?.role === 'admin' && (
              <ManageStudentsTab
                students={data.students}
                onOpenEditStudentModal={(student) =>
                  setEditingStudent(student)
                }
                onDeleteStudent={handleDeleteStudent}
                onClearAllData={handleClearAllData}
              />
            )}

          {activeTab === 'users-tab' && currentUser?.role === 'admin' && (
            <UsersManagementTab
              usersList={data.usersList}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onOpenEditUserModal={(user) => setEditingUser(user)}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'settings-tab' && currentUser?.role === 'admin' && (
            <SettingsTab
              currentUser={currentUser}
              groupPrices={data.groupPrices}
              onChangePassword={handleChangePassword}
              onSaveGroupPrice={handleSaveGroupPrice}
            />
          )}

          {activeTab === 'parent-portal-tab' && (
            <ParentPortalView
              data={data}
              initialBarcode=""
              isDarkTheme={isDarkTheme}
              onToggleTheme={toggleTheme}
              onGoToLogin={() => setActiveTab('attendance-scan-tab')}
            />
          )}
        </div>
      </div>

      {/* Global Modals */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
      />

      <ChangeStatusModal
        student={changingStatusInfo?.student || null}
        currentStatus={changingStatusInfo?.currentStatus || 'حضور'}
        selectedDate={changingStatusInfo?.dateKey || getTodayKey()}
        isOpen={!!changingStatusInfo}
        onClose={() => setChangingStatusInfo(null)}
        onSave={handleUpdateStudentStatus}
      />

      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSave={handleUpdateStudent}
      />

      <EditGradeModal
        student={editingGradeStudent}
        isOpen={!!editingGradeStudent}
        onClose={() => setEditingGradeStudent(null)}
        onSave={handleSaveEditedGrade}
      />
    </div>
  );
}
