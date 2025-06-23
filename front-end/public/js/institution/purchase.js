import { flash } from '../../script.js';
import { purchaseCredits, getMyCredits } from '../../api/credits.js';

console.log('🛠️ purchase.js loaded');

// Load and display current credits
async function loadCurrentCredits() {
  try {
    const creditsData = await getMyCredits();
    const creditsDisplay = document.getElementById('current-credits');
    if (creditsDisplay) {
      creditsDisplay.textContent = creditsData.credits || '0';
    }
  } catch (err) {
    console.error('🛠️ Failed to load credits:', err);
    flash('Could not load current credit balance');
  }
}

// Load credits on page load
document.addEventListener('DOMContentLoaded', loadCurrentCredits);

const form = document.querySelector('#purchase-form');
if (!form) {
  console.error('⚠️ #purchase-form not found!');
} else {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('🛠️ submit event fired');

    const amount = Number(form.amount.value);
    console.log('🛠️ form values:', { amount });

    try {
      // Institution name now comes from JWT on the server side
      const response = await purchaseCredits({ amount });
      console.log('🛠️ API response:', response);

      // orchestrator now returns { status, message }
      if (response.message) {
        flash(response.message);
      } else {
        flash('Purchased successfully!');
      }

      // Refresh credits display after purchase
      loadCurrentCredits();

    } catch (err) {
      console.error('🛠️ purchaseCredits error:', err);
      flash(err.message || 'Purchase failed');
    }
  });
}
