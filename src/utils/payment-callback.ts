/**
 * Parses payment gateway redirects (ported from the TDCP mobile app).
 * Gateways sometimes emit malformed query strings and nested redirectUrl values.
 */

export type ParsedPaymentCallback = {
  orderIds: string[];
  status?: string;
  transactionId?: string;
  resultIndicator?: string;
  amount?: string;
  currency?: string;
};

const APP_PAYMENT_ORDER_ID =
  /^(jeeprally|chairlift|chair|sightseeing|boating|train|fleet|hotel|resort)[-_]/i;

export function unwrapNestedPaymentRedirectUrl(rawUrl: string): string {
  try {
    let nested = new URL(rawUrl).searchParams.get("redirectUrl");
    if (!nested?.trim()) return rawUrl;
    nested = nested.trim();
    if (!nested.toLowerCase().includes("payment-callback")) return rawUrl;
    try {
      nested = decodeURIComponent(nested);
    } catch {
      /* keep */
    }
    return nested;
  } catch {
    return rawUrl;
  }
}

function collectPaymentCallbackQueryStrings(rawUrl: string): string[] {
  const lower = rawUrl.toLowerCase();
  const out: string[] = [];
  let pos = 0;
  while (true) {
    const idx = lower.indexOf("payment-callback", pos);
    if (idx < 0) break;
    const after = rawUrl.slice(idx + "payment-callback".length);
    const qIndex = after.indexOf("?");
    const rawQuery = qIndex >= 0 ? after.slice(qIndex + 1) : "";
    const norm = rawQuery.replace(/\?/g, "&").replace(/&amp;/gi, "&");
    if (norm.length > 0) out.push(norm);
    pos = idx + 1;
  }
  return out;
}

function parsedFromNormalizedQuery(norm: string): ParsedPaymentCallback {
  const sp = new URLSearchParams(norm);
  const orderIds = [
    ...sp.getAll("orderId"),
    ...sp.getAll("orderid"),
  ].filter((s) => s.length > 0);
  return {
    orderIds,
    status: sp.get("status") ?? sp.get("Status") ?? undefined,
    transactionId:
      sp.get("transactionId") ?? sp.get("transactionid") ?? undefined,
    resultIndicator:
      sp.get("resultIndicator") ?? sp.get("resultindicator") ?? undefined,
    amount: sp.get("amount") ?? sp.get("Amount") ?? undefined,
    currency: sp.get("currency") ?? sp.get("Currency") ?? undefined,
  };
}

function scoreParsedCandidate(p: ParsedPaymentCallback): number {
  let s = 0;
  if (p.status) s += 100;
  s += p.orderIds.length * 10;
  if (p.transactionId) s += 5;
  if (p.resultIndicator) s += 2;
  if (p.orderIds.some((id) => APP_PAYMENT_ORDER_ID.test(id.trim()))) s += 5;
  return s;
}

function endsCurrentQueryValue(haystack: string, j: number): boolean {
  if (j >= haystack.length) return true;
  const ch = haystack[j];
  if (ch === "&" || ch === "#") return true;
  if (ch === "?") {
    const rest = haystack.slice(j + 1).toLowerCase();
    return (
      rest.startsWith("status=") ||
      rest.startsWith("orderid=") ||
      rest.startsWith("transactionid=") ||
      rest.startsWith("resultindicator=") ||
      rest.startsWith("amount=") ||
      rest.startsWith("currency=")
    );
  }
  return false;
}

function extractQueryKeyLoose(haystack: string, key: string): string[] {
  const needle = `${key}=`;
  const lower = haystack.toLowerCase();
  const nl = needle.toLowerCase();
  const out: string[] = [];
  let pos = 0;
  while (pos < haystack.length) {
    const i = lower.indexOf(nl, pos);
    if (i < 0) break;
    const start = i + needle.length;
    let j = start;
    while (j < haystack.length && !endsCurrentQueryValue(haystack, j)) j += 1;
    const value = haystack.slice(start, j);
    if (value) {
      try {
        out.push(decodeURIComponent(value));
      } catch {
        out.push(value);
      }
    }
    pos = j + 1;
  }
  return out;
}

function mergeLooseUrlQueryScan(
  rawUrl: string,
  base: ParsedPaymentCallback,
): ParsedPaymentCallback {
  const orderIds = [
    ...base.orderIds,
    ...extractQueryKeyLoose(rawUrl, "orderId"),
    ...extractQueryKeyLoose(rawUrl, "orderid"),
  ];
  const unique = [...new Set(orderIds.filter(Boolean))];
  return {
    orderIds: unique,
    status:
      base.status ??
      extractQueryKeyLoose(rawUrl, "status")[0] ??
      extractQueryKeyLoose(rawUrl, "Status")[0],
    transactionId:
      base.transactionId ??
      extractQueryKeyLoose(rawUrl, "transactionId")[0] ??
      extractQueryKeyLoose(rawUrl, "transactionid")[0],
    resultIndicator:
      base.resultIndicator ??
      extractQueryKeyLoose(rawUrl, "resultIndicator")[0] ??
      extractQueryKeyLoose(rawUrl, "resultindicator")[0],
    amount:
      base.amount ??
      extractQueryKeyLoose(rawUrl, "amount")[0] ??
      extractQueryKeyLoose(rawUrl, "Amount")[0],
    currency:
      base.currency ??
      extractQueryKeyLoose(rawUrl, "currency")[0] ??
      extractQueryKeyLoose(rawUrl, "Currency")[0],
  };
}

