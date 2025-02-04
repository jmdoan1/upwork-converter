// This function checks a text node for the pattern "(x) Connects" and replaces it.
function replaceConnectsInTextNode(node: Text): void {
  // Match a number followed by "Connects" not already followed by a dollar value, e.g. not "Connects ($"
  const regex = /(\d+)\s*Connects(?!\s*\(\$)/g;
  const originalText = node.textContent || "";
  const newText = originalText.replace(regex, (_, p1) => {
    const connectsCount = parseFloat(p1);
    const dollarValue = connectsCount * 0.15;
    // Format the dollar value to no decimals if an integer, otherwise two decimals.
    const formatted = Number.isInteger(dollarValue)
      ? `${dollarValue}`
      : dollarValue.toFixed(2);
    // Append the calculated dollar value after the matched text.
    return `${p1} Connects ($${formatted})`;
  });
  if (newText !== originalText) {
    node.textContent = newText;
  }
}

// Recursively walk through the DOM to process text nodes.
function walk(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    replaceConnectsInTextNode(node as Text);
  } else {
    node.childNodes.forEach(walk);
  }
}

// Set up a MutationObserver to catch dynamically added/updated content.
function observeMutations(): void {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => walk(node));
      } else if (mutation.type === "characterData") {
        replaceConnectsInTextNode(mutation.target as Text);
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
