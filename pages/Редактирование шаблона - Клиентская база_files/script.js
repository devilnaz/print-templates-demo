function set_on_image(a, ext) {
    img_cats = document.getElementById('img_cat_' + a);
    img_cats.src = 'cache/img_cat_on_' + a + '.' + ext;
}

function set_image(a, ext) {
    img_cats = document.getElementById('img_cat_' + a);
    img_cats.src = 'cache/img_cat_' + a + '.' + ext;
}

//Отображение режима
function view_mode(mode, type) {
    if (mode === undefined) {
        mode = 0;
    }
    if (type === undefined) {
        type = 'calc';
    }
    mode = Number(mode);
    if (mode === 0) {
        $('[data-type=construct]').show();
        $('[data-type=expert]').hide();
        var status = $('input[name="use_params"][value="1"]').prop('checked');
        if (status) {
            view_params(1);
        } else {
            view_params(0);
        }
    } else {
        $('[data-type=construct]').hide();
        $('[data-type=expert]').show();
    }
}

function view_params(status) {
    if (status === undefined) {
        status = 0;
    }
    status = Number(status)
    if (status === 0) {
        $('#calc_params_block').hide();
        $('#calc_params_block_create').hide();
    } else {
        $('#calc_params_block').show();
        $('#calc_params_block_create').show();
    }
}

//Отображение конструктора
function open_construct(table, element, calc_id, type, params, calc_type) {
    if (calc_id === undefined) {
        calc_id = 0;
    }
    if (params === undefined) {
        params = false;
    }
    if (calc_type === undefined) {
        calc_type = 1;
    }
    if (!window.cnt_tpl) { //Счетчик шаблонов
        window.cnt_tpl = 0;
    }

    if (params) {
        $.each(params['id'], function (tpl_num, tpl_id) {
            create_select_tpl(table, element, calc_id, type, tpl_id, calc_type);
        });
    } else {
        create_select_tpl(table, element, calc_id, type, 0, calc_type);
    }
}

//Создает select для выбора шаблона
function create_select_tpl(table, element, calc_id, type, tpl_id, calc_type) {
    if (tpl_id === undefined) {
        tpl_id = 0;
    }
    var calc_area = element;
    var cnt_tpl = window.cnt_tpl;
    var data = get_tpl_sel_items(table, calc_id, type, tpl_id, calc_type);
    //Формируем селект
    var select_put = $("<select>")
        .attr({
            name: "construct_tpl[" + cnt_tpl + "]",
            "data-tpl-num": cnt_tpl,
            "data-table_id": table,
            class: "form-control form-control-250 select_tpl",
            value: tpl_id
        })
        .change(function () {
            get_tpl($(this), calc_id, type);
            change_tpl = 1;
            init_chosen();
        })
        .append(data);
    //Формируем иконки
    var icon;
    if (cnt_tpl == 0) {
        icon = add_create_icon(table, element, calc_id, type, calc_type);
    } else {
        icon = add_del_icon(select_put);
    }
    var icon_edit = add_edit_icon(select_put);
    //Вставляем селект с иконками
    var div_put = $("<div>").attr({class: "construct_select"}).append(select_put).append(icon_edit).append(icon);
    calc_area.append(div_put);
    //Вызываем get_tpl, чтобы сформировать шаблон, если он есть
    get_tpl(select_put, calc_id, type);
    window.cnt_tpl++;
}

//Возвращает иконку Добавления
function add_create_icon(table, element, calc_id, type, calc_type) {
    return $("<img>")
        .attr({
            "src": "images/green_plus.png",
            "class": "icon icon_create"
        })
        .click(function () {
            create_select_tpl(table, element, calc_id, type, 0, calc_type);
        });
}


//Возвращает иконку Удаления
function add_del_icon(element) {
    return $("<img>")
        .attr({
            "src": "images/b_drop.png",
            "data-tpl-num": element.attr("data-tpl-num"),
            "class": "icon icon_delete"
        })
        .click(function () {
            delete_tpl_item(element);
        });
}

