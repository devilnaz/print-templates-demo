/**
 * Установить значения для select в блоке "Задавать условия" в
 * конструкторе вычислений.
 */
const set_value_to_select = () => {
  $('select[id^=cond_value_]').each((_, item) => {
    if (
      $(item).val() !== null ||
      $(item).attr('ac_val') === $(item).attr('ac_text')
    ) {
      return false;
    }

    $(item).append($('<option>', {
      value: $(item).attr('ac_val'),
      text: $(item).attr('ac_text'),
      selected: true,
    }));
  });
}

/**
 * Заполнить значение select.
 * @param {Object} autocomplete_input
 * @returns
 */
const blur_event_for_input = (autocomplete_input) => {
  const nameAttr = $(autocomplete_input).attr('name');
  if (nameAttr !== undefined) {
    if (nameAttr.indexOf('][params][text]') === '-1') {
      return;
    }
    const num = Number(nameAttr.replace(/[^+\d]/g, ''));
    if (num <= 0) {
      return;
    }

    const select = $(`select[name="cond[${num}][params][val]"]`);
    if (select.val() === null) {
      select.val(select.attr('ac_val'));
    } else if (select.val() !== select.attr('ac_val')) {
      select.attr('ac_val', select.val());
    }
  }
}

var data_list = [];

/**
 * Метод отправляющий запрос и образующий autocomplete
 * @param obj {Element} Объект
 * @param url {String} url, на который отправляется запрос
 * @param by_value {Boolean} Переменная которая указывает, отправлять на сервер индекс значения или само название, если true, то отправляет название
 * @param clear {Boolean} Переменная, которая указывает, нужно ли очищать select перед кликом
 * @param index {Number} индекс объекта
 * @param filter_val {String} Значение поля родительского ac, чтобы формировался url на родительское значение ac
 * @param url_data {Object} Объект, хранящий данные для формирование url
 */
function autocomplete_ajax_request(obj, url, by_value, clear = false, index = 0, filter_val = '', url_data = {}, async = true) {
    //создаём объект URL и добавляем для его корректности рандомного хоста
    let _url = new URL('https://clientbase.ru/' + url);
    if(_url.searchParams.get('q') !== null){
        _url.searchParams.set('q', _url.searchParams.get('q').trim()); //находим параметр с значением, декодируем, удаляем пробелы и кодируем обратно
    }
    url = (_url.pathname + _url.search).slice(1); //собираем url - сам файл и его параметры. slice - чтобы удалить первый слеш

    if (filter_val !== '' && filter_val !== null) {
        url = update_url_by_parent_obj(url_data, filter_val);
    }

    var autocomplete = $(obj).next();
    var autocomplete_input = autocomplete.find($('.autocomplete__input'));

    $.ajax({
        url: url,
        beforeSend: function () {
            var options = $(obj).find($('option'));
            if (clear) {
                const isSubtable = autocomplete.parents('div[id^=sub_cell_]').length > 0;
                const isLinkField = autocomplete.siblings('select[type_field=5]').length > 0;
                var preloader = create_preloader_block('100% !important', '100% !important');

                autocomplete_input.autocomplete('close');
                autocomplete.append(preloader);

                if (isSubtable && isLinkField) {
                    preloader.css('width', preloader.width() - 20);
                }
            }
        },
        async: async,
        success: function (data) {
            var new_data = false;

            if ($(obj).next().has($('.preloader__block')) && clear) {
                $(obj).next().find($('.preloader__block')).remove();
            }

            if (clear) {
                if (data_list[index] !== data) {
                    data_list[index] = data;
                    new_data = true;
                }
            }
            //убрал проверку на new_data. Было: if ((data && new_data && clear) || (!clear && data))
            if ((data && clear) || (!clear && data)) {
                fill_combobox(data, obj, by_value, clear);
            } else {
                autocomplete_input.autocomplete('search', autocomplete_input.val());
            }
        }
    });
}

function resetBackGroundColorMenu() {
    const styleDiv = $('#styleMenuDiv');
    const firstVal = lang.add_new_record; // текст добавления записи в поле связи

    if (styleDiv) {
        styleDiv.remove();
        $('body').append('<div id="styleMenuDiv"></div>');
    }

    $('.ui-menu li.ui-menu-item:first-child div.ui-menu-item-wrapper').each(function (i, item) {
        if ($(item).html() != firstVal) {
            let itemId = $(item).attr('id');
            $('#styleMenuDiv').append(`<style>#${itemId} {background-color: inherit;}</style>`);
        }
    });
}

