const ownedEl = document.getElementById('owned');
const ownershipEl = document.getElementById('ownership');
const priceEl = document.getElementById('price');
const valueEl = document.getElementById('value');


const TOTAL_SHARES = 100;
let owned = 0;
let price = 10;


function updateUI() {
    ownedEl.textContent = owned;
    ownershipEl.textContent = ((owned / TOTAL_SHARES) * 100).toFixed(1) + '%';
    priceEl.textContent = '$' + price.toFixed(2);
    valueEl.textContent = '$' + (owned * price).toFixed(2);
}


document.getElementById('buy').addEventListener('click', () => {
    if (owned < TOTAL_SHARES) owned++;
    updateUI();
});


document.getElementById('sell').addEventListener('click', () => {
    if (owned > 0) owned--;
    updateUI();
});


document.getElementById('changePrice').addEventListener('click', () => {
    price = parseFloat((Math.random() * 20 + 5).toFixed(2));
    updateUI();
});


updateUI();