//Возвращает иконку Редактирования
function add_edit_icon(element) {
    return $("<img>")
        .attr({
            "src": "images/b_edit.png",
            "data-tpl-num": element.attr("data-tpl-num"),
            "class": "icon icon_edit"
        })
        .click(function () {
            show_tpl($(this))
        });
}

//Отображает текущий шаблон, скрывает остальные
function show_tpl(element) {
    var num_tpl = element.attr("data-tpl-num");
    $("select.select_tpl").css('border-color', 'rgb(204, 204, 204)');
    $("select.select_tpl[data-tpl-num='" + num_tpl + "']").css('border', '1px solid green');
    $(".td_tpl").hide();
    $("td.td_tpl[data-tpl-num='" + num_tpl + "']").show();
    bind_help_bt();
}

//Вносит шаблон на страницу
function load_tpl(data, num_tpl, val) {
    var calc_tpl = $("#calc_tpl_tr");
    var td_tpl = $("td.td_tpl[data-tpl-num='" + num_tpl + "']");
    $("select.select_tpl").css('border-color', 'rgb(204, 204, 204)');
    $("select.select_tpl[data-tpl-num='" + num_tpl + "']").css('border', '1px solid green');
    $(".td_tpl").hide();
    if (td_tpl.length == 0) {
        var td_tpl = $("<td>")
            .attr({
                "data-tpl-num": num_tpl,
                "colspan": 2,
                "align": "center"
            })
            .addClass("td_tpl")
            .append(data);
        calc_tpl.append(td_tpl);
    } else {
        td_tpl.html(data);
        td_tpl.show();
    }
    //bind_help_bt();
    if (calc_tpl.css('display') === 'none') {
        calc_tpl.show();
    }
    var correlation = new Correlation(num_tpl);
    correlation.init();
    bind_help_bt();
    setTimeout(() => {
        init_chosen();
    }, 100);
}

function expert_mode_button(id) {
    jconfirm('Запуск в режиме эксперта приведет к потере возможности редактирования в режиме конструктора, вы уверены?',
        function () {
            yes_cons();
        },
        function () {
            no_cons();
        }
    );

    function yes_cons() {
        $.ajax({
            type: 'POST',
            url: 'calc_construct.php',
            data: 'resetConstruct=' + id + '&csrf=' + csrf,
            success: function () {
                window.location.reload();
            }
        });
        return false;
    }

    function no_cons() {
        return false;
    }
}

function delete_tpl_item(element) {
    if (!element) {
        return;
    }
    var tpl_items = $("[data-tpl-num=" + element.attr("data-tpl-num") + "]");
    if (tpl_items.length > 0) {
        tpl_items.remove();
        tpl_events[element.attr("data-tpl-num")] = [];
        set_tpl_events();
    }
}


function date_cond(cond, date2) {
    if (cond.val() === 'period') {
        date2.show();
    } else {
        date2.hide();
    }
}

function setLink(option, input) {
    if (option !== undefined) {
        input.val(option.data('link'));
    }
}

function open_parameters() {

}

function cond_mode() {
    var conds_mode = $('input[name="set_conds"]:checked');
    var conds_block = $('#cond_block');
    if (conds_mode === undefined) {
        $('input[name="set_conds"][value="0"]').prop('checked', 'true');
    } else {
        var status = Number(conds_mode.val());
        if (status) {
            conds_block.show();
        } else {
            conds_block.hide();
        }
    }
}

/* AJAX запросы */