/**
 * Метод для шаблона создания автокомплита и запросов для получения данных, который используется в динамическом выборе
 * полей (condition)
 * @param selector
 * @param index {Number} index поля автокомплита
 * @param cond_value_link
 * @param cond_field {String}
 * @param table_id {String}
 * @param filter_id {String}
 * @param set_expert
 * @param by_value {Boolean} по какому значению сохранять по id или value, если true, то по value
 */
function create_ac_by_cond(selector, index, cond_value_link, cond_field, table_id, filter_id, set_expert = false, by_value = false, cond_value = '') {
    var obj = $(selector);
    var timeout;
    var url = 'select_value.php?table=' + table_id + '&filter=' + filter_id + '&field=' + cond_field;
    var urlByVal = 'select_value.php?table=' + table_id + '&filter=' + filter_id + '&field=' + cond_field + '&q=' + cond_value_link;
    create_combobox(obj);
    if (typeof cond_value_link !== 'undefined') {
        get_ac_value_from_index(cond_value_link, urlByVal, obj);
    } else {
        obj.next().find($('.autocomplete__input')).val(cond_value);
    }
    var autocomplete = obj.next();
    var input = autocomplete.find($('.autocomplete__input'));
    var autocomplete_btn = input.next();
    autocomplete_ajax_request(obj, urlByVal, by_value, false, index, '', {}, false);
    obj.find($('option')).each(function (i, item) {
        if ($(item).text() === autocomplete.val()) {
            obj.val($(item).val());
        }
    });

    var onAutocompleteClick = function () {
        autocomplete_ajax_request(obj, url, by_value, true, index);
        autocomplete_btn.off('click', onAutocompleteClick);
    };
    input.on('click', onAutocompleteClick);
    autocomplete_btn.on('click', onAutocompleteClick);
    input.on('keyup', function (e) {
        var word = '&q=';
        if (input.val() !== '') {
            word += encodeURIComponent(input.val());
        }
        var url_by_word = 'select_value.php?table=' + table_id + '&filter=' + filter_id + '&field=' + cond_field + word;
        if (e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 27 || e.keyCode === 40 || e.keyCode === 37 ||
            e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 20 || e.keyCode === 13) {
            return;
        }
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            autocomplete_ajax_request(obj, url_by_word, by_value, true, index);
        }, 100);
    });
    if (set_expert) {
        input.on('blur', function () { set_expert(); });
    }
}

/**
 * Метод для формирования url для запроса в зависимых ac
 * @param url_data {Object} объект с данными о поле
 * @param filter {String} значение родительского поля
 * @returns {string} url
 */
function update_url_by_parent_obj(url_data, filter) {
    return 'select_value.php?table=' + url_data.table_id + '&filter=' + url_data.filter_id + '&field=' + url_data.field_id + '&line=' + url_data.line_id + '&filter_value=' + filter;
}

/**
 * Метод очищающий селект
 * @param obj {Element} Объект, который нужно очистить
 */
function clear_select(obj) {
    if (typeof obj !== 'undefined') {
        var options = obj.find('option');
        options.remove();
    }
}

/**
 * Метод заполняющий select для автокомплитера значениями
 * @param data {String} Строка данных
 * @param obj {Element} Элемент, от которого выполняется запрос
 * @param by_value {Boolean} Переменная которая указывает, отправлять на сервер индекс значения или само название, если true, то отправляет название
 * @param clear {Boolean} Переменная, которая указывает, нужно ли очищать select перед кликом
 */
