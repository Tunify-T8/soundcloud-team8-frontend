export const SOCIAL_GRAPH_UPDATED_EVENT = "social-graph:updated";

export function notifySocialGraphUpdated(): void {
  window.dispatchEvent(new Event(SOCIAL_GRAPH_UPDATED_EVENT));
}
