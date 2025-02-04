"use strict";
const keyword = "Connects";
const rate = 0.15;
const symbol = "$";
function replaceVariableTextNode(node) {
    var _a, _b;
    if ((_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-processed"))
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
        (_b = node.parentElement) === null || _b === void 0 ? void 0 : _b.setAttribute("data-processed", "true"); // Mark as processed
    }
}
function replaceVariableColonTextNode(node) {
    var _a, _b;
    if ((_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-processed"))
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
        (_b = node.parentElement) === null || _b === void 0 ? void 0 : _b.setAttribute("data-processed", "true"); // Mark as processed
    }
}
// Recursively walk through the DOM to process text nodes.
function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        replaceVariableTextNode(node);
        replaceVariableColonTextNode(node);
    }
    else {
        node.childNodes.forEach(walk);
    }
}
// Set up a MutationObserver to catch dynamically added/updated content.
function observeMutations() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => walk(node));
            }
            else if (mutation.type === "characterData") {
                replaceVariableTextNode(mutation.target);
                replaceVariableColonTextNode(mutation.target);
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
function init() {
    walk(document.body);
    observeMutations();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
}
else {
    init();
}
