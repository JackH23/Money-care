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
let currentIndex = 0;

const weekend1Days = [
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

function getWeekend1StorageKey(day, type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "add") {
    return day === "Monday" ? "Monday_Add" : `Weekend1_${day}_Add`;
  }
  if (normalized === "paid") {
    return day === "Monday" ? "Monday_Paid" : `Weekend1_${day}_Paid`;
  }
  if (normalized === "remaining") {
    return day === "Monday" ? "Monday_1_addTotal" : `Weekend1_${day}_Remaining`;
  }
  return `Weekend1_${day}_${type}`;
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
  sections.forEach((section, i) => {
    section.classList.toggle("active", i === index);
  });
}

document.getElementById("nextBtn").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % sections.length;
  showSection(currentIndex);
});

document.getElementById("prevBtn").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + sections.length) % sections.length;
  showSection(currentIndex);
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

function updateWeekend1DayTotals(day) {
  const assetInput = document.querySelector('input[name="asset1"]');
  const assetVal = parseNumeric(assetInput?.value || "0");

  const paidData = loadStoredArray(getWeekend1StorageKey(day, "Paid"));
  const addData = loadStoredArray(getWeekend1StorageKey(day, "Add"));

  const paidTotal = paidData.reduce(
    (sum, row) => sum + parseNumeric(row?.amount || 0),
    0
  );
  const addTotal = addData.reduce(
    (sum, row) => sum + parseNumeric(row?.amount || 0),
    0
  );

  const totalInput = document.querySelector(
    `input[name="Weekend_1_${day}"]`
  );
  if (totalInput) {
    totalInput.value = paidTotal.toLocaleString();
    localStorage.setItem(`Weekend_1_${day}`, totalInput.value);
  }

  const remaining = assetVal + addTotal - paidTotal;
  const displayEl = document.getElementById(`${day}_1_addTotal`);
  if (displayEl) {
    displayEl.textContent = `Remaining: ${remaining.toLocaleString()}`;
  }

  localStorage.setItem(
    getWeekend1StorageKey(day, "Remaining"),
    remaining
  );
}

function calculateWeekend1() {
  weekend1Days.forEach(updateWeekend1DayTotals);
}

document
  .querySelector("#Btn_Manage1")
  .addEventListener("click", calculateWeekend1);

