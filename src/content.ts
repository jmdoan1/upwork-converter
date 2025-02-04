const keyword = "Connects";
const rate = 0.15;
const symbol = "$";

function replaceVariableTextNode(node: Text): void {
  if ((node.parentElement as HTMLElement)?.getAttribute("data-processed"))
    return; // Skip if already processed
  const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(\\d+)\\s*${escapedKeyword}(?!\\s*\\(\\$)`, "gi");
  const originalText = node.textContent || "";
  const newText = originalText.replace(regex, (_, p1) => {
    const count = parseFloat(p1);
    const dollarValue = count * rate;
    const formatted = Number.isInteger(dollarValue)
      ? `${dollarValue}`
      : dollarValue.toFixed(2);
    return `${p1} ${keyword} (${symbol}${formatted})`;
  });
  if (newText !== originalText) {
    node.textContent = newText;
    (node.parentElement as HTMLElement)?.setAttribute("data-processed", "true"); // Mark as processed
  }
}

function replaceVariableColonTextNode(node: Text): void {
  if ((node.parentElement as HTMLElement)?.getAttribute("data-processed"))
    return; // Skip if already processed
  const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`${escapedKeyword}:\\s*(\\d+)(?!\\s*\\(\\$)`, "gi");
  const originalText = node.textContent || "";
  const newText = originalText.replace(regex, (match, digits) => {
    const count = parseFloat(digits);
    const dollarValue = count * rate;
    const formatted = Number.isInteger(dollarValue)
      ? `${dollarValue}`
      : dollarValue.toFixed(2);
    return `${match} (${symbol}${formatted})`;
  });
  if (newText !== originalText) {
    node.textContent = newText;
    (node.parentElement as HTMLElement)?.setAttribute("data-processed", "true"); // Mark as processed
  }
}

// Recursively walk through the DOM to process text nodes.
function walk(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    replaceVariableTextNode(node as Text);
    replaceVariableColonTextNode(node as Text);
  } else {
    node.childNodes.forEach(walk);
  }
}

// Set up a MutationObserver to catch dynamically added/updated content.
function observeMutations(): void {
  const observer = new MutationObserver((mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => walk(node));
      } else if (mutation.type === "characterData") {
        replaceVariableTextNode(mutation.target as Text);
        replaceVariableColonTextNode(mutation.target as Text);
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

// Initialize by processing the current document and starting the observer.
function init(): void {
  walk(document.body);
  observeMutations();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
