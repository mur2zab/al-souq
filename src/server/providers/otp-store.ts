import { getDb, initPostgresTables } from '@/server/db/postgres';

export interface IOtpStore {
  readonly providerName: string;
  setOtp(key: string, otp: string, ttlSeconds: number): Promise<void>;
  getOtp(key: string): Promise<string | null>;
  deleteOtp(key: string): Promise<void>;
  incrementAttempts(key: string, ttlSeconds: number): Promise<number>;
}

/**
 * Redis OTP Store using Upstash REST API (Serverless-native Redis, zero extra npm deps).
 * Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in environment variables.
 */
export class UpstashRedisOtpStore implements IOtpStore {
  public readonly providerName = 'upstash-redis';
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private async command(args: (string | number)[]): Promise<any> {
    const res = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Redis error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.result;
  }

  async setOtp(key: string, otp: string, ttlSeconds: number): Promise<void> {
    await this.command(['SETEX', `otp:${key}`, ttlSeconds, otp]);
    await this.command(['DEL', `otp_attempts:${key}`]);
  }

  async getOtp(key: string): Promise<string | null> {
    const val = await this.command(['GET', `otp:${key}`]);
    return val ? String(val) : null;
  }

  async deleteOtp(key: string): Promise<void> {
    await this.command(['DEL', `otp:${key}`, `otp_attempts:${key}`]);
  }

  async incrementAttempts(key: string, ttlSeconds: number): Promise<number> {
    const attemptsKey = `otp_attempts:${key}`;
    const count = await this.command(['INCR', attemptsKey]);
    if (Number(count) === 1) {
      await this.command(['EXPIRE', attemptsKey, ttlSeconds]);
    }
    return Number(count);
  }
}

/**
 * Fallback OTP Store backed by Neon PostgreSQL + in-memory Map when Redis env vars are not yet configured.
 */
const globalMemoryOtpMap = new Map<string, { otp: string; attempts: number; expiresAt: number }>();

export class FallbackOtpStore implements IOtpStore {
  public readonly providerName = 'postgres-memory-fallback';

  async setOtp(key: string, otp: string, ttlSeconds: number): Promise<void> {
    const expiresAtMs = Date.now() + ttlSeconds * 1000;
    const expiresAtIso = new Date(expiresAtMs).toISOString();

    globalMemoryOtpMap.set(key, { otp, attempts: 0, expiresAt: expiresAtMs });

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_otp_tokens (key, otp_value, attempts, expires_at)
          VALUES (${key}, ${otp}, 0, ${expiresAtIso})
          ON CONFLICT (key) DO UPDATE
          SET otp_value = ${otp}, attempts = 0, expires_at = ${expiresAtIso}
        `;
      } catch (err) {
        console.warn('Postgres OTP fallback set error:', err);
      }
    }
  }

  async getOtp(key: string): Promise<string | null> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`
          SELECT otp_value, expires_at FROM alsouq_otp_tokens
          WHERE key = ${key} LIMIT 1
        `;
        if (rows.length > 0) {
          const exp = new Date(rows[0].expires_at).getTime();
          if (Date.now() > exp) {
            await this.deleteOtp(key);
            return null;
          }
          return String(rows[0].otp_value);
        }
      } catch (err) {
        console.warn('Postgres OTP fallback get error:', err);
      }
    }

    const mem = globalMemoryOtpMap.get(key);
    if (!mem) return null;
    if (Date.now() > mem.expiresAt) {
      globalMemoryOtpMap.delete(key);
      return null;
    }
    return mem.otp;
  }

  async deleteOtp(key: string): Promise<void> {
    globalMemoryOtpMap.delete(key);
    const sql = getDb();
    if (sql) {
      try {
        await sql`DELETE FROM alsouq_otp_tokens WHERE key = ${key}`;
      } catch (err) {
        console.warn('Postgres OTP fallback delete error:', err);
      }
    }
  }

  async incrementAttempts(key: string): Promise<number> {
    const mem = globalMemoryOtpMap.get(key);
    if (mem) {
      mem.attempts += 1;
    }

    const sql = getDb();
    if (sql) {
      try {
        const rows = await sql`
          UPDATE alsouq_otp_tokens
          SET attempts = attempts + 1
          WHERE key = ${key}
          RETURNING attempts
        `;
        if (rows.length > 0) {
          return Number(rows[0].attempts);
        }
      } catch (err) {
        console.warn('Postgres OTP fallback increment error:', err);
      }
    }

    return mem ? mem.attempts : 1;
  }
}

export function getOtpStore(): IOtpStore {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    return new UpstashRedisOtpStore(redisUrl, redisToken);
  }

  return new FallbackOtpStore();
}
