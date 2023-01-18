m_arr = []; // массив модификаторов с параметрами
sm_arr = []; // массив подмодификаторов
comm_arr = []; // массив комментариев
templ_debug = 0;

$(function () {
    if (templ_debug) {
        $("input[id^='templ_tmp']").show();
    }
    else {
        $("input[id^='templ_tmp']").hide();
        $("input[id^='templ_fill_ok']").hide();
        $("input[id^='templ_fill_link_ok']").hide();
    }
});

// Проверка, независимо от нажатой клавиши, например по событию onchange
var last_check_txt_timeout = 0;
function recheck_txt(id, addLinkID) {
    var cur_event = {};
    cur_event.keyCode = 13;
    cur_event.charCode = 13;
    if (typeof addLinkID !== "undefined") check_txt(id, cur_event, 1, addLinkID);
    else check_txt(id, cur_event, 1);
}

function clear_recheck_text() {
    if (last_check_txt_timeout) clearTimeout(last_check_txt_timeout);
    last_check_txt_timeout = 0;
}


function check_txt(id, event, timeout_check, addLinkID) {
    kcod = event.keyCode;
    ccod = event.charCode;
    //ccod = tmpl_getChar(event);

    // Если браузер iе, то
    if (typeof (ccod) == 'undefined') ccod = kcod;

    // Номе 36, End 35, Tab 9, <- 37, -> 39
    if ((kcod == 36 || kcod == 35 || kcod == 9 || kcod == 37 || kcod == 39) && ccod == 0) {
        return true;
    }
    // Ctrl+X, Ctrl+C, Ctrl+V
    if (kcod == 0 && (ccod == 120 || ccod == 99 || ccod == 118)) {
        return true;
    }
    // символ 0, Enter 13, BS 8, Del 46
    if (!(kcod == 0 || kcod == 13 || kcod == 8 || kcod == 46 ) && (ccod == 0)) {
        return false;
    }

    if (!timeout_check) {
        clear_recheck_text();
        if (typeof addLinkID !== "undefined") last_check_txt_timeout = setTimeout("recheck_txt(" + id + ",'" + addLinkID + "')", 1500);
        else last_check_txt_timeout = setTimeout("recheck_txt(" + id + ")", 1500);
    }

    // не пропускаем символ если шаблон заполнен
    if (typeof addLinkID !== "undefined") {
        if (kcod == 0 && $('#' + addLinkID).parent().find('#templ_rep' + id).get(0).value == '1') {
            //return false;
        }
    }
    else {
        if (kcod == 0 && $('#value' + id).parent().find('#templ_rep' + id).get(0).value == '1') {
            //return false;
        }
    }
    // разрешаем ввод символов после BS 8, Del 46
    if ((kcod == 8 || kcod == 46) && (ccod == 0)) {
        if (typeof addLinkID !== "undefined") set_fill_ok(id, 0, addLinkID);
        else set_fill_ok(id, 0);
    }
    if (typeof addLinkID !== "undefined") {
        f_note = $('#' + addLinkID).parent().find('#templ_note' + id).get(0);
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            f_note = $('#view_cell_' + id).parents('.user-data__mask-wrap').find('#view_templ_note' + id).get(0);
        } else {
            f_note = $('#value' + id).parent().find('#templ_note' + id).get(0);
        }
    }

    f_note.innerHTML = '';
    if (typeof addLinkID !== "undefined") {
        var inp = document.getElementById(addLinkID);
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            var inp = $('#view_cell_' + id);
        } else {
            var inp = document.getElementById('value' + id);
        }

    }
    tmpl_clean_bg(inp); // снимаем фон
    var val = $(inp).val(); // значение поля ввода текста
    if (typeof addLinkID !== "undefined") {
        var mask = $('#' + addLinkID).parent().find('#templ_tmp' + id).val();
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            var mask = $('#view_cell_' + id).parents('.user-data__mask-wrap').find('#view_templ_tmp' + id).val();
        } else {
            var mask = $('#value' + id).parent().find('#templ_tmp' + id).val();
        }

    }
    if (!check_template(mask)) { // проверить и заполнить массив модификаторов и массив комментариев
        return false;
    }

    var pos_cursor = getPos(inp); // определяем позицию курсора в поле ввода
    var txt = '';
    if (kcod == 13) { // Enter
        txt = val;
    }
    else if (kcod == 8) { // BS
        txt = val.substr(0, pos_cursor - 1) + val.substr(pos_cursor);
    }
    else if (kcod == 46 && ccod == 0) { // Del
        txt = val.substr(0, pos_cursor) + val.substr(pos_cursor + 1);
    }
    else { // символ
        txt = val.substr(0, pos_cursor) + String.fromCharCode(ccod);
        var txt2 = val.substr(0, pos_cursor) + String.fromCharCode(ccod); // текст слева от курсора + символ
        var resp2 = check_str(txt2); // используется m_arr
    }

    var resp = check_str(txt); // используется m_arr
    if ($('#view_block').css('display') !== 'none') {
        $(inp).parent().find('#view_templ_word' + id).html(resp.templ);
    } else {
        $(inp).parent().find('#templ_word' + id).html(resp.templ);
    }

    if (templ_debug) {
        if ($('#view_block').css('display') !== 'none') {
            err = $(inp).parent().find('#view_templ_err' + id).get(0);
        } else {
            err = $(inp).parent().find('#templ_err' + id).get(0);
        }
        err.innerHTML = '';
        if (typeof addLinkID !== "undefined") tmpl_show(id, resp, addLinkID);
        else tmpl_show(id, resp);
    }

    if (resp.error_com) { // есть ошибка
        f_note.innerHTML = resp.note;
        if (templ_debug) {
            err.innerHTML = lang.mask01;
            if (resp.num_less) {
                err.innerHTML = '';
            };
        }
        if (typeof addLinkID !== "undefined") set_fill_ok(id, 0, addLinkID);
        else set_fill_ok(id, 0);

        if (kcod == 13) { // Enter
            if (txt.length > 0) {
                if (!$(inp).hasClass('hidden-input')) {
                    inp.className += ' bg_err'
                } else if ($(inp).val() == '') {
                    $(inp).removeClass('error-value');
                } else {
                    $(inp).addClass('error-value');
                }
            };

            return false;
        }
        else if ((kcod == 8 || kcod == 46) && ccod == 0) { // BS, Del
            if (txt.length > 0) {
                if (!$(inp).hasClass('hidden-input')) {
                    inp.className += ' bg_err'
                } else if ($(inp).val() == '') {
                    $(inp).removeClass('error-value');
                } else {
                    $(inp).addClass('error-value');
                }
            };

            return true;
        }
        else { // ввод символа

            if (resp2.error_com) { // проверяем на корректн. символ и ошибку в другом месте
                if (templ_debug) err.innerHTML = lang.mask02 + ' "<b>' + String.fromCharCode(ccod) + '</b>" ' + lang.mask03;
                if ( resp2.mark == "[111"){
                    $(inp).val(txt);
                }
                return false;
            }
            else {
                if (templ_debug) {
                    err.innerHTML = lang.mask02 + ' "<b>' + String.fromCharCode(ccod) + '</b>" ' + lang.mask04;
                    //tmpl_show(id,resp2);
                }
                if (txt.length > 1) {
                    if (!$(inp).hasClass('hidden-input')) {
                        inp.className += ' bg_err'
                    } else {
                        $(inp).addClass('error-value');
                    }
                };

                return true;
            }
        }

    }
    else { // нет ошибки
        if (templ_debug) err.innerHTML = '';

        if (kcod == 13) { // Enter
            if (resp.mask_end) { // маска исчерпана
                if (!$(inp).hasClass('hidden-input')) {
                    inp.className += ' bg_fill';
                } else if ($(inp).val() == '') {
                    $(inp).removeClass('error-value');
                } else {
                    $(inp).removeClass('error-value');
                }

                if (typeof addLinkID !== "undefined") set_fill_ok(id, 1, addLinkID);
                else set_fill_ok(id, 1);
                return true;
            }
            if (resp.num_in_range) { //  при нахождении в доп.диапазоне
                if (resp.modif_last) {
                    if (!$(inp).hasClass('hidden-input')) {
                        inp.className += ' bg_fill';
                    } else {
                        $(inp).removeClass('error-value');
                    }

                    if (typeof addLinkID !== "undefined") set_fill_ok(id, 1, addLinkID);
                    else set_fill_ok(id, 1);
                    return true;
                }
                else {
                    f_note.innerHTML = resp.note;
                    if (typeof addLinkID !== "undefined") set_fill_ok(id, 0, addLinkID);
                    else set_fill_ok(id, 0);
                    return true;
                }
            }
            else { // вывод подсказки
                f_note.innerHTML = resp.note;
                if (typeof addLinkID !== "undefined") set_fill_ok(id, 0, addLinkID);
                else set_fill_ok(id, 0);
                if ($(inp).val() == '') {
                    $(inp).removeClass('error-value');
                } else if ($(inp).hasClass('hidden-input')) {
                    $(inp).addClass('error-value');
                }

                return true;
            }
        }
        if (resp.mask_end) { // сообщение об успешном заполнении поля
            if (!$(inp).hasClass('hidden-input')) {
                inp.className += ' bg_fill';
            } else {
                $(inp).removeClass('error-value');
            }

            if (typeof addLinkID !== "undefined") set_fill_ok(id, 1, addLinkID);
            else set_fill_ok(id, 1);
            return true;
        }
        if (typeof addLinkID !== "undefined") set_fill_ok(id, 0, addLinkID);
        else set_fill_ok(id, 0);
        return true;
    }
}


