/**
 * Print HTML via a hidden iframe (avoids popup blockers from window.open).
 */
export function printHtmlDocument(html: string): boolean {
  if (typeof document === "undefined") return false;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.title = "Print";
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";

  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return false;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 1000);
  };

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      iframe.remove();
      return;
    }
    cleanup();
  };

  if (win.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 150);
  } else {
    iframe.onload = () => window.setTimeout(triggerPrint, 150);
  }

  return true;
}
