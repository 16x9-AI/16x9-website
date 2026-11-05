declare module "*.mjs" {
  export function renderVisual(
    spec: unknown,
    note: { text: string; date: string; title: string },
  ): Promise<{ status: string; reason?: string; png?: Buffer }>;
  const value: unknown;
  export default value;
}