function fill_combobox(data, obj, by_value, clear) {
    var input_exists = true;
    var import_rights = true;

    if (data) {
        var parsed = JSON.parse(data);
    }

    if (clear) {
        clear_select(obj);
    }
    if (!$(obj).next().find($('.autocomplete__input')).length) {
        input_exists = false;
    }
    if (parsed && obj) {
        var typeField = obj.attr('type_field');
        var field_id = obj.attr('field_id');
        var line_id = obj.attr('line_id');
        var isSubtable = false;
        let isRequiredField = 0;

        if (typeof cur_subtable != 'undefined') {
            if (typeof cur_subtable['table_fields'] != 'undefined' && typeof cur_subtable['table_fields'][field_id] != 'undefined') { isSubtable = true; }
        }
        // Для подтаблиц
        if (isSubtable) {
            let sub_filed_id = cur_subtable['table_fields'][field_id]['s_field_id'];
            let sub_filed_table_id = cur_subtable['table_fields'][field_id]['s_table_id'];
            isRequiredField = cur_subtable['table_fields'][field_id]['main'];

            if (typeof obj.attr('import') != 'undefined') {
                import_rights = obj.attr('import') === 'true';
            } else {
                import_rights = checkFieldImportRights(sub_filed_table_id, line_id, sub_filed_id, obj);
            }
        } else { // Для главной таблицы
            if ( $('#fast_edit_cell_' + field_id).length > 0 || $('#fast_edit_span_' + field_id + '_' + line_id).length > 0 || $('#value' + field_id).length > 0 ) {
                let rel_field_id = show_fields ? show_fields['fields'][field_id]['s_field_id'] : allQstTableFields[field_id]['s_field_id'];
                let rel_table_id = show_fields ? show_fields['fields'][field_id]['s_table_id'] : allQstTableFields[field_id]['s_table_id'];
                isRequiredField = show_fields ? show_fields['fields'][field_id]['main'] : allQstTableFields[field_id]['main'];

                if (typeof obj.attr('import') != 'undefined') {
                    import_rights = obj.attr('import') === 'true';
                } else {
                    import_rights = checkFieldImportRights(rel_table_id, line_id, rel_field_id, obj);
                }
            } else {
                if ('undefined' !== typeof fields) {
                    for (let field of Object.keys(fields)) {
                        if (field.id == field_id) {
                            import_rights = checkFieldImportRights(field.s_table_id, line_id, field.s_field_id, obj);
                        }
                    }
                }
            }
        }

        const isAddLinkField = obj.attr('part') === 'add_link_field';

        // Если есть права на импорт в связанном поле, добавляем поле "Добавить новую запись"
        if (import_rights && !isAddLinkField) {
            if (typeField && typeField == 5) {
                var rec_opt = document.createElement('option');
                rec_opt.value = lang.add_new_record;
                rec_opt.innerHTML = lang.add_new_record;
                rec_opt.style.backgroundColor = 'rgb(255, 246, 173)';
                obj.append(rec_opt);
            }
        }

        obj_val = obj.attr('ac_hidden_val');
        option = document.createElement('option');

        // Условия для необязательного заполнения
        if (isRequiredField == 0) {
            option.value = window.location.href.indexOf('edit_group.php') === -1 ? 'null' : '0';
            option.innerHTML = '&nbsp';
            obj.append(option);
        }

        if (parsed.length === 0 || (parsed.length === 1 && parsed[0]['value'] === '' && parsed[0]['result'] === '')) {
            var option = document.createElement('option');
            $(option).addClass('no-data');
            if (typeof lang !== 'undefined') {
                option.innerHTML = lang.No_data;
            } else if (typeof $.datepicker !== 'undefined') {
                if ($.datepicker._defaults.closeText === 'Закрыть') {
                    option.innerHTML = 'Нет данных';
                } else {
                    option.innerHTML = 'No data';
                }
            } else {
                option.innerHTML = 'No data';
            }
            obj.append(option);
        } else {

            { // костыль с пустым option, без него не всегда корректно работает
                var option = document.createElement('option');
              // больше неактуально, если ничего не сломается, то убрать
                obj.append(option);
            }


            parsed.forEach(function (item) {
                var option = document.createElement('option');
                //var trigger = false;
                option.innerHTML = item['result'];
                if (by_value === true) {
                    option.value = item['result'];
                } else {
                    option.value = item['value'];
                }
                if (item['additional'].length > 0) {
                    option.setAttribute('data', item['additional'].join('</br>'));
                }
                if (item['ico'].length > 0) {
                    option.setAttribute('ico', item['ico']);
                }
                obj.append(option);
                // удаляем опцию, если значение равно id(затираем пробелы) и в его потомках значение не равно id
                // сохранение значения по умолчанию
                if (option.value == obj_val) {
                    obj.val(option.value)
                }/* Убрал в рамках задания 67640
                //удаляем опцию, если значение равно id(затираем пробелы)
                if (input_exists) {
                    var input_val = $(obj).next().find($('.autocomplete__input'))[0].value.replace(" ", "");
                    var id = item['value'];
                    var item_result = item['result'];
                    if ( id == input_val && id !== item_result ) {
                        for (var i = 0; i < array.length; i++) {
                            if (id === array[i]) {
                                trigger = true;
                            }
                        }
                        if (!trigger) {
                            option.remove()
                        }
                    }
                }*/

            });
        }
        if (clear) {
            var input = $(obj).next().find($('.autocomplete__input'));
            input.autocomplete("search", '');
        }
    }
}

