(function () {
    /**
     * Максимальное кол-во строк в подтаблице
     * @type {number}
     * @constant
     */
    var ROWS_PAGINATION = 10;
    /**
     * Доп. отступ для футера при пагинации
     * @type {number}
     * @constant
     */
    var SCROLL_PAGINATION_MARGIN = 50;
    /**
     * Таймаут для рендеринга строк
     * @type {number}
     * @constatnt
     */
    var RENDER_ROWS_TIMEOUT = 100;
    var timeout = 0;

    var dataDefault = [];
    /**
     * Конструктор, для формирования динамических подтаблиц
     * @param adv_data Доп данные для формирование подтаблиц
     * @constructor
     */
    var Subtable = function (adv_data) {
        if (typeof adv_data === 'undefined') {
            adv_data = {};
        }
        this.loaded_subtables = {};
        this.adv_data = adv_data;
        this.subtable_id;
        this.sel_subtable;
        this.on_subtable_pagination_scroll_bind = this.on_subtable_pagination_scroll.bind(this);
    };

    /**
     * Инициализация скролла для пагинации строк
     */
    Subtable.prototype.init_pagination_scroll = function () {
        document.addEventListener('scroll', this.on_subtable_pagination_scroll_bind);
    };

    /**
     * Деинициализация скролла для пагинации строк
     */
    Subtable.prototype.remove_pagination_scroll = function () {
        document.removeEventListener('scroll', this.on_subtable_pagination_scroll_bind);
    };

    /**
     * Скролл, проверка на формировании пагинации
     */
    Subtable.prototype.on_subtable_pagination_scroll = function () {
        var footer = $('#footback_div_id');

        if (footer.length > 0) {
            if ((footer.offset().top - SCROLL_PAGINATION_MARGIN) < $(document).scrollTop() + $(window).height()) {
                this.get_subtable_data(this.subtable_id);
            }
        }
    };



    /**
     * Сеттер, для subtable_id
     * @param id {string|number}
     */
    Subtable.prototype.set_subtableId = function (id) {
        this.subtable_id = parseInt(id);
        if (!this.sel_subtable) {
            this.sel_subtable = this.subtable_id;
        }
    };

    /**
     * Метод, проверяющий нужно ли грузить данные о подтаблице, и если да, то так же проверяет
     * сколько пагинаций было отображено, и при скролле отображает их
     * @param subtable_id {string|number}
     */
    Subtable.prototype.get_subtable_data = function (subtable_id, page_number='') {
        this.set_subtableId(subtable_id);
        var loaded = Object.keys(this.loaded_subtables).some(function (value) {
            return parseInt(value) === parseInt(subtable_id) && this.loaded_subtables[value]['loaded_rows'] >= this.loaded_subtables[value]['pagination_count'];
        }.bind(this));

        if (!loaded) {
            _restate_head_btns(true);
            var preloader = $('.subtable>.preloader__block');
            if (preloader.hasClass('hidden')) {
                preloader.removeClass('hidden');
            }

            if ($('#sub_' + subtable_id).length === 0) {
                var sub_page;
                if(page_number===''){
                    sub_page = (typeof getUrlVars()['subtable_page'] !== 'undefined') ? '&subtable_page=' + getUrlVars()['subtable_page'] : '';
                }else{
                    sub_page = '&subtable_page=' + page_number;
                }

                $.ajax({
                    url: 'view_line2.php?table=' + table_id + '&get_subtable_data=' + subtable_id + '&csrf=' + csrf + '&line=' + line_id + sub_page + '&sel_subtable=' + this.sel_subtable,
                    success: function (xhr) {
                        if (xhr && xhr !== 'null') {
                            /*
                             Вырезаем теги и вычисления
                             */
                            xhr = xhr.substr(xhr.indexOf(csrf) + csrf.length);

                            var subtable = JSON.parse(xhr);
                            if (subtable['table_id']) {
                                /** subtable_color_formats - глобальная переменная */
                                subtable_color_formats[subtable['table_id']] = new ColorFormat(1, subtable['table_id']);
                            }
                            /**
                             * Массив для сортировки объекта `all_values`
                             * @type {Array}
                             */
                            var sorted_arr_by_cell = [];
                            for (var field in subtable['show_fields']) {
                                sorted_arr_by_cell.push(subtable['show_fields'][field]);
                                dataDefault.push({ "id": field, "data-default": subtable['show_fields'][field]['default_value'], "type_field": subtable['show_fields'][field]['type_field'] })
                            }

                            sorted_arr_by_cell.sort(_sort_by_cell);
                            cur_subtable = subtable; /** cur_subtable - Глобальная переменная **/
                            var rows = Object.keys(cur_subtable['all_values']);
                            var keys_count = rows.length;
                            var pagination_count = Math.ceil(keys_count / ROWS_PAGINATION);

                            var rows_arr = [];
                            var rows_id = [];
                            if (rows.length === 0) {
                                this.loaded_subtables[subtable_id] = {
                                    rows_id: rows_id,
                                    pagination_count: pagination_count,
                                    sorted_by_cell: sorted_arr_by_cell,
                                    loaded_rows: pagination_count
                                };
                            } else {
                                rows.forEach(function (id, i) {
                                    rows_arr.push(id);
                                    if (((i + 1) % ROWS_PAGINATION === 0 || (i + 1) === rows.length) && i !== 0 || rows.length === 1) {
                                        rows_id.push(rows_arr);
                                        rows_arr = [];
                                    }
                                });

                                this.loaded_subtables[subtable_id] = {
                                    rows_id: rows_id,
                                    pagination_count: pagination_count,
                                    sorted_by_cell: sorted_arr_by_cell
                                };
                            }

                            all_subtables[subtable_id] = cur_subtable; // all_subtables - Глобальная переменная

                            replace_href_on_settings(subtable_id);

                            sub_groups_fields_defs[subtable_id] = JSON.parse(cur_subtable['groups_fields_defs']);
                            this._create_subtable(subtable_id, cur_subtable, false, this.adv_data);
                            xPlayer.init('cb_player', '');
                        } else {
                            var preloader = $('.subtable>.preloader__block');
                            preloader.addClass('hidden');
                            _restate_head_btns(false);
                        }
                    }.bind(this),
                    error: function () {
                        console.log(lang['backup_connect_error']);
                    }
                });
            } else {
                preloader.find($('.preloader')).addClass('preloader--by-subtable-scroll');
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    var prev_position = $(document).scrollTop();
                    this._create_subtable(subtable_id, all_subtables[subtable_id], true, this.adv_data);
                    preloader.find($('.preloader')).removeClass('preloader--by-subtable-scroll');
                    $(document).scrollTop(prev_position);
                }.bind(this), RENDER_ROWS_TIMEOUT);
            }
        }
    };

    $(function () {
        getDataDefault(dataDefault)
    });

    /**
     * Метод, для блокировки или разблокировки кнопок в шапке подтаблицы
     * @param {boolean} disable Если true, то блокировать
     * @private
     */
    function _restate_head_btns(disable) {
        var head_btns = $('.subtable__tab-list button');

        if (head_btns.length > 0) {
            head_btns.attr('disabled', disable);
        }
    }

    /**
     * Метод, отображающий подвал подтаблицы
     * @param subtable_id {string|number}
     * @param cur_subtable {Object}
     * @param adv_data {Object}
     * @private
     */
    function _create_subtable_footer(subtable_id, cur_subtable, adv_data) {
        var subtable_footer = $('<div class="sub_add_new_line subtable__footer">');
        subtable_footer.attr('id', 'subtable-footer' + subtable_id);
        var simple_wrapper = $('<div class="subtable_pages-wrapper">')
        var subtable_pages = $('<div class="subtable_pages">');
        for (var one_page in cur_subtable['pages']) {
            var one_page_val = cur_subtable['pages'][one_page];

            if (one_page_val == cur_subtable['cur_page'] || one_page_val === '...') {
                var page = $('<span>');
                if (one_page_val === '...') {
                    page.css({
                        'background': 'transparent',
                        'color': '#000',
                        'margin': '0 -10px'
                    });
                }
                page.text(one_page_val);
                subtable_pages.append(page);
            } else {
                var page = $('<a>');
                page.attr('href', 'view_line2.php?table=' + table_id + rel_table_link + rel_line_link + rel_field_link + filter_link + page_link + archive_link + deleted_link + '&line=' + subtbl_main_line + '&subtable_page=' + one_page_val + '&sel_subtable=' + cur_subtable['id'] + '#view_subtables');
                page.text(one_page_val);
                page.click(function(){
                    $('#sub_'+cur_subtable['id']).remove();
                    $('#subtable-footer'+cur_subtable['id']).remove();
                    create_subtable.loaded_subtables[cur_subtable['id']]['loaded_rows']='';
                    switch_subtable(cur_subtable['id'],this.textContent);
                    return false;
                });
                subtable_pages.append(page);
            }
        }
        simple_wrapper.append(subtable_pages);
        subtable_footer.append(simple_wrapper);

        if (parseInt(cur_subtable['group_field']) === 0) {
            var btns = _createFooterBtns(false, false, adv_data, {
                'cur_subtable': cur_subtable
            });

            if (btns) {
                var btns_wrap = $('<div class="subtable__footer-btns-wrap">');
                btns_wrap.append(btns['save']);
                if (cur_subtable['add'] == 1) {
                    btns_wrap.append(btns['add']);
                }
                subtable_footer.append(btns_wrap);
            }
        } else {
            // Если есть группировка по какому-либо полю, то в footer не добавляется кнопка "Добавить запись",
            // поэтому отступ у строки с количеством страниц не нужен
            subtable_pages.css('margin-left', 0);
            simple_wrapper.append(subtable_pages);
        }


        var subtable = $('.subtable');
        if (subtable.length > 0) {
            subtable.append(subtable_footer);
        }
    }

    /**
     * Сортировка по столбцам
     * @param cell_1 {Object}
     * @param cell_2 {Object}
     * @returns {number}
     * @private
     */
    function _sort_by_cell(cell_1, cell_2) {
        return parseInt(cell_1['field_num']) - parseInt(cell_2['field_num']);
    }

    /**
     * Метод, отображающий подтаблицу по переданным данным
     * @param subtable_id {string|number}
     * @param cur_subtable {Object}
     * @param started {boolean} Если true, то все элементы подтаблицы уже были отрисованы, и осталось
     * отрисовать последующие строки при пагинации
     * @param adv_data {Object} Доп. данные
     * @private
     */
    Subtable.prototype._create_subtable = function (subtable_id, cur_subtable, started, adv_data) {
        /*
        Цвет для событий наведения на подтаблицу берем из шапки(color3 в scheme)
         */
        var confTableColor3 = $('#submenu').css('background-color')
        var prevColor = ''

        var subtable = $('.subtable');
        var subtable_wrap;
        var subtable_table_wrap;
        var subtable_table;
        if (!started) {
            subtable_wrap = $('<div class="subtable__wrap">');
            subtable_wrap.attr('id', 'sub_' + subtable_id);

            subtable_table_wrap = $('<div class="subtable__table-wrap">');

            subtable_table = $('<table cellpadding="0" cellspacing="0" class="subtable__table">');
            subtable_table.attr('id', 'subtable_' + subtable_id);

            var subtable_row_header = $('<tr class="subtable__row subtable__row--header">');

            var subtable_cell_first = $('<th class="subtable__cell subtable__cell--first-column">');

            if (cur_subtable['add'] === 1
                && (parseInt(cur_subtable['group_field']) === 0 || (parseInt(cur_subtable['group_field']) !== 0 && cur_subtable['all_values'].length === 0))) {
                var subtable_add_new_line_top = $('<span class="subtable__add-new-line-top subtable__add-floated">');
                subtable_add_new_line_top.on('click', function () {
                    sub_add_new_line(-1, true);
                    count_the_number_of_subtable_entries(cur_subtable_id);
                });

                subtable_cell_first.append(subtable_add_new_line_top);
            }

            subtable_row_header.append(subtable_cell_first);


            // Формирование шапки таблица
            this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field_key, idx) {
                var one_field_val = cur_subtable['show_fields'][one_field_key['id']]; // Получаем значение ключа
                if (one_field_val['hidden_tbl'] === 0 && !(one_field_val['group_field'] !== 0 && !one_field_val['col_allow_write'])) {
                    var subtable_cell = $('<th class="subtable__cell">');
                    if (idx === 0) {
                        subtable_cell.addClass('subtable__cell--first-column');
                    }

                    var cell_wrap_table = $('<table border=0 cellpadding=0 cellspacing=0>');

                    var cell_wrap_tr = $('<tr>');
                    var cell_wrap_td = $('<td>');
                    var subtable_cell_title = $('<span>');

                    const fieldType = parseInt(one_field_val['type_field']);
                    const fieldWidth = parseInt(one_field_val['width']);
                    const minWidth = fieldType == 1 ? num_field_min_width : (fieldType == 3 ? other_field_min_width : other_field_min_width);

                    if (one_field_val['isset_calc'] === 1 && parseInt(cur_subtable['auto_entered_field']) === 1) {
                        subtable_cell_title.addClass('subtable__title-cell');
                        subtable_cell_title.attr('title', lang['auto_entered_field']);
                    }

                    if (fieldType === 1) {
                        cell_wrap_table.attr('align', 'right');
                        subtable_cell_title.css('text-align', 'right');
                        subtable_cell.addClass('subtable__cell-number');

                        if(fieldWidth !== 0){
                            subtable_cell.css({
                                'width': fieldWidth > num_field_max_width ? num_field_max_width : (fieldWidth < minWidth ? minWidth : fieldWidth + 'px'),
                                'min-width': minWidth + 'px',
                            });
                        }
                    }
                    else if (fieldWidth !== 0) {
                        const minWidth = fieldType == 1 ? 32 : (fieldType == 3 ? other_field_min_width : other_field_min_width);
                        const fixWidth = fieldWidth > other_field_max_width ? other_field_max_width : (fieldWidth < minWidth ? minWidth : fieldWidth);

                        subtable_cell.css({
                            'width': fixWidth + 'px',
                            'min-width': fixWidth + 'px',
                            /*'max-width': fixWidth + 'px',*/
                        });
                        subtable_cell_title.css('width', one_field_val['width'] + 'px');
                    } else {
                        subtable_cell.css({ 'min-width': minWidth });
                    }
                    //Решено пока убрать телефон из загаловка подтаблицы
                    /*if (adv_data['asterisk_login'] && parseInt(one_field_val['phone_type']) !== 0) {
                        var phone_img = $('<img>');
                        phone_img.attr({
                            'src': 'images/phone_icon1.png',
                            'title': 'Поле телефона IP-телефонии'
                        });
                        phone_img.css({
                            'width': '12px',
                            'padding-bottom': '2px'
                        });

                        subtable_cell_title.append(phone_img);
                    }*/

                    if (parseInt(one_field_val['main']) === 1) {
                        const requiredStar = $('<span class="subtable__required-field--star" title="' + lang.required_field + '">*</span>');
                        subtable_cell_title.prepend(requiredStar);
                    }
                    subtable_cell_title.html(subtable_cell_title.html() + one_field_val['reduce_name_field']);

                    //subtable_cell_title.html(subtable_cell_title.html() + one_field_val['name_field']);


                    var subtable_cell_spacer = $('<td align="left" class="textpad subtable__cell--spacer">');

                    cell_wrap_td.append(subtable_cell_title);
                    cell_wrap_tr.append(cell_wrap_td);
                    cell_wrap_tr.append(subtable_cell_spacer);
                    cell_wrap_table.append(cell_wrap_tr);
                    subtable_cell.append(cell_wrap_table);
                    subtable_row_header.append(subtable_cell);
                }
            });

            subtable_table.append(subtable_row_header);
        } else {
            subtable_wrap = $('#sub_' + subtable_id);

            if (subtable_wrap.length > 0) {
                subtable_table_wrap = subtable_wrap.find($('.subtable__table-wrap'));
                subtable_table = subtable_table_wrap.find($('.subtable__table'));
            }
        }

        var index = (this.loaded_subtables[subtable_id] && this.loaded_subtables[subtable_id]['loaded_rows']) ? this.loaded_subtables[subtable_id]['loaded_rows'] : 0;

        if (this.loaded_subtables[subtable_id]['rows_id'][index]) {
            var subtable_row_group;
            this.loaded_subtables[subtable_id]['rows_id'][index].forEach(function (one_line) {
                var subtable_row_simple = $('<tr class="subtable__row subtable__row--simple subtable__row--format-not-init">');
                subtable_row_simple.attr('id', 'subtable_' + cur_subtable['id'] + '_line_' + cur_subtable['all_values'][one_line][0]['line_id']);

                /*
                События наведения курсора строки подтаблицы
                 */
                subtable_row_simple.on('mouseover', function () {
                    $(this).children().each((i, td) => {
                        var currentTd = $(td)
                        currentTd.attr('prevColor', currentTd.css("background-color"))
                        currentTd.css("background-color", confTableColor3)
                    })
                });
                subtable_row_simple.on('mouseout', function () {
                    $(this).children().each((i, td) => {
                        var currentTd = $(td)
                        currentTd.css("background-color", currentTd.attr('prevColor'))
                    })
                });

                var one_value_first = cur_subtable['all_values'][one_line][0];

                if (one_value_first['group_field_text'] !== '') {
                    /** Проверяем, существует ли группировка определенного типа, если да, то добавляем "суммы", "сред. арифм." и кнопки "сохранить" и "добавить" **/
                    if ((typeof subtable_row_group !== 'undefined' && subtable_row_group.attr('id') === 'subtable_' + subtable_id + '_top_group' + (one_value_first['group_field_pp'] - 1)) ||
                        ($('#subtable_' + subtable_id + '_top_group' + (one_value_first['group_field_pp'] - 1)).length > 0)) {
                        var subtable_row = $('<tr class="subtable__row">');
                        subtable_row.attr('id', 'subtable_' + cur_subtable['id'] + '_top_group' + (one_value_first['group_field_pp'] - 1));
                        var subtable_cell = $('<td class="subtable__cell subtable__cell--group">');
                        subtable_cell.attr({
                            'colspan': cur_subtable['display_fields_count']
                        });

                        if (typeof one_value_first['line_pp'] !== 'undefined') {
                            var subtable_row = $('<tr class="subtable__row">');
                            subtable_row.attr('id', 'subtable_' + cur_subtable['id'] + '_sum_' + (one_value_first['group_field_pp'] - 1));

                            var subtable_cell_sum_first = $('<td class="subtable__cell subtable__cell--sum">');

                            subtable_row.append(subtable_cell_sum_first);

                            this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field) {
                                var one_field_val = cur_subtable['show_fields'][one_field['id']]; // Получаем значение ключа
                                if (one_field_val['hidden_tbl'] === 0 && !(one_field_val['group_field'] !== 0 && !one_field_val['col_allow_write'])) {
                                    var subtable_cell_sum = $('<td class="subtable__cell subtable__cell--sum">');

                                    if (one_field_val['summa'] === 1 || one_field_val['average'] === 1) {
                                        if (one_field_val['totals']) {
                                            for (var one_total in one_field_val['totals']) {
                                                var one_total_val = one_field_val['totals'][one_total];

                                                if ((one_value_first['group_field_pp'] - 1) === parseInt(one_total)) {
                                                    var subtable_cell_sum_gray = $('<div>');
                                                    subtable_cell_sum_gray.attr({
                                                        'class': 'subtable__sum-gray sub_totalgr' + one_field_val['id'] + '_' + one_total,
                                                        'id': 'sub_totalgr' + one_field_val['id'] + '_' + one_total + '_' + cur_subtable['id'],
                                                        'title': lang['total_of_group']
                                                    });
                                                    subtable_cell_sum_gray.html(one_total_val);

                                                    subtable_cell_sum.append(subtable_cell_sum_gray);
                                                    break;
                                                }
                                            }
                                        } else {
                                            var subtable_cell_sum_gray = $('<div class="subtable__sum-gray">');

                                            subtable_cell_sum.append(subtable_cell_sum_gray);
                                        }

                                        if (one_field_val['averages']) {
                                            for (var one_average in one_field_val['averages']) {
                                                var one_average_val = one_field_val['averages'][one_average];

                                                if ((one_value_first['group_field_pp'] - 1) === parseInt(one_average)) {
                                                    var subtable_cell_average = $('<div>');
                                                    subtable_cell_average.attr({
                                                        'class': 'subtable__sum-gray sub_averagegr' + one_field_val['id'] + '_' + one_average,
                                                        'id': 'sub_averagegr' + one_field_val['id'] + '_' + one_average + '_' + cur_subtable['id'],
                                                        'title': lang['average_of_group']
                                                    });
                                                    subtable_cell_average.html(one_average_val);

                                                    subtable_cell_sum.append(subtable_cell_average);
                                                    break;
                                                }
                                            }
                                        } else {
                                            var subtable_cell_average = $('<div class="subtable__sum-gray">');

                                            subtable_cell_sum.append(subtable_cell_average);
                                        }
                                    }

                                    subtable_row.append(subtable_cell_sum);
                                }
                            });
                            subtable_table.append(subtable_row);
                        }

                        if (cur_subtable['add'] === 1 && typeof one_value_first['line_pp'] !== 'undefined') {
                            _createGroupBtns(subtable_table, false, adv_data, {
                                'one_value_val': one_value_first,
                                'cur_subtable': cur_subtable
                            });
                        }
                    }

                    subtable_row_group = $('<tr class="subtable__row">');
                    subtable_row_group.attr('id', 'subtable_' + cur_subtable['id'] + '_top_group' + one_value_first['group_field_pp']);
                    var subtable_cell = $('<td class="subtable__cell subtable__cell--group">');
                    subtable_cell.attr('colspan', cur_subtable['display_fields_count']);

                    if (cur_subtable['add'] === 1) {
                        var add_line_top = $('<span class="subtable__add-new-line-top">');
                        add_line_top.on('click', function () {
                            sub_add_new_line(one_value_first['group_field_pp'], true);
                        });
                        subtable_cell.append(add_line_top);
                    }

                    var subtable_group_title = $('<span class="subtable__group-fields-text">');
                    subtable_group_title.html(one_value_first['group_field_text']);

                    subtable_cell.append(subtable_group_title);
                    subtable_row_group.append(subtable_cell);
                    subtable_table.append(subtable_row_group);
                }
                var subtable_cell_tool = _createToolBtns(false, {
                    'cur_subtable': cur_subtable,
                    'one_value_val': one_value_first,
                    'adv_data': adv_data
                });
                subtable_row_simple.append(subtable_cell_tool);

                /** Формирование обычной строки **/
                this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field_key) {
                    var one_value_val = cur_subtable['all_values'][one_line][one_field_key['id']]; // Получаем значение ключа

                    if (one_value_val) {
                        if (one_value_val['field_id'] !== 0 && one_value_val['hidden_tbl'] === 0 && !(one_value_val['group_field'] !== 0 && !one_value_val['col_allow_write'])) {
                            var subtable_cell = $('<td class="subtable__cell">')
                                .attr('id', 'subtable_' + cur_subtable['id'] + '_' + cur_subtable['all_values'][one_line][0]['line_id'] + '_' + one_value_val['field_id']);
                            if (parseInt(one_value_val['type_field']) === 2
                                || parseInt(one_value_val['type_field']) === 12
                                || parseInt(one_value_val['type_field']) === 5) {
                                subtable_cell.addClass('nowrap');
                            }

                            // Если число - добавляем класс на ограничение max-width
                            if (parseInt(one_value_val['type_field']) === 1) {
                                    subtable_cell.addClass('number__max_width');
                            }

                            //Решено пока убрать возможность звонков из подтаблицы
                            /*if (adv_data['asterisk_login'] && parseInt(cur_subtable['show_fields'][one_field_key['id']]['phone_type']) !== 0) {
                                var phone = $('<div class="subtable__phone-wrap" id="phone_' + one_value_val['line_id'] + '">');
                                var phone_link = $('<a href="#" class="phone_type">');
                                var phone_img = $('<img class="subtable__phone-icon">');
                                var call_dialog_link = '';
                                var phone_val = '';
                                if ( one_value_val['mob_value'] ) {
                                    phone_val = one_value_val['mob_value']
                                }

                                if (adv_data['asterisk_login']) {
                                    call_dialog_link += 'asterisk';
                                    if (adv_data['browser_caller']) {
                                        call_dialog_link += '_window';
                                    }
                                }

                                phone_img.on('click', function (e) {
                                    e.stopPropagation();
                                    call_dialog(call_dialog_link, phone_val, cur_subtable['table_id'], one_line, adv_data['arr_sips']);
                                });
                                phone_img.attr({
                                    'title': 'Позвонить',
                                    'src': 'images/phone_icon1.png'
                                });

                                phone_link.append(phone_img);
                                phone.append(phone_link);
                                subtable_cell.append(phone);
                            }*/

                            var textpad = $('<div class="textpad">');
                            var textpad_style = '';

                            if (one_value_val['prefix'] !== '' || one_value_val['postfix'] !== '') {
                                textpad_style += 'display: flex; align-items: center;';
                                textpad.attr('with-prefix', true);
                            }
                            if (adv_data['asterisk_login'] && parseInt(cur_subtable['show_fields'][one_field_key['id']]['phone_type']) !== 0) {
                                textpad_style += 'margin-left: 16px;';
                            }
                            if (parseInt(one_value_val['type_field']) === 2
                                || parseInt(one_value_val['type_field']) === 12
                                || parseInt(one_value_val['type_field']) === 1) {
                                textpad.addClass('nowrap');
                            } else if (parseInt(one_value_val['type_field']) === 3 && !one_value_val['view_html']) {
                                textpad.addClass('prewrap');
                            } else {
                                textpad_style += 'word-wrap: break-word; padding-right: 15px;';
                            }
                            if (parseInt(one_value_val['type_field']) === 1) {
                                textpad_style += 'display:flex; justify-content:flex-end; float:right; width:100%;';
                            }
                            if (parseInt(one_value_val['width']) !== 0) {
                                textpad_style += 'overflow: hidden;padding-right:0;';
                            } else {
                                if(parseInt(one_value_val['type_field']) === 3){
                                    textpad_style+='width:250px';
                                }
                                else{
                                    textpad.attr('default-width', true);
                                    textpad.addClass('default-width');
                                }
                            }
                            if ((parseInt(one_value_val['type_field']) === 2 || parseInt(one_value_val['type_field']) === 12) && parseInt(one_value_val['display_time']) === 1) {
                                textpad.addClass('datetime_textpad');
                            }
                            textpad.attr({
                                'style': textpad_style,
                                'id': 'sub_cell_' + one_value_val['field_id'] + '_' + one_value_val['line_id'] + '_' + cur_subtable['id']
                            });

                            if (one_value_val['prefix'] !== '') {
                                let subtable_prefix = $('<span class="subtable__prefix">');
                                let prefixCss = {
                                    'display': 'flex',
                                    'align-items': 'flex-start',
                                    'flex-direction': 'column',
                                }

                                subtable_prefix.css('margin-left', '3px');
                                subtable_prefix.text(one_value_val['prefix']);

                                textpad.css(prefixCss);
                                textpad.append(subtable_prefix);
                            }
                            var textpad_val = $('<span class="textpad__value">');
                            if (parseInt(one_value_val['type_field']) === 3 || !one_value_val['view_html']) {
                                textpad_val.addClass('textpad__value--text');
                                if (parseInt(one_value_val['type_field']) === 3) textpad_val.addClass('textpad__value--long-text-field');
                            }

                            if (one_value_val['field_id'] == cur_subtable['table_fields'][one_field_key['id']]['id']) {
                                const accRights = cur_subtable['table_fields'][one_field_key['id']]['view_edit'];
                                const allowWrite = one_value_val['allow_write'];

                                //если у поля нет прав на редактирование
                                if ((!accRights && !allowWrite) || allowWrite == 0) {
                                    switch (one_value_val['type_field']) {
                                        //изображение
                                        case "9":
                                            textpad_val.html("<span class='subtable_fields--not_edit subtable_fields-image--not_edit'>" + one_value_val['value'] + "</span>");
                                            break;
                                        //файл
                                        case "6":
                                            textpad_val.html("<span class='subtable_fields--not_edit subtable_fields-file--not_edit'>" + one_value_val['value'] + "</span>");
                                            break;
                                        //гиперссылка
                                        case "3":
                                            if (cur_subtable['table_fields'][one_field_key['id']]['hyperlink'] == 1) {
                                                if (/@/.test(one_value_val['mob_value'])) {
                                                    one_value_val['fast_edit_div'] = '<a href="mailto:' + one_value_val['mob_value'] + '">'
                                                } else {
                                                    one_value_val['fast_edit_div'] = '<a href="' + one_value_val['mob_value'] + '" target="_blank">'
                                                }
                                                one_value_val['fast_edit_div_close'] = '</a>'
                                                textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['mob_value'] + one_value_val['fast_edit_div_close']);
                                            }
                                            else {
                                                if (one_value_val['allow_write'] == 0) {
                                                    textpad_val.html("<span class='subtable_fields--not_edit_field'>" + one_value_val['mob_value'] + "</span>");
                                                } else {
                                                    textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['value'] + one_value_val['fast_edit_div_close']);
                                                }
                                            }
                                            break;
                                        //остальные поля
                                        default:
                                            if (one_value_val['mob_value'] == null) {
                                                one_value_val['mob_value'] = "";
                                            }
                                            if (one_value_val['allow_write'] == 0) {
                                                if (one_value_val['type_field'] == 1) {
                                                    textpad_val.html("<span class='subtable_fields--not_edit_field-num'>" + one_value_val['mob_value'] + "</span>");
                                                } else {
                                                    let multi_type_4;
                                                    if (one_value_val['type_field'] == '4' && one_value_val['allow_read'] == 1) {
                                                        multi_type_4 = "<span class='subtable_fields--not_edit_field'>";
                                                        multi_type_4 += one_value_val['mob_value'].replace(/\r\n/g, '<br/>');
                                                        multi_type_4 += "</span>";
                                                        textpad_val.html(multi_type_4);
                                                    } else {
                                                        textpad_val.html("<span class='subtable_fields--not_edit_field'>" + one_value_val['mob_value'] + "</span>");
                                                    }
                                                }
                                            } else {
                                                textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['value'] + one_value_val['fast_edit_div_close']);
                                                // Добавляем атрибут тип поля, если это поле связи и быстрое добавление записи
                                                if (one_value_val['type_field'] == 5) {
                                                    textpad_val.append(one_value_val['mob_value']);
                                                    $(textpad_val).find('select').attr('type_field', one_value_val['type_field']);
                                                    textpad_val.append(`<button class="fields__fast-edit-button fields__fast-edit-button--edit" id="button-edit-${one_value_val['line_id']}-${one_value_val['field_id']}"
                                                        field_id="${one_value_val['field_id']}" line_id="${one_value_val['line_id']}" type="button"></button>`);
                                                    //console.log(cur_subtable['show_fields'][one_value_val['field_id']])
                                                    /*
                                                    * Создаем формы быстрого добавления для полей связи
                                                    * 1. Добавляем внешнюю оболочку
                                                        */
                                                    let oneFieldElement = '';
                                                    if (cur_subtable['show_fields'][one_value_val['field_id']]['add_acc_link_value']) {
                                                        oneFieldElement += `<div id='add_link_block${one_value_val['field_id']}_${one_value_val['line_id']}' class='user-data__row-wrap'
                                                    style='display:none;'>
                                                    <div class='user-data__add-link-triangle'></div>`;

                                                        // 2. Добавляем поля в форму
                                                        cur_subtable['show_fields'][one_value_val['field_id']]['add_link_fields'].forEach(l_field => {
                                                            oneFieldElement += `<div id='sub_row__${one_value_val['field_id']}_${l_field.id}_0' class='add_link_block${one_value_val['field_id']} user-data__row'>
                                                    <div class='user-data__key'`;
                                                            if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                                                oneFieldElement += `style='padding-top:5px; padding-bottom:15px;'`;
                                                            }
                                                            oneFieldElement += `>
                                                        <span>
                                                        <span style='color: #f00;font-weight: 400;' title='${lang.required_field}'>
                                                            *
                                                            </span>
                                                            <b>${l_field.name_field}</b>
                                                        </span>`;
                                                            if (l_field.help) {
                                                                oneFieldElement += `<div style='position: relative;'>
                                                        <img src='../../common/img/help.gif' class='question' onclick='sviewHelp(${l_field.id})' onmouseover='v_init = setTimeout(sviewHelp(${l_field.id}), 500)' onmouseout='shideHelpInit(${l_field.id})'>
                                                        <div class='field_tooltip' id='sf_tooltip${l_field.id}' onmouseover='sviewHelp(${l_field.id})' onmouseout='shideHelpInit(${l_field.id})'></div>
                                                        </div>`;
                                                            }
                                                            oneFieldElement += `<b>:</b>
                                                    </div>
                                                    <div class='user-data__value--add' id='sub_cell_${l_field.id}_${one_value_val['field_id']}_0'`;
                                                            if ((l_field.type_field == 2 || l_field.type_field == 12) && l_field.display_time == 1) {
                                                                oneFieldElement += `class='add_link_block_datetime'`;
                                                            }
                                                            oneFieldElement += `>`;
                                                            if (l_field.type_field == 7 && l_field.mult_value) {
                                                                oneFieldElement += `<div class="user-data__user-fields">
                                                    <div class="user-data__user-fields-row">
                                                    <input data-js="checked_vals" type="hidden" id="fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0" value="140-130" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                    </div>`;

                                                                /*if (l_field.s_list_values.lenght) {
                                                                    oneFieldElement += `<div class="user-data__user-fields-row">
                                                                    <input type="checkbox" onchange="user_multi_select(this)" data-js="all_vals" id="link_field${l_field.id}" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data" >
                                                                    <label for="link_field${l_field.id}" class="user-data__multi-label user-data__multi-label--data">{$lang.subadmin_all}</label>
                                                                    </div>
                                                                    <div style="border-top: 1px solid gray;"></div>`;
                                                                }*/

                                                                for (let one_item in l_field.s_list_values) {
                                                                    let one_field = l_field.s_list_values[one_item];
                                                                    oneFieldElement += `<div class="user-data__user-fields-row">
                                                        <input data-js="value" type="checkbox" onchange="user_multi_select(this)" id="link_field${l_field.id}[${one_item}]" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                        <label for="link_field${l_field.id}[${one_item}]" class="user-data__multi-label user-data__multi-label--data">${one_field}</label>
                                                        </div>`;
                                                                }
                                                                oneFieldElement += `</div>`;

                                                            } else {
                                                                if (typeof l_field.def_value != "undefined")
                                                                    oneFieldElement += `${l_field.fast_edit_div}${l_field.def_value}${l_field.fast_edit_div_close}`;
                                                                else
                                                                    oneFieldElement += `${l_field.fast_edit_div}${l_field.fast_edit_div_close}`;

                                                                if (l_field.type_field == 6 || l_field.type_field == 9) {
                                                                    oneFieldElement += '</div>';
                                                                }
                                                            }

                                                            if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                                                oneFieldElement += `<div class="template_note input-hint">
                                                            <div id="templ_word${l_field.id}" style="display: none;"></div>
                                                            <div id="templ_note${l_field.id}" class="templ_tips"></div>
                                                            </div>
                                                            <input class="user-data__value simple-input" type="text" id="templ_tmp${l_field.id}" size="45"
                                                        value="${l_field.template}">
                                                            <div id="templ_err${l_field.id}" class="error_mess"></div>
                                                            <div id="templ_rep${l_field.id}"></div>
                                                            <input class="simple-input form-control user-data__value" type=text id="templ_fill_link_ok${l_field.id}">
                                                            <script>
                                                            $(document).ready(function (e) {
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').keypress(function (e) {
                                                                    return check_txt(${l_field.id}, e, 1, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').change(function (e) {
                                                                    recheck_txt(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').click(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').focus(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').blur(function (e) {
                                                                    tmpl_clean_bg(this);
                                                                });
                                                            });
                                                    </script>`;
                                                            }
                                                            oneFieldElement += `</div></div>`;
                                                        });

                                                        oneFieldElement += `<div class="user-data__row">
                                                        <div class="user-data__key"></div>
                                                        <div class="user-data__value-add">
                                                        <button type="button" onclick="add_link_block_save(${one_value_val['field_id']},'${cur_subtable['show_fields'][one_value_val['field_id']]['add_link_field_ids']}',${one_value_val['line_id']}, 'subtable')" class="add_link_block${one_value_val['field_id']} add_link_block_save simple-btn user-data__save-adding green-btn">
                                                        ${lang.Add}
                                                        </button>
                                                        </div>
                                                        </div>
                                                        </div>`;
                                                    } else {
                                                        oneFieldElement += `<div id='add_link_block${one_value_val['field_id']}' class='user-data__row-wrap'
                                                            style='display:none;' cat-item="t${cur_subtable['show_fields'][one_value_val['field_id']]['s_table_id']}"></div>`;
                                                    }

                                                    textpad_val.html(textpad_val.html() + oneFieldElement);
                                                    textpad_val.append(`<button class="fields__fast-edit-button fields__fast-edit-button--done" id="button-done-${one_value_val['line_id']}-${one_value_val['field_id']}"
                                                        field_id="${one_value_val['field_id']}" line_id="${one_value_val['line_id']}" type="button"></button>`);
                                                }
                                            }
                                    }
                                } else { //если поле ссылка и нельзя редактировать + если имеил, то тогда mailto:
                                    if (cur_subtable['table_fields'][one_field_key['id']]['hyperlink'] == 1) {
                                        if (one_value_val['allow_write'] == 0) {
                                            if (/@/.test(one_value_val['mob_value'])) {
                                                one_value_val['fast_edit_div'] = '<a href="mailto:' + one_value_val['mob_value'] + '">'
                                            } else {
                                                one_value_val['fast_edit_div'] = '<a href="' + one_value_val['mob_value'] + '" target="_blank">'
                                            }
                                            one_value_val['fast_edit_div_close'] = '</a>'
                                            textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['mob_value'] + one_value_val['fast_edit_div_close']);
                                        }
                                        else {
                                            textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['value'] + one_value_val['fast_edit_div_close']);
                                        }
                                    }
                                    else {
                                      const current_field = cur_subtable['table_fields'][one_field_key['id']];

                                      // Множественный выбор с быстрым редактирование
                                      if (current_field.type_field == '5' && current_field.mult_value == '1') {
                                        const value = one_value_val.mob_value;
                                        let options = '';
                                        if (typeof value == 'object') {
                                          Object.keys(value).forEach(i => {
                                            const item = value[i] || { id: 0, text: 'undefined' };
                                            options += `<option selected value="${item.id}">${item.text}</option>`;
                                          });
                                        }

                                        const required = current_field.main == '0' ? '' : 'required="required"';

                                        let width = Number(current_field.width) || 0;
                                        width = width > 0 ? `width: ${width}px;` : 'width:100%;';

                                        textpad_val.html(/*html*/`
                                          <select
                                            multiple
                                            class="select2-plugin select2-plugin__subtable"
                                            id="fast_edit_span_${current_field.id}_${one_value_val.line_id}_${subtable_id}"
                                            data-field-id="${current_field.id}"
                                            data-line-id="${one_value_val.line_id}"
                                            data-mode="subtable"
                                            ${required}
                                            data-previously-value=""
                                            style="${width}"
                                          >${options}</select>
                                        `);
                                      } else {
                                        textpad_val.html(one_value_val['fast_edit_div'] + one_value_val['value'] + one_value_val['fast_edit_div_close']);

                                        if(one_value_val['type_field'] == 1){
                                            textpad_val.find('input').css('min-width', textpad_val.find('input').val().length * 8);
                                        }
                                        // Добавляем атрибут тип поля, если это поле связи и быстрое добавление записи
                                        if (one_value_val['type_field'] == 5) {
                                            textpad_val.append(one_value_val['mob_value']);
                                            $(textpad_val).find('select').attr('type_field', one_value_val['type_field']);
                                            textpad_val.append(`<button class="fields__fast-edit-button fields__fast-edit-button--edit" id="button-edit-${one_value_val['line_id']}-${one_value_val['field_id']}"
                                                        field_id="${one_value_val['field_id']}" line_id="${one_value_val['line_id']}" type="button"></button>`);
                                            //console.log(cur_subtable['show_fields'][one_value_val['field_id']])
                                            /*
                                            * Создаем формы быстрого добавления для полей связи
                                            * 1. Добавляем внешнюю оболочку
                                             */
                                            let oneFieldElement = '';
                                            if (cur_subtable['show_fields'][one_value_val['field_id']]['add_acc_link_value']) {
                                                oneFieldElement += `<div id='add_link_block${one_value_val['field_id']}_${one_value_val['line_id']}' class='user-data__row-wrap'
                                                    style='display:none;'>
                                                    <div class='user-data__add-link-triangle'></div>`;

                                                // 2. Добавляем поля в форму
                                                cur_subtable['show_fields'][one_value_val['field_id']]['add_link_fields'].forEach(l_field => {
                                                    oneFieldElement += `<div id='sub_row__${one_value_val['field_id']}_${l_field.id}_0' class='add_link_block${one_value_val['field_id']} user-data__row'>
                                                    <div class='user-data__key'`;
                                                    if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                                        oneFieldElement += `style='padding-top:5px; padding-bottom:15px;'`;
                                                    }
                                                    oneFieldElement += `>
                                                <span>
                                                <span style='color: #f00;font-weight: 400;' title='${lang.required_field}'>
                                                    *
                                                    </span>
                                                    <b>${l_field.name_field}</b>
                                                </span>`;
                                                    if (l_field.help) {
                                                        oneFieldElement += `<div style='position: relative;'>
                                                        <img src='../../common/img/help.gif' class='question' onclick='sviewHelp(${l_field.id})' onmouseover='v_init = setTimeout(sviewHelp(${l_field.id}), 500)' onmouseout='shideHelpInit(${l_field.id})'>
                                                        <div class='field_tooltip' id='sf_tooltip${l_field.id}' onmouseover='sviewHelp(${l_field.id})' onmouseout='shideHelpInit(${l_field.id})'></div>
                                                        </div>`;
                                                    }
                                                    oneFieldElement += `<b>:</b>
                                                    </div>
                                                    <div class='user-data__value--add' id='sub_cell_${l_field.id}_${one_value_val['field_id']}_0'`;
                                                    if ((l_field.type_field == 2 || l_field.type_field == 12) && l_field.display_time == 1) {
                                                        oneFieldElement += `class='add_link_block_datetime'`;
                                                    }
                                                    oneFieldElement += `>`;
                                                    if (l_field.type_field == 7 && l_field.mult_value) {
                                                        oneFieldElement += `<div class="user-data__user-fields">
                                                    <div class="user-data__user-fields-row">
                                                    <input data-js="checked_vals" type="hidden" id="fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0" value="140-130" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                    </div>`;

                                                        /*if (l_field.s_list_values.lenght) {
                                                            oneFieldElement += `<div class="user-data__user-fields-row">
                                                            <input type="checkbox" onchange="user_multi_select(this)" data-js="all_vals" id="link_field${l_field.id}" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data" >
                                                            <label for="link_field${l_field.id}" class="user-data__multi-label user-data__multi-label--data">{$lang.subadmin_all}</label>
                                                            </div>
                                                            <div style="border-top: 1px solid gray;"></div>`;
                                                        }*/

                                                        for (let one_item in l_field.s_list_values) {
                                                            let one_field = l_field.s_list_values[one_item];
                                                            oneFieldElement += `<div class="user-data__user-fields-row">
                                                        <input data-js="value" type="checkbox" onchange="user_multi_select(this)" id="link_field${l_field.id}[${one_item}]" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                        <label for="link_field${l_field.id}[${one_item}]" class="user-data__multi-label user-data__multi-label--data">${one_field}</label>
                                                        </div>`;
                                                        }
                                                        oneFieldElement += `</div>`;

                                                    } else {
                                                        if (typeof l_field.def_value != "undefined")
                                                            oneFieldElement += `${l_field.fast_edit_div}${l_field.def_value}${l_field.fast_edit_div_close}`;
                                                        else
                                                            oneFieldElement += `${l_field.fast_edit_div}${l_field.fast_edit_div_close}`;

                                                        if (l_field.type_field == 6 || l_field.type_field == 9) {
                                                            oneFieldElement += '</div>';
                                                        }
                                                    }

                                                    if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                                        oneFieldElement += `<div class="template_note input-hint">
                                                            <div id="templ_word${l_field.id}" style="display: none;"></div>
                                                            <div id="templ_note${l_field.id}" class="templ_tips"></div>
                                                            </div>
                                                            <input class="user-data__value simple-input" type="text" id="templ_tmp${l_field.id}" size="45"
                                                        value="${l_field.template}">
                                                            <div id="templ_err${l_field.id}" class="error_mess"></div>
                                                            <div id="templ_rep${l_field.id}"></div>
                                                            <input class="simple-input form-control user-data__value" type=text id="templ_fill_link_ok${l_field.id}">
                                                            <script>
                                                            $(document).ready(function (e) {
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').keypress(function (e) {
                                                                    return check_txt(${l_field.id}, e, 1, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').change(function (e) {
                                                                    recheck_txt(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').click(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').focus(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_value_val['field_id']}_0').blur(function (e) {
                                                                    tmpl_clean_bg(this);
                                                                });
                                                            });
                                                    </script>`;
                                                    }
                                                    oneFieldElement += `</div></div>`;
                                                });

                                                oneFieldElement += `<div class="user-data__row">
                                                        <div class="user-data__key"></div>
                                                        <div class="user-data__value-add">
                                                        <button type="button" onclick="add_link_block_save(${one_value_val['field_id']},'${cur_subtable['show_fields'][one_value_val['field_id']]['add_link_field_ids']}',${one_value_val['line_id']}, 'subtable')" class="add_link_block${one_value_val['field_id']} add_link_block_save simple-btn user-data__save-adding green-btn">
                                                        ${lang.Add}
                                                        </button>
                                                        </div>
                                                        </div>
                                                        </div>`;
                                            } else {
                                                oneFieldElement += `<div id='add_link_block${one_value_val['field_id']}' class='user-data__row-wrap'
                                                         style='display:none;' cat-item="t${cur_subtable['show_fields'][one_value_val['field_id']]['s_table_id']}"></div>`;
                                            }

                                            textpad_val.html(textpad_val.html() + oneFieldElement);
                                            textpad_val.append(`<button class="fields__fast-edit-button fields__fast-edit-button--done" id="button-done-${one_value_val['line_id']}-${one_value_val['field_id']}"
                                                        field_id="${one_value_val['field_id']}" line_id="${one_value_val['line_id']}" type="button"></button>`);
                                        }
                                      }
                                    }
                                }
                            }
                            textpad.append(textpad_val);


                            if (one_value_val['postfix'] !== '') {
                                let subtable_prefix = $('<span class="subtable__prefix">');
                                let prefixCss = {
                                    'display': 'flex',
                                    'align-items': 'flex-start',
                                }

                                subtable_prefix.css('margin-left', '3px');
                                subtable_prefix.text(one_value_val['postfix']);

                                textpad.css(prefixCss);
                                textpad.append(subtable_prefix);
                            }

                            subtable_cell.append(textpad);
                            subtable_row_simple.append(subtable_cell);
                        }
                    }
                }.bind(this));
                subtable_table.append(subtable_row_simple);
            }.bind(this));

            this.loaded_subtables[subtable_id]['loaded_rows'] = (this.loaded_subtables[subtable_id]['loaded_rows']) ? ++this.loaded_subtables[subtable_id]['loaded_rows'] : 1;
            subtable_table_wrap.append(subtable_table);
            subtable_wrap.append(subtable_table_wrap);
        }

        /**
         * Формирование скрытой строки
         */
        if (!started) {
            var subtable_row_hidden = $('<tr class="subtable__row subtable__row--hidden">');
            subtable_row_hidden.attr('id', 'last_subtable_tr_' + cur_subtable['id']);
            var subtable_cell_hidden_tool = _createToolBtns(true, {
                'cur_subtable': cur_subtable,
                'adv_data': adv_data
            });
            subtable_row_hidden.append(subtable_cell_hidden_tool);

            this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field_key) {
                var one_field_val = cur_subtable['show_fields'][one_field_key['id']];
                if (one_field_val['hidden_tbl'] === 0 && !(one_field_val['group_field'] !== 0 && !one_field_val['col_allow_write'])) {
                    var subtable_cell_hidden = $('<td class="subtable__cell">')
                        .attr('id', 'subtable_' + cur_subtable['id'] + '__undefined_line_id__' + one_field_val['id']);
                    if (parseInt(one_field_val['type_field']) === 2
                        || parseInt(one_field_val['type_field']) === 12
                        || parseInt(one_field_val['type_field']) === 5) {
                        subtable_cell_hidden.addClass('nowrap');
                    }

                    // Если число - добавляем класс на ограничение max-width
                    if (parseInt(one_field_val['type_field']) === 1) {
                        subtable_cell_hidden.addClass('number__max_width');
                    }

                    var textpad_hidden = $('<div class="textpad">');
                    if ((parseInt(one_field_val['type_field']) === 2
                        || parseInt(one_field_val['type_field']) === 12)
                        && parseInt(one_field_val['type_value']) === 1) {
                        textpad_hidden.addClass('datetime_textpad');
                        if (parseInt(one_field_val['main']) === 1) textpad_hidden.addClass('textpad__required-field');
                    }
                    var textpad_style = '';
                    if (parseInt(one_field_val['type_field']) === 1) {
                        textpad_style += 'display: flex; justify-content: flex-end;float:right; width:100%;';
                    }
                    if (one_field_val['prefix'] !== '' || one_field_val['postfix'] !== '') {
                        textpad_style += 'display: flex; align-items: center;';
                        textpad_hidden.attr('with-prefix', true);
                    }
                    if (parseInt(one_field_val['width']) !== 0) {
                        textpad_style += 'width: ' + (parseInt(one_field_val['width']) + (parseInt(one_field_val['type_field']) === 1 ? 3 : 0)) + 'px;overflow: hidden;';
                    } else {
                        if(parseInt(one_field_val['type_field']) === 3){
                            textpad_style+='width:250px';
                        }
                        else {
                            textpad_hidden.attr('default-width', true);
                        }
                    }
                    textpad_hidden.attr({
                        'style': textpad_style,
                        'id': 'sub_cell_' + one_field_val['id'] + '__undefined_line_id__' + cur_subtable['id']
                    });

                    if (one_field_val['prefix'] !== '') {
                        let subtable_prefix = $('<span class="subtable__prefix">');
                        let prefixCss = {
                            'display': 'flex',
                            'align-items': 'flex-start',
                            'flex-direction': 'column',
                        }

                        subtable_prefix.css('margin-left', '3px');
                        subtable_prefix.text(one_field_val['prefix']);

                        textpad_hidden.css(prefixCss);
                        textpad_hidden.append(subtable_prefix);
                    }

                    if (!one_field_val['fast_edit_div'] && !one_field_val['fast_edit_div_close']) {
                        var div = $('<div class="textpad__value">').css({
                            'display': 'flex',
                            'align-items': 'center',
                            'padding': '0',
                        });
                        if (parseInt(one_field_val['type_field']) === 3) {
                            div.addClass('textpad__value--text').addClass('textpad__value--long-text-field')
                            if (parseInt(one_field_val['main']) === 1) div.addClass('textpad__required-field');
                        }

                        // Множественный выбор с быстрым редактированием
                        if (one_field_val.type_field == '5' && one_field_val.mult_value == '1') {
                          const current_field = cur_subtable['table_fields'][one_field_key['id']];
                          const required = current_field.main == '0' ? '' : 'required="required"';

                          let width = Number(current_field.width) || 0;
                          width = width > 0 ? `width: ${width}px;` : 'width:100%;';

                          div.html(/*html*/`
                            <select
                              multiple
                              class="select2-plugin select2-plugin__subtable"
                              id="fast_edit_span_${current_field.id}__undefined_line_id__${subtable_id}"
                              data-field-id="${current_field.id}"
                              data-line-id="_undefined_line_id_"
                              data-mode="subtable"
                              ${required}
                              data-previously-value=""
                              style="${width}"
                            ></select>
                        `);
                        } else {
                          div.html(one_field_val['def_value']);
                        }

                        // Добавляем атрибут тип поля, если это поле связи и быстрое добавление записи
                        if (one_field_val.mult_value != '1' && one_field_val['type_field'] == '5') {
                            let containerBlock = $(div);
                            let selectElem = containerBlock.find('select');
                            let curValueElem = '';
                            let acValue = selectElem.attr('ac_value');
                            if (typeof(acValue) == 'string') {
                                acValue = acValue.replace(/&quot;/g, '"');
                            }
                            const acLink = selectElem.attr('ac_link_val');
                            const link = selectElem.attr('link');
                            const disableLink = one_field_val['disable_link'];
                            const linkStyle = {
                                'color': 'rgb(0, 0, 255)',
                                'text-decoration': 'underline',
                                'min-width': '50px',
                                'border-radius': '4px'
                            }

                            if (acLink) {
                                if (acLink.length > 0 && acLink !== 'null' && acValue !== '') {
                                    curValueElem = $('<a class="autocomplete_val" href="' + link + '" target="_blank">' + acValue + '</a>');

                                    if (!disableLink) curValueElem.css(linkStyle);
                                }
                            }

                            selectElem.attr('type_field', one_field_val['type_field']);
                            containerBlock.append(`<button class="fields__fast-edit-button fields__fast-edit-button--edit edit-btn" id="button-edit-${"_undefined_line_id_"}-${one_field_val['id']}"
                                                        field_id="${one_field_val['id']}" line_id="${"_undefined_line_id_"}" type="button"></button>`);
                            /*
                            * Создаем формы быстрого добавления для полей связи
                            * 1. Добавляем внешнюю оболочку
                             */
                            let oneFieldElement = '';
                            if (cur_subtable['show_fields'][one_field_val['id']]['add_acc_link_value']) {
                                oneFieldElement += `<div id='add_link_block${one_field_val['id']}_${"_undefined_line_id_"}' class='user-data__row-wrap'
                                                style='display:none;'>
                                                    <div class='user-data__add-link-triangle'></div>`;

                                // 2. Добавляем поля в форму
                                one_field_val['add_link_fields'].forEach(l_field => {
                                    oneFieldElement += `<div id='sub_row__${one_field_val['id']}_${l_field.id}_0' class='add_link_block${one_field_val['id']} user-data__row'>
                                                    <div class='user-data__key'`;
                                    if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                        oneFieldElement += `style='padding-top:5px; padding-bottom:15px;'`;
                                    }
                                    oneFieldElement += `>
                                                <span>
                                                <span style='color: #f00;font-weight: 400;' title='${lang.required_field}'>
                                                    *
                                                    </span>
                                                    <b>${l_field.name_field}</b>
                                                </span>`;
                                    if (l_field.help) {
                                        oneFieldElement += `<div style='position: relative;'>
                                                        <img src='../../common/img/help.gif' class='question' onclick='sviewHelp(${l_field.id})' onmouseover='v_init = setTimeout(sviewHelp(${l_field.id}), 500)' onmouseout='shideHelpInit(${l_field.id})'>
                                                        <div class='field_tooltip' id='sf_tooltip${l_field.id}' onmouseover='sviewHelp(${l_field.id})' onmouseout='shideHelpInit(${l_field.id})'></div>
                                                        </div>`;
                                    }
                                    oneFieldElement += `<b>:</b>
                                                    </div>
                                                    <div class='user-data__value--add' id='sub_cell_${l_field.id}_${one_field_val['id']}_0'`;
                                    if ((l_field.type_field == 2 || l_field.type_field == 12) && l_field.display_time == 1) {
                                        oneFieldElement += `class='add_link_block_datetime'`;
                                    }
                                    oneFieldElement += `>`;
                                    if (l_field.type_field == 7 && l_field.mult_value) {
                                        oneFieldElement += `<div class="user-data__user-fields">
                                                    <div class="user-data__user-fields-row">
                                                    <input data-js="checked_vals" type="hidden" id="fast_edit_span_${l_field.id}_${one_field_val['id']}_0" value="140-130" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                    </div>`;

                                        /*if (l_field.s_list_values) {
                                            oneFieldElement += `<div class="user-data__user-fields-row">
                                                            <input type="checkbox" onchange="user_multi_select(this)" data-js="all_vals" id="link_field${l_field.id}" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data" >
                                                            <label for="link_field${l_field.id}" class="user-data__multi-label user-data__multi-label--data">{$lang.subadmin_all}</label>
                                                            </div>
                                                            <div style="border-top: 1px solid gray;"></div>`;
                                        }*/

                                        for (let one_item in l_field.s_list_values) {
                                            let one_field = l_field.s_list_values[one_item];
                                            oneFieldElement += `<div class="user-data__user-fields-row">
                                                        <input data-js="value" type="checkbox" onchange="user_multi_select(this)" id="link_field${l_field.id}[${one_item}]" value="${one_item}" class="user-data__multi-checkbox user-data__multi-checkbox--data">
                                                        <label for="link_field${l_field.id}[${one_item}]" class="user-data__multi-label user-data__multi-label--data">${one_field}</label>
                                                        </div>`;
                                        }
                                        oneFieldElement += `</div>`;

                                    } else {
                                        if (typeof l_field.def_value != "undefined") {
                                            oneFieldElement += `${l_field.fast_edit_div}${l_field.def_value}${l_field.fast_edit_div_close}`;
                                        } else {
                                            oneFieldElement += `${l_field.fast_edit_div}${l_field.fast_edit_div_close}`;
                                        }

                                        if (l_field.type_field == 6 || l_field.type_field == 9) {
                                            oneFieldElement += '</div>';
                                        }
                                    }

                                    if (l_field.type_field == 3 && !l_field.mult_value && l_field.template.length > 0) {
                                        oneFieldElement += `<div class="template_note input-hint">
                                                            <div id="templ_word${l_field.id}" style="display: none;"></div>
                                                            <div id="templ_note${l_field.id}" class="templ_tips"></div>
                                                            </div>
                                                            <input class="user-data__value simple-input" type="text" id="templ_tmp${l_field.id}" size="45"
                                                        value="${l_field.template}">
                                                            <div id="templ_err${l_field.id}" class="error_mess"></div>
                                                            <div id="templ_rep${l_field.id}"></div>
                                                            <input class="simple-input form-control user-data__value" type=text id="templ_fill_link_ok${l_field.id}">
                                                            <script>
                                                            $(document).ready(function (e) {
                                                                $('#fast_edit_span_${l_field.id}_${one_field_val['id']}_0').keypress(function (e) {
                                                                    return check_txt(${l_field.id}, e, 0, 'fast_edit_span_${l_field.id}_${one_field_val['id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_field_val['id']}_0').change(function (e) {
                                                                    recheck_txt(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_field_val['id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_field_val['id']}_0').click(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_field_val['id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_field_val['id']}_0').focus(function (e) {
                                                                    check_click(${l_field.id}, 'fast_edit_span_${l_field.id}_${one_field_val['id']}_0');
                                                                });
                                                                $('#fast_edit_span_${l_field.id}_${one_field_val['id']}_0').blur(function (e) {
                                                                    tmpl_clean_bg(this);
                                                                });
                                                            });
                                                    </script>`;
                                    }
                                    oneFieldElement += `</div></div>`;
                                });

                                oneFieldElement += `<div class="user-data__row">
                                                        <div class="user-data__key"></div>
                                                        <div class="user-data__value-add">
                                                        <button type="button" onclick="add_link_block_save(${one_field_val['id']},'${one_field_val['add_link_field_ids']}',${"_undefined_line_id_"},'subtable')" class="add_link_block${one_field_val['id']} add_link_block_save simple-btn user-data__save-adding green-btn">
                                                        ${lang.Add}
                                                        </button>
                                                        </div>
                                                        </div>
                                                        </div>`;
                            } else {
                                oneFieldElement += `<div id='add_link_block${one_field_val['id']}' class='user-data__row-wrap'
                                                         style='display:none;' cat-item="t${cur_subtable['show_fields'][one_field_val['id']]['s_table_id']}"></div>`;
                            }
                            div.html(div.html() + oneFieldElement);
                            div.append(`<button class="fields__fast-edit-button fields__fast-edit-button--done done-btn" id="button-done-${"_undefined_line_id_"}-${one_field_val['id']}"
                                                        field_id="${one_field_val['id']}" line_id="${"_undefined_line_id_"}" type="button"></button>`);
                            div.prepend(curValueElem);
                        }
                        textpad_hidden.append(div);
                    } else {
                        var html = one_field_val['fast_edit_div'] + one_field_val['def_value'] + one_field_val['fast_edit_div_close'];
                        var textpad_val = $('<span class="textpad__value">');
                        const typeField = parseInt(one_field_val['type_field']);

                        if (typeField === 3) {
                            textpad_val.addClass('textpad__value--text').addClass('textpad__value--long-text-field')
                        }
                        if (typeField === 1 || typeField === 2 || typeField === 3 || typeField === 12) {
                            if (parseInt(one_field_val['main']) === 1) textpad_val.addClass('textpad__required-field');
                        }
                        textpad_val.html(html);
                        textpad_hidden.append(textpad_val);
                    }
                    if (one_field_val['postfix'] !== '') {
                        let subtable_prefix = $('<span class="subtable__prefix">');
                        let prefixCss = {
                            'display': 'flex',
                            'align-items': 'flex-start',
                        }

                        subtable_prefix.css('margin-left', '3px');
                        subtable_prefix.text(one_field_val['postfix']);

                        textpad_hidden.css(prefixCss);
                        textpad_hidden.append(subtable_prefix);
                    }
                    subtable_cell_hidden.append(textpad_hidden);
                    subtable_row_hidden.append(subtable_cell_hidden);
                }
            });

            subtable_table.append(subtable_row_hidden);
        }

        if (this.loaded_subtables[subtable_id]['pagination_count'] === this.loaded_subtables[subtable_id]['loaded_rows']) {
            /** Создаем результирующее поле для группированной подтаблицы **/
            if (parseInt(cur_subtable['group_field']) !== 0) {
                var subtable_row_result = $('<tr class="subtable__row">');
                subtable_row_result.attr('id', 'subtable_' + cur_subtable['id'] + '_sum_' + cur_subtable['last_group_field_pp']);
                var subtable_cell_sum_first = $('<td class="subtable__cell subtable__cell--sum">');
                subtable_row_result.append(subtable_cell_sum_first);

                // Вывод конечной суммы и среднего значения
                this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field) {
                    var one_field_val = cur_subtable['show_fields'][one_field['id']];

                    if (one_field_val['hidden_tbl'] === 0 && !(one_field_val['group_field'] !== 0 && !one_field_val['col_allow_write'])) {
                        var subtable_cell_sum = $('<td class="subtable__cell subtable__cell--sum">');

                        if (one_field_val['summa'] === 1 || one_field_val['average'] === 1) {
                            if (cur_subtable['last_group_field_pp']) {
                                if (one_field_val['totals']) {
                                    var one_total_val = one_field_val['totals'][cur_subtable['last_group_field_pp']];
                                    var subtable_sum_gray = $('<div class="subtable__sum-gray">');
                                    subtable_sum_gray.addClass('sub_totalgr' + one_field_val['id'] + '_' + cur_subtable['last_group_field_pp']);
                                    subtable_sum_gray.attr({
                                        'id': 'sub_totalgr' + one_field_val['id'] + '_' + cur_subtable['last_group_field_pp'] + '_' + cur_subtable['id'],
                                        'title': lang['total_of_group']
                                    });
                                    subtable_sum_gray.text(one_total_val);

                                    subtable_cell_sum.append(subtable_sum_gray);
                                } else {
                                    var subtable_sum_gray = $('<div class="subtable__sum-gray">');

                                    subtable_cell_sum.append(subtable_sum_gray);
                                }

                                if (one_field_val['averages']) {
                                    var one_average_val = one_field_val['averages'][cur_subtable['last_group_field_pp']];
                                    var subtable_sum_gray = $('<div class="subtable__sum-gray">');
                                    subtable_sum_gray.addClass('sub_averagegr' + one_field_val['id'] + '_' + cur_subtable['last_group_field_pp']);
                                    subtable_sum_gray.attr({
                                        'id': 'sub_averagegr' + one_field_val['id'] + '_' + cur_subtable['last_group_field_pp'] + '_' + cur_subtable['id'],
                                        'title': lang['average_of_group']
                                    });
                                    subtable_sum_gray.text(one_average_val);

                                    subtable_cell_sum.append(subtable_sum_gray);
                                } else {
                                    var subtable_sum_gray = $('<div class="subtable__sum-gray">');

                                    subtable_cell_sum.append(subtable_sum_gray);
                                }
                            }
                            _create_result_row(subtable_cell_sum, one_field_val, cur_subtable);
                        }
                        subtable_row_result.append(subtable_cell_sum);
                    }
                });
                subtable_table.append(subtable_row_result);

                if (cur_subtable['add'] === 1) {
                    _createGroupBtns(subtable_table, true, adv_data, {
                        'cur_subtable': cur_subtable
                    });
                }

                /** Создаем результирующее поле для негруппированной подтаблицы **/
            } else if (parseInt(cur_subtable['group_field']) === 0) {
                var subtable_row_result = $('<tr class="subtable__row subtable__row--format-not-init">');
                subtable_row_result.attr('id', 'subtable_' + cur_subtable['id'] + '_sum_0');
                var subtable_cell_sum_first = $('<td class="subtable__cell subtable__cell--sum">');
                subtable_row_result.append(subtable_cell_sum_first);

                this.loaded_subtables[subtable_id]['sorted_by_cell'].forEach(function (one_field) {
                    var one_field_val = cur_subtable['show_fields'][one_field['id']];

                    if (one_field_val['hidden_tbl'] === 0) {
                        var subtable_cell_sum = $('<td class="subtable__cell subtable__cell--sum">');

                        if (one_field_val['summa'] === 1 || one_field_val['average'] === 1) {
                            _create_result_row(subtable_cell_sum, one_field_val, cur_subtable);
                        }
                        subtable_row_result.append(subtable_cell_sum);
                    }
                });
                subtable_table.append(subtable_row_result);
            }
        }

        if (!started) {
            subtable_table_wrap.append(subtable_table);
            subtable_wrap.append(subtable_table_wrap);
            subtable = $('.subtable');
            subtable.append(subtable_wrap);
            _create_subtable_footer(subtable_id, cur_subtable, adv_data);
            this.init_pagination_scroll();
        }

        remove_events_from_group_btns($('#sub_' + subtable_id));
        set_position_group_btns($('#sub_' + subtable_id));
        init_subtable_fast_edit(subtable_id);
        subtable.find($('.preloader__block')).addClass('hidden');
        addBreakStyles();
        _restate_head_btns(false);
        _initColorFormat(cur_subtable);
        addIdentClassForLinkFieldsWithImage();

        if (lang.name === 'English' || lang.name === 'American') {
            $('.datepicker').not('.datetimepicker').mask('99/99/9999');
            $('.datepicker.datetimepicker').mask('99/99/9999 99:99');
        } else {
            $('.datepicker').not('.datetimepicker').mask('99.99.9999');
            $('.datepicker.datetimepicker').mask('99.99.9999 99:99');
        }

        if (update_data_arr) {
            update_data_arr.forEach(function (value) {
                UpdateData(value);
            });
        }
        subtableCalc.callFunctions(); /** subtableCalc - global variable */
        if (!started) {
            $('#sub_' + subtable_id).fixedTable();
        }

        /*
        Появление зеленой кнопки Сохранить для Связи в подтаблице,
        почему то простым изменение не работает,
        приходится сравнивать значения До и После
         */
        var tempVal = ""
        $('.subtable__cell').find('.autocomplete__input').click(function () {
            tempVal = $(this).val()
        })

        $('.subtable__cell').find('.autocomplete__input').blur(function () {
            if (tempVal != $(this).val()) {
                $(".subtable__footer-btn--save").fadeIn();
            }

        })

        init_fields_fast_edit_subtable();

        const select2_plugin = $('.select2-plugin__subtable');
        select2_plugin
          .select2({ajax: _s2_ajax()})
          .on('select2:unselecting', _s2_setPreviouslyvalue)
          .on('change', _s2_handleChange);
    };

    /**
     * Инициализация цветового форматирования для строк
     * @param subtable {Object} Данные о подтаблице
     * @private
     */
    function _initColorFormat(subtable) {
        var lines = [];
        $('.subtable__row--format-not-init').each(function () {
            if (!$(this).hasClass('subtable__row--hidden')) {
                var id = $(this).attr('id');
                var line_id = id.split('_')[3];
                lines.push(line_id);
                $(this).removeClass('subtable__row--format-not-init');
            }
        });
        subtable_color_formats[subtable['table_id']].setFormatColor({
            'lines': lines,
            'subtable_id': subtable['id']
        });
    }

    function _create_result_row(subtable_cell_sum, one_field_val, cur_subtable) {
        if (typeof cur_subtable['pages'] !== "undefined" && cur_subtable['pages'].length > 0) {
            if (one_field_val['summa'] === 1) {
                var subtable_sum_page = $('<div class="subtable__sum-page">');
                subtable_sum_page.addClass('sub_total_page' + one_field_val['id']);
                subtable_sum_page.attr({
                    'id': 'sub_total_page' + one_field_val['id'] + '_' + cur_subtable['id'],
                    'title': lang['total_of_page']
                });
                subtable_sum_page.text(one_field_val['total']);
                subtable_cell_sum.append(subtable_sum_page);
            } else {
                var subtable_sum_page = $('<div class="subtable__sum-page subtable__sum-page--fictive">');
                subtable_cell_sum.append(subtable_sum_page);
            }

            if (one_field_val['average'] === 1) {
                var subtable_average_page = $('<div class="subtable__sum-page">');
                subtable_average_page.addClass('sub_average_page' + one_field_val['id']);
                subtable_average_page.attr({
                    'id': 'sub_average_page' + one_field_val['id'] + '_' + cur_subtable['id'],
                    'title': lang['average_of_page']
                });
                subtable_average_page.text(one_field_val['average_str']);
                subtable_cell_sum.append(subtable_average_page);
            } else {
                var subtable_average_page = $('<div class="subtable__sum-page subtable__sum-page--fictive">');
                subtable_cell_sum.append(subtable_average_page);
            }
        }

        if (one_field_val['summa'] === 1) {
            var subtable_sum_black = $('<div class="subtable__sum-black">');
            subtable_sum_black.addClass('sub_total' + one_field_val['id']);
            subtable_sum_black.attr({
                'id': 'sub_total' + one_field_val['id'] + '_' + cur_subtable['id'],
                'title': lang['total_of_all_table']
            });

            if (typeof cur_subtable['pages'] !== "undefined" && cur_subtable['pages'].length > 0) {
                subtable_sum_black.text(one_field_val['full_total']);
            } else {
                subtable_sum_black.text(one_field_val['total']);
            }

            if (one_field_val['type_field'] == 1 && !one_field_val['view_edit'] && one_field_val['width'] == 0) {
                subtable_sum_black.css('padding-right', '10px');
            }
            subtable_cell_sum.append(subtable_sum_black);
        } else {
            var subtable_sum_black = $('<div class="subtable__sum-black">');

            subtable_cell_sum.append(subtable_sum_black);
        }

        if (one_field_val['average'] === 1) {
            var subtable_average_black = $('<div class="subtable__sum-black">');
            subtable_average_black.addClass('sub_average' + one_field_val['id']);
            subtable_average_black.attr({
                'id': 'sub_average' + one_field_val['id'] + '_' + cur_subtable['id'],
                'title': lang['average_of_all_table']
            });

            if (typeof cur_subtable['pages'] !== "undefined" && cur_subtable['pages'].length > 0) {
                subtable_average_black.text(one_field_val['full_average']);
            } else {
                subtable_average_black.text(one_field_val['average_str']);
            }

            subtable_cell_sum.append(subtable_average_black);
        } else {
            var subtable_average_black = $('<div class="subtable__sum-black">');

            subtable_cell_sum.append(subtable_average_black);
        }
    }

    /**
     * Формирование кнопок для группировок
     * @param subtable_table {jQuery|HTMLElement} Таблица, в которую добавляем строки
     * @param is_last {boolean} Если true, то группа последняя
     * @param adv_data {Object} Доп. данные
     * @param data {Object} Внутренние доп. данные
     * @private
     */
    function _createGroupBtns(subtable_table, is_last, adv_data, data) {
        if (typeof data === 'undefined') {
            data = {};
        }

        var subtable_row_group_btns;
        if (!is_last) {
            subtable_row_group_btns = $('<tr id="subtable_' + data['cur_subtable']['id'] + '_group_' + (data['one_value_val']['group_field_pp'] - 1) + '">');
        } else {
            subtable_row_group_btns = $('<tr id="subtable_' + data['cur_subtable']['id'] + '_group_' + data['cur_subtable']['last_group_field_pp'] + '">');
        }

        var subtable_cell = $('<td colspan="' + data['cur_subtable']['display_fields_count'] + '">');
        subtable_cell.addClass('subtable__cell subtable__cell--group-btns');

        var group_btns = $('<div class="subtable__group-btns">');
        var btns = _createFooterBtns(true, is_last, adv_data, data);

        group_btns.append(btns['save']);
        group_btns.append(btns['add']);
        subtable_cell.append(group_btns);
        subtable_row_group_btns.append(subtable_cell);
        subtable_table.append(subtable_row_group_btns);
    }

    /**
     * Формирование кнопок
     * @param is_group {boolean} Если true, то кнопки для группировки
     * @param is_last {boolean} Если true, то группа последняя
     * @param adv_data {Object} Доп. данные
     * @param data {Object} Внутренние доп. данные
     * @returns {{save: jQuery|HTMLElement, add: jQuery|HTMLElement}}
     * @private
     */
    function _createFooterBtns(is_group, is_last, adv_data, data) {
        var save_btn = $('<button type="button" class="subtable__footer-btn subtable__footer-btn--save default-btn green-btn">');
        save_btn.on('click', sub_save_click);
        save_btn.text(lang['Save']);
        if (!adv_data['edit_mode']) {
            save_btn.css('display', 'none');
        }

        var add_line_btn = $('<button type="button" id="add_line_in_subtable" class="subtable__footer-btn subtable__footer-btn--add default-btn">');
        if (is_group) {
            add_line_btn.on('click', function () {
                if (!is_last) {
                    sub_add_new_line(data['one_value_val']['group_field_pp'] - 1);
                } else {
                    sub_add_new_line(data['cur_subtable']['last_group_field_pp']);
                }
            });
        } else {
            add_line_btn.on('click', function () {
                sub_add_new_line();
            });
        }
        add_line_btn.text(lang['Add_record']);

        return {
            'save': save_btn,
            'add': add_line_btn
        }
    }

    /**
     * Формирование кнопок для первой ячейки строки
     * @param is_hidden {boolean} Если true, то для скрытого поля
     * @param data {Object} Внутренние доп. данные
     * @returns {jQuery|HTMLElement}
     * @private
     */
    function _createToolBtns(is_hidden, data) {
        var subtable_cell_tool = $('<td nowrap class="subtable__cell subtable__cell-1">');
        var view_btn = $('<a class="btn-view">');
        var line_id = (!is_hidden) ? data['one_value_val']['line_id'] : '_undefined_line_id_';
        view_btn.attr('href', 'view_line2.php?table=' + data['cur_subtable']['table_id'] + '&line=' + line_id + '&back_url=' + base64_current_url);
        subtable_cell_tool.append(view_btn);

        if ((!is_hidden && data['one_value_val'] && parseInt(data['one_value_val']['can_del']) !== 0)
            || (is_hidden && data['cur_subtable'] && parseInt(data['cur_subtable']['del']) !== 0)) {
            var remove_btn = $('<a href="#" class="btn-drop">');
            remove_btn.on('click', function (e) {
                e.preventDefault();
                sub_drop_line(line_id);
            });
            subtable_cell_tool.append(remove_btn);
        }

        return subtable_cell_tool;
    }

    function init_fields_fast_edit_subtable() {
        const subId = $('.subtable__tab-list .subtable__tab-item--active').attr('id').replace('tab', 'sub'); // id текущей подтаблицы
        const fields = $('.subtable .subtable__wrap#' + subId + ' .textpad__value > select.combobox--hidden');

        if (fields.length > 0) {
            fields.each(function (i) {
                const $this = $(this);
                init_fields_link_subtable($this, i);
            });
        }

        const edit_buttons = $('.subtable .fields__fast-edit-button--edit');
        if (edit_buttons.length > 0) {
            edit_buttons.each(function () {
                $(this).mouseup(function (e) {
                    e.stopPropagation();
                });
                $(this).click(init_edit_buttons_subtable);
            });
        }

        const done_buttons = $('.subtable .fields__fast-edit-button--done');
        if (done_buttons.length > 0) {
            done_buttons.each(function () {
                $(this).mouseup(function (e) {
                    e.stopPropagation();
                });
                $(this).click(init_done_buttons_subtable);
            })
        }
    }


    /**
     * Формирование полей типа связь для быстрого редактирования
     * @param combobox
     * @param index
     */
    function init_fields_link_subtable(combobox, index) {
        var $combobox = combobox;

        if ($combobox.length > 0) {
            var input = $combobox.next().find($('.autocomplete__input'));
            var input = $combobox.next().find($('.autocomplete__input'));
            var select_option_width = input.parents('span').siblings('select').width();

            if (select_option_width == 0) select_option_width = '';

            input.parents('.textpad').css('width', select_option_width);
            input.parents('.textpad__value').css({
                'display': 'flex',
                'align-items': 'center',
                'padding': '0',
            });
            input.parents('.autocomplete').hide();

            $combobox.next().mouseup(function (e) {
                e.stopPropagation();
            });
        }
    }

    function init_edit_buttons_subtable(e) {
        var target = $(e.target);
        var field_id = target.attr('field_id');
        var line_id = target.attr('line_id');
        var hiddenInputStyle = {
            'background-color': 'white',
            'color': '#000',
            'border-radius': '0'
        }

        if (line_id && field_id) {
            let text_field = $('.fast_edit_span_' + field_id + '_' + line_id).next();
            let select = $('.fast_edit_span_' + field_id + '_' + line_id);
            let done_btn = $('#button-done-' + line_id + '-' + field_id);
            let additionalFields = select.siblings('.sub-slave_fields');
            let content;

            text_field.parent().css('padding', '0');

            if ((target.prev().find('span').first().text().length > 0 && !target.parent().hasClass('fields__special-text--html')) || target.parent().prev().length === 0) {
                if (additionalFields.length > 0)
                    content = target.prev().find('.autocomplete_val').first();
                else
                    content = target.prev();
            } else {
                content = target.prev();
            }
            if (text_field.length > 0 && done_btn.length > 0 && (content.length > 0 || target.parent().find($('.fields__fast-edit--combobox')).length > 0)) {
                if (select.hasClass('combobox--hidden')) {
                    if (!target.parent().hasClass('fields__special-text--html')) {
                        if (target.parent().hasClass('fields__special-text--hyperlink')) {
                            text_field.val(content.text());
                        } else {
                            if (parseInt(select.attr('disable_link')) === 0) {
                                if(content.find('.show-field-slave__item--inline').length > 0){
                                    text_field.find('input').val(content.text().replace(content.find('.show-field-slave__item--inline').text(), ""));
                                }
                                else {
                                    text_field.find('input').val(content.text());
                                }
                            } else {
                                if(content.find($('.autocomplete_val')).find('.show_field_slave').length > 0){
                                    text_field.find('input').val(content.find($('.autocomplete_val')).text().replace(content.find($('.autocomplete_val')).find('.show_field_slave').text(), ''));
                                }
                                else if(content.find('.show_field_slave').length > 0){
                                    text_field.find('input').val(content.text().replace(content.find('.show_field_slave').text(), ""));
                                }
                                else if(content.find('.show-field-slave__item--inline').length > 0){
                                    text_field.find('input').val(content.text().replace(content.find('.show-field-slave__item--inline').text(), ""));
                                }
                                else {
                                    if(content.hasClass('autocomplete_val')){
                                        if(content.find('img').length > 0){
                                            if(content.find('a').length > 0){
                                                text_field.find('input').val(content.find('a').first().attr('data-caption'));
                                            } else if(content.find('span').length > 0){
                                                text_field.find('input').val(content.find('span').first().text());
                                            } else {
                                                text_field.find('input').val(content.text());
                                            }
                                        } else {
                                            text_field.find('input').val(content.text());
                                        }
                                    }
                                    else {
                                        text_field.find('input').val(content.find($('.autocomplete_val')).text());
                                    }
                                }
                            }
                        }
                    }
                }
                content.next().hide();
                content.hide();
                target.hide();
                text_field.show();
                done_btn.show();

                if (additionalFields.length > 0) additionalFields.hide();
                else if (!content.hasClass('autocomplete_val')) content.prev().prev().hide();

                $('.autocomplete__input.autocomplete__input--hidden.hidden-input').css(hiddenInputStyle);
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

    function init_done_buttons_subtable(e) {
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

    window.Subtable = Subtable;

})();
