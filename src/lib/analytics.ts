/**
 * Analytics is intentionally disabled.
 * Add a provider here later (for example Cloudflare Web Analytics) and
 * import `analyticsSnippet` from the base layout.
 */
export const analytics = {
  enabled: false,
  siteId: '',
} as const;

export function analyticsSnippet(): string {
  if (!analytics.enabled || !analytics.siteId) {
    return '';
  }

  return '';
}