/**
 * Метод принимающий на вход индекс значения для поля типа связь и устанавливающий результат значения в переданный объект
 * @param index {Number} Индекс значения
 * @param url {String} Ссылка, куда отправляется ajax-запрос
 * @param obj {Element} Объект, которому передается результат
 */
function get_ac_value_from_index(index, url, obj) {
    $.ajax({
        url: url,
        success: function (data) {
            if (data) {
                var parsed = JSON.parse(data);
                parsed.forEach(function (item) {
                    if (item['value'] == index) {
                        const acValue = item['result'].replace(/&quot;/g, '"').replace(/amp;/,'');

                        obj.attr('ac_value', acValue);
                        $(obj).find($(`option[value="${index}"]`)).prop(`selected`, true);
                        var input = obj.next().find($('.autocomplete__input'));
                        if (input.length > 0) {
                            input.val(acValue);
                        }
                        return;
                    }
                });
            }
        }
    });
}

var on_focus_val = '';

/**
 * Метод добавляющий события для autocomplete
 * @param obj {Element} Объект, которому добавляются события
 */
function add_events_autocomplete(obj, combobox) {
    var $obj = $(obj);
    var $combobox = combobox;
    $obj.focus(function () {
        on_focus_val = $obj.val();
    });
    $obj.on('blur', function () {
        var select = $obj.parent().parent().find('select');
        if($obj.attr('id')){
            if($(`#add_link_edit_block${$obj.attr('id').replace('view_value', '')}`).css('display') != 'block'){
                save_view_line_autocomplete($obj);
            }
        }
        else {
            if($(`#add_link_block${select.attr('field_id')}_${select.attr('line_id')}`).css('display') != 'block'){
                save_view_line_autocomplete($obj);
            }
        }

    });
    $obj.on('keyup', function (e) {
        if ($combobox && $combobox.attr('field_id')) {
            var f_id = $combobox.attr('field_id');
            var l_id = $combobox.attr('line_id');
            var word = '&q=';
            if ($obj.val() !== '') {
                word += encodeURIComponent($obj.val());
            }
            var url = 'select_value.php?field=' + f_id + '&line=' + l_id + word;
            if (e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 27 || e.keyCode === 40 || e.keyCode === 37 ||
                e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 20 || e.keyCode === 13) {
                return;
            }
            autocomplete_ajax_request($combobox, url, false, true);
        }
    });
}

/**
 * Метод получающий автокомплит от переданного комбобокса
 * @param combobox
 * @returns {*}
 */
function getAcFromCombobox(combobox) {
    var $combobox = $(combobox);
    var acWrap = $combobox.next();
    var ac = acWrap.find($('.autocomplete__input'));

    return ac;
}

/**
 * Метод, для установки значения в автокомплит
 * @param combobox
 */
function setValueToAc(combobox) {
    var $combobox = $(combobox);
    var val = $combobox.find('option[value="' + $combobox.val() + '"]').text();
    var ac = getAcFromCombobox($combobox);
    ac.val(val);
}

/**
 * Метод, сохраняющий значение autocomplete
 */
function save_view_line_autocomplete(obj) {
    const select = find_select_of_autocomplete(obj);
    if (select.attr('part') === 'add_link_field') {
        return;
    }
    const field_id = select.attr('field_id');
    const line_id = select.attr('line_id');
    const value = select.val();
    const recordSaveBtn = $('#close-edit-button' + field_id); // Кнопка сохранения значения в просмотре записи
    const tableSaveBtn = $('#button-done-' + line_id + '-' + field_id); // Кнопка сохранения значения для полей в таблице/подтаблице

    if (value === lang.add_new_record) {
        displayNotification(lang.No_save_notif, 2);
        obj.css({'background-color': '#ffe0e0', 'color': 'red'});

        return;
    }

    if (obj.hasClass('autocomplete__input--linked')) {
        select.attr('link', `view_line2.php?table=${select.attr('link_table')}&line=${value}`);
    }

    obj.attr('yellow_color', 1);
    obj.css('background-color', 'rgb(255, 246, 173)');

    save_value(field_id, line_id, value);
    select.attr('ac_link_val', value);
    $(`#value${field_id} option`).val(value);
    $(`#value${field_id}`).val(value);
    if (obj.parents($('.fields__cell')).length > 0) {
        /** colorFormat - глобальная переменная */
        if (typeof colorFormat !== 'undefined') {
            colorFormat.setFormatColor({
                lineId: line_id
            });
        }
    }
    if (typeof updateColorFormat === 'function') {
        updateColorFormat(line_id);
    }
    cur_link_field = field_id;
    setTimeout(() => {
        if (recordSaveBtn.length > 0) {
            recordSaveBtn.trigger('click');
        }
        else if (tableSaveBtn.length > 0) {
            tableSaveBtn.trigger('click');
        }
    }, select.attr('subtable_id') ? 0 : 1011);
    setTimeout(() => {
        cur_link_field = null;
    }, 3000);
}

