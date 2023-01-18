var under_mouse_object = 0;
var last_focus = 0;
var load_values = new Array();
var add_files_flag;
var offsetTop;
var offsetWindow;
var id_fields;
var isActionBtnsSimple = true;
var actionBtns = document.querySelectorAll('.action-btns');
var isScrolled = false;
var subtable = $('.subtable');
var arrows = $('.fixed-transition');
var backToVision = $('.action-btns__item--back-to-vision');
var userDataListSimple = $('.user-data__list--simple');
var userDataListEdit = $('.user-data__list--edit');
var userDataWrap = $('.user-data__wrap');
var userDataList = $('.user-data__list');
var isViewWrapped = false;
var isEditWrapped = false;
var combobox = $('.subtable__table>tbody .combobox');
var lastScrollLeft = 0;
var timeout;
var submit_form_started = 0;
var double_found = 0;
var uniq_fields;
var isCorrectEdit = false;
var click_status = 0;
var prev_show_block = 0;
var fast_edit_old = '';
var ajax_update = new XMLHTTP("update_value.php");
var ajax_view_line = new XMLHTTP("view_line2.php");
var skip_fast_focus = 0; // не обрабатывать событие onfocus у редактируемого элемента
var skip_fast_blur = 0;  // не обрабатывать событие onblur у редактируемого элемента
var toggled_to_view = (getUrlVars()['edit_mode'] && (getUrlVars()['edit_mode'] === 'on' || parseInt(getUrlVars()['edit_mode']) === 1)) ? false : true;
var sub_groups_fields_defs = []; // массив содержащий значения сгруппированного поля для каждой группы
var page_ac_count = 0;
var link_tables = {};
var addLinkFieldsBlockPoints = {
    top: '',
    left: ''
}

/**
 * Объект, хранящий в себе значения полей типа связь
 * @type {Object}
 */
var links_values = {};
/**
 * Объект, хранящий в себе данные о мультивыборе
 * @type {Object}
 */
var multi_selects = {};
/**
 * Объект значений которые были заблюрены в просмотре
 * @type {Object}
 */
var changed_values = {};
/**
 * Проверка, были ли изменены значения в быстром редактировании в режиме просмотра, если true, то изименены
 * @type {boolean}
 */
var is_changed_fast_edit = false;
var unsaved_values = [];
/**
 * Все данные о полях и таблицах
 * @type {{}}
 */
var all_subtables = {};
var copy_subtables;
var start_values;

/**  rel_table, rel_line, rel_field, filter_id, archive, deleted - ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ, объявленные в файле view_line2.tpl  **/
var rel_table_link = (rel_table) ? '&rel_table=' + rel_table : '',
    rel_line_link = (rel_table) ? '&rel_line=' + rel_line : '',
    rel_field_link = (rel_table) ? '&rel_field=' + rel_field : '',
    filter_link = (filter_id && parseInt(filter_id) !== 0) ? '&filter=' + filter_id : '',
    archive_link = (parseInt(archive) !== 0) ? '&archive' : '',
    deleted_link = (parseInt(deleted) !== 0) ? '&deleted' : '',
    all_rec_link = (parseInt(all_rec) !== 0) ? '&all' : '',
    page_link = (parseInt(page) !== 0) ? '&page=' + page : '';

var biz_proc_link = '';

if (biz_proc) {
    if (biz_proc['action'] === 'add_record') {
        var step = (biz_proc['autostep']) ? biz_proc['num'] + 1 : biz_proc['num'] + '&done';
        biz_proc_link = '&bizproc=' + biz_proc['id'] + '&step=' + step
    }
}

$(document).ready(function () {
    init_data();
    postfixLength();

    $(".subtable").delegate(".autocomplete__input", "click", function (e) {
        if (find_select_of_autocomplete($(this)).attr('part') === 'add_link_field') {
            return;
        }
        // Вычисляем положение popup формы добавления полей
        var offsetPos = $(this).parents('.subtable__row').position();
        var offset = $(this).parents('.subtable__cell').offset();
        var rowHeight = $(this).parents('.subtable__row').height();
        var inputWidth = $(this).width();
        var overlayBlock = $(this).parent('span.autocomplete').siblings('.user-data__row-wrap');
        var summWidth = overlayBlock.width() + offset.left + 30;
        var triangleElem = overlayBlock.children('.user-data__add-link-triangle')[0];

        // Проверка, выходит ли блок за пределы видимости окна браузера пользователя
        if (summWidth > $(window).width()) {
            let summLeft = offset.left - overlayBlock.width() + inputWidth - 50;
            addLinkFieldsBlockPoints.left = summLeft;
            if (triangleElem) triangleElem.style.left = '85%';
        } else {
            addLinkFieldsBlockPoints.left = offset.left - 20;
            if (triangleElem) triangleElem.style.left = '5%';
        }

        addLinkFieldsBlockPoints.top = offsetPos.top + rowHeight;
    });
});

$(window).resize(function () {
    setBtnPositionAfterPageResize();
});

function setBtnPositionAfterPageResize() {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        let curSubtable = $('.subtable__table-wrap');
        let documentScrollLeft = curSubtable.scrollLeft();
        let group_btns = curSubtable.find($('.subtable__group-btns'));
        let GROUP_BTNS_WIDTH = 231;
        let subtable = curSubtable.parent('.subtable__wrap');
        let subtable_width = subtable.outerWidth(true) == subtable.find($('.subtable__table')).outerWidth() ? subtable.outerWidth(true) : subtable.find($('.subtable__table')).outerWidth();

        group_btns.css('left', subtable_width - GROUP_BTNS_WIDTH + documentScrollLeft);
        lastScrollLeft = documentScrollLeft;
    }.bind(this), 10);
}

function postfixLength() {
    $('.hidden-input-text-wrap').each(function () {
        if ($(this).children('textarea').val().length === 0) {
            if ($(this).next().hasClass('user-data__postfix')) {
                $(this).next().css('display', 'none')
            }
        }
        if ($(this).children('textarea').val().length > 0) {
            if ($(this).next().hasClass('user-data__postfix') || $(this).prev().hasClass('user-data__postfix')) {
                var i = $(this).children('textarea')[0].scrollWidth / 11;
                var j = $(this).children('textarea').val().length;
                if (i > j) {
                    $(this).children('textarea').attr('cols', j);
                    //$(this).children('textarea').css('width', j * 8);
                } else {
                    $(this).children('textarea').attr('cols', i);
                    //$(this).children('textarea').css('width', i * 8);
                }
                $(this).children('textarea').css('min-width', 'auto');
                $(this).css('width', 'auto');
            }
        }
        if ($(this).next().hasClass('user-data__postfix') || $(this).prev().hasClass('user-data__postfix')) {
            $(this).children('textarea')
                .click(function () {
                    if ($(this).parent().next()) {
                        $(this).css('min-width', 'auto');
                        $(this).css('width', 'auto');
                        $(this).parent().next().css('display', 'none')
                    }
                });
        }
        if ($(this).next().hasClass('user-data__postfix') || $(this).prev().hasClass('user-data__postfix')) {
            $(this).children('textarea')
                .on('input', function () {
                    $(this).removeAttr('cols');
                    $(this).css('min-width', 'auto');
                });
        }
        if ($(this).next().hasClass('user-data__postfix') || $(this).prev().hasClass('user-data__postfix')) {
            $(this).children('textarea')
                .blur(function () {
                    if ($(this).val().length > 0) {
                        var i = $(this)[0].scrollWidth / 9;
                        var j = $(this).val().length;
                        if (i > j) {
                            $(this).attr('cols', j);
                            //$(this).css('width', j * 9);
                        } else {
                            $(this).attr('cols', i);
                            //$(this).css('width', i * 9);
                        }
                        $(this).parent().next().css('display', 'block')
                    } else {
                        $(this).removeAttr('cols');
                        $(this).parent().next().css('display', 'none')
                    }
                    $(this).parent().css('width', 'auto');
                });
        }

        if ($(this).children('textarea').attr('type_field') == 1 || $(this).children('textarea').attr('type_field') == 10) {
            var regExp = $(this).children('textarea').attr('data-default').replace('.', ',')
            var last_value = ''

            // if (($(this).children('textarea').val() === regExp)) {
            //     $(this).children('textarea').css('color', 'grey')
            // }

            $(this).children('textarea').click(function () {
                $this = $(this)
                last_value = $this.val()
                $this.css('color', 'black')

                if (last_value === regExp) {
                    $this.val('')
                    $this.innerHTML = ''
                }
            })

            $(this).children('textarea').blur(function () {
                $this = $(this)

                if (!$this.val()) {
                    $this.val(regExp)
                    $this.innerHTML = regExp
                    $this.css('color', 'grey')
                }

                // if ($this.val() === regExp) {
                //     $this.css('color', 'grey')
                // }
            })
        }
    });

    $('.user-data__value-wrap').each(function () {

        if ($(this).children('input').attr('type_field') == 1 || $(this).children('input').attr('type_field') == 10) {
            var regExp = $(this).children('input').attr('data-default').replace('.', ',')
            var last_value = ''

            // if (($(this).children('input').val() === regExp)) {
            //     $(this).children('input').css('color', 'grey')
            // }

            $(this).children('input').click(function () {
                $this = $(this)
                last_value = $this.val()
                $this.css('color', 'black')

                if (last_value === regExp) {
                    $this.val('')
                }
            })

            $(this).children('input').blur(function () {
                $this = $(this)

                if (!$this.val()) {
                    $this.val(regExp)
                    $this.css('color', 'grey')
                }

                // if ($this.val() === regExp) {
                //     $this.css('color', 'grey')
                // }
            })
        }
    });
};

function on_data_load(xhr) {
    try {
        show_fields = JSON.parse(xhr);
        $.ajax({
            url: 'update_value.php?copy_subtables&table=' + table_id,
            success: function (copy_sub_xhr) {
                if (copy_sub_xhr) {
                    copy_subtables = JSON.parse(copy_sub_xhr);
                    id_fields = init_id_fields();
                    on_all_data_load();
                }
            }
        });


    } catch (error) {
        console.log(error.message);
    }
}

function init_upload_files() {
    let frame = $('#frame_upload');

    if (frame.length > 0) {
        frame.on('load', onupload_file_done);
    }
}

function on_all_data_load() {
    set_events_view_fast_edit();
    fill_datetime();
    get_date_data();
    init_upload_files();
    init_load_values();
    init_events_on_viewline();
    $('.action-btns__item--edit').removeAttr('disabled').removeClass('action-btns__item--disabled');
    init_link_on_link_field();
    textareaAutoResize();
    if (toggled_to_view) {
        init_textarea_resize_btns();
        init_html_resize_btns();
    }
    init_ac_on_viewline($('.user-data .combobox.combobox--view-line-hidden'), false);
    init_ac_on_viewline($('.user-data .combobox.combobox--view-line'), true);
    const autocompletes = $('.user-data .autocomplete__input');
    if (autocompletes.length > 0) {
        autocompletes.each(function () {
            install_autocomplete_id($(this));
        });
    }
    multiple_edit_ac_change();
    calc.callFunctions();
    hideArrows();
    hideEmptyGroups();
    wrappingSelfRows();
    set_ls_closing_group();
    if (fixedSubtablesHeaders) {
      fixSubtablesHeader();
    }
    /**
     * Все элементы быстрого редактирования
     * @type {*}
     */
    var fast_edit_items = $('.user-data__list--simple .hidden-input');
    start_values = event_on_update_fast_edit(fast_edit_items);
    uniq_fields = init_all_uniq_fields();
    fill_link_tables();
    hidePreloader();
    $('.user-data__aside').css('display', 'block');
}

/**
 * Метод, проверяющий высоту текста с html редактированием, и в зависимости от нее показывает или скрывает кнопки
 * @param textarea
 */
function view_html_btn_toggle(wrap) {
    var $wrap = $(wrap);
    var text = $wrap.find($('.user-data__html-val'));
    var btn = $wrap.find($('.user-data__text-resize-btn'));

    if (text.length > 0 && btn.length > 0) {
        var FIX_TEXT_HEIGHT = 288;
        text.removeClass('user-data__html-val--fix-height');
        if (text.height() > FIX_TEXT_HEIGHT) {
            $wrap.css('padding-bottom', '10px');
            text.addClass('user-data__html-val--fix-height');
            btn.show();
        } else {
            $wrap.css('padding-bottom', '0px');
            btn.hide();
        }
    }
}

/**
 * Инициализирует кнопки расширения для текста с html редактированием при загрузке страницы
 */
function init_html_resize_btns() {
    $('.user-data__edit-block--html').each(function (i, item) {
        view_html_btn_toggle(item);
        $(item).find('.user-data__text-resize-btn').on('click', html_resize_toggle);
    });
}

/**
 * Расширяет или сужает текст с html редактированием
 * @event e
 */
function html_resize_toggle(e) {
    var target = $(e.target);
    var text = target.next();

    if (text.length > 0) {
        if (text.hasClass('user-data__html-val--fix-height')) {
            text.removeClass('user-data__html-val--fix-height');
            target.text('<<');
        } else {
            text.addClass('user-data__html-val--fix-height');
            target.text('>>');
        }
    }
}

/**
 * Инициализирует кнопки расширения для текстареа при загрузке страницы
 */
function init_textarea_resize_btns() {
    $('.hidden-input--text').each(function (i, item) {
        view_textarea_btn_toggle(item);
        $(item).next().on('click', textarea_resize_toggle);
    });
}

/**
 * Расширяет или сужает текстареа
 * @event e
 */
function textarea_resize_toggle(e) {
    var btn = $(e.target);
    var textarea = btn.prev();

    if (textarea.length > 0) {
        if (textarea.hasClass('hidden-input--text-fix-height')) {
            textarea.removeClass('hidden-input--text-fix-height');
            btn.text('<<');
        } else {
            textarea.addClass('hidden-input--text-fix-height');
            btn.text('>>');
        }
    }
}

/**
 * Метод, проверяющий высотку текстареа, и в зависимости от нее показывает или скрывает кнопки
 * @param textarea
 */
function view_textarea_btn_toggle(textarea) {
    var $textarea = $(textarea);
    var btn = $(textarea).next();

    if (btn.length > 0) {
        var FIX_TEXTAREA_HEIGHT = 302;
        if ($textarea.height() >= FIX_TEXTAREA_HEIGHT) {
            btn.show();
        } else {
            btn.hide();
        }
    }
}

/**
 * Метод, берущий все данные о записе
 */
function init_data() {
    $.ajax({
        method: 'GET',
        url: 'update_value.php?&show_fields&table=' + table_id + '&line=' + line_id,
        success: function (xhr) {
            on_data_load(xhr);
        },
        error: function () {
            console.log('Ошибка загрузки');
        }
    });
}

$(document).scroll(function () {
    hideArrows();
});

/**
 * Метод, задающий события для полей быстрого редактирования
 */
function set_events_view_fast_edit() {
    const hidden_inputs = $('.user-data .hidden-input');

    hidden_inputs.each(function (i, item) {
        if ($(item).hasClass('hidden-input--hyperlink')
            || $(item).hasClass('hidden-input--phone')
            || $(item).hasClass('hidden-input--html')) {
            fast_edit_special_text(item);
        } else if ($(item).hasClass('hidden-input--text')) {
            addHandler_text(item);
        } else if ($(item).hasClass('hidden-input--select') && $(item)[0].tagName == 'SELECT') {
            addHandler_select(item);
        } else if ($(item).hasClass('hidden-input--datepicker')) {
            addHandler_date(item);
        } else if ($(item).hasClass('autocomplete__input--hidden')) {
            fast_edit_link(item);
        } else if ($(item).hasClass('hidden-input--multi')) {
            fast_edit_multi(item);
        } else if ($(item).hasClass('hidden-input--file')) {
            fast_edit_file(item);
        }
    });
}

/**
 * Метод, обрабатывающий файлы в просмотре записи
 * @param obj {Element} Элемент файла
 */
function fast_edit_file(obj) {
    var field_id = obj.getAttribute('field_id');
    var remove_btns = $('.user-data__remove-file--' + field_id);
    var file_count = $('#view_cell_' + field_id).find($('.user-data__file-wrap--view'));

    remove_btns.each(function () {
        $(this).click(function () {
            if ((file_count.length > 1 && $(obj).hasClass('hidden-input--required')) ||
                !$(obj).hasClass('hidden-input--required')) {
                delfile(field_id, $(this).attr('file_name'), false);
            } else {
                jalert('Это обязательное поле, невозможно удалить файл');
            }
        });
    });

    $(obj).change(function () {
        addfile(field_id, false);
    });
}

/**
 * Метод, обновляющий отображение полей с html-редактированием в режиме просмотра
 * @param id
 */
function update_data_html(id) {
    var edit = $('#fast_edit_cell_' + id);
    var view = $('#view_cell_' + id);

    if (edit.length > 0 && view.length > 0) {
        view.html(edit.val());
    }
}

/**
 * Метод, обрабатывающий спец. поле в быстром редактировании просмотра записи
 * @param obj {Element} Элемент гиперссылки
 */
function fast_edit_special_text(obj) {
    if (obj) {
        var field_id = $(obj).attr('field_id');
        var edit_btn = $('#edit-button' + field_id);
        var close_btn = $('#close-edit-button' + field_id);
        var edit_link = document.querySelector('#fast_edit_cell_' + field_id);

        addHandler_text(edit_link);

        if (edit_btn.length > 0 && close_btn.length > 0) {
            edit_btn.off('click', show_special_text_edit);
            edit_btn.click(show_special_text_edit);
            close_btn.off('click', hide_special_text_edit);
            close_btn.click(hide_special_text_edit);
        }
    }
}

/**
 * Метод, обновляющий отображение полей гиперссылки в режиме просмотра
 * @param id {Number|String} id поля
 */
function update_data_hyperlink(id) {
    var edit = $('#fast_edit_cell_' + id);
    var view = $('#view_cell_' + id);

    if (edit.length > 0 && view.length > 0) {
        view.html('');
        var values = edit.val().replace(/; /g, ', ').split(', ');
        for (let i in values) {
            let val = values[i];
            let link = $('<a>');

            let href = '';
            if (!/^http/.test(val)) { // если вначале уже не прописан протокол http
                if (val.indexOf('@') + 1) {
                    href = 'mailto:' + val.replace(/ /g, '');
                } else if (val.replace(/\D/g, '') == val.replace(/[ ()\-+]/g, '')) {
                    href = 'tel:' + val.replace(/[ ()\-]/g, '');
                } else {
                    href = 'http://' + val.replace(/ /g, '');
                }
            } else {
                href = val.replace(/ /g, '');
            }

            link.text(val);
            link.attr('href', href);
            link.attr('target', '_blank');
            view.append(link);
            if (i < values.length - 1) {
                view.append(', ');
            }
        }
    }
}

/**
 * Метод, обновляющий отображение полей телефонии в режиме просмотра
 * @param id
 */
function update_data_phone(id) {
    var edit = $('#fast_edit_cell_' + id);
    var view = $('#view_cell_' + id);

    if (edit.length > 0 && view.length > 0) {
        let val = edit.val();
        let arr_val = val.split(',');
        let tableId = edit.attr('table_id');
        let line_id = edit.attr('line_id');

        view.html('');

        arr_val.forEach(function (value) {
            var span = $('<span>');
            var btn = $('<img>');

            btn.attr('src', 'images/phone_icon1.png');
            btn.attr('title', 'Позвонить');
            btn.addClass('user-data__phone-btn');
            btn.click(function () {
                module_asterisk_call_window(value, tableId, line_id);
            });

            span.text(value);
            span.append(btn);

            view.append(span);
        });
    }
}

/**
 * Метод, показывающий быстрое редактирование спец. текст поля
 * @param e {Event}
 */
function show_special_text_edit(e) {
    var target = $(e.target);
    var field_id = target.attr('field_id');
    var view = $('#view_cell_' + field_id);
    var edit = $('#fast_edit_cell_' + field_id);
    let autocomplete_input = edit.find('.autocomplete__input');
    var close_btn = $('#close-edit-button' + field_id);

    if (view.length > 0 && edit.length > 0 && close_btn.length > 0) {
        var html = (edit.hasClass('hidden-input--html')) ? view.html() : '';
        target.hide();
        view.hide();
        if(autocomplete_input.length > 0){
            let tag_start = autocomplete_input.val().indexOf('<');
            if(tag_start != -1){
                autocomplete_input.val(autocomplete_input.val().replace(/<\/?[^>]+(>|$)/g, ""));//.substr(0, tag_start));
            }
            if(view.find('.show-field-slave__item--inline').length > 0){
                autocomplete_input.val(view.text().replace(view.find('.show-field-slave__item--inline').text(), ''));
            }
        }
        edit.show();
        if (edit.hasClass('hidden-input--html')) {
            autosize(edit);
            edit.val(html);
            $('#html_resize_' + field_id).css('opacity', '0');
            showHtmlEditor(field_id, 'fast_edit');
        }
        close_btn.show();
    }
}

