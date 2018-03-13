$(document).ready(() => {
  $('#captcha').submit(function() {
    $(this).ajaxSubmit({
      url: 'create',
      error: xhr => {
        return status('Error: ' + xhr.status);
      },
      success: response => {
        if ($('#code').text() !== '') {
          return;
        }
        if (response.pass) {
          $('#code').val(response.code);

          const notification = document.querySelector('.mdl-js-snackbar');
          const data = {
            message: 'Game created'
          };
          notification.MaterialSnackbar.showSnackbar(data);
        } else {
          const notification = document.querySelector('.mdl-js-snackbar');
          const data = {
            message: 'reCAPTCHA failed'
          };
          notification.MaterialSnackbar.showSnackbar(data);
        }
      }
    });

    return false;
  });
});

function copyGameCode() {
  const copyText = document.getElementById('code');
  copyText.select();
  document.execCommand('Copy');
  copyText.blur();

  const notification = document.querySelector('.mdl-js-snackbar');
  const data = {
    message: 'Gamecode copied!'
  };
  notification.MaterialSnackbar.showSnackbar(data);
}
