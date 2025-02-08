interface Settings {
  keyword: string;
  rate: number;
  symbol: string;
}

const defSettings: Settings = {
  keyword: "Connects",
  rate: 0.15,
  symbol: "$",
};

/**
 * Saves options to chrome.storage.sync.
 */
function saveOptions(e: Event): void {
  e.preventDefault();

  const keywordInput = document.getElementById("keyword") as HTMLInputElement;
  const rateInput = document.getElementById("rate") as HTMLInputElement;
  const symbolInput = document.getElementById("symbol") as HTMLInputElement;

  const newSettings: Settings = {
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
function restoreOptions(): void {
  chrome.storage.sync.get(defSettings, (items: Settings) => {
    (document.getElementById("keyword") as HTMLInputElement).value =
      items.keyword;
    (document.getElementById("rate") as HTMLInputElement).value =
      items.rate.toString();
    (document.getElementById("symbol") as HTMLInputElement).value =
      items.symbol;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("optionsForm")?.addEventListener("submit", saveOptions);
