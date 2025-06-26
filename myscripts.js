document.querySelectorAll('.number-input').forEach(input => {
    input.addEventListener('input', function (e) {
      // Remove all non-digit characters
      let rawValue = e.target.value.replace(/[^0-9]/g, '');
  
      // Format number with commas
      if (rawValue !== '') {
        e.target.value = Number(rawValue).toLocaleString();
      } else {
        e.target.value = '';
      }
    });
});  

const sections = document.querySelectorAll(".section");
let currentIndex = 0;

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
document.querySelectorAll('input.number-input').forEach(input => {
  const name = input.name;

  // Load saved value on page load
  const saved = localStorage.getItem(name);
  if (saved !== null) {
    input.value = saved;
  }

  // Save value on input
  input.addEventListener('input', () => {
    localStorage.setItem(name, input.value);
  });
});

function calculateWeekend1() {
  // Monday
  const assetInput = document.querySelector('input[name="asset1"]');
  const mondayInput = document.querySelector('input[name="Weekend_1_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_1_left"]');

  const assetVal = parseFloat((assetInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayVal = parseFloat((mondayInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem('Monday_1_left', mondayLeftInput.value);

  // Tuesday + Wednesday + Thursday
  const tuesday = parseFloat((document.querySelector('input[name="Weekend_1_Tuesday"]').value || '0').replace(/,/g, '')) || 0;
  const wednesday = parseFloat((document.querySelector('input[name="Weekend_1_Wednesday"]').value || '0').replace(/,/g, '')) || 0;
  const thursday = parseFloat((document.querySelector('input[name="Weekend_1_Thursday"]').value || '0').replace(/,/g, '')) || 0;

  const weekSpent = tuesday + wednesday + thursday;

  const resultInput = document.querySelector('input[name="Weekend_1_result"]');
  resultInput.value = weekSpent.toLocaleString();

  // Wednesday LEFT
  const wednesdayLeft = mondayLeft - weekSpent;
  const wednesdayLeftInput = document.querySelector('input[name="Wednesday_1_left"]');
  wednesdayLeftInput.value = wednesdayLeft.toLocaleString();

  // Friday
  const friday = parseFloat((document.querySelector('input[name="Weekend_1_Friday"]').value || '0').replace(/,/g, '')) || 0;
  const fridayLeft = wednesdayLeft - friday;
  const fridayLeftInput = document.querySelector('input[name="Friday_1_left"]');
  fridayLeftInput.value = fridayLeft.toLocaleString();

  // Saturday
  const saturday = parseFloat((document.querySelector('input[name="Weekend_1_Saturday"]').value || '0').replace(/,/g, '')) || 0;
  const saturdayLeft = fridayLeft - saturday;
  const saturdayLeftInput = document.querySelector('input[name="Saturday_1_left"]');
  saturdayLeftInput.value = saturdayLeft.toLocaleString();

  // Sunday
  const sunday = parseFloat((document.querySelector('input[name="Weekend_1_Sunday"]').value || '0').replace(/,/g, '')) || 0;
  const sundayLeft = saturdayLeft - sunday;
  const sundayLeftInput = document.querySelector('input[name="Sunday_1_left"]');
  sundayLeftInput.value = sundayLeft.toLocaleString();

  // Save all results to localStorage
  localStorage.setItem('weekend1_Wednesday_1', resultInput.value);
  localStorage.setItem('weekend1_Wednesday_2', wednesdayLeftInput.value);
  localStorage.setItem('weekend1_Friday_1', fridayLeftInput.value);
  localStorage.setItem('weekend1_Saturday_1', saturdayLeftInput.value);
  localStorage.setItem('weekend1_Sunday_1', sundayLeftInput.value);
}

document.querySelector('#Btn_Manage1').addEventListener('click', calculateWeekend1);

function calculateWeekend2() {
  // Monday
  const assetInput = document.querySelector('input[name="asset2"]');
  const mondayInput = document.querySelector('input[name="Weekend_2_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_2_left"]');

  const assetVal = parseFloat((assetInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayVal = parseFloat((mondayInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem('weekend2_Monday_1', mondayLeftInput.value);

  // Tuesday
  const tuesday = parseFloat((document.querySelector('input[name="Weekend_2_Tuesday"]').value || '0').replace(/,/g, '')) || 0;
  const tuesdayLeftInput = document.querySelector('input[name="Tuesday_2_left"]');
  const tuesdayLeft = mondayLeft - tuesday;
  tuesdayLeftInput.value = tuesdayLeft.toLocaleString();
  localStorage.setItem('Tuesday_2_left', tuesdayLeftInput.value);

  // Wednesday + Thursday
  const wednesday = parseFloat((document.querySelector('input[name="Weekend_2_Wednesday"]').value || '0').replace(/,/g, '')) || 0;
  const thursday = parseFloat((document.querySelector('input[name="Weekend_2_Thursday"]').value || '0').replace(/,/g, '')) || 0;

  const totalWeekUsed = wednesday + thursday;

  // Update Thursday result
  const resultInput = document.querySelector('input[name="Weekend_2_result"]');
  resultInput.value = totalWeekUsed.toLocaleString();

  // Calculate Thursday LEFT
  const thursdayLeftInput = document.querySelector('input[name="Thursday_2_left"]');
  const thursdayLeft = tuesdayLeft - totalWeekUsed;
  thursdayLeftInput.value = thursdayLeft.toLocaleString();

  // Friday
  const friday = parseFloat((document.querySelector('input[name="Weekend_2_Friday"]').value || '0').replace(/,/g, '')) || 0;
  const fridayLeft = thursdayLeft - friday;
  const fridayLeftInput = document.querySelector('input[name="Friday_2_left"]');
  fridayLeftInput.value = fridayLeft.toLocaleString();

  // Save all results to localStorage
  localStorage.setItem('weekend2_Tuesday_1', tuesdayLeftInput.value);
  localStorage.setItem('weekend2_Thursday_1', resultInput.value);
  localStorage.setItem('weekend2_Thursday_2', thursdayLeftInput.value);
  localStorage.setItem('weekend2_Friday_1', fridayLeftInput.value);
}

document.querySelector('#Btn_Manage2').addEventListener('click', calculateWeekend2);

function calculateWeekend3() {
  // Monday
  const assetInput = document.querySelector('input[name="asset3"]');
  const mondayInput = document.querySelector('input[name="Weekend_3_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_3_left"]');

  const assetVal = parseFloat((assetInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayVal = parseFloat((mondayInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem('weekend3_Monday_1', mondayLeftInput.value);

  // Tuesday
  const tuesday = parseFloat((document.querySelector('input[name="Weekend_3_Tuesday"]').value || '0').replace(/,/g, '')) || 0;
  const tuesdayLeftInput = document.querySelector('input[name="Tuesday_3_left"]');
  const tuesdayLeft = mondayLeft - tuesday;
  tuesdayLeftInput.value = tuesdayLeft.toLocaleString();
  localStorage.setItem('weekend3_Tuesday_1', tuesdayLeftInput.value);

  // Wednesday
  const wednesday = parseFloat((document.querySelector('input[name="Weekend_3_Wednesday"]').value || '0').replace(/,/g, '')) || 0;
  const result1 = parseFloat((document.querySelector('input[name="Wednesday_3_result1"]').value || '0').replace(/,/g, '')) || 0;
  const result2Input = document.querySelector('input[name="Wednesday_3_result2"]');
  const wednesdayLeftInput = document.querySelector('input[name="Wednesday_3_left"]');

  const result2 = wednesday + result1;
  result2Input.value = result2.toLocaleString();

  const wednesdayLeft = tuesdayLeft - result2;
  wednesdayLeftInput.value = wednesdayLeft.toLocaleString();

  localStorage.setItem('weekend3_Wednesday_2', result2Input.value);
  localStorage.setItem('weekend3_Wednesday_3', wednesdayLeftInput.value);

  // Thursday
  const thursday = parseFloat((document.querySelector('input[name="Weekend_3_Thursday"]').value || '0').replace(/,/g, '')) || 0;
  const thursdayLeftInput = document.querySelector('input[name="Thursday_3_left"]');
  const thursdayLeft = wednesdayLeft - thursday;
  thursdayLeftInput.value = thursdayLeft.toLocaleString();

  localStorage.setItem('weekend3_Thursday_1', thursdayLeftInput.value);

  // Friday
  const friday = parseFloat((document.querySelector('input[name="Weekend_3_Friday"]').value || '0').replace(/,/g, '')) || 0;
  const fridayLeftInput = document.querySelector('input[name="Friday_3_left"]');
  const fridayLeft = thursdayLeft - friday;
  fridayLeftInput.value = fridayLeft.toLocaleString();

  localStorage.setItem('weekend3_Friday_1', fridayLeftInput.value);
}

document.querySelector('#Btn_Manage3').addEventListener('click', calculateWeekend3);

function calculateWeekend4() {
  // Monday
  const assetInput = document.querySelector('input[name="asset4"]');
  const mondayInput = document.querySelector('input[name="Weekend_4_Monday"]');
  const mondayLeftInput = document.querySelector('input[name="Monday_4_left"]');

  const assetVal = parseFloat((assetInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayVal = parseFloat((mondayInput?.value || '0').replace(/,/g, '')) || 0;
  const mondayLeft = assetVal - mondayVal;

  mondayLeftInput.value = mondayLeft.toLocaleString();
  localStorage.setItem('weekend4_Monday_1', mondayLeftInput.value);

  // Tuesday + Wednesday + Thursday
  const tuesday = parseFloat((document.querySelector('input[name="Weekend_4_Tuesday"]').value || '0').replace(/,/g, '')) || 0;
  const wednesday = parseFloat((document.querySelector('input[name="Weekend_4_Wednesday"]').value || '0').replace(/,/g, '')) || 0;
  const thursday = parseFloat((document.querySelector('input[name="Weekend_4_Thursday"]').value || '0').replace(/,/g, '')) || 0;

  const totalWeekUsed = tuesday + wednesday + thursday;

  // Update Weekend 4 result
  const resultInput = document.querySelector('input[name="Weekend_4_result"]');
  resultInput.value = totalWeekUsed.toLocaleString();

  localStorage.setItem('weekend4_Wednesday_1', resultInput.value);

  // Calculate Weekend4 LEFT
  const wednesdayLeftInput = document.querySelector('input[name="Wednesday_4_left"]');
  const wednesdayLeft = mondayLeft - totalWeekUsed;
  wednesdayLeftInput.value = wednesdayLeft.toLocaleString();

  localStorage.setItem('weekend4_Wednesday_2', wednesdayLeftInput.value);

  // Friday
  const friday = parseFloat((document.querySelector('input[name="Weekend_4_Friday"]').value || '0').replace(/,/g, '')) || 0;
  const fridayLeftInput = document.querySelector('input[name="Friday_4_left"]');
  const fridayLeft = wednesdayLeft - friday;
  fridayLeftInput.value = fridayLeft.toLocaleString();

  localStorage.setItem('weekend4_Friday_1', fridayLeftInput.value);
}

document.querySelector('#Btn_Manage4').addEventListener('click', calculateWeekend4);

function attachAutoCalc(sectionIndex, calcFn) {
  const section = document.querySelectorAll('.section')[sectionIndex];
  if (!section) return;
  section.querySelectorAll('input.number-input').forEach(inp => {
    inp.addEventListener('input', calcFn);
  });
  calcFn();
}

document.addEventListener('DOMContentLoaded', () => {
  attachAutoCalc(0, calculateWeekend1);
  attachAutoCalc(1, calculateWeekend2);
  attachAutoCalc(2, calculateWeekend3);
  attachAutoCalc(3, calculateWeekend4);
});