function check_click(id, addLinkID) {
    var f_note,
        this_error;
    if (typeof addLinkID !== "undefined") {
        f_note = $('#' + addLinkID).parent().find('#templ_note' + id).get(0);
        var inp = document.getElementById(addLinkID);
        var mask = $('#' + addLinkID).parent().find('#templ_tmp' + id).val();
        $('#templ_word' + id).parent().css('display', 'block');
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            var inp = $('#view_cell_' + id);
            if (inp.length > 0) {
                var inp_parent = inp.parents('.user-data__mask-wrap');
                if (inp_parent.length > 0) {
                    f_note = inp_parent.find('#view_templ_note' + id).get(0);
                    var mask = inp_parent.find('#view_templ_tmp' + id).val();
                    $('#view_templ_word' + id).parent().css('display', 'block');
                }
            }
        } else {
            f_note = $('#value' + id).parent().find('#templ_note' + id).get(0);
            var inp = document.getElementById('value' + id);
            var mask = $('#value' + id).parent().find('#templ_tmp' + id).val();
            $('#templ_word' + id).parent().css('display', 'block');
        }
    }
    if(!mask){
        return false;
    }
    if (f_note) {
        f_note.innerHTML = '';
    }

    tmpl_clean_bg(inp); // снимаем фон
    var txt = $(inp).val(); // поле ввода текста
    if (!check_template(mask)) { // проверить и заполнить массив модификаторов и массив комментариев
        return false;
    }

    var resp = check_str(txt); // возвращает объект с параметрами
    //document.getElementById('templ_word'+id).innerHTML = resp.templ;
    if (typeof addLinkID !== "undefined") {
        $('#' + addLinkID).parent().find('#templ_word' + id).html(resp.templ);
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            $('#view_cell_' + id).parents('.user-data__mask-wrap').find('#view_templ_word' + id).html(resp.templ);
        } else {
            $('#value' + id).parent().find('#templ_word' + id).html(resp.templ);
        }

    }
    if (templ_debug) {
        //err = document.getElementById('templ_err'+id);
        if (typeof addLinkID !== "undefined") err = $('#' + addLinkID).parent().find('#templ_err' + id).get(0);
        else err = $('#value' + id).parent().find('#templ_err' + id).get(0);
        err.innerHTML = '';
        if (typeof addLinkID !== "undefined") tmpl_show(id, resp, addLinkID);
        else tmpl_show(id, resp);
    }

    if (resp.error_com) { // есть ошибка
        f_note.innerHTML = resp.note;
        if (templ_debug) err.innerHTML = 'в тексте есть ошибка';
        //set_fill_ok(id,0);
        if (txt.length != 0) {
            if (!$(inp).hasClass('hidden-input')) {
                inp.className += ' bg_err'
            } else {
                $(inp).addClass('error-value');
            }
        };
        this_error = true;
    }
    else { // нет ошибки
        if (templ_debug) err.innerHTML = '';
        if (resp.mask_end) { // сообщение об успешном заполнении поля
            if (!$(inp).hasClass('hidden-input')) {
                inp.className += ' bg_fill';
            } else {
                $(inp).removeClass('error-value');
            }

        }
        else {
            //set_fill_ok(id,0);
        }
        this_error = false;
    }
    return this_error;
}

