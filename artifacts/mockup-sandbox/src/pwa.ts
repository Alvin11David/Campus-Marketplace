export function registerPWA() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const { registerSW } = await import("virtual:pwa-register");
      registerSW({
        onOfflineReady() {
          console.log("CampusMarket is ready for offline use");
        },
        onNeedRefresh() {
          if (confirm("A new version is available. Refresh to update?")) {
            window.location.reload();
          }
        },
      });
    } catch {
      // virtual:pwa-register may not be available in dev
    }
  });
}
