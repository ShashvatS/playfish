/* eslint-env browser */
(function() {
  'use strict';

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
            console.log(response.code);
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
    var copyText = document.getElementById('code');
    copyText.select();
    document.execCommand('Copy');
    copyText.blur();

    var notification = document.querySelector('.mdl-js-snackbar');
    var data = {
      message: 'Gamecode copied!'
    };
    notification.MaterialSnackbar.showSnackbar(data);
  }

  // Your custom JavaScript goes here
})();
