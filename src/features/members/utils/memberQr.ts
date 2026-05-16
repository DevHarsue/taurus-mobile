export const MEMBER_QR_BASE_URL = 'https://gymtaurus.com/verify';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function buildMemberQrPayload(memberId: string): string {
    return `${MEMBER_QR_BASE_URL}/${memberId}`;
}

export function parseMemberIdFromQr(raw: string): string | null {
    if (!raw) return null;
    const trimmed = raw.trim();

    const urlMatch = trimmed.match(/\/verify\/([0-9a-f-]{20,})/i);
    if (urlMatch && UUID_REGEX.test(urlMatch[1])) {
        return urlMatch[1].toLowerCase();
    }

    if (UUID_REGEX.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    return null;
}
