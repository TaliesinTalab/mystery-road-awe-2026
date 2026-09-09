export function navigateTo(viewName) {
    window.location.hash = viewName;
    // handleHashChange() will pick this up via the hashchange listener
}