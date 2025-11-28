// ===============================
// CASHFLOW CALCULATION ENGINE
// ===============================

function switchBasis() {
    const basis = document.getElementById("basis").value;
    document.getElementById("salesSection").style.display = basis === "sales" ? "block" : "none";
    document.getElementById("incomeSection").style.display = basis === "income" ? "block" : "none";
}

// ===============================
// MAIN CASHFLOW CALCULATION
// ===============================
function calculateCashflow() {
    const basis = document.getElementById("basis").value;
    let inflow = 0;
    let outflow = 0;

    if (basis === "sales") {
        let perDaySales = num("perDaySales");
        let margin = num("margin");
        let directExp = num("directExp");
        let householdExp = num("householdExp");
        let childExp = num("childExp");
        let electricExp = num("electricExp");
        let emi = num("emiSales");

        // INFLOW
        inflow = perDaySales * 30 * (margin / 100);

        // OUTFLOW
        outflow = directExp + householdExp + childExp + electricExp + emi;

    } else {
        let perDayWage = num("perDayWage");
        let monthlyWage = num("monthlyWage");
        let houseExp = num("incomeHouseExp");
        let otherIncome = num("otherIncome");
        let indirectExp = num("indirectExp");
        let emi = num("emiIncome");

        // INFLOW
        inflow = (perDayWage * 30) + monthlyWage + otherIncome;

        // OUTFLOW
        outflow = houseExp + indirectExp + emi;
    }

    let disposable = inflow - outflow;

    // Update UI
    set("totalInflow", inflow.toFixed(2));
    set("totalOutflow", outflow.toFixed(2));
    set("disposableIncome", disposable.toFixed(2));

    document.getElementById("cashflowResult").style.display = "block";

    // Save for export
    window.cashflowData = {
        customer: document.getElementById("custName").value.trim(),
        basis,
        inflow: inflow.toFixed(2),
        outflow: outflow.toFixed(2),
        disposable: disposable.toFixed(2)
    };
}

// ===============================
// LOAN ELIGIBILITY CALCULATION
// ===============================
function calculateEligibility() {
    if (!window.cashflowData) {
        alert("Please calculate cashflow first");
        return;
    }

    let proposedEmi = num("proposedEmi");
    if (!proposedEmi) return alert("Enter proposed EMI");

    let disposable = parseFloat(window.cashflowData.disposable);

    if (proposedEmi > disposable) {
        set("eligibleLoan", "Not Eligible (EMI > Disposable)");
        return;
    }

    // Reverse EMI formula (loan amount from EMI):
    // P = EMI / r * (1 - (1 / (1+r)^n))
    // ASSUME 24 MONTHS & 24% RATE FIXED FOR NOW

    let r = 24 / 12 / 100;
    let months = 24;

    let P = proposedEmi * ((1 - (1 / Math.pow(1 + r, months))) / r);

    set("eligibleLoan", P.toFixed(2));
}

// ===============================
// EXPORT
// ===============================
function exportCashflow() {
    if (!window.cashflowData) {
        alert("Please calculate first!");
        return;
    }
    vfcExport.exportCashflowReport(window.cashflowData);
}

// ===============================
// HELPERS
// ===============================
function num(id) {
    return parseFloat(document.getElementById(id).value) || 0;
}
function set(id, val) {
    document.getElementById(id).innerText = val;
}