function fill_link_tables() {
    var tables = $('.table-id');
    tables.each(function (i, item) {
        var viewCell = $(item).parents('.user-data__edit-block');
        link_tables[viewCell.find('.view_cell').attr('field-id')] = $(item).val();
    });
}

/**
 * Метод, скрывающий быстрое редактирование спец. текст поля
 * @param e {Event}
 */
function hide_special_text_edit(e) {
    var target = $(e.target);
    var field_id = target.attr('field_id');
    var link = $('#view_cell_' + field_id);
    var edit_link = $('#fast_edit_cell_' + field_id);
    var edit_btn = $('#edit-button' + field_id);

    if (link.length > 0 && edit_link.length > 0 && edit_btn.length > 0) {
        if (target.hasClass('user-data__close-edit-btn--hyperlink')) {
            update_data_hyperlink(field_id);
        } else if (target.hasClass('user-data__close-edit-btn--phone')) {
            update_data_phone(field_id);
        } else if (target.hasClass('user-data__close-edit-btn--html')) {
            update_data_html(field_id);
            $('#html_resize_' + field_id).css('opacity', '1');
        } else if (target.hasClass('user-data__close-edit-btn--link')) {
            let wrap = $('#view_cell_' + field_id);
            let combobox = $('#combobox_' + field_id);
            let input_сombobox = $('#view_value' + field_id);
            let option = combobox.find('option[value="' + combobox.val() + '"]');
            const inputComboVal = input_сombobox.val();
            const table = link_tables[parseInt(wrap.attr('field-id'))];
            const value = combobox.val();
            const curValue = value ? value : combobox.attr('ac_hidden_val');
            const backUrl = (back_url && back_url.length > 0) ? '&back_url=' + back_url : '';
            const isInlineAdds = parseInt(wrap.attr('inline'));
            const inlineClass = isInlineAdds === 1 ? ' inline' : '';

            // Если было нажатие на select, то очищаем содержимое поля и заполняем новым содержимым, иначе ничего не меняем
            if (value != null && combobox.html().length > 0) {
                wrap.html('');

                if (inputComboVal && inputComboVal !== '0') {
                    let newVal = '';
                    let data = option.attr('data');

                    if (table && combobox.attr('disable_link') == 0) {
                        newVal = $('<a href="view_line2.php?table=' + table + '&line=' + curValue + backUrl + '" class="autocomplete_val"><span class="main_value">' + inputComboVal + '</span></a>');
                    } else {
                        newVal = $('<span><span class="main_value">' + inputComboVal + '</span></span>');
                    }

                    if (data) {
                        const select_data_arr = data.split('</br>');
                        const imgIdent = '<img';
                        const itemClass = isInlineAdds === 1 ? 'show-field-slave__item--inline' : 'show-field-slave__item';
                        let frag = $(document.createDocumentFragment());

                        select_data_arr.forEach(function (val, index) {
                            if (index === 0 && val.indexOf(imgIdent) > -1) {
                                const imgCount = val.split(imgIdent).length - 1;

                                if (imgCount > 1) {
                                    let images = val.split('>');
                                    const firstImg = (images[0].indexOf('<') !== -1 ? images[0].slice(images[0].indexOf('<')) : images[0]) + '>';
                                    const imgVal = images.slice(1).join('>');

                                    newVal.html(firstImg + `<span class="main_value">${inputComboVal}</span>`).addClass('image-link');
                                    let additional_attr = $('<span class="' + itemClass + '">').append(imgVal);
                                    frag.append(additional_attr);
                                } else {
                                    newVal.html((val.indexOf('<') !== -1 ? val.slice(val.indexOf('<')) : val) + `<span class="main_value">${inputComboVal}</span>`).addClass('image-link');
                                }
                            } else {
                                if(isInlineAdds){
                                    if(newVal.hasClass('main_value')){
                                        if(newVal.find('.show-field-slave__item--inline') > 0){
                                            newVal.find('.show-field-slave__item--inline').append(" " + val);
                                        }
                                        else {
                                            let additional_attr = $('<span class="' + itemClass + '">').append(" " + val);
                                            newVal.append(additional_attr);
                                        }
                                    }
                                    else {
                                        if(newVal.find('span.main_value').find('.show-field-slave__item--inline') > 0){
                                            newVal.find('span.main_value').find('.show-field-slave__item--inline').append(" " + val);
                                        }
                                        else {
                                            let additional_attr = $('<span class="' + itemClass + '">').append(" " + val);
                                            newVal.find('span.main_value').append(additional_attr);
                                        }
                                    }
                                }
                                else {
                                    let additional_attr = $('<span class="' + itemClass + '">').append(val);
                                    frag.append(additional_attr);
                                }
                            }
                        });

                        let slave = $('<span class="show_field_slave' + inlineClass + '">');
                        let container = $('<div class="sub-slave_fields ' + inlineClass + '">');
                        slave.append(frag);
                        container.append(newVal).append(slave);
                        wrap.append(container);
                    } else {
                        wrap.append(newVal);
                    }
                }
            }
        }
        target.hide();
        edit_link.hide();
        link.show();
        edit_btn.show();
    }
}

/**
 * Метод, обрабатывающий мультивыборы в быстром редактировании просмотра записи
 * @param obj {Element} Элемент мультивыбора
 */
function fast_edit_multi(obj) {
    if (obj) {
        var parent = $(obj).parent();
        var field_id = $(obj).attr('id').replace(/\D+/g, ""); // вытаскиваем id записи
        var line_id = $(obj).attr('line_id');
        var edit_btn = $('#edit-button' + field_id);
        var close_btn = $('#close-edit-button' + field_id);

        set_multi_data(parent, field_id);

        if (edit_btn.length > 0 && close_btn.length > 0) {
            edit_btn.click(show_multi_select);
            close_btn.click(hide_multi_select);
        }

        parent.click(function (e) {
            var target = $(e.target);
            var index = target.attr('index');

            if (target.hasClass('user-data__multi-checkbox--data')) {
                is_changed_fast_edit = true;

                if (target.prop('checked')) {
                    add_multi_data(field_id, index);
                } else {
                    remove_multi_data(field_id, index);
                }
                save_multi_data(field_id, line_id, target);
            } else if (target.hasClass('user-data__multi-checkbox--all')) {
                var checkboxes = parent.find($('.user-data__multi-checkbox--data'));
                is_changed_fast_edit = true;

                if (target.prop('checked')) {
                    checkboxes.prop('checked', true);
                    add_all_multi_val(field_id, index);
                } else {
                    checkboxes.prop('checked', false);
                    remove_all_multi_data(field_id, index);
                }
                save_multi_data(field_id, line_id, target);
            }

        });
    }
}

/**
 * Метод, показывающий бострое редактирование мультивыбора
 * @param e {Event}
 */
function show_multi_select(e) {
    var target = $(e.target);
    var field_id = target.attr('field_id');
    var edit_multi_select = $('#edit-multi' + field_id);
    var view_multi_select = $('#view-multi' + field_id);

    if (edit_multi_select.length > 0 && view_multi_select.length > 0) {
        edit_multi_select.css('display', 'flex');
        view_multi_select.hide();
        target.hide();
    }
}

/**
 * Метод, скрывающий быстрое редактирование мультивыбора
 * @param e {Event}
 */
function hide_multi_select(e) {
    const target = $(e.target);
    const field_id = target.attr('field_id');
    const edit_multi_select = $('#edit-multi' + field_id);
    const view_multi_select = $('#view-multi' + field_id);
    const edit_btn = $('#edit-button' + field_id);
    const isNewVal = target.attr('new_value') == 1;

    if (edit_multi_select.length > 0) {
        edit_multi_select.hide();
        update_multi_select_data(field_id);
        view_multi_select.css('display', 'flex');
        edit_btn.show();
        if (isNewVal) {
            displayNotification(lang.Success_save_notif, 1);
            target.attr('new_value', 0);
        }
    }
}

/**
 * Метод, обновляющий отображение полей мультивыбора в режиме просмотра
 * @param id
 */
function update_multi_select_data(id) {
    var view_multi_select = $('#view-multi' + id);

    if (view_multi_select.length > 0) {
        var selects = view_multi_select.find($('.user-data__group-select'));

        if (selects.length > 0) {
            selects.remove();
        }

        var display_val_arr = multi_selects[id].map(function (item) {
            if (item.is_checked) return item.display_value;
        });

        display_val_arr.forEach(function (item) {
            var select = $('<span class="user-data__group-select">');

            select.text(item);
            view_multi_select.append(select);
        });
    }
}

/**
 * Метод, заполняющий данные о мультиселектах при загрузке страницы
 * @param obj {Element} Дом элемент в котором хранятся чекбоксы мултивыбора
 * @param id {Number|String} id поля
 */
function set_multi_data(obj, id) {
    var checkboxes = obj.find($('.user-data__multi-checkbox--data'));
    multi_selects[id] = [];

    checkboxes.each(function () {
        var is_checked = ($(this).attr('checked')) ? true : false;
        multi_selects[id].push(
            {
                value: $(this).val(),
                display_value: $(this).next().text(),
                is_checked: is_checked
            }
        );
    });
}

function viev_line_mult_value_preview(elem) {
    let div_check = elem.previousElementSibling.children,
        div_preview = ' ';
    for(let j = 0; j < div_check.length; j++) {
        if(j > 2 && j != (div_check.length - 1)) {
            if(div_check[j].firstElementChild.checked == true) {
                div_preview += `<div>${div_check[j].children[1].textContent}</div>`;
            }
        }
    }
    elem.previousElementSibling.previousElementSibling.previousElementSibling.innerHTML = div_preview;
}

/**
 * Метод, сохраняющий значения мультивыбора
 * @param id {Number|String} id поля
 * @param line_id {Number|String} id записи
 */
function save_multi_data(id, line_id, checkbox) {
    var val_arr = multi_selects[id].filter(function (item) {
        if (item.is_checked) return item;
    });
    val_arr = val_arr.map(function (item) {
        return item.value;
    });

    if ((val_arr.length > 0 && $('#view_value' + id).hasClass('hidden-input--required')) ||
        !$('#view_value' + id).hasClass('hidden-input--required')) {
        var val = val_arr.join('\r\n');
        var new_val = encodeURIComponent(val);

        if (fast_edit_uniq_check(id, line_id, table_id, val)) {
            ajax_update.format = 0;
            ajax_update.method = "POST";
            ajax_update.call("field=" + id + "&line=" + line_id + "&value=" + new_val + "&csrf=" + csrf, save_resp_multi_val);
        }
    } else {
        jalert(lang.empty_required_field);
        $(checkbox).trigger('click');
        return;
    }
}

function save_resp_multi_val(resp) {
    resp = trim(resp, "\r\n");
    const res_arr = resp.toString().split("|");
    const resp_arr = resp.toString().split("\r\n");
    const fieldId = res_arr[2];
    const saveBtn = $('#close-edit-button' + fieldId);

    if (trim(res_arr[0]) === "saved") {
        UpdateData(resp_arr);
        saveBtn.attr('new_value', 1);
    }
}

/**
 * Метод, добавляющий в массив элемент мультивыбора
 * @param id {Number|String} id поля
 * @param index {Number} Индекс чекбокса
 */
function add_multi_data(id, index) {
    multi_selects[id][index].is_checked = true;
}

/**
 * Метод, добавляющий в массив все элементы мультивыбора
 * @param id {Number|String} id поля
 */
function add_all_multi_val(id) {
    multi_selects[id].forEach(function (item, i) {
        add_multi_data(id, i);
    });
}

/**
 * Метод, удаляющий из массива элемент мультивыбора
 * @param id {Number|String} id поля
 * @param index {Number} Индекс чекбокса
 */
function remove_multi_data(id, index) {
    multi_selects[id][index].is_checked = false;
}

/**
 * Метод, удаляющий из массива все элементы чекбокса
 * @param id {Number|String} id поля
 */
function remove_all_multi_data(id) {
    multi_selects[id].forEach(function (item, i) {
        remove_multi_data(id, i);
    });
}

/**
 * Метод для обработки поля типа связь в быстром редактировании просмотра
 * @param obj {Element}
 */
function fast_edit_link(obj) {
    if (obj) {
        var field_id = $(obj).parent().prev().attr('field_id');
        var edit_btn = $('#edit-button' + field_id);
        var close_btn = $('#close-edit-button' + field_id);

        if (close_btn.length > 0 && edit_btn.length > 0) {
            edit_btn.off('click', show_special_text_edit);
            edit_btn.click(show_special_text_edit);
            close_btn.off('click', hide_special_text_edit);
            close_btn.click(hide_special_text_edit);
        }

        $(obj).on('blur', change_fast_edit_link);
        $(obj).on('focus', set_fast_edit_link_val);
    }
}

/**
 * Метод, устанавливающий значение типа связи при фокусе, для того чтобы при blur не сохранялось значение,
 * котрое было при фокусе
 * @param e {Event}
 */
function set_fast_edit_link_val(e) {
    var obj = $(e.target);

    if (obj.length > 0) {
        var value = obj.val();
        var field_id = obj.parent().prev().attr('field_id');
        links_values[field_id] = value;
    }
}

/**
 * Метод, срабатывающий при изменении связи
 * @param e {Event}
 */
function change_fast_edit_link(e) {
    var obj = $(e.target);

    if($(`#add_link_edit_block${obj.attr('id').replace('view_value', '')}`).css('display') == 'block'){
        return;
    }
    if (obj.length > 0) {
        var value = obj.val();
        var field_id = obj.parent().prev().attr('field_id');
        var combobox = $('#combobox_' + field_id);

        if ((field_id && links_values[field_id] !== value) && (!combobox.children().first().hasClass('no-data')) && (value !== lang.No_data) &&
            ((value && combobox.hasClass('hidden-input--required')) || !combobox.hasClass('hidden-input--required'))) {
            if (fast_edit_uniq_check(field_id, line_id, table_id, value)) {
                save_view_line_autocomplete(obj);
            }
        } else if (combobox.hasClass('hidden-input--required') && links_values[field_id] !== value && prevLinkValue != lang.add_new_record) {
            jalert(lang.empty_required_field);
        }
    }
}

/**
 * Метод, навешивающий на переданные элементы события, которые задают принудительную перезагрузку при нажатии на редактировать
 * если поля быстрого редактирования были изменены
 * @param obj {Element}
 */
function event_on_update_fast_edit(obj) {
    var start_values = {};

    obj.each(function () {
        var old_val = $(this).val();
        var id = $(this).attr('id');

        start_values[id] = old_val;
        $(this).on('blur', function () {
            changed_values[id] = $(this).val();
        });
    });

    return start_values;
}

function init_load_values() {
    if (show_fields['fields']) {
        for (var field in show_fields['fields']) {
            var obj = show_fields['fields'][field];
            if (obj) {
                if (obj['write']) {
                    if ($('#value' + obj['id'])) {
                        load_values[obj['id']] = $('#value' + obj['id']).val();
                    }
                }
            }
        }
    }
}

function addBreakStyles() {
  $('.show-field-slave__item').each((i, el) => {
    if($(el).text().length > 50 && ($(el).text().split(" ").length - 1) < 5){
      $(el).addClass('show-field-slave__item--break');
    }
  });
}

/**
 * Инициализирует события бострого редактирования в подтаблицах
 * @param subtable_id
 */
function init_subtable_fast_edit(subtable_id) {
    var elems = $('#sub_' + subtable_id + ' .subtable__row--simple [class^="fast_edit_span_"].not-init');

    if (elems.length > 0) {
        elems.each(function (i, elem) {
            if ($(elem).hasClass('fast_edit_text') && !$(elem).hasClass('html-editor-div') && !$(elem).hasClass('fast_edit_text--hyperlink')) {

                var myInput = defaultData.filter(function (i) {
                    if (i.id == $(elem).attr('field_id')) {
                        return i
                    }
                })

                if (myInput.length != 0 && myInput[0]['type_field'] === '1') {
                    var regExp = myInput[0]['data-default'].replace('.', ',')

                    // if ($(elem).val() === regExp) {
                    //     $(elem).css('color', 'grey')
                    // }
                }

                addHandler_text(elem);
            } else if ($(elem).hasClass('fast_edit_span--multi-select')) {
                addHandler_mult_select(elem);
                resize_subtable_select(elem);
            } else if ($(elem).hasClass('sub_fast_edit_select--select') && $(elem)[0].tagName == 'SELECT') {
                addHandler_select(elem);
                resize_subtable_select(elem);
            } else if ($(elem).hasClass('combobox')) {
                subtable_combobox($(elem));
            } else if ($(elem).hasClass('fast_edit_file') ||
                $(elem).hasClass('sub_fast_edit_file')) {
                $(elem).find($('.file_link')).each(function (j, file) {
                    addHandler_file(file);
                });
            } else if ($(elem).hasClass('fast_edit_datepicker')) {
                if (parseInt($(elem).attr('size')) === 10) {
                    $(elem).datepicker({
                        showOn: "button",
                        dateFormat: lang.date_js_format,
                        buttonImage: "images/calbtn.png",
                        buttonImageOnly: true,
                        buttonText: lang.Calendar,
                        showAnim: (('\v' == 'v') ? "" : "show")
                    }).attr('placeholder', lang.date_placeholder);
                } else {
                    $(elem).datetimepicker({
                        showOn: "button",
                        dateFormat: lang.date_js_format,
                        buttonImage: "images/calbtn.png",
                        buttonImageOnly: true,
                        buttonText: lang.Calendar,
                        timeFormat: "HH:mm",
                        showAnim: (('\v' == 'v') ? "" : "show")
                    }).attr('placeholder', lang.datetime_placeholder);
                }

                addHandler_date(elem);
            }

        });
    }
    $('#sub_' + subtable_id + ' textarea.not-init').each(function () {
        autosize(this);
    });

    $('[id^=edit_hyper_value_].not-init').each(function () {
        resize_subtable_html(this);
    });

    $('#sub_' + subtable_id + ' .combobox.not-init+.autocomplete .autocomplete__input--hidden').each(function () {
        resize_subtable_link(this);
    });

    $('.subtable__row--simple .not-init').each(function () {
        $(this).removeClass('not-init');
    });
}

/**
 * Метод для проверки, были ли изменены поля в просмотре
 */
function check_for_change_values() {
    for (var key in changed_values) {
        if (changed_values[key] !== start_values[key]) {
            is_changed_fast_edit = true;
        }
    }
}

/**
 * Метод, задающий события бокового скролла для подтаблицы
 * @param subtable {Element} подтаблица
 */
function set_position_group_btns(subtable) {
    let group_btns = $('.subtable__group-btns');

    if (group_btns.length > 0) {
        var GROUP_BTNS_WIDTH = 231; // ширина блока с полями
        var subtable_width = subtable.outerWidth(true) == subtable.find($('.subtable__table')).outerWidth() ? subtable.outerWidth(true) : subtable.find($('.subtable__table')).outerWidth();
        var table = subtable.find($('.subtable__table-wrap'));

        group_btns.css('left', subtable_width - GROUP_BTNS_WIDTH);
        table.on('scroll', subtable_scroll);
    }
}

/**
 * Метод, удаляющий события бокового скролла подтаблицы
 * @param subtable {Element} подтаблица
 */
function remove_events_from_group_btns(subtable) {
    var table = subtable.find($('.subtable__table-wrap'));
    table.off('scroll', subtable_scroll);
}

/**
 * Метод, задающий позицию кнопкам
 */
function subtable_scroll() {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
        var documentScrollLeft = $(this).scrollLeft();
        var group_btns = $(this).find($('.subtable__group-btns'));
        var GROUP_BTNS_WIDTH = 231;
        let subtable = $(this).parent('.subtable__wrap');
        var subtable_width = subtable.outerWidth(true);

        if (lastScrollLeft != documentScrollLeft) {
            group_btns.css('left', subtable_width - GROUP_BTNS_WIDTH + documentScrollLeft);
            lastScrollLeft = documentScrollLeft;
        }

    }.bind(this), 10);
}


/**
 * Метод, записывающий закрытие/открытие групп в localStorage (в том числе группы доп.действий)
 */
