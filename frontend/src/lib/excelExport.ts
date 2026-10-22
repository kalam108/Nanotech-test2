import * as XLSX from 'xlsx';
import { User, SellerProfile, Product, Order, Report, Promotion, Review } from '../types';

export function exportUsersToExcel(users: User[]) {
  const data = users.map(u => ({
    'User ID': u.id,
    'Full Name': u.name,
    'Email Address': u.email,
    'Phone': u.phone || 'N/A',
    'Role': u.role.toUpperCase(),
    'Account Status': u.status,
    'Registration Date': new Date(u.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
  XLSX.writeFile(workbook, `NanoTech_Users_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportSellersToExcel(sellers: SellerProfile[]) {
  const data = sellers.map(s => ({
    'Seller ID': s.id,
    'Store Name': s.storeName,
    'Phone': s.phone,
    'WhatsApp': s.whatsapp || 'N/A',
    'Location': s.location,
    'Verification Status': s.status.toUpperCase(),
    'Average Rating': s.rating,
    'Total Reviews': s.reviewCount,
    'Created Date': new Date(s.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sellers');
  XLSX.writeFile(workbook, `NanoTech_Sellers_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportProductsToExcel(products: Product[]) {
  const data = products.map(p => ({
    'Product ID': p.id,
    'Title': p.title,
    'Category': p.category,
    'Brand': p.brand,
    'Condition': p.condition,
    'Price ($)': p.price,
    'Original Price ($)': p.originalPrice || p.price,
    'Discount (%)': p.discountPercent || 0,
    'Stock': p.stock,
    'Seller': p.sellerName,
    'Location': p.location,
    'Status': p.status.toUpperCase(),
    'Views': p.viewsCount,
    'Clicks': p.clicksCount,
    'Created At': new Date(p.createdAt).toLocaleDateString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
  XLSX.writeFile(workbook, `NanoTech_Products_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportOrdersToExcel(orders: Order[]) {
  const data = orders.map(o => ({
    'Order ID': o.id,
    'Buyer Name': o.buyerName,
    'Buyer Email': o.buyerEmail,
    'Total Items': o.items.reduce((sum, item) => sum + item.quantity, 0),
    'Subtotal ($)': o.subtotal,
    'Delivery Fee ($)': o.deliveryFee,
    'Total Amount ($)': o.total,
    'Payment Method': o.paymentMethod,
    'Order Status': o.status.toUpperCase(),
    'Tracking Number': o.trackingNumber || 'N/A',
    'Order Date': new Date(o.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, `NanoTech_Orders_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportPromotionsToExcel(promotions: Promotion[]) {
  const data = promotions.map(p => ({
    'Promotion ID': p.id,
    'Product Title': p.productTitle,
    'Seller Name': p.sellerName,
    'Type': p.type.replace('_', ' ').toUpperCase(),
    'Budget ($)': p.budget,
    'Start Date': p.startDate,
    'End Date': p.endDate,
    'Status': p.status.toUpperCase(),
    'Impressions': p.impressions,
    'Clicks': p.clicks,
    'Conversions': p.conversions,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Promotions');
  XLSX.writeFile(workbook, `NanoTech_Promotions_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportReportsToExcel(reports: Report[]) {
  const data = reports.map(r => ({
    'Report ID': r.id,
    'Reporter': r.reporterName,
    'Target Type': r.targetType.toUpperCase(),
    'Target Title': r.targetTitle,
    'Reason': r.reason.replace('_', ' ').toUpperCase(),
    'Details': r.details,
    'Status': r.status.toUpperCase(),
    'Report Date': new Date(r.createdAt).toLocaleString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
  XLSX.writeFile(workbook, `NanoTech_Moderation_Reports_${new Date().toISOString().slice(0,10)}.xlsx`);
}
