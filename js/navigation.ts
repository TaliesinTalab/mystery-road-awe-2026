export function navigateTo(viewName: string): void {
  window.location.hash = viewName.length;
  // handleHashChange() will pick this up via the hashchange listener
}
