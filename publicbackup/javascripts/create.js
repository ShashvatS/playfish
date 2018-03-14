$(document).ready(() => {
    $('#captcha').submit(function () {
        $(this).ajaxSubmit({
            url: 'create',
            error: (xhr) => {
                return status('Error: ' + xhr.status);
            },
            success: (response) => {
                if ($('#code').text() != "") {
                    return;
                }
                if (response.pass) {
                    $('#error').text("");
                    $('#code').text(response.code);
                }
                else {
                    $('#error').text(response.reason);
                }
            }
        });

        return false;
    });
});