/**
 * Метод, устанавливающий значение для автокомплита при загрузке
 * @param obj {Element}
 */
function install_autocomplete_value(obj) {
    var select_val = obj.attr('ac_value').replace(/&quot;/g, '"');;
    var input = obj.next().find('.autocomplete__input');

    input.val(select_val);
}

function install_combobox_val(obj) {
    obj = $(obj);
    var val = obj.attr('ac_link_val');
    obj.find($('option')).each(function (i, item) {
        var $item = $(item);
        if ($item.val() === val) {
            $item.prop('selected', true);
        }
    });
}

/**
 * Метод, принмающий на вход input и возвращающий select от переданного автокомплитера
 * @param obj {Element} Объект input автокомплитера
 * @return {Element} Объект select автокомплитера
 */
function find_select_of_autocomplete(obj) {
    var parent = obj.parent();
    var select = parent.prev();

    return select;
}

/**
 * Метод, устанавливающий id на autocomplete
 * @param obj
 */
function install_autocomplete_id(obj) {
    if (obj.length > 0) {
        var combobox = obj.parent().prev();
        var id = combobox.attr('ac_id');

        obj.attr('id', id);
    }
}

/**
 * Метод, образуующий autocomplete из select.combobox
 * @param combobox {Element}
 */
function create_combobox(combobox) {
    $.widget("custom.combobox", {
        _create: function () {
            this.wrapper = $("<span>")
                .addClass("autocomplete")
                .insertAfter(this.element);

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },

        _createAutocomplete: function () {
            var selected = this.element.children(":selected"),
                value = selected.val() ? selected.text() : "";
            var style = "";
            if (this.wrapper.prev().hasClass('combobox--hidden')) {
                style = "autocomplete__input autocomplete__input--hidden hidden-input";
            } else {
                style = "autocomplete__input autocomplete__input--bootstrap";
            }

            if (value === "Нет записей") {
                value = "";
            }

            this.input = $("<input>")
                .appendTo(this.wrapper)
                .val(value)
                .addClass(style)
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: $.proxy(this, "_source"),
                    position: {
                        collision: 'flip'
                    }
                })
                .tooltip({
                    classes: {
                        "ui-tooltip": "ui-state-highlight"
                    }
                })
                .on("mousedown", function () {
                    wasOpen = $(this).autocomplete("widget").is(":visible");
                })
                .on("click", function () {
                    $(this).trigger("focus");

                    // Close if already visible
                    if (wasOpen) {
                        return;
                    }

                    // Pass empty string as value to search for, displaying all results
                    $(this).autocomplete("search", "");
                });

            if (this.input.hasClass('autocomplete__input--bootstrap')) {
                this.input.on("focus", function () {
                  $(this).parent().css("box-shadow", "inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 8px rgba(245, 239, 61, .6)");
                })
                .on("blur", function () {
                  $(this).parent().css("box-shadow", "");
                  blur_event_for_input(this);
                });

                // Навешиваем на автокомплиты в расширенном поиске обработчики ошибки по поиску в разных подтаблицах
                if (this.input.parents('.fields__search-bar').length != 0 && !this.input.parent().parent().hasClass('fields__search-cond-item')) {
                    this.input.on('blur', function () {
                        let $this = $(this)

                        // Если ничего не выбрали, то выходим
                        if ($this.val() == " " || $this.val().trim() == "" || $this.val() == '&nbsp;') {
                            return false
                        }

                        let spanAutocomplete = $this.parent()
                        let termSelectOption = spanAutocomplete.next().find('option')

                        if (termSelectOption.length === 0) {
                            $this.css('background-color', '#EF7771')
                            jalert('Нельзя искать по полям разных подтаблиц!')
                        } else {
                            $this.css('background-color', 'inherit')
                        }
                    })
                }
            }


            this._on(this.input, {
                autocompleteselect: function (event, ui) {
                    ui.item.option.selected = true;
                    this._trigger("select", event, {
                        item: ui.item.option
                    });
                    var input = this.input;
                    setTimeout(function () {
                        input.blur();
                    }, 100);

                },

                autocompletechange: "_removeIfInvalid"
            });
        },

        _createShowAllButton: function () {
            var input = this.input,
                wasOpen = false;
            var style = "";
            if (this.wrapper.prev().hasClass('combobox--hidden')) {
                style = "autocomplete__btn autocomplete__btn--hidden";
            } else {
                style = "autocomplete__btn autocomplete__btn--bootstrap";
            }

            $("<a>")
                .attr("tabIndex", -1)
                .tooltip()
                .appendTo(this.wrapper)
                .removeClass("ui-corner-all")
                .addClass(style)
                .on("mousedown", function () {
                    wasOpen = input.autocomplete("widget").is(":visible");
                })
                .on("click", function () {
                    input.trigger("focus");

                    // Close if already visible
                    if (wasOpen) {
                        return;
                    }

                    // Pass empty string as value to search for, displaying all results
                    input.autocomplete("search", "");
                });
        },

        _source: function (request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            response(this.element.children("option").map(function () {
                var text = $(this).text();
                if (this.value && (!request.term || matcher.test(text)))
                    return {
                        label: text,
                        value: text,
                        option: this
                    };
            }));
        },

        _removeIfInvalid: function (event, ui) {

            // Selected an item, nothing to do
            if (ui.item) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
                valueLowerCase = value.toLowerCase(),
                valid = false;
            this.element.children("option").each(function () {
                if ($(this).text().toLowerCase() === valueLowerCase) {
                    this.selected = valid = true;
                    return false;
                }
            });
        },

        _destroy: function () {
            this.wrapper.remove();
            this.element.show();
        }
    });

    combobox.combobox();
    $("#toggle").on("click", function () {
        combobox.toggle();
    });
}

