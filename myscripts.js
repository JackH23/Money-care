document.querySelectorAll(".number-input").forEach((input) => {
  input.addEventListener("input", function (e) {
    // Remove all non-digit characters
    let rawValue = e.target.value.replace(/[^0-9]/g, "");

    // Format number with commas
    if (rawValue !== "") {
      e.target.value = Number(rawValue).toLocaleString();
    } else {
      e.target.value = "";
    }
  });
});

const sections = document.querySelectorAll(".section");
const progressDots = document.querySelectorAll(".progress-dot");
const weekendCounter = document.getElementById("weekendCounter");
let currentIndex = 0;
let resetFeedbackTimeoutId = null;

const RESET_CONFIRM_MESSAGE =
  "Are you sure you want to clear all saved planner data? This will remove weekend budgets, transactions, and totals.";
const RESET_SUCCESS_MESSAGE = "All saved planner data has been cleared.";

const weekendNumbers = [1, 2, 3, 4];
const weekendDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function parseNumeric(value) {
  if (typeof value !== "string") {
    value = String(value ?? "");
  }
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "") {
    return 0;
  }
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getWeekendStorageKey(weekend, day, type) {
  const normalized = String(type || "").toLowerCase();
  const prefix = `Weekend${weekend}_${day}`;

  if (normalized === "add") {
    return `${prefix}_Add`;
  }
  if (normalized === "paid") {
    return `${prefix}_Paid`;
  }
  if (normalized === "remaining") {
    return `${prefix}_Remaining`;
  }

  return `${prefix}_${type}`;
}

function loadStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function showSection(index) {
  if (!sections.length) {
    return;
  }

  const normalizedIndex = ((index % sections.length) + sections.length) % sections.length;
  currentIndex = normalizedIndex;

  sections.forEach((section, i) => {
    section.classList.toggle("active", i === currentIndex);
  });

  progressDots.forEach((dot, i) => {
    const isActive = i === currentIndex;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  if (weekendCounter) {
    weekendCounter.textContent = `Weekend ${currentIndex + 1} of ${sections.length}`;
  }
}

document.getElementById("nextBtn").addEventListener("click", () => {
  showSection(currentIndex + 1);
});

document.getElementById("prevBtn").addEventListener("click", () => {
  showSection(currentIndex - 1);
});

progressDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const targetIndex = Number.parseInt(dot.dataset.index, 10);
    if (!Number.isNaN(targetIndex)) {
      showSection(targetIndex);
    }
  });
});

showSection(currentIndex);

document.addEventListener("DOMContentLoaded", () => {
  const allSections = document.querySelectorAll(".section");

  allSections.forEach((section, secIndex) => {
    const labelEls = section.querySelectorAll("label");

    labelEls.forEach((labelEl, labelIndex) => {
      const day = labelEl.innerText.trim();
      const inputs = labelEl.parentElement.querySelectorAll("input");

      inputs.forEach((input, inputIndex) => {
        // Create a unique key for each input
        const key = `weekend${secIndex + 1}_${day}_${inputIndex}`;

        // Load the saved value
        const savedValue = localStorage.getItem(key);
        if (savedValue) {
          input.value = savedValue;
        }

        // Save the value on input
        input.addEventListener("input", () => {
          localStorage.setItem(key, input.value);
        });
      });
    });
  });

  weekendNumbers.forEach((weekend) => {
    const storedFinal = localStorage.getItem(
      `Weekend${weekend}_Final_Remaining`
    );
    if (storedFinal !== null) {
      updateWeekendFinalRemainingDisplay(weekend, storedFinal, false);
    }
  });
});

// Save input values to localStorage
document.querySelectorAll("input.number-input").forEach((input) => {
  const name = input.name;

  // Load saved value on page load
  const saved = localStorage.getItem(name);
  if (saved !== null) {
    input.value = saved;
  }

  // Save value on input
  input.addEventListener("input", () => {
    localStorage.setItem(name, input.value);
  });
});

