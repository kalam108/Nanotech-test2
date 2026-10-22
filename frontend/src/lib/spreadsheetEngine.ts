import * as XLSX from 'xlsx';
import {
  AccountingWorkbook,
  AccountingSheet,
  CellData,
  CellFormat,
  CellStyle,
} from '../types/accounting';

// ── Column Coordinate Conversion ─────────────────────────────
export function colIndexToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function letterToColIndex(letter: string): number {
  const upper = letter.toUpperCase();
  let col = 0;
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function cellKeyToCoord(key: string): { col: number; row: number } | null {
  const match = key.trim().toUpperCase().match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const colLetter = match[1];
  const rowNum = parseInt(match[2], 10);
  return {
    col: letterToColIndex(colLetter),
    row: rowNum - 1, // 0-based row index
  };
}

export function coordToCellKey(col: number, row: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

export function parseRange(rangeStr: string): string[] {
  const parts = rangeStr.split(':').map((s) => s.trim().toUpperCase());
  if (parts.length === 1) return [parts[0]];
  if (parts.length !== 2) return [];

  const start = cellKeyToCoord(parts[0]);
  const end = cellKeyToCoord(parts[1]);
  if (!start || !end) return [];

  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);

  const cells: string[] = [];
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      cells.push(coordToCellKey(c, r));
    }
  }
  return cells;
}

// ── Formula Evaluator ─────────────────────────────────────────
export function evaluateFormula(
  formula: string,
  cells: Record<string, CellData>,
  visited: Set<string> = new Set()
): { value: string | number | boolean | null; error?: string } {
  if (!formula.startsWith('=')) {
    return { value: formula };
  }

  const rawExpr = formula.substring(1).trim();

  try {
    // 1. Handle Functions: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, IF, ROUND, ABS
    // Format: SUM(A1:A10) or SUM(A1, B2, 500)
    const upperExpr = rawExpr.toUpperCase();

    // Check for IF function: IF(condition, valIfTrue, valIfFalse)
    const ifMatch = rawExpr.match(/^IF\s*\((.*)\)$/i);
    if (ifMatch) {
      const argsStr = ifMatch[1];
      const args = splitFunctionArgs(argsStr);
      if (args.length >= 2) {
        const condVal = evaluateMathOrRef(args[0], cells, visited);
        const trueVal = evaluateMathOrRef(args[1], cells, visited);
        const falseVal = args[2] ? evaluateMathOrRef(args[2], cells, visited) : '';
        const isTrue = Boolean(condVal && condVal !== '0' && condVal !== 0 && condVal !== 'FALSE');
        return { value: isTrue ? trueVal : falseVal };
      }
    }

    // Check for standard aggregate functions
    const funcMatch = rawExpr.match(/^(SUM|AVERAGE|AVG|MIN|MAX|COUNT|COUNTA|ROUND|ABS)\s*\((.*)\)$/i);
    if (funcMatch) {
      const funcName = funcMatch[1].toUpperCase();
      const argsStr = funcMatch[2];
      const args = splitFunctionArgs(argsStr);

      const numbers: number[] = [];
      const allValues: any[] = [];

      for (const arg of args) {
        if (arg.includes(':')) {
          const rangeCells = parseRange(arg);
          for (const k of rangeCells) {
            const cellVal = getCellComputedValue(k, cells, visited);
            allValues.push(cellVal);
            const num = parseNumeric(cellVal);
            if (num !== null) numbers.push(num);
          }
        } else {
          const val = evaluateMathOrRef(arg, cells, visited);
          allValues.push(val);
          const num = parseNumeric(val);
          if (num !== null) numbers.push(num);
        }
      }

      switch (funcName) {
        case 'SUM':
          return { value: numbers.reduce((a, b) => a + b, 0) };
        case 'AVERAGE':
        case 'AVG':
          return { value: numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0 };
        case 'MIN':
          return { value: numbers.length > 0 ? Math.min(...numbers) : 0 };
        case 'MAX':
          return { value: numbers.length > 0 ? Math.max(...numbers) : 0 };
        case 'COUNT':
          return { value: numbers.length };
        case 'COUNTA':
          return { value: allValues.filter((v) => v !== null && v !== '' && v !== undefined).length };
        case 'ROUND':
          if (numbers.length >= 1) {
            const decimals = numbers.length > 1 ? numbers[1] : 0;
            const factor = Math.pow(10, decimals);
            return { value: Math.round(numbers[0] * factor) / factor };
          }
          return { value: numbers[0] || 0 };
        case 'ABS':
          return { value: numbers.length > 0 ? Math.abs(numbers[0]) : 0 };
      }
    }

    // 2. Standard Arithmetic Expression: e.g. A1 + B2 * 1.13 - (C3 / 2)
    const evaluated = evaluateMathOrRef(rawExpr, cells, visited);
    return { value: evaluated };
  } catch (err: any) {
    return { value: '#ERROR!', error: err?.message || 'Calculation error' };
  }
}

function splitFunctionArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let depth = 0;
  let inQuotes = false;

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '(' && !inQuotes) {
      depth++;
      current += char;
    } else if (char === ')' && !inQuotes) {
      depth--;
      current += char;
    } else if (char === ',' && depth === 0 && !inQuotes) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    args.push(current.trim());
  }
  return args;
}

function parseNumeric(val: any): number | null {
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val === 'string') {
    const clean = val.replace(/[Rs.,\s$%]/gi, '').trim();
    if (!clean) return null;
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }
  return null;
}

export function getCellComputedValue(
  key: string,
  cells: Record<string, CellData>,
  visited: Set<string>
): any {
  const upperKey = key.toUpperCase();
  if (visited.has(upperKey)) {
    return '#REF!'; // Circular reference detected
  }

  const cell = cells[upperKey];
  if (!cell) return '';

  if (cell.formula && cell.formula.startsWith('=')) {
    const newVisited = new Set(visited);
    newVisited.add(upperKey);
    const res = evaluateFormula(cell.formula, cells, newVisited);
    return res.value;
  }

  return cell.value ?? '';
}

function evaluateMathOrRef(
  expr: string,
  cells: Record<string, CellData>,
  visited: Set<string>
): any {
  const trimmed = expr.trim();
  if (!trimmed) return 0;

  // If quoted string literal: "Hello"
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  // Replace cell references (e.g. A1, B12, AA5) with their numerical or string values
  const tokenized = trimmed.replace(/\b([A-Z]+[0-9]+)\b/gi, (match) => {
    const val = getCellComputedValue(match.toUpperCase(), cells, visited);
    if (val === '#REF!' || val === '#ERROR!') return '0';
    const num = parseNumeric(val);
    if (num !== null) return num.toString();
    if (typeof val === 'string') return JSON.stringify(val);
    return '0';
  });

  // Handle comparison operators (> < = >= <= !=)
  const compMatch = tokenized.match(/^(.*?)\s*(>=|<=|!=|==|=|>|<)\s*(.*?)$/);
  if (compMatch) {
    const left = safeEvalMath(compMatch[1]);
    const op = compMatch[2];
    const right = safeEvalMath(compMatch[3]);
    switch (op) {
      case '>':
        return left > right;
      case '<':
        return left < right;
      case '>=':
        return left >= right;
      case '<=':
        return left <= right;
      case '==':
      case '=':
        return left === right;
      case '!=':
        return left !== right;
    }
  }

  return safeEvalMath(tokenized);
}

function safeEvalMath(expr: string): number | string {
  try {
    // Only allow digits, math operators, decimals, parentheses, and spaces
    const sanitized = expr.replace(/[^0-9+\-*/().%^ ]/g, '');
    if (!sanitized.trim()) return expr;
    // Replace ^ with **
    const jsExpr = sanitized.replace(/\^/g, '**');
    // Function constructor safer than eval for arithmetic
    const result = new Function(`return (${jsExpr});`)();
    if (typeof result === 'number') {
      return isNaN(result) ? '#VALUE!' : result;
    }
    return result;
  } catch {
    return expr;
  }
}

