const birthDateInput = document.getElementById('birthDate');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const resultEl = document.getElementById('result');
const statsEl = document.getElementById('stats');
const timerEl = document.getElementById('timer');

let timerInterval;
let currentBirthDate = null;

calculateBtn.addEventListener('click', handleCalculation);
clearBtn.addEventListener('click', clearAll);
birthDateInput.addEventListener('input', formatDateInput);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTimer();
    } else if (currentBirthDate) {
        startTimer(currentBirthDate);
    }
});

function handleCalculation() {
    const originalText = calculateBtn.textContent;
    calculateBtn.textContent = 'Calculating...';
    calculateBtn.disabled = true;

    setTimeout(() => {
        const birthDate = parseBirthDate(birthDateInput.value);
        if (!birthDate) {
            showResult('Please enter a valid date in DD/MM/YYYY format.', false);
            hideDetails();
            calculateBtn.textContent = originalText;
            calculateBtn.disabled = false;
            return;
        }

        const now = new Date();
        if (birthDate > now) {
            showResult('Birth date cannot be in the future.', false);
            hideDetails();
            calculateBtn.textContent = originalText;
            calculateBtn.disabled = false;
            return;
        }

        currentBirthDate = birthDate;
        const age = getAgeBreakdown(birthDate, now);

        updateStats(age, birthDate, now);
        showResult(`You are <strong>${age.years}</strong> years, <strong>${age.months}</strong> months, and <strong>${age.days}</strong> days old.`, true);
        startTimer(birthDate);

        calculateBtn.textContent = originalText;
        calculateBtn.disabled = false;
    }, 280);
}

function parseBirthDate(dateStr) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    date.setHours(0, 0, 0, 0);
    return date;
}

function getAgeBreakdown(fromDate, toDate) {
    let years = toDate.getFullYear() - fromDate.getFullYear();
    let months = toDate.getMonth() - fromDate.getMonth();
    let days = toDate.getDate() - fromDate.getDate();

    if (days < 0) {
        months -= 1;
        const previousMonthDays = new Date(toDate.getFullYear(), toDate.getMonth(), 0).getDate();
        days += previousMonthDays;
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months, days };
}

function updateStats(age, birthDate, now) {
    const msDiff = now - birthDate;
    const totalDays = Math.floor(msDiff / (24 * 60 * 60 * 1000));

    document.getElementById('statYears').textContent = String(age.years);
    document.getElementById('statMonths').textContent = String(age.months);
    document.getElementById('statDays').textContent = String(age.days);
    document.getElementById('statTotalDays').textContent = totalDays.toLocaleString();
    document.getElementById('nextBirthday').textContent = getNextBirthdayText(birthDate, now);

    statsEl.hidden = false;
}

function getNextBirthdayText(birthDate, now) {
    const thisYear = now.getFullYear();
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());

    if (nextBirthday < now) {
        nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    const diffMs = nextBirthday - now;
    const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return `${formatter.format(nextBirthday)} (${diffDays} day${diffDays === 1 ? '' : 's'} left)`;
}

function startTimer(birthDate) {
    stopTimer();
    timerEl.hidden = false;

    timerInterval = setInterval(() => {
        const now = new Date();
        const elapsed = now - birthDate;

        const totalSeconds = Math.floor(elapsed / 1000);
        const seconds = totalSeconds % 60;
        const totalMinutes = Math.floor(totalSeconds / 60);
        const minutes = totalMinutes % 60;
        const totalHours = Math.floor(totalMinutes / 60);
        const hours = totalHours % 24;
        const totalDays = Math.floor(totalHours / 24);

        const years = Math.floor(totalDays / 365.25);
        const remainingDaysAfterYears = Math.floor(totalDays - years * 365.25);
        const months = Math.floor(remainingDaysAfterYears / 30.44);
        const days = Math.floor(remainingDaysAfterYears - months * 30.44);

        document.getElementById('years').textContent = padNumber(years);
        document.getElementById('months').textContent = padNumber(months);
        document.getElementById('days').textContent = padNumber(days);
        document.getElementById('hours').textContent = padNumber(hours);
        document.getElementById('minutes').textContent = padNumber(minutes);
        document.getElementById('seconds').textContent = padNumber(seconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerEl.hidden = true;
}

function hideDetails() {
    statsEl.hidden = true;
    stopTimer();
}

function showResult(message, success) {
    resultEl.className = success ? 'result show' : 'result error';
    resultEl.innerHTML = message;
}

function clearAll() {
    birthDateInput.value = '';
    currentBirthDate = null;
    resultEl.className = 'result';
    resultEl.textContent = '';
    hideDetails();
    birthDateInput.focus();
}

function padNumber(num) {
    return String(num).padStart(2, '0');
}

function formatDateInput(event) {
    let value = event.target.value.replace(/\D/g, '').slice(0, 8);

    if (value.length > 4) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    event.target.value = value;
}