//Получает список полей
function getField(table_id, select, name_param, tpl_num) {
    table_id = Number(table_id);
    if (table_id !== 0) {
        $.ajax({
            type: 'POST',
            url: 'calc_construct.php',
            data: 'getField=1&csrf=' + csrf + '&name=' + name_param + '&table=' + table_id+ '&tpl_num=' + tpl_num,
            success: function (data) {
                if (data) {
                    var info = JSON.parse(data);
                    select.html(info.fields);
                    select.prop('disabled', false);
                    var tpl_num = select.data('tpl-num');
                    var param_name = select.data('name');
                    var hidden = $('[name="calc_params[' + tpl_num + '][' + param_name + '][field-type]"]');
                    if (hidden.length > 0) {
                        setTypeToHidden(select, tpl_num, hidden);
                    }
                }
            }
        });
    } else {
        select.html('');
        select.prop('disabled', true);
    }
}

//Получает поля подтаблицы
function getSubField(table_id, sub_table_id, select, name_param, link_input) {
    if (table_id && sub_table_id) {
        $.ajax({
            type: 'POST',
            url: 'calc_construct.php',
            data: 'getSubField=1&csrf=' + csrf + '&sub_table=' + sub_table_id + '&name=' + name_param + '&table=' + table_id,
            success: function (data) {
                if (data) {
                    var info = JSON.parse(data);
                    select.html(info.fields);
                    select.prop('disabled', false);
                    link_input.val(info.link_field_id);
                }
            }
        });
    } else {
        select.html('');
        select.prop('disabled', true);
    }
}

//Получает список шаблонов
function get_tpl_sel_items(table, calc_id, type, selected, calc_type) {
    if (selected === undefined) {
        selected = 0;
    }
    if (window.tpl_sel_items !== undefined && calc_id === -1) {
        return window.tpl_sel_items;
    } else {
        //Запрашиваем список шаблонов
        var action = 'action=getTpls&ajax';
        window.tpl_sel_items = $.ajax({
            type: 'POST',
            url: 'edit_calc.php',
            async: false,
            data: action + '&csrf=' + csrf + '&table=' + table + '&calc_id=' + calc_id + '&type=' + type + '&selected=' + selected + '&calc_type=' + calc_type
        }).responseText;
        return window.tpl_sel_items;
    }
}

//Получает шаблон
function get_tpl(sel, calc_id, type) {
    let table_id = sel.attr("data-table_id");
    let num_tpl = sel.attr("data-tpl-num");
    let tpl_id = sel.val();
    let select_val = sel.val();

    if (calc_id === undefined) {
        calc_id = 0;
    }

    if (tpl_id > 0) {
        //Запрашиваем шаблон
        let action = 'action=getTpl&tpl_id=' + tpl_id + '&ajax';

        $.ajax({
            type: 'POST',
            url: 'edit_calc.php',
            data: action + '&csrf=' + csrf + '&table=' + table_id + '&calc_id=' + calc_id + '&type=' + type + '&num=' + num_tpl,
            success: function (data) {
                if (data) {
                    load_tpl(data, num_tpl, select_val);
                }
            }
        });
    } else {
        $("td.td_tpl[data-tpl-num='" + num_tpl + "']").remove();
    }
}

function send_ajax(url, params) {
    params.csrf = csrf;
    return JSON.parse($.ajax({
        type: 'POST',
        url: url,
        data: params,
        async: false,
    }).responseText);
}

function setTypeToHidden(obj, tpl_num, hidden) {
    var target = $(obj);
    var val = target.val();
    var option = target.find('option[value="' + val + '"]');
    if (option.length > 0 && hidden.length > 0) {
        hidden.val(option.data('type'));
    }
}

function checkVkMessage() {
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "vk_msg_check.php",
        data: {vk_check: 'get', csrf: csrf},
        success: function (msg) {
            if (msg == 'refresh') {
                checkVkMessage();
            } else if (msg == 'error') {
                alert('Error');
            } else if (msg == 'wait') {
                setTimeout(checkVkMessage, 5000);
            }
        }
    });
}
/* END AJAX запросы */

$(document).ready(function () {
    //Переключение режима
    $("input:radio[name=calc_mode]").change(function () {
        view_mode($(this).val());
    });
    $("input:radio[name=use_params]").change(function () {
        view_params($(this).val());
    });
});