function set_ls_closing_group() {
    if (CBLocalStorage.support) {
        var group_headers = $('.user-data__item-header'),
            bgroup_button = $('.bgroup_button'),
            curTableId = getUrlVars()['table'],
            line_id = getUrlVars()['line'];

        if (bgroup_button.length > 0) {

            bgroup_button.each(function (i, group) {
                get_ls_closing_group(group, curTableId);
                $(group).click(function (e) {
                    var target = $(e.target),
                        id = target.attr('id'),
                        group_id = id.replace(/\D+/g, ""),
                        ls_item = 'closed_bgroup_table=' + curTableId + '_bgroup' + group_id,
                        ls_data = localStorage.getItem(ls_item);

                    if (ls_data !== null) {
                        localStorage.removeItem(ls_item);
                    } else {
                        localStorage.setItem(ls_item, '1');
                    }
                });
            });
        }

        if (group_headers.length > 0) {

            group_headers.each(function (i, group) {
                get_ls_closing_group(group, curTableId);
                $(group).click(function (e) {
                    var target = $(e.target);
                    if (target.hasClass('user-data__dropdown-btn') || target.hasClass('user-data__title')) {
                        target = target.parent();
                    }
                    var id = target.attr('id');
                    var group_id = id.replace(/\D+/g, "");
                    var ls_item = 'closed_group_table=' + curTableId + '_group' + group_id;

                    var ls_data = localStorage.getItem(ls_item);

                    if (ls_data !== null) {
                        localStorage.removeItem(ls_item);
                    } else {
                        localStorage.setItem(ls_item, '1');
                    }

                    replace_closing_between_view_edit(id);
                });
            });
        }
    }
}

/**
 * Метод, который получает значения из localStorage и закрывает группы (в том числе группы доп.действий)
 * @param group {Element}
 * @param tabId {Number}
 */
function get_ls_closing_group(group, tabId) {
    var group = $(group),
        id = group.attr('id'),
        group_id = id.replace(/\D+/g, ""),
        ls_item = 'closed_group_table=' + tabId + '_group' + group_id,
        bg_item = 'closed_bgroup_table=' + tabId + '_bgroup' + group_id;

    if (localStorage.getItem(ls_item) == '1') {
        group.next().css('display', 'none');
        var btn = group.find($('.user-data__dropdown-btn'));

        btn.addClass('user-data__dropdown-btn--opened');
    }

    if (localStorage.getItem(bg_item) == '1') {
        group.next().css('display', 'block');
    }
}

/**
 * Метод который закрывает/открывает группу в
 * 1) режиме просмотра, если закрыли в редактирование
 * 2) режиме редактирование, если закрыли в просмотре
 * @param id {String}
 */
function replace_closing_between_view_edit(id) {
    var opposite_id = '';
    if (id.indexOf('view') !== -1) {
        opposite_id = id.replace('view', 'edit');
    } else if (id.indexOf('edit') !== -1) {
        opposite_id = id.replace('edit', 'view');
    }

    if (opposite_id !== '') {
        var opposite_group = $('#' + opposite_id);

        if (opposite_group.length > 0) {
            opposite_group.next().toggle();
        }
    }
}

function save_line(from_edit = true, isDelfile = false) {
    $('#edit_form [id^=add_link_block]').remove();
    $('#edit_form [id^=add_link_edit_block]').remove();


    var correct = save_line_inner(from_edit, isDelfile);
    clear_recheck_text();

    if (correct) {
        if (biz_proc && allow_out_bizproc) {
            submit_form_started = 1;
        } else if (!biz_proc) {
            submit_form_started = 1;
        }
        $('#edit_form').submit();
    }
}

function save_line_inner(form_edit, isDelfile = false) {
    if (submit_form_started) return; // Форма уже отправлена
    var check_save_sublines = 0;
    $('.user-data__row--incorrect').removeClass('user-data__row--incorrect');
    let validDate = true;
    $('#edit_block input.hasDatepicker').each(function (i, item) {
        item = $(item);
        if (!isDateValid(item.val().replace(/\//g,'.')) && item.val() != '') {
            incorrectDateFieldFormat(item);
            validDate = false;
        }
    });
    if (!validDate) {
        return false;
    }
    $('[id^="add_link_block"]').each(function () {
        if (this.style.display != 'none') {
            $('[part^="add_link_field"]').each(function () {
                if ((this.value != '' && this.value != '<br>') || (this.innerHTML != '' && this.innerHTML != '<br>')) {
                    check_save_sublines = 1;
                }
            });
        }
    });
    if (check_save_sublines) {
        jconfirm(lang.Link_field_save_confirm,
            function () {
                $('[id^="add_link_block"]').each(function () {
                    this.style.display = 'none';
                });
                save_line(true);
            },
            function () {

            });
        return false;
    }

    // проверка на дубли в уникальных полях
    if (!isDelfile) {
        for (var id in uniq_fields) {
            ajax_uniq_search(id, uniq_fields[id].type_field, uniq_fields[id].name_field, true);
            if (double_found) return false;
        }
    }

    var html_fields = $('.view_html:not(.html_editor)');
    if (html_fields.length > 0) {
        var incorrect = false;
        html_fields.each(function () {
            if (!isValidHtmlCode($(this).val())) {
                $(this).parents('.user-data__row--simple').addClass('user-data__row--incorrect');
                if (!incorrect) {
                    incorrect = true;
                }
            } else {
                $(this).parents($('.user-data__row--simple')).removeClass('user-data__row--incorrect');
            }
        });
        if (incorrect) {
            jalert(lang['Invalid_html']);
            return false;
        }
    }

    var main_field; var edit_field; var value_field;
    var emptyFields = [];
    for (i = 0; i < id_fields.length; i++) {
        field_id = id_fields[i];
        if (document.getElementById('edit' + field_id)) {
            main_field = document.getElementById('main' + field_id).value == 1 ? true : false;
            edit_field = (line_id === 'array') ? document.getElementById('edit' + field_id).checked : true;
            value_field = $('#value' + field_id).val() + (document.getElementById('add_file' + field_id) ? document.getElementById('add_file' + field_id).value : '');
            type_field = show_fields['fields'][field_id]['type_field'];
            mult_value = show_fields['fields'][field_id]['mult_value'];
            var field_full_id = $('#value' + field_id).attr('id');
            if (main_field &&
                edit_field &&
                (
                    ($('#value' + field_id).hasClass('html_editor') &&
                        (
                            CKEDITOR.instances[field_full_id] &&
                            (
                                CKEDITOR.instances[field_full_id].getSnapshot() === '<p><br></p>' ||
                                CKEDITOR.instances[field_full_id].getSnapshot() === ''
                            )
                        )
                    ) ||
                    (
                        !$('#value' + field_id).hasClass('html_editor') && value_field == ''
                    ) ||
                    (
                        value_field == 'null' && type_field == 4
                    ) ||
                    (
                        value_field.replace(',', '.') == 0 &&
                        (
                            type_field == 1 || type_field == 5 || type_field == 7 || type_field == 14 || (type_field == 4 && mult_value)
                        )
                    ) ||
                    (
                        type_field == 5 && (value_field === null || value_field === '' || value_field === 'null' || value_field === lang.No_data)
                    )
                )
            ) {
                var pushed = emptyFields.push(field_id);
            }
        }
    }
    if (emptyFields.length > 0 && form_edit) {
        for (i = 0; i < emptyFields.length; i++) {
            i_obj = document.getElementById('value' + emptyFields[i]);

            if (i_obj.getAttribute('type') == "hidden") {
                if ($(i_obj).next().attr('type') == "hidden")
                    i_obj = document.getElementById('add_file' + emptyFields[i]);
            }

            $("#field_edit" + emptyFields[i]).addClass('user-data__row--incorrect');

            if ($("#field_edit" + emptyFields[i]).parent().css("display") == "none") {
                p_obj = $("#field_edit" + emptyFields[i]).parent();
                p_id = $(p_obj).attr("id");
                p_id = String(p_id);
                s_gr = p_id.replace("fgroup_edit", "");
                show_fgroup(s_gr);
            }

            $(i_obj).bind("change", bHandler);
        }
        displayNotification(lang.not_all_fields, 2);
        return false;
    }

    // Запоминаем текущий режим редактирования
    document.getElementById('cur_mode').value = cur_mode;

    // Пользовательские on_submit
    for (var key in edit_form_submits) {
        if (edit_form_submits[key]() == false) return false;
    }

    var e_form = document.getElementById('edit_form');
    var elems = e_form.getElementsByTagName('input');
    var correct = true;
    var pref = 'templ_fill_ok';

    for (var i = 0; i < elems.length; i++) {
        if (elems[i].id.substr(0, pref.length) == pref) {
            id = elems[i].id.substr(pref.length);
            if (elems[i].value == '0') {
                if (document.getElementById('value' + id).value) {
                    document.getElementById('value' + id).className += ' bg_err';
                    correct = correct && false;
                }
            }
        }
    }

    return correct;
}

/**
 * Метод создающий комбобоксы для подтаблицы
 * @param combobox element
 */
function subtable_combobox(combobox) {
    if (combobox.length > 0) {
        var ac_count = (page_ac_count !== 0) ? page_ac_count : $('.user-data .autocomplete').length;

        combobox.each(function (i, item) {
            if ($(item).parents('.subtable__row--hidden').length !== 0) {
                return;
            }
            var index = i + ac_count;
            var f_id = $(this).attr('field_id');
            var l_id = $(this).attr('line_id');
            var url = 'select_value.php?field=' + f_id + '&line=' + l_id;
            create_combobox($(item));
            var input = $(this).next().find($('.autocomplete__input'));
            var btn = input.next();
            install_autocomplete_value($(item));
            var timeout;

            input.unbind('input');
            input.unbind('keydown');

            input.on('keyup', function (e) {
                var word = '&q=';
                if (input.val() !== '') {
                    word += encodeURIComponent(input.val());
                }
                var url_by_word = 'select_value.php?field=' + f_id + '&line=' + l_id + word;
                if (e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 27 || e.keyCode === 40 || e.keyCode === 37 ||
                    e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 20 || e.keyCode === 13) {
                    return;
                }
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    autocomplete_ajax_request($(item), url_by_word, false, true, index);
                }, 100);
            });
            var onAcClick = function () {
                autocomplete_ajax_request($(item), url, false, true, index);
                btn.off('click', onAcClick);
            };
            if ($(item).attr('disable_link') === '0') {
                input.addClass('autocomplete__input--linked');
                input.on('click', function (e) {
                    if (e.ctrlKey == true) { // Если нажата cntrl
                        location.href = $(item).attr("link");
                    } else {
                        onAcClick();
                    }
                });
            } else {
                input.on('click', onAcClick);
            }

            btn.on('click', onAcClick);
            add_events_autocomplete(input);
        });
        if (page_ac_count !== 0) {
            page_ac_count += combobox.length;
        } else {
            page_ac_count += ac_count + combobox.length;
        }
    }
}

function check_new_values() {
    if (show_fields['fields']) {
        for (var field in show_fields['fields']) {
            var obj = show_fields['fields'][field];
            if (obj) {
                if(obj['type_field'] == 6 || obj['type_field'] == 9 ){
                    continue;
                }
                if (obj['write']) {
                    var field_input = document.getElementById("value" + obj['id']);
                    if (field_input) {
                        if (field_input.value != load_values[obj['id']]) {
                            var str = obj['name_field'];
                            return jconfirm(lang.alert_field_changed1 + str + lang.alert_field_changed2,
                                function () {
                                    switch_mode('view');
                                });
                        }
                    }
                }
            }
        }
    }

    switch_mode('view');
    return 0;
}

function saveLineByAjax(from_edit) {
    var correct = save_line_inner(from_edit);
    clear_recheck_text();

    if (correct) {
        if (biz_proc && allow_out_bizproc) {
            submit_form_started = 1;
        } else if (!biz_proc) {
            submit_form_started = 1;
        }

        const form = $('#edit_form').get(0);
        const formData = new FormData(form);

        $.ajax({
            async: false,
            url: 'view_line2.php?table=' + table_id + rel_table_link + rel_line_link + rel_field_link + filter_link + archive_link + deleted_link + all_rec_link + page_link + '&line=' + line_id + '&csrf=' + csrf,
            processData: false,
            contentType: false,
            data: formData,
            method: 'post'
        });
        isCorrectEdit = true;
    }
}

function saveAndAddNew() {
    saveLineByAjax(true);
    if (isCorrectEdit) {
        location.href = 'view_line' + config_vlm + '.php?table=' + table_id + rel_table_link + rel_line_link + rel_field_link + filter_link + page_link + '&line=new' + biz_proc_link + '&add_next=1';
        isCorrectEdit = false;
    }
}

function saveAndBack() {
    saveLineByAjax(true);
    if (isCorrectEdit) {
        var url = '';

        if (back_url) {
            url = back_url;
        } else {
            url = 'fields.php?table=' + table_id + rel_table_link + rel_line_link + rel_field_link + filter_link + archive_link + deleted_link + all_rec_link + page_link;
        }

        location.href = url;
        isCorrectEdit = false;
    }
}

/**
 * Инициализация поля связи при добавлении значения в связь
 */
function init_link_on_link_field() {
    var links = $('.user-data__row-wrap .fast_edit_link');
    if (links.length > 0) {
        links.each(function () {
            subtable_combobox($(this));
        });
    }
}

function switch_mode(mode) {
    cur_mode = mode;
    if (mode === 'edit') {
        document.getElementById('view_block').style.display = 'none';
        document.getElementById('view_buttons').style.display = 'none';
        document.getElementById('edit_block').style.display = 'block';
        document.getElementById('edit_buttons').style.display = 'block';
        $(".small_green_save").fadeIn();

        //возможность растягивать поля textarea по высоте и ширине
        $("textarea[id^='value']").each(function (i) {
            this.style.resize = 'both';
        });

        // Для возврата дефолтного (непоменяного) значения при несохрании значений в поле типа связи в режиме редактирования
        $('select.combobox').each(function (i, item) {
            let $item = $(item);
            let itemVal = $item.attr('parent_filter');
            let acVal = $item.attr('ac_value').replace(/&quot;/g, '"');

            // Меняем значение селекта на предыдущий, так же атрибут ac_hidden_val меняем на предыдущий и значение инпута автокомплита тоже меняем на предыдущий текст
            $item.val(itemVal);
            $item.attr('ac_hidden_val', itemVal);
            $item.next().find('input.autocomplete__input').val(acVal);
        });

        $('.user-data__value-wrap-file').sortable({
            axis: "y",
            containment: ".user-data",
            cursor: "move",
            items: ".user-data__file-wrap--view",
            opacity: 0.8,
            stop: function (event, ui) {
                let field_elem = $(ui.item).parents('.user-data__value-wrap').find('[id^=value');
                let new_val = "";

                if($(ui.item).parents('.user-data__value-wrap').hasClass('user-data__value-wrap-img')){
                    $(ui.item).parents('.user-data__value-wrap').find('.user-data__file-wrap--view').each((i, el) => {
                        new_val += ($(el).find('a').attr('title') + "\n");
                    });
                }
                else {
                    $(ui.item).parents('.user-data__value-wrap').find('.user-data__file-wrap--view').each((i, el) => {
                        new_val += ($(el).text().replace("&nbsp;", "").trim() + "\n");
                    });
                }
                field_elem.val(new_val);
            },
            start: function (e, ui) {
                $(ui.item).width($(ui.item).width() + 1);
                $(ui.item).height($(ui.item).find('a').height());
                $(ui.placeholder).height($(ui.item).find('a').height());
            }
        });

    }
    else {
        document.getElementById('view_block').style.display = 'block';
        document.getElementById('view_buttons').style.display = 'block';
        document.getElementById('edit_block').style.display = 'none';
        document.getElementById('edit_buttons').style.display = 'none';
        $(".small_green_save").fadeOut();
    }
}

function display_field(field_id, show) {
    if (show) {
        if (document.getElementById('field_view' + field_id)) document.getElementById('field_view' + field_id).style.display = '';
        if (document.getElementById('field_edit' + field_id)) document.getElementById('field_edit' + field_id).style.display = '';
    }
    else {
        if (document.getElementById('field_view' + field_id)) document.getElementById('field_view' + field_id).style.display = 'none';
        if (document.getElementById('field_edit' + field_id)) document.getElementById('field_edit' + field_id).style.display = 'none';
    }
}

function display_fgroup(group_id, show) {
    var groupview = $('#fgroup_edit' + group_id).parent();
    var groupedit = $('#fgroup_view' + group_id).parent();
    if (show) {
        groupedit.css('display', '');
        groupview.css('display', '');
    } else {
        groupview.css('display', 'none');
        groupedit.css('display', 'none');
    }
}

function show_crypt_field(field_id) {
    jconfirm('<div align=center>' + lang.Enter_crypt_pass2 + ':<br><br><input type=password onchange="$.cookie(\'crypt_password\', this.value)"></div>',
        function () {
            $.ajax({
                url: 'update_value.php?display_value&table=' + table_id + '&line=' + line_id + '&field=' + field_id,
                success: function (xhr) {
                    var res = JSON.parse(xhr);
                    if (res) {
                        if (res.error == 'incorrect_crypt_key') {
                            jalert(lang.Incorrect_crypt_pass);
                        } else {
                            $('.crypt-field').show().prop('disabled', false);
                            $('.crypt-field-edit').hide();
                            $('#view_cell_' + field_id).val(res.value);
                            $('#value' + field_id).val(res.value);
                        }
                    }
                }
            });
        },
        function () {
            $.cookie('crypt_password', null);
        }
    );
}

function addfile(field_id, is_edit) {
    var add_file = (is_edit) ? document.getElementById('add_file' + field_id) : document.getElementById('view_add_file' + field_id);
    var val = add_file.value;
    if (val) {
        if (is_edit) {
            document.getElementById('edit_mode').value = 1;
        }
        save_line(is_edit);
        add_files_flag = 1;
    }
    else {
        jalert(lang.please_press_browse);
    }
}

var bHandler = function () {
    $(this).parent().parent().find("b").css("color", "black");
    $(this).parent().parent().css("background-color", "#fff");
    $(this).unbind("change", bHandler);
}

function delfile(field_id, file_name, is_edit) {
    jconfirm(lang.Delete_file + ' ' + file_name + '?',
        function () {
            document.getElementById('del_file' + field_id).value = file_name;
            if (is_edit) {
                document.getElementById('edit_mode').value = 1;
            }
            save_line(is_edit, true);
        },
        function () { }
    );
}

/**
 * Метод, проверяющий были ли изменены значения в режиме редактирования, и если нет, то вызывает методы для
 * настроек для режима просмотра, если да, то вешает обработчик на кнопку OK в всплывающем окне, после чего
 * вызываются методы для режима просмотра
 */
function go_to_view() {
    check_new_values();

    var dialog = $('.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front');

    if (dialog.length === 0) {
        textareaAutoResize();
        wrappingSelfRows();
        if (!toggled_to_view) {
            init_textarea_resize_btns();
            init_html_resize_btns();
            toggled_to_view = true;
        }
    } else {
        var ok = dialog.find($('#jjalert_ok'));
        ok.on('click', function () {
            textareaAutoResize();
            wrappingSelfRows();
            if (!toggled_to_view) {
                init_textarea_resize_btns();
                toggled_to_view = true;
            }
        });
    }


}


/**
 * Скрытие боковых стрелочек при скролле до таблицы
 */
function hideArrows() {
    var subtable = $('.subtable');
    var arrows = $('.fixed-transition');
    if (subtable.length > 0 && arrows.length > 0) {
        var arrowsOffset = arrows.offset().top;
        var subtableOffset = subtable.offset().top;

        if (arrowsOffset >= subtableOffset) {
            arrows.css('visibility', 'hidden');
        } else {
            arrows.css('visibility', 'visible');
        }
    }
}

/**
 * Метод для установки чекбокса при изменении поля типа связь
 */
function multiple_edit_ac_change() {
    if (line_id === 'array') {
        var comboboxes = $('.user-data .autocomplete__input--bootstrap');
        if (comboboxes.length > 0) {
            comboboxes.each(function () {
                $(this).on('change blur', function () {
                    if ($(this).val() !== '') {
                        var select = find_select_of_autocomplete($(this));
                        var field_id = select.attr('field_id');
                        var checkbox = $('#edit' + field_id);
                        if (checkbox.length > 0) {
                            checkbox.attr('checked', true);
                            /** поля свзяи зависимые от текущего поля */
                            var children = $('[parent_link="' + field_id + '"]');
                            if (children.length > 0) {
                                children.each(function () {
                                    var child_id = $(this).attr('field_id');
                                    var child_checkbox = $('#edit' + child_id);
                                    if (child_checkbox.length > 0) {
                                        child_checkbox.attr('checked', true);
                                    }
                                });
                            }
                        }
                    }
                });
            })
        }
    }
}

/**
 * Оборачивания одиночных строк в user-data__table
 */