function updateWeekendFinalRemainingDisplay(weekend, value, persist = true) {
  const displayEl = document.getElementById(`Weekend${weekend}_Final_Remaining`);
  if (!displayEl) {
    return;
  }

  const numericValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : parseNumeric(String(value ?? ""));

  const normalized = Number.isFinite(numericValue) ? numericValue : 0;

  displayEl.textContent = `Remaining: ${normalized.toLocaleString()}`;

  if (persist) {
    localStorage.setItem(
      `Weekend${weekend}_Final_Remaining`,
      normalized.toString()
    );
  }
}

function updateWeekendDayTotals(weekend, day, startingBalance = null) {
  const paidData = loadStoredArray(getWeekendStorageKey(weekend, day, "Paid"));
  const addData = loadStoredArray(getWeekendStorageKey(weekend, day, "Add"));

  const totalInput = document.querySelector(
    `input[name="Weekend_${weekend}_${day}"]`
  );

  const hasPaidRows = paidData.some((row) => {
    if (!row) {
      return false;
    }
    const amount = row.amount;
    if (amount === null || amount === undefined) {
      return false;
    }
    if (typeof amount === "string") {
      return amount.trim() !== "";
    }
    return true;
  });

  let manualFallback = totalInput?.value || "";
  if (!manualFallback) {
    const storedManual = localStorage.getItem(`Weekend_${weekend}_${day}`);
    if (storedManual) {
      manualFallback = storedManual;
      if (totalInput && totalInput.value !== storedManual) {
        totalInput.value = storedManual;
      }
    }
  }

  let paidTotal = 0;
  if (hasPaidRows) {
    paidTotal = paidData.reduce(
      (sum, row) => sum + parseNumeric(row?.amount || 0),
      0
    );
    if (totalInput) {
      const formattedPaidTotal = paidTotal.toLocaleString();
      totalInput.value = formattedPaidTotal;
      localStorage.setItem(
        `Weekend_${weekend}_${day}`,
        formattedPaidTotal
      );
    }
  } else {
    paidTotal = parseNumeric(manualFallback);
  }

  const addTotal = addData.reduce(
    (sum, row) => sum + parseNumeric(row?.amount || 0),
    0
  );

  const assetInput = document.querySelector(`input[name="asset${weekend}"]`);
  const assetVal = parseNumeric(assetInput?.value || "0");
  const hasStartingBalance =
    typeof startingBalance === "number" && !Number.isNaN(startingBalance);
  const baseBalance = hasStartingBalance ? startingBalance : assetVal;

  const remaining = baseBalance + addTotal - paidTotal;
  const normalizedRemaining = Number.isFinite(remaining) ? remaining : 0;
  const displayEl = document.getElementById(`${day}_${weekend}_addTotal`);
  if (displayEl) {
    displayEl.textContent = `Remaining: ${normalizedRemaining.toLocaleString()}`;
  }

  localStorage.setItem(
    getWeekendStorageKey(weekend, day, "Remaining"),
    normalizedRemaining
  );

  return normalizedRemaining;
}

function calculateWeekend(weekend) {
  const assetInput = document.querySelector(`input[name="asset${weekend}"]`);
  let runningBalance = parseNumeric(assetInput?.value || "0");
  runningBalance = Number.isFinite(runningBalance) ? runningBalance : 0;

  weekendDays.forEach((day) => {
    const nextBalance = updateWeekendDayTotals(weekend, day, runningBalance);
    runningBalance = Number.isFinite(nextBalance) ? nextBalance : 0;
  });

  updateWeekendFinalRemainingDisplay(weekend, runningBalance);
}

function shouldClearStorageKey(key) {
  if (!key) {
    return false;
  }

  const normalizedKey = String(key).toLowerCase();
  return (
    normalizedKey.startsWith("weekend") || normalizedKey.startsWith("asset")
  );
}

function clearPlannerStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }

  const keysToRemove = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (shouldClearStorageKey(key)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      /* ignore storage errors */
    }
  });
}

