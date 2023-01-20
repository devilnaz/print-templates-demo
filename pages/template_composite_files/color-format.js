/**
 * @author Ramil Rakhmatullin <rep555333@gmail.com>
 */

(function () {

    /**
     * Типы цветового форматирования
     * @type {{TABLE: number, SUB_TABLE: number, VIEW_LINE: number}}
     * @const
     */
    var viewTypes = {
        TABLE: 0,
        SUB_TABLE: 1,
        VIEW_LINE: 2
    };

    /**
     * Метод, проверяющий, переданы ли данные над полем типа дата
     * @param condData {Object} Данные с настроек форматирования
     * @returns {boolean}
     * @private
     */
    var _checkForDateCond = function (condData) {
        var result = false;

        if (condData['value'] === "date('Y')"
            || condData['value'] === "date('m')"
            || condData['value'] === "date('W')"
            || condData['value'] === "date('Y-m-d H:i:s')"
            || condData['value'] === "date('Y-m-d')"
            || condData['value'] === "0000-00-00 00:00:00") {
            result = true;
        }

        return result;
    };

    /**
     * Метод, возвращающий две даты для дальнейшего сравнения
     * @param filterVal {string} Значение поля
     * @param condData {Object} Данные с настроек форматирования
     * @returns {array} Если все передано верно, то 0-ой элемент - дата с веденного поля,
     * 1-ый элемент - дата с настроек форматирования
     * @private
     */
    var _getDateCondResult = function (filterVal, condData) {
        var condDateVal = 0;
        var dateNow = new Date();
        var timeData = {
            seconds: 0,
            minutes: 0,
            hours: 0,
            day: 1,
            month: 0,
            year: dateNow.getFullYear()
        };

        timeData.day = dateNow.getDate();
        timeData.month = dateNow.getMonth();
        timeData.hours = dateNow.getHours();
        timeData.minutes = dateNow.getMinutes();
        timeData.month++;

        if (condData['value'] && condData['value'] !== '0000-00-00 00:00:00') {
            if ( !condData['oper'] ) {
                switch (condData['value']) {
                    case "date('Y-m-d')":
                        //парсим значение из ячейки
                        var dateValArray = filterVal.split(' ');
                        var dateValArray1 = dateValArray[0].split('.')

                        if ( timeData.day == parseInt(dateValArray1[0]) && timeData.month == parseInt(dateValArray1[1]) && timeData.year == dateValArray1[2] ) {
                            return [1,1]
                        }
                        break;
                    case "date('Y-m-d H:i:s')":
                        //парсим значение из ячейки
                        var dateValArray = filterVal.split(' ');
                        var dateValArray1 = dateValArray[0].split('.')
                        var dateValArray2 = dateValArray[1].split(':')
                        if ( timeData.day == parseInt(dateValArray1[0]) && timeData.month == parseInt(dateValArray1[1]) && timeData.year == dateValArray1[2] &&  timeData.hours == parseInt(dateValArray2[0]) && timeData.minutes == parseInt(dateValArray2[1]) ) {
                            return [1,1]
                        }
                        break;
                    case "date('W')":
                        var endWeek = moment().endOf('isoweek').format("DD.MM.YYYY").split('.')
                        var startWeek = moment().startOf('isoweek').format("DD.MM.YYYY").split('.')
                        var dateValArray = filterVal.split(' ');
                        var dateValArray1 = dateValArray[0].split('.')

                        if ( (dateValArray1[0] >= startWeek[0] && dateValArray1[0] <= endWeek[0]) && (startWeek[1] == dateValArray1[1] && startWeek[2] == dateValArray1[2]) ) {
                            return [1,1]
                        }
                        break;
                    case "date('m')":
                        //парсим значение из ячейки
                        var dateValArray = filterVal.split(' ');
                        var dateValArray1 = dateValArray[0].split('.')
                        if ( timeData.month == dateValArray1[1] && timeData.year == dateValArray1[2] ) {
                            return [1,1]
                        }
                        break;
                    case "date('Y')":
                        //парсим значение из ячейки
                        var dateValArray = filterVal.split(' ');
                        var dateValArray1 = dateValArray[0].split('.')
                        if ( timeData.year == dateValArray1[2] ) {
                            return [1,1]
                        }
                        break;
                }
            } else  if (condData['oper'] && condData['period'] && condData['interval']) {
                var interval = parseInt(condData['interval']);
                switch (condData['period']) {
                    case 'day':
                        if (condData['oper'] === '+') {
                            timeData.day += interval;
                        } else if (condData['oper'] === '-') {
                            timeData.day -= interval;
                        }
                        break;
                    case 'month':
                        if (condData['oper'] === '+') {
                            timeData.month += interval;
                        } else if (condData['oper'] === '-') {
                            timeData.month -= interval;
                        }
                        break;
                    case 'year':
                        if (condData['oper'] === '+') {
                            timeData.year += interval;
                        } else if (condData['oper'] === '-') {
                            timeData.year -= interval;
                        }
                        break;
                    case 'hour':
                        if (condData['oper'] === '+') {
                            timeData.hours += interval;
                        } else if (condData['oper'] === '-') {
                            timeData.hours -= interval;
                        }
                        break;
                    case 'minute':
                        if (condData['oper'] === '+') {
                            timeData.minutes += interval;
                        } else if (condData['oper'] === '-') {
                            timeData.minutes -= interval;
                        }
                        break;
                }
            }
        } else {
            if (!filterVal) {
                return [0,0]
            }
        }
        var dateValArray = filterVal.split('.');
        if ( dateValArray[2] )
            var dateValArrayWithYear = dateValArray[2].split(' ')

        if ( condData['value'] == "date('Y-m-d')" ) {
            condDateVal = Date.parse(new Date(`${timeData.month}.${timeData.day}.${timeData.year}`));
            var dateVal = parseInt(dateValArray[1]) + '.' + parseInt(dateValArray[0]) + '.' + parseInt(dateValArrayWithYear[0]);
        } else if ( condData['value'] == "date('Y-m-d H:i:s')" ) {
            condDateVal = Date.parse(new Date(`${timeData.month}.${timeData.day}.${timeData.year} ${timeData.hours}:${timeData.minutes}:${timeData.seconds}`));
            var dateValArrayWithTime = dateValArrayWithYear[1].split(':')
            var dateVal = parseInt(dateValArray[1]) + '.' + parseInt(dateValArray[0]) + '.' + parseInt(dateValArrayWithYear[0]) + ' ' + parseInt(dateValArrayWithTime[0]) + ':' + parseInt(dateValArrayWithTime[1]);
        } else {
            condDateVal = Date.parse(new Date(`${timeData.month}.${timeData.day}.${timeData.year} ${timeData.hours}:${timeData.minutes}:${timeData.seconds}`));
            var dateVal = parseInt(dateValArray[1]) + '.' + parseInt(dateValArray[0]) + '.' + parseInt(dateValArray[2]);
        }

        return [Date.parse(new Date(dateVal)), condDateVal];
    };

    /**
     * Проверяет 2 значения на удовлетворения условию(-ям)
     * @param filterData {Object|array} Данные с полей строки
     * @param condData {Object|array} Данные с настроек форматирования
     * @param type {number} Тип, откуда вызывается метод, 0 - таблица, 1 - подтаблица, 2 - просмотр записи
     * @returns {boolean}
     * @private
     */
    var _compareConds = function (filterData, condData, type) {
        var result = false;
        var condVal, filterVal, filterCell;
        if (type === viewTypes.TABLE) {
            filterCell = $(document.getElementById('td' + filterData['lineId'] + '.' + condData['field']));

            if (filterCell.find($('.combobox--hidden')).length > 0) { /** Если поле редактируемое, берем его значение */
                filterVal = filterCell.find($('.combobox--hidden')).val();
            } else if (filterCell.find($('.autocomplete_val')).length > 0) { /** Если поле связь, берем его значение */
                filterVal = filterCell.find($('.autocomplete_val')).attr('autocomplete-val');
            } else if (filterCell.find($('.hidden-input')).length > 0 /** Если поле редактируемое, берем его значение */
                && filterCell.find($('.hidden-input')).css('display') !== 'none') { /** и оно отображено */
                if (filterCell.find($('.hidden-input')).hasClass('fields__multi-val-select-text')) {   /** Сравнение для        */
                    filterVal = filterCell.find($('.fields__multi-val-select-text')).attr('mult-val'); /** множественного выбора*/
                    if (filterCell.find($('.hidden-input')).attr('users') === '0') {  /** Не пользователь, обычный список */
                        if (filterVal) {
                            filterVal = JSON.parse(filterVal).join(',');
                        }
                    }
                } else {
                    filterVal = filterCell.find($('.hidden-input')).val(); /** Обычное редактируемое поле */
                }
            }  else if ((filterCell.find($('.fields__value')).length > 0) /** Если поле обычное */
                || (filterCell.find($('.hidden-input')).length > 0 /** Если поле редактируемое, берем его значение */
                    && filterCell.find($('.hidden-input')).css('display') === 'none')) { /** и оно не отображено */
                if (filterCell.find($('.fields__value')).attr('user-data')) {
                    filterVal = filterCell.find($('.fields__value')).attr('user-data');
                } else if (filterCell.find($('.fields__value a')).length > 0) { /** Если содержит в себе ссылку */
                    filterVal = filterCell.find($('.fields__value a')).text();
                } else { /** Если содержит в себе текст */
                    filterVal = filterCell.find($('.fields__value')).text();
                }
            }
        } else if (type === viewTypes.SUB_TABLE) {
            filterCell = $('#subtable_' + filterData['subtableId'] + '_' + filterData['lineId'] + '_' + condData['field']);

            if (filterCell.find($('.fast_edit_span--multi')).length > 0) {
                if (filterCell.find($('.fast_edit_span--multi').hasClass('fast_edit_span--users'))) {
                    /** Добавляем тире в начале и в конце, потому что данные хранятся в виде "-num-" */
                    filterVal = '-' + filterCell.find($('fast_edit_span--multi')).val() + '-';
                } else {
                    filterVal = filterCell.find($('fast_edit_span--multi')).val();
                }
            } else if (filterCell.find($('[class^="fast_edit_span_"]')).length > 0) {
                if (filterCell.find($('[class^="fast_edit_span_"]')).hasClass('combobox--hidden')) {
                    filterVal = filterCell.find($('[class^="fast_edit_span_"]')).attr('ac_link_val');
                } else {
                    filterVal = filterCell.find($('[class^="fast_edit_span_"]')).val();
                }
            } else if (filterCell.find($('.textpad__value')).length > 0) {
                if (filterCell.find($('.textpad__value')).find($('.subtable__user-not-edit')).length > 0) {
                    filterVal = filterCell
                                    .find($('.textpad__value'))
                                    .find($('.subtable__user-not-edit'))
                                    .attr('user-attr');
                } else {
                    filterVal = filterCell.find($('.textpad__value')).text();
                }
            }
        }

        if (condData['value'] || condData['value'] == "") {
            condVal = condData['value'];
        } else if (condData['value_link']) {
            condVal = condData['value_link'];
        }

        if (filterData && condData && condVal && typeof filterVal !== 'undefined' && filterVal !== null
            && condData['term'] || (filterVal == "" && condVal == "")
        ) {
            var compareValues;
            switch(condData['term'].trim()) {
                case '=':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] === compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal === condVal) {
                        result = true;
                    }
                    break;
                case '!=':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] !== compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal !== condVal) {
                        result = true;
                    }
                    break;
                case '>':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] > compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal > condVal) {
                        result = true;
                    }
                    break;
                case '<':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] < compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal < condVal) {
                        result = true;
                    }
                    break;
                case '>=':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] >= compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal >= condVal) {
                        result = true;
                    }
                    break;
                case '<=':
                    if (_checkForDateCond(condData)) {
                        compareValues = _getDateCondResult(filterVal, condData);
                        if (compareValues.length === 2 && compareValues[0] <= compareValues[1]) {
                            result = true;
                        }
                    } else if (filterVal <= condVal) {
                        result = true;
                    }
                    break;
                case 'like':
                    if (filterVal.indexOf(condVal) + 1) {
                        result = true;
                    }
                    break;
                case 'not like':
                    if (!(filterVal.indexOf(condVal) + 1)) {
                        result = true;
                    }
                    break;
            }
        }

        return result;
    };

    /**
     * Инициализация шрифтовых стилей
     * @param success {Boolean} Удовлетворения условию форматирования
     * @param item {jQuery} Элемент, на который устанавливать стили
     * @param condData {Object|array} Данные с настроек форматирования
     * @private
     */
    var _initTableFontStyle = function (success, item, condData) {
        if (success) {
            if (condData['font_style'] && condData['font_style'].length === 4) {
                if (condData['font_style'][0] === '1') {
                    item.addClass('bold');
                } else {
                    item.removeClass('bold');
                }
                if (condData['font_style'][1] === '1') {
                    item.addClass('italic');
                } else {
                    item.removeClass('italic');
                }
                if (condData['font_style'][2] === '1') {
                    item.addClass('underline');
                } else {
                    item.removeClass('underline');
                }
                if (condData['font_style'][3] === '1') {
                    item.addClass('line-through');
                } else {
                    item.removeClass('line-through');
                }
            }
            if (condData['font_color']) {
                item.css('color', condData['font_color']);
                if (item.find($('a'))) {
                    item.find($('a')).css('color', condData['font_color']);
                }
            }
            if ( condData['txt_color'] ) {
                item.find('.fields__cell-inner').css('background-color', condData['txt_color']);
                item.find('.fields__select-formatter').css('background-color', condData['txt_color']);
            }
        } else {
            if (condData['font_style'] && condData['font_style'].length === 4) {
                item.removeClass('line-through underline italic bold');
            }
            if (condData['font_color']) {
                item.css('color', '');
                if (item.find($('a'))) {
                    item.find($('a')).css('color', '');
                }
            }
            if ( condData['txt_color'] ) {
                item.find('.fields__cell-inner').css('background-color', '')
                item.find('.fields__select-formatter').css('background-color', '')
            }
        }
    };

    /**
     * Метод, отвечает за проверку на удовлетворения условий форматирования и
     * за отрисовку фонов и стилей для шрифтов
     * @param fieldData {Object|array} Данные с полей строк
     * @param data {Object|array} Данные с настроек форматирования
     * @param type {number} Тип, откуда вызывается метод, 0 - таблица, 1 - подтаблица, 2 - просмотр записи
     * @private
     */
    var _initFormatColor = function (fieldData, data, type) {
        var changed = false;
        data.forEach(function (row) {
            var success = false;
            /** Проверка предыдущего условия, стоит ли в пред условии `and` */
            var condAnd = false;
            if (row['cond_set_unserialize'] && typeof row['cond_set_unserialize'] === 'object') {
                /** Находим, удовлетворяет ли форматирование заданное условие */
                for (var cond_key in row['cond_set_unserialize']) {
                    var cond = row['cond_set_unserialize'][cond_key];
                    if(((parseInt(cond_key) > 1 && success && condAnd)
                            || !condAnd) && _compareConds(fieldData, cond, type)) {
                        success = true;
                        if (success && cond['union'].trim() !== 'and') {
                            break;
                        }
                    } else {
                        success = false;
                    }
                    condAnd = (cond['union'] && cond['union'].trim() === 'and');
                }
                /** Форматирование на всю строку */
                if (row['target'] && typeof row['bg_color'] !== 'undefined') {
                    var bgColor = (success) ? (row['bg_color']) ? row['bg_color'] : '#ffffff' : '#ffffff';
                    var txtColor = (success) ? (row['txt_color']) ? row['txt_color'] : '#ffffff' : '#ffffff';
                    if ((success && changed) || !changed) {
                        if (parseInt(row['target']) === 0) {
                            var tableRow, tableCells;
                            if (type === viewTypes.TABLE) {
                                tableRow = $('#tr' + fieldData['lineId']);
                                tableCells = tableRow.find($('.fields__cell'));
                                tableRow.find($('.fields__cell--checkbox div'))
                                    .css('background-color', bgColor);
                                tableCells.find('.fields__cell-inner').css('background-color', txtColor)
                            } else if (type === viewTypes.SUB_TABLE) {
                                tableRow = $('#subtable_' + fieldData['subtableId'] + '_line_' + fieldData['lineId']);
                                tableCells = tableRow.find($('.subtable__cell'));
                            }
                            _initTableFontStyle(success, tableCells, row);
                            tableCells.each(function (index, cell) {
                                var $cell = $(cell);
                                $cell.css({
                                    'background-color': bgColor
                                });
                                $cell.find('.fields__cell-inner').css('background-color', txtColor)
                                /** prevColor - Глобальная переменная */
                                if (type === viewTypes.TABLE && prevColor) {
                                    prevColor[fieldData['lineId']][$cell.attr('field_id')] = bgColor;
                                }
                            });
                        } else {
                            var tableCell;
                            if (type === viewTypes.TABLE) {
                                tableCell = $(document.getElementById('td' + fieldData['lineId'] + '.' + row['target']));
                                /** prevColor - Глобальная переменная */
                                if (prevColor) {
                                    prevColor[fieldData['lineId']][tableCell.attr('field_id')] = bgColor;
                                }
                            } else if (type === viewTypes.SUB_TABLE) {
                                tableCell = $('#subtable_' + fieldData['subtableId'] + '_' + fieldData['lineId'] + '_' + row['target']);
                            }
                            _initTableFontStyle(success, tableCell, row);
                            tableCell.css({
                                'background-color': bgColor
                            });
                            tableCell.find('.fields__cell-inner').css('background-color', txtColor)
                        }
                    }
                    if (success) {
                        changed = true;
                    }
                }
            }
        });
    };

    /**
     * Цветовое форматирование таблицы
     * @param data {array|object}
     * @param fieldData {object}
     * @private
     */
    var _getFormatTable = function (data, fieldData) {
        if (data && typeof data === 'object'
            && fieldData && typeof fieldData === 'object'
            && fieldData['lineId']) {
            _initFormatColor(fieldData, data, viewTypes.TABLE);
        }
    };

    /**
     * Цветовое форматирование подтаблицы
     * @param data {array|object}
     * @param fieldData {array|object}
     * @private
     */
    var _getFormatSubTable = function (data, fieldData) {
        if (data && typeof data === 'object'
            && fieldData && typeof fieldData === 'object'
            && fieldData['lines'] && fieldData['lines'].length > 0) {
            fieldData['lines'].forEach(function (lineId) {
                _initFormatColor({
                    lineId: lineId,
                    subtableId: fieldData['subtable_id']
                }, data, viewTypes.SUB_TABLE);
            });
        }
    };

    /**
     * Цветовое форматирование просмотра записи
     * @param data {array|object}
     * @private
     */
    var _getFormatViewLine = function (data) {

    };

    /**
     * Метод, возвращающий функцию для цветового форматирования
     * @param type
     * @returns {func}
     * @private
     */
    var _getFormatFunc = function (type) {
        var func;

        switch (type) {
            case viewTypes.TABLE:
                func = _getFormatTable;
                break;
            case viewTypes.SUB_TABLE:
                func = _getFormatSubTable;
                break;
            case viewTypes.VIEW_LINE:
                func = _getFormatViewLine;
                break;
            default:
                func = function () {

                };
        }

        return func;
    };

    /**
     * Метод, возвращает данные для запроса
     * @param type
     * @param table
     * @returns {Object}
     * @private
     */
    var _getUrlData = function (type, table) {
        var data;

        switch (type) {
            case viewTypes.TABLE:
                data = {
                    get_fields_format: '',
                    table: table
                };
                break;
            case viewTypes.SUB_TABLE:
                data = {
                    get_fields_format: '',
                    table: table
                };
                break;
            case viewTypes.VIEW_LINE:
                data = {

                };
                break;
            default:
                data = {

                };
        }

        return data;
    };

    /**
     * Конструктор для работы с динамческим цветовым форматированием
     * @param {number} type | 0 - Таблица, 1 - Подтаблица, 2 - Просмотр записи
     * @param table
     * @constructor
     */
    var ColorFormat = function (type, table) {
        this.table = parseInt(table);
        this.viewType = type;
        /**
         * Адрес для запроса на цветовое форматирование
         * @type {string}
         * @const
         */
        this.URL = 'update_value.php';
        /**
         * Параметры для адреса запроса
         * @type {Object}
         */
        this.urlData = _getUrlData(this.viewType, this.table);
        this.formatData = null;
        this.calcColorFormat = _getFormatFunc(this.viewType);
    };

    ColorFormat.prototype.setFormatColor = function (data) {
        var isRow = false;
        var rowBgColor = '';
        var url = this.URL;
        var urlData = this.urlData;

        if (this.formatData) {
            this.calcColorFormat(this.formatData, data);
        } else {
            /*
            viewType = 0 - таблица
            viewType = 1 - подтаблица
             */
            if ( this.viewType == 0 ) { // Таблица
                //добавляем в атрибуты запроса линию
                const lineId = data.lineId;
                //аякс запрос для каждой строки вида: update_value.php?get_fields_format=&table=150&line=1
                $.ajax({
                    url: `${url}?get_fields_format&table=${urlData.table}&line=${lineId}`,
                    success: function (resp) {
                        var format = JSON.parse(resp);

                        //inherit объект для css
                        var inheritCss = {
                            'backgroundColor': 'inherit',
                            'color': 'inherit',
                            'font-weight': 'inherit',
                            'font-style': 'inherit',
                            'text-decoration': 'inherit',
                        }

                        //дефолтный объект для css
                        var defaultCss = {
                            'backgroundColor': '',
                            'color': '',
                            'font-weight': 'normal',
                            'font-style': 'normal',
                            'text-decoration': '',
                        }

                        //обнуляем все ячейки
                        $(`#tr${lineId}`).css(defaultCss);
                        $(`#tr${lineId} .fields__cell`).css(defaultCss);
                        $(`#tr${lineId} a`).css(defaultCss);
                        $(`#tr${lineId} .custom-checkbox__wrap`).parent().css(defaultCss);
                        $(`#tr${lineId} .custom-checkbox__wrap`).parents('.fields__cell').children().css(defaultCss);
                        $(`#tr${lineId} .fields__cell-inner`).css(inheritCss);
                        $(`#tr${lineId} .fields__cell`).attr('title', '');

                        $(`#tr${lineId}`).find($('.fields__cell--checkbox div')).css(inheritCss);
                        //если пришел не пустой ответ, значит строка подвергается форматированию
                        if ( format.length != 0 ) {
                            $('#bg' + lineId).val('');
                            for(let key in prevColor[parseInt(lineId)]){
                                prevColor[parseInt(lineId)][key] = '';
                            }
                            format.forEach(function (format) {
                                /*
                                font_style параметр имеет вид 0100, где каждый элемент может быть либо 0 либо 1, в зависимости от того включен он или нет в редактировании форматирования
                                первый это bold, второй italic, третий underline, четвертый line-through
                                 */
                                var bold = ( format['font_style'][0] == "1" ) ? "bold": "normal";
                                var italic = ( format['font_style'][1] == "1" ) ? "italic": "normal";
                                var textDecoration = "";
                                //если оба включены, то надо записать подряд через пробел для css
                                if ( format['font_style'][2] == "1" ) {
                                    textDecoration += "underline ";
                                }

                                if ( format['font_style'][3] == "1" ) {
                                    textDecoration += "line-through";
                                }

                                // Форматируем без выделения текста
                                // объект для css
                                var styleObj = {
                                    'color': format['font_color'],
                                    'font-weight': bold,
                                    'font-style': italic,
                                    'text-decoration': textDecoration,
                                    'background-color': format['bg_color'],
                                }

                                if(format['bg_color'] != 'rgba(0, 0, 0, 0)' && format['bg_color'] != ''){
                                    styleObj['background-color'] = format['bg_color'];
                                }

                                //если target = 0, то это для всей строки, если там id, то применятся к конкретной ячейке в этой линии
                                if ( format['target'] == "0" ) {
                                    $('#bg' + lineId).val(format['bg_color']);
                                    for(let key in prevColor[parseInt(lineId)]){
                                        prevColor[parseInt(lineId)][key] = format['bg_color'];
                                    }
                                    //чтобы ячейки внутри строк наследовали форматирование строки, у них есть свое иначе
                                    $(`#tr${lineId} .fields__cell`).css(styleObj);
                                    $(`#tr${lineId} .fields__cell`).attr('title', format['help']);
                                    $(`#tr${lineId} .custom-checkbox__wrap`).parent().css(styleObj);
                                    $(`#tr${lineId}`).find($('.fields__cell--checkbox div')).css(styleObj);
                                } else {
                                    if(format.length == 1){
                                        $('#bg' + lineId).val('#fff');
                                    }

                                    for(let key in prevColor[parseInt(lineId)]){
                                        if(key == format['target']){
                                            prevColor[parseInt(lineId)][key] = format['bg_color'];
                                        }
                                    }
                                    $(`#tr${lineId} .fields__cell[field_id=${format['target']}]`).css(styleObj);
                                    $(`#tr${lineId} .fields__cell[field_id=${format['target']}]`).attr('title', format['help']);

                                    // Условие в таблице для полей связь
                                    let fieldRelation = $(`#tr${lineId} .fields__cell[field_id=${format['target']}] .fields__simple-text--link .sub-slave_fields`);
                                    if (fieldRelation.length == 0) {
                                      $(`#tr${lineId} .fields__cell[field_id=${format['target']}] .sub-slave_fields`).css(styleObj);
                                    }
                                }

                                // В зависимости от того, есть ли выделение текста
                                if ( format['txt_color'] !== "NULL" ) {
                                    let txtColor = {
                                        'background-color': format['txt_color']
                                    }

                                    //если target = 0, то это для всей строки, если там id, то применятся к конкретной ячейке в этой линии
                                    if ( format['target'] == "0" ) {
                                        //чтобы ячейки внутри строк наследовали форматирование строки, у них есть свое иначе
                                        $(`#tr${lineId} .fields__cell-inner`).each(function(i, cell) {
                                            // const fieldVal = $(cell).find('[id^=fast_edit_span_]').val();

                                            // if (fieldVal && fieldVal != '') {
                                                $(cell).css(txtColor);
                                            // }
                                        });
                                    } else {
                                        $(`#tr${lineId} .fields__cell[field_id=${format['target']}] .fields__cell-inner`).each(function(i, elem) {
                                          if (!$(elem).children('.fields__select-formatter')[0]) {
                                            $(elem).css(txtColor);
                                          } else if ($(elem).children('.fields__select-formatter')[0]) {
                                            $(elem).children('.fields__select-formatter').css(txtColor);
                                          }
                                        });
                                    }
                                }
                            });
                            createPrevColorArr();
                        }
                        else {
                            $('#bg' + parseInt(lineId)).val('');
                            for(let key in prevColor[parseInt(lineId)]){
                                prevColor[parseInt(lineId)][key] = '';
                            }
                        }
                    }
                })
            } else if ( this.viewType == 1 ) { // Подтаблица
                //бежим по массиву строк
                data['lines'].forEach(function (item, i, arr) {
                    //добавляем в атрибуты запроса линию
                    if (!Number.isInteger(parseInt(item))) { item = -1; }
                    urlData.line = item;
                    //аякс запрос для каждой строки вида: update_value.php?get_fields_format=&table=150&line=1
                    $.ajax({
                        url: url,
                        data: urlData,
                        success: function (resp) {
                            var format = JSON.parse(resp);
                            rowBgColor = '';

                            //inherit объект для css
                            var inheritCss = {
                                'color': 'inherit',
                                'font-weight': 'inherit',
                                'font-style': 'inherit',
                                'text-decoration': 'inherit',
                            }

                            //дефолтный объект для css
                            var defaultCss = {
                                'backgroundColor': 'white',
                                'color': '',
                                'font-weight': 'normal',
                                'font-style': 'normal',
                                'text-decoration': '',
                            }

                            var defaultCssSubtable = {
                                'backgroundColor': '',
                                'color': '',
                                'font-weight': 'normal',
                                'font-style': 'normal',
                                'text-decoration': '',
                            }

                            //обнуляем все ячейки
                            $(`#subtable_${data['subtable_id']}_line_${item} td`).css(defaultCss);
                            $(`#subtable_${data['subtable_id']}_line_${item} td input`).css(defaultCss);
                            $(`#subtable_${data['subtable_id']}_line_${item} td select`).css(defaultCss);
                            $(`#subtable_${data['subtable_id']}_line_${item} td .sub-slave_fields`).css(defaultCssSubtable);
                            $(`#subtable_${data['subtable_id']}_line_${item} td`).removeAttr('title');

                            //если пришел не пустой ответ, значит строка подвергается форматированию
                            if ( format.length != 0 ) {
                                format.forEach(function (format) {
                                    /*
                                    font_style параметр имеет вид 0100, где каждый элемент может быть либо 0 либо 1, в зависимости от того включен он или нет в редактировании форматирования
                                    первый это bold, второй italic, третий underline, четвертый line-through
                                     */
                                    var bold = ( format['font_style'][0] == "1" ) ? "bold": "normal";
                                    var italic = ( format['font_style'][1] == "1" ) ? "italic": "normal";
                                    var textDecoration = ""
                                    //если оба включены, то надо записать подряд через пробел для css
                                    if ( format['font_style'][2] == "1" ) {
                                        textDecoration += "underline ";
                                    }

                                    if ( format['font_style'][3] == "1" ) {
                                        textDecoration += "line-through";
                                    }

                                    //объект для css
                                    var styleObj = {
                                        'color': format['font_color'],
                                        'font-weight': bold,
                                        'font-style': italic,
                                        'text-decoration': textDecoration
                                    }

                                    if(format['bg_color'] != 'rgba(0, 0, 0, 0)' && format['bg_color'] != '') {
                                        styleObj['backgroundColor'] = format['bg_color'];
                                    }

                                    if ( format['txt_color'] !== "NULL" ) {
                                        let txtColor = {
                                            'backgroundColor': format['txt_color'],
                                            'min-width': '51px',
                                            'border-radius': '4px',
                                            'border': 'none',
                                        }

                                        let fontColor = {
                                            'color': format['font_color'],
                                        }

                                        let notEditField = {
                                            'padding': '5px',
                                            'text-align': 'right',
                                        }

                                        let linkColorStyle = {
                                            'color': format['font_color'],
                                            'padding': '5px',
                                        }

                                        let focusLinkFields = {
                                            'backgroundColor': '',
                                            'color': 'black',
                                            'min-width': '50px',
                                            'border-radius': '4px',
                                        }

                                        let hiddenInputStyle = {
                                            'border': '1px dotted rgba(0, 0, 0, 0)',
                                            'border-right': 'none',
                                        }

                                        let focusToLink = {
                                            'color': '',
                                            'text-decoration': '',
                                        }

                                        let autocompleteLink = {
                                            'backgroundColor': 'white',
                                            'margin-left': 0,
                                            'border': '1px solid white',
                                            'color': '#000',
                                        }

                                        let simpleLinksCss = {
                                            'color': 'blue',
                                            'textDecoration': 'underline',
                                            'padding': 0,
                                            'backgroundColor': '',
                                        }

                                        let linkCss = {
                                            'color': 'blue',
                                            'textDecoration': 'underline',
                                            'backgroundColor': '',
                                            'min-width': '50px',
                                            'border-radius': '4px',
                                        }

                                        let whiteText = {
                                            'color': 'white',
                                        }

                                        let formatTextColor = {
                                            'color': format['font_color'],
                                        }

                                        let formatBackground = {
                                            'background-color': format['txt_color'],
                                        }

                                        let notBg = {
                                            'backgroundColor': '',
                                        }

                                        let whiteBackground = {
                                            'background-color': 'white',
                                        }

                                        let whiteBorder = {
                                            'border': '1px solid white',
                                        }

                                        let hiddenAutcompleteInput = {
                                            'background-color': 'white',
                                            'border-radius': 0,
                                            'padding': '5px',
                                        }

                                        //если target = 0, то это для всей строки, если там id, то применятся к конкретной ячейке в этой линии
                                        if (format['target'] == "0") {
                                            isRow = true;
                                            rowBgColor = format['bg_color'];

                                            //чтобы ячейки внутри строк наследовали форматирование строки, у них есть свое иначе
                                            $(`#subtable_${data['subtable_id']}_line_${item}`).css(styleObj);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td`).css(styleObj);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td`).attr('title', format['help']);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td.subtable__cell.subtable__cell-1`).css(styleObj);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td input`).css(txtColor);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td select`).css(txtColor);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td a:not(.autocomplete__btn):not(.btn-view):not(.btn-drop)`).css(linkCss);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td input:not([part=add_link_field])`).css(txtColor);

                                            // $(`#subtable_${data['subtable_id']}_line_${item} td .textpad__value .subtable_fields--not_edit`).parent().css(notEditField).css(styleObj);
                                            $(`#subtable_${data['subtable_id']}_line_${item} td .textpad__value`).children().each(function (i, item) {
                                                $item = $(item);
                                                nodeName = $item.prop('nodeName');

                                                // Отдельно проверяем поля с селектами; при наведении делаем цвета по умолчанию
                                                if (nodeName === 'SELECT') {
                                                    if ($item.val() && $item.val() != 0) {
                                                        $item.mouseout(function () {
                                                            $(this).css(styleObj).css(txtColor).css(formatTextColor);
                                                        });
                                                        $item.change(function () {
                                                            $(this).blur();
                                                        });
                                                        $item.css(styleObj).css(txtColor).css(fontColor);
                                                    } else {
                                                        $item.css(styleObj).css(txtColor).css(fontColor);
                                                        $item.mouseout(function () {
                                                            $(this).css('background-color', '');
                                                        });
                                                    }
                                                    $item.mouseover(function () {
                                                        $(this).css(focusLinkFields);
                                                    });
                                                } else {
                                                    if ($item.val() || $item.text() || $item.val().length > 0) $item.css(styleObj).css(txtColor).css(fontColor);

                                                    // Отдельно обрабатываем ссылки (у полей типа Связь)
                                                    if (nodeName === 'A' &&
                                                            !$item.hasClass('autocomplete__btn') &&
                                                            !$item.hasClass('btn-view') &&
                                                            !$item.hasClass('btn-drop')
                                                        ) {
                                                        $item.css(styleObj).css(txtColor).css(linkColorStyle);
                                                        $item.mouseout(function () {
                                                            $(this).css(styleObj).css(txtColor).css(linkColorStyle);
                                                        });
                                                        $item.mouseover(function () {
                                                            $(this).css(focusLinkFields).css(focusToLink);
                                                        });
                                                    }

                                                    // Поля для обычного ввода текста
                                                    if (nodeName === 'INPUT') {
                                                        $item.mouseout(function () {
                                                            $(this).css(styleObj).css(formatBackground);
                                                        });
                                                        $item.mouseover(function () {
                                                            $(this).css(defaultCss);
                                                        });
                                                        $item.focus(function() {
                                                            $(this).css(defaultCss).mouseout(function() {
                                                                $(this).css(styleObj).css(formatBackground);
                                                            });
                                                        });
                                                        $item.change(function() {
                                                            $(this).blur();
                                                        });
                                                        $item.blur(function() {
                                                            $(this).css(styleObj).css(formatBackground);
                                                        });
                                                    }

                                                    // Изменение цветового форматирования для полей связи, у которых доступно быстрое редактирование
                                                    if (nodeName === 'SPAN' && $item.find('.autocomplete__input--hidden').length > 0 &&
                                                        !$item.hasClass('textpad__value--text')) {
                                                        let hiddenInput = $($item.find('.autocomplete__input--hidden')[0]);
                                                        hiddenInput.mouseover(function () {
                                                            $(this).css(hiddenAutcompleteInput).css(hiddenInputStyle);
                                                            $(this).siblings('.autocomplete__btn--hidden')
                                                                .css(autocompleteLink).css(whiteBackground)
                                                                .mouseover(function () {
                                                                    hiddenInput.css(hiddenAutcompleteInput).css(hiddenInputStyle);
                                                                    $(this).css(autocompleteLink);
                                                                })
                                                                .mouseout(function () {
                                                                    $(this).css('background-color', 'white');
                                                                    $(this).css(whiteBorder);
                                                                });
                                                        })
                                                            // Изменение значения в поле связи
                                                            .blur(function () {
                                                                let autocompleteBtn = $(this).siblings('.autocomplete__btn--hidden');

                                                                autocompleteBtn.css('display', 'none');
                                                                $('.fields__fast-edit-button--edit').click(function () {
                                                                    autocompleteBtn.css('display', '').css(notBg);
                                                                    hiddenInput.css(focusLinkFields).css(focusToLink);
                                                                });
                                                            });
                                                    }

                                                    // Для полей связи, у которых не доступно ред-ние
                                                    if (nodeName === 'SPAN' && $item.find('.sub-slave_fields').length > 0){
                                                        $item.find('.sub-slave_fields').css(styleObj).css(txtColor).css(fontColor);
                                                    }

                                                    // Отдельно обрабатываем div-блоки
                                                    if (nodeName === 'DIV' && !$item.hasClass('user-data__value--add')) {
                                                        $($item.find('.autocomplete_val')[0]).css(styleObj);
                                                        $item.css(styleObj).css(txtColor).css(fontColor);
                                                    }

                                                    if ($item.find('input').first().hasClass('datetimepicker') || $item.find('input').first().hasClass('datepicker')) {
                                                        $item.find('input').first().css(styleObj).css(txtColor).css(fontColor);
                                                    }

                                                    $('.sub_fast_edit_file_url').removeAttr('style');
                                                    $('.sub_fast_edit_file_url_hover').removeAttr('style');
                                                }
                                            });
                                        // форматирование определенной ячейки
                                        } else {
                                            $(`#subtable_${data['subtable_id']}_${item}_${format['target']}`).attr('title', format['help']);
                                            if (format['bg_color'] == '') {
                                                if(!isRow) { // Если было фрматирование сначала для всей строки, а затем для ячейки
                                                    $(`#subtable_${data['subtable_id']}_${item}_${format['target']}`).parent('tr').css(styleObj).css('background-color', rowBgColor);
                                                    $(`#subtable_${data['subtable_id']}_${item}_${format['target']}`).css('background-color', 'inherit');
                                                }
                                            } else {
                                                $(`#subtable_${data['subtable_id']}_${item}_${format['target']}`).css(styleObj);
                                            }

                                            isRow = false;
                                            $(`#subtable_${data['subtable_id']}_${item}_${format['target']} input`).css(txtColor);
                                            $(`#subtable_${data['subtable_id']}_${item}_${format['target']} a:not(.autocomplete__btn):not(.btn-view):not(.btn-drop)`).css(linkCss);
                                            $(`#subtable_${data['subtable_id']}_${item}_${format['target']} .textpad__value`).children().each(function (i, item) {
                                                $item = $(item);
                                                nodeName = $item.prop('nodeName');

                                                // Отдельно проверяем поля с селектами; при наведении делаем цвета по умолчанию
                                                if (nodeName === 'SELECT') {
                                                    if ($item.val() && $item.val() != 0) {

                                                        $item.css(styleObj).css(txtColor).css(fontColor);

                                                        if ($item.css('background-color') != 'rgba(0, 0, 0, 0)') {

                                                          $item.css('background-color', '');

                                                          $item.wrap('<span class="subtable__select-wrapper--formatter"></span>');
                                                          $item.before('<span class="subtable__select-formatter"></span>');
                                                          $item.css('position', 'relative');


                                                          function width_select_subtable(select) {

                                                            let $selectGround = select.prev();

                                                            let $optionSelectText = select.find('option:selected').text();

                                                            if ($optionSelectText == '') {
                                                              $selectGround.css('background-color', '');
                                                            } else {
                                                              $selectGround.css('background-color', txtColor.backgroundColor);

                                                              let $tempSelect = $('<select>')
                                                                                .append('<option>' + $optionSelectText +'</option>');
                                                              $tempSelect.css({'display': 'none', 'opacity': 0});
                                                              select.parent().append($tempSelect);

                                                              $selectWidth = select.width();
                                                              $tempSelectWidth = $tempSelect.width();

                                                              if ($selectWidth < $tempSelectWidth) {
                                                                $selectGround.width($selectWidth);
                                                              } else {
                                                                $selectGround.width($tempSelectWidth);
                                                              }

                                                              $tempSelect.remove();
                                                            };
                                                          };

                                                          width_select_subtable($item);
                                                        };

                                                        $item.mouseout(function () {
                                                          $(this).css(styleObj).css(txtColor).css(formatTextColor).css('background-color', '');
                                                        });
                                                        $item.change(function () {
                                                          width_select_subtable($(this));
                                                          $(this).blur();
                                                        });
                                                        $item.blur(function () {
                                                          $(this).css(styleObj).css(txtColor).css(formatTextColor).css('background-color', '');
                                                        });

                                                    } else {
                                                        $item.mouseout(function () {
                                                            $(this).css('background-color', '');
                                                        });
                                                    }

                                                    $item.mouseover(function () {
                                                        $(this).css(focusLinkFields);
                                                    });
                                                } else {
                                                    if (($item.val() || $item.text() || $item.val().length > 0) && !($item.hasClass('subtable__select-wrapper--formatter'))) $item.css(styleObj).css(txtColor).css(fontColor);

                                                    // Отдельно обрабатываем ссылки (у полей типа Связь)
                                                    if (nodeName === 'A' &&
                                                            !$item.hasClass('autocomplete__btn') &&
                                                            !$item.hasClass('btn-view') &&
                                                            !$item.hasClass('btn-drop')
                                                        ) {
                                                        $item.css(styleObj).css(txtColor).css(linkColorStyle);
                                                        $item.mouseout(function () {
                                                            $(this).css(styleObj).css(txtColor).css(linkColorStyle);
                                                        });
                                                        $item.mouseover(function () {
                                                            $(this).css(focusLinkFields).css(focusToLink);
                                                        });
                                                    }

                                                    // Поля для обычного ввода текста
                                                    if (nodeName === 'INPUT') {
                                                        $item.mouseout(function () {
                                                            $(this).css(styleObj).css(formatBackground);
                                                        });
                                                        $item.mouseover(function () {
                                                            $(this).css(defaultCss);
                                                        });
                                                        $item.focus(function() {
                                                            $(this).css(defaultCss).mouseout(function() {
                                                                $(this).css(styleObj).css(formatBackground);
                                                            });
                                                        });
                                                        $item.change(function() {
                                                            $(this).blur();
                                                        });
                                                        $item.blur(function() {
                                                            $(this).css(styleObj).css(formatBackground);
                                                        });
                                                    }

                                                    // Изменение цветового форматирования для полей связи, у которых доступно быстрое редактирование
                                                    if (nodeName === 'SPAN' && $item.find('.autocomplete__input--hidden').length > 0 &&
                                                        !$item.hasClass('textpad__value--text')) {

                                                        let hiddenInput = $($item.find('.autocomplete__input--hidden')[0]);
                                                        hiddenInput.mouseover(function () {
                                                            $(this).css(hiddenAutcompleteInput).css(hiddenInputStyle);
                                                            $(this).siblings('.autocomplete__btn--hidden')
                                                                .css(autocompleteLink).css(whiteBackground)
                                                                .mouseover(function () {
                                                                    hiddenInput.css(hiddenAutcompleteInput).css(hiddenInputStyle);
                                                                    $(this).css(autocompleteLink);
                                                                })
                                                                .mouseout(function () {
                                                                    $(this).css('background-color', 'white');
                                                                    $(this).css(whiteBorder);
                                                                });
                                                        })
                                                            // Изменение значения в поле связи
                                                            .blur(function () {
                                                                let autocompleteBtn = $(this).siblings('.autocomplete__btn--hidden');

                                                                autocompleteBtn.css('display', 'none');
                                                                $('.fields__fast-edit-button--edit').click(function () {
                                                                    autocompleteBtn.css('display', '').css(notBg);
                                                                    hiddenInput.css(focusLinkFields).css(focusToLink);
                                                                });
                                                            });
                                                    }

                                                    // Отдельно обрабатываем div-блоки
                                                    if (nodeName === 'DIV') {
                                                        $item.css(styleObj).css(txtColor).css(fontColor);
                                                    }

                                                    if ($item.find('input').first().hasClass('datetimepicker')) {
                                                        $item.find('input').first().css(styleObj).css(txtColor).css(fontColor);
                                                    }

                                                    $('.sub_fast_edit_file_url').removeAttr('style');
                                                    $('.sub_fast_edit_file_url_hover').removeAttr('style');
                                                }
                                            });
                                        }
                                    }
                                })
                            } else { // Снятие цветового форматирования
                                let autocompleteButton = $('.autocomplete__btn.autocomplete__btn--hidden');
                                let linksCss = {
                                    'color': 'blue',
                                    'textDecoration': 'underline',
                                    'backgroundColor': '',
                                    'border-radius': '4px',
                                }

                                let clearBackground = {
                                    'background-color': '',
                                }

                                let whiteBackground = {
                                    'background-color': 'white',
                                }

                                let noneMargin = {
                                    'margin': 0,
                                }

                                $(`td[id^=subtable_${data['subtable_id']}_${item}_]`).parent('tr').css(clearBackground);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_]`).css(defaultCssSubtable).css(clearBackground);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_] input`).css(defaultCssSubtable);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_] a:not(.autocomplete__btn):not(.btn-view):not(.btn-drop)`).css(linksCss);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_] .textpad__value .subtable_fields--not_edit`).parent().css(defaultCssSubtable);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_] .textpad__value .subtable_fields--not_edit_field`).parent().css(defaultCssSubtable);
                                $(`td[id^=subtable_${data['subtable_id']}_${item}_] .textpad__value`).children().each(function (i, item) {
                                    $item = $(item);
                                    nodeName = $item.prop('nodeName');
                                    $item.unbind('mouseout mouseover');

                                    $item.css(defaultCssSubtable);
                                    $item.mouseover(function () {
                                        if (nodeName == 'SPAN' && !$item.hasClass('subtable_fields--not_edit_field')) {
                                            $item.css(defaultCssSubtable);

                                        }
                                    });
                                    $item.mouseout(function () {
                                        if (nodeName == 'SPAN' && !$item.hasClass('subtable_fields--not_edit_field')) {
                                            $item.css(defaultCssSubtable);
                                        }
                                    });

                                    if (nodeName === 'A' && !$item.hasClass('autocomplete__btn') && !$item.hasClass('autocomplete_val')) {
                                        $item.css(linksCss);
                                        $item.mouseout(function () {
                                            $item.css(linksCss);
                                        }).mouseover(function () {
                                            $item.css(linksCss);
                                        });
                                    }

                                    if (nodeName === 'SELECT') {
                                        $item.css(defaultCssSubtable);
                                    }
                                });

                                $('.sub_fast_edit_file_url').removeAttr('style');
                                $('.sub_fast_edit_file_url_hover').removeAttr('style');

                                $('.fields__fast-edit-button--edit').click(function () {
                                    autocompleteButton.removeAttr('style').css(whiteBackground).css(noneMargin);
                                });
                                $('.autocomplete__input--hidden').blur(function () {
                                    autocompleteButton.removeAttr('style').css(clearBackground).css(noneMargin);
                                });
                            }
                        }
                    })
                })
            }
        }
    };

    window.ColorFormat = ColorFormat;

})();
