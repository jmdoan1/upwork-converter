"use strict";
const defaultSettings = {
    keyword: "Connects",
    rate: 0.15,
    symbol: "$",
};
let userSettings = Object.assign({}, defaultSettings);
/**
 * Process a text node for patterns like "40 Connects" and appends the calculated value.
 */
function replaceVariableTextNode(node) {
    const escapedKeyword = userSettings.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const escapedSymbol = userSettings.symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(\\d+)\\s*${escapedKeyword}(?!\\s*\\(${escapedSymbol})`, "gi");
    const originalText = node.textContent || "";
    const newText = originalText.replace(regex, (_, p1) => {
        const count = parseFloat(p1);
        const dollarValue = count * userSettings.rate;
        const formatted = Number.isInteger(dollarValue)
            ? `${dollarValue}`
            : dollarValue.toFixed(2);
        return `${p1} ${userSettings.keyword} (${userSettings.symbol}${formatted})`;
    });
    if (newText !== originalText) {
        console.log({ old1: originalText, new1: newText });
        node.textContent = newText;
    }
}
/**
 * Process a text node for patterns like "Connects: 40" (all in one text node)
 * and appends the calculated value.
 */
function replaceVariableColonTextNode(node) {
    var _a, _b;
    if ((_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("data-processed"))
        return; // Skip if already processed
    const escapedKeyword = userSettings.keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const escapedSymbol = userSettings.symbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`${escapedKeyword}:\\s*(\\d+)(?!\\s*\\(${escapedSymbol})`, "gi");
    const originalText = node.textContent || "";
    const newText = originalText.replace(regex, (match, digits) => {
        const count = parseFloat(digits);
        const dollarValue = count * userSettings.rate;
        const formatted = Number.isInteger(dollarValue)
            ? `${dollarValue}`
            : dollarValue.toFixed(2);
        return `${match} (${userSettings.symbol}${formatted})`;
    });
    if (newText !== originalText) {
        console.log({ old2: originalText, new2: newText });
        node.textContent = newText;
        (_b = node.parentElement) === null || _b === void 0 ? void 0 : _b.setAttribute("data-processed", "true");
    }
}
/**
 * Process a case where the pattern is split:
 * The text node contains (or ends with) "Connects:" and the very next sibling
 * is an element (any tag) that contains only a number. In that case,
 * update that element's text to append the conversion.
 *
 * For example:
 *   "Available Connects: " (text node)
 *   <strong>108</strong> (element node)
 *
 * will be updated to:
 *   "Available Connects: " (unchanged)
 *   <strong>108 ($16.20)</strong>
 */
function replaceColonTaggedNode(node) {
    var _a;
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const regex = new RegExp(`${userSettings.keyword}:\\s*$`, "i");
        if (regex.test(text)) {
            const nextSibling = node.nextSibling;
            if (nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE) {
                const el = nextSibling;
                // Check that the element's text contains only digits (ignoring surrounding whitespace)
                const digitMatch = (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim().match(/^(\d+)$/);
                if (digitMatch) {
                    const digits = digitMatch[1];
                    const count = parseFloat(digits);
                    const dollarValue = count * userSettings.rate;
                    const formatted = Number.isInteger(dollarValue)
                        ? `${dollarValue}`
                        : dollarValue.toFixed(2);
                    const newTextContent = `${digits} (${userSettings.symbol}${formatted})`;
                    console.log({ old3: el.textContent, new3: newTextContent });
                    el.textContent = newTextContent;
                }
            }
        }
    }
    else {
        // If this is not a text node, check its children.
        node.childNodes.forEach((child) => replaceColonTaggedNode(child));
    }
}
/**
 * Recursively walk through the DOM to process nodes.
 */
function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        replaceVariableTextNode(node);
        replaceVariableColonTextNode(node);
    }
    node.childNodes.forEach(walk);
    if (node.nodeType === Node.ELEMENT_NODE) {
        replaceColonTaggedNode(node);
    }
}
/**
 * Set up a MutationObserver to catch dynamically added/updated content.
 */
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
function init() {
    walk(document.body);
    observeMutations();
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        chrome.storage.sync.get(defaultSettings, (items) => {
            userSettings = items;
            init();
        });
    });
}
else {
    chrome.storage.sync.get(defaultSettings, (items) => {
        userSettings = items;
        init();
    });
}
