export type CellFormat =
  | 'general'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'accounting'
  | 'text';

export interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  border?: 'none' | 'thin' | 'medium' | 'thick' | 'all' | 'bottom' | 'top';
  borderColor?: string;
}

export interface CellData {
  value?: string | number | boolean | null;
  formula?: string;
  format?: CellFormat;
  style?: CellStyle;
}

export interface AccountingSheet {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
  cells: Record<string, CellData>; // key: "A1", "B2", etc.
  columnWidths?: Record<string, number>; // col letter -> px
  rowHeights?: Record<number, number>; // row index (1-based) -> px
  frozenRow?: number;
  frozenCol?: number;
}

export interface AccountingWorkbook {
  id: string;
  ownerId?: string;
  name: string;
  description?: string;
  sheets: AccountingSheet[];
  activeSheetId: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt?: string;
  isArchived?: boolean;
  version?: number;
}

export type SpreadsheetSaveStatus = 'saved' | 'saving' | 'offline' | 'syncing' | 'error';

export interface WorkbookRevision {
  id: string;
  workbookId: string;
  timestamp: string;
  summary: string;
  data: AccountingWorkbook;
}

// Tally-Style Types
export type TallyAccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type TallyAccountSubType =
  | 'cash'
  | 'bank'
  | 'receivable'
  | 'payable'
  | 'inventory'
  | 'sales'
  | 'purchases'
  | 'operating_expense'
  | 'capital'
  | 'tax';

export interface TallyAccount {
  id: string;
  code: string;
  name: string;
  type: TallyAccountType;
  subType: TallyAccountSubType;
  openingBalance: number;
  currentBalance: number;
  description?: string;
}

export type TallyVoucherType =
  | 'sales'
  | 'purchase'
  | 'receipt'
  | 'payment'
  | 'journal'
  | 'expense'
  | 'income'
  | 'transfer';

export interface TallyVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  type: TallyVoucherType;
  debitAccount: string; // Account ID or Name
  creditAccount: string; // Account ID or Name
  amount: number;
  reference?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Fonepay' | 'Khalti' | 'ConnectIPS' | 'Cheque' | 'Credit Card' | 'Other';
  narration: string;
  status: 'posted' | 'draft' | 'cancelled';
  approvedBy?: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  voucherNumber: string;
  voucherType: TallyVoucherType;
  accountId: string;
  accountName: string;
  oppositeAccount: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}