function wrappingSelfRows() {
    var userDataListSimple = $('.user-data__list--simple');
    if (userDataList.length > 0 && !isOneCell) {
        var selfRowOnView = $('.user-data__list--simple .user-data__wrap>.user-data__row--simple');
        var selfRowOnEdit = $('.user-data__list--edit .user-data__wrap>.user-data__row--simple');
        if (userDataListSimple.find(selfRowOnView).length > 0 && userDataListSimple.css('display') == 'block' && !isViewWrapped) {
            userDataListSimple.find(userDataWrap).prepend('<section class="user-data__table user-data__table--self"></section>');
            var userDataTableSelf = $('.user-data__list--simple .user-data__table--self');
            userDataListSimple.find(selfRowOnView).each(function () {
                userDataTableSelf.append($(this));
            });
            isViewWrapped = true;
        }

        if (userDataListEdit.find(selfRowOnEdit).length > 0 && userDataListEdit.css('display') == 'block' && !isEditWrapped) {
            userDataListEdit.find(userDataWrap).prepend('<section class="user-data__table user-data__table--self"></section>');
            var userDataTableSelf = $('.user-data__list--edit .user-data__table--self');
            userDataListEdit.find(selfRowOnEdit).each(function () {
                if ($(this).find($('.html_editor')).length > 0) {
                    var id = $(this).find($('.html_editor')).attr('id');
                    if (CKEDITOR.instances[id]) {
                        CKEDITOR.instances[id].destroy();
                    }
                    setTimeout(function () {
                        $('.user-data__table--self textarea.html_editor').ckeditor(function () { }, { width: '600px', height: '300px' })
                    }, 100);
                }
                userDataTableSelf.append($(this));
            });
            isEditWrapped = true;
        }
    }
}

/**
 * Метод, скрывающий пустые поля
 */
function hideEmptyGroups() {
    var userDataTable = $('.user-data__table');
    var userDataItem = $('.user-data__item');

    if (userDataTable.length > 0) {
        userDataTable.each(function (i) {
            if (!userDataTable.eq(i).is(':has(.user-data__row--simple)') && !userDataTable.eq(i).is(':has(.user-data__row--bind)')) {
                userDataTable.eq(i).parent(userDataItem).css('display', 'none');
            }
        });
    }
}

/**
 * Метод, устанавливающий плагин autosize для textarea
 */
function textareaAutoResize() {
    var userDataListSimple = $('.user-data__list--simple');
    if (userDataListSimple.css('display') === 'block') {
        var textarea = $('#view_block textarea');
        textarea.each(function () {
            if ($(this).css('display') !== 'none') {
                autosize(this);
            }
        });
    }
}

// сформировать значение мулти-селекта
function form_value_multi(field_id, line_id, pos, subtable_id, val) {
    fast_edit_old = field_id + '|' + line_id + '|' + pos + '|' + val;
    var mult_id = "fast_edit_span_" + field_id + "_" + line_id + "_" + subtable_id + pos;
    var mult_obj = document.getElementById(mult_id);
    var part = mult_obj.getAttribute('part');

    var field;
    if (cur_subtable) {
        field = cur_subtable['table_fields'][field_id];
    }

    if (field) {
        type_field = field['type_field'];

        // формируем полное значение
        var full_value = "";
        var all_values = {};
        $("#sub_cell_" + field_id + "_" + line_id + "_" + subtable_id).find('select[multi_select_group=' + field_id + '_' + line_id + ']').each(function (i) {
            if (this.value && all_values[this.value] == undefined) {
                if (((type_field == 7 || type_field == 11) && this.value != 0) || (type_field == 14 && this.value != ""))
                    full_value += "-" + this.value;
                else if (type_field == 4)
                    full_value = full_value + this.value + "\r\n";
            }
            // Также составляем список элемент, которые нельзя выбрать
            if (((type_field == 7 || type_field == 11) && this.value != 0) || ((type_field == 14 || type_field == 4) && this.value != ""))
                all_values[this.value] = this.value;
        });
        if (full_value) {
            if (type_field == 4)
                full_value = full_value.substr(0, full_value.length - 2);
            else
                full_value += "-";
        }

        // измеянем количество селектов
        if (((type_field == 4 || type_field == 14) && val == "") || ((type_field == 7 || type_field == 11) && val == 0)) { // выбрано пустое значение
            $(mult_obj).remove();
        }
        else { // выбрано непустое значение
            if (mult_obj.getAttribute("is_last") == 1) {
                mult_obj.setAttribute("is_last", 0);
                // клонируем текущий элемент
                var obj_tag_name = mult_obj.tagName;
                var new_pos = intval(pos) + 1;
                var new_id = "fast_edit_span_" + field_id + "_" + line_id + "_" + subtable_id + new_pos;
                var newEL = document.createElement(obj_tag_name);
                newEL.id = new_id;
                newEL.className = mult_obj.className;
                newEL.setAttribute("subtable_id", subtable_id);
                // события
                addHandler_mult_select(newEL);

                // атрибуты
                newEL.setAttribute("multi_select_group", field_id + "_" + line_id);
                newEL.setAttribute("style", mult_obj.getAttribute("style"));
                newEL.style.background = '';
                newEL.setAttribute("field_id", field_id);
                newEL.setAttribute("line_id", line_id);
                newEL.setAttribute("pos", new_pos);
                newEL.setAttribute("is_last", 1);
                newEL.setAttribute("tabindex", last_tabindex_fast_edit);
                newEL.setAttribute("part", part);
                $(newEL).html(mult_obj.innerHTML);
                newEL.selectedIndex = -1;

                // вставляем после текущего
                var parent = mult_obj.parentNode;
                parent.appendChild(newEL);
            }
        }

        $("#sub_cell_" + field_id + "_" + line_id + "_" + subtable_id).find('select[multi_select_group=' + field_id + '_' + line_id + ']').each(function (t) {
            var select_obj = this;
            var options_count = 0;
            $(this).children().each(function (y) {
                if (this.value != select_obj.value) { // не выбранный елемент
                    if (in_array(this.value, all_values)) {
                        this.style.display = 'none';
                        this.setAttribute('disabled', 'disabled');
                    }
                    else {
                        this.style.display = '';
                        this.setAttribute('disabled', '');
                        this.removeAttribute('disabled');
                        if (((type_field == 4 || type_field == 14) && this.value != '') || ((type_field == 7 || type_field == 11) && this.value != 0)) options_count++;
                    }
                }
                else {
                    this.style.display = '';
                    this.setAttribute('disabled', '');
                    this.removeAttribute('disabled');
                    if (((type_field == 4 || type_field == 14) && this.value != '') || ((type_field == 7 || type_field == 11) && this.value != 0)) options_count++;
                }
            });

        });
        if (document.getElementById('fast_edit_span_' + field_id + '_' + line_id + "_" + subtable_id).value != full_value) { // Если изменилось сохранияем
            $('input[id^=fast_edit_span_' + field_id + '_' + line_id + ']').val(full_value);
            if (part == 'add_link_field') return; // Ничего не сохраняем
            save_value_multi(field_id, line_id, full_value);
        }
    }

}

function addHandler_select(obj) {
    /*
    addHandler(obj, "onkeypress", onkeypress_select);
    addHandler(obj, "onkeydown", onkeydown_select);
    addHandler(obj, "onmousedown", onmousedown_select);
    addHandler(obj, "onchange", onchange_select);
    */
    $(obj).on('keypress', onkeypress_select);
    $(obj).on('keydown', onkeydown_select);
    $(obj).on('mousedown', onmousedown_select);
    $(obj).on('change', onchange_select);
}

function onkeypress_select(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;

    if ((event.keyCode == 0xA) || (event.keyCode == 0xD)) {
        if (window.event) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
        }
        else {
            event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
        }
        obj.blur();
        dont_open_view = 1;
        return false;
    }
}

function onkeydown_select(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    if ((event.keyCode == 0xA) || (event.keyCode == 0xD)) {
        if (window.event) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
        }
        else {
            event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
        }
        obj.blur();
        dont_open_view = 1;
        return false;
    }
}

function onmousedown_select(event) {
    dont_open_view = 2;
}

function onchange_select(event) {
    let obj = event.target;
    let colorFormat = new ColorFormat(0, table_id);
    const fieldId = obj.getAttribute('field_id');
    const linedId = obj.getAttribute('line_id');
    const fieldValue = obj.value;

    unsaved_values.push(obj.id);
    if (!obj) obj = event.srcElement;
    var part = obj.getAttribute('part');
    if (part == 'add_link_field') return; // Ничего не сохраняем
    if (fast_edit_old != fieldId + '|' + linedId + '|' + fieldValue
        && fast_edit_uniq_check(fieldId, linedId, table_id, fieldValue)) {
        if ($(obj).hasClass('sub_fast_edit_select--select') || $(obj).hasClass('hidden-input--select')) {
            obj.style.backgroundColor = '#fff6ad';
            obj.setAttribute('yellow_color', '1');
        } else {
            obj.parentNode.style.background = '#fff6ad';
            obj.parentNode.setAttribute('yellow_color', '1');
        }
        save_value(fieldId, linedId, fieldValue);
        $(obj).val(fieldValue).attr('cur_value', fieldValue);
    }
    else {
        obj.parentNode.style.background = '';
        obj.parentNode.style.backgroundColor = '';
    }
}

function addHandler_mult_select(obj) {
    addHandler(obj, "onkeypress", onkeypress_mult_select);
    addHandler(obj, "onkeydown", onkeydown_mult_select);
    addHandler(obj, "onfocus", onfocus_mult_select);
    addHandler(obj, "onchange", onchange_mult_select);
}

function onkeypress_mult_select(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;

    if ((event.keyCode == 0xA) || (event.keyCode == 0xD)) {
        if (window.event) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
        }
        else {
            event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
        }
        obj.blur();
        dont_open_view = 1;
        return false;
    }
}

function onkeydown_mult_select(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    if ((event.keyCode == 0xA) || (event.keyCode == 0xD)) {
        if (window.event) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
        }
        else {
            event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
        }
        obj.blur();
        dont_open_view = 1;
        return false;
    }
}

function onfocus_mult_select(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    fast_edit_old = obj.getAttribute('field_id') + '|' + obj.getAttribute('line_id') + '|' + obj.getAttribute('pos') + '|' + obj.value;
}

function onchange_mult_select(event) {
    var obj = event.target;
    unsaved_values.push(obj.id);
    if (!obj) obj = event.srcElement;
    if (fast_edit_old != obj.getAttribute('field_id') + '|' + obj.getAttribute('line_id') + '|' + obj.getAttribute('pos') + '|' + obj.value) {
        var part = obj.getAttribute('part');
        if (part != 'add_link_field') {
            obj.parentNode.style.background = '#fff6ad';
            obj.parentNode.setAttribute('yellow_color', '1');
        }
        form_value_multi(obj.getAttribute('field_id'), obj.getAttribute('line_id'), obj.getAttribute('pos'), obj.getAttribute('subtable_id'), obj.value);
        $(`#value${obj.attributes.field_id.value}`).val(obj.value);
    }
    else {
        obj.parentNode.style.background = '';
        obj.parentNode.style.backgroundColor = '';
    }
}

function addHandler_date(obj) {
    addHandler(obj, "onkeydown", onkeydown_date);
    $(obj).bind("mousedown", onmousedown_date);
    addHandler(obj, "onfocus", onfocus_date);
    $(obj).bind('change', onchange_date); // необходимо для обмена событиями
}

function onkeydown_date(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    if ((event.keyCode == 0xA) || (event.keyCode == 0xD)) {
        if (window.event) {
            window.event.cancelBubble = true;
            window.event.returnValue = false;
        }
        else {
            event.stopPropagation();
            event.cancelBubble = true;
            event.returnValue = false;
        }
        // Если нажат enter отменяем событие, и сохраняем значение
        this.blur();
        return false;
    }
}

function onmousedown_date(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    dont_open_view = 1;
}

function onfocus_date(event) {
    var obj = event.target;
    if (!obj) obj = event.srcElement;
    if (skip_fast_focus) {
        skip_fast_focus = 0;
        return;
    }
    if (fast_edit_old === '') {
        fast_edit_old = obj.getAttribute('field_id') + '|' + obj.getAttribute('line_id') + '|' + obj.value;
    }
}

