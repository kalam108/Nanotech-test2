import * as XLSX from 'xlsx';
import { Product, Order, User, SellerProfile } from '../types';
import {
  AccountingExpense,
  AccountingRevenue,
  AccountingTransaction,
  BudgetPlan,
  ActivityAuditLog,
} from '../types/admin';

// Export functions with formatted headers and auto-width
export function exportAdminProductsToExcel(products: Product[], currencySymbol: string = 'Rs.') {
  const data = products.map((p) => ({
    'Product ID': p.id,
    'SKU / Slug': p.slug || p.id.slice(0, 8),
    'Product Name': p.title,
    Category: p.category,
    Brand: p.brand,
    Condition: p.condition,
    [`Price (${currencySymbol})`]: p.price,
    [`Original Price (${currencySymbol})`]: p.originalPrice || p.price,
    'Discount (%)': p.discountPercent || 0,
    'Stock Units': p.stock,
    'Stock Status': p.stock <= 0 ? 'Out of Stock' : p.stock < 5 ? 'Low Stock' : 'In Stock',
    'Seller Name': p.sellerName,
    'Seller ID': p.sellerId,
    Location: p.location,
    'Catalog Status': p.status.toUpperCase(),
    'Featured Status': p.isFeatured ? 'YES' : 'NO',
    'Views Count': p.viewsCount,
    'Clicks Count': p.clicksCount,
    'Created Date': new Date(p.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products_Master');
  XLSX.writeFile(workbook, `Nanotech_Admin_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportAdminOrdersToExcel(orders: Order[], currencySymbol: string = 'Rs.') {
  const data = orders.map((o) => ({
    'Order ID': o.id,
    'Buyer Name': o.buyerName,
    'Buyer Email': o.buyerEmail,
    'Buyer Phone': o.shippingAddress?.phone || 'N/A',
    'Delivery City': o.shippingAddress?.city || 'N/A',
    'Total Items': o.items.reduce((acc, i) => acc + i.quantity, 0),
    [`Subtotal (${currencySymbol})`]: o.subtotal,
    [`Delivery Fee (${currencySymbol})`]: o.deliveryFee,
    [`Grand Total (${currencySymbol})`]: o.total,
    'Payment Method': o.paymentMethod,
    'Order Status': o.status.toUpperCase(),
    'Tracking Number': o.trackingNumber || 'N/A',
    'Order Timestamp': new Date(o.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders_Ledger');
  XLSX.writeFile(workbook, `Nanotech_Admin_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportExpensesToExcel(expenses: AccountingExpense[], currencySymbol: string = 'Rs.') {
  const data = expenses.map((e) => ({
    'Expense ID': e.id,
    'Title / Description': e.title,
    Category: e.category.replace('_', ' ').toUpperCase(),
    [`Amount (${currencySymbol})`]: e.amount,
    Date: e.date,
    Vendor: e.vendor,
    Reference: e.reference || 'N/A',
    Status: e.status.toUpperCase(),
    'Recorded By': e.recordedBy,
    Notes: e.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses_Ledger');
  XLSX.writeFile(workbook, `Nanotech_Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportRevenuesToExcel(revenues: AccountingRevenue[], currencySymbol: string = 'Rs.') {
  const data = revenues.map((r) => ({
    'Revenue ID': r.id,
    'Title / Source': r.title,
    Category: r.category.replace('_', ' ').toUpperCase(),
    [`Amount (${currencySymbol})`]: r.amount,
    Date: r.date,
    Source: r.source,
    'Order Reference': r.orderId || 'N/A',
    'Recorded By': r.recordedBy,
    Notes: r.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue_Ledger');
  XLSX.writeFile(workbook, `Nanotech_Revenues_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportTransactionsToExcel(transactions: AccountingTransaction[], currencySymbol: string = 'Rs.') {
  const data = transactions.map((t) => ({
    'Transaction ID': t.id,
    Date: t.date,
    'Transaction Type': t.type.toUpperCase(),
    Category: t.category,
    Description: t.description,
    [`Amount (${currencySymbol})`]: t.amount,
    Reference: t.reference || 'N/A',
    Status: t.status.toUpperCase(),
    'Payment Method': t.paymentMethod,
    'Recorded By': t.recordedBy,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  XLSX.writeFile(workbook, `Nanotech_Accounting_Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportBudgetsToExcel(budgets: BudgetPlan[], currencySymbol: string = 'Rs.') {
  const data = budgets.map((b) => ({
    'Budget ID': b.id,
    'Department / Budget Name': b.name,
    Category: b.category,
    [`Allocated Budget (${currencySymbol})`]: b.allocatedAmount,
    [`Used Budget (${currencySymbol})`]: b.usedAmount,
    [`Remaining Budget (${currencySymbol})`]: b.allocatedAmount - b.usedAmount,
    'Utilization (%)': Math.round((b.usedAmount / (b.allocatedAmount || 1)) * 100),
    Period: b.period.toUpperCase(),
    Year: b.year,
    'Alert Threshold (%)': b.alertThresholdPercent,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Budget_Allocations');
  XLSX.writeFile(workbook, `Nanotech_Budget_Plan_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportAuditLogsToExcel(logs: ActivityAuditLog[]) {
  const data = logs.map((l) => ({
    'Log ID': l.id,
    Timestamp: new Date(l.timestamp).toLocaleString(),
    'Admin User': l.adminName,
    Role: l.adminRole.toUpperCase(),
    Action: l.action,
    Module: l.module.toUpperCase(),
    'Record Title': l.recordTitle || 'N/A',
    'Details / Changes': l.details,
    Result: l.result.toUpperCase(),
    'IP Address': l.ipAddress || '127.0.0.1',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit_Logs');
  XLSX.writeFile(workbook, `Nanotech_Audit_Logs_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Comprehensive Excel/CSV Parsing and Validation Engine
export interface ExcelImportResult<T> {
  success: boolean;
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: { row: number; column?: string; message: string }[];
  validRecords: T[];
  headers: string[];
  rawRows: any[];
}

export async function parseExcelFile<T>(
  file: File,
  type: 'products' | 'expenses' | 'revenues' | 'inventory'
): Promise<ExcelImportResult<T>> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (!jsonRows || jsonRows.length === 0) {
          resolve({
            success: false,
            totalRows: 0,
            importedCount: 0,
            updatedCount: 0,
            skippedCount: 0,
            errorCount: 1,
            errors: [{ row: 0, message: 'The uploaded Excel file contains no data rows.' }],
            validRecords: [],
            headers: [],
            rawRows: [],
          });
          return;
        }

        const headers = Object.keys(jsonRows[0]);
        const errors: { row: number; column?: string; message: string }[] = [];
        const validRecords: any[] = [];
        let importedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;

        jsonRows.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1
          let hasRowError = false;

          if (type === 'products') {
            const title = row['Product Name'] || row['Title'] || row['title'] || row['Product Title'];
            const price = parseFloat(row['Price'] || row['Price ($)'] || row['Price (Rs.)'] || row['price']);
            const stock = parseInt(row['Stock'] || row['Stock Units'] || row['stock'] || '0', 10);
            const category = row['Category'] || row['category'] || 'Hardware';
            const brand = row['Brand'] || row['brand'] || 'Generic';

            if (!title || String(title).trim().length < 2) {
              errors.push({ row: rowNum, column: 'Product Name', message: 'Product title is required and must be at least 2 characters.' });
              hasRowError = true;
            }
            if (isNaN(price) || price < 0) {
              errors.push({ row: rowNum, column: 'Price', message: 'Price must be a valid positive number.' });
              hasRowError = true;
            }
            if (isNaN(stock) || stock < 0) {
              errors.push({ row: rowNum, column: 'Stock', message: 'Stock must be a non-negative integer.' });
              hasRowError = true;
            }

            if (!hasRowError) {
              validRecords.push({
                id: row['Product ID'] || `prod-import-${Date.now()}-${index}`,
                title: String(title).trim(),
                slug: String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: row['Description'] || `Imported hardware listing for ${title}`,
                price: price,
                originalPrice: price,
                discountPercent: parseFloat(row['Discount (%)'] || '0') || 0,
                condition: (row['Condition'] === 'Used' || row['Condition'] === 'Refurbished') ? row['Condition'] : 'New',
                category: String(category).trim(),
                brand: String(brand).trim(),
                stock: stock,
                images: row['Image URL'] ? [String(row['Image URL'])] : ['https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'],
                specifications: [],
                location: row['Location'] || 'Kathmandu, Nepal',
                deliveryOptions: 'Express Delivery (24-48h)',
                sellerId: 'nanotech-direct',
                sellerName: row['Seller Name'] || 'NanoTech Direct Store',
                sellerRating: 4.9,
                sellerVerified: true,
                status: (row['Status']?.toLowerCase() === 'draft' || row['Status']?.toLowerCase() === 'out_of_stock') ? row['Status'].toLowerCase() : 'published',
                isFeatured: String(row['Featured Status'] || '').toUpperCase() === 'YES',
                viewsCount: parseInt(row['Views'] || '0', 10) || 0,
                clicksCount: parseInt(row['Clicks'] || '0', 10) || 0,
                createdAt: new Date().toISOString(),
              });
              if (row['Product ID']) {
                updatedCount++;
              } else {
                importedCount++;
              }
            } else {
              skippedCount++;
            }
          } else if (type === 'expenses') {
            const title = row['Title / Description'] || row['Title'] || row['Description'] || row['title'];
            const amount = parseFloat(row['Amount'] || row['Amount ($)'] || row['Amount (Rs.)'] || row['amount']);
            const category = row['Category'] || row['category'] || 'operations';
            const vendor = row['Vendor'] || row['vendor'] || 'Supplier';

            if (!title || String(title).trim().length < 2) {
              errors.push({ row: rowNum, column: 'Title', message: 'Expense title is required.' });
              hasRowError = true;
            }
            if (isNaN(amount) || amount <= 0) {
              errors.push({ row: rowNum, column: 'Amount', message: 'Expense amount must be greater than 0.' });
              hasRowError = true;
            }

            if (!hasRowError) {
              validRecords.push({
                id: row['Expense ID'] || `exp-import-${Date.now()}-${index}`,
                title: String(title).trim(),
                category: String(category).toLowerCase().replace(/\s+/g, '_') as any,
                amount: amount,
                date: row['Date'] || new Date().toISOString().slice(0, 10),
                vendor: String(vendor).trim(),
                reference: row['Reference'] || `EX-REF-${Math.floor(1000 + Math.random() * 9000)}`,
                status: (row['Status']?.toLowerCase() === 'pending' || row['Status']?.toLowerCase() === 'approved') ? row['Status'].toLowerCase() : 'paid',
                notes: row['Notes'] || 'Imported via Excel Batch',
                recordedBy: 'Admin (Excel Import)',
              });
              importedCount++;
            } else {
              skippedCount++;
            }
          } else if (type === 'revenues') {
            const title = row['Title / Source'] || row['Title'] || row['Source'] || row['title'];
            const amount = parseFloat(row['Amount'] || row['Amount ($)'] || row['Amount (Rs.)'] || row['amount']);

            if (!title || String(title).trim().length < 2) {
              errors.push({ row: rowNum, column: 'Title', message: 'Revenue title is required.' });
              hasRowError = true;
            }
            if (isNaN(amount) || amount <= 0) {
              errors.push({ row: rowNum, column: 'Amount', message: 'Revenue amount must be greater than 0.' });
              hasRowError = true;
            }

            if (!hasRowError) {
              validRecords.push({
                id: row['Revenue ID'] || `rev-import-${Date.now()}-${index}`,
                title: String(title).trim(),
                category: 'product_sales',
                amount: amount,
                date: row['Date'] || new Date().toISOString().slice(0, 10),
                source: row['Source'] || 'Direct Hardware Sale',
                orderId: row['Order Reference'] || undefined,
                notes: row['Notes'] || 'Imported via Excel Batch',
                recordedBy: 'Admin (Excel Import)',
              });
              importedCount++;
            } else {
              skippedCount++;
            }
          }
        });

        resolve({
          success: errors.length === 0 || validRecords.length > 0,
          totalRows: jsonRows.length,
          importedCount,
          updatedCount,
          skippedCount,
          errorCount: errors.length,
          errors,
          validRecords: validRecords as T[],
          headers,
          rawRows: jsonRows,
        });
      } catch (err: any) {
        resolve({
          success: false,
          totalRows: 0,
          importedCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          errorCount: 1,
          errors: [{ row: 0, message: `Failed to read Excel file: ${err?.message || 'Invalid spreadsheet structure'}` }],
          validRecords: [],
          headers: [],
          rawRows: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        totalRows: 0,
        importedCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [{ row: 0, message: 'File read error occurred.' }],
        validRecords: [],
        headers: [],
        rawRows: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}
