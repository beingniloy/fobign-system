import jsPDF from 'jspdf';
import { Billing } from './types';

export function generateReceiptPdf(
  invoice: Billing,
  address?: {
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    city_province_postal?: string;
    country_region?: string;
  }
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 20;

  // 1. Top Left Title: "Receipt"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(17, 24, 39); // #111827
  doc.text('Receipt', margin, 28);

  // 2. Top Right: SVG Fobign Emblem + Wordmark
  const logoX = 152;
  const logoY = 18;

  // Draw Isometric Emblem
  doc.setFillColor(15, 23, 42); // slate-900
  // Top facet
  doc.triangle(logoX + 4.5, logoY + 1, logoX + 8, logoY + 3.2, logoX + 4.5, logoY + 5.5, 'F');
  doc.triangle(logoX + 4.5, logoY + 1, logoX + 1, logoY + 3.2, logoX + 4.5, logoY + 5.5, 'F');

  // Left facet
  doc.setFillColor(51, 65, 85); // slate-700
  doc.triangle(logoX + 1, logoY + 3.8, logoX + 4.5, logoY + 6, logoX + 1, logoY + 9.5, 'F');
  doc.triangle(logoX + 4.5, logoY + 6, logoX + 4.5, logoY + 9.5, logoX + 1, logoY + 9.5, 'F');

  // Right facet
  doc.setFillColor(100, 116, 139); // slate-500
  doc.triangle(logoX + 5, logoY + 6, logoX + 8, logoY + 3.8, logoX + 8, logoY + 9.5, 'F');
  doc.triangle(logoX + 5, logoY + 6, logoX + 8, logoY + 9.5, logoX + 5, logoY + 9.5, 'F');

  // Wordmark "fobign"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('fobign', logoX + 11, logoY + 8);

  // 3. Metadata block below title
  let y = 42;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99); // #4b5563

  doc.text('Payment number', margin, y);
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.invoice_no, margin + 35, y);

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('Receipt number', margin, y);
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.trx_id || invoice.id, margin + 35, y);

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('Date paid', margin, y);
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.created_at, margin + 35, y);

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('Payment method', margin, y);
  doc.setTextColor(17, 24, 39);
  doc.text(invoice.payment_method || 'Card', margin + 35, y);

  // 4. Two Columns: Fobign (Left) and Bill to (Right)
  y += 14;
  const colRight = 105;

  // Left Column (Fobign)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Fobign', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  let leftY = y + 4.5;
  doc.text('Unified AI Gateway Infrastructure', margin, leftY);
  leftY += 4;
  doc.text('12F, Galaxy International Building', margin, leftY);
  leftY += 4;
  doc.text('Dhaka, Bangladesh', margin, leftY);
  leftY += 4;
  doc.text('api-service@fobign.com', margin, leftY);

  // Right Column (Bill to)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Bill to', colRight, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);

  const fullName = address?.full_name || invoice.billing_address?.full_name || 'Valued Developer';
  const line1 = address?.address_line1 || invoice.billing_address?.address_line1 || 'Account ID: ' + invoice.user_id;
  const line2 = address?.address_line2 || invoice.billing_address?.address_line2 || '';
  const city = address?.city_province_postal || invoice.billing_address?.city_province_postal || 'Dhaka';
  const country = address?.country_region || invoice.billing_address?.country_region || 'Bangladesh';

  let rightY = y + 4.5;
  doc.text(fullName, colRight, rightY);
  rightY += 4;
  doc.text(line1, colRight, rightY);
  if (line2) {
    rightY += 4;
    doc.text(line2, colRight, rightY);
  }
  rightY += 4;
  doc.text(city, colRight, rightY);
  rightY += 4;
  doc.text(country, colRight, rightY);

  // 5. Large Paid Amount Announcement
  y = Math.max(leftY, rightY) + 12;
  const amountFormatted =
    invoice.currency === 'BDT'
      ? `৳${invoice.amount.toFixed(2)}`
      : `$${invoice.amount.toFixed(2)}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(`${amountFormatted} paid on ${invoice.created_at.split(' ')[0]}`, margin, y);

  // 6. Items Table Header
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Description', margin, y);
  doc.text('Quantity', 115, y, { align: 'center' });
  doc.text('Unit Price', 145, y, { align: 'right' });
  doc.text('Tax', 168, y, { align: 'right' });
  doc.text('Amount', 190, y, { align: 'right' });

  // Divider
  y += 3;
  doc.setDrawColor(156, 163, 175); // gray-400
  doc.setLineWidth(0.4);
  doc.line(margin, y, 190, y);

  // Table Row
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text('Fobign API tokens', margin, y);
  doc.text('1', 115, y, { align: 'center' });
  doc.text(amountFormatted, 145, y, { align: 'right' });
  doc.text('0%', 168, y, { align: 'right' });
  doc.text(amountFormatted, 190, y, { align: 'right' });

  // Divider
  y += 5;
  doc.setDrawColor(229, 231, 235); // gray-200
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);

  // 7. Totals Block (Right Aligned)
  y += 10;
  const totalLabelX = 150;
  const totalValueX = 190;

  doc.setFontSize(8.5);
  doc.setTextColor(75, 85, 99);
  doc.text('Subtotal', totalLabelX, y);
  doc.setTextColor(17, 24, 39);
  doc.text(amountFormatted, totalValueX, y, { align: 'right' });

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('Total excluding tax', totalLabelX, y);
  doc.setTextColor(17, 24, 39);
  doc.text(amountFormatted, totalValueX, y, { align: 'right' });

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('VAT (0%)', totalLabelX, y);
  doc.setTextColor(17, 24, 39);
  doc.text('$0.00', totalValueX, y, { align: 'right' });

  y += 4;
  doc.setDrawColor(229, 231, 235);
  doc.line(totalLabelX - 5, y, 190, y);

  y += 5.5;
  doc.setTextColor(75, 85, 99);
  doc.text('Total', totalLabelX, y);
  doc.setTextColor(17, 24, 39);
  doc.text(amountFormatted, totalValueX, y, { align: 'right' });

  y += 4;
  doc.setDrawColor(17, 24, 39);
  doc.setLineWidth(0.4);
  doc.line(totalLabelX - 5, y, 190, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(17, 24, 39);
  doc.text('Amount paid', totalLabelX, y);
  doc.text(amountFormatted, totalValueX, y, { align: 'right' });

  // Save with EXACT required filename: receipt_[invoice_no].pdf
  doc.save(`receipt_${invoice.invoice_no}.pdf`);
}
