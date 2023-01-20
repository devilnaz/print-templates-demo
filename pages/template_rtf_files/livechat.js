/**
 *  Файл js для модуля livechat
 *  Created 17.05.2019 by Leonid P.
 **/

$(document).ready(function () {
    // Закрытие чата
    $('.close__button_carrot').on('click', function (e) {
        e.stopPropagation();
        $('.carrotquest-css-reset').hide();
        $('a.header__user-item--online-consultant').removeClass('ok_opened');
    });


    $('a.header__user-item--online-consultant').on('click', function (e) {
        e.preventDefault();
        let $this = $(this);

        if ( $this.hasClass('ok_opened') ) {
            $('.carrotquest-css-reset').hide();
            $this.removeClass('ok_opened');
        } else {
            $('.carrotquest-css-reset').css('display', 'inline');
            $this.addClass('ok_opened');
            // Передача события клика в iframe
            document.getElementById('carrot-messenger-frame').contentWindow.postMessage({ "need_scroll": true }, "*");
        }
    });

    // Клик по online consult в меню окна чата
    $('button.message_window_menu_ok').click(function () {
       $('#message_window_space > div').hide();
       $('#message_window_managerOk').show();
    });
});
