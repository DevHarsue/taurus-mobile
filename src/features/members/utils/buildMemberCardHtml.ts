import { colors } from '@theme/index';
import type { MemberDetail } from '@app-types/member';

const ESCAPE_MAP: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);

function formatLongDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d
        .toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        .toUpperCase()
        .replace(/\./g, '');
}

function deriveExpiresAt(member: MemberDetail): string {
    if (member.currentExpiresAt) return member.currentExpiresAt;
    const future = new Date(Date.now() + member.daysLeft * 86_400_000);
    return future.toISOString();
}

function systemId(memberId: string): string {
    const slice = memberId.replace(/-/g, '').slice(0, 6).toUpperCase();
    return `GT-${slice}`;
}

function statusInfo(member: MemberDetail): {
    label: string;
    dot: string;
    bg: string;
    border: string;
    text: string;
} {
    if (member.subscriptionStatus === 'active') {
        return {
            label: 'MEMBRESÍA ACTIVA',
            dot: '#22c55e',
            bg: '#0a3d18',
            border: '#16a34a',
            text: '#4ade80',
        };
    }
    if (member.subscriptionStatus === 'expired') {
        return {
            label: 'MEMBRESÍA VENCIDA',
            dot: '#ef4444',
            bg: '#3d0a0a',
            border: '#dc2626',
            text: '#fca5a5',
        };
    }
    return {
        label: 'SIN MEMBRESÍA',
        dot: '#a3a3a3',
        bg: '#262626',
        border: '#525252',
        text: '#d4d4d4',
    };
}

const LOGO_SVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" class="logo-svg" aria-hidden="true">
    <circle cx="60" cy="60" r="56" fill="#FFFFFF" stroke="#c9a747" stroke-width="2.5"/>
    <path d="M28 22 C 22 8, 38 4, 50 30 C 42 32, 32 30, 28 22 Z" fill="#930303"/>
    <path d="M92 22 C 98 8, 82 4, 70 30 C 78 32, 88 30, 92 22 Z" fill="#930303"/>
    <text x="60" y="78" text-anchor="middle" font-family="Lexend, sans-serif" font-size="58" font-weight="900" fill="#930303">T</text>