export function parsePaymentCallbackParams(rawUrl: string): ParsedPaymentCallback {
  const targetUrl = unwrapNestedPaymentRedirectUrl(rawUrl);
  const queryStrings = collectPaymentCallbackQueryStrings(rawUrl);
  if (queryStrings.length === 0) {
    try {
      const u = new URL(targetUrl);
      queryStrings.push(u.search.replace(/^\?/, "").replace(/\?/g, "&"));
    } catch {
      /* ignore */
    }
  }

  let bestScore = -1;
  let result: ParsedPaymentCallback = { orderIds: [] };
  for (const qs of queryStrings) {
    const p = parsedFromNormalizedQuery(qs);
    const sc = scoreParsedCandidate(p);
    if (sc > bestScore) {
      bestScore = sc;
      result = p;
    }
  }

  result = mergeLooseUrlQueryScan(rawUrl, result);
  result = mergeLooseUrlQueryScan(targetUrl, result);
  return result;
}

export function orderIdMatchesCallback(
  expectedOrderId: string,
  parsed: ParsedPaymentCallback,
): boolean {
  const exp = expectedOrderId.trim().toLowerCase();
  if (!exp) return false;
  return parsed.orderIds.some((id) => id.toLowerCase() === exp);
}

export function isGatewayCallbackSuccessStatus(
  parsed: ParsedPaymentCallback,
): boolean {
  if (!parsed.status) return false;
  const s = parsed.status.toLowerCase();
  return s === "success" || s === "paid" || s === "approved";
}

export function isGatewayCallbackFailureStatus(
  parsed: ParsedPaymentCallback,
): boolean {
  if (!parsed.status) return false;
  const s = parsed.status.toLowerCase();
  return (
    s === "failed" ||
    s === "fail" ||
    s === "declined" ||
    s === "cancel" ||
    s === "cancelled" ||
    s === "canceled"
  );
}

export function gatewaySuccessAppliesToOrder(
  expectedOrderId: string,
  parsed: ParsedPaymentCallback,
): boolean {
  const ri = parsed.resultIndicator?.trim();
  if (ri) {
    if (!expectedOrderId.trim()) return false;
    if (orderIdMatchesCallback(expectedOrderId, parsed)) return true;
    if (parsed.orderIds.some((id) => APP_PAYMENT_ORDER_ID.test(id.trim()))) {
      return true;
    }
  }
  if (!isGatewayCallbackSuccessStatus(parsed)) return false;
  if (!expectedOrderId.trim()) return true;
  if (orderIdMatchesCallback(expectedOrderId, parsed)) return true;
  if (parsed.orderIds.length === 0) return true;
  return parsed.orderIds.some((id) => APP_PAYMENT_ORDER_ID.test(id.trim()));
}

export function isPaymentSuccessUrl(rawUrl: string, expectedOrderId: string): boolean {
  const lower = rawUrl.toLowerCase();
  const orderLower = expectedOrderId.toLowerCase();
  const successPatterns = [
    "payment-success",
    "payment_success",
    "status=success",
    "status=paid",
    "paid=true",
    "paymentstatus=success",
    "transactionstatus=success",
    "resultindicator=",
  ];
  if (!successPatterns.some((p) => lower.includes(p))) return false;
  return lower.includes(orderLower) || lower.includes("payment-success");
}

export function isPaymentFailureUrl(rawUrl: string, expectedOrderId: string): boolean {
  const lower = rawUrl.toLowerCase();
  const orderLower = expectedOrderId.toLowerCase();
  const failurePatterns = [
    "payment-failed",
    "payment_failed",
    "status=failed",
    "status=declined",
    "declined",
    "cancel",
    "canceled",
    "paymentstatus=failed",
    "transactionstatus=failed",
    "result=fail",
  ];
  if (!failurePatterns.some((p) => lower.includes(p))) return false;
  return lower.includes(orderLower) || lower.includes("payment-failed");
}

export type PaymentCallbackOutcome = "success" | "failure" | "unknown";

export function resolvePaymentCallbackOutcome(
  rawUrl: string,
  expectedOrderId: string,
): PaymentCallbackOutcome {
  const parsed = parsePaymentCallbackParams(rawUrl);
  if (gatewaySuccessAppliesToOrder(expectedOrderId, parsed)) return "success";
  if (isGatewayCallbackFailureStatus(parsed)) return "failure";
  if (isPaymentSuccessUrl(rawUrl, expectedOrderId)) return "success";
  if (isPaymentFailureUrl(rawUrl, expectedOrderId)) return "failure";
  return "unknown";
}
