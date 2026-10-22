import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import {
  AccountingWorkbook,
  AccountingSheet,
  CellData,
  CellFormat,
  CellStyle,
} from '../../../types/accounting';
import {
  colIndexToLetter,
  letterToColIndex,
  cellKeyToCoord,
  coordToCellKey,
  getCellComputedValue,
  formatCellValue,
  exportWorkbookToExcel,
  exportSheetToExcel,
  exportSheetToCSV,
  parseExcelFileToWorkbook,
  parseRange,
} from '../../../lib/spreadsheetEngine';
import {
  FileSpreadsheet,
  Save,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  Printer,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Calculator,
  Search,
  CheckCircle2,
  Clock,
  HelpCircle,
  Maximize2,
  Minimize2,
  MoreVertical,
  ChevronDown,
  Sparkles,
  DollarSign,
  Percent,
  Layers,
  FileCode,
  X,
  RefreshCw,
  Sliders,
  Grid,
} from 'lucide-react';

export function OnlineExcelWorkspace() {
  const {
    workbooks,
    activeWorkbookId,
    activeWorkbook,
    activeSheet,
    setActiveWorkbookId,
    setActiveSheetId,
    saveStatus,
    lastSavedTime,
    updateCell,
    updateSheetCells,
    createWorkbook,
    duplicateWorkbook,
    deleteWorkbook,
    renameWorkbook,
    addSheetToWorkbook,
    renameSheet,
    deleteSheet,
    duplicateSheet,
    saveWorkbookManual,
    importWorkbook,
    settings,
  } = useAdmin();

  // Grid Selection State
  const [selectedCell, setSelectedCell] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [selectionRange, setSelectionRange] = useState<{
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // In-cell Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [formulaInput, setFormulaInput] = useState('');

  // UI Modes
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGridlines, setShowGridlines] = useState(true);
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);

  // Modals
  const [isNewWbModalOpen, setIsNewWbModalOpen] = useState(false);
  const [newWbName, setNewWbName] = useState('');
  const [newWbDesc, setNewWbDesc] = useState('');

  const [isRenameWbModalOpen, setIsRenameWbModalOpen] = useState(false);
  const [renameWbVal, setRenameWbVal] = useState('');

  const [isRenameSheetModalOpen, setIsRenameSheetModalOpen] = useState(false);
  const [renameSheetId, setRenameSheetId] = useState('');
  const [renameSheetVal, setRenameSheetVal] = useState('');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFormulaHelpOpen, setIsFormulaHelpOpen] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    workbook: AccountingWorkbook;
    totalRows: number;
    validRows: number;
    warnings: string[];
    errors: string[];
  } | null>(null);

  // Refs
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active coordinates
  const activeKey = useMemo(() => {
    return coordToCellKey(selectedCell.col, selectedCell.row);
  }, [selectedCell]);

  const currentCellData = useMemo(() => {
    if (!activeSheet) return null;
    return activeSheet.cells[activeKey] || null;
  }, [activeSheet, activeKey]);

  // Keep formula input in sync when active cell changes (unless currently editing formula input)
  useEffect(() => {
    if (!isEditing && currentCellData) {
      setFormulaInput(currentCellData.formula || String(currentCellData.value ?? ''));
    } else if (!isEditing) {
      setFormulaInput('');
    }
  }, [activeKey, currentCellData, isEditing]);

  // Focus inline input when editing starts
  useEffect(() => {
    if (isEditing && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [isEditing]);

  // Keyboard Shortcuts (Ctrl+S, Undo, Navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Save Shortcut
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveWorkbookManual();
        return;
      }

      // If user is typing in standard text inputs (outside the grid), ignore
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      if (isInput && activeEl !== inlineInputRef.current && activeEl !== formulaInputRef.current) {
        return;
      }

      // When inline editing
      if (isEditing) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitCellEdit(editValue);
          // Move down
          moveSelection(0, 1);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          commitCellEdit(editValue);
          // Move right
          moveSelection(1, 0);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsEditing(false);
        }
        return;
      }

      // Navigation & Grid Keys when not inline editing
      if (!isEditing && activeSheet) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          moveSelection(0, -1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          moveSelection(0, 1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveSelection(-1, 0);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveSelection(1, 0);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          startEditing();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          moveSelection(e.shiftKey ? -1 : 1, 0);
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          clearSelectedCells();
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Direct typing into cell starts editing
          startEditing(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editValue, selectedCell, activeSheet, saveWorkbookManual]);

  const moveSelection = (dCol: number, dRow: number) => {
    if (!activeSheet) return;
    const maxCol = Math.max(activeSheet.colCount - 1, 0);
    const maxRow = Math.max(activeSheet.rowCount - 1, 0);

    const nextCol = Math.min(Math.max(selectedCell.col + dCol, 0), maxCol);
    const nextRow = Math.min(Math.max(selectedCell.row + dRow, 0), maxRow);

    setSelectedCell({ col: nextCol, row: nextRow });
    setSelectionRange(null);
  };

  const startEditing = (initialVal?: string) => {
    if (!activeSheet) return;
    const current = activeSheet.cells[activeKey];
    const initialText =
      initialVal !== undefined
        ? initialVal
        : current?.formula || (current?.value !== undefined && current?.value !== null ? String(current.value) : '');
    setEditValue(initialText);
    setIsEditing(true);
  };

  const commitCellEdit = (rawInput: string) => {
    if (!activeSheet) return;
    const trimmed = rawInput.trim();

    if (trimmed.startsWith('=')) {
      updateCell(activeSheet.id, activeKey, {
        formula: trimmed,
        value: undefined,
      });
    } else {
      // Check if numeric
      const cleanNum = trimmed.replace(/,/g, '');
      const isNum = trimmed !== '' && !isNaN(Number(cleanNum));

      updateCell(activeSheet.id, activeKey, {
        value: isNum ? Number(cleanNum) : trimmed,
        formula: undefined,
      });
    }

    setIsEditing(false);
  };

  const clearSelectedCells = () => {
    if (!activeSheet) return;
    if (selectionRange) {
      const minCol = Math.min(selectionRange.startCol, selectionRange.endCol);
      const maxCol = Math.max(selectionRange.startCol, selectionRange.endCol);
      const minRow = Math.min(selectionRange.startRow, selectionRange.endRow);
      const maxRow = Math.max(selectionRange.startRow, selectionRange.endRow);

      const updates: Record<string, CellData> = {};
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const key = coordToCellKey(c, r);
          updates[key] = { value: '', formula: undefined };
        }
      }
      updateSheetCells(activeSheet.id, updates);
    } else {
      updateCell(activeSheet.id, activeKey, { value: '', formula: undefined });
    }
  };

  // Styling & Formatting Toolbar Actions
  const applyCellStyle = (styleUpdate: Partial<CellStyle>) => {
    if (!activeSheet) return;
    const targetKeys = getSelectedCellKeys();
    const updates: Record<string, CellData> = {};

    for (const key of targetKeys) {
      const existing = activeSheet.cells[key] || { value: '' };
      updates[key] = {
        ...existing,
        style: {
          ...(existing.style || {}),
          ...styleUpdate,
        },
      };
    }
    updateSheetCells(activeSheet.id, updates);
  };

  const applyCellFormat = (format: CellFormat) => {
    if (!activeSheet) return;
    const targetKeys = getSelectedCellKeys();
    const updates: Record<string, CellData> = {};

    for (const key of targetKeys) {
      const existing = activeSheet.cells[key] || { value: '' };
      updates[key] = {
        ...existing,
        format,
      };
    }
    updateSheetCells(activeSheet.id, updates);
  };

  const getSelectedCellKeys = (): string[] => {
    if (!activeSheet) return [activeKey];
    if (!selectionRange) return [activeKey];

    const minCol = Math.min(selectionRange.startCol, selectionRange.endCol);
    const maxCol = Math.max(selectionRange.startCol, selectionRange.endCol);
    const minRow = Math.min(selectionRange.startRow, selectionRange.endRow);
    const maxRow = Math.max(selectionRange.startRow, selectionRange.endRow);

    const keys: string[] = [];
    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        keys.push(coordToCellKey(c, r));
      }
    }
    return keys.length > 0 ? keys : [activeKey];
  };

  // Insert & Delete Rows / Columns
  const insertRow = (offset: number) => {
    if (!activeSheet) return;
    const targetRow = selectedCell.row + offset;
    const newCells: Record<string, CellData> = {};

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const coord = cellKeyToCoord(key);
      if (!coord) continue;
      if (coord.row >= targetRow) {
        newCells[coordToCellKey(coord.col, coord.row + 1)] = cell;
      } else {
        newCells[key] = cell;
      }
    }

    updateSheetCells(activeSheet.id, newCells);
  };

  const deleteSelectedRow = () => {
    if (!activeSheet) return;
    const targetRow = selectedCell.row;
    const newCells: Record<string, CellData> = {};

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const coord = cellKeyToCoord(key);
      if (!coord) continue;
      if (coord.row === targetRow) {
        // Skip
      } else if (coord.row > targetRow) {
        newCells[coordToCellKey(coord.col, coord.row - 1)] = cell;
      } else {
        newCells[key] = cell;
      }
    }

    updateSheetCells(activeSheet.id, newCells);
  };

  const insertColumn = (offset: number) => {
    if (!activeSheet) return;
    const targetCol = selectedCell.col + offset;
    const newCells: Record<string, CellData> = {};

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const coord = cellKeyToCoord(key);
      if (!coord) continue;
      if (coord.col >= targetCol) {
        newCells[coordToCellKey(coord.col + 1, coord.row)] = cell;
      } else {
        newCells[key] = cell;
      }
    }

    updateSheetCells(activeSheet.id, newCells);
  };

  const deleteSelectedColumn = () => {
    if (!activeSheet) return;
    const targetCol = selectedCell.col;
    const newCells: Record<string, CellData> = {};

    for (const [key, cell] of Object.entries(activeSheet.cells)) {
      const coord = cellKeyToCoord(key);
      if (!coord) continue;
      if (coord.col === targetCol) {
        // Skip
      } else if (coord.col > targetCol) {
        newCells[coordToCellKey(coord.col - 1, coord.row)] = cell;
      } else {
        newCells[key] = cell;
      }
    }

    updateSheetCells(activeSheet.id, newCells);
  };

  // Quick AutoSum
  const handleAutoSum = () => {
    if (!activeSheet) return;
    const col = selectedCell.col;
    const row = selectedCell.row;

    // Look upwards for consecutive numbers
    let startRow = row - 1;
    while (startRow >= 0) {
      const k = coordToCellKey(col, startRow);
      const val = activeSheet.cells[k]?.value;
      if (val === undefined || val === '' || val === null) break;
      startRow--;
    }
    startRow = Math.max(startRow + 1, 0);

    const fromKey = coordToCellKey(col, startRow);
    const toKey = coordToCellKey(col, Math.max(row - 1, 0));
    const formula = `=SUM(${fromKey}:${toKey})`;

    updateCell(activeSheet.id, activeKey, { formula, format: 'currency' });
  };

  // Calculate live statistics on selected cells
  const selectionStats = useMemo(() => {
    if (!activeSheet) return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    const keys = getSelectedCellKeys();
    const numbers: number[] = [];

    for (const k of keys) {
      const computed = getCellComputedValue(k, activeSheet.cells, new Set());
      if (typeof computed === 'number' && !isNaN(computed)) {
        numbers.push(computed);
      } else if (typeof computed === 'string') {
        const clean = computed.replace(/[Rs.,\s$%]/gi, '');
        const num = parseFloat(clean);
        if (!isNaN(num)) numbers.push(num);
      }
    }

    const count = keys.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = numbers.length > 0 ? sum / numbers.length : 0;
    const min = numbers.length > 0 ? Math.min(...numbers) : 0;
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;

    return { count, sum, avg, min, max, hasNumbers: numbers.length > 0 };
  }, [activeSheet, selectionRange, selectedCell, activeKey]);

  // Import File Parser
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportLoading(true);

    try {
      const result = await parseExcelFileToWorkbook(file);
      setImportPreview(result);
    } catch (err: any) {
      alert(`Error parsing Excel file: ${err.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleCommitImport = () => {
    if (!importPreview) return;
    importWorkbook(importPreview.workbook);
    setIsImportModalOpen(false);
    setImportPreview(null);
    setImportFile(null);
  };

  if (!activeWorkbook || !activeSheet) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-amber-200">
        <FileSpreadsheet className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Accounting Workbook Selected</h3>
        <p className="text-sm text-slate-600 mb-4">Create a new spreadsheet or load existing templates.</p>
        <button
          onClick={() => createWorkbook('Business Accounting 2026')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors"
        >
          Initialize Workspace
        </button>
      </div>
    );
  }

  const rowCount = Math.max(activeSheet.rowCount, 25);
  const colCount = Math.max(activeSheet.colCount, 10);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[calc(100vh-140px)] min-h-[600px]'
      }`}
    >
      {/* ── 1. Top Workbook Header & Selector Bar ─────────────────── */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        {/* Left: Workbook Selector & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center shadow-inner">
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <select
                value={activeWorkbookId}
                onChange={(e) => setActiveWorkbookId(e.target.value)}
                className="bg-slate-800 text-white font-bold text-sm px-3 py-1 rounded-md border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {workbooks.map((wb) => (
                  <option key={wb.id} value={wb.id}>
                    {wb.name} ({wb.sheets.length} sheets)
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setRenameWbVal(activeWorkbook.name);
                  setIsRenameWbModalOpen(true);
                }}
                title="Rename Workbook"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => duplicateWorkbook(activeWorkbook.id)}
                title="Duplicate Workbook"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteWorkbook(activeWorkbook.id)}
                title="Delete Workbook"
                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              {activeWorkbook.description || 'Interactive full-control accounting spreadsheet'}
            </p>
          </div>
        </div>

        {/* Center: Real-Time Auto-Save Status */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
          {saveStatus === 'saving' && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-300 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
              </span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">
                Saved at <span className="text-white font-mono">{lastSavedTime}</span>
              </span>
            </>
          )}
          {saveStatus === 'offline' && (
            <>
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-300">Local Cache (Offline)</span>
            </>
          )}
        </div>

        {/* Right: Actions & Modals */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewWbModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Workbook
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" /> Export
          </button>

          <button
            onClick={() => window.print()}
            title="Print Spreadsheet"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700 transition-colors"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={saveWorkbookManual}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold shadow-md hover:shadow transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Now
          </button>
        </div>
      </div>

      {/* ── 2. Spreadsheet Toolbar ───────────────────────────────── */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex flex-wrap items-center gap-2 select-none text-slate-700">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            onClick={() => alert('Undo triggered (Ctrl+Z)')}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Redo triggered (Ctrl+Y)')}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Text Styling: Bold, Italic, Underline */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            onClick={() => applyCellStyle({ bold: !currentCellData?.style?.bold })}
            className={`p-1.5 rounded transition-colors ${
              currentCellData?.style?.bold
                ? 'bg-amber-100 text-amber-900 font-black'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellStyle({ italic: !currentCellData?.style?.italic })}
            className={`p-1.5 rounded transition-colors ${
              currentCellData?.style?.italic
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellStyle({ underline: !currentCellData?.style?.underline })}
            className={`p-1.5 rounded transition-colors ${
              currentCellData?.style?.underline
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            onClick={() => applyCellStyle({ align: 'left' })}
            className={`p-1.5 rounded ${
              currentCellData?.style?.align === 'left' || !currentCellData?.style?.align
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellStyle({ align: 'center' })}
            className={`p-1.5 rounded ${
              currentCellData?.style?.align === 'center'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => applyCellStyle({ align: 'right' })}
            className={`p-1.5 rounded ${
              currentCellData?.style?.align === 'right'
                ? 'bg-slate-100 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* Number Formats */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Format:</span>
          <select
            value={currentCellData?.format || 'general'}
            onChange={(e) => applyCellFormat(e.target.value as CellFormat)}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="general">General</option>
            <option value="number">Number (1,234.00)</option>
            <option value="currency">Currency (Rs. 1,234.00)</option>
            <option value="accounting">Accounting ((Rs. 500))</option>
            <option value="percent">Percentage (15.5%)</option>
            <option value="date">Date (YYYY-MM-DD)</option>
            <option value="text">Plain Text</option>
          </select>
        </div>

        {/* Currency Rs. Quick Button */}
        <button
          onClick={() => applyCellFormat('currency')}
          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs transition-colors"
          title="Format as Currency (Rs. NPR)"
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Rs.
        </button>

        <button
          onClick={() => applyCellFormat('percent')}
          className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs transition-colors"
          title="Format as Percent (%)"
        >
          <Percent className="w-3.5 h-3.5 text-blue-600" /> %
        </button>

        {/* Colors */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1 shadow-2xs">
          <label className="cursor-pointer p-1 rounded hover:bg-slate-100 flex items-center" title="Fill / Background Color">
            <span className="w-3.5 h-3.5 rounded border border-slate-400 bg-amber-200" />
            <input
              type="color"
              className="sr-only"
              onChange={(e) => applyCellStyle({ bgColor: e.target.value })}
            />
          </label>

          <label className="cursor-pointer p-1 rounded hover:bg-slate-100 flex items-center" title="Text Color">
            <span className="w-3.5 h-3.5 rounded border border-slate-400 bg-slate-900" />
            <input
              type="color"
              className="sr-only"
              onChange={(e) => applyCellStyle({ textColor: e.target.value })}
            />
          </label>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        {/* AutoSum & Row/Col manipulation */}
        <button
          onClick={handleAutoSum}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors"
          title="AutoSum Formula"
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-600" /> Σ AutoSum
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => insertRow(1)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Insert Row Below"
          >
            + Row
          </button>
          <button
            onClick={() => insertColumn(1)}
            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Insert Column Right"
          >
            + Col
          </button>
          <button
            onClick={deleteSelectedRow}
            className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Delete Selected Row"
          >
            - Row
          </button>
        </div>

        {/* Cheatsheet / Formula Help */}
        <button
          onClick={() => setIsFormulaHelpOpen(true)}
          className="ml-auto flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded hover:bg-amber-50"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Formula Help
        </button>
      </div>

      {/* ── 3. Formula Bar ────────────────────────────────────────── */}
      <div className="bg-white px-3 py-1.5 border-b border-slate-200 flex items-center gap-2">
        {/* Name Box (Current Cell key) */}
        <div className="w-20 px-2 py-1 bg-slate-100 text-slate-900 font-mono font-bold text-xs rounded border border-slate-300 text-center select-none shadow-inner">
          {activeKey}
        </div>

        <div className="text-slate-400 font-serif italic text-sm font-bold select-none">
          fx
        </div>

        {/* Formula Input */}
        <div className="flex-1 relative">
          <input
            ref={formulaInputRef}
            type="text"
            value={formulaInput}
            onChange={(e) => {
              setFormulaInput(e.target.value);
              setEditValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commitCellEdit(formulaInput);
                moveSelection(0, 1);
              }
            }}
            placeholder="Type value or formula (e.g. =SUM(E2:E10) or =B2*1.13)"
            className="w-full text-xs font-mono text-slate-900 px-3 py-1.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-amber-500 rounded focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* ── 4. Main Spreadsheet Grid Canvas ───────────────────────── */}
      <div
        ref={gridContainerRef}
        className="flex-1 overflow-auto bg-slate-100 relative outline-none select-none"
        tabIndex={0}
      >
        <table className={`border-collapse table-fixed bg-white text-xs ${showGridlines ? '' : 'border-none'}`}>
          {/* Header Row (Column Letters) */}
          <thead>
            <tr className="sticky top-0 z-20 bg-slate-200 text-slate-700 shadow-2xs">
              {/* Corner Cell */}
              <th className="w-12 min-w-12 h-6 bg-slate-300 border border-slate-300 text-[10px] font-mono text-slate-500 text-center cursor-pointer select-none">
                #
              </th>
              {Array.from({ length: colCount }).map((_, c) => {
                const colLetter = colIndexToLetter(c);
                const isColActive = selectedCell.col === c;
                return (
                  <th
                    key={colLetter}
                    className={`w-28 min-w-28 max-w-28 h-6 border border-slate-300 font-mono text-[11px] font-bold text-center select-none transition-colors ${
                      isColActive ? 'bg-amber-200 text-amber-950 font-black' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {colLetter}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body (Rows 1..N) */}
          <tbody>
            {Array.from({ length: rowCount }).map((_, r) => {
              const rowNum = r + 1;
              const isRowActive = selectedCell.row === r;

              return (
                <tr key={rowNum} className="h-7 min-h-7">
                  {/* Row Number Header */}
                  <td
                    className={`w-12 min-w-12 text-center font-mono text-[11px] font-bold border border-slate-300 select-none sticky left-0 z-10 ${
                      isRowActive ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {rowNum}
                  </td>

                  {/* Row Data Cells */}
                  {Array.from({ length: colCount }).map((_, c) => {
                    const cellKey = coordToCellKey(c, r);
                    const cell = activeSheet.cells[cellKey];
                    const isSelected = selectedCell.col === c && selectedCell.row === r;

                    // Calculate computed value
                    const computedVal = getCellComputedValue(cellKey, activeSheet.cells, new Set());
                    const formattedDisplay = formatCellValue(
                      computedVal,
                      cell?.format,
                      settings?.currencySymbol || 'Rs.'
                    );

                    // Dynamic Cell Styles
                    const style = cell?.style || {};
                    const isFormula = cell?.formula && cell.formula.startsWith('=');

                    return (
                      <td
                        key={cellKey}
                        onClick={() => {
                          if (isEditing) {
                            commitCellEdit(editValue);
                          }
                          setSelectedCell({ col: c, row: r });
                          setSelectionRange(null);
                        }}
                        onDoubleClick={() => {
                          setSelectedCell({ col: c, row: r });
                          startEditing();
                        }}
                        style={{
                          backgroundColor: style.bgColor || (isSelected ? '#fef9c3' : undefined),
                          color: style.textColor || undefined,
                          fontWeight: style.bold ? 'bold' : undefined,
                          fontStyle: style.italic ? 'italic' : undefined,
                          textDecoration: style.underline ? 'underline' : undefined,
                          textAlign: style.align || (typeof computedVal === 'number' ? 'right' : 'left'),
                          fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
                        }}
                        className={`w-28 min-w-28 max-w-28 px-2 border border-slate-200 truncate cursor-cell relative ${
                          isSelected ? 'outline-2 outline-amber-500 z-10 shadow-sm font-semibold' : ''
                        }`}
                      >
                        {/* Inline Input when editing active cell */}
                        {isSelected && isEditing ? (
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => commitCellEdit(editValue)}
                            className="absolute inset-0 w-full h-full px-2 font-mono text-xs text-slate-900 bg-white border-2 border-amber-500 focus:outline-none z-30"
                          />
                        ) : (
                          <span
                            className={`${
                              typeof computedVal === 'string' && computedVal.startsWith('#')
                                ? 'text-rose-600 font-bold'
                                : ''
                            }`}
                          >
                            {formattedDisplay}
                          </span>
                        )}

                        {/* Top-left formula triangle indicator */}
                        {isFormula && !isSelected && (
                          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t-2 border-r-2 border-emerald-500" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── 5. Bottom Sheet Tabs Bar ─────────────────────────────── */}
      <div className="bg-slate-100 border-t border-slate-300 px-3 py-1.5 flex items-center justify-between gap-3 text-xs select-none">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {activeWorkbook.sheets.map((sheet) => {
            const isActive = sheet.id === activeSheet.id;
            return (
              <div
                key={sheet.id}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-md font-bold cursor-pointer transition-colors border-t-2 ${
                  isActive
                    ? 'bg-white text-slate-900 border-amber-500 shadow-2xs'
                    : 'bg-slate-200 text-slate-600 border-transparent hover:bg-slate-300'
                }`}
                onClick={() => setActiveSheetId(sheet.id)}
              >
                <Layers className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{sheet.name}</span>

                {/* Sheet Actions Context Menu Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameSheetId(sheet.id);
                    setRenameSheetVal(sheet.name);
                    setIsRenameSheetModalOpen(true);
                  }}
                  title="Rename Sheet"
                  className="opacity-0 group-hover:opacity-100 hover:text-amber-600 transition-opacity"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                {activeWorkbook.sheets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSheet(activeWorkbook.id, sheet.id);
                    }}
                    title="Delete Sheet"
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => addSheetToWorkbook(activeWorkbook.id)}
            title="Add New Worksheet"
            className="p-1.5 bg-slate-200 hover:bg-amber-400 text-slate-700 hover:text-slate-950 rounded-full transition-colors ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Live Calculation Metrics Status Bar */}
        <div className="flex items-center gap-4 text-[11px] text-slate-600 font-mono">
          <span>
            Cell: <strong className="text-slate-900">{activeKey}</strong>
          </span>

          {selectionStats.count > 1 && (
            <span>
              Count: <strong className="text-slate-900">{selectionStats.count}</strong>
            </span>
          )}

          {selectionStats.hasNumbers && (
            <>
              <span>
                Sum:{' '}
                <strong className="text-emerald-700">
                  {settings?.currencySymbol || 'Rs.'} {selectionStats.sum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </span>
              <span>
                Average:{' '}
                <strong className="text-slate-900">
                  {settings?.currencySymbol || 'Rs.'} {selectionStats.avg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </>
          )}

          <div className="h-4 w-px bg-slate-300" />

          <button
            onClick={() => setShowGridlines(!showGridlines)}
            className={`px-2 py-0.5 rounded font-sans font-semibold text-[10px] ${
              showGridlines ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-500'
            }`}
          >
            Gridlines
          </button>
        </div>
      </div>

      {/* ── MODAL: Create New Workbook ───────────────────────────── */}
      {isNewWbModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Create New Workbook</h3>
              </div>
              <button onClick={() => setIsNewWbModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Workbook Name</label>
                <input
                  type="text"
                  value={newWbName}
                  onChange={(e) => setNewWbName(e.target.value)}
                  placeholder="e.g. Hardware Sales Q3 2026"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  value={newWbDesc}
                  onChange={(e) => setNewWbDesc(e.target.value)}
                  placeholder="e.g. Monthly accounting ledger and component procurement rollups"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWbModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newWbName.trim()) return;
                    createWorkbook(newWbName, newWbDesc);
                    setIsNewWbModalOpen(false);
                    setNewWbName('');
                    setNewWbDesc('');
                  }}
                  className="px-4 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm"
                >
                  Create Workbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Rename Workbook ───────────────────────────────── */}
      {isRenameWbModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Rename Workbook</h3>
            <input
              type="text"
              value={renameWbVal}
              onChange={(e) => setRenameWbVal(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-bold mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRenameWbModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (renameWbVal.trim()) {
                    renameWorkbook(activeWorkbook.id, renameWbVal);
                    setIsRenameWbModalOpen(false);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Rename Sheet ──────────────────────────────────── */}
      {isRenameSheetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Rename Worksheet</h3>
            <input
              type="text"
              value={renameSheetVal}
              onChange={(e) => setRenameSheetVal(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-bold mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRenameSheetModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (renameSheetVal.trim()) {
                    renameSheet(activeWorkbook.id, renameSheetId, renameSheetVal);
                    setIsRenameSheetModalOpen(false);
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Import Excel / CSV ────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Import Excel or CSV Spreadsheet</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 p-8 rounded-xl text-center cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-500 mt-1">Supports .xlsx, .xls, and .csv files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </div>

              {importLoading && (
                <div className="text-center py-4 text-sm font-semibold text-slate-600 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  Parsing spreadsheet data...
                </div>
              )}

              {importPreview && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{importPreview.workbook.name}</h4>
                      <p className="text-xs text-slate-500">
                        {importPreview.workbook.sheets.length} Sheets detected • {importPreview.validRows} valid rows
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Ready to Convert
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Sheets included:</p>
                    <div className="flex flex-wrap gap-1">
                      {importPreview.workbook.sheets.map((s) => (
                        <span key={s.id} className="px-2 py-0.5 bg-white border border-slate-300 rounded font-mono text-[11px]">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!importPreview}
                onClick={handleCommitImport}
                className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg shadow-sm"
              >
                Open in Spreadsheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Export Workbook ───────────────────────────────── */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Export Spreadsheet</h3>
              </div>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Download your calculations, formulas, and formatted tables for offline analysis.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  exportWorkbookToExcel(activeWorkbook);
                  setIsExportModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 rounded-xl transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Excel Workbook (.xlsx)</h4>
                    <p className="text-xs text-slate-500">All worksheets with intact formulas</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  exportSheetToCSV(activeSheet);
                  setIsExportModalOpen(false);
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 rounded-xl transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Active Sheet (.csv)</h4>
                    <p className="text-xs text-slate-500">Comma-separated values for database import</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex justify-end pt-4 mt-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Formula Cheatsheet ─────────────────────────────── */}
      {isFormulaHelpOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Supported Spreadsheet Formulas</h3>
              </div>
              <button onClick={() => setIsFormulaHelpOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                <p className="font-bold text-amber-900 mb-1">Standard Arithmetic</p>
                <p className="text-slate-700 font-mono">=A1 + B2</p>
                <p className="text-slate-700 font-mono">=C2 * 1.13 (13% VAT addition)</p>
                <p className="text-slate-700 font-mono">=(D2 - E2) / 12</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900">Aggregate Functions</p>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=SUM(D2:D10)</code>
                  <span className="text-slate-600 ml-2">Adds all numeric values in cell range</span>
                </div>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=AVERAGE(E2:E20)</code>
                  <span className="text-slate-600 ml-2">Computes arithmetic mean</span>
                </div>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=MIN(B2:B15)</code>
                  <span className="text-slate-600 ml-2">Finds lowest value</span>
                </div>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=MAX(B2:B15)</code>
                  <span className="text-slate-600 ml-2">Finds highest value</span>
                </div>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=COUNT(A1:A50)</code>
                  <span className="text-slate-600 ml-2">Counts cells containing numbers</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900">Logical & Math</p>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=IF(D5 &gt;= 0, "Profit", "Loss")</code>
                  <span className="text-slate-600 ml-2">Evaluates condition</span>
                </div>
                <div>
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-900">=ROUND(C2 * 0.13, 2)</code>
                  <span className="text-slate-600 ml-2">Rounds to specified decimal places</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2">
              <button
                onClick={() => setIsFormulaHelpOpen(false)}
                className="px-4 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