function check_str(str) {
    var ch = {};
    var txt = str;
    ch.txt = txt;
    ch.mask_end = false; // исчерпание маски
    ch.modif_last = false; // последний модификатор
    ch.error_com = false; // ошибка
    ch.error_last = false; // ошибка последнего символа
    ch.txt_rest = false; // остался лишний текст
    ch.txt_empty = false; // текст пуст
    ch.symbol_last = false; // последний символ тек.модификатора
    ch.num_less = false; // недостаточно символов (слов) для тек.модификатора
    ch.num_in_range = false; // кол-во находится в допустимом интервале для тек.модификатора
    ch.prev_mod = false; // корректное завершение предыдущего модификатора
    ch.part_eq = false; // совпадение по началу маски
    ch.mark = ''; // маркер точки выхода
    ch.mv = ''; // текущий модификатор
    ch.note = ''; // заметка

    var is_change = false;
    var val_to = 0;
    var mv = 0; // модификатор
    var len = 0;
    var min = 0;
    var max = 0;

    ch.templ = mask_in_word(); // словесное описание шаблона

    for (m = 0; m < m_arr.length; m++) { // цикл по модификаторам
        // определяем ch.modif_last с учетом возможного последнего модификатора T
        if (m + 1 >= m_arr.length - ((m_arr[m_arr.length - 1][0] == 'T') ? 1 : 0)) {
            ch.modif_last = true;
        }

        ch.symbol_last = false; // последний символ тек.модификатора
        ch.num_less = false; // недостаточно символов для тек.модификатора
        ch.num_in_range = false; // кол-во символов находится в допустимом интервале для тек.модификатора
        ch.part_eq = false; // совпадение по началу маски (для списков)
        ch.note = ''; // заметка

        mv = m_arr[m][0]; // модификатор
        len = m_arr[m][2];
        min = m_arr[m][3];
        max = m_arr[m][4];
        ch.mv = mv;

        if (mv == 'T') {  // модификатор T комментарий
            ch.symbol_last = true; // для выхода, если модификатора последний
        }

        else if (mv == '*') {  // модификатор * любой символ
            ch.note = explain_err(txt, txt.length, m, mv, len, min, max);
            if (max > 0) { // задан интервал кол-ва
                if (txt.length < min) {  // кол-во эл. ввода меньше min для модификатора
                    ch.num_less = true;
                    ch.mark = '*01';
                    return ch;
                }
                else if (txt.length < max) {  // кол-во эл. ввода в интервале min - max
                    ch.num_in_range = true;
                    ch.mark = '*02';
                    return ch;
                }
                else {  // кол-во эл. ввода достигло max длины
                    ch.num_in_range = true;
                    ch.symbol_last = true;
                    txt = txt.substr(max);  // отсекаем текст, меняем модификатор
                    ch.txt = txt;

                }
            }
            else if (len > 0) { // заданное кол-во
                if (txt.length < len) {  // кол-во эл. ввода меньше заданной длины модификатора
                    ch.num_less = true;
                    ch.mark = '*03';
                    return ch;
                }
                else { // кол-во ввода достигло заданной длины
                    ch.num_in_range = true;
                    ch.symbol_last = true;
                    txt = txt.substr(len);  // отсекаем текст и меняем модификатор
                    ch.txt = txt;

                }
            }
            else { // любое кол-во
                if (txt.length > 0) {
                    ch.num_in_range = true;
                    ch.mark = '*04';
                }
                else { // нет символов
                }
                return ch;
            }
        }

        else if (mv == 'N' || mv == 'C' || mv == 'P') {  // модификатор N C P - число, текст, пунктуация
            ch.note = explain_err(txt, 0, m, mv, len, min, max);
            if (max > 0) { // задан интервал кол-ва
                is_change = false;
                val_to = ((txt.length < max) ? txt.length : max);
                for (var i = 0; i < val_to; i++) {
                    if (mv != tmpl_getType(txt[i])) { // изменение типа
                        if (i + 1 < min) { // кол-во эл. ввода x < min для модификатора
                            ch.error_com = true;
                            ch.mark = 'NCP01';
                            ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                            return ch;
                        }
                        else if (i + 1 == min) {  // кол-во эл. ввода = min для модификатора
                            ch.error_com = true;
                            ch.mark = 'NCP03';
                            ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                            return ch;
                        }
                        else if (i + 1 <= max) {  // кол-во эл. ввода min < x <= max для модификатора
                            if (ch.modif_last) { // последний модификатор
                                ch.error_com = true;
                                ch.mark = 'NCP05';
                                ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                                return ch;
                            }
                            else { // не последний модификатор
                                txt = txt.substr(i);  // отсекаем текст и меняем модификатор
                                ch.txt = txt;
                                is_change = true;
                                break; // выходим из цикла текста
                            }
                        }
                    }
                    else {  // тип не менялся
                    }
                }
                if (!is_change) {
                    if (i < min) {  // введено меньше min
                        ch.num_less = true;
                        //ch.num_in_range = false;
                        ch.mark = 'NCP11';
                        ch.note = explain_err(txt, i, m, mv, len, min, max);
                        return ch;
                    }
                    else if (i < max) {  // введено min <= x < max
                        //ch.num_less = false;
                        ch.num_in_range = true;
                        ch.mark = 'NCP13';
                        ch.note = explain_err(txt, i, m, mv, len, min, max);
                        return ch;
                    }
                    else {  // достигли нужного кол-ва
                        //ch.num_less = false;
                        ch.num_in_range = true;
                        ch.symbol_last = true;
                        txt = txt.substr(max);  // отсекаем текст и меняем модификатор
                        ch.txt = txt;
                    }
                }
            }
            else if (len > 0) { // заданное кол-во
                val_to = ((txt.length < len) ? txt.length : len);
                for (var i = 0; i < val_to; i++) {
                    if (mv != tmpl_getType(txt[i])) { // изменение типа
                        ch.error_com = true;
                        ch.mark = 'NCP21';
                        ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                        return ch;
                    }
                    else { // тип не менялся,
                    }
                }
                if (txt.length < len) {  // введено меньше заданного кол-ва
                    ch.num_less = true;
                    ch.mark = 'NCP23';
                    ch.note = explain_err(txt, i, m, mv, len, min, max);
                    return ch;
                }
                else {  // достигли нужного кол-ва
                    //ch.num_less = false;
                    ch.num_in_range = true;
                    ch.symbol_last = true;
                    txt = txt.substr(len);  // отсекаем текст и меняем модификатор
                    ch.txt = txt;
                }
            }
            else { // любое кол-во
                is_change = false;
                for (var i = 0; i < txt.length; i++) {
                    if (mv != tmpl_getType(txt[i])) { // изменение типа
                        if (i == 0) { // не введен ни один символ
                            ch.error_com = true;
                            ch.mark = 'NCP31';
                            ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                            return ch;
                        }
                        else {  // есть символы
                            ch.num_in_range = true;
                            if (ch.modif_last) {  // последний модификатор
                                ch.error_com = true;
                                ch.mark = 'NCP33';
                                ch.note = explain_err(txt, i, m, mv, len, min, max, true);
                                return ch;
                            }
                            else { // не последний модификатор
                                txt = txt.substr(i);  // отсекаем текст и меняем модификатор
                                ch.txt = txt;
                                is_change = true;
                                break; // выходим из цикла текста
                            }
                        }
                    }
                    else { // тип не менялся
                    }
                }

                if (!is_change) {
                    ch.mark = 'NCP35';
                    //ch.symbol_last = true; // последний символ тек.модификатора
                    if (txt.length > 0) ch.num_in_range = true; // кол-во находится в допустимом интервале для тек.модификатора
                    return ch;
                }
            }

        }

        else if (mv == '[') {  // модификатор [ - диапазоны и списки
            var arr = m_arr[m][5];  // вспомогательный массив
            //arr.sort(sIncrease);
            var arr_len = arr.length;  // кол-во элем.массива
            var n_m_d = 0;  // кол-во совпадений по маске [
            var is_eq = false; // признак совпадений

            var words = '';
            for (var i = 0; i < arr_len; i++) {
                words += '<b>' + arr[i][0] + '</b>';
                if (arr[i][1].length > 0) words += '-<b>' + arr[i][1] + '</b>';
                if (i < arr_len - 1) words += ', ';
            }
            words += '.';

            ch.note += explain_err(txt, 0, m, mv, len, min, max);
            ch.note += words;

            if (txt.length == 0) {
                ch.mark = '[ 10';
                ch.num_less = true;
                return ch;
            }

            if (max > 0) { // задан интервал кол-ва

                while (txt.length > 0) {
                    look();
                    ch.note = '';
                    if (ch.num_less) {
                        if (ch.part_eq) { // частичное совпадение
                            ch.mark = '[01'; // маркер точки выхода
                            ch.note += lang.mask05;
                            ch.note += explain_err(txt, 0, m, mv, len, min, max);
                            ch.note += words;
                        }
                        else { // несовпадение
                            if (min <= n_m_d && n_m_d < max && !ch.modif_last) { // кол-во в диапазоне и не последний мод.
                                ch.num_in_range = true;
                                ch.symbol_last = true;
                                break; // выходим из цикла текста
                            }
                            else {
                                ch.error_com = true; // ошибка
                                ch.mark = '[03'; // маркер точки выхода
                                ch.note += explain_err(txt, 0, m, mv, len, min, max);
                                ch.note += words;
                            }

                        }
                        return ch;
                    }

                    if (is_eq) {  // были совпадения
                        ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                        ch.note += words;
                        if (n_m_d < min) {  // кол-во эл. ввода меньше min для модификатора
                            continue;
                        }
                        else if (n_m_d < max) {  // кол-во эл. ввода в интервале min - max
                            ch.num_in_range = true;
                            continue;
                        }
                        else {  // кол-во эл. ввода достигло max длины
                            ch.num_in_range = true;
                            ch.symbol_last = true;
                            break; // выходим из цикла текста
                        }

                    }
                    else {  // не было совпадений
                        if (n_m_d == 0) {  // не было ни одного совпадения
                            ch.error_com = true;
                            ch.mark = '[11';
                            ch.note += 'Текст не соответствует шаблону. ';
                            // ch.note += explain_err(txt, 0, m, mv, len, min, max);
                            ch.note += words;
                            return ch;
                        }
                        if (min <= n_m_d && n_m_d <= max) {  // кол-во эл. ввода в интервале min - max
                            ch.num_in_range = true;
                            if (ch.modif_last) {  // последний модификатор
                                ch.error_com = true;
                                ch.mark = '[13';
                                ch.note += 'Текст не соответствует шаблону. ';
                                // ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                                ch.note += words;
                                return ch;
                            }
                            else {  // не последний модификатор - на смену модификатора
                                ch.mark = '[15';
                                break; // изменение , выходим из цикла текста
                            }
                        }
                        if (ch.modif_last) {  // последний модификатор
                            ch.symbol_last = true;
                            ch.error_com = true;
                            ch.mark = '[ 57';
                            ch.note += 'Текст не соответствует шаблону. ';
                            // ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                            ch.note += words;
                            return ch;
                        }
                    }
                }  // end while

                if (n_m_d < min) {  // меньше min
                    ch.error_com = true;
                    ch.mark = '[111';
                    //ch.note = 'Текст не соответствует шаблону. ';
                    ch.note = explain_err(txt, 0, m, mv, len, min, max);
                    ch.note += words;
                    return ch;
                }
                else if (n_m_d < max) {  // кол-во эл. ввода в доп.интервале
                    if (ch.num_less = true) {
                        ch.mark = '[118';
                        ch.note = explain_err(txt, n_m_d, m, mv, len, min, max);
                        ch.note += words;
                    }
                    else {
                        ch.num_in_range = true;
                        ch.mark = '[113';
                        ch.note = explain_err(txt, n_m_d, m, mv, len, min, max);
                        ch.note += words;
                        return ch;
                    }
                }
                else {  // кол-во эл. ввода достигло max
                    ch.num_in_range = true;
                    ch.symbol_last = true;
                    ch.mark = '[115';
                    ch.note = explain_err(txt, n_m_d, m, mv, len, min, max);
                    ch.note += words;
                }
            }

            else if (len > 0) { // заданное кол-во

                while (txt.length > 0) {
                    look();
                    ch.note = '';
                    if (ch.num_less) {
                        if (ch.part_eq) { // частичное совпадение
                            ch.mark = '[ 61'; // маркер точки выхода
                            ch.note += lang.mask05;
                            ch.note += explain_err(txt, 0, m, mv, len, min, max);
                            ch.note += words;
                        }
                        else { // несовпадение
                            ch.error_com = true; // ошибка
                            ch.mark = '[ 63'; // маркер точки выхода
                            //ch.note += 'Текст не соответствует шаблону. ';
                            ch.note += explain_err(txt, 0, m, mv, len, min, max);
                            ch.note += words;
                        }
                        return ch;
                    }

                    if (is_eq) {  // были совпадения
                        if (n_m_d == len) {  // кол-во совпадений достигло нужного значения
                            ch.symbol_last = true;
                            break; // выходим из цикла текста
                        }
                    }
                    else {  // не было совпадений
                        ch.error_com = true;
                        ch.mark = '[ 65';
                        //ch.note += 'Текст не соответствует шаблону. ';
                        ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                        ch.note += words;
                        return ch;
                    }

                }  // end while

                if (n_m_d < len) {  // меньше len
                    ch.mark = '[121';
                    //ch.note = 'Текст не соответствует шаблону. ';
                    ch.note += explain_err(txt, 0, m, mv, len, min, max);
                    ch.note += words;
                    return ch;
                }
                else {  // кол-во эл. достигло нужного значения
                    ch.num_in_range = true;
                    ch.symbol_last = true;
                    ch.mark = '[123';
                    ch.note = explain_err(txt, n_m_d, m, mv, len, min, max);
                    ch.note += words;
                }

            }

            else { // любое кол-во

                while (txt.length > 0) {
                    look();
                    ch.note = '';
                    if (ch.num_less) { // текст короче маски
                        if (ch.part_eq) { // частичное совпадение
                            ch.mark = '[ 51'; // маркер точки выхода
                            ch.note += lang.mask05;
                            ch.note += explain_err(txt, 0, m, mv, len, min, max);
                            ch.note += words;
                        }
                        else { // несовпадение
                            if (!ch.modif_last) { // не последний мод.
                                ch.num_in_range = true;
                                ch.symbol_last = true;
                                break; // выходим из цикла текста
                            }
                            else {
                                ch.error_com = true; // ошибка
                                ch.mark = '[ 53'; // маркер точки выхода
                                //ch.note += 'Текст не соответствует шаблону. ';
                                ch.note += explain_err(txt, 0, m, mv, len, min, max);
                                ch.note += words;
                            }

                        }
                        return ch;
                    }

                    if (!is_eq) { // не было совпадений
                        if (n_m_d == 0) { // не введен ни один
                            ch.error_com = true;
                            ch.mark = '[ 55';
                            //ch.note += 'Текст не соответствует шаблону. ';
                            ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                            ch.note += words;
                            return ch;
                        }
                        if (ch.modif_last) {  // последний модификатор
                            ch.symbol_last = true;
                            ch.error_com = true;
                            ch.mark = '[ 57';
                            //ch.note += 'Текст не соответствует шаблону. ';
                            ch.note += explain_err(txt, n_m_d, m, mv, len, min, max);
                            ch.note += words;
                            return ch;
                        }
                        else { // не последний модификатор - на смену модификатора
                            ch.num_in_range = true;
                            ch.mark = '[ 59';
                            break; // выходим из цикла текста
                        }
                    }

                }  // end while

            }

        }

        else { // другой или неверный модификатор
            ch.error_com = true; // ошибка
            ch.mark = 'e77';
            ch.note = lang.mask06;
        }

        if (ch.modif_last && ch.symbol_last) { // последний модиф. и его символ
            if (txt.length > 0) { // остался лишний текст
                ch.error_com = true; // ошибка
                ch.txt_rest = true;
                ch.txt = txt;
                ch.mark = 'end88';
                ch.note = lang.mask07 + txt;
            }
            else {
                ch.mask_end = true;
                ch.mark = 'end99';
            }
            return ch;
        }


    } // end for по модификаторам

    ch.mark = 'end555';
    return ch;

    function mask_in_word() { // словесное описание шаблона
        var words = '';
        for (var m = 0; m < m_arr.length; m++) { // формирование описания шаблона
            var mv = m_arr[m][0];
            if (mv == 'T') continue;
            var len = m_arr[m][2];
            var min = m_arr[m][3];
            var max = m_arr[m][4];
            if (mv == 'N') words += lang.mask08;
            else if (mv == 'C') words += lang.mask09;
            else if (mv == 'P') words += lang.mask10;
            else if (mv == '*') words += lang.mask11;
            else if (mv == '[') {
                words += lang.mask12;
                var arr = m_arr[m][5];  // вспомогательный массив
                var arr_len = arr.length;  // кол-во элем.массива
                for (var i = 0; i < arr_len; i++) {
                    words += arr[i][0];
                    if (arr[i][1].length > 0) words += '-' + arr[i][1];
                    if (i < arr_len - 1) words += ', ';
                }
            }
            words += '(';
            if (max > 0) words += min + '-' + max;
            else if (len > 0) words += len;
            else words += lang.mask13;
            words += ')';
            if (m < m_arr.length - 1) words += ', ';
        }
        return words;
    }


    function explain_err(txt, i, m, mv, len, min, max, err) { // пояснение и объяснение
        var num_fr = 5;
        var note = '';
        if (err) { // объяснение ошибки
            note += lang.mask14 + ' <b>' + txt[i] + '</b> ';
            // var frag = txt.substr(i);
            // if (frag.length > 1) { // фрагмент длиннее 1 символа
            // if (frag.length > num_fr) { // фрагмент длинней num_fr - отсекаем хвост
            // frag = frag.substr(0,num_fr)+'..';
            // }
            // note += 'из фрагмента <b>'+frag+'</b>';
            // }
            // else { // фрагмент состоит из 1 символа
            // if (m > 0) note += 'в конце текста';
            // }
            note += lang.mask15;
        }

        if (max > 0) {
            if (i == 0) {
                if (min == 1) note += lang.mask16 + (max);
                else note += lang.mask17 + (min) + lang.mask18 + (max);
            }
            else if (i + 1 <= min) {
                note += lang.mask19 + (min - i) + lang.mask18 + (max - i);
            }
            else if (i + 1 < max) note += lang.mask20 + (max - i);
            else note += lang.mask21;
        }
        else if (len > 0) {
            if (i == 0) note += lang.mask22 + len;
            else note += lang.mask23 + (len - i);
        }
        else {
            note += lang.mask24;
        }
        if (mv == 'N') note += lang.mask25;
        else if (mv == 'C') note += lang.mask26;
        else if (mv == 'P') note += lang.mask27;
        else if (mv == '*') note += lang.mask28;
        else if (mv == '[') note += lang.mask29;

        return note;

    }


    function look() { // поиск совпадение по массиву шаблонов
        ch.num_less = false;
        ch.num_in_range = false;
        is_eq = false;
        ch.part_eq = false;

        for (var d = 0; d < arr_len; d++) {  // цикл по массиву
            if (arr[d][1].length > 0) {  // диапазон символов, например а-я
                if (arr[d][0] <= txt[0] && txt[0] <= arr[d][1]) {  // есть совпадение
                    is_eq = true;
                    ch.num_less = false;
                    ch.num_in_range = true;
                    n_m_d++;
                    txt = txt.substr(1);
                    ch.txt = txt;
                    return;
                }
            }
            else { // список слов
                if (txt.length >= arr[d][0].length) {  // текст длиннее или равен длине слова
                    if (txt.substr(0, arr[d][0].length) == arr[d][0]) {  // есть совпадение
                        is_eq = true;
                        ch.num_less = false;
                        ch.num_in_range = true;
                        n_m_d++;
                        txt = txt.substr(arr[d][0].length);
                        ch.txt = txt;
                        return;
                    }
                }
                else {  // текст короче слова
                    ch.num_less = true;
                    if (txt == arr[d][0].substr(0, txt.length)) { // неполный текст совпадает с частью шаблона
                        ch.part_eq = true;
                    }
                }
            }
        } // end for list

    } // end function look()

} // end function check_str(txt)