/**
 * Задавание фиксированной ширины для выпадающего меню
 * @private
 */
jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    var li = ul.find($('li'));
    var input = this.element;
    var combobox = input.parent().prev();

    ul.outerWidth(input.outerWidth() + 19);
    var optionPlus = 1;
    if ((combobox.find($('option')).eq(1).val() === 'null') && (!combobox.find($('option')).eq(2).val())) {
        optionPlus = 1;
    } else if ((combobox.find($('option')).eq(1).val() === 'null') && (combobox.find($('option')).eq(2).val())) {
        optionPlus = 0;
    } else if ((combobox.find($('option')).eq(0).val() === 'null') && (combobox.find($('option')).eq(1).val())) {
      optionPlus = 0;
    };

    li.each(function (i, item) {
        var option = combobox.find($('option')).eq(i + optionPlus);
        var data = option.attr('data');
        var ico = option.attr('ico');

        if (typeof ico !== 'undefined') {
            var ico_span = $('<span>')
            ico_span.addClass('ico_span')
            ico_span.append(ico)
            $(item).find($('div')).append(ico_span)
        }

        if (typeof data !== 'undefined') {
            data = data.split('</br>');
            data.forEach(function (row, index) {
                let span = '';
                const imgIdent = '<img';

                if (index === 0 && data[index].indexOf(imgIdent) > -1) {
                    const imgCount = data[0].split(imgIdent).length - 1;

                    if (imgCount > 1) {
                        let newImagesVal = '';
                        let images = data[0].split('>');
                        const firstImg = images[0] + '>';

                        $(item).find($('div')).prepend(firstImg);
                        newImagesVal = images.slice(1).join('>');
                        span = $('<span>');
                        span.addClass('autocomplete__additional-param');
                        span.append(newImagesVal);
                        if (typeof ico !== 'undefined') span.css('margin-left', '35px');
                    } else {
                        $(item).find($('div')).prepend(data[0]);
                    }
                } else {
                    span = $('<span>');
                    span.addClass('autocomplete__additional-param');
                    span.append(row);
                    if (typeof ico !== 'undefined') span.css('margin-left', '35px');
                }
                $(item).find($('div')).append(span);
            });
        }
    });

    // Вырезаем желтые пустые строки
    resetBackGroundColorMenu();
}

$(document).ready(function () {
  create_combobox($('.combobox'));
  set_value_to_select();
});
