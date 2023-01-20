// Функции для глобального поиска
// функция проверяет в куках открыто ли окно
function check_cookie_search()
{
    return $.cookie("event[search][view]") !== 'none';
}

// функция получает объект с таблицами, к которым есть доступ
function ajax_get_tables()
{
    var list_tables = $("#search_window_list_tables");
    list_tables.html("<img src='images/indicator.gif' alt='' />");
    $.ajax({
        type: 'POST',
        url: 'search_for_all.php',
        data: 'getTables=&csrf=' + csrf,
        success: function (data) {
            var html_tables_put;
            var tables;
            if (data !== 'no data') {
                tables = JSON.parse(data);
                html_tables_put = '';
                for (var key in tables) {
                    html_tables_put += '<li style="margin-top: 4px; cursor: pointer;"><input type="checkbox" checked data-table="' + tables[key] + '" value="' + key + '"><span style="margin-left: 5px; vertical-align: text-bottom;">' + tables[key] + '</span>'
                }
                list_tables.html(html_tables_put);
                $(function () {
                    var list_ul = $("#search_window_list_tables");
                    list_ul.sortable();
                    list_ul.disableSelection();
                });
            } else {
                list_tables.html('{$lang.no_tables}');
            }
        }
    });
}
function write_field()
{
    try {
        $.ajax({
            type: 'POST',
            url: 'search_for_all.php',
            async: false,
            data: 'history=&csrf=' + csrf,
            success: function (data) {
                try {
                    if (data !== 'no history') {
                        var search_input = $('#search_input');
                        var search_field = $('#search_window_field');
                        var request_data = JSON.parse(data);
                        var search_data = request_data['search_text'];
                        search_input.val(search_data);
                        search_field.html('');
                        search_field.append('<table class="search_list_item s_search" id="search_window_field_table" cellspacing="0"><tr><td class="s_item" style="text-align: left; font-weight: normal; padding-left: 10px;">' + lang['Search_results'] + '</td><td style="width: 32px" class="search_item_action"></td></tr></table>');
                        for (var key in request_data['lines']) {
                            var re = new RegExp(search_data, 'gi');
                            var result_match = request_data['lines'][key]['field_result'].match(re);
                            if (result_match) {
                                request_data['lines'][key]['field_result'] = request_data['lines'][key]['field_result'].replace(re, '<span class="highlight_row">' + result_match[0] + '</span>');
                            }
                            var str_text = '';
                            str_text += '<table class="search_list_item s_search" data-row="' + i + '" cellspacing="0"><tr>';
                            str_text += '<td style="width: 140px"><div class="search_results--table-name">' + request_data['lines'][key]['name_table'] + '</div></td>';
                            str_text += '<td class="s_item" style="text-align: left;"><a class="search_link" target="_blank" href="view_line2.php?table=' + request_data['lines'][key]['table_id'] + '&line=' + request_data['lines'][key]['row_id'] + '">' + request_data['lines'][key]['head_text'] + ' - ' + request_data['lines'][key]['field_info'] + ': ' + request_data['lines'][key]['field_result'] + '</a></td>';
                            str_text += '</tr></table>';
                            search_field.append(str_text);
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        });
    } catch (e) {
        console.log(e);
    }

}
// Остановить поиск
// @param start - true для запуска поиска снова
function reset_search(start, field_search = false)
{
    if (start === undefined) {
        start = false;
    }
    $.ajax({
        type: 'POST',
        url: 'search_for_all.php',
        async: false,
        data: 'reset=&csrf=' + csrf,
        success: function (data) {
            if (data === 'session reset') {
                console.log('reset success');
                if (start === true) {
                    console.log('start search');
                    start_search(field_search);
                } else {
                    stop_window();
                }
            }
        }
    });
}
function ajax_get_complete_status(table_search, isIntable, table_seach)
{
    $.ajax({
        type: 'POST',
        url: 'search_for_all.php?',
        data: 'complete=&csrf=' + csrf,
        success: function (data) {
            if (data === 'session complete') {
                var checkboxes_all = $('input[type=checkbox][data-table]');
                var search_submit_button = $('#search_submit_button');
                var stop_btn = $('#search_window_stop_btn');
                stop_btn.css('display', 'none');
                if (isIntable && table_search && $('#search_continue').css('display') == 'none') {
                    $('#search_continue').css('display', 'block');
                    $('#search_window_field').css('height', $("#search_window").height() - 124 + "px");
                } else if (!table_search) {
                    $('#search_window_field').css('height', $("#search_window").height() - 94 + "px");
                }
                progress_text(lang['Search_completed'] + " " +  lang['Lines_found'] + " " + window.search_cnt);
                progress_line(100);
                checkboxes_all.prop("disabled", false);
                search_submit_button.prop("disabled", false);
                if (table_seach == false) {
                    reset_search(true, true);
                }
            }
        }
    });
}
function all_stat()
{
    var checkboxes_all = $('input[type=checkbox][data-table]');
    if ($('#search_window_all_stat_input').prop('checked')) {
        checkboxes_all.prop("checked", true);
    } else {
        checkboxes_all.prop("checked", false);
    }

}
// Поиск по названиям таблиц и отчетов
function seach_table_or_reports(cnt, itt, send_data_table, send_data_report, limit) {
    let count = 0,
        table_seach = false,
        text,
        search_field = $('#search_window_field');
    cnt = cnt + 1;
    for (var key in send_data_table['tables']) {
        count++;
        itt++;
        progress_line((itt/cnt*100));
        progress_text(lang['Search_in_table'] + send_data_table['tables'][key]['name_table']);
        if(send_data_table['tables'][key]['name_table'].toLowerCase().indexOf(send_data_table.search_text.toLowerCase()) > -1) {
            table_seach = true;
            text = '';
            text += '<table class="search_list_item s_search" data-row="' + count + '" cellspacing="0"><tr>';
            text += '<td style="width: 140px"><div style="margin: 0px 10px; border-radius: 2px; padding: 3px; background-color: #ffaeae; color: #444;">' + send_data_table['tables'][key]['name_table'] + '</div></td>';
            text += '<td class="s_item" style="text-align: left;"><a class="search_link" target="_blank" href="fields.php?table=' + send_data_table['tables'][key]['id'] + '">Перейти в таблицу</a></td>';
            text += '</tr></table>';
            search_field.append(text);
            window.search_cnt++;
        }
        continue_search(cnt, itt, send_data_table, limit, true, table_seach, table_seach);
    }
    for (var key in send_data_report) {
        count++;
        itt++;
        progress_line((itt/cnt*100));
        progress_text(lang['Search_in_table'] + send_data_report[key]);
        if(send_data_report[key].toLowerCase().indexOf(send_data_table.search_text.toLowerCase()) > -1) {
            table_seach = true;
            text = '';
            text += '<table class="search_list_item s_search" data-row="' + count + '" cellspacing="0"><tr>';
            text += '<td style="width: 140px"><div style="margin: 0px 10px; border-radius: 2px; padding: 3px; background-color: #ffaeae; color: #444;">' + send_data_report[key] + '</div></td>';
            text += '<td class="s_item" style="text-align: left;"><a class="search_link" target="_blank" href="report.php?id=' + key + '">Перейти в отчет</a></td>';
            text += '</tr></table>';
            search_field.append(text);
            window.search_cnt++;
        }
        continue_search(cnt, itt, send_data_table, limit, true, table_seach, table_seach);
    }
    return table_seach;
}

// Поиск по полям таблицы
// @param cnt - количество таблиц
// @param itt - с какой таблицы начинать
// @param send_data - массив c таблицами и параметрами
// @param limit - лимит записей из одной таблицы
function ajax_get_data_search(cnt, itt, send_data, limit, field_search = false)
{
    var search_field = $('#search_window_field');
    var search_data = {};
    search_data.uuid = send_data['uuid'];
    search_data.text = send_data['search_text'];
    search_data.limit = limit;
    search_data.table_info = send_data['tables'][itt];
    progress_text(lang['Search_in_table'] + send_data['tables'][itt]['name_table']);
    $.ajax({
        type: 'POST',
        url: 'search_for_all.php?table_info=' + send_data['tables'][itt]['id'] + '&uuid=&csrf=' + csrf,
        data: JSON.stringify(search_data),
        success: function (data) {
            if (!window.stop_search) {
                progress_line((itt/cnt*100));
                if (data === 'invalid uuid') {
                    if (window.search_cnt > 0) {
                        stop_window();
                    } else {
                        clear_window_search(true);
                    }
                } else if (data === 'no fields for search') {
                    continue_search(cnt, itt, send_data, limit);
                } else if (data === 'no result') {
                    continue_search(cnt, itt, send_data, limit);
                } else if (data !== 'No data') {
                    try {
                        request_data = JSON.parse(data);
                        var i = window.search_cnt;
                        for (var key in request_data) {
                            i++;
                            var re = new RegExp(search_data.text,'gi');
                            var result_match = request_data[key]['field_result'].match(re);

                            if (result_match) {
                                request_data[key]['field_result'] = request_data[key]['field_result'].replace(re, '<span class="highlight_row">' + result_match[0] + '</span>');
                            }
                            request_data[key]['field_result'] = request_data[key]['field_result'].replace(/amp;#039;/g,"&apos;");
                            request_data[key]['field_result'] = request_data[key]['field_result'].replace(/amp;quot;/g,'&quot;');
                            var str_text = '';
                            str_text += '<table class="search_list_item s_search" data-row="' + i + '" cellspacing="0"><tr>';
                            str_text += '<td style="width: 140px"><div style="margin: 0px 10px; border-radius: 2px; padding: 3px; background-color: #ffaeae; color: #444;">' + request_data[key]['name_table'] + '</div></td>';
                            str_text += '<td class="s_item" style="text-align: left;"><a class="search_link" target="_blank" href="view_line2.php?table=' + request_data[key]['table_id'] + '&line=' + request_data[key]['row_id'] + '">' + request_data[key]['head_text'] + ' - ' + request_data[key]['field_info'] + ': ' + request_data[key]['field_result'] + '</a></td>';
                            str_text += '</tr></table>';
                            search_field.append(str_text);
                        }
                        window.search_cnt += request_data.length;
                        continue_search(cnt, itt, send_data, limit);
                    } catch(e) {
                        console.log(e);
                        continue_search(cnt, itt, send_data, limit);
                    }
                } else {
                    continue_search(cnt, itt, send_data, limit);
                }
            }
        }
    });
}
// table_search - ищем в данный момент в таблицах и отчетах или в полях
// isIntable - нашло ли в таблицах или отчетах, чтобы потом в ajax_get_complete_status() не показывать кнопку
function continue_search(cnt, itt, send_data, limit, table_search = false, isIntable = true, table_seach) {
    itt++;
    if(itt >= cnt) {
        ajax_get_complete_status(table_search, isIntable, table_seach);
    } else {
        // рекурсивный ajax запрос необходим, чтобы не подвисала страница при поиске
        if (!table_search) {
            ajax_get_data_search(cnt, itt, send_data, limit);
        }
    }
}

function clear_window_search(error) {
    if (error === undefined) {
        error = false;
    }
    var search_field = $('#search_window_field');
    var search_submit_button = $('#search_submit_button');
    var checkboxes_all = $('input[type=checkbox][data-table]');
    var stop_btn = $('#search_window_stop_btn');
    $.cookie('global_search_lines', null);
    checkboxes_all.prop("disabled", false);
    search_submit_button.prop("disabled", false);
    search_field.html('');
    stop_btn.css('display', 'none');
    if (error) {
        // search_field.html('Invalid uuid');
    }
}
function progress_text(text)
{
    var bar_text = $('#search_window_progress_text');
    bar_text.html(text);
}
function progress_line(line)
{
    var bar_line = $('#search_window_progress_bar_line');
    bar_line.css('width', line + '%');
    if (line === 100) {
        bar_line.removeClass('active progress-bar-striped');
    } else {
        bar_line.addClass('active progress-bar-striped');
    }
}
function stop_window () {
    window.stop_search = true;
    var search_submit_button = $('#search_submit_button');
    var checkboxes_all = $('input[type=checkbox][data-table]');
    var stop_btn = $('#search_window_stop_btn');
    var bar_line = $('#search_window_progress_bar_line');
    checkboxes_all.prop("disabled", false);
    search_submit_button.prop("disabled", false);
    stop_btn.css('display', 'none');
    bar_line.removeClass('active progress-bar-striped');
    progress_text(lang['Search_stopped'] + " " +  lang['Lines_found'] + " " + window.search_cnt);
}
// главная функция по поиску
function start_search(field_search)
{
    delete window.stop_search;
    var search_input = $('#search_input');
    var search_submit_button = $('#search_submit_button');
    var search_continue_block = $('#search_continue');
    var search_field = $('#search_window_field');
    var search_stop_btn = $('#search_window_stop_btn');
    var search_progress_bar = $('#search_window_progress_bar');
    var checkboxes = $('input[type=checkbox][data-table]:checked');
    var checkboxes_all = $('input[type=checkbox][data-table]');
    var limit = 20; // добавить поле для ввода
    search_continue_block.css('display','none');
    if (!field_search) {
        clear_window_search();
    }
    if ($.trim(search_input.val()) !== '') {
        if (checkboxes.length > 0) {
            checkboxes_all.prop("disabled", true);
            search_submit_button.prop("disabled", true);
            var send_data = {};
            var itt = 0;
            send_data.tables = {};
            send_data.getReports = true;
            send_data.search_text = search_input.val();
            checkboxes.each(function () {
                var x = this.value;
                if (x > 0) {
                    send_data['tables'][itt] = x;
                    itt++;
                }
            });
            //Запрос для получения полей, uuid, передаем выбранные таблицы
            $.ajax({
                url: 'search_for_all.php?tables=&search_text=&csrf=' + csrf,
                type: 'POST',
                async: false,
                data: JSON.stringify(send_data),
                success: function (data) {
                    let table = data;
                    $.ajax({
                        url: 'search_for_all.php?csrf=' + csrf,
                        type: 'POST',
                        async: false,
                        data: send_data,
                        success: function (report) {
                            if (table === 'invalid uuid') {
                                search_field.html('<h2>' + lang['Start_search_again'] + '</h2><input type="button" onclick="clear_window_search();reset_search(true);" value="' + lang['Yes'] + '"><input type="button" value="' + lang['No'] + '" onclick="clear_window_search()">');
                            } else if (table !== 'No data') {
                                try {
                                    request_data_table = JSON.parse(table);
                                    request_data_report = JSON.parse(report);
                                    var $count_t = 1;
                                    for (var key in request_data_table['tables']) {
                                        $count_t++;
                                    }
                                    $count_t_r = $count_t;
                                    for (var key in request_data_report) {
                                        $count_t_r++;
                                    }
                                    search_stop_btn.css('display', 'block');
                                    search_progress_bar.css('display', 'block');
                                    if (!field_search) {
                                        search_field.append('<table class="search_list_item s_search" id="search_window_field_table" cellspacing="0"><tr><td class="s_item" style="text-align: left; font-weight: normal; padding-left: 10px;">' + lang['Search_results'] + '</td><td style="width: 32px" class="search_item_action"></td></tr></table>');
                                        window.search_cnt = 0;
                                    }
                                    if (field_search) {
                                        ajax_get_data_search($count_t, 1, request_data_table, limit, field_search);
                                    } else {
                                        seach_table_or_reports($count_t_r, 1, request_data_table, request_data_report, limit);
                                    }                       
                                } catch(e) {
                                    console.log('invalid json');
                                }
                            }
                        }
                    });
                }
            });
        } else {
            search_field.html('<div class="global_search_error_text">' + lang['no_table_is_selected'] + '</div>');
        }
    } else {
        search_field.html('<div class="global_search_error_text">' + lang['Enter_search_text'] + '</div>');
    }
}
function tables_list_show()
{
    var list = $('#search_window_table_list');
    if (list.is(':visible') === true) {
        list.css('display', 'none');
    } else {
        list.css('display', 'block');
    }
}
$( document ).ready(function() {
    $('#ext_search_open_vert').click(function() {
        tables_list_show();
    });
});
$(window).on('unload', function(){
    reset_search();
});