</svg>`;

const CUT_MARK = (x: number, y: number, dir: 'tl' | 'tr' | 'bl' | 'br'): string => {
    const L = 18;
    const off = 6;
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    if (dir === 'tl') {
        lines.push({ x1: x - off - L, y1: y, x2: x - off, y2: y });
        lines.push({ x1: x, y1: y - off - L, x2: x, y2: y - off });
    } else if (dir === 'tr') {
        lines.push({ x1: x + off, y1: y, x2: x + off + L, y2: y });
        lines.push({ x1: x, y1: y - off - L, x2: x, y2: y - off });
    } else if (dir === 'bl') {
        lines.push({ x1: x - off - L, y1: y, x2: x - off, y2: y });
        lines.push({ x1: x, y1: y + off, x2: x, y2: y + off + L });
    } else {
        lines.push({ x1: x + off, y1: y, x2: x + off + L, y2: y });
        lines.push({ x1: x, y1: y + off, x2: x, y2: y + off + L });
    }
    return lines
        .map(
            (l) =>
                `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="#9ca3af" stroke-width="0.6"/>`,
        )
        .join('');
};

export function buildMemberCardHtml(
    member: MemberDetail,
    qrDataUrl: string,
): string {
    const name = escapeHtml(member.name.toUpperCase());
    const cedula = escapeHtml(member.cedula ?? '—');
    const phone = escapeHtml(member.phone ?? '—');
    const email = escapeHtml(member.email ?? '—');
    const planName = escapeHtml(
        (member.currentPlanName ?? 'Membresía Estándar').toUpperCase(),
    );
    const expiresAtIso = deriveExpiresAt(member);
    const issued = formatLongDate(new Date().toISOString());
    const expires = formatLongDate(expiresAtIso);
    const sysId = systemId(member.id);
    const status = statusInfo(member);
    const red = colors.primaryRed;
    const redDark = colors.primaryDark;
    const gold = '#c9a747';
    const black = '#0a0000';

    const CARD_W = 700;
    const CARD_H = 441;
    const CARD_X = (794 - CARD_W) / 2;
    const CARD_Y = (1123 - CARD_H) / 2;

    const cutMarks = [
        CUT_MARK(CARD_X, CARD_Y, 'tl'),
        CUT_MARK(CARD_X + CARD_W, CARD_Y, 'tr'),
        CUT_MARK(CARD_X, CARD_Y + CARD_H, 'bl'),
        CUT_MARK(CARD_X + CARD_W, CARD_Y + CARD_H, 'br'),
    ].join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=794, initial-scale=1.0" />
<title>Carnet · ${name}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lexend:wght@400;600;700;800;900&display=swap');

    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
        width: 794px;
        height: 1123px;
        background: #ffffff;
        font-family: 'Inter', sans-serif;
        color: ${black};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .sheet {
        position: relative;
        width: 794px;
        height: 1123px;
        background: #ffffff;
    }

    .cut-marks {
        position: absolute;
        top: 0; left: 0;
        width: 794px;
        height: 1123px;
        pointer-events: none;
    }

    .card {
        position: absolute;
        top: ${CARD_Y}px;
        left: ${CARD_X}px;
        width: ${CARD_W}px;
        height: ${CARD_H}px;
        overflow: hidden;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 0 0 0.5px #e5e7eb;
    }

    .header {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 106px;
        background: linear-gradient(180deg, ${redDark} 0%, ${red} 50%, #3d0000 100%);
        overflow: hidden;
    }

    .accent-diag {
        position: absolute;
        top: -24px;
        width: 6px;
        height: 180px;
        background: ${gold};
        transform: rotate(-25deg);
        transform-origin: top center;
    }
    .accent-diag.a { right: 178px; opacity: 0.75; }
    .accent-diag.b { right: 152px; opacity: 0.45; width: 3px; }

    .logo-row {
        position: absolute;
        top: 22px;
        left: 28px;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .logo-svg { width: 60px; height: 60px; flex-shrink: 0; }

    .brand-block { display: flex; flex-direction: column; gap: 2px; }
    .brand-name {
        font-family: 'Lexend', sans-serif;
        font-size: 32px; font-weight: 800; line-height: 1;
        letter-spacing: 4px; color: #ffffff;
    }
    .brand-sub {
        font-family: 'Inter', sans-serif;
        font-size: 8.5px; font-weight: 600;
        letter-spacing: 2.5px; color: ${gold};
    }

    .serial-box {
        position: absolute;
        top: 28px; right: 24px;
        padding: 8px 12px;
        background: rgba(0,0,0,0.32);
        border-radius: 6px;
        text-align: right;
        display: flex; flex-direction: column; gap: 2px;
        min-width: 120px;
    }
    .serial-label {
        font-family: 'Inter', sans-serif;
        font-size: 7px; font-weight: 700;
        letter-spacing: 1.8px; color: ${gold};
    }
    .serial-value {
        font-family: 'Lexend', sans-serif;
        font-size: 16px; font-weight: 700;
        letter-spacing: 1px; color: #ffffff;
    }

    .body {
        position: absolute;
        top: 106px; left: 0;
        width: 100%;
        height: ${CARD_H - 106 - 30}px;
        padding: 18px 26px 0 26px;
        display: flex;
        gap: 22px;
    }

    .body-left { flex: 1; display: flex; flex-direction: column; }

    .label {
        font-family: 'Inter', sans-serif;
        font-size: 7.5px; font-weight: 700;
        letter-spacing: 2px; color: #6b7280;
        margin-bottom: 3px;
    }
    .value {
        font-family: 'Lexend', sans-serif;
        font-size: 13px; font-weight: 700;
        color: ${black}; line-height: 1.1;
    }

    .name-block { margin-bottom: 2px; }
    .name-block .label { font-size: 8px; letter-spacing: 2.5px; }
    .name-block .name {
        font-family: 'Lexend', sans-serif;
        font-size: 20px; font-weight: 800;
        line-height: 1.05; color: ${black};
        letter-spacing: 0.2px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .divider {
        height: 1px;
        background: linear-gradient(90deg, #d4d4d8 0%, #f4f4f5 100%);
        margin: 8px 0 8px 0;
    }

    .grid-2 {
        display: flex;
        gap: 22px;
        margin-bottom: 7px;
    }
    .grid-2 > div { flex: 1; min-width: 0; }
    .grid-2 .value {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .plan-row .value { color: ${red}; font-size: 14px; }

    .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
        padding: 6px 14px;
        border-radius: 999px;
        background: ${status.bg};
        border: 1px solid ${status.border};
        align-self: flex-start;
    }
    .status-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: ${status.dot};
    }
    .status-label {
        font-family: 'Inter', sans-serif;
        font-size: 9px; font-weight: 700;
        letter-spacing: 1.5px; color: ${status.text};
    }

    .body-right {
        width: 156px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }
    .qr-box {
        width: 150px; height: 150px;
        padding: 6px;
        background: #ffffff;
        border: 1.5px solid ${red};
        border-radius: 8px;
    }
    .qr-box img {
        width: 100%; height: 100%;
        display: block;
        image-rendering: pixelated;
    }
    .qr-caption {
        font-family: 'Inter', sans-serif;
        font-size: 7.5px; font-weight: 700;
        letter-spacing: 1.5px; color: #6b7280;
        margin-top: 2px;
    }
    .qr-subcap {
        font-family: 'Lexend', sans-serif;
        font-size: 8.5px; font-weight: 600;
        color: ${black}; letter-spacing: 0.5px;
    }

    .foot {
        position: absolute;
        bottom: 0; left: 0;
        width: 100%;
        height: 30px;
        background: ${black};
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .foot-text {
        font-family: 'Inter', sans-serif;
        font-size: 8.5px; font-weight: 700;
        letter-spacing: 3px; color: ${gold};
    }
</style>
</head>
<body>
<div class="sheet">

    <svg class="cut-marks" viewBox="0 0 794 1123">${cutMarks}</svg>

    <div class="card">
        <div class="header">
            <div class="accent-diag a"></div>
            <div class="accent-diag b"></div>
            <div class="logo-row">
                ${LOGO_SVG}
                <div class="brand-block">
                    <div class="brand-name">TAURUS</div>
                    <div class="brand-sub">GYM · ACREDITACIÓN OFICIAL</div>
                </div>
            </div>
            <div class="serial-box">
                <span class="serial-label">Nº DE MIEMBRO</span>
                <span class="serial-value">${sysId}</span>
            </div>
        </div>

        <div class="body">
            <div class="body-left">
                <div class="name-block">
                    <div class="label">MIEMBRO</div>
                    <div class="name">${name}</div>
                </div>
                <div class="divider"></div>

                <div class="grid-2">
                    <div>
                        <div class="label">DOCUMENTO</div>
                        <div class="value">${cedula}</div>
                    </div>
                    <div>
                        <div class="label">EMITIDO</div>
                        <div class="value">${issued}</div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="plan-row">
                        <div class="label">PLAN</div>
                        <div class="value">${planName}</div>
                    </div>
                    <div>
                        <div class="label">VENCE</div>
                        <div class="value">${expires}</div>
                    </div>
                </div>

                <div class="grid-2">
                    <div>
                        <div class="label">TELÉFONO</div>
                        <div class="value">${phone}</div>
                    </div>
                    <div>
                        <div class="label">EMAIL</div>
                        <div class="value">${email}</div>
                    </div>
                </div>

                <div class="status-pill">
                    <span class="status-dot"></span>
                    <span class="status-label">${status.label}</span>
                </div>
            </div>

            <div class="body-right">
                <div class="qr-box"><img src="${qrDataUrl}" alt="QR" /></div>
                <div class="qr-caption">ESCANEA PARA VERIFICAR</div>
                <div class="qr-subcap">${sysId}</div>
            </div>
        </div>

        <div class="foot">
            <span class="foot-text">GYMTAURUS · ACREDITACIÓN OFICIAL · ${sysId}</span>
        </div>
    </div>

</div>
</body>
</html>`;
}