function resetPlannerForms() {
  document.querySelectorAll(".number-input").forEach((input) => {
    input.value = "";
  });

  weekendNumbers.forEach((weekend) => {
    weekendDays.forEach((day) => {
      const displayEl = document.getElementById(`${day}_${weekend}_addTotal`);
      if (displayEl) {
        displayEl.textContent = "Remaining: 0";
      }
    });
    updateWeekendFinalRemainingDisplay(weekend, 0, false);
  });

  const modalEl = document.getElementById("dayModal");
  if (modalEl) {
    modalEl.querySelectorAll(".transaction-container").forEach((container) => {
      const rows = Array.from(container.querySelectorAll(".entry-row"));
      rows.forEach((row, rowIndex) => {
        row.querySelectorAll("input").forEach((input) => {
          input.value = "";
        });
        const datetimeEl = row.querySelector(".current-datetime");
        if (datetimeEl) {
          datetimeEl.textContent = "";
          datetimeEl.removeAttribute("data-timestamp");
        }
        if (rowIndex === 0) {
          row.dataset.suppressTimestamp = "true";
        } else {
          row.remove();
        }
      });
    });
  }
}

function showResetFeedback(message) {
  const feedbackEl = document.getElementById("resetFeedback");
  if (!feedbackEl) {
    window.alert(message);
    return;
  }

  if (resetFeedbackTimeoutId) {
    window.clearTimeout(resetFeedbackTimeoutId);
  }

  feedbackEl.textContent = message;
  feedbackEl.classList.remove("d-none");
  feedbackEl.classList.remove("show");
  // Force a reflow so the animation restarts when the class is added again.
  void feedbackEl.offsetWidth;
  feedbackEl.classList.add("show");

  resetFeedbackTimeoutId = window.setTimeout(() => {
    feedbackEl.classList.add("d-none");
    feedbackEl.classList.remove("show");
    resetFeedbackTimeoutId = null;
  }, 4000);
}

function resetPlanner() {
  const userConfirmed = window.confirm(RESET_CONFIRM_MESSAGE);
  if (!userConfirmed) {
    return;
  }

  clearPlannerStorage();
  resetPlannerForms();

  weekendNumbers.forEach((weekend) => {
    calculateWeekend(weekend);
  });

  showSection(0);
  showResetFeedback(RESET_SUCCESS_MESSAGE);

  const firstAssetInput = document.querySelector('input[name="asset1"]');
  if (firstAssetInput) {
    firstAssetInput.focus();
  }
}

weekendNumbers.forEach((weekend) => {
  const manageBtn = document.querySelector(`#Btn_Manage${weekend}`);
  if (manageBtn) {
    manageBtn.addEventListener("click", () => calculateWeekend(weekend));
  }
});

function attachAutoCalc(sectionIndex, weekend) {
  const section = document.querySelectorAll(".section")[sectionIndex];
  if (!section) return;
  const calcFn = () => calculateWeekend(weekend);
  section.querySelectorAll("input.number-input").forEach((inp) => {
    inp.addEventListener("input", calcFn);
  });
  calcFn();
}

document.addEventListener("DOMContentLoaded", () => {
  weekendNumbers.forEach((weekend, index) => {
    attachAutoCalc(index, weekend);
  });

  const handleStickyWidth = () => {
    document.querySelectorAll(".weekend-header-sticky").forEach((header) => {
      const rect = header.getBoundingClientRect();
      if (rect.top <= 0 && rect.bottom > 0) {
        header.classList.add("is-stuck");
      } else {
        header.classList.remove("is-stuck");
      }
    });
  };

  window.addEventListener("scroll", handleStickyWidth);
  handleStickyWidth();
});

