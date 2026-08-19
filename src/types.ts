export interface Student {
  barcode: string;
  name: string;
  phone: string;
  parentPhone: string;
  groupGrade: string;
  groupDays: string;
  points: number;
  totalAttendanceDays: number;
  totalAbsentDays: number;
  totalExamScores: number[];
  lastExamTitle?: string;
  lastExamScore?: string;
}

export interface UserAccount {
  username: string;
  pass: string;
  role: 'admin' | 'secretary';
  permissions: string[];
}

export interface PaymentRecord {
  amount: number;
  date: string;
  time: string;
  note: string;
  studentName?: string;
  barcode?: string;
}

export interface GroupPrices {
  [grade: string]: number;
}

export interface AttendanceHistory {
  [dateKey: string]: {
    [barcode: string]: 'حضور' | 'تأخير' | 'غائب';
  };
}

export interface MonthlyPayments {
  [monthKey: string]: {
    [paymentKey: string]: PaymentRecord;
  };
}

export interface SystemData {
  students: Student[];
  attendanceHistory: AttendanceHistory;
  attendanceToday: { [barcode: string]: 'حضور' | 'تأخير' | 'غائب' };
  scanLogTimes: { [barcode: string]: string };
  scanLogOrder: string[];
  payments: MonthlyPayments;
  usersList: UserAccount[];
  groupPrices: GroupPrices;
}

export interface WhatsAppQueueItem {
  phone: string;
  message: string;
  studentName?: string;
}
