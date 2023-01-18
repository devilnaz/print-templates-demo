var last_inserted_lines_id = 2; // Последний номер вновь добавленной строки
var save_val_count = 0;
var click_count = 0;
var stick;
var delGroupLines = new Object;
var create_subtable;
var subtable_color_formats = {};
var edit_mode = (cur_mode === 'edit') ? true : false;
var cur_link_field = null;
var isNewLine = false;
/**
 * Массив хранящий данные, изменившиеся в ходе вычислений
 * @type {Array}
 */
var update_data_arr = [];
/**
 *
 * @type number
 */
var add_rows_count = 0;





$(document).ready(function () {
    cur_subtable_id = get_cur_subtable_id();
    create_subtable = (cur_subtable_id) ? new Subtable({
        'asterisk_login': asterisk_login,
        'edit_mode': edit_mode
    }) : null;

    if (create_subtable) {
        create_subtable.get_subtable_data(cur_subtable_id);
        setTimeout(create_subtable.init_pagination_scroll, 1000);
    }
    initFlexMenu();
    set_subtable_border_top();
});

var defaultData = []

function getDataDefault(data) {
    defaultData = data
    return defaultData
}

/**
 * Метод для вставки наружней рамки
 */
function set_subtable_border_top() {
    var subtable_outer = $('.subtable__outer-wrap');

    if (subtable_outer.length > 0) {
        var header = subtable_outer.find($('.subtable__head'));
        var header_height = header.outerHeight(true);
        var border = subtable_outer.find($('.subtable__border'));
        var BORDER_WIDTH = 2;

        border.css({
            'top': header_height - BORDER_WIDTH + 'px'
        });
        border.addClass('subtable__border--active');
    }
}

function initFlexMenu() {
    var subtableMenuList = $('.subtable__tab-list');
    if (subtableMenuList.length > 0) {
        subtableMenuList.flexMenu({
            'popupClass': 'subtable__dropdown-list',
            'cutoff': 0,
            'threshold': 0,
            'linkText': lang.More,
            'linkTitle': lang.Show_more
        });
    }
}

/**
 * Возвращает id текущей подтаблицы
 * @return {number|null}
 */
function get_cur_subtable_id() {
    var result = null;

    var active_sub_btn = $('.subtable__tab-item--active');

    if (active_sub_btn.length > 0 || $('.subtable').length > 0) {
        if (active_sub_btn.length === 0) {
            var first_tab = $('.subtable').find($('.subtable__tab-item')).eq(0);
            var first_tab_fix_header = $('.fixed-subtable-header').find($('.subtable__tab-item')).eq(0);

            if (first_tab.length > 0) {
                first_tab.addClass('subtable__tab-item--active');
                first_tab_fix_header.addClass('fix-subtable__tab-item--active')
                result = first_tab.attr('id').replace(/\D+/g, "");
            }
        } else {
            result = active_sub_btn.attr('id').replace(/\D+/g, "");
        }
    }

    return result;
}

// Проверка обязательности заполнения пустых полей в новой записи подтаблицы
function checkRequiredFieldsBeforeSaving(value) {
    let requiredFields = $('.textpad__required-field');
    let requireFieldsCount = 0;

    requiredFields.each(function (i, elem) {
        const $elem = $(elem);
        const elemChild = $elem.find('input').eq(0);

        if (elemChild) {
            const val = elemChild.val();

            if (val != void 0) {
                if (val.replace(/\s/g, '').length < 1) {
                    //elemChild.css({ backgroundColor : '#ffe0e0' }).stop().animate({ backgroundColor : '#ffe0e0' }, 3000);
                    requireFieldsCount++;
                }
            }
        }
    });

    if (!value) value = "";
    // if (requireFieldsCount > 0 && value.trim().length < 1) {
    //     displayNotification(lang.Error_not_all_fields, 2);
    //     return false;
    // }
    return true;
}

function save_value(field_id, line_id, val, newLine = false) {
    var new_val = encodeURIComponent(val);
    var new_line = (new_line_status) ? '&new_line_status=1' : '';
    var page_param = '';

    if (cur_subtable) {
        if (cur_subtable.table_fields && Object.keys(cur_subtable.table_fields).indexOf(field_id) !== -1) {
            if (!fast_edit_uniq_check(field_id, line_id, cur_subtable.table_id, val) || !checkRequiredFieldsBeforeSaving(val)) {
                return false;
            }

            page_param = "&subtable_page=" + cur_subtable['cur_page'] + "&rel_field=" + cur_subtable['rel_field'];
        }
    }

    fast_edit_old = field_id + "|" + line_id + "|" + val;
    isNewLine = newLine;
    ajax_update.format = 0;
    ajax_update.method = "POST";
    ajax_update.call("field=" + field_id + "&line=" + line_id + "&value=" + new_val + "&csrf=" + csrf + page_param + new_line, ComRespSaveSub);

    //появление зеленой кнопки Сохранить только при изменении полей подтаблицы
    $('.subtable__table').change(function () { // событие изменения поля подтаблицы
        $(".subtable__footer-btn--save").fadeIn();
    });

}

function updateColorFormat(line_id) {
    if (subtable_color_formats && all_subtables && all_subtables[cur_subtable_id]) {
        var lines = [];
        cur_subtable = all_subtables[cur_subtable_id];

        lines.push(line_id);
        if (subtable_color_formats[cur_subtable['table_id']]) {
            subtable_color_formats[cur_subtable['table_id']].setFormatColor({
                'lines': lines,
                'subtable_id': cur_subtable['id']
            });
        }
    }
}

function ComRespDropSub(resp) {
    resp = checkResp(resp);
    resp = trim(resp, "\r\n");
    var resp_arr = resp.toString().split("\r\n");
    setTimeout(function () {
        for (i = 0; i < resp_arr.length; i++) {
            var res_arr = resp_arr[i].toString().split("|");
            var drop_table_id = res_arr[1];
            var drop_line_id = res_arr[2];
            if (res_arr[0] == "cancel_delete") {
                var v_o = document.getElementById('subtable_' + cur_subtable_id + "_line_" + drop_line_id);
                v_o.style.background = '#ffadad';
                $(v_o).stop().animate({ backgroundColor: '' }, 1000).css('background', 'transparent');
                // Обновляем, если были вычисления
                if (typeof resp_arr !== 'undefined') {
                    UpdateData(resp_arr);
                    add_request_to_update_arr(resp_arr);
                }
            }
            if (trim(res_arr[0]) == "deleted") {
                selTableInfo = cur_subtable['table_id'];
                for (subtbl_id in all_subtables) {
                    if (selTableInfo != all_subtables[subtbl_id]['table_id']) continue;
                    var v_o = document.getElementById('subtable_' + subtbl_id + "_line_" + drop_line_id);
                    if (!v_o) continue;
                    // Убираем суммы, если в группе строк нет больше данных
                    var nextTr = $("#subtable_" + subtbl_id + "_line_" + drop_line_id + " + *").attr("id");
                    var prevTr = $("#subtable_" + subtbl_id + "_line_" + drop_line_id).prev().attr("id");
                    if (prevTr == undefined) prevTr = "";
                    if (nextTr.indexOf("subtable_" + subtbl_id + "_line_") < 0 && prevTr.indexOf("subtable_" + subtbl_id + "_line_") < 0) {
                        var grOrd = str_replace("subtable_3_sum_", "", nextTr);
                        delGroupLines[grOrd] = 1;
                        $("#" + nextTr + " div.subtable__sum-gray").html("");
                        $("#" + nextTr + " div.subtable__sum-page").html("");
                        if ($("[id^=subtable_" + subtbl_id + "_line]").length == 1)
                            $("#" + nextTr + " div.subtable__sum-black").html("");
                    }

                    if ((v_o) && (typeof (v_o.parentNode) !== 'undefined')) // Защита от быстрого двойного щелчка удалить
                        v_o.parentNode.removeChild(v_o);
                }

                if ($("#subtable_" + cur_subtable_id + " [id ^= subtable_" + cur_subtable_id + "_line_]").length == 0 && cur_mode == "view") $(".subtable__footer-btn--save").fadeOut();
                // Обновляем, если были вычисления
                if (typeof resp_arr !== 'undefined') {
                    UpdateData(resp_arr);
                    add_request_to_update_arr(resp_arr);
                }
                count_the_number_of_subtable_entries(cur_subtable_id);
            }
        }
        // Удаление прелоадлера после удаления строки из подтаблицы
        hidePreloader();
        $('.subtable__overlay').remove();
    }, 1000);
}

/**
 * При изменении какого-либо поля необоходимо проверить все поля, которые могут изменить состояние информеров
 * Так сделано потому, что на поля могут быть навешены вычисления, которые могут изменять значения в других полях
 */
function updateInformers() {
    $('[has_informer=1]').each(function (i, field) {
        $(field).blur();
    });
}

/**
 * Метод, добавляющий в массив вычисления, произведенные на странице
 * @param res_arr {string} Ответ от сервара
 */
function add_request_to_update_arr(resp_arr) {
    var writed = update_data_arr.some(function (value) {
        return value === resp_arr;
    });

    if (!writed) {
        update_data_arr.push(resp_arr);
    }
}
function mult_value_preview(elem){
    let div_check = elem.nextElementSibling.nextElementSibling.lastElementChild.children,
        div_preview = ' ';
    for(let j = 0; j < div_check.length; j++){
        if(div_check[j].firstElementChild.checked==true) {
            div_preview += `<div>${div_check[j].children[1].textContent}</div>`;
        }
    }
    elem.previousElementSibling.innerHTML = div_preview;
}
function type_4_mult_val_check_all(el){
    el.parentElement.parentElement.firstElementChild.value=""
    let input = el.parentElement.parentElement.firstElementChild.value,
        field_type=el.parentElement.parentElement.firstElementChild.attributes['field_type'].value;
    if(el.checked==true){
        for(let i=0;i<$(el).parent().parent().find('.type_4_mult_val').length;i++){
            $(el).parent().parent().find('.type_4_mult_val')[i].firstElementChild.checked=true;
            if(i==0){
                input=$(el).parent().parent().find('.type_4_mult_val')[i].firstElementChild.value;
            }else{
                if(field_type==4){
                    input+=`\r\n${$(el).parent().parent().find('.type_4_mult_val')[i].firstElementChild.value}`;
                }else{
                    input+=`-${$(el).parent().parent().find('.type_4_mult_val')[i].firstElementChild.value}`;
                }
            }
        }
    }else{
        for(let i=0;i<$(el).parent().parent().find('.type_4_mult_val').length;i++){
            $(el).parent().parent().find('.type_4_mult_val')[i].firstElementChild.checked=false;
        }
        input="";
    }
    el.parentElement.parentElement.firstElementChild.value=input;
    save_value_multi(el.parentElement.parentElement.firstElementChild.getAttribute('id').split("_")[3],el.parentElement.parentElement.firstElementChild.getAttribute('id').split("_")[4],el.parentElement.parentElement.firstElementChild.value);
}

function save_type_4_mult_val(element){
    let input = element.parentElement.parentElement.parentElement.firstElementChild.value,
        field_type=element.parentElement.parentElement.parentElement.firstElementChild.attributes['field_type'].value,
        value = [];
    if(element.checked==false){
        if(field_type==4){
            if (input.indexOf(',')>0) {
                input = input.split(',').join('\n');
            }
            input=input.split("\n");
            for(let i=0;i<input.length;i++){
                input[i] = input[i].replace('\r','')
                if(input[i]==element.value){
                    input.splice(i,1);
                }
            }
            input=input.join('\r\n');
            element.parentElement.parentElement.parentElement.firstElementChild.value=input;
        }
        else{
            input=input.split("-")
            input.forEach(function(el) {
                if(el != '') {
                    value.push(el);
                }
            });
            for(let i=0;i<value.length;i++){
                value[i] = value[i].replace('\r','')
                if(value[i]==element.value){
                    value.splice(i,1);
                }
            }
            value=value.join('-');
            element.parentElement.parentElement.parentElement.firstElementChild.value=value;
        }
    }
    else{
        if(input==""){
            input+=element.value;
        }
        else{
            if(field_type==4){
                if (input.indexOf(',')>0) {
                    input = input.split(',').join('\r\n');
                }
                input+=`\r\n${element.value}`;
            }else{
                input+=`-${element.value}`;
            }
        }
        element.parentElement.parentElement.parentElement.firstElementChild.value=input;
    }
    save_value_multi(element.parentElement.parentElement.parentElement.firstElementChild.getAttribute('id').split("_")[3],element.parentElement.parentElement.parentElement.firstElementChild.getAttribute('id').split("_")[4],element.parentElement.parentElement.parentElement.firstElementChild.value);
}

/**
 * В глобальной переменной update_data_arr уже был добавлен текущий resp_arr,
 * значит повторно не надо по нему проходить.
 * @param {string[]} resp_arr - массив строк с событиями на сервере
 * @return {boolean}
 */
const clear__update_data_arr = (resp_arr) => {
  if (update_data_arr.includes(resp_arr)) {
    update_data_arr = update_data_arr.filter(item => item !== resp_arr);
    return true;
  }
  return false;
}

