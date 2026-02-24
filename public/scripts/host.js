$(document).ready(() => {
  $('#captcha').submit(function (e) {
    e.preventDefault();

    if ($('#code').val() !== '') {
      return;
    }

    // Serialize form so the reCAPTCHA token is included
    const formData = new FormData(this);

    fetch('/create', {
      method: 'POST',
      body: new URLSearchParams(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(res => res.json())
      .then(response => {
        const notification = document.querySelector('.mdl-js-snackbar');
        if (response.pass) {
          $('#code').val(response.code);
          notification.MaterialSnackbar.showSnackbar({ message: 'Game created!' });
        } else {
          notification.MaterialSnackbar.showSnackbar({ message: 'reCAPTCHA failed — please try again.' });
          // Reset reCAPTCHA so user can try again
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
      })
      .catch(() => {
        const notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar({ message: 'Network error — please try again.' });
      });
  });
});

function copyGameCode() {
  const copyText = document.getElementById('code');
  copyText.select();
  document.execCommand('Copy');
  copyText.blur();

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({ message: 'Game code copied!' });
}
