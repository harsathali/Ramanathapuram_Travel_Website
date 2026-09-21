/**
 * RAMANATHAPURAM DISTRICT TOURISM WEBSITE
 * Contact Page AJAX Logic (Formspree endpoint: https://formspree.io/f/mljddqnj)
 * Paramakudi Bus Stand Location Handling
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const statusAlert = document.getElementById('form-status-alert');
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Send Message';

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !message) {
            showAlert('error', 'Please fill in all required fields (Name, Email, and Message).');
            return;
        }

        // Loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Transmitting...';
        }
        hideAlert();

        // Prepare FormData
        const formData = new FormData(contactForm);

        try {
            const response = await fetch('https://formspree.io/f/mljddqnj', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Success requirement: "MESSAGE SENT SUCCESSFULLY"
                showAlert('success', '<i class="fas fa-check-circle"></i> MESSAGE SENT SUCCESSFULLY! Thank you for reaching out. We will get back to you shortly.');
                contactForm.reset();
            } else {
                const data = await response.json();
                if (data && data.errors) {
                    const errorMsg = data.errors.map(err => err.message).join(', ');
                    showAlert('error', `Submission error: ${errorMsg}`);
                } else {
                    showAlert('error', 'Unable to send message right now. Please connect via WhatsApp or direct phone.');
                }
            }
        } catch (error) {
            showAlert('error', 'Network error encountered. Please check your internet connection.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
        }
    });

    function showAlert(type, htmlContent) {
        if (!statusAlert) return;
        statusAlert.className = `form-status-alert ${type}`;
        statusAlert.innerHTML = htmlContent;
        statusAlert.style.display = 'flex';
        statusAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideAlert() {
        if (!statusAlert) return;
        statusAlert.style.display = 'none';
        statusAlert.className = 'form-status-alert';
        statusAlert.innerHTML = '';
    }
}
