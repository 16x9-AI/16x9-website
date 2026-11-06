import { describe, expect, it } from "vitest";
import { COMPANY, publisherEnabled } from "./company";
import {
  exchangeGoogleCode,
  googleRedirectUri,
  handleGoogleCallback,
  handleGoogleStart,
} from "./google";
import type { CookieStore } from "./otp";
import { readSessionToken, SESSION_COOKIE } from "./session-token";
import { isTeamEmail, teamAllowlist } from "./team";

const SECRET = "test-secret-test-secret-test-secret";

function memoryJar(): CookieStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    get: (name) => values.get(name),
    set: (name, value, maxAge) => {
      if (!value || maxAge <= 0) values.delete(name);
      else values.set(name, value);
    },
  };
}

function withGoogleEnv() {
  const prev = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    X9_TEAM_EMAILS: process.env.X9_TEAM_EMAILS,
    X9_LINKEDIN_PUBLISHER_ENABLED: process.env.X9_LINKEDIN_PUBLISHER_ENABLED,
  };
  process.env.AUTH_SECRET = SECRET;
  process.env.GOOGLE_CLIENT_ID = "google-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
  delete process.env.X9_TEAM_EMAILS;
  delete process.env.X9_LINKEDIN_PUBLISHER_ENABLED;
  return () => {
    for (const [key, value] of Object.entries(prev)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

describe("admin allowlist", () => {
  it("defaults to the two named addresses and refuses the domain", () => {
    const prev = process.env.X9_TEAM_EMAILS;
    delete process.env.X9_TEAM_EMAILS;
    expect(teamAllowlist()).toEqual(["nelson.sanmiguel@16x9.ai", "info@16x9.ai"]);
    expect(isTeamEmail("nelson.sanmiguel@16x9.ai")).toBe(true);
    expect(isTeamEmail("  INFO@16x9.ai ")).toBe(true);
    expect(isTeamEmail("someone@16x9.ai")).toBe(false);
    expect(isTeamEmail("other@16x9.ai")).toBe(false);
    expect(isTeamEmail("@16x9.ai")).toBe(false);
    expect(isTeamEmail("16x9.ai")).toBe(false);
    expect(isTeamEmail("*@16x9.ai")).toBe(false);
    expect(isTeamEmail("")).toBe(false);
    expect(isTeamEmail(null)).toBe(false);
    expect(isTeamEmail("person@frontierdesk.ai")).toBe(false);
    if (prev === undefined) delete process.env.X9_TEAM_EMAILS;
    else process.env.X9_TEAM_EMAILS = prev;
  });

  it("lets X9_TEAM_EMAILS replace the defaults, and ignores domain-shaped entries", () => {
    const prev = process.env.X9_TEAM_EMAILS;
    try {
      process.env.X9_TEAM_EMAILS = " @16x9.ai, 16x9.ai, *@16x9.ai, only@example.com ";
      expect(teamAllowlist()).toEqual(["only@example.com"]);
      expect(isTeamEmail("only@example.com")).toBe(true);
      expect(isTeamEmail("nelson.sanmiguel@16x9.ai")).toBe(false);
      expect(isTeamEmail("info@16x9.ai")).toBe(false);
      expect(isTeamEmail("someone@16x9.ai")).toBe(false);

      process.env.X9_TEAM_EMAILS = "   ";
      expect(teamAllowlist()).toEqual(["nelson.sanmiguel@16x9.ai", "info@16x9.ai"]);

      process.env.X9_TEAM_EMAILS = ",,,";
      expect(teamAllowlist()).toEqual([]);
      expect(isTeamEmail("info@16x9.ai")).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.X9_TEAM_EMAILS;
      else process.env.X9_TEAM_EMAILS = prev;
    }
  });
});

describe("Google sign-in", () => {
  it("sends the browser to Google with the production redirect URI and no client secret", async () => {
    const restore = withGoogleEnv();
    try {
      const jar = memoryJar();
      const response = await handleGoogleStart(
        new Request("http://127.0.0.1/api/auth/google/start?next=/articles?q=1", {
          headers: { "x-forwarded-proto": "https", "x-forwarded-host": "16x9.ai" },
        }),
        jar,
      );
      const location = response.headers.get("location") || "";
      const auth = new URL(location);
      expect(response.status).toBe(302);
      expect(auth.origin).toBe("https://accounts.google.com");
      expect(auth.pathname).toBe("/o/oauth2/v2/auth");
      expect(auth.searchParams.get("client_id")).toBe("google-client-id");
      expect(auth.searchParams.get("client_secret")).toBeNull();
      expect(auth.searchParams.get("redirect_uri")).toBe(
        "https://16x9.ai/api/auth/google/callback",
      );
      expect(auth.searchParams.get("code_challenge_method")).toBe("S256");
      expect(auth.searchParams.get("code_challenge")).toBeTruthy();
      expect(auth.searchParams.get("scope")).toBe("openid email profile");
      expect(jar.values.get(COMPANY.googleStateCookie)).toBeTruthy();
      expect(location).not.toContain("google-client-secret");
    } finally {
      restore();
    }
  });

  it("refuses to start when Google or the session secret is missing", async () => {
    const prevId = process.env.GOOGLE_CLIENT_ID;
    const prevSecret = process.env.GOOGLE_CLIENT_SECRET;
    const prevAuth = process.env.AUTH_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.AUTH_SECRET = SECRET;
    try {
      const jar = memoryJar();
      const response = await handleGoogleStart(
        new Request("https://16x9.ai/api/auth/google/start?next=/team"),
        jar,
      );
      expect(response.headers.get("location")).toBe("/login?error=not_configured&next=%2Fteam");
      expect(jar.values.has(COMPANY.googleStateCookie)).toBe(false);
      expect(googleRedirectUri(new Request("https://16x9.ai/api/auth/google/callback"))).toBe(
        "https://16x9.ai/api/auth/google/callback",
      );
    } finally {
      if (prevId === undefined) delete process.env.GOOGLE_CLIENT_ID;
      else process.env.GOOGLE_CLIENT_ID = prevId;
      if (prevSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
      else process.env.GOOGLE_CLIENT_SECRET = prevSecret;
      if (prevAuth === undefined) delete process.env.AUTH_SECRET;
      else process.env.AUTH_SECRET = prevAuth;
    }
  });

  async function started(next = "/team") {
    const jar = memoryJar();
    const start = await handleGoogleStart(
      new Request(`https://16x9.ai/api/auth/google/start?next=${encodeURIComponent(next)}`),
      jar,
    );
    const state = new URL(start.headers.get("location") || "").searchParams.get("state") || "";
    return { jar, state };
  }

  it("refuses an address that is not on the allowlist and does not set a session", async () => {
    const restore = withGoogleEnv();
    try {
      const { jar, state } = await started("/team");
      const response = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${state}`),
        jar,
        {
          exchange: async () => "id-token",
          verify: async (_token, check) => ({ email: "someone@16x9.ai", nonce: check.nonce }),
        },
      );
      expect(response.status).toBe(302);
      expect(response.headers.get("location")).toBe("/login?error=denied");
      expect(jar.values.has(SESSION_COOKIE)).toBe(false);
      expect(jar.values.has(COMPANY.googleStateCookie)).toBe(false);
    } finally {
      restore();
    }
  });

  it("sets the AUTH_SECRET session for an allowlisted Google account", async () => {
    const restore = withGoogleEnv();
    try {
      const { jar, state } = await started("/articles?q=1");
      const response = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${state}`),
        jar,
        {
          exchange: async () => "id-token",
          verify: async (_token, check) => ({ email: "Info@16x9.ai", nonce: check.nonce }),
        },
      );
      expect(response.headers.get("location")).toBe("/articles?q=1");
      const token = jar.values.get(SESSION_COOKIE) || "";
      expect((await readSessionToken(token, SECRET))?.email).toBe("info@16x9.ai");
      expect(await readSessionToken(token, "other-secret-other-secret-other")).toBeNull();
      expect(jar.values.has(COMPANY.googleStateCookie)).toBe(false);
      expect(publisherEnabled()).toBe(false);
    } finally {
      restore();
    }
  });

  it("uses the override list and drops a forged next path", async () => {
    const restore = withGoogleEnv();
    process.env.X9_TEAM_EMAILS = "only@example.com";
    try {
      const outsider = await started("https://evil.example/phish");
      const denied = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${outsider.state}`),
        outsider.jar,
        {
          exchange: async () => "id-token",
          verify: async (_token, check) => ({ email: "info@16x9.ai", nonce: check.nonce }),
        },
      );
      expect(denied.headers.get("location")).toBe("/login?error=denied");
      expect(outsider.jar.values.has(SESSION_COOKIE)).toBe(false);

      const allowed = await started("https://evil.example/phish");
      const response = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${allowed.state}`),
        allowed.jar,
        {
          exchange: async () => "id-token",
          verify: async (_token, check) => ({ email: "only@example.com", nonce: check.nonce }),
        },
      );
      expect(response.headers.get("location")).toBe("/team");
      expect(
        (await readSessionToken(allowed.jar.values.get(SESSION_COOKIE) || "", SECRET))?.email,
      ).toBe("only@example.com");
    } finally {
      restore();
    }
  });

  it("refuses a bad state, a nonce mismatch, and an unverified token", async () => {
    const restore = withGoogleEnv();
    try {
      const mismatched = await started();
      const badState = await handleGoogleCallback(
        new Request("https://16x9.ai/api/auth/google/callback?code=abc&state=nope"),
        mismatched.jar,
        {
          exchange: async () => "id-token",
          verify: async (_token, check) => ({ email: "info@16x9.ai", nonce: check.nonce }),
        },
      );
      expect(badState.headers.get("location")).toBe("/login?error=invalid");
      expect(mismatched.jar.values.has(SESSION_COOKIE)).toBe(false);

      const wrongNonce = await started();
      const nonce = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${wrongNonce.state}`),
        wrongNonce.jar,
        {
          exchange: async () => "id-token",
          verify: async () => ({ email: "info@16x9.ai", nonce: "wrong-nonce" }),
        },
      );
      expect(nonce.headers.get("location")).toBe("/login?error=invalid");
      expect(wrongNonce.jar.values.has(SESSION_COOKIE)).toBe(false);

      const unverified = await started();
      const missing = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=abc&state=${unverified.state}`),
        unverified.jar,
        { exchange: async () => "id-token", verify: async () => null },
      );
      expect(missing.headers.get("location")).toBe("/login?error=invalid");
      expect(unverified.jar.values.has(SESSION_COOKIE)).toBe(false);
    } finally {
      restore();
    }
  });

  it("posts the client secret only to Google's token endpoint", async () => {
    const restore = withGoogleEnv();
    const original = globalThis.fetch;
    const calls: { url: string; body: string }[] = [];
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      calls.push({ url: String(url), body: String(init?.body || "") });
      return new Response(JSON.stringify({ id_token: "signed-id-token" }), { status: 200 });
    }) as typeof fetch;
    try {
      const { jar, state } = await started();
      const response = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=the-code&state=${state}`),
        jar,
        {
          verify: async (token, check) => {
            expect(token).toBe("signed-id-token");
            return { email: "nelson.sanmiguel@16x9.ai", nonce: check.nonce };
          },
        },
      );
      expect(response.headers.get("location")).toBe("/team");
      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe("https://oauth2.googleapis.com/token");
      const body = new URLSearchParams(calls[0].body);
      expect(body.get("client_secret")).toBe("google-client-secret");
      expect(body.get("code")).toBe("the-code");
      expect(body.get("grant_type")).toBe("authorization_code");
      expect(body.get("redirect_uri")).toBe("https://16x9.ai/api/auth/google/callback");
      expect(body.get("code_verifier")).toBeTruthy();
      expect((await readSessionToken(jar.values.get(SESSION_COOKIE) || "", SECRET))?.email).toBe(
        "nelson.sanmiguel@16x9.ai",
      );

      calls.length = 0;
      globalThis.fetch = (async () => new Response("no", { status: 400 })) as typeof fetch;
      const failed = await started();
      const rejected = await handleGoogleCallback(
        new Request(`https://16x9.ai/api/auth/google/callback?code=the-code&state=${failed.state}`),
        failed.jar,
      );
      expect(rejected.headers.get("location")).toBe("/login?error=invalid");
      expect(failed.jar.values.has(SESSION_COOKIE)).toBe(false);
      expect(exchangeGoogleCode).toBeTypeOf("function");
    } finally {
      globalThis.fetch = original;
      restore();
    }
  });
});
