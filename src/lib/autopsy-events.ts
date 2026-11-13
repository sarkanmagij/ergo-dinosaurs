export function trackEvent(name: 'start' | 'process_selected' | 'completed' | 'pdf_downloaded' | 'lead_submitted', detail: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent('trex:analytics', { detail: { event: name, ...detail } }));
}