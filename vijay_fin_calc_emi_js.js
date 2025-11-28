// ===============================
// EMI + BROKEN PERIOD CALCULATOR
// ===============================

function calculateEMI() {
    let P = parseFloat(document.getElementById("loanAmount").value);
    let annualRate = parseFloat(document.getElementById("annualRate").value);
    let months = parseInt(document.getElementById("tenure").value);
    let brokenDays = parseInt(document.getElementById("brokenDays").value) || 0;

    if (!P || !annualRate || !months) {
        alert("Please fill all fields!");
        return;
    }

    let r = annualRate / 12 / 100; // monthly interest rate

    // EMI formula
    let emi = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    let totalAmount = emi * months;
    let totalInterest = totalAmount - P;

    // Broken period interest (simple interest)
    let brokenInterest = (P * annualRate * brokenDays) / (365 * 100);

    // Updating UI
    document.getElementById("emiResult").innerText = emi.toFixed(2);
    document.getElementById("totalInterest").innerText = totalInterest.toFixed(2);
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
    document.getElementById("brokenInterest").innerText = brokenInterest.toFixed(2);

    document.getElementById("resultBox").style.display = "block";

    // Store globally for export
    window.emiData = {
        loanAmount: P,
        annualRate,
        months,
        emi: emi.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        brokenDays,
        brokenInterest: brokenInterest.toFixed(2)
    };
}

// ===============================
// EXPORT REPORT TRIGGER
// ===============================
function exportReport() {
    if (!window.emiData) {
        alert("Please calculate first!");
        return;
    }
    exportEMIReport(window.emiData);
}