function calculateWeekend2() {
  // Monday
  const assetInput = document.querySelector('input[name="asset2"]');
  const mondayInput = document.querySelector('input[name="Weekend_2_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_2_left"]');

  const assetVal =
    parseFloat((assetInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayVal =
    parseFloat((mondayInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem("weekend2_Monday_1", mondayLeftInput.value);

  // Tuesday
  const tuesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Tuesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const tuesdayLeftInput = document.querySelector(
    'input[name="Tuesday_2_left"]'
  );
  const tuesdayLeft = mondayLeft - tuesday;
  tuesdayLeftInput.value = tuesdayLeft.toLocaleString();
  localStorage.setItem("Tuesday_2_left", tuesdayLeftInput.value);

  // Wednesday + Thursday
  const wednesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Wednesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const thursday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Thursday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;

  const totalWeekUsed = wednesday + thursday;

  // Update Thursday result
  const resultInput = document.querySelector('input[name="Weekend_2_result"]');
  resultInput.value = totalWeekUsed.toLocaleString();

  // Calculate Thursday LEFT
  const thursdayLeftInput = document.querySelector(
    'input[name="Thursday_2_left"]'
  );
  const thursdayLeft = tuesdayLeft - totalWeekUsed;
  thursdayLeftInput.value = thursdayLeft.toLocaleString();

  // Friday
  const friday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Friday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const fridayLeft = thursdayLeft - friday;
  const fridayLeftInput = document.querySelector('input[name="Friday_2_left"]');
  fridayLeftInput.value = fridayLeft.toLocaleString();

  // Saturday
  const saturday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Saturday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const saturdayLeft = fridayLeft - saturday;
  const saturdayLeftInput = document.querySelector(
    'input[name="Saturday_2_left"]'
  );
  saturdayLeftInput.value = saturdayLeft.toLocaleString();

  // Sunday
  const sunday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_2_Sunday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const sundayLeft = saturdayLeft - sunday;
  const sundayLeftInput = document.querySelector('input[name="Sunday_2_left"]');
  sundayLeftInput.value = sundayLeft.toLocaleString();

  // Save all results to localStorage
  localStorage.setItem("weekend2_Tuesday_1", tuesdayLeftInput.value);
  localStorage.setItem("weekend2_Thursday_1", resultInput.value);
  localStorage.setItem("weekend2_Thursday_2", thursdayLeftInput.value);
  localStorage.setItem("weekend2_Friday_1", fridayLeftInput.value);
  localStorage.setItem("weekend2_Saturday_1", saturdayLeftInput.value);
  localStorage.setItem("weekend2_Sunday_1", sundayLeftInput.value);
}

document
  .querySelector("#Btn_Manage2")
  .addEventListener("click", calculateWeekend2);

function calculateWeekend3() {
  // Monday
  const assetInput = document.querySelector('input[name="asset3"]');
  const mondayInput = document.querySelector('input[name="Weekend_3_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_3_left"]');

  const assetVal =
    parseFloat((assetInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayVal =
    parseFloat((mondayInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem("weekend3_Monday_1", mondayLeftInput.value);

  // Tuesday
  const tuesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Tuesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const tuesdayLeftInput = document.querySelector(
    'input[name="Tuesday_3_left"]'
  );
  const tuesdayLeft = mondayLeft - tuesday;
  tuesdayLeftInput.value = tuesdayLeft.toLocaleString();
  localStorage.setItem("weekend3_Tuesday_1", tuesdayLeftInput.value);

  // Wednesday
  const wednesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Wednesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const result1 =
    parseFloat(
      (
        document.querySelector('input[name="Wednesday_3_result1"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const result2Input = document.querySelector(
    'input[name="Wednesday_3_result2"]'
  );
  const wednesdayLeftInput = document.querySelector(
    'input[name="Wednesday_3_left"]'
  );

  const result2 = wednesday + result1;
  result2Input.value = result2.toLocaleString();

  const wednesdayLeft = tuesdayLeft - result2;
  wednesdayLeftInput.value = wednesdayLeft.toLocaleString();

  localStorage.setItem("weekend3_Wednesday_2", result2Input.value);
  localStorage.setItem("weekend3_Wednesday_3", wednesdayLeftInput.value);

  // Thursday
  const thursday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Thursday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const thursdayLeftInput = document.querySelector(
    'input[name="Thursday_3_left"]'
  );
  const thursdayLeft = wednesdayLeft - thursday;
  thursdayLeftInput.value = thursdayLeft.toLocaleString();

  localStorage.setItem("weekend3_Thursday_1", thursdayLeftInput.value);

  // Friday
  const friday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Friday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const fridayLeftInput = document.querySelector('input[name="Friday_3_left"]');
  const fridayLeft = thursdayLeft - friday;
  fridayLeftInput.value = fridayLeft.toLocaleString();

  localStorage.setItem("weekend3_Friday_1", fridayLeftInput.value);

  // Saturday
  const saturday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Saturday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const saturdayLeft = fridayLeft - saturday;
  const saturdayLeftInput = document.querySelector(
    'input[name="Saturday_3_left"]'
  );
  saturdayLeftInput.value = saturdayLeft.toLocaleString();

  // Sunday
  const sunday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_3_Sunday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const sundayLeft = saturdayLeft - sunday;
  const sundayLeftInput = document.querySelector('input[name="Sunday_3_left"]');
  sundayLeftInput.value = sundayLeft.toLocaleString();

  localStorage.setItem("weekend3_Saturday_1", saturdayLeftInput.value);
  localStorage.setItem("weekend3_Sunday_1", sundayLeftInput.value);
}

document
  .querySelector("#Btn_Manage3")
  .addEventListener("click", calculateWeekend3);

function calculateWeekend4() {
  // Monday
  const assetInput = document.querySelector('input[name="asset4"]');
  const mondayInput = document.querySelector('input[name="Weekend_4_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_4_left"]');

  const assetVal =
    parseFloat((assetInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayVal =
    parseFloat((mondayInput?.value || "0").replace(/,/g, "")) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem("weekend4_Monday_1", mondayLeftInput.value);

  // Tuesday + Wednesday + Thursday
  const tuesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Tuesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const wednesday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Wednesday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const thursday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Thursday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;

  const totalWeekUsed = tuesday + wednesday + thursday;

  // Update Weekend 4 result
  const resultInput = document.querySelector('input[name="Weekend_4_result"]');
  resultInput.value = totalWeekUsed.toLocaleString();

  localStorage.setItem("weekend4_Wednesday_1", resultInput.value);

  // Calculate Weekend4 LEFT
  const wednesdayLeftInput = document.querySelector(
    'input[name="Wednesday_4_left"]'
  );
  const wednesdayLeft = mondayLeft - totalWeekUsed;
  wednesdayLeftInput.value = wednesdayLeft.toLocaleString();

  localStorage.setItem("weekend4_Wednesday_2", wednesdayLeftInput.value);

  // Friday
  const friday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Friday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const fridayLeftInput = document.querySelector('input[name="Friday_4_left"]');
  const fridayLeft = wednesdayLeft - friday;
  fridayLeftInput.value = fridayLeft.toLocaleString();

  localStorage.setItem("weekend4_Friday_1", fridayLeftInput.value);

  // Saturday
  const saturday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Saturday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const saturdayLeft = fridayLeft - saturday;
  const saturdayLeftInput = document.querySelector(
    'input[name="Saturday_4_left"]'
  );
  saturdayLeftInput.value = saturdayLeft.toLocaleString();

  // Sunday
  const sunday =
    parseFloat(
      (
        document.querySelector('input[name="Weekend_4_Sunday"]').value || "0"
      ).replace(/,/g, "")
    ) || 0;
  const sundayLeft = saturdayLeft - sunday;
  const sundayLeftInput = document.querySelector('input[name="Sunday_4_left"]');
  sundayLeftInput.value = sundayLeft.toLocaleString();

  localStorage.setItem("weekend4_Saturday_1", saturdayLeftInput.value);
  localStorage.setItem("weekend4_Sunday_1", sundayLeftInput.value);
}

document
  .querySelector("#Btn_Manage4")
  .addEventListener("click", calculateWeekend4);

function attachAutoCalc(sectionIndex, calcFn) {
  const section = document.querySelectorAll(".section")[sectionIndex];
  if (!section) return;
  section.querySelectorAll("input.number-input").forEach((inp) => {
    inp.addEventListener("input", calcFn);
  });
  calcFn();
}

document.addEventListener("DOMContentLoaded", () => {
  attachAutoCalc(0, calculateWeekend1);
  attachAutoCalc(1, calculateWeekend2);
  attachAutoCalc(2, calculateWeekend3);
  attachAutoCalc(3, calculateWeekend4);

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
    ".day-modal-trigger[data-day]"
  );
  const assetInput = document.querySelector('input[name="asset1"]');

  weekend1Days.forEach((day) => {
    const savedRemain = localStorage.getItem(
      getWeekend1StorageKey(day, "Remaining")
    );
    const displayEl = document.getElementById(`${day}_1_addTotal`);
    if (savedRemain !== null && displayEl) {
      const parsed = parseNumeric(savedRemain);
      displayEl.textContent = `Remaining: ${parsed.toLocaleString()}`;
    }
  });

  const refreshAllDays = () => {
    weekend1Days.forEach(updateWeekend1DayTotals);
  };

  if (assetInput) {
    assetInput.addEventListener("input", refreshAllDays);
  }

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

  function createRow(detailPlaceholder, rowData = {}) {
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

    const timestamp = resolveTimestamp(rowData);
    const datetimeEl = row.querySelector(".current-datetime");
    if (datetimeEl) {
      datetimeEl.dataset.timestamp = timestamp;
      datetimeEl.textContent = formatDateTimeDisplay(timestamp);
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

  function renderContainer(container, day, type, detailPlaceholder) {
    if (!container) return;
    const storageKey = getWeekend1StorageKey(day, type);
    container.dataset.storageKey = storageKey;
    container.dataset.placeholder = detailPlaceholder;
    container.dataset.day = day;
    const data = loadStoredArray(storageKey);
    container.innerHTML = "";
    if (data.length === 0) {
      container.appendChild(createRow(detailPlaceholder));
    } else {
      data.forEach((rowData) =>
        container.appendChild(createRow(detailPlaceholder, rowData))
      );
    }
  }

  function saveDataFromContainer(container) {
    if (!container) return;
    const storageKey = container.dataset.storageKey;
    if (!storageKey) return;

    const data = [];
    container.querySelectorAll(".entry-row").forEach((row) => {
      const datetimeEl = row.querySelector(".current-datetime");
      let timestamp = datetimeEl?.dataset.timestamp;
      if (!timestamp) {
        timestamp = new Date().toISOString();
        if (datetimeEl) {
          datetimeEl.dataset.timestamp = timestamp;
          datetimeEl.textContent = formatDateTimeDisplay(timestamp);
        }
      }

      const detail = row.querySelector('input[type="text"]').value;
      const amount = row.querySelector('input[type="number"]').value;
      data.push({ timestamp, detail, amount });
    });

    localStorage.setItem(storageKey, JSON.stringify(data));

    const day = container.dataset.day;
    if (day) {
      updateWeekend1DayTotals(day);
    }
  }

  function handleContainerClick(event) {
    const container = event.currentTarget;
    if (!container) return;

    if (event.target.classList.contains("btn-remove")) {
      const row = event.target.closest(".entry-row");
      if (row && container.querySelectorAll(".entry-row").length > 1) {
        row.remove();
        saveDataFromContainer(container);
      }
    }

    if (event.target.classList.contains("btn-add")) {
      const placeholder = container.dataset.placeholder || "";
      container.appendChild(createRow(placeholder));
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
      if (!day) return;
      currentDay = day;

      if (dayModalLabel) {
        dayModalLabel.textContent = `${day} Details`;
      }
      if (dayModalDescription) {
        dayModalDescription.textContent = `Manage your ${day} transactions:`;
      }

      renderContainer(
        addContainer,
        day,
        "Add",
        detailPlaceholders.Add
      );
      renderContainer(
        paidContainer,
        day,
        "Paid",
        detailPlaceholders.Paid
      );

      dayModal.show();
      updateWeekend1DayTotals(day);
    });
  });

  modalEl.addEventListener("hidden.bs.modal", () => {
    if (currentDay) {
      updateWeekend1DayTotals(currentDay);
      currentDay = null;
    }
  });

  refreshAllDays();
});
