import { colors } from '@theme/index';
import { escapeHtml, formatReportDateTime } from './pdfFormat';

/**
 * Layout HTML base para reportes PDF multi-pagina A4 con la marca Taurus.
 *
 * Limitacion conocida: en iOS, `Print.printToFileAsync` tiene soporte parcial
 * de `page-break-inside: avoid`, `display: table-header-group` y del contador
 * de paginas CSS (`counter(page)`); el contenido pagina correctamente pero el
 * encabezado repetido y el "Pagina N" del pie pueden no aparecer. En web y
 * Android (Chromium) funcionan.
 */

export interface ReportColumn<T> {
  header: string;
  render: (row: T) => string;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface ReportShellOptions {
  /** Titulo del reporte, p.ej. "Reporte de Auditoría". */
  title: string;
  /** Filtros aplicados, p.ej. "Operación: Modificados · Tabla: Miembros". */
  subtitle?: string;
  /** Nota bajo el header, p.ej. "Mostrando los primeros 500 de 1.234 registros". */
  meta?: string;
  /** Contenido del reporte (tablas y secciones ya renderizadas). */
  bodyHtml: string;
}

const LOGO_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="logo-svg" aria-hidden="true">
    <circle cx="60" cy="60" r="56" fill="#FFFFFF" stroke="#c9a747" stroke-width="2.5"/>
    <path d="M28 22 C 22 8, 38 4, 50 30 C 42 32, 32 30, 28 22 Z" fill="#930303"/>
    <path d="M92 22 C 98 8, 82 4, 70 30 C 78 32, 88 30, 92 22 Z" fill="#930303"/>
    <text x="60" y="78" text-anchor="middle" font-family="Lexend, sans-serif" font-size="58" font-weight="900" fill="#930303">T</text>
</svg>`;

const GOLD = '#c9a747';

/** Renderiza una tabla de reporte a partir de filas y columnas declarativas. */
export function renderTable<T>(rows: T[], columns: ReportColumn<T>[]): string {
  const head = columns
    .map(
      (c) =>
        `<th style="text-align:${c.align ?? 'left'};${c.width ? `width:${c.width};` : ''}">${escapeHtml(c.header)}</th>`,
    )
    .join('');
  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map(
            (c) => `<td style="text-align:${c.align ?? 'left'};">${c.render(row)}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('\n');
  return `<table class="report-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** Bloque de seccion con titulo opcional. */
export function renderSection(title: string, innerHtml: string): string {
  return `<section class="report-section">
    <h2 class="section-title">${escapeHtml(title)}</h2>
    ${innerHtml}
  </section>`;
}

export function reportShell(opts: ReportShellOptions): string {
  const title = escapeHtml(opts.title);
  const subtitle = opts.subtitle ? escapeHtml(opts.subtitle) : '';
  const meta = opts.meta ? escapeHtml(opts.meta) : '';
  const generatedAt = formatReportDateTime(new Date().toISOString());
  const red = colors.primaryRed;
  const redDark = colors.primaryDark;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${title} · Taurus Gym</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lexend:wght@400;600;700;800;900&display=swap');

    @page { size: A4 portrait; margin: 14mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
        background: #ffffff;
        font-family: 'Inter', sans-serif;
        color: #1a1c1c;
        font-size: 11px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .brand-band {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 18px;
        border-radius: 10px;
        background: linear-gradient(135deg, ${redDark} 0%, ${red} 60%, #3d0000 100%);
        margin-bottom: 6px;
    }
    .brand-left { display: flex; align-items: center; gap: 12px; }
    .logo-svg { width: 44px; height: 44px; flex-shrink: 0; }
    .brand-text { display: flex; flex-direction: column; gap: 2px; }
    .brand-name {
        font-family: 'Lexend', sans-serif;
        font-size: 19px; font-weight: 800; line-height: 1;
        letter-spacing: 3px; color: #ffffff;
    }
    .report-title {
        font-family: 'Inter', sans-serif;
        font-size: 10px; font-weight: 600;
        letter-spacing: 2px; color: ${GOLD};
        text-transform: uppercase;
    }
    .brand-right { text-align: right; display: flex; flex-direction: column; gap: 2px; }
    .generated-label {
        font-size: 7.5px; font-weight: 700;
        letter-spacing: 1.5px; color: ${GOLD};
        text-transform: uppercase;
    }
    .generated-value {
        font-family: 'Lexend', sans-serif;
        font-size: 11px; font-weight: 600; color: #ffffff;
    }

    .report-subtitle {
        font-size: 10px; font-weight: 600;
        color: #6b7280;
        padding: 2px 4px;
    }
    .report-meta {
        font-size: 9px; font-weight: 600;
        color: #92400e;
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 6px;
        padding: 5px 10px;
        margin-top: 4px;
        display: inline-block;
    }

    .report-body { margin-top: 12px; }

    .report-section { margin-bottom: 16px; }
    .section-title {
        font-family: 'Lexend', sans-serif;
        font-size: 12px; font-weight: 800;
        color: ${red};
        letter-spacing: 1px;
        text-transform: uppercase;
        border-bottom: 2px solid ${red};
        padding-bottom: 4px;
        margin-bottom: 8px;
    }

    table.report-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 8px;
    }
    table.report-table thead { display: table-header-group; }
    table.report-table th {
        background: ${red};
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-size: 8.5px; font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        padding: 7px 8px;
    }
    table.report-table td {
        font-size: 10px;
        padding: 6px 8px;
        border-bottom: 1px solid #e5e7eb;
        vertical-align: top;
        word-break: break-word;
    }
    table.report-table tr { page-break-inside: avoid; }
    table.report-table tbody tr:nth-child(even) { background: #f7f7f8; }

    .badge {
        display: inline-block;
        padding: 2px 9px;
        border-radius: 999px;
        font-size: 8.5px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        white-space: nowrap;
    }
    .badge-active  { background: #e7f5ea; color: #2a7a3a; border: 1px solid #2a7a3a; }
    .badge-expired { background: #fde8e8; color: #dc2626; border: 1px solid #dc2626; }
    .badge-neutral { background: #f1f1f2; color: #52525b; border: 1px solid #a1a1aa; }
    .badge-warning { background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; }

    .report-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 8px; font-weight: 600;
        letter-spacing: 1.5px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
        padding-top: 4px;
        text-transform: uppercase;
    }
    .report-footer .page-counter::after { content: 'Página ' counter(page); }

    .muted { color: #6b7280; }
</style>
</head>
<body>
<header class="brand-band">
    <div class="brand-left">
        ${LOGO_SVG}
        <div class="brand-text">
            <div class="brand-name">TAURUS GYM</div>
            <div class="report-title">${title}</div>
        </div>
    </div>
    <div class="brand-right">
        <span class="generated-label">Generado</span>
        <span class="generated-value">${generatedAt}</span>
    </div>
</header>
${subtitle ? `<div class="report-subtitle">${subtitle}</div>` : ''}
${meta ? `<div class="report-meta">${meta}</div>` : ''}

<main class="report-body">
${opts.bodyHtml}
</main>

<footer class="report-footer">
    <span>TAURUS GYM · ${title}</span>
    <span class="page-counter"></span>
</footer>
</body>
</html>`;
}
