/* showToast, showScreen defined in index.html */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('captcha');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch('/create', {
      method: 'POST',
      body: new URLSearchParams(formData),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(res => res.json())
      .then(response => {
        if (response.pass) {
          const code = response.code;
          // Fill in hidden input (used by goToJoinFromHost)
          document.getElementById('code').value = code;
          // Fill visible code display
          const codeDisplay = document.getElementById('code-display');
          if (codeDisplay) codeDisplay.textContent = code;
          // Fill share link
          const shareUrl = location.origin + location.pathname + '?gamecode=' + code;
          const shareLinkInput = document.getElementById('share-link-input');
          if (shareLinkInput) shareLinkInput.value = shareUrl;
          // Show result block
          const result = document.getElementById('host-result');
          if (result) result.style.display = 'block';
          // Update browser URL
          history.replaceState(null, '', '?gamecode=' + code);
          // Pre-fill join screen
          document.getElementById('gamecode').value = code;
          showToast('Game created!');
        } else {
          showToast('reCAPTCHA failed — please try again.');
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
      })
      .catch(() => showToast('Network error — please try again.'));
  });
});