function check_template(mask, verbose) { // проверка маски ввода и формирование m_arr и др.

    var m_len = mask.length; // длина маски
    if (m_len == 0) return true;

    // разбиваем маску на модификаторы с параметрами
    m_arr = [];
    if (!isModificator(mask[0])) {
        if (verbose) alert(lang.mask30 + mask[0]);
        //alert('{$lang.tmpl_first_not_modif}: '+mask[0]);
        return false;
    }
    var m = -1; // счетчик модификаторов
    var gr = 0; // счетчик подгруппы
    var mv = ''; // тек. значение элемента маски
    var in_brackets = false;
    var t_led = false;
    for (var i = 0; i < m_len; i++) { // цикл по тексту маски
        mv = mask[i];
        if (t_led) {
            if (mv == '.' || mv == '!') t_led = false;
            m_arr[m][1] += mv;
            continue;
        }
        if (mv == 'T' && !in_brackets) {
            t_led = true;
            gr++;
        }
        if (in_brackets) {
            if (mv == ']') in_brackets = false;
            m_arr[m][1] += mv;
            sm_arr[gr] += mv;
            continue;
        }
        if (mv == '[') in_brackets = true;
        if (isModificator(mv)) { // модификатор
            m++;
            m_arr[m] = [];
            m_arr[m][0] = mv; // модификатор
            m_arr[m][1] = ''; // параметры
            if (mv != 'T') sm_arr[gr] += mv;
//        continue;
        }
        else if (is_digit(mv) || mv == '-') {
            m_arr[m][1] += mv;
            sm_arr[gr] += mv;
//        continue;
        }
        else {
            if (verbose) alert(lang.mask31 + mv + lang.mask32 + (i + 1));
            //alert('{$lang.tmpl_illegal_symbol}: '+mv+' {$lang.in_position} '+ (i+1));
            return false;
        }
    }

    // обработка параметров модификаторов
    var comm_i = 0;
    for (i = 0; i < m_arr.length; i++) {
        if (m_arr[i][0] == 'T') { // обработка T
            comm_arr[comm_i] = m_arr[i][1];
            comm_i++;
            if (m_arr[i][1].length > 0) {
                var tmp = m_arr[i][1][m_arr[i][1].length - 1]; // последний символ
                if (tmp != '.' && tmp != '!') {
                    if (verbose) alert(lang.mask33 + tmp);
                    //alert('{$lang.tmpl_end_of_t_not_corr}: '+tmp);
                    return false;
                }
            }
            continue;
        }
        mv = m_arr[i][1];
        m_arr[i][2] = 0; // единственное число
        m_arr[i][3] = 0; // min
        m_arr[i][4] = 0; // max
        if (mv == '') { // любое кол-во  - 0
            m_arr[i][2] = 0;
        }
        else if (is_digit(mv)) {
            m_arr[i][2] = parseInt(mv, 10); // одно число
        }
        else if (is_digit_defis(mv)) { // числовой интервал 1-4
            tmp = mv.split('-');
            m_arr[i][3] = parseInt(tmp[0], 10); // min
            m_arr[i][4] = parseInt(tmp[1], 10); // max
            if (m_arr[i][3] >= m_arr[i][4]) {
                if (verbose) alert(lang.mask34 + mv);
                //alert('{$lang.tmpl_min_more_max}: ' + mv);
                return false;
            }
        }
        else if (is_list(mv)) { // наличие ]
            // блок проверки количества
            if (mv[mv.length - 1] == ']') { // любое кол-во в диапазоне
                m_arr[i][2] = 0;
            }
            else {  // заданное кол-во или интервал
                var rest = mv.substr(mv.indexOf(']') + 1);
                if (is_digit(rest)) { // одно число
                    m_arr[i][2] = parseInt(rest, 10);
                }
                else if (is_digit_defis(rest)) { // числовой интервал 1-4
                    tmp = rest.split('-');
                    m_arr[i][3] = parseInt(tmp[0], 10); // min
                    m_arr[i][4] = parseInt(tmp[1], 10); // max
                    if (m_arr[i][3] >= m_arr[i][4]) {
                        if (verbose) alert(lang.mask34 + rest);
                        //alert('{$lang.tmpl_min_more_max}: ' + rest);
                        return false;
                    }
                }
                else {
                    if (verbose) alert(lang.mask35 + rest);
                    //alert('{$lang.tmpl_uncertain_repeat}: ' + rest);
                    return false;
                }

            }
            // блок формирования массивов проверки
            var beg = mv.substr(0, mv.indexOf(']'));
            if (beg.length == 0) {
                if (verbose) alert(lang.mask36);
                //alert('{$lang.tmpl_no_content_in_brack}');
                return false;
            }
            tmp = beg.split(',');
            var tmp2 = '';
            m_arr[i][5] = []; // массив списка
            for (var k = 0; k < tmp.length; k++) {
                if (tmp[k].length == 0) {
                    if (verbose) alert(lang.mask37 + beg);
                    //alert('{$lang.tmpl_empty_elem_of_list} ' + beg);
                    return false;
                }
                if (tmp[k][0] == '-' || tmp[k][tmp[k].length - 1] == '-') {
                    if (verbose) alert(lang.mask38 + beg);
                    //alert('{$lang.tmpl_list_dash_at_edge} ' + beg);
                    return false;
                }
                m_arr[i][5][k] = [];
                tmp2 = tmp[k].split('-');
                if (tmp2[0].length == 0 || tmp2[0] >= tmp2[1]) {
                    if (verbose) alert(lang.mask39 + beg);
                    //alert('{$lang.tmpl_empty_min_more_max} ' + beg);
                    return false;
                }
                m_arr[i][5][k][0] = tmp2[0]; // например, from А- , 0- | или слово
                m_arr[i][5][k][1] = (tmp2[1] === undefined) ? '' : tmp2[1]; // to  Я, 5
            }
        }
        else {
            if (verbose) alert(lang.mask40 + mv);
            //alert('{$lang.tmpl_undefined_error}: ' + mv);
            return false;
        }
    }

    return true;

} // end check_template