// ── Value Formatter ───────────────────────────────────────────
export function formatCellValue(
  value: any,
  format?: CellFormat,
  currencySymbol = 'Rs.'
): string {
  if (value === null || value === undefined || value === '') return '';

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'string' && (value.startsWith('#') || isNaN(parseNumeric(value) as number))) {
    return value;
  }

  const num = parseNumeric(value);

  switch (format) {
    case 'currency':
    case 'accounting':
      if (num === null) return String(value);
      const isNegative = num < 0;
      const formattedAbs = Math.abs(num).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      if (format === 'accounting' && isNegative) {
        return `(${currencySymbol} ${formattedAbs})`;
      }
      return `${isNegative ? '-' : ''}${currencySymbol} ${formattedAbs}`;

    case 'number':
      if (num === null) return String(value);
      return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    case 'percent':
      if (num === null) return String(value);
      return `${(num * 100).toFixed(2)}%`;

    case 'date':
      if (typeof value === 'string') return value;
      return new Date(value).toISOString().slice(0, 10);

    case 'text':
      return String(value);

    case 'general':
    default:
      if (num !== null && typeof value === 'number') {
        return num.toLocaleString('en-IN', { maximumFractionDigits: 4 });
      }
      return String(value);
  }
}

// ── Default Mock Workbooks ────────────────────────────────────
export function generateDefaultWorkbooks(): AccountingWorkbook[] {
  return [
    {
      id: 'wb_business_2026',
      name: 'Business Accounting 2026',
      description: 'Master operational accounting with sales, procurement, overheads & budget tracking.',
      activeSheetId: 'sh_dashboard',
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-08-14T09:30:00Z',
      sheets: [
        {
          id: 'sh_dashboard',
          name: 'Executive Summary',
          rowCount: 25,
          colCount: 10,
          cells: {
            A1: { value: 'NANOTECH ELITE HARDWARE — FISCAL YEAR 2026', style: { bold: true, fontSize: 14, textColor: '#1e293b' } },
            A2: { value: 'Executive Financial & Liquidity Rollup', style: { italic: true, textColor: '#64748b' } },

            A4: { value: 'Financial Metric', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B4: { value: 'Budget Allocated (NPR)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            C4: { value: 'Actual Amount (NPR)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            D4: { value: 'Variance / Remaining', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            E4: { value: 'Utilization Status', style: { bold: true, bgColor: '#fef08a', align: 'center', border: 'all' } },

            A5: { value: 'Gross Hardware Sales Revenue', style: { border: 'all' } },
            B5: { value: 1500000, format: 'currency', style: { align: 'right', border: 'all' } },
            C5: { value: 1850000, format: 'currency', style: { align: 'right', border: 'all' } },
            D5: { formula: '=C5-B5', format: 'currency', style: { bold: true, align: 'right', border: 'all', textColor: '#15803d' } },
            E5: { formula: '=IF(D5>=0,"Target Surpassed","Below Target")', style: { align: 'center', border: 'all' } },

            A6: { value: 'Component Procurement Cost (COGS)', style: { border: 'all' } },
            B6: { value: 800000, format: 'currency', style: { align: 'right', border: 'all' } },
            C6: { value: 920000, format: 'currency', style: { align: 'right', border: 'all' } },
            D6: { formula: '=B6-C6', format: 'currency', style: { align: 'right', border: 'all', textColor: '#b91c1c' } },
            E6: { value: 'Within Buffer', style: { align: 'center', border: 'all' } },

            A7: { value: 'Operating & Logistics Overhead', style: { border: 'all' } },
            B7: { value: 250000, format: 'currency', style: { align: 'right', border: 'all' } },
            C7: { value: 215000, format: 'currency', style: { align: 'right', border: 'all' } },
            D7: { formula: '=B7-C7', format: 'currency', style: { align: 'right', border: 'all', textColor: '#15803d' } },
            E7: { value: 'Cost Optimized', style: { align: 'center', border: 'all' } },

            A8: { value: 'Staff Payroll & Engineering Labor', style: { border: 'all' } },
            B8: { value: 300000, format: 'currency', style: { align: 'right', border: 'all' } },
            C8: { value: 280000, format: 'currency', style: { align: 'right', border: 'all' } },
            D8: { formula: '=B8-C8', format: 'currency', style: { align: 'right', border: 'all' } },
            E8: { value: 'On Track', style: { align: 'center', border: 'all' } },

            A9: { value: 'TOTAL EXPENSES', style: { bold: true, bgColor: '#f1f5f9', border: 'all' } },
            B9: { formula: '=SUM(B6:B8)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            C9: { formula: '=SUM(C6:C8)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            D9: { formula: '=SUM(D6:D8)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            E9: { value: 'Audited', style: { bold: true, align: 'center', bgColor: '#f1f5f9', border: 'all' } },

            A11: { value: 'NET OPERATING PROFIT', style: { bold: true, fontSize: 12, bgColor: '#dcfce7', textColor: '#166534', border: 'all' } },
            B11: { formula: '=B5-B9', format: 'currency', style: { bold: true, align: 'right', bgColor: '#dcfce7', border: 'all' } },
            C11: { formula: '=C5-C9', format: 'currency', style: { bold: true, align: 'right', bgColor: '#dcfce7', textColor: '#166534', border: 'all' } },
            D11: { formula: '=C11-B11', format: 'currency', style: { bold: true, align: 'right', bgColor: '#dcfce7', border: 'all' } },
            E11: { value: 'PROFITABLE ✓', style: { bold: true, align: 'center', bgColor: '#dcfce7', textColor: '#166534', border: 'all' } },
          },
        },
        {
          id: 'sh_sales',
          name: 'Sales Ledger',
          rowCount: 30,
          colCount: 8,
          cells: {
            A1: { value: 'Date', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B1: { value: 'Invoice #', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            C1: { value: 'Customer Name', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            D1: { value: 'Hardware Package', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            E1: { value: 'Subtotal (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            F1: { value: 'VAT 13% (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            G1: { value: 'Total (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            H1: { value: 'Payment Mode', style: { bold: true, bgColor: '#fef08a', align: 'center', border: 'all' } },

            A2: { value: '2026-08-01', style: { border: 'all' } },
            B2: { value: 'INV-2026-001', style: { border: 'all' } },
            C2: { value: 'Aarav Sharma', style: { border: 'all' } },
            D2: { value: 'NVIDIA RTX 4090 OC + i9-14900KS', style: { border: 'all' } },
            E2: { value: 320000, format: 'currency', style: { align: 'right', border: 'all' } },
            F2: { formula: '=E2*0.13', format: 'currency', style: { align: 'right', border: 'all' } },
            G2: { formula: '=E2+F2', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            H2: { value: 'Bank Transfer', style: { align: 'center', border: 'all' } },

            A3: { value: '2026-08-03', style: { border: 'all' } },
            B3: { value: 'INV-2026-002', style: { border: 'all' } },
            C3: { value: 'TechStudio Nepal', style: { border: 'all' } },
            D3: { value: 'Corsair 64GB DDR5 + Samsung 990 PRO', style: { border: 'all' } },
            E3: { value: 145000, format: 'currency', style: { align: 'right', border: 'all' } },
            F3: { formula: '=E3*0.13', format: 'currency', style: { align: 'right', border: 'all' } },
            G3: { formula: '=E3+F3', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            H3: { value: 'Fonepay QR', style: { align: 'center', border: 'all' } },

            A4: { value: '2026-08-05', style: { border: 'all' } },
            B4: { value: 'INV-2026-003', style: { border: 'all' } },
            C4: { value: 'Pooja Thapa', style: { border: 'all' } },
            D4: { value: 'ASUS ROG Strix Z790-E Motherboard', style: { border: 'all' } },
            E4: { value: 78000, format: 'currency', style: { align: 'right', border: 'all' } },
            F4: { formula: '=E4*0.13', format: 'currency', style: { align: 'right', border: 'all' } },
            G4: { formula: '=E4+F4', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            H4: { value: 'Khalti Wallet', style: { align: 'center', border: 'all' } },

            A5: { value: '2026-08-08', style: { border: 'all' } },
            B5: { value: 'INV-2026-004', style: { border: 'all' } },
            C5: { value: 'CyberCore Arena', style: { border: 'all' } },
            D5: { value: '10x Lian Li O11 Dynamic EVO XL', style: { border: 'all' } },
            E5: { value: 380000, format: 'currency', style: { align: 'right', border: 'all' } },
            F5: { formula: '=E5*0.13', format: 'currency', style: { align: 'right', border: 'all' } },
            G5: { formula: '=E5+F5', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            H5: { value: 'ConnectIPS', style: { align: 'center', border: 'all' } },

            A6: { value: 'TOTAL SALES', style: { bold: true, bgColor: '#f1f5f9', border: 'all' } },
            B6: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            C6: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            D6: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            E6: { formula: '=SUM(E2:E5)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            F6: { formula: '=SUM(F2:F5)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            G6: { formula: '=SUM(G2:G5)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all', textColor: '#166534' } },
            H6: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
          },
        },
        {
          id: 'sh_purchases',
          name: 'Hardware Procurement',
          rowCount: 25,
          colCount: 7,
          cells: {
            A1: { value: 'PO #', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B1: { value: 'Supplier OEM', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            C1: { value: 'Hardware Batch', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            D1: { value: 'Qty', style: { bold: true, bgColor: '#fef08a', align: 'center', border: 'all' } },
            E1: { value: 'Unit Cost (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            F1: { value: 'Import Duty (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            G1: { value: 'Total Cost (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },

            A2: { value: 'PO-2026-881', style: { border: 'all' } },
            B2: { value: 'NVIDIA Direct Distribution', style: { border: 'all' } },
            C2: { value: 'RTX 4090 GPUs (Batch 12)', style: { border: 'all' } },
            D2: { value: 5, style: { align: 'center', border: 'all' } },
            E2: { value: 240000, format: 'currency', style: { align: 'right', border: 'all' } },
            F2: { value: 60000, format: 'currency', style: { align: 'right', border: 'all' } },
            G2: { formula: '=(D2*E2)+F2', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },

            A3: { value: 'PO-2026-882', style: { border: 'all' } },
            B3: { value: 'Corsair Taiwan', style: { border: 'all' } },
            C3: { value: 'Dominator Titanium DDR5 RAM Kits', style: { border: 'all' } },
            D3: { value: 20, style: { align: 'center', border: 'all' } },
            E3: { value: 28000, format: 'currency', style: { align: 'right', border: 'all' } },
            F3: { value: 15000, format: 'currency', style: { align: 'right', border: 'all' } },
            G3: { formula: '=(D3*E3)+F3', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },

            A4: { value: 'TOTAL PROCUREMENT', style: { bold: true, bgColor: '#f1f5f9', border: 'all' } },
            B4: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            C4: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            D4: { formula: '=SUM(D2:D3)', style: { bold: true, align: 'center', bgColor: '#f1f5f9', border: 'all' } },
            E4: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            F4: { formula: '=SUM(F2:F3)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            G4: { formula: '=SUM(G2:G3)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all', textColor: '#b91c1c' } },
          },
        },
      ],
    },
    {
      id: 'wb_monthly_expenses',
      name: 'Monthly Expenses & Overheads',
      description: 'Breakdown of recurring operational costs, server subscriptions, and facilities.',
      activeSheetId: 'sh_exp_august',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-14T05:00:00Z',
      sheets: [
        {
          id: 'sh_exp_august',
          name: 'August 2026 Overheads',
          rowCount: 20,
          colCount: 6,
          cells: {
            A1: { value: 'Category', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B1: { value: 'Expense Item Description', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            C1: { value: 'Vendor / Provider', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            D1: { value: 'Budget (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            E1: { value: 'Actual Cost (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            F1: { value: 'Variance (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },

            A2: { value: 'Cloud & Infrastructure', style: { border: 'all' } },
            B2: { value: 'AWS Cloud Hosting & Dedicated High-Speed Node', style: { border: 'all' } },
            C2: { value: 'Amazon Web Services', style: { border: 'all' } },
            D2: { value: 35000, format: 'currency', style: { align: 'right', border: 'all' } },
            E2: { value: 32400, format: 'currency', style: { align: 'right', border: 'all' } },
            F2: { formula: '=D2-E2', format: 'currency', style: { align: 'right', border: 'all', textColor: '#15803d' } },

            A3: { value: 'Logistics & Shipping', style: { border: 'all' } },
            B3: { value: 'Expedited Air Cargo & Valley Delivery', style: { border: 'all' } },
            C3: { value: 'Nepal Express Courier', style: { border: 'all' } },
            D3: { value: 45000, format: 'currency', style: { align: 'right', border: 'all' } },
            E3: { value: 41200, format: 'currency', style: { align: 'right', border: 'all' } },
            F3: { formula: '=D3-E3', format: 'currency', style: { align: 'right', border: 'all', textColor: '#15803d' } },

            A4: { value: 'Facilities & Utilities', style: { border: 'all' } },
            B4: { value: 'Showroom Rent & 3-Phase Commercial Power', style: { border: 'all' } },
            C4: { value: 'New Road Commercial Complex', style: { border: 'all' } },
            D4: { value: 120000, format: 'currency', style: { align: 'right', border: 'all' } },
            E4: { value: 120000, format: 'currency', style: { align: 'right', border: 'all' } },
            F4: { formula: '=D4-E4', format: 'currency', style: { align: 'right', border: 'all' } },

            A5: { value: 'TOTAL OVERHEADS', style: { bold: true, bgColor: '#f1f5f9', border: 'all' } },
            B5: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            C5: { value: '', style: { bgColor: '#f1f5f9', border: 'all' } },
            D5: { formula: '=SUM(D2:D4)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            E5: { formula: '=SUM(E2:E4)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all' } },
            F5: { formula: '=SUM(F2:F4)', format: 'currency', style: { bold: true, align: 'right', bgColor: '#f1f5f9', border: 'all', textColor: '#15803d' } },
          },
        },
      ],
    },
    {
      id: 'wb_tax_vat',
      name: 'Tax & VAT Computation 2026',
      description: '13% Output VAT collected vs Input VAT paid for IRD Nepal filing.',
      activeSheetId: 'sh_vat_summary',
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-14T06:00:00Z',
      sheets: [
        {
          id: 'sh_vat_summary',
          name: 'VAT Ledger & Filing',
          rowCount: 20,
          colCount: 6,
          cells: {
            A1: { value: 'Tax Ledger Item', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B1: { value: 'Taxable Amount (Rs.)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            C1: { value: 'VAT Rate', style: { bold: true, bgColor: '#fef08a', align: 'center', border: 'all' } },
            D1: { value: 'Output Tax (Payable)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            E1: { value: 'Input Tax Credit (Paid)', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },
            F1: { value: 'Net VAT to Deposit', style: { bold: true, bgColor: '#fef08a', align: 'right', border: 'all' } },

            A2: { value: 'Gross Direct Hardware Sales', style: { border: 'all' } },
            B2: { value: 1850000, format: 'currency', style: { align: 'right', border: 'all' } },
            C2: { value: 0.13, format: 'percent', style: { align: 'center', border: 'all' } },
            D2: { formula: '=B2*C2', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            E2: { value: 0, format: 'currency', style: { align: 'right', border: 'all' } },
            F2: { value: '', style: { border: 'all' } },

            A3: { value: 'Import Customs & Supplier Purchases', style: { border: 'all' } },
            B3: { value: 920000, format: 'currency', style: { align: 'right', border: 'all' } },
            C3: { value: 0.13, format: 'percent', style: { align: 'center', border: 'all' } },
            D3: { value: 0, format: 'currency', style: { align: 'right', border: 'all' } },
            E3: { formula: '=B3*C3', format: 'currency', style: { bold: true, align: 'right', border: 'all' } },
            F3: { value: '', style: { border: 'all' } },

            A5: { value: 'NET VAT PAYABLE TO IRD', style: { bold: true, bgColor: '#fef08a', border: 'all' } },
            B5: { value: '', style: { bgColor: '#fef08a', border: 'all' } },
            C5: { value: '', style: { bgColor: '#fef08a', border: 'all' } },
            D5: { formula: '=D2', format: 'currency', style: { bold: true, align: 'right', bgColor: '#fef08a', border: 'all' } },
            E5: { formula: '=E3', format: 'currency', style: { bold: true, align: 'right', bgColor: '#fef08a', border: 'all' } },
            F5: { formula: '=D5-E5', format: 'currency', style: { bold: true, fontSize: 12, align: 'right', bgColor: '#dcfce7', textColor: '#166534', border: 'all' } },
          },
        },
      ],
    },
  ];
}

// ── Export Workbook / Sheet to XLSX ───────────────────────────
export function exportSheetToExcel(
  sheet: AccountingSheet,
  filename = 'spreadsheet.xlsx'
): void {
  const wb = XLSX.utils.book_new();

  // Convert cells into 2D array
  const maxRow = Math.max(sheet.rowCount, 10);
  const maxCol = Math.max(sheet.colCount, 10);
  const data: any[][] = [];

  for (let r = 0; r < maxRow; r++) {
    const rowData: any[] = [];
    for (let c = 0; c < maxCol; c++) {
      const key = coordToCellKey(c, r);
      const computed = getCellComputedValue(key, sheet.cells, new Set());
      rowData.push(computed !== undefined ? computed : '');
    }
    data.push(rowData);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31) || 'Sheet1');
  XLSX.writeFile(wb, filename);
}

export function exportWorkbookToExcel(
  workbook: AccountingWorkbook,
  filename?: string
): void {
  const wb = XLSX.utils.book_new();

  for (const sheet of workbook.sheets) {
    const maxRow = Math.max(sheet.rowCount, 10);
    const maxCol = Math.max(sheet.colCount, 10);
    const data: any[][] = [];

    for (let r = 0; r < maxRow; r++) {
      const rowData: any[] = [];
      for (let c = 0; c < maxCol; c++) {
        const key = coordToCellKey(c, r);
        const cell = sheet.cells[key];
        if (cell?.formula && cell.formula.startsWith('=')) {
          // If formula, can write formula or computed
          rowData.push({ f: cell.formula.substring(1), v: getCellComputedValue(key, sheet.cells, new Set()) });
        } else {
          rowData.push(cell?.value ?? '');
        }
      }
      data.push(rowData);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const safeSheetName = (sheet.name || 'Sheet').replace(/[:\\/?*[\]]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  }

  const safeFilename = filename || `${workbook.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

export function exportSheetToCSV(sheet: AccountingSheet, filename?: string): void {
  const maxRow = Math.max(sheet.rowCount, 10);
  const maxCol = Math.max(sheet.colCount, 10);
  const data: any[][] = [];

  for (let r = 0; r < maxRow; r++) {
    const rowData: any[] = [];
    for (let c = 0; c < maxCol; c++) {
      const key = coordToCellKey(c, r);
      rowData.push(getCellComputedValue(key, sheet.cells, new Set()) ?? '');
    }
    data.push(rowData);
  }

  const ws = XLSX.utils.aoa_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `${sheet.name}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ── Import XLSX/CSV into Workbook ─────────────────────────────
export async function parseExcelFileToWorkbook(file: File): Promise<{
  workbook: AccountingWorkbook;
  totalRows: number;
  validRows: number;
  warnings: string[];
  errors: string[];
}> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array', cellFormula: true });

  const warnings: string[] = [];
  const errors: string[] = [];
  let totalRows = 0;
  let validRows = 0;

  const sheets: AccountingSheet[] = [];

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z50');

    const rowCount = Math.max(range.e.r + 5, 25);
    const colCount = Math.max(range.e.c + 5, 12);
    const cells: Record<string, CellData> = {};

    for (let r = 0; r <= range.e.r; r++) {
      totalRows++;
      let hasDataInRow = false;

      for (let c = 0; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cellObj = ws[cellAddress];
        if (cellObj) {
          hasDataInRow = true;
          const key = coordToCellKey(c, r);

          let cellFormat: CellFormat = 'general';
          if (cellObj.t === 'n' && (cellObj.z?.includes('$') || cellObj.z?.includes('Rs'))) {
            cellFormat = 'currency';
          } else if (cellObj.t === 'n' && cellObj.z?.includes('%')) {
            cellFormat = 'percent';
          } else if (cellObj.t === 'd') {
            cellFormat = 'date';
          } else if (cellObj.t === 'n') {
            cellFormat = 'number';
          }

          cells[key] = {
            value: cellObj.v ?? '',
            formula: cellObj.f ? `=${cellObj.f}` : undefined,
            format: cellFormat,
            style: {
              bold: r === 0,
              border: 'all',
            },
          };
        }
      }

      if (hasDataInRow) {
        validRows++;
      }
    }

    sheets.push({
      id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: sheetName,
      rowCount,
      colCount,
      cells,
    });
  }

  if (sheets.length === 0) {
    errors.push('No readable worksheet detected in file.');
  }

  const workbook: AccountingWorkbook = {
    id: `wb_${Date.now()}`,
    name: file.name.replace(/\.[^/.]+$/, ''),
    description: `Imported from ${file.name} on ${new Date().toLocaleDateString()}`,
    sheets,
    activeSheetId: sheets[0]?.id || 'sh_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    workbook,
    totalRows,
    validRows,
    warnings,
    errors,
  };
}