function onchange_date(event, newLine = false) {
    let obj = event.target;
    const fieldId = obj.getAttribute('field_id');
    const linedId = obj.getAttribute('line_id');
    const oldValue = obj.getAttribute('cur_value');
    const fieldValue = obj.value.replace(/\//g,'.');
    const requiredHasValue = checkFieldForRequiredValue(fieldId, fieldValue);
    let curTableId = table_id;

    // Если поля обязательно для заполнения и не заполнено
    if (!requiredHasValue) {
        showTipAboutRequiredFieldAndReturnValue(obj, oldValue);
        return;
    }

    unsaved_values.push(obj.id);
    if (!obj) obj = event.srcElement;
    if ($('#ui-datepicker-div').css("overflow") != 'hidden'
        && ($(obj).attr('size') == 19 || $(obj).hasClass('datetimepicker'))
        && $('#ui-datepicker-div').css("display") != 'none') {
        return false; //отключаем быстрое редактирование в режиме календаря c часами и минутами до тех пор, пока открыт сам календарик
    }
    var part = obj.getAttribute('part');

    if (part == 'add_link_field') return; // Ничего не сохраняем

    if (cur_subtable) {
        if (cur_subtable['table_fields'] && cur_subtable['table_fields'][fieldId]) curTableId = cur_subtable.table_id; // Если поле в подтаблице
    }

    if (fast_edit_old != fieldId + '|' + linedId + '|' + this.value
        && fast_edit_uniq_check(fieldId, linedId, curTableId, fieldValue)) {
        if (!isDateValid($(obj).val().replace(/\//g,'.')) && $(obj).val() != '') {
            incorrectDateFieldFormat($(obj));
            obj.blur();
            return;
        }
        obj.style.background = '#fff6ad';
        $(obj).attr('yellow_color', '1');
        save_value(fieldId, linedId, fieldValue, newLine);
        $(`#value${obj.attributes.field_id.value}`).val(fieldValue);
        fast_edit_old = '';
    }
    else
        obj.style.background = '';
    obj.blur();
}

function addHandler_text(obj, part) {
    addHandler(obj, "onchange", onchange_text);
    addHandler(obj, "onfocus", onfocus_text_new);
    addHandler(obj, "onblur", onblur_text_new);
    addHandler(obj, "onclick", onclick_text_new);
}

function onfocus_text_new(event) {
    var obj = event.target;

    var part = obj.getAttribute('part');
    if (part == 'add_link_field') return; // Ничего не сохраняем

    obj.style.border = '1px dotted #a0a0a0';
}

function onclick_text_new(event) {
    var obj = event.target;
    var $this = $(obj);
    var last_value = '';
    var myInput = defaultData.filter(function (i) {
        if (i.id == $this.attr('field_id')) {
            return i;
        }
    })

    if (myInput.length !== 0 || $this.val().length > 0) {
        const typeField = myInput[0] ? myInput[0]['type_field'] : $this.attr('type_field');

        if (typeField === '1') {
            let regExp = myInput[0] ? myInput[0]['data-default'].replace(',', '.') : $this.attr('data-default').replace(',', '.');
            regExp = parseFloat(regExp).toFixed(10);
            last_value = $this.val().replace(',', '.');
            last_value = parseFloat(last_value).toFixed(10);
            $this.css('color', 'black')

            if (last_value === regExp) {
                $this.val('')
            }
        }
    }
}

function onblur_text_new(event) {
    var obj = event.target;
    var $this = $(obj)
    var myInput = defaultData.filter(function (i) {
        if (i.id == $this.attr('field_id')) {
            return i;
        }
    });

    if (myInput.length !== 0) {
        if (myInput[0]['type_field'] === '1') {
            var regExp = myInput[0]['data-default'].replace('.', ',')

            if (!$this.val()) {
                $this.val(regExp)
            }

            // if ($this.val() === regExp) {
            //     $this.css('color', 'grey')
            // }
        }
    }

    var part = obj.getAttribute('part');
    if (part == 'add_link_field') return; // Ничего не сохраняем

    obj.style.border = '0px';
}

function onchange_text(event) {
    let obj = event.target;
    const fieldId = obj.getAttribute('field_id');
    const linedId = obj.getAttribute('line_id');
    const oldValue = obj.getAttribute('cur_value');
    const fieldValue = $(obj).val();
    const requiredHasValue = checkFieldForRequiredValue(fieldId, fieldValue);
    let curTableId = table_id;

    // Если поля обязательно для заполнения и не заполнено
    if (!requiredHasValue) {
        showTipAboutRequiredFieldAndReturnValue(obj, oldValue);
        return;
    }

    if ($(obj).hasClass('hidden-input--text')) {
        view_textarea_btn_toggle(obj);
    }
    unsaved_values.push(obj.id);
    var part = obj.getAttribute('part');
    if (part == 'add_link_field') return; // Ничего не сохраняем

    obj.style.border = '0px';
    if (cur_subtable) {
        if (cur_subtable['table_fields'] && cur_subtable['table_fields'][fieldId]) curTableId = cur_subtable.table_id; // Если поле в подтаблице
    }

    if (fast_edit_uniq_check(fieldId, linedId, curTableId, obj.value)) {
        var validHtml = isValidHtmlCode(obj.value);
        if ((fast_edit_old != fieldId + '|' + linedId + '|' + obj.value && !$(obj).hasClass('error-value')) &&
            (($(obj).hasClass('hidden-input--required') && fieldValue !== '') || !$(obj).hasClass('hidden-input--required'))
            && (!$(obj).hasClass('hidden-input--html') || ($(obj).hasClass('hidden-input--html') && validHtml))) {
            obj.style.background = '#fff6ad';
            $(obj).attr('yellow_color', '1');
            if (CKEDITOR.instances['value' + fieldId]) {
                CKEDITOR.instances['value' + fieldId].setData(obj.value);
            }
            save_value(fieldId, linedId, obj.value);
            $(`#value${fieldId}`).val(obj.value);
            $(obj).attr('cur_value', fieldValue);
        } else if ($(obj).hasClass('hidden-input--required') && fieldValue === '') {
            jalert(lang.empty_required_field);
        } else if ($(obj).hasClass('hidden-input--html') && !validHtml) {
            jalert(lang['Invalid_html']);
        } else {
            obj.style.background = '';
        }
    }
}

function onmousedown_text(event) {
    var obj = event.currentTarget;
    if (!obj) {
        obj = event.srcElement;
        // IE как всегда в ударе, подписываем на событие div а приходит событие о вложенном элементе, получить родительский div через свойства невозможно
        // поэтому если не div то всплываем
        while (obj.tagName != 'DIV') {
            obj = obj.parentNode;
        }
    }
    if (event.ctrlKey) { // если нажат контрол, то срабатывает как обычная таблица
    }
    else {
        obj.contentEditable = true;
        dont_open_view = 2;
    }
}

// Показываем уведомление о том, что запись не сохранена, т.к.
// есть текущее поле обязательно для заполнения
function showTipAboutRequiredFieldAndReturnValue(elem, oldValue) {
    const field = $(elem);

    field.css({ backgroundColor : '#ffe0e0' }).stop().animate({ backgroundColor : '' }, 3000);
    displayNotification(lang.Error_not_all_fields, 2);
    $('.subtable__footer-btn.subtable__footer-btn--save').fadeOut(); // Скрываем скнопку "Сохранить"
    field.val(oldValue).trigger('blur');
}

// Проверка для подтбалицы, является ли поле обязательным для заполнения
function checkFieldForRequiredValue(fieldId, value) {
    let field;

    if (cur_subtable) {
        if (cur_subtable.table_fields && cur_subtable.table_fields[fieldId]) {
            isSubtable = true;
            field = cur_subtable.table_fields[fieldId];
        } else {
            field = show_fields.fields[fieldId];
        }
    } else {
        field = show_fields.fields[fieldId];
    }

    if (field && field['main'] == 1 && (!value || value.trim() === '' || value.length < 1)) return false;

    return true;
}

function addHandler_file(obj) {
    if (obj) {
        addHandler(obj, "onmouseover", onmouseover_file);
        addHandler(obj, "onmouseout", onmouseout_file);
        addHandler(obj.nextSibling, "onclick", ondrop_file);
    }
}

function onmouseover_file(event) {
    var obj = event.target;

    if (!obj) obj = event.srcElement;
    if (obj.tagName != "A") obj = obj.parentNode; // Разворачиваем вверх, т.к. это изображение
    if (obj.hasAttribute('main_line')) {
        $(obj).next('span').removeClass('b_drop_hoverpopup').addClass('b_drop');
    } else {
        const field_id = obj.getAttribute('field_id');
        const line_id = obj.getAttribute('line_id');

        obj.nextSibling.className = "b_drop";
        document.getElementById("add_file_url_" + field_id + "_" + line_id + "_" + cur_subtable_id).className = "sub_fast_edit_file_url_hover";
    }
}

function onmouseout_file(event) {
    var obj = event.target;

    if (!obj) obj = event.srcElement;
    if (obj.tagName != "A") obj = obj.parentNode; // Разворачиваем вверх, т.к. это изображение
    if (obj.hasAttribute('main_line')) {
        $(obj).next('span').removeClass('b_drop').addClass('b_drop_hoverpopup');
    } else {
        const field_id = obj.getAttribute('field_id');
        const line_id = obj.getAttribute('line_id');

        obj.nextSibling.className = "b_drop_hoverpopup";
        document.getElementById("add_file_url_" + field_id + "_" + line_id + "_" + cur_subtable_id).className = "sub_fast_edit_file_url";
    }
}

function ondrop_file(event) {
    let obj = event.target;
    if (!obj) obj = event.srcElement;
    let prev = obj.previousSibling;
    let part = obj.getAttribute('part');
    let field_id, line_id, subtable_id, f_name, prevId, isRequiredField, countInfo;
    let filesCount = 0;
    const mainLine = obj.hasAttribute('main_line');

    if (part == 'add_link_field') return; // Ничего не сохраняем

    if (mainLine) { // Для полей в основной записи
        prev = $(obj).prev();
        field_id = prev.attr('field_id');
        line_id = prev.attr('line_id');
        f_name = prev.attr('title');
        prevId = prev.attr('id');
        isRequiredField = prev.attr('required_field') !== undefined;
        countInfo = $('#file' + field_id + '_count');
    } else { // Для подтаблиц
        field_id = prev.getAttribute('field_id');
        line_id = prev.getAttribute('line_id');
        subtable_id = prev.getAttribute('subtable_id');
        f_name = prev.title;
        prevId = prev.id;
        countInfo = $('#sub_files_count_' + field_id + '_' + line_id);
        isRequiredField = countInfo.attr('required_field') == 1;
    }

    filesCount = parseInt(countInfo.val());

    // Проверка на то, является ли поле обязательным для заполнения (если происходит удаление последнего файла)
    if (isRequiredField && filesCount === 1) {
        displayNotification(lang.Is_required_file_field, 2);
        return false;
    }

    jconfirm(lang.Delete_file + ' ' + f_name + '?',
        function () {
            src_field = field_id;
            src_line = line_id;
            let page_param = '';
            const isEditMode = $('#edit_block').css('display') === 'block';
            let allFiles = isEditMode ? $('#edit_block #value' + field_id).val() : $('#value' + field_id).val();

            if (cur_subtable)
                page_param = '&subtable_page=' + cur_subtable['cur_page'] + '&rel_field=' + cur_subtable['rel_field'];

            if (mainLine) {
                allFiles = allFiles.replace(f_name, '');
                countInfo.val(--filesCount); // Изменяем значение в поле с количеством файлов
                prev.css('background', '#fff6ad');
                $('#edit_form #value' + field_id).val(allFiles).attr('value', allFiles);
                $('#value' + field_id).val(allFiles).attr('value', allFiles);
                $('#view_value' + field_id).val(allFiles).attr('value', allFiles);
            } else {
                prev.style.background = '#fff6ad';
            }
            $('#new_file_form_' + field_id + '_' + line_id).hide();

            obj.style.backgroundColor = '#fff6ad';
            ajax_update.format = 0;
            ajax_update.method = 'POST';
            ajax_update.call('sel=drop_file&field=' + field_id + '&line=' + line_id + '&fname=' + encodeURIComponent(f_name) + '&csrf=' + csrf + page_param,
                function (resp) {
                    let res_arr = resp.toString().split('|');
                    const fieldId = res_arr[2];
                    const lineId = res_arr[3];

                    if (res_arr[0] == 'deleted' || res_arr[0] == 'message') { // удаляем из списка
                        const fPos = str_replace('fast_edit_span_' + src_field + '_' + src_line + '_' + subtable_id, '', prevId);

                        obj.parentNode.parentNode.removeChild(obj.parentNode);
                        $('.fast_edit_span_' + src_field + '_' + src_line + fPos).remove();
                        $('#view_cell_' + src_field).find('a[title="' + f_name + '"]').parent('div').remove(); // Бестрое редактирование
                        if($('#field_edit' + src_field).find('a[title="' + f_name + '"]').parent().hasClass('whitespace_nowrap')){
                            $('#field_edit' + src_field).find('a[title="' + f_name + '"]').parent('span').remove(); // Полное редактирование
                        }
                        else {
                            $('#field_edit' + src_field).find('a[title="' + f_name + '"]').parent('div').remove(); // Полное редактирование
                        }
                    }
                    $('#new_file_form_' + field_id + '_' + line_id + ', #edit-add-btn-' + field_id).show(); // Отображаем кнопку "Добавить"
                    let resp_arr = str_replace('\n', '\r\n', resp.toString()).split('\r\n');
                    UpdateData(resp_arr);
                    if (!isEditMode) displayNotification(lang.Success_save_notif, 1);
                });
        });
}

function check_upload_file(field_id, obj) {
    if (obj) {
        if (obj.files) {
            var f_pos;
            for (f_pos = 0; f_pos < obj.files.length; f_pos++) {
                var upl_files = obj.files[f_pos];
                name = upl_files.name;
                size = upl_files.size;
                ext_pos = name.lastIndexOf(".");
                ext = name.substr(ext_pos + 1).toLowerCase();
                var f_t;
                if (show_fields['fields'][field_id]) {
                    f_t = show_fields['fields'][field_id]['file_types'];

                    if (typeof f_t !== 'undefined') {
                        if (typeof f_t[0] != 'undefined') {
                            var i = 0;
                            var ext_str = '';
                            for (var key in f_t) {
                                if (f_t[key] == ext) i++;
                                ext_str = ext_str + f_t[key] + ', ';
                            }
                            if (i == 0) {
                                len = ext_str.length;
                                ext_str = ext_str.substr(0, len - 2);
                                jalert(name + ' ' + lang.wrong_extension + ' ' + ext_str);
                                return false;
                            }
                        }
                    }
                }

                if (size > 1024 * 1024 && !full_version) {
                    jalert(lang.Free_file_max_size);
                    return false;
                }
            }
        }
        return true;
    }
}

function sub_add_file(field_id, line_id, obj) { // Добавление файла в подтаблицу
    const isSubtableField = cur_subtable && cur_subtable.table_fields[field_id];
    let maxSizeFiles = [];
    let maxSize = isSubtableField ? cur_subtable.table_fields[field_id]['max_size'] : 2048;
    let errorExtentions = [];
    let extValues = '()';

    if (isSubtableField && cur_subtable.table_fields[field_id].uniq_field == 1) {
        if (!fast_edit_uniq_check(field_id, line_id, cur_subtable.table_id, obj.files[0].name)) {
            return false;
        }
    }

    check_upload_file(field_id, obj);
    var value = obj.value;
    var part = obj.getAttribute('part');
    var file_img = obj.getAttribute('file_img');
    var progress_span = "<span class='upload_progress'></span>";
    var bg = "style='background:#fff6ad'";
    if (part == 'add_link_field') {
        progress_span = "";
        bg = "";
    }
    if (obj.files) { // Новый режим многофайловость
        for (let i = 0; i < obj.files.length; i++) {
            let value = obj.files[i].fileName;
            let curName = obj.files[i]['name'];
            let curSize = obj.files[i]['size'];
            const extPos = curName.lastIndexOf('.');
            const extention = curName.substr(extPos + 1).toLowerCase();
            let new_line;

            if (typeof (value) == 'undefined') value = obj.files[i].name;

            // Проверяем максимальный размер файла
            if (isSubtableField) {
                if (maxSize && maxSize != 0 && maxSize * 1024 < curSize) {
                    maxSizeFiles.push(curName);
                    continue;
                }
            }

            if (!file_img) {
                // Проверяем корректность расширения для файла
                if (isSubtableField) {
                    const fileTypes = cur_subtable.table_fields[field_id]['file_types'];

                    if (fileTypes) {
                        const typesArr = Object.keys(fileTypes);
                        extValues = ' (' + typesArr.join(', ') + ') ';

                        if (typesArr.indexOf(extention) === -1) {
                            errorExtentions.push(curName);
                            continue;
                        }
                    }
                }
            }

            if (file_img) new_line = $("<span style='white-space:nowrap;' class='fast_edit_span_" + field_id + "_" + line_id + i + "'><a href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "&show=1\" onclick='unUploadedFileWarning();' id='new_file_upload_" + field_id + "_" + line_id + "_" + cur_subtable_id + "_" + i + "' " + bg + " file_img=1 title='" + value + "'>" + value + "</a>" + progress_span + "<span> ");
            else new_line = $("<span style='white-space:nowrap;' class='fast_edit_span_" + field_id + "_" + line_id + i + "'><a href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "\" onclick='unUploadedFileWarning();' id='new_file_upload_" + field_id + "_" + line_id + "_" + cur_subtable_id + "_" + i + "' " + bg + " title='" + value + "'>" + value + "</a>" + progress_span + "</span> ");
            $(".fast_edit_span_" + field_id + "_" + line_id).append(new_line);
        }

        if (maxSizeFiles.length > 0) {
            jalert(lang.max_filesize_exceeded_kb + ': ' + maxSize  + '\n\n' + maxSizeFiles.join('\n'));
        }
        if (errorExtentions.length > 0) {
            jalert(lang.wrong_extension + extValues + ':\n\n' + errorExtentions.join('\n'));
        }
    } else {  // Старый режим
        // Если указан полный путь оставляем только имя файла
        var last_slash = -1;
        var last_slash_p1 = 0;
        var last_slash_p2 = -1;
        while (1) {
            last_slash_p2 = value.indexOf('\\', last_slash_p1);
            if (last_slash_p2 == -1) break;
            last_slash_p1 = last_slash_p2 + 1;
            last_slash = last_slash_p2;
        }
        if (last_slash != -1) {
            value = value.substr(last_slash + 1, 1024 * 1024);
        }

        var new_line;
        if (file_img) new_line = $("<span style='white-space:nowrap;' class='fast_edit_span_" + field_id + "_" + line_id + "0'><a class=\"href_post\" href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "&show=1\" onclick='unUploadedFileWarning();' id='new_file_upload_" + field_id + "_" + line_id + "_" + cur_subtable_id + "_0' " + bg + " file_img=1 title='" + value + "'>" + value + "</a>" + progress_span + "</span> ");
        else new_line = $("<span style='white-space:nowrap;'class='fast_edit_span_" + field_id + "_" + line_id + "0'><a class=\"href_post\" href=\"open_file.php?field=" + field_id + "&line=" + line_id + "&file=" + encodeURIComponent(value) + "\" onclick='unUploadedFileWarning();' id='new_file_upload_" + field_id + "_" + line_id + "_" + cur_subtable_id + "_0' " + bg + " title='" + value + "'>" + value + "</a>" + progress_span + "</span> ");
        $(".fast_edit_span_" + field_id + "_" + line_id).append(new_line);
    }

    if (cur_subtable) {
        document.getElementById("subtable_page" + field_id + "_" + line_id + "_" + cur_subtable_id).value = cur_subtable['cur_page'];
        document.getElementById("rel_field" + field_id + "_" + line_id + "_" + cur_subtable_id).value = cur_subtable['rel_field'];
    }

    if (part == 'add_link_field') return; // Ничего не сохраняем
    upload_in_progress = 1;

    document.getElementById("sbmt_file_" + field_id + "_" + line_id + "_" + cur_subtable_id).submit();
    obj.value = "";
}

function checkUploadingNewFile(fieldId, file) {
    const size = file['size'];

    if (size > 1024 * 1024 && !full_version) {
        jalert(lang.Free_file_max_size);
        return false;
    }

    return true;
}

function dropNewLineFile(fieldId, fileName) {
    if($('#edit_block #value' + fieldId).val()!=undefined || $("div[id^='add_link_edit_block'] #value" + fieldId).val()!=undefined){
        let newVal;
        if ($('#edit_block #value' + fieldId).val()!=undefined) {
            newVal = $('#edit_block #value' + fieldId).val().replace(fileName, '').trim();
        } else {
            newVal = $("div[id^='add_link_edit_block'] #value" + fieldId).val().replace(fileName, '').trim();
        }
        newVal += '\n';
        const isEditMode = $('#edit_block').css('display') === 'block';
        if (isEditMode) {
            // Удаляем name-поле с файлом (которое используется для сохранения в БД)
            $('#edit_block input.new-file' + fieldId + '[file_name="' + fileName + '"][field_id="' + fieldId + '"]').remove();
            $('#edit_block div[id="new_line_file_' + fieldId + '_' + fileName + '"').remove(); // Удаляем блок с именем файла
        } else {
            // Удаляем name-поле с файлом (которое используется для сохранения в БД)
            $('input.new-file' + fieldId + '[file_name="' + fileName + '"][field_id="' + fieldId + '"]').remove();
            $('div[id="new_line_file_' + fieldId + '_' + fileName + '"').remove(); // Удаляем блок с именем файла
        }
        $('#edit_block #value' + fieldId).val(newVal);
        $('#edit_form #value' + fieldId).val(newVal);
        $('#edit_form #add_file' + fieldId).val('');
    }else {
        let newVal = $('#view_block #value' + fieldId).val().replace(fileName, '').trim();
         newVal += '\n';
        // Удаляем name-поле с файлом (которое используется для сохранения в БД)
        $('input.new-file' + fieldId + '[file_name="' + fileName + '"][field_id="' + fieldId + '"]').remove();
        $('div[id="new_line_file_' + fieldId + '_' + fileName + '"').remove(); // Удаляем блок с именем файла
        $('#view_block #value' + fieldId).val(newVal);
        $('#edit_form #value' + fieldId).val(newVal);
        $('#edit_form #add_file' + fieldId).val('');
    }
}

function saveNewFile(fieldId, lineId, fileType) {
    let hiddenForm = $('#input_new_file_data');
    let fileForm = $('#sbmt_file_form');
    const inputType = fileType === 'img' ? 'image/*' : ''; // Определяем тип добавляемых файлов
    const isEditMode = $('#edit_block').css('display') === 'block';

    if (lineId === 'new' || lineId === 'array') { // Добавление новой строки
        let inputFile = $('#add_file' + fieldId);

        if(isEditMode){
            inputFile = $('#edit_block #add_file' + fieldId);
        }else{
            inputFile = $('#add_file' + fieldId);
        }

        inputFile.off();
        inputFile.on('change', function() {
            save_new_file(fieldId, lineId, inputFile, fileType);
        });
        inputFile.trigger('click');
    } else {
        hiddenForm.off().val('');
        hiddenForm.attr('accept', inputType);
        fileForm.find('input[name="field"]').val(fieldId);
        fileForm.find('input[name="line"]').val(lineId);
        fileForm.attr('action', 'update_value.php?field=' + fieldId + '&line=' + lineId);

        hiddenForm.on('change', function() {
            save_new_file(fieldId, lineId, hiddenForm, fileType);
        });
        hiddenForm.trigger('click');
    }
}

function save_new_file(field_id, line_id, obj, type) { // Добавление файла в основной записи
    const isEditMode = $('#edit_block').css('display') === 'block';
    const allObjFiles = obj.prop('files');
    let maxSizeAbove = [];
    let maxSize = 2048;
    let errorExtentions = [];
    let extValues = '()';

    if(!allObjFiles || allObjFiles.length < 1) return;
    if (line_id === 'new' || line_id === 'array') { // Добавление новой строки
        for (let i = 0; i < allObjFiles.length; i++) {
            let fieldValue,
                downloadInput;  // Текущая форма загрузки файла
            if(isEditMode){
                fieldValue = $('#edit_block #value' + field_id);
                downloadInput = $('#edit_block #add_file' + field_id);
            }else{
                fieldValue = $('#value' + field_id);
                downloadInput = $('#add_file' + field_id);
            }

            const editFormValue = $('#edit_form #value' + field_id);
            const fileName = allObjFiles[i]['name']; // Имя файла
            const fileSize = allObjFiles[i]['size']; // Размер файла
            const form = fieldValue.parent('.user-data__value-wrap') && fieldValue.parent().find('.user-data__file-wrap');
            const fileInfo = $('#new_file_info_' + field_id);
            const currentValue = fieldValue.val();
            const extPos = fileName.lastIndexOf('.');
            const extention = fileName.substr(extPos + 1).toLowerCase();
            let filesCount = parseInt(fileInfo.attr('count'));

            // Проверяем максимальный размер файла
            if (show_fields['fields'][field_id]) {
                maxSize = show_fields['fields'][field_id]['max_size'];

                if (maxSize && maxSize != 0 && maxSize * 1024 < fileSize) {
                    maxSizeAbove.push(fileName);
                    continue;
                }
            }

            if (type === 'file') {
                // Проверяем корректность расширения для файла
                if (show_fields['fields'][field_id]) {
                    const fileTypes = show_fields['fields'][field_id]['file_types'];

                    if (fileTypes) {
                        const typesArr = Object.keys(fileTypes);
                        extValues = ' (' + typesArr.join(', ') + ') ';

                        if (typesArr.indexOf(extention) === -1) {
                            errorExtentions.push(fileName);
                            continue;
                        }
                    }
                }
            }

            if (!checkUploadingNewFile(field_id, allObjFiles[i])) continue;

            if (currentValue.indexOf(fileName) !== -1) {
                alert(fileName + '\n' + lang.Ext_file_dublicate);
                continue;
            }

            const newValues = fieldValue.val() + fileName + '\n';
            const newFileRow = $('<div class="user-data__new-line--file" id="new_line_file_' + field_id + '_' + fileName + '">' +
                                    '<span class="draggableImgFile">&nbsp;</span>' +
                                    '<span class="user-data__new-line--file-name">' + fileName + '</span>' +
                                    '<span class="b_drop" onclick="dropNewLineFile(\'' + field_id + '\', \'' + fileName + '\', ' + (i == 0 ? "true" : "false") + ');" title="' + lang.Delete + '"></span>' +
                                '</div>');
            // Добавляем новую форму для загрузки нового файла
            const formFilesInput = $('<input type="file" class="hidden" multiple="multiple" field_id="' + field_id +
                                    '" name="add_file[new][' + field_id + '][]" id="add_file' + field_id + '" />');

            // Изменяем атрибуты для сохранения загруженного файла
            downloadInput.addClass('new-file' + field_id).attr('file_name', fileName).removeAttr('id');
            fieldValue.val(newValues);
            editFormValue.val(newValues);
            if(fieldValue.parent().find('.user-data__new-line--files').length < 1){
                let container = $('<div class="user-data__new-line--files"></div>');

                let spec_block_before = $('<div class="user-data__new-line--files_spec"></div>');
                let spec_block_after = $('<div class="user-data__new-line--files_spec"></div>');

                container.append(newFileRow);
                container.prepend(spec_block_before);
                container.append(spec_block_after);
                fieldValue.before(container);

                if ($('.user-data__new-line--files').find('.user-data__new-line--file').length > 1) {
                    $('.user-data__new-line--files').sortable({
                        axis: "y",
                        containment: ".user-data",
                        cursor: "move",
                        items: ".user-data__new-line--file",
                        opacity: 0.8,
                        stop: function (event, ui) {
                            let field_elem = $(ui.item).parents('.user-data__value-wrap').find('[id^=value');
                            let new_val = "";

                            $(ui.item).parents('.user-data__new-line--files').find('.user-data__new-line--file-name').each((i, el) => {
                                new_val += ($(el).text() + "\n");
                            });
                            field_elem.val(new_val);
                        }
                    });
                }
            }
            else {
                let container = fieldValue.parent();
                container.find('.user-data__new-line--files_spec').remove();
                container.find('.user-data__new-line--files').append(newFileRow);
                let spec_block_before = $('<div class="user-data__new-line--files_spec"></div>');
                let spec_block_after = $('<div class="user-data__new-line--files_spec"></div>');
                container.find('.user-data__new-line--files').prepend(spec_block_before);
                container.find('.user-data__new-line--files').append(spec_block_after);
            }
            form.find('.user-data__edit--add-file-form').prepend(formFilesInput);
            fileInfo.attr('count', ++filesCount);
        }

        if (maxSizeAbove.length > 0) {
            jalert(lang.max_filesize_exceeded_kb + ': ' + maxSize  + '\n\n' + maxSizeAbove.join('\n'));
        }
        if (errorExtentions.length > 0) {
            jalert(lang.wrong_extension + extValues + ':\n\n' + errorExtentions.join('\n'));
        }
        return;
    }

    if(show_fields['fields'][field_id]){
        if(show_fields['fields'][field_id].uniq_field == 1) {
            if(!fast_edit_uniq_check(field_id, line_id, table_id, allObjFiles[0]['name'])) {
                return;
            }
        }
    }

    let part = obj.attr('part');
    let objFiles = allObjFiles;
    let classNames = 'class="user-data__upload-rogress"';
    let progress_span = '<span class="upload_progress"></span>';
    let fileHref = '';
    const file_img = type === 'img';

    if (part == 'add_link_field') {
        progress_span = '';
        classNames = '';
    }

    if (objFiles) { // Новый режим многофайловость
        for (let i = 0; i < objFiles.length; i++) {
            let value = objFiles[i]['name'];
            let curFileSize = objFiles[i]['size'];
            let new_line = '';
            let imageDesc = '';
            const extPosition = value.lastIndexOf('.');
            const fileExtention = value.substr(extPosition + 1).toLowerCase();
            fileHref = 'open_file.php?field=' + field_id + '&line=' + line_id + '&file=' + encodeURIComponent(value);

            // Проверяем максимальный размер файла
            if (show_fields['fields'][field_id]) {
                maxSize = show_fields['fields'][field_id]['max_size'];

                if (maxSize && maxSize != 0 && maxSize * 1024 < curFileSize) {
                    maxSizeAbove.push(value);
                    continue;
                }
            }

            if (!file_img) {
                // Проверяем корректность расширения для файла
                if (show_fields['fields'][field_id]) {
                    const fileTypes = show_fields['fields'][field_id]['file_types'];

                    if (fileTypes) {
                        const typesArr = Object.keys(fileTypes);
                        extValues = ' (' + typesArr.join(', ') + ') ';

                        if (typesArr.indexOf(fileExtention) === -1) {
                            errorExtentions.push(value);
                            continue;
                        }
                    }
                }
            }

            if (!checkUploadingNewFile(field_id, objFiles[i])) continue;

            if (file_img) {
                imageDesc = ' file_img="1" ';
                fileHref += '&show=1';
            }

            new_line = $("<span class='view_cell_" + field_id + "_" + line_id + "_" + i + " user-data__file--progress-span'>" +
                            "<a href='" + fileHref + "' onclick='unUploadedFileWarning();' " +
                            "id='new_file_upload_" + field_id + "_" + line_id + "_" + i + "' " +
                            classNames + imageDesc + " title='" + value + "'>" + value + "</a>" + progress_span + "</span> ");

            $('#new_file_form_' + field_id + '_' + line_id + ', #edit-add-btn-' + field_id).hide(); // Скрываем кнопку "Добавить"
            if(isEditMode){
                $("[id^=field_edit" + field_id + "][class^=user-data__value-wrap]").append(new_line);
            }
            else {
                $("#view_cell_" + field_id).append(new_line);
            }
        }

        if (maxSizeAbove.length > 0) {
            jalert(lang.max_filesize_exceeded_kb + ': ' + maxSize  + '\n\n' + maxSizeAbove.join('\n'));
        }
        if (errorExtentions.length > 0) {
            jalert(lang.wrong_extension + extValues + ':\n\n' + errorExtentions.join('\n'));
        }
    } else {  // Старый режим
        // Если указан полный путь оставляем только имя файла
        let last_slash = -1;
        let last_slash_p1 = 0;
        let last_slash_p2 = -1;
        let new_line = '';
        let imageDesc = '';
        fileHref = 'open_file.php?field=' + field_id + '&line=' + line_id + '&file=' + encodeURIComponent(value);
        classNames = 'class="href_post user-data__upload-rogress"';

        while (1) {
            last_slash_p2 = value.indexOf('\\', last_slash_p1);
            if (last_slash_p2 == -1) break;
            last_slash_p1 = last_slash_p2 + 1;
            last_slash = last_slash_p2;
        }

        if (last_slash != -1) {
            value = value.substr(last_slash + 1, 1024 * 1024);
        }

        if (file_img) {
            imageDesc = ' file_img="1" ';
            fileHref += '&show=1';
        }

        new_line = $("<span class='view_cell_" + field_id + "_" + line_id + "_0 user-data__file--progress-span'>" +
                        "<a href='" + fileHref + "' onclick='unUploadedFileWarning();' " +
                        "id='new_file_upload_" + field_id + "_" + line_id + "_0' " +
                        classNames + imageDesc + " title='" + value + "'>" + value + "</a>" + progress_span + "</span> ");

        if(isEditMode){
            $("[id^=field_edit" + field_id).append(new_line);
        }
        else {
            $("#view_cell_" + field_id).append(new_line);
        }
    }

    if (part == 'add_link_field') return; // Ничего не сохраняем
    upload_in_progress = 1;

    $('#sbmt_file_form').submit(); // Отправляем форму для сохранения (iframe form)
    obj.val('');
}

function unUploadedFileWarning() {
    jalert(lang.file_wasnt_upload);
    return false;
}

function onupload_file_done(event) {
    let obj = event.target;
    if (!obj) obj = event.srcElement;
    let file_img, fname;
    let resp = obj.contentDocument.body.innerHTML;
    const resp_arr = str_replace("\n", "\r\n", resp.toString()).split("\r\n");

    if (upload_in_progress && resp) {
        upload_in_progress = 0;
        obj.src = '';
        // Проверка на ограничение размера
        const max_size_text = 'Warning: POST Content-Length of';
        const max_bytes_text = 'bytes exceeds the limit of ';
        const pos = resp.indexOf(max_size_text);
        let max_size_flag = false;

        if (pos != -1) { // Превышен максиамальный размер файла
            let p2 = resp.indexOf(max_bytes_text, pos);
            let max_size_mb = 'unknown';
            if (p2 != -1) {
                const msz = resp.substr(p2 + max_bytes_text.length, 1024);
                max_size_mb = intval(msz) / 1024 / 1024;
                max_size_mb = intval(max_size_mb) + (intval(max_size_mb * 10) / 10 - intval(max_size_mb)); // Округляем до десятых
            }
            jalert(lang.max_filesize_exceeded + ' - ' + max_size_mb + ' ' + lang.megabytes + '.');
            max_size_flag = true;
            p2 = resp.indexOf('saved|');
            resp = resp.substr(p2, 1024);
        }
        resp = trim(resp, "\r\n");
        const res_arr = resp.toString().split('|');
        const cur_table_id = res_arr[1];
        const field_id = res_arr[2];
        const line_id = res_arr[3];
        const dublicate = res_arr[5];
        const isSubtable = (cur_table_id !== table_id) && // Где были изменения - в подтаблице или в основной записи);
                            $('[id^=fast_edit_span_' + field_id + '_' + line_id + ']').length > 0;
        const isEditMode = $('#edit_block').css('display') === 'block';
        let i;
        let n_el;
        let drop_cur_file;

        if (res_arr[0] === 'saved' || res_arr[0] === 'message') { // файл успешно обработан, убираем индикатор загрузки
            for (i = 0; i < 10000; i++) {
                if (isSubtable) {
                    if ($('#new_file_upload_' + field_id + '_' + line_id + '_' + cur_subtable_id + '_' + i).length < 0) break;
                    n_el = $('#new_file_upload_' + field_id + '_' + line_id + '_' + cur_subtable_id + '_' + i);
                } else {
                    if ($('#new_file_upload_' + field_id + '_' + line_id + '_' + i).length < 0) break;
                    n_el = $('#new_file_upload_' + field_id + '_' + line_id + '_' + i);
                }
                fname = n_el.attr('title');
                file_img = n_el.attr('file_img');
                drop_cur_file = 0;

                if (max_size_flag) { // файл не сохранился, убираем его из списка
                    drop_cur_file = 1;
                } else {
                    // проверяем является ли файл дубликатом
                    $(n_el.parent().parent()).find('a').each(function () {
                        if ($(this) != n_el) {
                            if ($(this).html() == n_el.html()) {  // такой файл уже есть, убираем как дубликат
                                drop_cur_file = 1;
                            }
                        }
                    })
                }

                if (!isSubtable) {
                    $('div[id^="view_cell_' + field_id + '"]').find('.user-data__file-wrap--view').remove(); // Быстрое редактирование
                    $('div[id^="field_edit' + field_id + '"]').find('.user-data__file-wrap--view').remove(); // Полное редактирование
                }

                if (drop_cur_file) { // удаляем файл из списка
                    if (isSubtable) {
                        $('.fast_edit_span_' + field_id + '_' + line_id + i).remove();
                    }
                    $('.user-data__file--progress-span').remove();
                } else {
                    // Меняем стиль файла на обычный
                    if (isSubtable) {
                        $('.fast_edit_span_' + field_id + '_' + line_id + i).each(function () {
                            alink = $(this).find('a');
                            $(alink).css('background', '');
                            $(alink).attr('field_id', field_id);
                            $(alink).attr('line_id', line_id);
                            $(alink).attr('id', 'fast_edit_span_' + field_id + '_' + line_id + i);
                            if (file_img == '1') {
                                $(alink).click(function () {
                                    image_window = window.open('open_file.php?field="+field_id+"&line="+line_id+"&file="+encodeURIComponent(fname)+"&show=1',
                                                               '',
                                                               'width=,height=,menubar=1,scrollbars=1,resizable=1,status=1');
                                    image_window.focus();
                                    return false;
                                });
                                $(alink).html("<img src='cache/" + cur_table_id + "_" + field_id + "_" + line_id + "_" + utf2eng(fname) +
                                              ".png' class='sub_fast_edit_img'>");
                            } else {
                                alink.onclick = '';
                            }

                            $(this).find('span').addClass('b_drop_hoverpopup').attr('title', lang.Delete).attr('num', i + 1);
                            addHandler_file(document.getElementById('fast_edit_span_' + field_id + '_' + line_id + i));
                        });
                    } else {
                        $('#view_cell_' + field_id + '_' + line_id).each(function () {
                            alink = $(this).find('a');
                            $(alink).css('background', '');
                            $(alink).attr('field_id', field_id);
                            $(alink).attr('line_id', line_id);
                            $(alink).attr('id', 'fast_edit_span_' + field_id + '_' + line_id + i);
                            if (file_img == '1') {
                                $(alink).click(function () {
                                    image_window = window.open('open_file.php?field="+field_id+"&line="+line_id+"&file="+encodeURIComponent(fname)+"&show=1',
                                                               '',
                                                               'width=,height=,menubar=1,scrollbars=1,resizable=1,status=1');
                                    image_window.focus();
                                    return false;
                                });
                                $(alink).html("<img src='cache/" + table_id + "_" + field_id + "_" + line_id + "_" + utf2eng(fname) + ".png'>");
                            } else {
                                alink.onclick = '';
                            }

                            $(this).find('span').addClass('b_drop_hoverpopup').attr('title', lang.Delete);
                        });
                    }
                    $('.user-data__file--progress-span').remove();
                }
            }
            $('#new_file_form_' + field_id + '_' + line_id + ', #edit-add-btn-' + field_id).show(); // Отображаем кнопку "Добавить"
            UpdateData(resp_arr);
            if (dublicate) {
                if (dublicate === '0' && !isEditMode) displayNotification(lang.Success_save_notif, 1);
            }
        }
    }
    return;
}

/**
 * Инициализация datetimepicker`ов
 */
function fill_datetime() {
    $('.add_link_block_datetime input, .datetime_textpad input').removeClass('datepicker');
    $('.datetime_textpad input').addClass('fast_edit_datetime'); //в случае с быстрым редактированием поля с отображением времени нужно повесить доп. проверку
    $('.add_link_block_datetime').html($('.add_link_block_datetime span').html()); //убираем span в случае с отображением времени, иначе вылезает баг с автозакрытием календаря

    $("#schedule_span_wrapper .datepicker").datepicker({
        showOn: "button",
        dateFormat: lang.date_js_format,
        buttonImage: "images/calbtn.png",
        showAlways: true,
        buttonImageOnly: true,
        buttonText: lang.Calendar,
        showAnim: (('\v' == 'v') ? "" : "show") // в ie не включаем анимацию, тормозит
    }).attr('placeholder', lang.date_placeholder);

    $(".user-data .datepicker").datepicker({
        showOn: "button",
        dateFormat: lang.date_js_format,
        buttonImage: "images/calbtn.png",
        buttonImageOnly: true,
        buttonText: lang.Calendar,
        showAnim: (('\v' == 'v') ? "" : "show")  // в ie не включаем анимацию, тормозит
    }).attr('placeholder', lang.date_placeholder);

    $(".user-data .datetimepicker, .user-data .add_link_block_datetime input").datetimepicker({
        showOn: "button",
        dateFormat: lang.date_js_format,
        timeFormat: "HH:mm",
        buttonImage: "images/calbtn.png",
        buttonImageOnly: true,
        buttonText: lang.Calendar,
        showAnim: (('\v' == 'v') ? "" : "show")  // в ie не включаем анимацию, тормозит
    }).attr('placeholder', lang.datetime_placeholder);

    $(".onlyDatePicker").change(function (e) {
        var myVal = $(this).val().toString().trim();
        $(this).val(myVal.substring(0, 10));
    });
}

// Всплывающая справка по полю
var help_viewed = false;
var help_hided = false;
var h_init = false;
var v_init = false;
var pre_id = "";

function viewHelp(fieldId) {
    if (h_init) clearTimeout(h_init);

    if (help_viewed) return;

    help_viewed = true;

    if (cur_mode == 'edit') pre_id = "e";
    else pre_id = "";

    document.getElementById(pre_id + "f_tooltip" + fieldId).style.display = "block";
    document.getElementById(pre_id + "f_tooltip" + fieldId).style.textAlign = "center";
    document.getElementById(pre_id + "f_tooltip" + fieldId).innerHTML = "<img src=\"images/indicator.gif\" alt=\"\" style=\"vertical-align: middle\" /> <i>" + lang.Help_load + "</i>";

    $.ajax({
        url: "help.php",
        data: { "tooltip": fieldId },
        dataType: "json",
        success: function (data) {
            if (data) {
                document.getElementById(pre_id + "f_tooltip" + fieldId).innerHTML = "<b>" + data.name + "</b><div>" + data.help + "</div>";
                document.getElementById(pre_id + "f_tooltip" + fieldId).style.textAlign = "left";
            }
            else
                jalert("JSON parse error");
        }
    });
}

function hideHelpInit(fieldId) {
    if (v_init) clearTimeout(v_init);
    str_to = "hideHelp(" + fieldId + ")";
    h_init = setTimeout(str_to, 200);
}

function hideHelp(fieldId) {
    help_viewed = false;
    document.getElementById(pre_id + "f_tooltip" + fieldId).style.display = "none";
}

// Для подтаблицы

function sviewHelp(fieldId) {
    if (h_init) clearTimeout(h_init);

    if (help_viewed) return;

    help_viewed = true;

    pre_id = "s";

    document.getElementById(pre_id + "f_tooltip" + fieldId).style.display = "block";
    document.getElementById(pre_id + "f_tooltip" + fieldId).style.textAlign = "center";
    document.getElementById(pre_id + "f_tooltip" + fieldId).innerHTML = "<img src=\"images/indicator.gif\" alt=\"\" style=\"vertical-align: middle\" /> <i>" + lang.Help_load + "</i>";

    $.ajax({
        url: "help.php",
        data: { "tooltip": fieldId },
        dataType: "json",
        success: function (data) {
            if (data) {
                document.getElementById(pre_id + "f_tooltip" + fieldId).innerHTML = "<b>" + data.name + "</b><div>" + data.help + "</div>";
                document.getElementById(pre_id + "f_tooltip" + fieldId).style.textAlign = "left";
            }
            else
                jalert("JSON parse error");
        }
    });
}

function shideHelpInit(fieldId) {
    if (v_init) clearTimeout(v_init);
    str_to = "shideHelp(" + fieldId + ")";
    h_init = setTimeout(str_to, 200);
}

function shideHelp(fieldId) {
    help_viewed = false;
    document.getElementById(pre_id + "f_tooltip" + fieldId).style.display = "none";
}

function open_dialog(mode) {
    var obj = {};
    obj.modal = true;
    var mode_txt;
    var img = '';
    if (mode == 'print') mode_txt = lang.select_print_template;
    else if (mode == 'send') mode_txt = lang.select_mail_template;
    else if (mode == 'sms') mode_txt = lang.select_sms_template;
    else if (mode == 'msg') mode_txt = lang.select_msg_template;
    else if (mode == 'rel_tab_list') mode_txt = lang.rel_tables_list;
    else if (mode == 'sync_list') mode_txt = lang.Sync;

    if (cogwheel_status == 0 || mode == 'send' || mode == 'search' || mode == 'sms' || mode == 'msg') {
        img = '<img alt="" src="images/settings_a.gif" name="d_par' + mode + '" border="0" onMouseOver="window.document.images[\'d_par' + mode + '\'].src=\'images/settings_b.gif\';" onMouseOut="window.document.images[\'d_par' + mode + '\'].src=\'images/settings_a.gif\';" style="margin-left:10px; margin-top:-7px;"/>';
    }

    obj.title = '<table cellpadding="0" cellspacing="0"><tr><td height="10"><p style="font-size:16px; font-weight:normal; color:#999; margin-top:3px; padding-left:8px;"> ' + mode_txt + '</p></td><td><a style="text-decoration:none;" target="_blank" href="view_line2.php?table=' + table_id + rel_table_link + rel_line_link + rel_field_link + filter_link + page_link + archive_link + deleted_link + all_rec_link + '&line=' + line_id + '&op=' + mode + '&back_url=' + base64_current_url + '">' + img + '</a></td></tr></table>';
    obj.width = 350;
    obj.draggable = false;
    obj.resizable = false;

    if (mode == 'rel_tab_list' || mode == 'sync_list') {
        img = '';
        obj.title = '<table cellpadding="0" cellspacing="0"><tr><td height="10"><p style="font-size:16px; font-weight:normal; color:#999; margin-top:3px; padding-left:8px;"> ' + mode_txt + '</p></td></tr></table>';
    }

    obj.open = function (event, ui) {
        $(this).parent().find('.ui-dialog-title').html(obj.title);
    };
    $("#dialog_" + mode).dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();
    $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
    $('.ui-dialog-titlebar-close').text('');
    overlayHandler();
    $("div.ui-dialog").focus();
    return false;
}

function dial_form(op, id, type, warning, ignore, scheduled, confirm_dispatch) {

    if (warning) {
        jalert(warning);
        return;
    }
    $('#dialog_' + op).dialog('close');
    var v_href = "view_line2.php?table=" + table_id + rel_table_link + rel_line_link + rel_field_link + archive_link + deleted_link + all_rec_link + page_link + "&line=" + line_id + "&op=" + op + "&form=" + id + "&form_type=" + type;

    //вывод стандартной печати записи
    if (op == 'print' && type == 3 && id == 100501) {
        $("img.settings_t").addClass('no_print');
        $(".subtable_buttons").addClass('no_print');
        $("#footback_div_id").addClass('no_print');

        window.print();
        return;
    }

    if (biz_proc) {
        if (op == biz_proc['action']) {
            allow_out_bizproc = 1;
            if (op == "print" && (type == -1 || type == 1 || type == 2))
                location.href = "view_line2.php?table=" + table_id + rel_table_link + rel_line_link + rel_field_link + archive_link + deleted_link + all_rec_link + page_link + "&line=" + line_id + biz_proc_link;
            else
                v_href += biz_proc_link;
        }
    }
    var form_id = document.getElementById('form_id'),
        form_type = document.getElementById('form_type'),
        form_op = document.getElementById('form_op');
    if (id == -2) {
        var obj = {};
        obj.modal = true;
        obj.title = '<table cellpadding="0" cellspacing="0"><tr><td height="10"><p style="font-size:16px; font-weight:normal; color:#999; margin-top:3px; padding-left:8px;"> Отправка свободного шаблона ';
        if (op == 'sms') obj.title += 'смс';
        else obj.title += 'рассылки';
        obj.title += '</p></td></tr></table>';
        obj.width = 450;
        obj.draggable = false;
        obj.resizable = false;
        obj.open = function (event, ui) {
            $(this).parent().find('.ui-dialog-title').html(obj.title);
        };
        $("#dialog_free_" + op).dialog(obj);
        $('.ui-icon-closethick').remove();
        $('.ui-button-icon-space').remove();
        $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
        $('.ui-dialog-titlebar-close').text('');
        overlayHandler();
        $(window).on('resize', overlayHandler);
        $("div.ui-dialog").focus();
    } else {
        if (scheduled == 1) {
            var obj = {};
            obj.modal = true;
            obj.title = '<table cellpadding="0" cellspacing="0"><tr><td height="10"><p style="font-size:16px; font-weight:normal; color:#999; margin-top:3px; padding-left:8px;"> Выберите дату и время отправки<span id=""></span> ';
            obj.title += '</p></td></tr></table>';
            obj.width = 450;
            obj.draggable = false;
            obj.resizable = false;
            obj.open = function (event, ui) {
                $(this).parent().find('.ui-dialog-title').html(obj.title);
            };
            $("#dialog_date").dialog(obj);
            $('.ui-icon-closethick').remove();
            $('.ui-button-icon-space').remove();
            $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
            $('.ui-dialog-titlebar-close').text('');
            overlayHandler();
            $(window).on('resize', overlayHandler);
            $("div.ui-dialog").focus();
            form_id.value = id;
            form_type.value = type;
            form_op.value = op;
            var now_date = new Date();
            var str = (now_date.getDate() < 10 ? '0' + now_date.getDate().toString() : now_date.getDate().toString()) + '.' + (now_date.getMonth() + 1 < 10 ? '0' + (now_date.getMonth() + 1).toString() : (now_date.getMonth() + 1).toString()) + '.' + now_date.getFullYear().toString() + ' ' + (now_date.getHours() < 10 ? '0' + now_date.getHours().toString() : now_date.getHours().toString()) + ':' + (now_date.getMinutes() < 10 ? '0' + now_date.getMinutes().toString() : now_date.getMinutes().toString());
            document.getElementById('schedule_send_span').value = str;
        } else {
            if (id == -3) {
                if (op == 'send') {
                    document.getElementById('form_subj_send').value = document.getElementById('free_subj_send').value;
                    document.getElementById('form_text_send').value = document.getElementById('free_text_send').value;
                }
                if (op == 'sms') {
                    document.getElementById('form_text_sms').value = document.getElementById('free_text_sms').value;

                }
                document.getElementById('edit_form').action += '&op=' + op + '&form=-3';
                document.getElementById('edit_form').submit();
            } else {
                if (scheduled != 0 && scheduled != undefined) {
                    document.getElementById('form_scheduled_time').value = scheduled;
                    document.getElementById('edit_form').action += '&op=' + form_op.value + '&form=' + form_id.value + '&form_type=' + form_type.value;
                    ;
                    document.getElementById('edit_form').submit();
                } else {
                    if (op == "print" && (type == -1 || type == 1 || type == 2)) window.open(v_href); else location.href = v_href;
                }
            }
        }
    }
}

function get_date_data() {
    $("div.ui-widget-overlay").on("click", function () {
        $("div[id^='dialog_']").dialog('close');
    });
    $("input[name='group1']").change(function (e) {
        var now_date = new Date();
        var str = (now_date.getDate() < 10 ? '0' + now_date.getDate().toString() : now_date.getDate().toString()) + '.' + (now_date.getMonth() + 1 < 10 ? '0' + (now_date.getMonth() + 1).toString() : (now_date.getMonth() + 1).toString()) + '.' + now_date.getFullYear().toString() + ' ' + (now_date.getHours() < 10 ? '0' + now_date.getHours().toString() : now_date.getHours().toString()) + ':' + (now_date.getMinutes() < 10 ? '0' + now_date.getMinutes().toString() : now_date.getMinutes().toString());

        if ($(this).val() == '0') {
            $("#schedule_span_wrapper").prop('disabled', true);
            $("#schedule_span_wrapper").hide();
            document.getElementById('schedule_send_span').value = str;
        } else {
            $("#schedule_span_wrapper").show();
            $("#schedule_span_wrapper").prop('disabled', false);
        }

    });
}

function ajax_uniq_search(field_id, type_field, name_field, async) {
    var value = $('#value' + field_id).val();
    if (cur_mode === 'view') {
        if (type_field == 6) {
            if ($(`#view_cell_${field_id} .whitespace_nowrap`)){
                $(`#view_cell_${field_id} .whitespace_nowrap`).each(function(el){
                    value += `${$(el).find('a').text()}\n`;
                })
            } else if($(`#view_cell_${field_id} a`)){
                $(`#view_cell_${field_id} a`).each(function(el){
                    value += `${$(el).text()}\n`;
                })
            }
        } else if (type_field == 9) {
            if ($(`#view_cell_${field_id} .whitespace_nowrap`)){
                $(`#view_cell_${field_id} .user-data__file-wrap`).each(function(el){
                    value += `${$(el).find('a').attr('title')}\n`;
                })
            } else if($(`#view_cell_${field_id} a`)){
                $(`#view_cell_${field_id} a`).each(function(el){
                    value += `${$(el).attr('data-caption')}\n`;
                })
            }
        }
    }


    var disp_value = value;
    if (type_field == 5) disp_value = $('#edit_value' + field_id).val();
    if (type_field == 7 || type_field == 14) disp_value = $('#value' + field_id + ' [value=' + value + ']').html();

    if (value) {
        $.ajax({
            url: "view_line2.php?ajax_uniq_search",
            data: {
                table: table_id,
                line: line_id,
                field: field_id,
                value: value
            },
            success: function (data) {
                if (data.found) {
                    var stat_txt = "";
                    if (data.status == 1) var stat_txt = " (в архиве)";
                    if (data.status == 2) var stat_txt = " (в удаленных)";
                    $("#jalert").dialog('close');
                    displayNotification(lang.ajax_dbl_msg1 + ' "' + disp_value + '" ' + lang.ajax_dbl_msg2 + ' "' + name_field + '" ' + lang.ajax_dbl_msg3 + ' <a href="view_line2.php?table=' + table_id + '&line=' + data.id + '" target=_blank>' + lang.ajax_dbl_msg4 + '</a>' + stat_txt + '.<br><br>' + lang.ajax_dbl_msg5, 2);
                    $("#field_edit" + field_id).addClass('user-data__row--incorrect');
                    double_found = 1;
                }
                else {
                    $("#field_edit" + field_id).removeClass('user-data__row--incorrect');
                    double_found = 0;
                }
            },
            dataType: 'json',
            async: false
        });
    }
    else {
        $("#field_edit" + field_id).css("background-color", "#fff");
        $("#field_edit" + field_id + " b").css("color", "black");
        double_found = 0;
    }
}
function select_copy_subtables() {
    var message = lang.copy_sublines_confirm + '<br>';
    copy_subtables.forEach(function (subtable) {
        message += '<br>' + '<input type=checkbox ' + (document.getElementById('copy_subtable_' + subtable['id']).value == 1 ? 'checked' : '') + ' onclick="document.getElementById(\'copy_subtable_' + subtable['id'] + '\').value=this.checked?1:0">' + subtable['name'];
    });

    jconfirm(message, save_line, cancel_copy_subtables);
}

function cancel_copy_subtables() {
    copy_subtables.forEach(function (subtable) {
        document.getElementById('copy_subtable_' + subtable['id']).value = 0;
    });
    save_line(true);
}

function init_ac_on_viewline(user_data_autocomplete, is_edit) {
    if (user_data_autocomplete.length > 0) {
        var filter_link = (filter_id) ? '&filter=' + filter_id : '';
        user_data_autocomplete.each(function (i, item) {
            var select = $(item);
            var field_id = select.attr('field_id');
            var autocomplete = select.parent().find('.autocomplete__input');
            var autocomplete_btn = autocomplete.next();
            var parent_link = select.attr('parent_link');
            var timeout;
            const acValue = $(item).attr('ac_value').replace(/&quot;/g, '"');
            autocomplete.val(acValue);

            var fieldsOnAutocompleteClick = function () { };
            // var fieldsBtnOnAutocompleteClick = function () { };

            setFieldsSearchLinkAttr(select, autocomplete);

            if (parent_link && parent_link !== '') {
                autocomplete.on('keyup', function (e) {
                    fields_find_link_fields(select);
                    var word = '&q=';
                    if (autocomplete.val() !== '') {
                        word += encodeURIComponent(autocomplete.val());
                    }
                    var filter = $(this).parent().prev();
                    var filter_value = filter.attr('parent_link');
                    var parent_field;
                    if (filter.attr('id') === ('combobox_' + filter.attr('field_id'))) {
                        parent_field = $("#combobox_" + filter_value);
                    } else {
                        parent_field = $('#value' + filter_value);
                    }
                    if (parent_field.length != 0) {
                        var parent_prev_val = $(parent_field).next().find('.autocomplete__input').val();
                        var parent_select_val;
                        if (parent_field.val() === null || parent_field.val() === 'undefined' || parent_field.val() === '') {
                            parent_select_val = parent_field.attr('ac_hidden_val');
                        } else {
                            parent_select_val = parent_field.val();
                        }

                        if ((parent_prev_val === null || parent_prev_val === undefined || parent_prev_val === '') && (word === '&q=')) {
                            word = '';
                            parent_select_val = undefined;
                        } else if (parent_prev_val === null || parent_prev_val === undefined || parent_prev_val === '') {
                            parent_select_val = undefined;
                        }
                    } else {
                        parent_select_val = filter.attr('parent_filter');
                    }

                    var url_by_word = 'select_value.php?field=' + $(this).parent().prev().attr('field_id') + '&filter_value=' + parent_select_val + word + '&line=' + line_id;
                    if (e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 27 || e.keyCode === 40 || e.keyCode === 37 ||
                        e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 20 || e.keyCode === 13) {
                        return;
                    }
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        autocomplete_ajax_request(select, url_by_word, false, true);
                    }, 100);
                });

                fieldsOnAutocompleteClick = function () {
                    var word = '&q=';
                    if (autocomplete.val() !== '') {
                        word += encodeURIComponent(autocomplete.val());
                    }
                    var filter = $(this).parent().prev();
                    var filter_value = filter.attr('parent_link');
                    var parent_field;
                    if (filter.attr('id') === ('combobox_' + filter.attr('field_id'))) {
                        parent_field = $("#combobox_" + filter_value);
                    } else {
                        parent_field = $('#value' + filter_value);
                    }
                    if (parent_field.length != 0) {
                        var parent_prev_val = $(parent_field).next().find('.autocomplete__input').val();

                        if (parent_field.val() === null || parent_field.val() === 'undefined' || parent_field.val().replace(/\s/g, '') === '') {
                            parent_select_val = parent_field.attr('ac_hidden_val');
                        } else {
                            parent_select_val = parent_field.val();
                        }

                        if ((parent_prev_val === null || parent_prev_val === undefined || parent_prev_val.replace(/\s/g, '') === '') && (word === '&q=')) {
                            word = '';
                            parent_select_val = undefined;
                        } else if (parent_prev_val === null || parent_prev_val === undefined || parent_prev_val.replace(/\s/g, '') === '') {
                            parent_select_val = undefined;
                        }
                    } else {
                        parent_select_val = 0;
                    }
                    //добавляем фильтр по записи: если фильтр null или undefined - то не передаем этот параметр в запросе
                    let filter_param = parent_select_val ? '&filter_value=' + parent_select_val : '';
                    var autocomplete_url = 'select_value.php?field=' + $(this).parent().prev().attr('field_id') + filter_param + '&line=' + line_id;

                    autocomplete_ajax_request(select, autocomplete_url, false, true);
                };

                fieldsBtnOnAutocompleteClick = function () {

                    var filter = $(this).parent().prev();
                    var filter_value = filter.attr('parent_link');
                    var parent_field;
                    if (filter.attr('id') === ('combobox_' + filter.attr('field_id'))) {
                        parent_field = $("#combobox_" + filter_value);
                    } else {
                        parent_field = $('#value' + filter_value);
                    }
                    if (parent_field.length != 0) {
                        var parent_prev_val = $(parent_field).next().find('.autocomplete__input').val();

                        if (parent_field.val() === null || parent_field.val() === 'undefined' || parent_field.val() === '') {
                            parent_select_val = parent_field.attr('ac_hidden_val');
                        } else {
                            parent_select_val = parent_field.val();
                        }

                        if (parent_prev_val === null || parent_prev_val === undefined || parent_prev_val === '') {
                            parent_select_val = undefined;
                        }
                    } else {
                        parent_select_val = filter.attr('parent_filter');
                    }

                    var autocomplete_url = 'select_value.php?field=' + $(this).parent().prev().attr('field_id') + '&filter_value=' + parent_select_val + '&line=' + line_id;

                    autocomplete_ajax_request(select, autocomplete_url, false, true);
                };

                // Для поля и для кнопки функционал один и тот же
                autocomplete.on('click', fieldsOnAutocompleteClick);
                autocomplete_btn.on('click', fieldsOnAutocompleteClick);
            } else {
                autocomplete.on('keyup', function (e) {
                    var word = '&q=';
                    if (autocomplete.val() !== '') {
                        word += encodeURIComponent(autocomplete.val());
                    }

                    var url_by_word = 'select_value.php?field=' + $(this).parent().prev().attr('field_id') + '&line=' + line_id + word;
                    if (e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 16 || e.keyCode === 27 || e.keyCode === 40 || e.keyCode === 37 ||
                        e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 9 || e.keyCode === 20 || e.keyCode === 13) {
                        return;
                    }
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        autocomplete_ajax_request(select, url_by_word, false, true);
                    }, 10);
                });

                fieldsOnAutocompleteClick = function () {
                    var word = '&q=';
                    if (autocomplete.val() !== '') {
                        word += encodeURIComponent(autocomplete.val());
                    }
                    if (word === '&q=') {
                        word = '';
                    }
                    var autocomplete_url = 'select_value.php?field=' + $(this).parent().prev().attr('field_id') + '&line=' + line_id;
                    autocomplete_ajax_request(select, autocomplete_url, false, true);
                };
                fieldsBtnOnAutocompleteClick = function () {
                    var autocomplete_url = 'select_value.php?field=' + $(this).parent().prev().attr('field_id');
                    autocomplete_ajax_request(select, autocomplete_url, false, true);
                };

                // Для поля и для кнопки функционал один и тот же
                autocomplete.on('click', fieldsOnAutocompleteClick);
                autocomplete_btn.on('click', fieldsOnAutocompleteClick);
            }
        });
    }
}

