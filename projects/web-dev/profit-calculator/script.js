function calculateResults() {
    const partElements = document.querySelectorAll('.part');
    let totalPrice = 0;
    let totalProfit = 0;

    partElements.forEach((part) => {
        const priceInput = part.querySelector('input[id^="price"]');
        const profitInput = part.querySelector('input[id^="profit"]');
        const quantityInput = part.querySelector('input[id^="quantity"]');

        const price = parseFloat(priceInput.value) || 0;
        const profit = parseFloat(profitInput.value) || 0;
        const quantity = parseFloat(quantityInput.value) || 0;

        totalPrice += price * quantity;
        totalProfit += profit * quantity;
    });

    document.getElementById('pricetab').textContent = totalPrice.toFixed(2);
    document.getElementById('profittab').textContent = totalProfit.toFixed(2);
    document.getElementById('finaltab').textContent = (totalPrice + totalProfit).toFixed(2);
}

const partElements = document.querySelectorAll('.part');
    partElements.forEach(part => {
        const inputs = part.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
          input.addEventListener('input', calculateResults);
            input.addEventListener('keyup', calculateResults); 
             input.addEventListener('paste', (event) => {
                 setTimeout(calculateResults, 0);
             });

        });
    });