function tmpl_show(id, resp, addLinkID) {
    var report = "";
    report += "mv = " + ((resp.mv) ? resp.mv : '-') + "<br>";
    report += "txt = " + ((resp.txt) ? resp.txt : '-') + "<br>";
    report += "txt_rest = " + resp.txt_rest + "<br>";
    report += "mark = " + ((resp.mark) ? resp.mark : '-') + "<br>";
    report += "modif_last = " + resp.modif_last + "<br>";
    report += "symbol_last = " + resp.symbol_last + "<br>";
    report += "num_less = " + resp.num_less + "<br>";
    report += "num_in_range = " + resp.num_in_range + "<br>";
    report += "prev_mod = " + resp.prev_mod + "<br>";
    report += "<span class='" + ((resp.mask_end) ? 'blue' : 'red') + "'>mask_end = " + resp.mask_end + "</span><br>";
    report += "<span class='" + ((resp.error_com) ? 'red' : 'blue') + "'>error_com = " + resp.error_com + "</span><br>";
    report += "<span class='" + ((resp.error_last) ? 'red' : 'blue') + "'>error_last = " + resp.error_last + "</span><br>";


    //var rep = document.getElementById('templ_rep'+id);  // признаки проверки
    if (typeof addLinkID !== "undefined") {
        var rep = $('#' + addLinkID).parent().find('#templ_rep' + id).get(0);
    }
    else {
        if ($('#view_block').css('display') !== 'none') {
            var rep = $('#view_cell_' + id).parents('.user-data__mask-wrap').find('#templ_rep' + id).get(0);
        } else {
            var rep = $('#value' + id).parent().find('#templ_rep' + id).get(0);
        }

    }
    rep.innerHTML = report;

}