/**
 * Вывод сообщений.
 * @param {Object} messagesObj - объект с всплывающими сообщениями (jalert, хз, ...)
 * @param {Object} messagesNum - объект с идентификатором сообщениями (хз зачем, бред какой-то)
 */
const showJalertMessagesObj = (messagesObj, messagesNum) => {
  for (statusId in messagesObj) {
    let oneMsgGroup = messagesObj[statusId];
    let oneStatusText = "";
    for (m = 0; m <= messagesNum[statusId]; m++) {
      if (!oneMsgGroup[m]) {
        continue;
      }
      oneStatusText += oneMsgGroup[m] + "<br />";
    }

    if (oneStatusText != "") {
      jalert(oneStatusText);
    }
  }
}

/**
 * Обновить данные на странице.
 * @param {string[]} resp_arr - массив строк с событиями на сервере
 */
function UpdateData(resp_arr) {
  if (clear__update_data_arr(resp_arr)) {
    return;
  }

    var field;
    var type_field;
    var n_tmp;
    var n;
    var last_select;
    var select_obj;
    var int_val;
    var dspl_val;
    var saved_field;
    let messagesObj = new Object;
    var messagesNum = new Object;
    var cur_table_id;

    for (var keyVar in resp_arr) {  // меняем также значения которые изменились в результате вычислений
        var res_arr = resp_arr[keyVar].toString().split("|");
        var field_id = res_arr[1];
        var line_id = res_arr[2];
        var new_value = Base64.decode(res_arr[3]);
        cur_table_id = "";

        if (cur_link_field == res_arr[2]) {
          continue;
        }

        res_arr[0] = res_arr[0].includes("\nsaved") ? "saved" : res_arr[0];

        saved_field = false;
        if (res_arr[0] === 'inserted') {
            cur_table_id = res_arr[1];
            updateColorFormat(line_id);
        }
        if (res_arr[0] == "sum") {
            if ($("[id^=subtable_" + cur_subtable_id + "_line]").length === 0) {
                $('.subtable__sum-page').html('');
                new_value = ''
            }

            if (line_id == "total")
                v_o = "sub_total" + field_id;
            else if (line_id == "page_total") {
                v_o = "sub_total_page" + field_id;
                $('.subtable__sum-page--fictive').addClass('subtable__sum-page--active');
            }
            else {
                line_id = parseInt(line_id);
                while (delGroupLines[line_id])
                    line_id += 1;
                v_o = "sub_totalgr" + field_id + "_" + line_id;
            }
            if (v_o) {
                if (line_id == "page_total");
                if (line_id == "page_total" && typeof $("." + v_o).html() !== 'undefined') {
                    if ($("." + v_o).html().toString().trim() != '') $("." + v_o).html(new_value);
                    else $('.subtable__sum-page--fictive').removeClass('subtable__sum-page--active');
                }
                else $("." + v_o).html(new_value);
            }
            updateColorFormat(line_id);
            continue;
        }
        if (res_arr[0] == 'average') {
            if ($("[id^=subtable_" + cur_subtable_id + "_line]").length == 0) {
                new_value = '';
            }
            continue;
        }

        if (res_arr[0] == "message") {
          let mStatus = field_id;
          let mNum = line_id;
          let mText = new_value;
          if (!messagesObj[mStatus]) {
            messagesObj[mStatus] = new Object;
            messagesNum[mStatus] = mNum;
          }
          if (messagesNum[mStatus] < mNum) {
            messagesNum[mStatus] = mNum;
          }
          messagesObj[mStatus][mNum] = mText;
          continue;
        }

        if (res_arr[0] == "saved") { // Приводим действие 'saved' к виду changed
            cur_table_id = res_arr[1];
            field_id = res_arr[2];
            line_id = res_arr[3];
            new_value = Base64.decode(res_arr[4]);
            saved_field = true;
            res_arr[0] = "changed";
        }
        if (res_arr[0] == "changed" && ((cur_subtable && cur_subtable['table_fields'] && cur_subtable['table_fields'][field_id]) || show_fields['fields'][field_id])) {
            if (cur_table_id == curSubtableId || (cur_subtable != void 0 && cur_subtable['table_fields'] != void 0 && cur_subtable['table_fields'][field_id])) {
                field = cur_subtable['table_fields'][field_id] || show_fields['fields'][field_id];
                v_o = $('[id^=fast_edit_span_' + field_id + '_' + line_id + ']');
            } else {
                field = show_fields['fields'][field_id];
                v_o = $("#view_cell_" + field_id);
            }
            view_field = field['view'];
            type_field = field['type_field'];
            cur_line_id = document.getElementById("view_line_id");
            hasSlaveFields = field['links_also_show'] ? field['links_also_show'].length > 0 : false; // Есть вывод доп. полей или нет

            // Возможно изменение самой родителькой таблицы
            e_o = document.getElementById("edit_cell_" + field_id);
            const subField = $('[id^=fast_edit_span_' + field_id + '_' + line_id + ']');

            if (v_o.length > 0) {
                if (cur_line_id !== null && line_id !== cur_line_id.value && v_o.length < 1) continue;

                if ((document.getElementById("value" + field_id)) && (typeof (document.getElementById("value" + field_id).value) !== 'undefined')) {
                    document.getElementById("value" + field_id).value = new_value;
                    load_values[field_id] = new_value;
                }

                if (type_field == 1) {
                    v_o.val(new_value);
                    v_o.html(new_value);
                    v_o.attr('cur_value', new_value);
                }

                if (type_field == 2 || type_field == 12 || type_field == 3) {
                    if (
                        field['type_value'].indexOf('view_html') !== -1 ||
                        field['type_value'] == ""
                    ) {
                        v_o.html(new_value);
                        $(`#fast_edit_span_${field_id}_${line_id}_${type_field}`).val(new_value);
                    }

                    if (field['type_value'].indexOf('hyperlink') !== -1) {
                        if (v_o[0].nodeName === 'INPUT') {
                            v_o.val(new_value);
                        } else if(v_o[0].nodeName === 'A') {
                            v_o.attr('href', new_value)
                        } else{
                            v_o.html(`<a href="${new_value}" target="_blanc">${new_value}</a>`);
                        }
                    } else if (field['type_value'].indexOf('hyperlink') === -1) {
                        if (v_o[0].nodeName === 'INPUT') {
                            v_o.val(new_value);
                        } else {
                            v_o.html(new_value);
                            v_o.val(new_value);
                        }
                    }

                    v_o.attr('cur_value', new_value);
                }

                if (type_field == 5) {
                    n_tmp = new_value.split("|");
                    int_val = n_tmp[0];
                    dspl_val = n_tmp[1];
                    const editLink = $('#fast_edit_cell_' + field_id) && $('[id^=sub_cell_' + field_id + '_' + line_id + ']');
                    const addFields = hasSlaveFields ? Base64.decode(res_arr[4]).split('|') : null;

                    if (editLink.length > 0) {
                        var combobox = editLink.find($('.combobox'));
                        var foundComboboxVal = false;

                        combobox.find($('option')).each(function () {
                            if ($(this).val() == int_val) {
                                $(this).prop('selected', true);
                                foundComboboxVal = true;
                            }
                        });
                        if (!foundComboboxVal) {
                            combobox.append('<option value="' + int_val + '" selected>' + dspl_val + '</option>');
                        }
                        if (editLink.find('.sub-slave_fields').find('.autocomplete_val').length > 0) {
                            editLink.find('.sub-slave_fields').find('.autocomplete_val').html(dspl_val);
                        } else {
                            editLink.find('.autocomplete').after(`<span class="sub-slave_fields"><span class='autocomplete_val'>${dspl_val}</span></span>`);
                        }
                    }
                    if (v_o[0].nodeName === 'SPAN' && !hasSlaveFields) {
                        if (view_field) {
                            v_o[0].innerHTML = '<a href="view_line2.php?table=' + field['s_table_id'] + '&line=' + int_val + '&back_url=' + base64_current_url + '">' + dspl_val + '</a>';
                            if ($("#edit_value" + field_id) && $("#value" + field_id)) {
                                $("#edit_value" + field_id).attr('value', dspl_val);
                                $("#edit_value" + field_id).attr('first_value', dspl_val);
                                $("#value" + field_id).attr('value', int_val);
                            }
                        } else {
                            v_o[0].innerHTML = dspl_val;
                        }
                    } else {
                        const display_link = v_o.find($('.autocomplete_val'));
                        const inputVal = $('#view_value' + field_id);

                        inputVal.val(dspl_val);
                        if (display_link.length > 0) { // Если уже было установлено какое-то значение
                            if (hasSlaveFields) {
                                const slaveFieldsBlock = display_link.next();

                                slaveFieldsBlock.html('');
                                for (let slave of addFields) slaveFieldsBlock.append($('<span class="show-field-slave__item">' + slave + '</span>'));
                            }

                            display_link.val(dspl_val).html(dspl_val);
                            v_o.val(int_val);
                        }
                    }
                } else if (type_field == 4) {
                    if (v_o[0].nodeName === 'SPAN') {
                        v_o[0].innerHTML = new_value;
                    } else {
                        v_o.find($('option')).each(function () {
                            if ($(this).attr('selected')) {
                                $(this).attr('selected', false);
                            }

                            if ($(this).val() === new_value) {
                                $(this).attr('selected', 'selected');
                            }
                        });
                        updateColorFormat(line_id);
                    }
                }

                if (type_field == 7 || type_field == 14) {
                  v_o.children().each(function (i, item) {
                    if ($(item).text() == new_value) {
                      $(item).prop('selected', 'selected');
                    }
                  });

                  //
                  if (v_o.prop("tagName") == 'SPAN') {
                    v_o.text(new_value);
                  }
                }
                v_o[0].style.background = '#fff6ad';
                v_o.attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                if (type_field == 3) {
                    // выполняем Javascript если он вписан и поле - отображать html
                    if (field['view_html']) {
                        var re = /<script>([\s\S]*?)<\/script>/gi;
                        js_result = new_value.match(re);
                        if (js_result) {
                            var o_str, s_len = String('<script>').length;
                            for (keyVar in js_result) {
                                if (intval(keyVar) != keyVar) continue; // Фикс для ie, т.к. могут быть не только числа
                                o_str = js_result[keyVar];
                                o_str = o_str.substr(s_len, o_str.length - s_len * 2 - 1);
                                eval(o_str);
                            }
                        }
                    }
                }

                if (type_field == 6 || type_field == 9) { // Файл или изображение
                    const all_values = new_value.split('\r\n');
                    const valuesCount = all_values.length;
                    const isSubtable = v_o.parents('.subtable').length > 0 ? true : false;
                    let filesArr = []; // Массив файлов/изображений для вывода на странице
                    let editBlock = $('#field_edit' + field_id + ' .user-data__value-wrap'); // Блок редактирования
                    let i = 0;

                    for (let key in all_values) {
                        let value = all_values[key];

                        if (value && value.length > 0) {
                            const href = type_field == 9 ?
                                        'open_file.php?field=' + field_id + '&line=' + line_id + '&file=' + encodeURIComponent(value) + '&show=1' :
                                        'open_file.php?table=' + cur_table_id + '&field=' + field_id + '&line=' + line_id + '&file=' + encodeURIComponent(value);
                            const fileStyle = type_field == 9 ? 'class="fancybox-item" data-fancybox="gallery' + line_id + '"' : 'class="file_link"';
                            const el_class = `fast_edit_span_${field_id}_${line_id}${i} ${isSubtable ? '' : 'user-data__file-wrap user-data__file-wrap--view'}`;
                            const link_id = `fast_edit_span_${field_id}_${line_id}_${curSubtableId}${i}`;
                            let itemContainer = type_field == 9 ? $("<span class='whitespace_nowrap " + el_class + "'></span>") : $("<div class='whitespace_nowrap " + el_class + "'></div>");
                            let itemLink = $(`<a ${fileStyle} href='${href}' id='${link_id}' field_id='${field_id}' subtable_id='${cur_subtable_id}' line_id='${line_id}' title='${value}' onmouseover='onmouseover_file(event);' onmouseout='onmouseout_file(event); ' ${isSubtable ? '' : 'main_line'}></a>`);
                            let delBtn = $(`<span class='b_drop_hoverpopup' onclick='ondrop_file(event);' title='${lang.Delete}' ${isSubtable ? '' : 'main_line'}></span>`);

                            if (type_field == 9) { // Изображение
                                let itemHtml = $("<img src='cache/" + field['table_id'] + "_" + field_id + "_" + line_id + "_" + utf2eng(value) + ".png' />");

                                itemLink.append(itemHtml);
                            } else { // Файл
                                itemLink.text(value);
                            }
                            itemContainer.append($('<span class="draggableImgFile">&nbsp;</span>')).append(itemLink).append(delBtn);
                            filesArr.unshift(itemContainer);
                        }
                        i++;
                    }
                    if(isSubtable){
                        v_o.html('');
                    }
                    else {
                        v_o.find('.user-data__file-wrap--view').remove();
                        editBlock.find('.user-data__file-wrap--view').remove();
                    }
                    $.each(filesArr, function (i, item) {
                        v_o.prepend(item); // Отображаем элемент в основной записи (быстрое редактирование)
                        item.clone().prependTo(editBlock); // Для добавления такого же элемента для блока редактирования необходимо создать клон
                    });

                    $('#file' + field_id + '_count').val(valuesCount); // Изменяем значение в поле с количеством файлов
                    $('#new_file_form_' + field_id + '_' + line_id).show(); // Кнопка "Добавить" (для добавления нового файла)
                    $('#edit_block #value' + field_id).val(new_value); // Обновляем значение в поле полного редактирования
                }

                if (e_o) {
                    e_o.innerHTML = v_o[0].innerHTML;
                    e_o.style.background = '#fff6ad';
                    $(e_o).attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                }

                continue;
            }

            if (document.getElementById("fast_edit_span_" + field_id + "_" + line_id)) {
                document.getElementById("fast_edit_span_" + field_id + "_" + line_id).value = new_value;
            }
            if (field?.mult_value != '1' && document.getElementById("value" + field_id)) {
              document.getElementById("value" + field_id).value = new_value;
            }
            if ((document.getElementById("value" + field_id) || document.getElementById("fast_edit_span_" + field_id + "_" + line_id)) &&
                subField.length < 1) {
                continue;
            }

            // Нередактируемые поля
            o_str = '';
            $("[id^=sub_cell_" + field_id + "_" + line_id + "]").each(function () {
                if ($(this).html().indexOf("fast_edit_span_" + field_id + "_" + line_id) < 0) {
                    v_o = $(this);
                    if (type_field == 5) {
                        n_tmp = new_value.split("|");
                        int_val = n_tmp[0];
                        dspl_val = n_tmp[1];
                        if (view_field && field['disable_link'] == '0') {
                            v_o.find('.textpad__value').html('<a href="view_line2.php?table=' + field['s_table_id'] + '&line=' + int_val + '&back_url=' + base64_current_url + '">' + dspl_val + '</a>');
                        }
                        else {
                            v_o.find('.textpad__value').html(dspl_val);
                        }
                    }
                    else {
                        if (type_field != 3) v_o.find('.textpad__value').html(new_value);
                    }
                    v_o[0].style.background = '#fff6ad';
                    v_o.attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                    if (type_field == 3) {
                        // выполняем Javascript если он вписан и поле - отображать html
                        if (field['view_html']) {
                            var re = /<script>([\s\S]*?)<\/script>/gi;

                            js_result = new_value.match(re);
                            if (js_result) {
                                var o_str, s_len = String('<script>').length;
                                for (keyVar in js_result) {
                                    if (intval(keyVar) != keyVar) continue; // Фикс для ie, т.к. могут быть не только числа
                                    o_str = js_result[keyVar];
                                    o_str = o_str.substr(s_len, o_str.length - s_len * 2 - 1);
                                }
                            }
                        }
                        if (o_str != "") {
                            $(this).css('white-space', 'normal');
                            eval(o_str);
                            o_str = "";
                        }

                        if (typeof (v_o.val()) === 'undefined') {
                            if (field['view_hyperlink'] || field['view_html'] === 1)
                                v_o[0].innerHTML = new_value;
                            else if ((field['view_hyperlink'] || field['type_value'].indexOf('hyperlink') + 1) && new_value.substr(0, 4) == "http")
                                v_o[0].innerHTML = '<a href="' + new_value + '" target="_blank">' + new_value + '</a>';
                            else if (field['view_hyperlink'] || field['type_value'].indexOf('hyperlink') + 1)
                                v_o[0].innerHTML = '<a href="http://' + new_value + '" target="_blank">' + new_value + '</a>';
                            else // нередактируемые поля могут иметь один из 2 классов - проверяем оба
                                if (v_o.find('.textpad__value.textpad__value--text')) v_o.find('.textpad__value.textpad__value--text').html(htmlspecialchars(new_value));
                            if (v_o.find('.subtable_fields--not_edit')) {
                                if (v_o.find('.subtable_fields--not_edit_field')) v_o.find('.subtable_fields--not_edit_field').html(htmlspecialchars(new_value));
                                else v_o.find('.subtable_fields--not_edit').html(htmlspecialchars(new_value));
                            }
                            else v_o[0].innerHTML = htmlspecialchars(new_value);
                        } else {
                          // заполнить значением текстовое (многострочное) поле без прав на редактирование
                          if (v_o.find('.textpad__value.textpad__value--text')) {
                            if (field['type_value'].indexOf('hyperlink')) { // текстовое поле с гиперссылкой
                              v_o.find('.textpad__value.textpad__value--text').html(new_value);
                              // у span не тот класс, который должен быть, поэтому едет верстка
                              // восстанавлю классы
                              v_o.find('.textpad__value.textpad__value--text').attr("class", "subtable_fields--not_edit_field");
                            } else {
                              v_o.find('.textpad__value.textpad__value--text').html(htmlspecialchars(new_value));
                            }
                          }
                        }
                    }
                }
            });
            if (o_str != '')
                eval(o_str);

            // Редакируемые поля
            $(".fast_edit_span_" + field_id + "_" + line_id).each(function () {
                v_o = $(this);

                if ((type_field == 1) || (type_field == 2) || (type_field == 12) || (type_field == 3) || (type_field == 10)) { // Число, строка, дата
                    if ((type_field == 2) || (type_field == 12)) new_value = new_value.substr(0, 16);
                    if (typeof (v_o.val()) === 'undefined') {
                        if (field['view_html'])
                            v_o[0].innerHTML = new_value;
                        else if ((field['view_hyperlink'] || field['type_value'].indexOf('hyperlink') + 1) && new_value.substr(0, 4) == "http")
                            v_o[0].innerHTML = '<a href="' + new_value + '" target="_blank">' + new_value + '</a>';
                        else if (field['view_hyperlink'] || field['type_value'].indexOf('hyperlink') + 1)
                            v_o[0].innerHTML = '<a href="http://' + new_value + '" target="_blank">' + new_value + '</a>';
                        else
                            v_o[0].innerHTML = htmlspecialchars(new_value);
                    }
                    else
                        if (v_o) {
                            // Присваиваем новое значение для поля из вычисления
                            v_o[0].value = new_value;
                            v_o.css('background', '#fff6ad');
                            v_o.attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                            v_o.attr('cur_value', new_value);
                        }
                }
                // Автосохранение полей (в подтаблице)
                if (type_field == 5) { // Связь
                    n_tmp = new_value.split("|");
                    int_val = n_tmp[0];
                    dspl_val = n_tmp[1];
                    dspl_val = htmlspecialchars_decode(dspl_val);
                    let htmlVal = '';
                    const linkVal = v_o.siblings('.autocomplete_val');
                    let is_inline = v_o.attr('inline') == 1 ? true : false;
                    const linkTable = v_o.attr('link_table');
                    const newHref = 'view_line2.php?table=' + linkTable + '&line=' + int_val;

                    v_o.attr('f_value', int_val);
                    has_sub_fields = v_o.next().next().next().hasClass('sub-slave_fields');
                    if (has_sub_fields && int_val && int_val != lang.No_data) { // Если есть доп.поля, выбрано значение и есть доступ к полю
                        dspl_val = v_o.children('option[value=' + int_val + ']').text();
                    } else {
                        if (int_val) {
                            if (int_val.trim().length > 0) {
                                htmlVal = v_o.children('option[value=' + int_val + ']').html();
                            }
                        }
                    }
                    v_o.next().find('.autocomplete__input').val(dspl_val);
                    if (linkVal.length > 0) {
                        linkVal.attr('href', newHref);
                        linkVal.html(htmlVal);

                        const option = v_o.find(`option[value='${int_val}']`);
                        let slaveFields = '';

                        if (option) {
                            const addData = option.attr('data');

                            if (addData) {
                                const imgIdent = '<img';
                                const addDataArr = addData.split('</br>');
                                slaveFields = $(`<span class="show_field_slave ${is_inline ? 'inline' : ''}">`);

                                linkVal.remove();
                                addDataArr.forEach((field, idx) => {
                                    if (idx === 0 && field.indexOf(imgIdent) > -1) {
                                        const imgCount = field.split(imgIdent).length - 1;

                                        if (imgCount > 1) {
                                            let images = field.split('>');
                                            const firstImg = images[0] + '>';
                                            const imgVal = images.slice(1).join('>');

                                            dspl_val = firstImg + dspl_val;
                                            let slaveItem = $(`<span class="show-field-slave__item${is_inline ? '--inline' : ''}">`).append(imgVal);
                                            slaveFields.append(slaveItem);
                                        } else {
                                            dspl_val = field + dspl_val;
                                        }
                                    } else {
                                        let slaveItem = $(`<span class="show-field-slave__item${is_inline ? '--inline' : ''}">`).append(field);
                                        slaveFields.append(slaveItem);
                                    }
                                });
                            }
                        }

                        const disable_link = v_o.attr('disable_link');
                        const span = v_o.parent('div').find('span.autocomplete');
                        const aVisible = span.css('display') == 'none' ? '' : 'none';
                        let link = null;
                        if(disable_link == '1'){
                            link = $('<span class="autocomplete_val">');
                        }
                        else {
                            link = $('<a class="autocomplete_val" href="' + newHref + '" target="_blank">');
                        }
                        let subSlaveField = v_o.siblings('.sub-slave_fields');

                        if (subSlaveField.length > 0) subSlaveField.html('');
                        else subSlaveField = $('<div class="sub-slave_fields">');

                        if(is_inline && !subSlaveField.hasClass('inline')){
                            subSlaveField.addClass('inline');
                        }

                        link.html(dspl_val);
                        subSlaveField.append(link);
                        if (slaveFields !== '') {
                            if (slaveFields.html().trim().length > 0) {
                                subSlaveField.append(slaveFields);
                            }
                        }
                        v_o.siblings('.autocomplete_val').remove();
                        v_o.siblings('.fields__fast-edit-button--edit').before(subSlaveField);
                    } else {
                        const option = v_o.find(`option[value='${int_val}']`);
                        let slaveFields = '';
                        let is_inline = v_o.parent('span').find('.show_field_slave').hasClass('inline') ? true : false;

                        if (option) {
                            const addData = option.attr('data');

                            if (addData) {
                                const imgIdent = '<img';
                                const addDataArr = addData.split('</br>');
                                slaveFields = is_inline ? $(`<span class="show-field-slave__item--inline">`) : $(`<span class="show_field_slave">`);

                                addDataArr.forEach((field, idx) => {
                                    if (idx === 0 && field.indexOf(imgIdent) > -1) {
                                        const imgCount = field.split(imgIdent).length - 1;

                                        if (imgCount > 1) {
                                            let images = field.split('>');
                                            const firstImg = images[0] + '>';
                                            const imgVal = images.slice(1).join('>');

                                            dspl_val = firstImg + dspl_val;
                                            if(is_inline){
                                                slaveFields.append(imgVal);
                                            }
                                            else {
                                                let slaveItem = $(`<span class="show-field-slave__item">`).append(imgVal);
                                                slaveFields.append(slaveItem);
                                            }
                                        } else {
                                            dspl_val = field + dspl_val;
                                        }
                                    } else {
                                        if(is_inline){
                                            slaveFields.append(field);
                                        }
                                        else {
                                            let slaveItem = $(`<span class="show-field-slave__item">`).append(field);
                                            slaveFields.append(slaveItem);
                                        }
                                    }
                                });
                            }
                        }

                        const disable_link = v_o.attr('disable_link');
                        const span = v_o.parent('div').find('span.autocomplete');
                        const aVisible = span.css('display') == 'none' ? '' : 'none';
                        let link = null;
                        if(disable_link == '1'){
                            link = $('<span class="autocomplete_val">');
                        }
                        else {
                            link = $('<a class="autocomplete_val" href="' + newHref + '" target="_blank">');
                        }
                        let subSlaveField = v_o.siblings('.sub-slave_fields');

                        if (subSlaveField.length > 0) subSlaveField.html('');
                        else subSlaveField = $('<div class="sub-slave_fields" style="display:none;">');

                        link.html(dspl_val);
                        subSlaveField.append(link);
                        if (slaveFields !== '') {
                            if (slaveFields.html().trim().length > 0) {
                                subSlaveField.append(slaveFields);
                            }
                        }
                        v_o.siblings('.fields__fast-edit-button--edit').before(subSlaveField);
                    }

                    if (v_o.val() == 'null' && has_sub_fields) {
                        v_o.next().next().next().css('display', 'none');
                        v_o.next().next().next().attr('is_empty', 1);
                    }
                    v_o[0].style.background = '#fff6ad';
                    v_o.attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                }
                if (type_field == 9 || type_field == 6) { // Изображение
                    all_values = new_value.split('\r\n');
                    values_count = all_values.length;
                    html_code = " "; // Формируем новый блок
                    var i = 1;

                    for (var key in all_values) {
                        var value = all_values[key];

                        if (value && value.length > 0) {
                            if (type_field == 9) {
                                html_code += "<div class='whitespace_nowrap fast_edit_span_" + field_id + "_" + line_id + i + "'><a href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "&show=1\" onclick=\"image_window=window.open('open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "&show=1');image_window.focus();return false;\" id='new_file_upload_" + field_id + "_" + line_id + "_" + i + "' field_id='" + field_id + "' line_id='" + line_id + "' file_img='1' title='" + value + "'>"
                                html_code += "<img src='cache/" + cur_table_id + "_" + field_id + "_" + line_id + "_" + utf2eng(value) + ".png' class='sub_fast_edit_img'>";
                                html_code += "</a><span class='b_drop_hoverpopup' title='" + lang.Delete + "'></span></div>";
                            } else {
                                html_code += "<div class='whitespace_nowrap fast_edit_span_" + field_id + "_" + line_id + i + "'><a href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "\" id='new_file_upload_" + field_id + "_" + line_id + "_" + i + "' field_id='" + field_id + "' line_id='" + line_id + "' file_img='0' title='" + value + "'>"
                                html_code += value;
                                html_code += "</a><span class='b_drop_hoverpopup' title='" + lang.Delete + "'></span></div>";
                            }
                        } else {
                            html_code = "";
                        }
                        i++;
                    }
                    v_o.html(html_code);

                    $('.sub_fast_edit_img').parent().parent().parent().parent().each(function () {
                        $(this).css('width', '100%');
                    });

                    $('#sub_files_count_' + field_id + '_' + line_id).val(values_count);

                    i = 1;
                    for (var key in all_values) {
                        addHandler_file(document.getElementById("new_file_upload_" + field_id + "_" + line_id + "_" + i));
                        i++;
                    }
                }
                if (type_field == 4) { // Список
                    if (field['mult_value'] > 0) { // Мультисписок
                        all_values = new_value.split('\r\n');
                        values_count = all_values.length;
                        // Формируем значение в скрытом поле
                        if (new_value == "") {
                            v_o[0].value = "";
                            values_count = 0;
                        }
                        // Устанавливаем значения
                        $("div[id^=sub_cell_" + field_id + "_" + line_id + "]").each(function () {
                            n = 0;
                            if (!saved_field || this.id.indexOf("sub_cell_" + field_id + "_" + line_id + "_" + cur_subtable_id) < 0) {
                                $(this).find('select[multi_select_group=' + field_id + '_' + line_id + ']').each(function (i) {
                                    select_obj = this;
                                    last_select = select_obj;
                                    n_tmp = select_obj.nextSibling;
                                    select_obj.style.background = '#fff6ad';
                                    $(n_tmp).attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
                                    if (n < values_count) {  // устанавливаем значение
                                        select_obj.value = all_values[n];
                                        n_tmp.innerHTML = all_values[n];
                                        select_obj.setAttribute("is_last", 0);
                                        $(select_obj).children().each(function (y) {
                                            if (this.value != select_obj.value) { // не выбранный елемент
                                                if (in_array(this.value, all_values)) {
                                                    this.style.display = 'none';
                                                    this.setAttribute('disabled', 'disabled');
                                                }
                                                else {
                                                    this.style.display = '';
                                                    this.setAttribute('disabled', '');
                                                    this.removeAttribute('disabled');
                                                }
                                            }
                                            else {
                                                this.style.display = '';
                                                this.setAttribute('disabled', '');
                                                this.removeAttribute('disabled');
                                            }
                                        });
                                    }
                                    else if (n == values_count) { // пустое значение в конце
                                        select_obj.value = "";
                                        select_obj.setAttribute("is_last", 1);
                                    }
                                    else { // лишние значения, удаляем
                                        $(select_obj).remove();
                                    }
                                    n++;
                                });

                                // если новых элементов больше чем существующих - добавляем
                                for (n; n <= values_count; n++) {
                                    // Создание элемента, на основе копирования последнего
                                    var obj_tag_name = last_select.tagName;
                                    subtblId = $(last_select).attr("subtable_id");
                                    var new_id = "fast_edit_span_" + field_id + "_" + line_id + "_" + subtblId + n;
                                    var newEL = document.createElement(obj_tag_name);
                                    newEL.id = new_id;
                                    newEL.className = "";
                                    newEL.setAttribute("subtable_id", subtblId);
                                    // события
                                    addHandler_mult_select(newEL);

                                    // атрибуты
                                    newEL.setAttribute("multi_select_group", field_id + "_" + line_id);
                                    newEL.setAttribute("style", last_select.getAttribute("style"));
                                    newEL.style.background = '';
                                    newEL.setAttribute("field_id", field_id);
                                    newEL.setAttribute("line_id", line_id);
                                    newEL.setAttribute("pos", n);
                                    newEL.setAttribute("is_last", 1);
                                    newEL.setAttribute("tabindex", last_tabindex_fast_edit);
                                    $(newEL).html(last_select.innerHTML);
                                    newEL.selectedIndex = -1;

                                    // вставляем после текущего
                                    var t_span = last_select.parentNode;
                                    var next_node = t_span.nextSibling;
                                    t_span.parentNode.insertBefore(newEL, next_node);
                                    $(newEL).attr('add_width', '0');
                                    form_fast_select_obj(newEL);

                                    select_obj = newEL;
                                    last_select = select_obj;
                                    n_tmp = select_obj.nextSibling;

                                    if (n < values_count) {  // устанавливаем значение
                                        select_obj.value = all_values[n];
                                        n_tmp.innerHTML = all_values[n];
                                        select_obj.setAttribute("is_last", 0);
                                        $(select_obj).children().each(function (y) {
                                            if (this.value != select_obj.value) { // не выбранный елемент
                                                if (in_array(this.value, all_values)) {
                                                    this.style.display = 'none';
                                                    this.setAttribute('disabled', 'disabled');
                                                }
                                                else {
                                                    this.style.display = '';
                                                    this.setAttribute('disabled', '');
                                                    this.removeAttribute('disabled');
                                                }
                                            }
                                            else {
                                                this.style.display = '';
                                                this.setAttribute('disabled', '');
                                                this.removeAttribute('disabled');
                                            }
                                        });
                                    }
                                    else if (n == values_count) { // пустое значение в конце
                                        select_obj.value = "";
                                        select_obj.setAttribute("is_last", 1);

                                        if (options_count == 0) // Не одного видимого элемента, скрываем котрол
                                        {
                                            select_obj.style.display = 'none';
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else { // Обычный список
                        if (typeof v_o !== 'undefined' && v_o) {
                            v_o[0].value = new_value;
                            var n_tmp = v_o.next().next();
                            if (n_tmp.length > 0) {
                                n_tmp.text(new_value);
                            }
                        }
                    }
                }

                if (type_field == 7 || type_field == 11 || type_field == 14) { // Пользователь, группа

                    if (field['mult_value'] > 0) {
                        if (saved_field) {
                            pre_value = trim(new_value, "-")
                            all_values = pre_value.split('-');
                            values_count = all_values.length;
                            var all_list_count;
                            all_text_values = [];

                            // Формируем значение в скрытом поле
                            if (new_value == "") {
                                v_o[0].value = "";
                                values_count = 0;
                            }
                            else {
                                var hidden_val = "-";
                                for (l = 0; l < values_count; l++) {
                                    all_list_count = 0;
                                    for (v_id in field['s_list_values']) {
                                        all_list_count += 1;
                                        if (all_values[l] == v_id) {
                                            all_text_values[l] = field['s_list_values'][v_id];
                                            hidden_val += v_id + "-";
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            all_text_values = new_value.split('\r\n');
                            values_count = all_text_values.length;
                            var all_list_count;
                            all_values = [];

                            // Формируем значение в скрытом поле
                            if (new_value == "") {
                                v_o[0].value = "";
                                values_count = 0;
                            }
                            else {
                                var hidden_val = "-";
                                for (l = 0; l < values_count; l++) {
                                    all_list_count = 0;
                                    for (v_id in field['s_list_values']) {
                                        all_list_count += 1;
                                        if (all_text_values[l] == field['s_list_values'][v_id]) {
                                            hidden_val += v_id + "-";
                                            all_values[l] = v_id;
                                        }
                                    }
                                }
                                v_o[0].value = hidden_val;
                            }
                        };

                        // Устанавливаем значения
                        $("div[id^=sub_cell_" + field_id + "_" + line_id + "]").each(function () {
                            n = 0;
                            if (!saved_field || this.id.indexOf("sub_cell_" + field_id + "_" + line_id + "_" + cur_subtable_id) < 0) {
                                $(this).find('select[multi_select_group=' + field_id + '_' + line_id + ']').each(function (i) {
                                    select_obj = this;
                                    last_select = select_obj;
                                    var n_tmp = select_obj.nextSibling;
                                    v_o[0].style.background = '#fff6ad';
                                    setTimeout(function () {
                                        v_o[0].style.backgroudColor = '';
                                    }, 300);
                                    if (n < values_count) {  // устанавливаем значение
                                        select_obj.value = all_values[n];
                                        n_tmp.innerHTML = all_text_values[n];
                                        select_obj.setAttribute("is_last", 0);
                                        $(select_obj).children().each(function (y) {
                                            if (this.value != select_obj.value) { // не выбранный елемент
                                                if (in_array(this.value, all_values)) {
                                                    this.style.display = 'none';
                                                    this.setAttribute('disabled', 'disabled');
                                                }
                                                else {
                                                    this.style.display = '';
                                                    this.setAttribute('disabled', '');
                                                    this.removeAttribute('disabled');
                                                }
                                            }
                                            else {
                                                this.selected = true;
                                                this.style.display = '';
                                                this.setAttribute('disabled', '');
                                                this.removeAttribute('disabled');
                                            }
                                        });
                                    }
                                    else if (n == values_count) { // пустое значение в конце
                                        if (type_field == 14)
                                            select_obj.value = "";
                                        else
                                            select_obj.value = 0;
                                        select_obj.setAttribute("is_last", 1);
                                    }
                                    else { // лишние значения, удаляем
                                        $(t_span).remove();
                                    }
                                    n++;
                                });

                                // если новых элементов больше чем существующих - добавляем
                                for (n; n <= values_count; n++) {
                                    // Создание элемента, на основе копирования последнего
                                    var obj_tag_name = last_select.tagName;
                                    subtblId = $(last_select).attr("subtable_id");
                                    var new_id = "fast_edit_span_" + field_id + "_" + line_id + "_" + subtblId + n;
                                    var newEL = document.createElement(obj_tag_name);
                                    newEL.setAttribute("subtable_id", subtblId);
                                    newEL.id = new_id;
                                    newEL.className = "";
                                    // события
                                    addHandler_mult_select(newEL);

                                    // атрибуты
                                    newEL.setAttribute("multi_select_group", field_id + "_" + line_id);
                                    newEL.setAttribute("style", last_select.getAttribute("style"));
                                    newEL.style.background = '';
                                    newEL.setAttribute("field_id", field_id);
                                    newEL.setAttribute("line_id", line_id);
                                    newEL.setAttribute("pos", n);
                                    newEL.setAttribute("is_last", 1);
                                    newEL.setAttribute("tabindex", last_tabindex_fast_edit);
                                    $(newEL).html(last_select.innerHTML);
                                    newEL.selectedIndex = -1;

                                    // вставляем после текущего
                                    var t_span = last_select.parentNode;
                                    var next_node = t_span.nextSibling;
                                    t_span.parentNode.insertBefore(newEL, next_node);
                                    $(newEL).attr('add_width', '0');
                                    form_fast_select_obj(newEL);

                                    var select_obj = newEL;
                                    var last_select = select_obj;
                                    n_tmp = select_obj.nextSibling;

                                    if (n < values_count) {  // устанавливаем значение
                                        select_obj.value = all_values[n];
                                        n_tmp.innerHTML = all_text_values[n];
                                        select_obj.setAttribute("is_last", 0);
                                        $(select_obj).children().each(function (y) {
                                            if (this.value != select_obj.value) { // не выбранный елемент
                                                if (in_array(this.value, all_values)) {
                                                    this.style.display = 'none';
                                                    this.setAttribute('disabled', 'disabled');
                                                }
                                                else {
                                                    //this.selected = true;
                                                    this.style.display = '';
                                                    this.setAttribute('disabled', '');
                                                    this.removeAttribute('disabled');
                                                }
                                            }
                                            else {
                                                this.style.display = '';
                                                this.setAttribute('disabled', '');
                                                this.removeAttribute('disabled');
                                            }
                                        });
                                    }
                                    else if (n == values_count) { // пустое значение в конце
                                        var options_count = 0;
                                        if (type_field == 14)
                                            select_obj.value = "";
                                        else
                                            select_obj.value = 0;
                                        select_obj.setAttribute("is_last", 1);

                                        if (options_count == 0) // Не одного видимого элемента, скрываем котрол
                                        {
                                            select_obj.style.display = 'none';
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else { // Обычный список
                        if (saved_field) {
                            var new_value_id = new_value;
                            var text_value = field['s_list_values'][new_value_id];
                            if (type_field == 7 && new_value_id == 0)
                                text_value = '';
                        }
                        else {
                            var new_value_id = 0;
                            var text_value = new_value;
                            for (v_id in field['s_list_values'])
                                if (new_value == field['s_list_values'][v_id]) new_value_id = v_id;
                        }

                        if (typeof v_o !== 'undefined' && v_o) {
                            v_o[0].value = new_value;
                            var n_tmp = v_o.next();
                            if (n_tmp.length > 0) {
                                n_tmp.text(text_value);
                            }
                        }
                    }
                }
            });
        }
        updateInformers();
        updateColorFormat(line_id);
    }

  showJalertMessagesObj(messagesObj, messagesNum);
}

function sub_save_click() {
    if (cur_mode !== "edit") {
        $(`[id^='fast_edit_span_']`).each((i, el) => {
            if($(el).hasClass('bordered-elem')) $(el).removeClass('bordered-elem');
        });
        $(".subtable__footer-btn--save").fadeOut();
        displayNotification(lang.save_value_notify, 1);
    } else {
        save_line(true);
    }
}

function scroll_to_subtables() {
    const subtableFormTop = $('#subtables_form').offset().top;
    const scrollTop = subtableFormTop - 120;
    $('html, body').animate({ scrollTop: scrollTop }, 500);
}

function switch_subtable(subtable_id, page_number = '', isFix = false) {
    var popup = $('.subtable__dropdown-list');
    var moreBtn = $('.subtable__tab-list li.flexMenu-viewMore');

    if (popup.length > 0) {
        popup.hide();

        if (moreBtn.length > 0) {
            moreBtn.css({
                'border-radius': '7px 7px 0 0'
            });
            moreBtn.find('.flexMenu-viewMore__border').remove();
        }
    }

    create_subtable?.remove_pagination_scroll(); // Удаляем обработчик с предыдущей подтаблицы
    create_subtable?.get_subtable_data(subtable_id, page_number);


    var prev_tab = document.getElementById('tab_' + cur_subtable_id);
    var prev_footer = document.getElementById('subtable-footer' + cur_subtable_id);
    var cur_footer = document.getElementById('subtable-footer' + subtable_id);
    var cur_tab = document.getElementById('tab_' + subtable_id);
    var prev_subtable = document.getElementById('sub_' + cur_subtable_id);
    var cur_subtable_block = document.getElementById('sub_' + subtable_id);
    const prevFixTab = $('#fix-tab_' + cur_subtable_id);
    const curFixTab = $('#fix-tab_' + subtable_id);

    // Обновляем список уникальных полей для текущей записи (поля записи + подтаблица)
    curSubtableId = $('#tab_' + subtable_id).attr('table_id');
    uniq_fields = init_all_uniq_fields();

    if (prev_footer) {
        prev_footer.style.display = 'none';
        if ($(prev_footer).find('.subtable__footer-btn--add')) {
            $(prev_footer).find('.subtable__footer-btn--add').removeAttr("id");
        }
        if (cur_footer) {
            cur_footer.style.display = 'flex';
            if ($(cur_footer).find('.subtable__footer-btn--add')) {
                $(cur_footer).find('.subtable__footer-btn--add').attr('id', 'add_line_in_subtable');
            }
        }
    }

    if (prev_subtable) {
        prev_subtable.style.display = 'none';
        $(prev_subtable).fixedTable(true);
        remove_events_from_group_btns($(prev_subtable));
    }

    if (cur_subtable_block) {
        cur_subtable_block.style.display = 'block';
        $(cur_subtable_block).fixedTable();
        set_position_group_btns($(cur_subtable_block));
        create_subtable.init_pagination_scroll(); // Ставим обработчик на новую подтаблицу
        cur_subtable = all_subtables[subtable_id];
    }

    document.getElementById('subtable').value = subtable_id;


    $.cookie("subtable_id", subtable_id);
    $("#setting_t").css('display', 'inline');
    if (cur_mode == "view") $(".subtable__footer-btn--save").css("display", "none");
    if (all_subtables[subtable_id]) {
        replace_href_on_settings(subtable_id);
    }

    // Отображение списка подтаблиц в обычном header-е
    if (prev_tab && cur_tab) {
        prev_tab.classList.remove('subtable__tab-item--active');
        cur_tab.classList.add('subtable__tab-item--active');
        cur_subtable_id = subtable_id;
    }

    // Отображение списка подтаблиц в фиксированном header-е
    if (prevFixTab && curFixTab) {
        prevFixTab.removeClass('fix-subtable__tab-item--active');
        curFixTab.addClass('fix-subtable__tab-item--active');
        cur_subtable_id = subtable_id;

        // Если нажатие было по фиксированному header-у, скроллим страницу до подтаблиц
        if (isFix) {
            scroll_to_subtables();
        }
    }

    if (moreBtn.length > 0) {
        if (moreBtn.is(':has(.subtable__tab-item--active)')) {
            moreBtn.find('> a').addClass('more-active');
            moreBtn.addClass('more-active-li');
        } else {
            moreBtn.find('> a').removeClass('more-active');
            moreBtn.removeClass('more-active-li');
        }
    }

}

function replace_href_on_settings(subtable_id) {
    const settingsBtn = $("#setting_t");
    const fixSettingsBtn = $("#fix-setting_t");

    $("#subtable_to_table_link").attr('href', 'fields.php?table=' + all_subtables[subtable_id]['table_id'] + all_subtables[subtable_id]['status_line'] + '&rel_search&rel_table=' + table_id + '&rel_line=' + line + '&rel_field=' + all_subtables[subtable_id]['rel_field'] + (all_subtables[subtable_id]['filter_id'] != 0 ? '&filter=' + all_subtables[subtable_id]['filter_id'] : ''));
    $("#fix-subtable_to_table_link").attr('href', 'fields.php?table=' + all_subtables[subtable_id]['table_id'] + all_subtables[subtable_id]['status_line'] + '&rel_search&rel_table=' + table_id + '&rel_line=' + line + '&rel_field=' + all_subtables[subtable_id]['rel_field'] + (all_subtables[subtable_id]['filter_id'] != 0 ? '&filter=' + all_subtables[subtable_id]['filter_id'] : ''));
    if (all_subtables[subtable_id]['url'] === '0' || !all_subtables[subtable_id]['url']) {
        settingsBtn.attr('href', 'edit_field.php?table=' + all_subtables[subtable_id]['table_id']);
        fixSettingsBtn.attr('href', 'edit_field.php?table=' + all_subtables[subtable_id]['table_id']);
    } else {
        if (all_subtables[subtable_id]['url'] === 'inact') {
            settingsBtn.css('display', 'none');
            fixSettingsBtn.css('display', 'none');
        } else {
            settingsBtn.attr('href', all_subtables[subtable_id]['url']);
            fixSettingsBtn.attr('href', all_subtables[subtable_id]['url']);
        }
    }
}

function explode(delimiter, string) {
    var emptyArray = { 0: '' };
    if (arguments.length != 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined') {
        return null;
    }
    if (delimiter === ''
        || delimiter === false
        || delimiter === null) {
        return false;
    }
    if (typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    return string.toString().split(delimiter.toString());
}

function call_dialog(type, phones, table_id, line_id, sips) {
    phones = phones.split(',');
    sips = sips.split(',');
    if (sips.length == 1) {
        if (phones.length == 1) {
            var phone = phones[0];
            if (type == 'asterisk') {
                module_asterisk_call(phone, table_id, line_id);
            }
            if (type == 'asterisk_window') {
                module_asterisk_call_window(phone, table_id, line_id);
            }
        } else {
            var text = "";
            for (key in phones) {
                var phone = phones[key].replace(/ /g, '');
                if (phone != '') {
                    if (type == 'asterisk') {
                        var func = "module_asterisk_call('" + phone + "', " + table_id + ", " + line_id + ")";
                    }
                    if (type == 'asterisk_window') {
                        var func = "module_asterisk_call_window('" + phone + "', " + table_id + ", " + line_id + ")";
                    }
                    text += '<p><a href="" style="font-size:16px" onclick="$(\'.ui-dialog-titlebar-close\').click(); ' + func + '; return false;">' + phone + '</a></p>';
                }
            }
            jinfo('<div align=center>' + text + '</div>', 'Выберите номер телефона', 300, true);
        }
    } else {
        var text = "";
        for (key in sips) {
            var sip = sips[key].split('|');
            if (type == 'asterisk') {
                var func = "module_asterisk_call('#phone#', " + table_id + ", " + line_id + ", " + sip[0] + ")";
            }
            if (type == 'asterisk_window') {
                var func = "module_asterisk_call_window('#phone#', " + table_id + ", " + line_id + ", " + sip[0] + ")";
            }
            text += '<p><a href="" style="font-size:16px" onclick="$(\'.ui-dialog-titlebar-close\').click(); ' + func + '; return false;">' + sip[1] + '</a></p>';
        }
        if (phones.length == 1) {
            var phone = phones[0];
            jinfo('<div align=center>' + text.replace(/#phone#/g, phone) + '</div>', 'Выберите исходящий номер', 300, true);
        } else {
            var text2 = "";
            for (key in phones) {
                var phone = phones[key].replace(/ /g, '');
                if (phone != '') {
                    var func = "jinfo('<div align=center>" + text.replace(/#phone#/g, phone).replace(/'/g, "\\'").replace(/"/g, "&quot;") + "</div>', 'Выберите исходящий номер', 300, true)";
                    text2 += '<p><a href="" style="font-size:16px" onclick="$(\'.ui-dialog-titlebar-close\').click(); ' + func + '; return false;">' + phone + '</a></p>';
                }
            }
            jinfo('<div align=center>' + text2 + '</div>', 'Выберите номер телефона', 300, true);
        }
    }
}

// сохранить значение мулти-селекта
function save_value_multi(field_id, line_id, full_value) {
    $(".subtable__footer-btn--save").fadeIn();
    var page_param = "";
    if (cur_subtable) {
        page_param = "&subtable_page=" + cur_subtable['cur_page'] + "&rel_field=" + cur_subtable['rel_field'];
    }
    var new_val = encodeURIComponent(full_value);
    var new_line = (new_line_status) ? '&new_line_status=1' : '';
    ajax_update.format = 0;
    ajax_update.method = "POST";
    ajax_update.call("field=" + field_id + "&line=" + line_id + "&value=" + new_val + "&csrf=" + csrf + page_param + new_line, ComRespSaveMultSub);
}

// Обработать отклик о сохранении
function ComRespSaveSub(resp) {
    resp = checkResp(resp);
    if (resp == "Invalid access.") {
        alert(lang.Invalid_access);
        window.location.reload();
        return;
    }
    resp = trim(resp, "\r\n");
    var resp_arr = resp.toString().split("\r\n");

    for (let i = 0; i < resp_arr.length; i++) {
        var res_arr = resp_arr[i].toString().split("|");
        var field_id = res_arr[2];
        var line_id = res_arr[3];
        var new_value = Base64.decode(res_arr[4]);
        var v_o;

        if (trim(res_arr[0]) === "saved") {
            save_val_count--;
            if (save_val_count < 1) {
                var saved_obj = $('[yellow_color=1]');

                saved_obj.removeClass('bordered-elem');
                if (saved_obj.hasClass('ac_input')) {
                    saved_obj.next().removeClass('bordered-elem');
                }

                saved_obj.attr('yellow_color', '').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
            }
            UpdateData(resp_arr);
            add_request_to_update_arr(resp_arr);

            // Тайм-аут для применения цветового форматирования после сохранения данных
            setTimeout(function () {
                if (user.display_notification_on && !isNewLine) {
                    displayNotification(lang.save_value_notify, 1);
                }
            }, 1001);
            $(`[id^='fast_edit_span_'][id$='${line_id}_${cur_subtable_id}']`).each((i, el) => {
                if($(el).hasClass('bordered-elem')) $(el).removeClass('bordered-elem');
            });
            $('.subtable__footer-btn.subtable__footer-btn--save').fadeOut();
        }

        setTimeout(updateColorFormat(line_id), 0);
    }
}

// Обработать отклик о сохранении мультивыбора
function ComRespSaveMultSub(resp) {
    resp = checkResp(resp);
    if (resp == "Invalid access.") {
        alert(lang.Invalid_access);
        window.location.reload();
        return;
    }
    resp = trim(resp, "\r\n");
    var res_arr = resp.toString().split("|");
    var resp_arr = resp.toString().split("\r\n");
    var field_id = res_arr[2];
    var line_id = res_arr[3];
    var new_value = Base64.decode(res_arr[4]);
    if (res_arr[0] == "saved" || res_arr[0] == "message") {
        // Обратный отклик не реализован, просто меняем фон на белый
        if (trim(res_arr[0]) == "saved") {
            var saved_obj = $('[yellow_color=1]');
            if (saved_obj.length > 0) {
                saved_obj.removeClass('bordered-elem');
                saved_obj.attr('yellow_color', '0').stop().animate({ backgroundColor: 'transparent' }, 1000).css('background', '');
            }
            UpdateData(resp_arr);
            add_request_to_update_arr(resp_arr);
        }
    }
}

function ComRespInsrtSub(resp) {
    resp = checkResp(resp);
    resp = trim(resp, "\r\n");
    var resp_arr = resp.toString().split("\r\n");
    for (i = 0; i < resp_arr.length; i++) {
        var res_arr = resp_arr[i].toString().split("|");
        var instr_table_id = res_arr[1];
        var instr_line_id = res_arr[2];
        var cur_line_id = res_arr[3];
        if (trim(res_arr[0]) == "inserted") {
            var newTR = document.getElementById('subtable_' + cur_subtable_id + "_line_-" + cur_line_id);
            newTR.id = 'subtable_' + cur_subtable_id + "_line_" + instr_line_id;

            var n_html = newTR.innerHTML.replace(/_undefined_line_id_/g, instr_line_id);   // подменяем номер строки
            n_html = n_html.replace(/undefined_datepicker_class/g, 'datepicker'); // подменяем класс календаря
            n_html = n_html.replace(/undefined_fast_edit_select/g, 'fast_edit_select'); // подменяем класс селекта

            var t_id = newTR.id;
            var el = document.createElement('div');
            el.innerHTML = '<table><tr class="subtable__row subtable__row--simple" id="' + t_id + '">' + n_html + '</tr></table>'; // IE не позволяет менять innerHTML у TR всвязи с чем выстроено данное извращение
            var newTR2 = el.firstChild.rows[0];
            newTR2.style.background = '#fff6ad';
            newTR.parentNode.replaceChild(newTR2, newTR);

            $(".datepicker, .datetime_textpad input").parent().parent().css('white-space', 'nowrap');
            // Выставляем селект на все невыставленные элементы
            let linkSelectElem = $(`.subtable__row[id*=${t_id}] select.combobox[line_id=${instr_line_id}]`);
            linkSelectElem.attr('type_field', '5');

            // выполняем Javascript если он вписан
            var re = /<script>([\s\S]*?)<\/script>/gi;
            js_result = n_html.match(re);
            if (js_result) {
                var o_str, s_len = String('<script>').length;
                for (keyVar in js_result) {
                    if (intval(keyVar) != keyVar) continue; // Фикс для ie, т.к. могут быть не только числа
                    o_str = js_result[keyVar];
                    o_str = o_str.substr(s_len, o_str.length - s_len * 2 - 1);
                    eval(o_str);
                }
            }

            // ставим фокус на первое поле
            var first_field_id = (cur_subtable) ? cur_subtable['first_edit_field'] : null;
            var first_field = document.getElementById("fast_edit_span_" + first_field_id + "_" + instr_line_id);
            if (first_field) {
                if ((show_fields['fields'][first_field_id]['type_field'] == 1) || (show_fields['fields'][first_field_id]['type_field'] == 3)) {
                    var evt = { currentTarget: first_field };
                    onmousedown_text(evt); // FIX IE 8, некорректно работает привязка bind на новых объектах, поэтому используем addHandler
                }
                else $(first_field).mousedown();
                $(first_field).focus();
            }

            setTimeout(function () {
                newTR2.style.background = '';
                add_rows_count--;
                if (add_rows_count === 0) {
                    var subtable = $('#sub_' + cur_subtable_id);
                    var table_wrap = $('#sub_' + cur_subtable_id + ' .subtable__table-wrap');
                    table_wrap.css('overflow-x', 'auto');
                    var tr_id = newTR.id;
                    init_subtable_fast_edit(cur_subtable_id);
                    $('#' + tr_id).find($('.btn-drop')).on('click', function (e) {
                        e.preventDefault();
                        var id_arr = tr_id.split('_');           /** Вытаскиваем из id line_id          **/
                        var line_id = id_arr[id_arr.length - 1]; /** Он является последним в id         **/
                        sub_drop_line(line_id);                  /** Создаем обработчик удаления строки **/
                    });
                    $('#' + tr_id).find($('.fast_edit_select, .sub_fast_edit_select--select, input[type="text"], textarea')).each(function () {
                        var is_empty = true;

                        if ($(this).hasClass('fast_edit_select') || $(this).hasClass('sub_fast_edit_select--select')) {
                            if ($(this).val() && $(this).val() !== '0') {
                                is_empty = false;
                            }
                        } else {
                            if ($(this).val() !== '' && $(this).val() != 0 && $(this).val() !== '0,00') {
                                is_empty = false;
                            }
                        }

                        if (is_empty) {
                            if ($(this).hasClass('ac_input')) {
                                $(this).next().addClass('bordered-elem');
                            }
                            $(this).addClass('bordered-elem');
                        }
                    });
                    $(newTR2).find('.fast_edit_datepicker').each((i, item) => {
                        if($(item).hasClass('fast_edit_datetime')){
                            if(lang.date_js_format.indexOf('.') !== -1){
                                $(item).mask('99.99.9999 00:00');
                            }
                            else {
                                $(item).mask('99/99/9999 00:00');
                            }
                        }
                        else {
                            if(lang.date_js_format.indexOf('.') !== -1){
                                $(item).mask('99.99.9999');
                            }
                            else {
                                $(item).mask('99/99/9999');
                            }
                        }
                    });
                    var preloader = table_wrap.find($('.preloader__block'));
                    subtable.find($('.subtable__overlay')).remove();
                    preloader.remove();
                    var head_buttons = $('.subtable__head button');
                    head_buttons.attr('disabled', false);
                    stick.remove();
                    $('.fixed-table-layer').css('visibility', 'visible');
                }
                $('#' + tr_id + ' textarea').each(function () {
                    autosize(this);
                });

                // Необходимо вызвать изменения поля типа Дата у новой строки для сохранения значения, иначе оно не сохраняется
                let newHiddenRow = $('.datepicker.new_hidden_row');

                if (newHiddenRow && newHiddenRow.val()) {
                    if (newHiddenRow.val().replace(/\s/g, '').length > 0) {
                        //newHiddenRow.trigger('change');
                        newHiddenRow.each(function(i, el){
                          // затираются значения при добавлении записи, х.з.
                          // зачем этот onchange не смог разобраться
                          // onchange_date({'target': el}, true);
                        })
                    }
                    newHiddenRow.removeClass('new_hidden_row');
                }

                // Обновляем если были вычисления
                UpdateData(resp_arr);
                add_request_to_update_arr(resp_arr);
                init_subtable_new_line_edit_buttons(tr_id);
            }, 1000);

            // запуск плагина select2
            $('.select2-plugin').select2({ajax: _s2_ajax()});
            $('select.select2-plugin[id^="fast_edit_span_"]').each((index, item) => {
              if ($(item).next().next().length > 0) {
                $(item).next().next().remove(); // убираю лишний span
              }
            });

            // вешаю событие change
            $('.select2-plugin')
              .on('select2:unselecting', _s2_setPreviouslyvalue)
              .on('change', _s2_handleChange);
        }
    }
}

function init_subtable_new_line_edit_buttons(tr_id) {
    $(`.subtable #${tr_id} .textpad span.autocomplete`).each(function (i, link) {
        // Проверяем, что поле не входит в блок быстрого добавления записи
        if (!$(link).parent('div').hasClass('user-data__value--add')) $(link).hide();
    });

    const edit_buttons = $(`.subtable #${tr_id} .fields__fast-edit-button--edit`);
    const done_buttons = $(`.subtable #${tr_id} .fields__fast-edit-button--done`);

    if (edit_buttons.length > 0) {
        edit_buttons.each(function () {
            $(this).mouseup(function (e) {
                e.stopPropagation();
            });
            $(this).click(init_edit_buttons_subtable_new_line);
        });
    }

    if (done_buttons.length > 0) {
        done_buttons.each(function () {
            $(this).mouseup(function (e) {
                e.stopPropagation();
            });
            $(this).click(init_done_buttons_subtable_new_line);
        })
    }
}

function init_edit_buttons_subtable_new_line(e) {
    var target = $(e.target);
    var field_id = target.attr('field_id');
    var line_id = target.attr('line_id');

    if (line_id && field_id) {
        var text_field = $('.fast_edit_span_' + field_id + '_' + line_id).next();
        var select = $('.fast_edit_span_' + field_id + '_' + line_id);
        var done_btn = $('#button-done-' + line_id + '-' + field_id);
        text_field.parent().css('padding', '0');
        var content;
        if ((target.prev().text().length > 0 && !target.parent().hasClass('fields__special-text--html')) || target.parent().prev().length === 0) {
            if (target.prev().hasClass('show_field_slave'))
                content = target.prev().prev();
            else
                content = target.prev();
        } else {
            content = target.parent().prev();
        }
        if (text_field.length > 0 && done_btn.length > 0 && (content.length > 0 || target.parent().find($('.fields__fast-edit--combobox')).length > 0)) {
            if (select.hasClass('combobox--hidden')) {
                if (!target.parent().hasClass('fields__special-text--html')) {
                    if (target.parent().hasClass('fields__special-text--hyperlink')) {
                        text_field.val(content.text());
                    } else {
                        if (parseInt(select.attr('disable_link')) === 0) {
                            text_field.val(content.find($('a')).text());
                        } else {
                            text_field.val(content.find($('.autocomplete_val')).text());
                        }
                    }
                }
            }
            if (target.prev().hasClass('sub-slave_fields')) target.prev().hide();
            content.parent().find('.autocomplete_val').hide();
            content.hide();
            target.hide();
            text_field.show();
            done_btn.show();
            if (target.parent().hasClass('fields__special-text--html')) {
                autosize(text_field);
                var resize_btn = content.prev();
                if (resize_btn.length > 0) {
                    resize_btn.css('opacity', '0');
                }
            }
        }
    }
}

function init_done_buttons_subtable_new_line(e) {
    var target = $(e.target);
    var field_id = target.attr('field_id');
    var line_id = target.attr('line_id');
    var additional_field = $('.show-field-slave__item');
    var content = target.parent().children().first();
    var selectBox = find_select_of_autocomplete(content.parent().find('.autocomplete__input'));

    if (target.parents('.textpad__value').find('.autocomplete_val').length === 0) {
        const linkTableId = $('.fast_edit_span_' + field_id + '_' + line_id).attr('link_table');
        const linkLineVal = $('.fast_edit_span_' + field_id + '_' + line_id).attr('ac_link_val');

        if(selectBox.attr('disable_link') == 1){
            target.parent().find('.autocomplete').after(`<span class="sub-slave_fields"><span class='autocomplete_val'></span></span>`);
        }
        else {
            target.parent().find('.autocomplete').after(`<span class="sub-slave_fields"><a class='autocomplete_val' href="view_line2.php?table=${linkTableId}&line=${linkLineVal}"></a></span>`);
        }
    }

    if (line_id && field_id) {
        var text_field = $('.fast_edit_span_' + field_id + '_' + line_id).next();
        var edit_btn = $('#button-edit-' + line_id + '-' + field_id);

        text_field.parent().css('padding', 0);
        if (text_field.length > 0 && edit_btn.length > 0 && content.length > 0 && !text_field.hasClass('slave_fields')) {
            let val = content.parent().find('.autocomplete__input').val();
            let subFieldsBlock = content.parent().find('.sub-slave_fields').first();
            let is_inline = selectBox.attr('inline') == 1 ? true : false;
            content.parent().find('.autocomplete_val').html(`<span class="main_value">${val}</span>`).show();
            if (subFieldsBlock.attr('is_empty') != 1) {
                subFieldsBlock.show();
            } else if (val.length > 0) {
                text_field.show();
            }
            edit_btn.show();
            target.hide();
            text_field.hide();

            // Если есть доп.поля - выводим
            // Доп. поля передаются в option селекта в атрибуте data
            let selectOption = selectBox.find('option[value=' + selectBox.val() + ']');
            let additionalFields = selectOption.attr('data') ? selectOption.attr('data').split('</br>') : -1;
            let mainVal = content.parent().find('.autocomplete_val');
            let slaveFields = null;
            let is_append = false;
            if(is_inline){
                slaveFields = $(`<span class="show-field-slave__item--inline">`);
            }
            else {
                if(content.parent().find('.show_field_slave').length > 0){
                    slaveFields = content.parent().find('.show_field_slave');
                }
                else {
                    slaveFields = $('<span class="show_field_slave">');
                    is_append = true;
                }
            }
            const imgIdent = '<img';

            if (additionalFields != -1) {
                slaveFields.html('');
                additionalFields.forEach((field, idx) => {
                    if (idx === 0 && field.indexOf(imgIdent) > -1) {
                        const imgCount = field.split(imgIdent).length - 1;

                        if (imgCount > 1) {
                            let images = field.split('>');
                            const firstImg = images[0].indexOf('<') !== -1 ? images[0].slice(images[0].indexOf('<')) + '>' : images[0] + '>';;
                            const imgVal = images.slice(1).join('>');

                            mainVal.html(firstImg + '<span class="main_value">' + val + '</span>');
                            let slaveItem = $(`<span class="show-field-slave__item${is_inline ? '--inline' : ''}">`).append(imgVal);
                            slaveFields.append(slaveItem);
                        } else {
                            mainVal.html((field.indexOf('<') !== -1 ? field.slice(field.indexOf('<')): field) + `<span class="main_value">${val}</span>`);
                        }
                    } else {
                        if(is_inline){
                            slaveFields.append(" " + field);
                        }
                        else {
                            let slaveItem = $(`<span class="show-field-slave__item${is_inline ? '--inline' : ''}">`).append(field);
                            slaveFields.append(slaveItem);
                        }
                    }
                });
                if(is_inline){
                    mainVal.find('.main_value').append(slaveFields);
                }
                if(is_append){
                    mainVal.after(slaveFields);
                }
                slaveFields.show();
            }
        }
    }

    // Отображаем доп.поля после сохранения быстрого редактирования
    additional_field.show();
}

// удалить строку из подтаблицы
function sub_drop_line(line_id) {
    var preloader = create_preloader_block();
    var overlay = $('<div class="subtable__overlay">');
    var subtable = $('#sub_' + cur_subtable_id);
    var table_wrap = $('#sub_' + cur_subtable_id + ' .subtable__table-wrap');
    var t_o = document.getElementById("subtable_" + cur_subtable_id + "_line_" + line_id);
    var page_param = "";
    var new_line = (new_line_status) ? '&new_line_status=1' : '';

    // Отображение прелоадера при удалении строки
    subtable.append(overlay);
    table_wrap.append(preloader);
    if (cur_subtable)
        page_param = "&subtable_page=" + cur_subtable['cur_page'] + "&rel_field=" + cur_subtable['rel_field'];
    t_o.style.background = '#fff6ad';
    ajax_update.format = 0;
    ajax_update.method = "POST";
    ajax_update.call("sel=delete_line&table_id=" + cur_subtable['table_id'] + "&line_id=" + line_id + "&csrf=" + csrf + page_param + new_line, ComRespDropSub);
}

function checkResp(resp) {
    var inserted, changed, saved, deleted, message;

    (resp.indexOf('message') !== -1) ? message = resp.indexOf('message') : message = 9999999;
    (resp.indexOf('inserted') !== -1) ? inserted = resp.indexOf('inserted') : inserted = 9999999;
    (resp.indexOf('changed') !== -1) ? changed = resp.indexOf('changed') : changed = 9999999;
    (resp.indexOf('saved') !== -1) ? saved = resp.indexOf('saved') : saved = 9999999;
    (resp.indexOf('deleted') !== -1) ? deleted = resp.indexOf('deleted') : deleted = 9999999;

    var sortedArr = [message, inserted, changed, saved, deleted].sort(compareNumeric);

    switch (sortedArr[0]) {
        case message:
            resp = resp.substr(resp.indexOf('message'));
            break
        case inserted:
            resp = resp.substr(resp.indexOf('inserted'));
            break;
        case changed:
            resp = resp.substr(resp.indexOf('changed'));
            break;
        case saved:
            resp = resp.substr(resp.indexOf('saved'));
            break;
        case deleted:
            resp = resp.substr(resp.indexOf('deleted'));
            break;
        default:
            console.log('unknown error, tell your admin about it')
    }
    return resp;
}

//Функция для сортировки массива
function compareNumeric(a, b) {
    return a - b;
}

/**
 * Метод для вставки наружней рамки
 */
function set_subtable_border_top() {
    var subtable_outer = $('.subtable__outer-wrap');

    if (subtable_outer.length > 0) {
        var header = subtable_outer.find($('.subtable__head'));
        var header_height = header.outerHeight(true);
        var border = subtable_outer.find($('.subtable__border'));
        var BORDER_WIDTH = 2;

        border.css({
            'top': header_height - BORDER_WIDTH + 'px'
        });
        border.addClass('subtable__border--active');
    }
}

function get_edit_hyper_value(obj_id) {
    var link = "";
    var val = $('#edit_hyper_value_' + obj_id + ' a:first-child').attr('href');
    if (val) {
        if (val.indexOf('mailto:') === 0) {
            val = val.substring(7);
        }
        else if(val.indexOf('http://') === 0){
            val = val.substring(7);
        }
        else if(val.indexOf('https://') === 0){
            val = val.substring(8);
        }
        link = val;
    }
    var placeholder = $('#edit_html_input_value_' + obj_id).attr('placeholder');
    var par_w = $('#edit_hyper_value_' + obj_id).width();
    $('#edit_hyper_value_' + obj_id).html('<input type="text" value="' + link + '" style="border: 1px dotted rgba(160, 160, 160, 0);min-height:17px; outline:none; background: #fff;padding:0px;width:' + par_w + 'px;"/>');
    $('#edit_html_input_value_' + obj_id + ' input').attr('placeholder', placeholder);
    $('#edit_hyper_value_' + obj_id + ' input:first-child').focus();
    $('#edit_hyper_value_' + obj_id + ' input:first-child').blur(function () {
        $('#edit_html_input_value_' + obj_id).css("border", "1px dotted #ffffff");
        save_edit_hyper_value(obj_id)
    });
    $('#edit_hyper_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #a0a0a0");
    });
    $('#edit_hyper_value_' + obj_id).attr('onclick', '');
}

function save_edit_hyper_value(obj_id) {
    var link = $('#edit_hyper_value_' + obj_id + ' input:first-child').val();
    link = link.trim();
    $('#edit_hyper_value_' + obj_id).css('background', '#fff6ad');
    $('#edit_hyper_value_' + obj_id).attr('yellow_color', '1');

    save_value($('#edit_hyper_value_' + obj_id).attr('field_id'), $('#edit_hyper_value_' + obj_id).attr('line_id'), link);
    // Формируем cсылку
    var link_url = '';
    var last_word = '';
    var full_link = '';
    var blank = 'target="_blank"';
    if (link) {
        if (link.indexOf('http:') === 0 || link.indexOf('ftps:') === 0) {
            last_word = link.substring(7);
        } else if (link.indexOf('https:') === 0) {
            last_word = link.substring(8);
        } else if (link.indexOf('ftp:') === 0) {
            last_word = link.substring(6);
        } else if (~link.indexOf('@')) {
            last_word = link;
            link = 'mailto:' + link;
            blank = '';
        } else {
            last_word = link;
            link = 'http://' + link;
        }
        if (last_word === '') {
            last_word = link;
        }
        full_link = '<a href="' + link + '" ' + blank + '>' + last_word + '</a>';
    }
    if (full_link === '') {
        full_link = '<a href="' + link + '" ' + blank + '>' + link + '</a>';
    }
    $('#edit_hyper_value_' + obj_id).html(full_link);
    $('#edit_hyper_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #ffffff");
    });
    $('#edit_hyper_value_' + obj_id).attr('onclick', 'get_edit_hyper_value("' + obj_id + '")');
}

function get_edit_html_value(obj_id) {
    var html = $('#edit_html_value_' + obj_id).html();
    var placeholder = $('#edit_html_input_value_' + obj_id).attr('placeholder');
    $('#edit_html_value_' + obj_id).html('<textarea style="border: 0px dotted rgba(160, 160, 160, 0);min-height:17px; outline:none; background: #fff;padding:0px;width:100%;height:100%;display:block;box-sizing: border-box;">' + html + '</textarea>');
    autosize($('#edit_html_value_' + obj_id + ' textarea:first-child'));
    $('#edit_html_input_value_' + obj_id + ' textarea').attr('placeholder', placeholder);
    $('#edit_html_value_' + obj_id + ' textarea:first-child').focus();
    $('#edit_html_value_' + obj_id + ' textarea:first-child').blur(function () {
        $('#edit_html_value_' + obj_id).css("border", "1px dotted #ffffff");
        save_edit_html_value(obj_id)
    });
    $('#edit_html_value_' + obj_id).mouseout(function () {
        $(this).css({
            "border": "1px dotted #a0a0a0"
        });
    });
    $('#edit_html_value_' + obj_id).attr('onclick', '');
}

function save_edit_html_value(obj_id) {
    var html = $('#edit_html_value_' + obj_id + ' textarea:first-child').val();

    $('#edit_html_value_' + obj_id).css('background', '#fff6ad');
    $('#edit_html_value_' + obj_id).attr('yellow_color', '1');

    save_value($('#edit_html_value_' + obj_id).attr('field_id'), $('#edit_html_value_' + obj_id).attr('line_id'), html);

    $('#edit_html_value_' + obj_id).html(html);
    $('#edit_html_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #ffffff");
    });
    $('#edit_html_value_' + obj_id).attr('onclick', 'get_edit_html_value("' + obj_id + '")');
}

function get_edit_html_input_value(obj_id) {
    var html = $('#edit_html_input_value_' + obj_id).html();
    var placeholder = $('#edit_html_input_value_' + obj_id).attr('placeholder');
    var par_w = $('#edit_html_input_value_' + obj_id).width();
    const oldVal = $('#edit_html_input_value_' + obj_id).attr('cur_value');

    $('#edit_html_input_value_' + obj_id).html('<input type="text" value="' + html + '" cur_value="' + oldVal + '" style="border: 1px dotted rgba(160, 160, 160, 0);min-height:17px; outline:none; background: #fff;padding:0px;width:' + par_w + 'px;"/>');
    $('#edit_html_input_value_' + obj_id + ' input').attr('placeholder', placeholder);
    $('#edit_html_input_value_' + obj_id + ' input:first-child').focus();
    $('#edit_html_input_value_' + obj_id + ' input:first-child').blur(function () {
        $('#edit_html_input_value_' + obj_id).css("border", "1px dotted #ffffff");
        save_edit_html_input_value(obj_id);
    });
    $('#edit_html_input_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #a0a0a0");
    });
    $('#edit_html_input_value_' + obj_id).attr('onclick', '');
}

function save_edit_html_input_value(obj_id) {
    var html = $('#edit_html_input_value_' + obj_id + ' input:first-child').val();

    $('#edit_html_input_value_' + obj_id).css('background', '#fff6ad');
    $('#edit_html_input_value_' + obj_id).attr('yellow_color', '1');
    $('#edit_html_input_value_' + obj_id).attr('cur_value', html);

    save_value($('#edit_html_input_value_' + obj_id).attr('field_id'), $('#edit_html_input_value_' + obj_id).attr('line_id'), html);

    $('#edit_html_input_value_' + obj_id).html(html);
    $('#edit_html_input_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #ffffff");
    });
    $('#edit_html_input_value_' + obj_id).attr('onclick', 'get_edit_html_input_value("' + obj_id + '")');
}

function get_edit_non_html_input_value(obj_id) {
    var text = $('#edit_non_html_input_value_' + obj_id).html();
    var par_w = $('#edit_non_html_input_value_' + obj_id).width();

    var align_the = "";
    if ($('#edit_non_html_input_value_' + obj_id).attr('field_type') != 3) align_the = 'text-align:right;';

    $('#edit_non_html_input_value_' + obj_id).html('<input type="text" value="' + htmlspecialchars(text) + '" style="' + align_the + 'border: 1px dotted rgba(160, 160, 160, 0);min-height:17px; outline:none; background: #fff;padding:0px;width:' + par_w + 'px;"/>');

    $('#edit_non_html_input_value_' + obj_id + ' input:first-child').focus();
    $('#edit_non_html_input_value_' + obj_id + ' input:first-child').blur(function () {
        $('#edit_non_html_input_value_' + obj_id).css("border", "1px dotted #ffffff");
        save_edit_non_html_input_value(obj_id)
    });
    $('#edit_non_html_input_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #a0a0a0");
    });
    $('#edit_non_html_input_value_' + obj_id).attr('onclick', '');
}

function save_edit_non_html_input_value(obj_id) {
    var text = $('#edit_non_html_input_value_' + obj_id + ' input:first-child').val();
    text = htmlspecialchars(text);

    $('#edit_non_html_input_value_' + obj_id).css('background', '#fff6ad');
    $('#edit_non_html_input_value_' + obj_id).attr('yellow_color', '1');

    save_value($('#edit_non_html_input_value_' + obj_id).attr('field_id'), $('#edit_non_html_input_value_' + obj_id).attr('line_id'), text);

    $('#edit_non_html_input_value_' + obj_id).html(text);
    $('#edit_non_html_input_value_' + obj_id).mouseout(function () {
        $(this).css("border", "1px dotted #ffffff");
    });
    $('#edit_non_html_input_value_' + obj_id).attr('onclick', 'get_edit_non_html_input_value("' + obj_id + '")');
}

function explode(delimiter, string) {
    var emptyArray = { 0: '' };
    if (arguments.length != 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined') {
        return null;
    }
    if (delimiter === ''
        || delimiter === false
        || delimiter === null) {
        return false;
    }
    if (typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    return string.toString().split(delimiter.toString());
}

// Добавить запись в конец
function sub_add_new_line(group_pp, top) {
    $(".subtable__footer-btn--save").fadeIn();
    var add_group_insrt_pararms = "";

    var t_html = document.getElementById('last_subtable_tr_' + cur_subtable_id).innerHTML;
    var t_id = 'subtable_' + cur_subtable_id + "_line_-" + last_inserted_lines_id;
    var el = document.createElement('div');
    var sumF = document.createElement('div');
    var sumFieldsContent = "";

    el.innerHTML = '<table>' +
        '<tr class="subtable__row subtable__row--simple subtable__row--format-not-init" id="' + t_id + '">' +
        t_html +
        '</tr>' +
        '</table>'; // IE не позволяет менять innerHTML у TR в связи с чем выстроено данное извращение

    var subtable = $('#sub_' + cur_subtable_id);
    var table_wrap = $('#sub_' + cur_subtable_id + ' .subtable__table-wrap');
    var rows = table_wrap.find($('.subtable__row--simple'));
    var newTR = el.firstChild.rows[0];

    if (add_rows_count === 0) {
        var preloader = create_preloader_block();
        var overlay = $('<div class="subtable__overlay">');

        subtable.append(overlay);
        table_wrap.append(preloader);
        document.querySelector('.subtable .subtable__wrap .preloader').style.opacity = 0; // скрываем до того как на него навесится метод stick
        stick = new Stick(document.querySelector('.subtable .subtable__wrap .preloader'), document.querySelector('#subtable-footer' + cur_subtable_id), 'center');
        stick.create();
        table_wrap.css('overflow-x', 'hidden');
        var head_buttons = $('.subtable__head button');
        head_buttons.attr('disabled', true);
    }
    add_rows_count++;

    $('.fixed-table-layer').css('visibility', 'hidden');

    if ((group_pp === -1) || (typeof group_pp === 'undefined')) { // Группа не задана добавляем в конец
        var sumRow;
        var sum_row = $("#subtable_" + cur_subtable_id + "_sum_0");
        // Строка с суммами
        if (sum_row.length > 0) {
            sumFieldsContent = sum_row.html();
            sum_row.remove();
            sumF.innerHTML = '<table><tr class="subtable__row" id="subtable_' + cur_subtable_id + '_sum_0">' + sumFieldsContent + '</tr></table>';
            sumRow = sumF.firstChild.rows[0];
        }

        if (top) {
            var subtable = $("#subtable_" + cur_subtable_id);
            $("tr:eq(0)", subtable).after(newTR);
        }
        else {
            document.getElementById('subtable_' + cur_subtable_id).appendChild(newTR.parentNode.removeChild(newTR));
        }
        if (sumRow) {
            document.getElementById('subtable_' + cur_subtable_id).appendChild(sumRow.parentNode.removeChild(sumRow));
        }
    } else {
        delGroupLines[group_pp] = 0;
        var sumRow;
        // Строка с суммами
        var sum_row = $("#subtable_" + cur_subtable_id + "_sum_" + group_pp);
        if (sum_row.length > 0) {
            sumFieldsContent = sum_row.html();
            sum_row.remove();
            sumF.innerHTML = '<table><tr class="subtable__row" id="subtable_' + cur_subtable_id + '_sum_' + group_pp + '">' + sumFieldsContent + '</tr></table>';
            sumRow = sumF.firstChild.rows[0];
        }

        var insert_point = document.getElementById('subtable_' + cur_subtable_id + '_group_' + group_pp);
        if (top) {
            $("#subtable_" + cur_subtable_id + "_top_group" + group_pp).after(newTR);
        } else {
            if (insert_point) {
                insert_point.parentNode.insertBefore(newTR, insert_point);
            }
        }

        if (sumRow && insert_point) {
            insert_point.parentNode.insertBefore(sumRow, insert_point);
        }

        if (sub_groups_fields_defs[cur_subtable_id][group_pp]) {
            add_group_insrt_pararms = "&def_value_f" + cur_subtable['group_field'] + "=" + sub_groups_fields_defs[cur_subtable_id][group_pp];
        }
    }
    newTR.style.background = '#fff6ad';

    // Не все текстовые поля возвращаются с бэка, но значение по умолчанию уже на фронте
    // поэтому назначаю им доп.класс с рамкой
    $("input[id^='fast_edit_span_'][id$='__undefined_line_id__3']" ).addClass('bordered-elem');

    var page_param = "";
    var new_line = (new_line_status) ? '&new_line_status=1' : '';
    if (cur_subtable)
        page_param = "&subtable_page=" + cur_subtable['cur_page'] + "&rel_field=" + cur_subtable['rel_field'];
    ajax_update.format = 0;
    ajax_update.method = "POST";
    ajax_update.call("sel=insert_new_line&subtable_id=" + cur_subtable_id + "&csrf=" + csrf + "&parent_line_id=" + line + "&inserted_line=" + last_inserted_lines_id + add_group_insrt_pararms + page_param + new_line, ComRespInsrtSub);
    count_the_number_of_subtable_entries(cur_subtable_id);

    last_inserted_lines_id++;

    if (biz_proc) {
        if (biz_proc['subtable_id']) {
            switch_subtable(biz_proc['subtable_id']);
        }

        if (biz_proc['action'] === 'add_subtable' && biz_proc['conditions_execution'] == 2) {
            var cond_value = explode('  ', biz_proc['cond_value']);
            var used_fields = explode(',', biz_proc['used_fields']);
            var cond_count = cond_value.length;
            var cond = new Array();
            var term = new Array();
            var cur_value = new Array();
            //разберем условия
            for (var i = 0; i < cond_count; i++) {
                if (cond_value[i] == '')
                    continue;

                //если это условие
                if (!cond_value[i].indexOf('$cur_line')) {
                    my_reg = /\s*.+?\].+?\]\s*(.*)/ig;
                    my_arr = my_reg.exec(cond_value[i]);

                    cond.push(my_arr[1]);
                }
                else
                    term.push(cond_value[i]);
            }

            //пройдемся по полям
            for (var j = 0; j < used_fields.length; j++) {
                cur_value.push($("#view_cell_" + used_fields[j]).text());
            }

            cur_value.reverse();
            var condition = '';
            //соберем условие
            for (var z = 0; z < cur_value.length; z++) {
                if (term[z]) {
                    condition += "'" + cur_value[z] + "'" + ' ' + cond[z] + ' ' + term[z] + ' ';
                }
                else {
                    condition += "'" + cur_value[z] + "'" + ' ' + cond[z];
                }
            }

            var condition_result;

            $.ajax({
                url: "common.php",
                type: "POST",
                data: { 'condition_flag': '1', 'condition_param': condition, 'csrf': csrf },
                success: function (response) {
                    condition_result = response;

                    if (condition_result == 1) {
                        if (biz_proc['autostep'] == 1) {
                            window.location.search = '?bizproc=' + cur_bizproc.id + '&step=' + biz_proc['num'] + '&table_id=' + biz_proc['table_id'] + '&line=' + line;
                            allow_out_bizproc = 1;
                        } else {
                            $("#bizproc_next_step_link_my").css("display", "inline");
                            $("#green_arrow").css('display', 'none');
                        }
                    }
                    if (condition_result == 0)
                        $("#bizproc_next_step_link_my").css("display", "none");

                    if (biz_proc['action'] == 'add_subtable' && biz_proc['conditions_execution'] == 1 && biz_proc['records_number'] != 0) {
                        click_count += 1;

                        if (click_count == biz_proc['records_number']) {
                            if (biz_proc['autostep'] == 1) {
                                window.location.search = '?bizproc=' + cur_bizproc.id + '&step=' + next_bp_step.num + '&table_id=' + biz_proc['table_id'] + '&line=' + line;
                                allow_out_bizproc = 1;
                            } else {
                                $("#bizproc_next_step_link_my").css("display", "inline");
                                $("#green_arrow").css('display', 'none');
                            }
                        }
                    }

                    if (rows.length === 0 || rows.length === 1) {
                        var group_btns = subtable.find($('.subtable__group-btns'));
                        if (group_btns.length > 0) {
                            var GROUP_BTNS_WIDTH = 231;
                            var subtable_width = subtable.outerWidth(true);

                            group_btns.css('left', subtable_width - GROUP_BTNS_WIDTH);
                        }
                    }
                }
            });
        }
    }
}

/**
 * Задает ширину селекту в подтаблице в зависимости от ширины ячейки
 * @param select
 */
function resize_subtable_select(select) {
    var $select = $(select);
    var PADDING = 25;
    var textpad = $select.parents('.textpad');
    if (textpad.length > 0) {
        if (!textpad.attr('default-width')) {
            var width = textpad.width();
            var MIN_SELECT_WIDTH = 150;
            if (width >= MIN_SELECT_WIDTH && textpad.attr('with-prefix')) {
                var MIN_PREFIX_WIDTH = 100;
                width -= MIN_PREFIX_WIDTH;
            }
            $select.css('width', (width - 5 - PADDING) + 'px');
        }
    }
}

/**
 * Установка ширины для полей html редактирования в подтаблице
 * Метод работает по такому же принципу как метод ***resize_subtable_select***
 * Метод создан по причине костыльной реализации полей типа текст с хтмл редактированием
 * @param textarea
 */
function resize_subtable_html(textarea) {
    var $textarea = $(textarea);
    var textpad = $textarea.parents('.textpad');

    if (textpad.length > 0) {
        if (textpad.attr('default-width')) {
            var TEXTAREA_DEFAULT_WIDTH = 150;

            if (textpad.attr('with-prefix')) {
                var TEXTPAD_DEFAULT_WIDTH = 250;
                textpad.css('width', TEXTPAD_DEFAULT_WIDTH + 'px');
            } else {
                textpad.css('width', TEXTAREA_DEFAULT_WIDTH + 'px');
            }
            $textarea.css('width', TEXTAREA_DEFAULT_WIDTH + 'px');
        } else {
            var width = textpad.width();
            var MIN_TEXTAREA_WIDTH = 150;
            if (width >= MIN_TEXTAREA_WIDTH && textpad.attr('with-prefix')) {
                var MIN_PREFIX_WIDTH = 100;
                width -= MIN_PREFIX_WIDTH;
            }
            $textarea.css('width', (width - 15) + 'px');
        }
    }
}

function resize_subtable_link(link) {
    var $link = $(link);
    var textpad = $link.parents('.textpad');
    var LINK_BTN_WIDTH = 25;

    if (textpad.length > 0) {
        if (textpad.attr('default-width')) {
            var LINK_DEFAULT_WIDTH = 150;

            if (textpad.attr('with-prefix')) {
                var TEXTPAD_DEFAULT_WIDTH = 250;
                textpad.css('width', TEXTPAD_DEFAULT_WIDTH + 'px');
            } else {
                textpad.css('min-width', LINK_DEFAULT_WIDTH + 'px');
                textpad.css('max-width', LINK_DEFAULT_WIDTH + 'px');
            }
            $link.css('width', (LINK_DEFAULT_WIDTH - LINK_BTN_WIDTH) + 'px');
        } else {
            var width = textpad.width() - LINK_BTN_WIDTH;
            var LINK_WIDTH = 150;
            if (width >= LINK_WIDTH && textpad.attr('with-prefix')) {
                var MIN_PREFIX_WIDTH = 100;
                width -= MIN_PREFIX_WIDTH;
            }
            $link.css('width', (width - 6) + 'px');
        }
    }
}


/*===КОД===*/

if (biz_proc) {
    if (biz_proc['subtable_id']) {
        if (cur_subtable_id != biz_proc['subtable_id']) {
            switch_subtable(biz_proc['subtable_id']);
        }
    }

    if (biz_proc['action'] === 'add_subtable' && biz_proc['conditions_execution '] == 2) {
        var cond_value = explode('  ', biz_proc['cond_value']);
        var used_fields = explode(',', biz_proc['used_fields']);
        var cond_count = cond_value.length;
        var cond = new Array();
        var term = new Array();
        var cur_value = new Array();
        //разберем условия
        for (var i = 0; i < cond_count; i++) {
            if (cond_value[i] == '')
                continue;

            //если это условие
            if (!cond_value[i].indexOf('$cur_line')) {
                my_reg = /\s*.+?\].+?\]\s*(.*)/ig;
                my_arr = my_reg.exec(cond_value[i]);

                cond.push(my_arr[1]);
            }
            else
                term.push(cond_value[i]);
        }

        //пройдемся по полям
        for (var j = 0; j < used_fields.length; j++) {
            cur_value.push($("#view_cell_" + used_fields[j]).text());
        }

        cur_value.reverse();
        var condition = '';
        //соберем условие
        for (var z = 0; z < cur_value.length; z++) {


            if (term[z]) {
                condition += "'" + cur_value[z] + "'" + ' ' + cond[z] + ' ' + term[z] + ' ';
            }
            else {
                condition += "'" + cur_value[z] + "'" + ' ' + cond[z];
            }
        }

        var condition_result;

        $.ajax({
            url: "common.php",
            type: "POST",
            data: { 'condition_flag': '1', 'condition_param': condition, 'csrf': csrf },
            success: function (response) {
                condition_result = response;

                if (condition_result == 1) {
                    if (biz_proc['autostep'] == 1) {
                        window.location.search = '?bizproc=' + cur_bizproc.id + '&step=' + next_bp_step.num + '&table_id=' + biz_proc['table_id'] + '&line=' + line;
                        allow_out_bizproc = 1;
                    } else {
                        $("#bizproc_next_step_link_my").css("display", "inline");
                        $("#green_arrow").css('display', 'none');
                    }
                }

                if (biz_proc['action'] == 'add_subtable' && biz_proc['conditions_execution'] == 1 && biz_proc['records_number'] != 0) {
                    click_count += 1;

                    if (click_count == biz_proc['records_number']) {
                        if (biz_proc['autostep'] == 1) {
                            window.location.search = '?bizproc=' + cur_bizproc.id + '&step=' + next_bp_step.num + '&table_id=' + biz_proc['table_id'] + '&line=' + line;
                            allow_out_bizproc = 1;
                        } else {
                            $("#bizproc_next_step_link_my").css("display", "inline");
                            $("#green_arrow").css('display', 'none');
                        }
                    }
                }
            }
        });
    }
}

/**
 * Подсчитать количество записей в подтаблице
 * @param {number} subtable_id  Идентификатор подтаблицы
 */
function count_the_number_of_subtable_entries(subtable_id) {
  let line_count = 0;
  $(`tr[id^="subtable_${subtable_id}_line_"]`).each(function(){
    line_count++;
  })
  $(`#tab_count_${subtable_id}`).text(line_count);
}

/* Добавление переносов для полей связь */
function addBreakStyleRelations() {
    $('.sub-slave_fields').find('span.autocomplete_val').addClass('text-link_break');
}
