function compoundMonthly(monthly, years, interest) {
    let months = years * 12;
    let monthlyRate = interest / 100 / 12;
    let futureValue = 0;
    for (let i = 0; i < months; i++) {
        futureValue = (futureValue + monthly) * (1 + monthlyRate);
    }
    return futureValue;
}


function calculate() {
    const age = parseInt(document.getElementById("age").value);
    const monthly = parseFloat(document.getElementById("monthly").value);
    const rate = parseFloat(document.getElementById("returnRate").value);
    const delay = parseInt(document.getElementById("delay").value);


    const yearsInvestingNow = 65 - age;
    const yearsInvestingLater = yearsInvestingNow - delay;


    const nowVal = compoundMonthly(monthly, yearsInvestingNow, rate);
    const waitVal = compoundMonthly(monthly, yearsInvestingLater, rate);


    const cost = nowVal - waitVal;


    document.getElementById("nowValue").textContent = `$${nowVal.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
    document.getElementById("waitValue").textContent = `$${waitVal.toLocaleString(undefined, {maximumFractionDigits: 0})}`;
    document.getElementById("cost").textContent = `$${cost.toLocaleString(undefined, {maximumFractionDigits: 0})}`;


    document.getElementById("results").style.display = "block";
}