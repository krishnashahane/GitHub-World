import crypto from "node:crypto";

export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = `Bearer ${secret}`;
  const actual = request.headers.get("authorization") ?? "";
  if (actual.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}