function set_fill_ok(id, pr, addLinkID) {
    if (typeof addLinkID !== "undefined") {
        $('#' + addLinkID).parent().find('#templ_fill_link_ok' + id).get(0).value = pr;
    }
    else {
        $('#value' + id).parent().find('#templ_fill_ok' + id).get(0).value = pr;
    }
}

function get_fill_ok(id, addLinkID) {
    if (typeof addLinkID !== "undefined") {
        return $('#' + addLinkID).parent().find('#templ_fill_link_ok' + id).get(0).value;
    }
    else return $('#value' + id).parent().find('#templ_fill_ok' + id).get(0).value;
}

function tmpl_clean_bg(input) // снятие фонов проверки
{
    if (!$(input).hasClass('hidden-input')) {
        var tmp = input.className;
        tmp = tmp.replace("bg_fill", "");
        tmp = tmp.replace("bg_err", "");
        input.className = trim(tmp);
    }
}


function tmpl_getChar(event) { // Функция получения символа из события keypress, event.type должен быть keypress
    if (event.which == null) {  // IE
        if (event.keyCode < 32) return null; // спец. символ
        return String.fromCharCode(event.keyCode)
    }

    if (event.which != 0 && event.charCode != 0) { // все кроме IE
        if (event.which < 32) return null; // спец. символ
        return String.fromCharCode(event.which); // остальные
    }

    return null; // спец. символ
}

function isModificator(str) // возвращает true, если str является модификатором
{
    var mod = 'NCP*T[';
    for (var i = 0; i < mod.length; i++) {
        if (mod[i] == str) return true;
    }
    return false;
}

function tmpl_getType(str) // получение типа символа
{
    var reg = /[a-zа-яё ]/i;
    if (reg.test(str)) return 'C';
    reg = /[0-9]/;
    if (reg.test(str)) return 'N';
    reg = /[\.,\(\)\[\]\\<\/>\{\}\?\+:;'"`\|~!@#№\$%\^\&\*_\-]/;
    if (reg.test(str)) return 'P';
}



