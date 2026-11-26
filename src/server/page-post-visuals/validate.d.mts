export type Offending = { path: string; token: string; kind: "date" | "number"; text: string };

export type ValidateResult = {
  status: "valid" | "invalid" | "unsupported";
  errors: string[];
  offending: Offending[];
  result?: unknown;
};

export function normSpace(s: unknown): string;
export function extractDates(text: string): { dates: string[]; rest: string };
export function extractNumbers(text: string): string[];
export function displayedStrings(spec: unknown): [string, string][];
export function validateSpec(
  spec: unknown,
  noteText: string,
  opts?: { date?: string; title?: string },
): ValidateResult;
export function checkSpecSchema(spec: unknown): string[];