function setFieldsSearchLinkAttr(select, autocomplete) {
    autocomplete.on('blur', function () {
        if (select.val() !== null) {
            if (select.attr('ac_hidden_val') !== select.val()) {

                select.attr('ac_hidden_val', select.val());
                if (select.attr('child_link')) {
                    //fields_find_link_fields(select);
                }
            }
        }
    })
}

function fields_find_link_fields(element) {
    const child_field_link = element.attr('child_link');
    let trigger = false;

    if (child_field_link) {
        let child_field_fast_edit = $('#combobox_' + child_field_link);
        let child_field_not_fast_edit = $('#value' + child_field_link);

        if (child_field_fast_edit) {
            child_field_fast_edit.parent().find('.autocomplete__input').val('');
            child_field_fast_edit.find('option').remove().end();
            child_field_fast_edit.val('');
            trigger = true;
        }
        if (child_field_not_fast_edit) {
            child_field_not_fast_edit.parent().find('.autocomplete__input').val('');
            child_field_not_fast_edit.find('option').remove().end();
            child_field_not_fast_edit.val('');
            trigger = true;
        }
        if (trigger) {
            fields_find_link_fields(child_field_fast_edit);
        }
        if (element.attr('id') === ('combobox_' + element.attr('field_id'))) {
            var child = child_field_fast_edit.parent().parent().parent();
            if (child.find('.autocomplete_val').attr('href')) {
                child.find('.autocomplete_val').attr('href', "");
                child.find('.autocomplete_val').text('');
            } else {
                child.find('.autocomplete_val').text('');
            }
            if (child.find('.show_field_slave')) {
                child.find('.show_field_slave').text('')
            }
            save_value(child_field_fast_edit.attr('field_id'), child_field_fast_edit.attr('line_id'), child_field_fast_edit.value);
        }
    }
}

