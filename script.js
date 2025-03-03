document.getElementById('calculateBtn').addEventListener('click', handleCalculation);

function handleCalculation() {
    const button = document.getElementById('calculateBtn');
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'Calculating...';
    button.disabled = true;
    
    // Simulate loading for smooth animation
    setTimeout(() => {
        calculateAge();
        button.textContent = originalText;
        button.disabled = false;
    }, 800);
}

let timerInterval;

function calculateAge() {
    const birthDateStr = document.getElementById('birthDate').value;
    
    // Check if the date format is correct (DD/MM/YYYY)
    if (!isValidDateFormat(birthDateStr)) {
        showResult('👉 Please enter date in DD/MM/YYYY format', false);
        stopTimer();
        return;
    }

    // Convert DD/MM/YYYY to YYYY-MM-DD for Date object
    const [day, month, year] = birthDateStr.split('/');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    if (isNaN(birthDate)) {
        showResult('👉 Please enter a valid date', false);
        stopTimer();
        return;
    }

    if (birthDate > today) {
        showResult('🤔 Birth date cannot be in the future', false);
        stopTimer();
        return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months = months + 12;
    }

    if (days < 0) {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, birthDate.getDate());
        days = Math.floor((today - lastMonth) / (1000 * 60 * 60 * 24));
    }

    const message = `
        🎉 Your age is:
        <span style="display: block; font-size: 1.2em; margin: 10px 0; font-weight: bold;">
            ${days} days/${months} months/${years} years
        </span>
        ✨ That's ${Math.floor(years * 365 + months * 30.44 + days)} total days!
    `;

    startTimer(birthDate);
    showResult(message, true);
}

// Add this new function to validate date format
function isValidDateFormat(dateStr) {
    // Check if format matches DD/MM/YYYY
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(dateStr)) return false;

    // Check if it's a valid date
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return date.getDate() == day && date.getMonth() == month - 1 && date.getFullYear() == year;
}

function startTimer(birthDate) {
    stopTimer();
    
    const timerElement = document.querySelector('.timer');
    timerElement.classList.add('show');
    
    timerInterval = setInterval(() => {
        const now = new Date();
        const diff = now - birthDate;
        
        const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
        const remainingMs = diff % (365.25 * 24 * 60 * 60 * 1000);
        
        const months = Math.floor(remainingMs / (30.44 * 24 * 60 * 60 * 1000));
        const remainingAfterMonths = remainingMs % (30.44 * 24 * 60 * 60 * 1000);
        
        const days = Math.floor(remainingAfterMonths / (24 * 60 * 60 * 1000));
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

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
        document.querySelector('.timer').classList.remove('show');
    }
}

function padNumber(num) {
    return num.toString().padStart(2, '0');
}

// Clean up timer when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopTimer();
    } else {
        const birthDate = new Date(document.getElementById('birthDate').value);
        if (!isNaN(birthDate) && birthDate < new Date()) {
            startTimer(birthDate);
        }
    }
});

function showResult(message, isSuccess) {
    const result = document.getElementById('result');
    result.innerHTML = message;
    
    // Remove existing classes
    result.className = 'result';
    
    // Force a reflow
    void result.offsetWidth;
    
    // Add appropriate classes
    result.className = 'result ' + (isSuccess ? 'show' : 'show error');
}

// Add input animation
document.getElementById('birthDate').addEventListener('focus', function() {
    this.parentElement.classList.add('active');
});

document.getElementById('birthDate').addEventListener('blur', function() {
    this.parentElement.classList.remove('active');
});

// Add input formatting helper
document.getElementById('birthDate').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 2) {
            value = value;
        } else if (value.length <= 4) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        } else {
            value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
        }
    }
    e.target.value = value;
});