document.addEventListener("DOMContentLoaded", function () {
  const modalEl = document.getElementById("dayModal");
  const dayButtons = document.querySelectorAll(
    ".day-modal-trigger[data-day][data-weekend]"
  );

  weekendNumbers.forEach((weekend) => {
    weekendDays.forEach((day) => {
      const savedRemain = localStorage.getItem(
        getWeekendStorageKey(weekend, day, "Remaining")
      );
      const displayEl = document.getElementById(`${day}_${weekend}_addTotal`);
      if (savedRemain !== null && displayEl) {
        const parsed = parseNumeric(savedRemain);
        displayEl.textContent = `Remaining: ${parsed.toLocaleString()}`;
      }
    });

    const storedFinal = localStorage.getItem(
      `Weekend${weekend}_Final_Remaining`
    );
    if (storedFinal !== null) {
      updateWeekendFinalRemainingDisplay(weekend, storedFinal, false);
    }
  });

  const refreshAllDays = () => {
    weekendNumbers.forEach((weekend) => {
      calculateWeekend(weekend);
    });
  };

  weekendNumbers
    .map((weekend) => document.querySelector(`input[name="asset${weekend}"]`))
    .filter(Boolean)
    .forEach((assetInput) => {
      assetInput.addEventListener("input", refreshAllDays);
    });

  if (!modalEl) {
    refreshAllDays();
    return;
  }

  const dayModal = new bootstrap.Modal(modalEl);
  const dayModalLabel = modalEl.querySelector("#dayModalLabel");
  const dayModalDescription = modalEl.querySelector("#dayModalDescription");
  const addContainer = modalEl.querySelector("#dayAddInputs");
  const paidContainer = modalEl.querySelector("#dayPaidInputs");

  const detailPlaceholders = {
    Add: "Detail (e.g. Salary, Bonus)",
    Paid: "Detail (e.g. Rent, Food)",
  };

  let currentDay = null;
  let currentWeekend = null;

  function formatDateTimeDisplay(input) {
    const date = typeof input === "string" ? new Date(input) : input;
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  function resolveTimestamp(rowData = {}) {
    if (rowData.timestamp) {
      const parsed = new Date(rowData.timestamp);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    if (rowData.date || rowData.time) {
      const isoSource = rowData.date
        ? `${rowData.date}T${rowData.time || "00:00"}`
        : `${new Date().toISOString().split("T")[0]}T${rowData.time}`;
      const parsed = new Date(isoSource);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  function createRow(detailPlaceholder, rowData = {}, options = {}) {
    const row = document.createElement("div");
    row.className = "mb-2 border rounded p-2 entry-row";
    row.innerHTML = `
      <p class="current-datetime text-muted mb-2"></p>
      <div class="input-group">
        <input type="text" class="form-control" placeholder="${detailPlaceholder}" />
        <input type="number" class="form-control" placeholder="Amount" />
        <button type="button" class="btn btn-success btn-add">+</button>
        <button type="button" class="btn btn-danger btn-remove">−</button>
      </div>
    `;

    const datetimeEl = row.querySelector(".current-datetime");
    const suppressTimestamp =
      options.hideTimestamp ||
      rowData.suppressTimestamp === true ||
      rowData.suppressTimestamp === "true";

    if (suppressTimestamp) {
      row.dataset.suppressTimestamp = "true";
      if (datetimeEl) {
        datetimeEl.textContent = "";
        datetimeEl.removeAttribute("data-timestamp");
      }
    } else {
      const timestamp = resolveTimestamp(rowData);
      if (datetimeEl) {
        datetimeEl.dataset.timestamp = timestamp;
        datetimeEl.textContent = formatDateTimeDisplay(timestamp);
      }
    }

    const detailInput = row.querySelector('input[type="text"]');
    const amountInput = row.querySelector('input[type="number"]');
    if (detailInput) {
      detailInput.value = rowData.detail || "";
    }
    if (amountInput) {
      amountInput.value = rowData.amount || "";
    }

    return row;
  }

  function ensureFirstRowSuppressed(container) {
    if (!container) return;
    const firstRow = container.querySelector(".entry-row");
    if (!firstRow) return;
    firstRow.dataset.suppressTimestamp = "true";
    const datetimeEl = firstRow.querySelector(".current-datetime");
    if (datetimeEl) {
      datetimeEl.textContent = "";
      datetimeEl.removeAttribute("data-timestamp");
    }
  }

  function renderContainer(container, weekend, day, type, detailPlaceholder) {
    if (!container) return;
    const storageKey = getWeekendStorageKey(weekend, day, type);
    container.dataset.storageKey = storageKey;
    container.dataset.placeholder = detailPlaceholder;
    container.dataset.day = day;
    container.dataset.weekend = String(weekend);
    const data = loadStoredArray(storageKey);
    container.innerHTML = "";
    if (data.length === 0) {
      container.appendChild(
        createRow(detailPlaceholder, { suppressTimestamp: true }, {
          hideTimestamp: true,
        })
      );
    } else {
      data.forEach((rowData, index) => {
        const normalizedRowData =
          index === 0
            ? { ...rowData, suppressTimestamp: true }
            : rowData;
        container.appendChild(
          createRow(detailPlaceholder, normalizedRowData, {
            hideTimestamp: index === 0,
          })
        );
      });
    }
    ensureFirstRowSuppressed(container);
  }

  function saveDataFromContainer(container) {
    if (!container) return;
    const storageKey = container.dataset.storageKey;
    if (!storageKey) return;

    const data = [];
    container.querySelectorAll(".entry-row").forEach((row) => {
      const datetimeEl = row.querySelector(".current-datetime");
      const suppressTimestamp = row.dataset.suppressTimestamp === "true";
      let timestamp = datetimeEl?.dataset.timestamp || null;

      if (suppressTimestamp) {
        if (datetimeEl) {
          datetimeEl.textContent = "";
          datetimeEl.removeAttribute("data-timestamp");
        }
        timestamp = null;
      } else {
        if (!timestamp) {
          timestamp = new Date().toISOString();
        }
        if (datetimeEl) {
          datetimeEl.dataset.timestamp = timestamp;
          datetimeEl.textContent = formatDateTimeDisplay(timestamp);
        }
      }

      const detail = row.querySelector('input[type="text"]').value;
      const amount = row.querySelector('input[type="number"]').value;
      data.push({ timestamp, detail, amount, suppressTimestamp });
    });

    localStorage.setItem(storageKey, JSON.stringify(data));

    const day = container.dataset.day;
    const weekend = Number.parseInt(container.dataset.weekend, 10);
    if (day && Number.isFinite(weekend)) {
      calculateWeekend(weekend);
    }
  }

  function handleContainerClick(event) {
    const container = event.currentTarget;
    if (!container) return;

    if (event.target.classList.contains("btn-remove")) {
      const row = event.target.closest(".entry-row");
      if (row && container.querySelectorAll(".entry-row").length > 1) {
        row.remove();
        ensureFirstRowSuppressed(container);
        saveDataFromContainer(container);
      }
    }

    if (event.target.classList.contains("btn-add")) {
      const placeholder = container.dataset.placeholder || "";
      container.appendChild(createRow(placeholder));
      ensureFirstRowSuppressed(container);
      saveDataFromContainer(container);
    }
  }

  function handleContainerInput(event) {
    const container = event.currentTarget;
    if (!container) return;
    saveDataFromContainer(container);
  }

  [addContainer, paidContainer]
    .filter(Boolean)
    .forEach((container) => {
      container.addEventListener("click", handleContainerClick);
      container.addEventListener("input", handleContainerInput);
    });

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const day = btn.dataset.day;
      const weekend = Number.parseInt(btn.dataset.weekend, 10);
      if (!day || Number.isNaN(weekend)) {
        return;
      }
      currentDay = day;
      currentWeekend = weekend;

      if (dayModalLabel) {
        dayModalLabel.textContent = `${day} Details`;
      }
      if (dayModalDescription) {
        dayModalDescription.textContent = `Manage your ${day} transactions:`;
      }

      renderContainer(
        addContainer,
        weekend,
        day,
        "Add",
        detailPlaceholders.Add
      );
      renderContainer(
        paidContainer,
        weekend,
        day,
        "Paid",
        detailPlaceholders.Paid
      );

      dayModal.show();
      calculateWeekend(weekend);
    });
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    if (currentDay !== null && currentWeekend !== null) {
      calculateWeekend(currentWeekend);
      currentDay = null;
      currentWeekend = null;
    }
  });

  refreshAllDays();
});

document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.getElementById("resetPlannerButton");
  if (!resetButton) {
    return;
  }

  resetButton.addEventListener("click", resetPlanner);
});