/**
 * Метод, инициализирующий уникальные поля
 * @returns {{}}
 */
function init_all_uniq_fields() {
    var result = {};
    let allSubFields = {};

    if (cur_subtable) {
        if (curSubtableId === -1) curSubtableId = cur_subtable['table_id'];

        if (curSubtableId !== void 0) {
            // Получение списка всех полей для текущей подтаблицы
            $.ajax({
                url: "update_value.php?show_fields&table=" + curSubtableId + "&line=" + line_id,
                type: "GET",
                async: false,
                success: function (response) {
                    allSubFields = JSON.parse(response);
                }
            });

            if (allSubFields['fields']) {
                for (let subField in allSubFields['fields']) {
                    let obj = allSubFields['fields'][subField];
                    if (obj) {
                        if ((obj['write'] || obj['view_edit']) && obj['uniq_field'] == 1) {
                            result[obj['id']] = {
                                'type_field': obj['type_field'],
                                'name_field': obj['name_field']
                            }
                        }
                    }
                }
            }
        }
    }


    if (show_fields['fields']) {
        for (var field in show_fields['fields']) {
            var obj = show_fields['fields'][field];
            if (obj) {
                if ((obj['write'] || obj['view_edit']) && obj['uniq_field'] == 1) {
                    result[obj['id']] = {
                        'type_field': obj['type_field'],
                        'name_field': obj['name_field']
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Метод заполняющий id полей в просмотре
 * @returns {Array}
 */
function init_id_fields() {
    var result = [];

    if (show_fields['fields']) {
        for (var field in show_fields['fields']) {
            //if (show_fields['fields'][field]['main'] == 1) {
                result.push(field);
            //}
        }
    }

    return result;
}

function init_events_on_viewline() {
    var actionBtns = document.querySelectorAll('.action-btns');
    var backToVision = $('.action-btns__item--back-to-vision');

    $('.user-data__item-header').on('click', function (e) {
        e.preventDefault();
        var table = $(this).siblings('.user-data__table');
        var btn = $(this).children('.user-data__dropdown-btn');

        if (table.css('display') === 'none') {
            btn.removeClass('user-data__dropdown-btn--opened');
        } else {
            btn.addClass('user-data__dropdown-btn--opened');
        }

        table.slideToggle();
    });

    $('.connected-tables__dropdown-btn').on('click', function (e) {
        e.preventDefault();
        $(this).siblings('.connected-tables__dropdown-menu').slideToggle();
        $(this).toggleClass('connected-tables__dropdown-btn--closed');
    });

    $('.connected-tables__show-more').on('click', function (e) {
        e.preventDefault();
        $(this).siblings('.connected-tables__dropdown-menu-all').slideToggle();
        if ($(this).text() === lang.Show_more) {
            $(this).text(lang.Hide);
            $.cookie('view_buttons' + table_id, 1, { expires: 30 });
        } else {
            $(this).text(lang.Show_more);
            $.cookie('view_buttons' + table_id, null);
        }
    });

    $('.connected-tables-frame__show-more').on('click', function (e) {
        e.preventDefault();
        $(this).siblings('.connected-tables__dropdown-menu-all').slideToggle();
        if ($(this).text() === lang.Show_more) {
            $(this).text(lang.Hide);
            $.cookie('view_buttons' + table_id, 1, { expires: 30 });
        } else {
            $(this).text(lang.Show_more);
            $.cookie('view_buttons' + table_id, null);
        }
    });

    $('.action-btns__item--additional').on('click', function (e) {
        e.preventDefault();
        $(this).siblings('.action-btns__hidden-btns').slideToggle();
    });

    $('.action-btns__item--dropdown').on('click', function (e) {
        $(this).parent().next().slideToggle();
    });
    $('.action-btns__item--edit').on('click', function (e) {
        check_for_change_values();
        if (!is_changed_fast_edit) {
            isActionBtnsSimple = false;
            $('.action-btns__relative>div').css({
                'width': '222px',
                'left': $('.action-btns__relative').offset().left + 'px'
            });
            if (isScrolled) {
                offsetTop = $('.action-btns--simple .action-btns__relative>div').offset().top;
                offsetWindow = $(window).scrollTop();
                if (this.className.indexOf('disbled_edit') == -1) switch_mode('edit');
                if (offsetWindow >= 223) {
                    $(window).scrollTop(offsetTop + 1);
                } else {
                    $('.action-btns__relative>div').addClass('position-stop');
                    $('.action-btns__relative>div').css('left', 0);
                }
            } else {
                if (this.className.indexOf('disbled_edit') == -1) switch_mode('edit');
            }
            wrappingSelfRows();
        } else {
            var current_url = location.href;
            location.href = current_url + '&edit_mode=on';
        }

        $('.select2-plugin').select2({ajax: _s2_ajax()});
    });

    backToVision.on('click', function (e) {
        setTimeout(() => $('.select2-plugin').select2({ajax: _s2_ajax()}), 1); // надо править
        isActionBtnsSimple = true;
        $('.action-btns__relative>div').css({
            'width': '222px',
            'left': $('.action-btns__relative').offset().left + 'px'
        });

        if (isScrolled) {
            offsetTop = $('.action-btns--edit .action-btns__relative>div').offset().top;
            offsetWindow = $(window).scrollTop();
            go_to_view();
            if (offsetWindow >= 223) {
                $(window).scrollTop(offsetTop - 1);
            } else {
                $('.action-btns__relative>div').addClass('position-stop');
            }
        } else {
            go_to_view();
            return false;
        }
    });

    /**
     * Кусок кода отвечающий за фиксацию кнопок бокового поля в view_line
     */
    Array.prototype.slice.call(document.querySelectorAll('.action-btns__relative')).forEach(function (a) {   // селекторы блоков, которые будут фиксироваться. Может быть как один блок, так два и более
        var b = null, P = 0, topCoordinates = 81;
        window.addEventListener('scroll', Ascroll, false);
        if(fixedSubtablesHeaders){
            document.addEventListener('scroll', fixSubtablesHeader, false);
        }
        function Ascroll() {
            isScrolled = true;
            if (isActionBtnsSimple) {
                var first_btn = actionBtns[0].querySelector('.action-btns>.action-btns__item');
                if (first_btn) {
                    if (actionBtns[0].getBoundingClientRect().top < 0 && actionBtns[0].getBoundingClientRect().top > -topCoordinates) {
                        first_btn.style.marginTop = (topCoordinates + actionBtns[0].getBoundingClientRect().top) + 'px';
                    } else {
                        first_btn.style.marginTop = 0 + 'px';
                    }
                }
            } else {
                var first_btn = actionBtns[1].querySelector('.action-btns>.action-btns__item');
                if (first_btn) {
                    if (actionBtns[1].getBoundingClientRect().top < 0 && actionBtns[1].getBoundingClientRect().top > -topCoordinates) {
                        first_btn.style.marginTop = (topCoordinates + actionBtns[1].getBoundingClientRect().top) + 'px';
                    } else {
                        first_btn.style.marginTop = 0 + 'px';
                    }
                }
            }

            if (b == null) {
                var Sa = getComputedStyle(a, ''), s = '';
                for (var i = 0; i < Sa.length; i++) {
                    if (Sa[i].indexOf('overflow') == 0 || Sa[i].indexOf('padding') == 0 || Sa[i].indexOf('border') == 0 || Sa[i].indexOf('outline') == 0 || Sa[i].indexOf('box-shadow') == 0 || Sa[i].indexOf('background') == 0) {
                        s += Sa[i] + ': ' + Sa.getPropertyValue(Sa[i]) + '; '
                    }
                }
                b = document.createElement('div');
                b.style.cssText = s + 'box-sizing: border-box; width: 222px;';
                a.insertBefore(b, a.firstChild);
                var l = a.childNodes.length;
                for (var i = 1; i < l; i++) {
                    b.appendChild(a.childNodes[1]);
                }
            }
            if (document.querySelector('.subtable__outer-wrap')) {
                var Ra = a.getBoundingClientRect(),
                    R = Math.round(Ra.top + b.getBoundingClientRect().height - document.querySelector('.subtable__outer-wrap').getBoundingClientRect().top + 0);
                if ((Ra.top - P) <= 0) {
                    if ((Ra.top - P) <= R) {
                        b.className = 'position-sticky';
                        b.style.top = P + 'px';
                        b.style.left = Ra.left + 'px';
                        b.style.opacity = '0';
                    } else {
                        b.className = 'position-sticky';
                        b.style.top = P + 'px';
                        b.style.left = Ra.left + 'px';
                        b.style.opacity = '1';
                    }
                } else {
                    b.className = '';
                    b.style.top = '';
                    b.style.left = '';
                    b.style.opacity = '1';
                }
                window.addEventListener('resize', function () {
                    a.children[0].style.width = getComputedStyle(a, '').width;
                }, false);
                a.style.padding = '0';
            } else {
                var Ra = a.getBoundingClientRect();
                if ((Ra.top - P) <= 0) {
                    b.className = 'position-sticky';
                    b.style.top = P + 'px';
                    b.style.left = Ra.left + 'px';
                } else {
                    b.className = '';
                    b.style.top = '';
                    b.style.left = '';
                }
                window.addEventListener('resize', function () {
                    a.children[0].style.width = getComputedStyle(a, '').width;
                }, false);
                a.style.padding = '0';
            }
        }

    });
}

function fixSubtablesHeader() {
    const subtableForm = $('#subtables_form');
    if (subtableForm.length == 0) return;

    const subtableCoords = subtableForm[0].getBoundingClientRect();
    const subtableTop = subtableCoords.top; // От подтаблицы до высоты просматриваемого экрана
    const windowHeight = $(window).innerHeight();
    const windowSubTop = windowHeight - 80; // Высота окна. 80 - это размер высоты #fixed_subtable_header
    const fixedHeader = $('#fixed_subtable_header'); // Фиксированная подтаблица
    const subtableHeaderLine = $('.subtable__border-main');
    const subtable_outer = $('.subtable__outer-wrap');

    if (subtable_outer.length > 0) {
        const header = subtable_outer.find($('.subtable__head'));
        const subtable = subtable_outer.find($('.subtable')); // Блок подтаблицы

        const hiddenHeader = $('.subtable__head--fixed');
        let marginLeft = header.css('margin-left');
        let marginRight = header.css('margin-right');
        let marginLeftSubtable = subtable.css('margin-left');
        let marginRightSubtable = subtable.css('margin-right');

        let subMarginLeft = 0;
        let subMarginRight = 0;

        if (marginLeft && marginLeftSubtable) {
            subMarginLeft = parseInt(marginLeft.replace('px', '')) + parseInt(marginLeftSubtable.replace('px', ''));
        }

        if (marginRight && marginRightSubtable) {
            subMarginRight = parseInt(marginRight.replace('px', '')) + parseInt(marginRightSubtable.replace('px', ''));
        }

        hiddenHeader.css({
            paddingLeft : subMarginLeft,
            paddingRight : subMarginRight
        });

        if (subtableTop > windowSubTop) {
            fixedHeader.css('display', '');
            subtableHeaderLine.hide();
        } else {
            fixedHeader.hide();
            subtableHeaderLine.css('display', '');
        }
    }
};

/*
    Добавляем функцию по получению количества записей по фильтру в последнию очередь в массив колбеков
 */
//calc.calcFunctions.push(getFilterCounts);

// Отрисовка ссылок навигации по результатам запроса
function viewLine2Pag() {
    $.ajax({
        url: `view_line2_pag.php?table=${tableId}&filter=${filterId}&line=${lineId}`,
        beforeSend: function () {
            $('.user-data__aside').css('margin-top', '35px');
        },
        success: function (resp) {
            if (!/Error/.test(resp)) {
                if (lineId != 'array' || lineId != 'new') {
                    if (!edit_mode) {
                        const lastRec = resp.last_rec,
                            firstRec = resp.first_rec,
                            cntRec = resp.cnt_rec,
                            curline = resp.line,
                            nextPos = resp.next_pos,
                            numRec = resp.num_rec,
                            prevRec = resp.prev_rec,
                            prevRecTitle = resp.prev_rec_title,
                            nextRecTitle = resp.next_rec_title;

                        // Формирование стрелок влево-вправо в середине страницы
                        const arrowLink = addParametrsToLink(
                          `<a href="view_line2.php?table=${tableId}`, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage
                        );

                        createMiddleArrowsNav(prevRec, arrowLink, nextPos, numRec, cntRec, prevRecTitle, nextRecTitle);

                        // Формирование навигации в меню над кнопками управления
                        createNavArrows(tableId, prevRec, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage, nextPos, curline, cntRec, firstRec, lastRec, numRec);

                        $('.user-data__aside').css('margin-top', '0');
                    } else {
                        $('.user-data__aside').css('margin-top', '35px');
                        $('.user-data__nav-toggles').hide();
                    }
                }
            } else {
                $('.user-data__aside').css('margin-top', '0');
                $('.user-data__nav-toggles').hide();
            }
        }
    });
}

function createMiddleArrowsNav(prevRec, arrowLink, nextPos, recNumber, allRecCount, prevTitle, nextTitle) {
  const prevRecNum = parseInt(recNumber) - 1;
  const nextRecNum = parseInt(recNumber) + 1;
  const prevRecTxt = `${prevRecNum} ${lang.from} ${allRecCount}:\n${prevTitle}`;
  const nextRecTxt = `${nextRecNum} ${lang.from} ${allRecCount}:\n${nextTitle}`;

  const appendArrowLink = (arrowLink, position) => {
    arrowLink += '&line=' + (position === 'left' ? prevRec : nextPos) + '" ';
    arrowLink += 'class="fixed-transition fixed-transition--' + (position === 'left' ? 'prev' : 'next') + '" ';
    arrowLink += 'title="' + escapeHtml(position === 'left' ? prevRecTxt : nextRecTxt) + '"></a>';

    if ($('.subtable__outer-wrap').text() == '') {
      $('a[name*="view_subtables"]').append(arrowLink);
    } else {
      $('.subtable__outer-wrap').append(arrowLink)
    }
  }

  if (prevRec) appendArrowLink(arrowLink, 'left');
  if (nextPos) appendArrowLink(arrowLink, 'right');
}


function createNavArrows(tableId, prevRec, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage, nextPos, curline, cntRec, firstRec, lastRec, numRec) {
    // Вставляем пустой контейнер
    const menuContainer = `<div class="user-data__nav-toggles"></div>`;
    const menu = $('aside.user-data__aside');
    menu.prepend(menuContainer);

    const menuNav = $('.user-data__nav-toggles');
    // Рисуем навигацию
    if (numRec != 1) {
        let toBeginArrow = `<a href="`;
        if (firstRec) {
            toBeginArrow += `view_line2.php?table=${tableId}`;
            toBeginArrow = addParametrsToLink(toBeginArrow, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage);
            toBeginArrow += `&line=${firstRec}" class="user-data__nav-link"><<</a>`;
            menuNav.append(toBeginArrow);
        }
    } else {
        let toBeginArrow = `<a href="#" style="visibility: hidden;" class="user-data__nav-link "> <<</a>`;
        menuNav.append(toBeginArrow);
    }

    if (prevRec) {
        let toPrevArrow = `<a href="view_line2.php?table=${tableId}`;
        toPrevArrow = addParametrsToLink(toPrevArrow, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage);
        toPrevArrow += `&line=${prevRec}" class="user-data__nav-link">< ${lang.Prev}</a>`;
        menuNav.append(toPrevArrow);
    } else {
        let toPrevArrow = `<a href="#" style="visibility: hidden;" class="user-data__nav-link ">< ${lang.Prev}</a>`;
        menuNav.append(toPrevArrow);
    }

    const staticNumbers = `${numRec} ${lang.from} ${cntRec}`;
    menuNav.append(staticNumbers);

    if (nextPos) {
        let toNextArrow = `<a href="view_line2.php?table=${tableId}`;
        toNextArrow = addParametrsToLink(toNextArrow, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage);
        toNextArrow += `&line=${nextPos}" class="user-data__nav-link"> ${lang.Next}></a>`;
        menuNav.append(toNextArrow);
    } else {
        let toNextArrow = `<a href="#" style="visibility: hidden;" class="user-data__nav-link "> ${lang.Next}></a>`;
        menuNav.append(toNextArrow);
    }

    if (numRec != cntRec) {
        let toEndArrow = `<a href="`;
        if (lastRec) {
            toEndArrow += `view_line2.php?table=${tableId}`;
            toEndArrow = addParametrsToLink(toEndArrow, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage);
            toEndArrow += `&line=${lastRec}" class="user-data__nav-link">>></a>`;
            menuNav.append(toEndArrow);
        }
    }
}

function addParametrsToLink(divName, relTable, relLine, relField, allFiltersOn, filterId, isArchive, isDeleted, allRecords, curPage) {
    if (typeof relTable != "undefined" && relTable != "undefined")
        divName += `&rel_table=${relTable}&rel_line=${relLine}&rel_field=${relField}`;

    if (typeof allFiltersOn != "undefined" && allFiltersOn != "undefined")
        divName += `&all_filters_on`;
    else if (typeof filterId != "undefined" && filterId != "undefined")
        divName += `&filter=${filterId}`;

    if (typeof isArchive != "undefined" && isArchive != "undefined")
        divName += `&archive`;

    if (typeof isDeleted != "undefined" && isDeleted != "undefined")
        divName += `&deleted`;

    if (typeof allRecords != "undefined" && allRecords != "undefined")
        divName += `&all`;

    if (typeof curPage != "undefined" && curPage != "undefined")
        divName += `&page=${curPage}`;

    return divName;
}

function addClickAutoinput() {
    $('.subtable').delegate('.autocomplete__input', 'click', function () {
        // Записываем глобальный id поля
        globalActiveFieldId = $(this).parents('.textpad__value').find('select.combobox').attr('field_id');
        globalActiveLineId = $(this).parents('.textpad__value').find('select.combobox').attr('line_id');
        // Клик по подтаблице
        isSubtableTarget = 1;
    });

    $('.subtable').delegate('a.autocomplete__btn', 'click', function () {
        // Записываем глобальный id поля
        globalActiveFieldId = $(this).parents('.textpad__value').find('select.combobox').attr('field_id');
        globalActiveLineId = $(this).parents('.textpad__value').find('select.combobox').attr('line_id');
        // Клик по подтаблице
        isSubtableTarget = 1;
    });

    $(document).click(function (e) {
        const activeEditors = $('.activeEditor');
        if (!$(e.target).parents().filter(activeEditors).length) {
            activeEditors.toggleClass('activeEditor');
            activeEditors.fadeOut('fast', function () {
                if (cur_mode === 'view') {
                    activeEditors.next('.user-data__close-edit-btn--html').trigger('click');
                    const textArea = activeEditors.prev('textarea');
                    save_value(textArea.attr('field_id'), textArea.attr('line_id'), textArea.val());
                    is_changed_fast_edit = true;
                }
            });
        }
    });
}

function showHtmlEditor(fieldId, mode) {
    event.stopPropagation();
    event.preventDefault();
    let htmlEditor = 0;
    mode === 'edit' ? htmlEditor = $(`#cke_value${fieldId}`) : htmlEditor = $(`#cke_fast_edit_cell_${fieldId}`);
    htmlEditor.toggleClass('activeEditor');
    htmlEditor.fadeIn('fast');
}

// Функция для подсвечивания полей, участвующих в отображении информера
// Срабатывает при клике на информер
function getInformerInfo(id) {
    const allInformersInfo = JSON.parse(informersInfo);
    const infId = parseInt(id);
    const infFields = allInformersInfo[infId];

    for (let fieldId of infFields) {
        const oldField = $('[field_id="' + fieldId + '"]');
        const linkField = $('[field-id="' + fieldId + '"]');
        const viewCellField = $('#view_cell_' + fieldId);
        const color = '#fff6ad';
        const animateTime = 3000;

        viewCellField.css({ backgroundColor : color }).stop().animate({ backgroundColor : '' }, animateTime);
        if (viewCellField.length < 1) {
            oldField.css({ backgroundColor : color }).stop().animate({ backgroundColor : '' }, animateTime);
            linkField.css({ backgroundColor : color }).stop().animate({ backgroundColor : '' }, animateTime);
        }
    }
}

// Навешиваем обработчики на поля в режиме записи для динамического обновления информеров
function createChangeInformerListeners() {
    const allInformerFields = JSON.parse(informerFields);
    let statusPanel = $('.status-panel');
    let lineId = statusPanel.attr('line_id');
    let linkFields = [];

    // Заполняем массив, который будет содержать все поля, при изменении которых могут изменяться информеры
    for (let key in allInformerFields) {
        linkFields.push(key);
    }

    // Для каждого поля из вышеуказанного массива навешиваем обработчик, который
    // будет отправлять ajax-запрос для проверки на изменение информера
    // Разные типы полей имеют разную структуру id, поэтмоу необходимо проверить каждый тип поля отдельно
    $(linkFields).each(function (index, fieldId) {
        let simpleField = $('#view_cell_' + fieldId + ':not(select)');
        let selectField = $('select#view_cell_' + fieldId);
        let linkField = $('#view_value' + fieldId);
        let fastEditField = $('#fast_edit_cell_' + fieldId);
        let fastEditSpanField = $('#fast_edit_span_' + fieldId + '_' + lineId);

        simpleField.attr('has_informer', 1);
        simpleField.on('blur', function () {
            changeInformersInfo(allInformerFields, fieldId);
        });

        selectField.attr('has_informer', 1);
        selectField.on('change', function () {
            changeInformersInfo(allInformerFields, fieldId);
        });

        if (linkField.length > 0) {
            linkField.attr('has_nformer', 1);
            linkField.on('blur', function () {
                changeInformersInfo(allInformerFields, fieldId);
            });
        }
        if (fastEditField.length > 0) {
            fastEditField.attr('has_nformer', 1);
            fastEditField.on('blur', function () {
                changeInformersInfo(allInformerFields, fieldId);
            });
        }
        if (fastEditSpanField.length > 0) {
            fastEditSpanField.attr('has_nformer', 1);
            if (fastEditSpanField.next().hasClass('ui-datepicker-trigger')) {
                fastEditSpanField.on('change', function () {
                    changeInformersInfo(allInformerFields, fieldId);
                });
            } else {
                fastEditSpanField.on('blur', function () {
                    changeInformersInfo(allInformerFields, fieldId);
                });
            }
        }
    });
}

// Запрос на проверку изменений информеров
function changeInformersInfo(informersArr, fieldId) {
    let statusPanel = $('.status-panel');
    let tableId = statusPanel.attr('table_id');
    let lineId = statusPanel.attr('line_id');

    $(informersArr[fieldId]).each(function (j, informerId) {
        setTimeout(function () {
            $.ajax({
                type: "GET",
                url: "check_status.php",
                data: "table_id=" + tableId + "&informer_id=" + informerId + "&line_id=" + lineId,
                success: function (informersData) {
                    let informer = $('#informer_' + tableId + '_' + lineId + '_' + informerId);

                    // Если нет доступа к какому-либо полю информера - ничего не делаем
                    if (informersData === 'NO ACCESS') return false;

                    // Если информер не надо отображать - удаляем его
                    if (informersData === 'EMPTY') {
                        if (informer.length > 0) {
                            removeInformerFromstatusPanel(informer);
                        }
                    } else { // иначе добавялем/обновляем информацию об информере
                        addInformerToStatusPanel(informersData, informer, tableId, lineId, informerId);
                    }
                },
            });
        }, 200);
    });
}

// Удаление информера из записи
function removeInformerFromstatusPanel(informer) {
    let informersStatusPanel = $('.status-panel');

    informer.stop().animate({
        height: 0,
        opacity: 0,
    }, 10, function () {
        $(this).remove();
        // Если это был последний информер, сркываем панель информеров
        if (informersStatusPanel.children().length < 1) informersStatusPanel.css('display', 'none');
    });
}

// Добавление информера на панель информеров
function addInformerToStatusPanel(informerData, informer, tableId, lineId, informerId) {
    let informersStatusPanel = $('.status-panel');
    let informerText = informerData['informer_text'];
    const curBgColor = informer.css('background-color');
    const curTxtColor = informer.css('color');
    const curText = informer.children('span').first().text();
    const informerBg = (!informerData['bg_color'] || informerData['bg_color'].length < 1) ? 'transparent' : informerData['bg_color'];
    const informerTxt = (!informerData['txt_color'] || informerData['txt_color'].length < 1) ? '#000' : informerData['txt_color'];
    const titleAttr = informerText.length > 120 ? 'title="' + informerText + '"' : '';

    if (informerText.length > 120) informerText = reduceInformerTextLength(informerText);

    // Если информер уже был создан, то присваеываем ему цвет и текст (могут быть новыми)
    if (informer.length > 0) {
        if (informerText.replace(/\s/g, '').length < 1) removeInformerFromstatusPanel(informer);
        else {
            if (informerText != curText) informer.text(informerText);
            if (informerBg != curBgColor) informer.css('background-color', informerBg);
            if (informerTxt != curTxtColor) informer.css('color', informerTxt);
        }
    } else { // Иначе создаем новый информер и добавляем его на панель
        if (informerText.replace(/\s/g, '').length > 0) {
            let newInformerId = 'informer_' + tableId + '_' + lineId + '_' + informerId;
            let adddedInformer = $('<li class="status-panel__item" id="' + newInformerId + '" onclick="getInformerInfo(' + informerId + ');" ' +
                'style="background-color:' + informerBg + '; color:' + informerTxt + '; height:0;"' + titleAttr + '>' +
                '<span>' + informerText + '</span></li>');

            informersStatusPanel.append(adddedInformer);
            informersStatusPanel.css('display', '');

            adddedInformer.stop().animate({ minHeight: '20px', }, 200).css('height', '');
        }
    }
}

// Сокращение длины текста информера до 120 символов
function reduceInformerTextLength(text) {
    return text.slice(0, 120) + "...";
}

calc.calcFunctions.push(viewLine2Pag);
calc.calcFunctions.push(addClickAutoinput);
calc.calcFunctions.push(createChangeInformerListeners);
