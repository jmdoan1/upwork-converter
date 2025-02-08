"use strict";
var _a;
const defSettings = {
    keyword: "Connects",
    rate: 0.15,
    symbol: "$",
};
/**
 * Saves options to chrome.storage.sync.
 */
function saveOptions(e) {
    e.preventDefault();
    const keywordInput = document.getElementById("keyword");
    const rateInput = document.getElementById("rate");
    const symbolInput = document.getElementById("symbol");
    const newSettings = {
        keyword: keywordInput.value,
        rate: parseFloat(rateInput.value),
        symbol: symbolInput.value,
    };
    chrome.storage.sync.set(newSettings, () => {
        const status = document.getElementById("status");
        if (status) {
            status.textContent = "Options saved.";
            setTimeout(() => {
                status.textContent = "";
            }, 1500);
        }
    });
}
/**
 * Restores select box and checkbox state using the preferences
 * stored in chrome.storage.
 */
function restoreOptions() {
    chrome.storage.sync.get(defSettings, (items) => {
        document.getElementById("keyword").value =
            items.keyword;
        document.getElementById("rate").value =
            items.rate.toString();
        document.getElementById("symbol").value =
            items.symbol;
    });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
(_a = document.getElementById("optionsForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", saveOptions);
