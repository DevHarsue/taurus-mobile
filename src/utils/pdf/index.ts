export { sharePdf, type ISharePdfOptions } from './sharePdf';
export {
  escapeHtml,
  formatReportDate,
  formatReportDateTime,
  formatCurrencyReport,
  todayStamp,
  statusBadge,
  type BadgeVariant,
} from './pdfFormat';
export {
  reportShell,
  renderTable,
  renderSection,
  type ReportColumn,
  type ReportShellOptions,
} from './reportShell';
export {
  drainPaginated,
  drainOffset,
  PDF_MAX_RECORDS,
  ReportEmptyError,
  type DrainResult,
} from './fetchAllPages';
