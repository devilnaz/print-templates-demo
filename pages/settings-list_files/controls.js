/**
 * Created by ruslan on 26.09.14.
 * Скрипты горячих клавиш кб
 */
$(function () {
    // глобальный перехват клавиш
    $(document).on('keyup', function (event) {

        // номер клавиши
        var key = event.keyCode;
        // альт?
        var alt = event.altKey;
        // контрол?
        var ctrl = event.ctrlKey;
        // shift?
        var shift = event.shiftKey;

        // ----- бинды

        // ctrl+shift+alt+N добавить запись в подтаблицу
        if (ctrl && alt && shift && key === 78) {
            $("#add_line_in_subtable").trigger('click');
        }

        // ctrl+alt+N добавление новой записи
        else if (ctrl && alt && key === 78) {
            var add_new = $(".action-btns__item--add-agent");
            if (typeof add_new !== 'undefined') {
                var href = add_new.attr('href');
                if (typeof href !== 'undefined') {
                    location.href = href;
                }
            }
        }

        // ctrl + alt + S сохранение записи
        else if (ctrl && alt && key === 83) {
            $(".action-btns__item--save").trigger('click');
        }

        // ctr + alt + E редактирование записи
        else if (ctrl && alt && key === 69) {
            $(".action-btns__item--edit").trigger('click');
        }

        // alt + X удаление записи
        else if (alt && key === 88) {
            additional_actions('delete-line');
        }

        // alt + A архивирование записи
        else if (alt && key === 65) {
            additional_actions('archive-line');
        }

        // alt + P распечатать
        else if (alt && key === 80) {
            additional_actions('print-line');
        }

        // alt + L разослать email
        else if (alt && key === 76) {
            additional_actions('send-line');
        }

        // alt + M разослать sms
        else if (alt && key === 77) {
            additional_actions('sms-line');
        }

        // alt + H на главную
        else if (alt && key === 72) {
            location.href = $("a.headname").attr('href');
        }

        // alt + -> следующая запись
        else if (alt && key === 39) {
            location.href = $(".user-data__nav-link").eq(2).attr("href");
        }

        // alt + <- предыдущая запись
        else if (alt && key === 39) {
            location.href = $(".user-data__nav-link").eq(2).attr("href");
        }


        function additional_actions(id) {
            var obj = $('#' + id);
            if (typeof obj !== 'undefined') {
                var href = obj.attr('href');
                if (typeof href !== 'undefined' && href !== '') {
                    location.href = href;
                } else {
                    obj.trigger('click');
                }
            }
        }
    });
});