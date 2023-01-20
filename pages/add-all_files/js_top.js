var help_available = 1;
var table_id = getUrlVars()['table'];
// закрытие напоминаний, включая плавное исчезновение и фоновое обновление данных (ajax)
var eOpacity = 1;
var interval = false;
var update_tip_ajax = new XMLHTTP("update_tip.php");
var edit_form_submits = new Array();
var table_padding = 32;
var buttons_h = 37;
var table_header_h = 0;
var right_white;
var left_white;
var top_header_div;
var fields_content_table;
var window_width;
var window_height;
var fields_buttons_table;
var old_offs_x = -1;
var old_offs_y = -1;
var old_new_h = -1;
var scroll_orientir = -1;
var header_orientir = -1;
var visible_popup = 0;
var table_div;
var page_loaded = 0;
var cellPadding = 5;
var paddingExternal = 32;
var biz_proc;
var allow_out_bizproc;
$.ui.menu.prototype._isDivider = function(){return false}; // переопределяем для ui от jq поля для связи, чтобы он не считал тире символом разделения строк
init_biz_proc();

function on_load_biz_proc(xhr) {
    biz_proc = JSON.parse(xhr);
    if (biz_proc) {
        allow_out_bizproc = 0;
        $(window).bind("beforeunload", function () {
            if (!allow_out_bizproc) return lang.bizproc_out_alert;
        });
        var step = (biz_proc['autostep']) ? +biz_proc['num'] + 1 : biz_proc['num'] + '&done';
        biz_proc_link = '&bizproc=' + biz_proc['proc_id'] + '&step=' + step
    } else if (bizproc_done) {
        $(function () {
            jinfo('<div align=center>' + lang.Business_process_ended + '!</div>', lang.Business_process, 350);
        });
    }

    $.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
        _title: function (title) {
            if (!this.options.title) {
                title.html("&#160;");
            } else {
                title.html(this.options.title);
            }
        }
    }));
}

$(document).ready(function() {
    page_loaded = 1;

    if (incorrect_crypt_key && typeof incorrect_crypt_key != "undefined") {
        jalert(lang.Incorrect_crypt_pass);
    }

    show_block_account();
    checkHelpButtonsOnCurrentPage();
});

/**
 * Метод, проверяющий поле на уникальность, если включена настройка
 * @param field_id
 * @param val
 * @returns {boolean}
 */
function fast_edit_uniq_check(field_id, line_id, table_id, val) {
    let result = true;
    const isSubtableField = typeof cur_subtable !== 'undefined' && cur_subtable.table_fields && cur_subtable.table_fields[field_id];

    if (uniq_fields && uniq_fields[field_id] || isSubtableField && cur_subtable.table_fields[field_id].uniq_field == 1) {
        $.ajax({
            url: "view_line2.php?ajax_uniq_search",
            data: {
                table: table_id,
                line: line_id,
                field: field_id,
                value: val
            },
            async: false,
            success: function(xhr) {
                if (JSON.parse(xhr)['found'] == 1) {
                    displayNotification(lang.ajax_dbl_msg5, 2);
                    result = false;
                }
            }
        });
    }

    return result;
}

/**
 * Метод, проверяющий валидацию html кода
 * @param code {string}
 * @returns {boolean}
 */
function isValidHtmlCode (code) {
    var result = true;
    var openHtmlTags = {};
    /**
     * Одиночные теги
     * @type {Array}
     */
    var SELF_TAGS = [
        'area',
        'base',
        'basefont',
        'bgsound',
        'br',
        'col',
        'command',
        'embed',
        'hr',
        'img',
        'input',
        'isindex',
        'isindex',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr'
    ];
    var codeWithaouTags = code.replace(/\<([^>]+)>/gi, '');
    if (codeWithaouTags.indexOf('<') + 1 || codeWithaouTags.indexOf('>') + 1) {
        result = false;
    }
    if (result) {
        var tagsArray = code.match(/<\/?[a-z]+.*?\/?>/gi);
        if (!tagsArray) {
            result = true;
        } else {
            tagsArray.forEach(function (tag) {
                var tagWithAttr = tag.split(' ');
                if (tagWithAttr.length > 1) {
                    tag = tagWithAttr[0];
                }
                var tagValue = tag.replace(/[<>]/g, '');
                var isSelfTag = false;
                SELF_TAGS.forEach(function (selfTag) {
                    if (tagValue.replace(/\//g, '') === selfTag) {
                        isSelfTag = true;
                    }
                });
                if (!isSelfTag) {
                    if (tagValue[0] === '/') {
                        var closeTag = tagValue.replace(/\//g, '');
                        if (openHtmlTags[closeTag] && openHtmlTags[closeTag] > 0) {
                            openHtmlTags[closeTag]--;
                        } else {
                            result = false;
                        }
                    } else {
                        if (!openHtmlTags[tagValue]) {
                            openHtmlTags[tagValue] = 1;
                        } else {
                            openHtmlTags[tagValue]++;
                        }
                    }
                }
            });
            if (result) {
                for (var tag in openHtmlTags) {
                    if (openHtmlTags[tag] !== 0) {
                        result = false;
                        break;
                    }
                }
            }
        }
    }

    return result;
}

/**
 * Метод для получение значения атрибутов из параметров ссылки
 * @returns
 */
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function getAttrVars(str) {
    var vars = {};
    var parts = str.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function init_biz_proc() {
    var result = {};
    var bizproc_id = getUrlVars()['bizproc'];
    var bizproc_step = getUrlVars()['step'];

    if (bizproc_id && bizproc_step) {
        $.ajax({
            method: 'GET',
            url: 'update_value.php?biz_proc&table=' + table_id + '&bizproc=' + bizproc_id + '&step=' + bizproc_step,
            success: function (xhr) {
                on_load_biz_proc(xhr);
            },
            error: function() {
                console.log('Ошибка загрузки');
            }
        });
    }

    return result;
}

function hide_this_notif(obj) {
    $(obj).parent().slideUp(400, on_window_resize);
    return false;
}

function closeTip(user_id, tip_show_id, line_id) {
    slideOff('tip_block_' + tip_show_id);
    eOpacity = 1;

    update_tip_ajax.method = "POST";
    update_tip_ajax.call("tip_show_id=" + tip_show_id + "&csrf=" + csrf, function(){});
}

function slideOff(sElemId) {
    var delta = Math.floor(document.getElementById(sElemId).offsetHeight / 10);
    interval = window.setInterval("minus('" + sElemId + "', " + delta + ")", 50);
}

// Функция для добавления обработчика событий
// Сохраняем обработчки onsubmit для edit_form в отдельном массиве

function addHandler(object, event, handler, useCapture) {
    if (!object) return;
    if ((document.getElementById('edit_form')) && (object == document.getElementById('edit_form')) && (event == "onsubmit")) { // сохраняем события onsubmit формы edit_form
        edit_form_submits.push(handler);
    }

    if (object.addEventListener) {
        var t1;
        if (event.substr(0, 2).toLowerCase() == "on") t1 = event.substr(2, 1024); // убираем приставку on
        object.addEventListener(t1, handler, useCapture ? useCapture : false);
    } else if (object.attachEvent) {
        object.attachEvent(event, handler);
    } else jalert("Add handler is not supported");
}

function minus(sElemId, delta) {
    nHeight = document.getElementById(sElemId).offsetHeight;
    nHeight = parseInt(nHeight);
    nHeight = nHeight - delta;
    if (nHeight > 0) {
        eOpacity = eOpacity - 0.1;
        document.getElementById(sElemId).style.height = nHeight + "px";
        setElementOpacity(sElemId, eOpacity);
    }
    else {
        if (nHeight == '0') {
            document.getElementById(sElemId).style.display = "none";
            document.getElementById(sElemId).style.height = '1' + "px";
            window.clearInterval(interval);
        }
        else {
            minus(sElemId, delta - 1);
        }
    }
}

function getOpacityProperty() {
    if (typeof document.body.style.opacity == 'string') // CSS3 compliant (Moz 1.7+, Safari 1.2+, Opera 9)
        return 'opacity';
    else if (typeof document.body.style.MozOpacity == 'string') // Mozilla 1.6 и младше, Firefox 0.8
        return 'MozOpacity';
    else if (typeof document.body.style.KhtmlOpacity == 'string') // Konqueror 3.1, Safari 1.1
        return 'KhtmlOpacity';
    else if (document.body.filters && navigator.appVersion.match(/MSIE ([\d.]+);/)[1] >= 5.5) // Internet Exploder 5.5+
        return 'filter';

    return false; //нет прозрачности
}

function open_calc(params, text_len, only_read) {
    if (only_read === undefined) {
        only_read = 0;
    }
    if (text_len > 3000) { // Большие тексты открываем в окне на весь экран
        var left = 0;
        var top = 0;
        var width = screen.availWidth;
        var height = screen.availHeight;
        if (window.opera) { // чтобы окно открылось отдельной вкладкой
            width += 500;
            height += 500;
        }
    }
    else {
        var width = 800;
        var height = 600;
        var left = ( screen.width - width ) / 2;
        var top = ( screen.height - 600 ) / 2;
    }
    var t_v = window.open('edit_php.php?' + params + '&only_read=' + only_read, (params.replace(/&/g, "")).replace(/=/g, ""), 'top=' + top + ', left=' + left + ', menubar=0, resizable=1, scrollbars=0, status=0, toolbar=0, width=' + width + ', height=' + height);
    t_v.focus();
}

function setElementOpacity(sElemId, nOpacity) {
    var opacityProp = getOpacityProperty();
    var elem = document.getElementById(sElemId);

    if (!elem || !opacityProp) return; // Если не существует элемент с указанным id или браузер не поддерживает ни один из известных функции способов управления прозрачностью

    if (opacityProp == "filter")  // Internet Exploder 5.5+
    {
        nOpacity *= 100;

        // Если уже установлена прозрачность, то меняем её через коллекцию filters, иначе добавляем прозрачность через style.filter
        var oAlpha = elem.filters['DXImageTransform.Microsoft.alpha'] || elem.filters.alpha;
        if (oAlpha) oAlpha.opacity = nOpacity;
        else elem.style.filter += "progid:DXImageTransform.Microsoft.Alpha(opacity=" + nOpacity + ")"; // Для того чтобы не затереть другие фильтры используем "+="
    }
    else // Другие браузеры
        elem.style[opacityProp] = nOpacity;
}

// Привести к intval
function intval(mixed_var, base) {    // Get the integer value of a variable
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    var tmp;

    if (typeof( mixed_var ) == 'string') {
        tmp = parseInt(mixed_var);
        if (isNaN(tmp)) {
            return 0;
        } else {
            return parseInt(tmp.toString(base || 10));
        }
    } else if (typeof( mixed_var ) == 'number') {
        return parseInt(Math.floor(mixed_var));
    } else {
        return 0;
    }
}

function show_block_account() {
    if (script_name == 'login.php') {
        if ($.cookie('excess_load_warning')) {
            jalert("<b>Уважаемый клиент!</b><br><br>Ваш <b>коэффициент допустимой нагрузки превышен!</b><br>В случае если <b>в течение 7 дней</b> он <b>не будет понижен</b>, Ваш <b>аккаунт будет заблокирован!</b><br><br>Просьба связаться со своим персональным менеджером по телефону: <b>8-800-1000-936</b><br>Также Вы можете произвести оплату аккаунта через личный кабинет.<br><br>С уважением,<br>Ваша «Клиентская база»");
            $.cookie('excess_load_warning', null);
        }
        if ($.cookie('excess_load_block_warning')) {
            jalert("<b>Уважаемый клиент!</b><br><br><b>Работа вашего аккаунта заблокирована!</b><br>Вами был превышен коэффициент допустимой нагрузки согласно выбранного тарифного плана!<br><br>Просьба связаться со своим персональным менеджером по телефону: <b>8-800-1000-936</b><br>Также Вы можете оплатить аккаунт через личный кабинет. " + ($.cookie('excess_load_rec_plan') ? ("Рекомендованный<br>тарифный план: \"" + $.cookie('excess_load_rec_plan') + "\". ") : "") + "После чего доступ в систему будет возобновлён.<br><br>С уважением,<br>Ваша «Клиентская база»");
            $.cookie('excess_load_block_warning', null);
        }
    }
}

function link_fields_in_condition() {
    $('#wizard_set').children().each(function(i) {
        var condId = $('#wizard_set').children().eq(i).attr('id').replace('cond_','');
        $( "#cond_value_" + condId + " option").each(function( index ) {
            if ($("#cond_value_" + condId).next().find('.autocomplete__input')) {
                var a = $("#cond_value_" + condId).next().find('.autocomplete__input').val();
            } else {
                var a = null;
            }

            if(a === $(this).text()) {
                $("#cond_value_"+ condId).val($("#cond_value_" + condId +" option").eq(index).val())
            };
        });
    })
}

// Проверка поля "Связь" на наличие прав на импорт в связанном поле
// line_id - необязательный параметр, в запросе можно прописать line=any
function checkFieldImportRights(table_id, line_id, field_id, obj) {
    var import_right = true;
    $.ajax({
        url: "update_value.php?show_fields&table=" + table_id + "&line=" + line_id,
        type: "GET",
        async: false,
        success: function (response) {
            var all_fields = JSON.parse(response);
            var field_write_acc = all_fields['fields'][field_id]['write'];

            if (field_write_acc == false || field_write_acc < 1) { import_right = false; }
            obj.attr('import', import_right);
        },
        error: function () {
            console.log('Поле не найдено');
            return true;
        }
    });
    return import_right;
}

// Проверка на то, что все знаки вопроса (help-ы) имеют описание
function checkHelpButtonsOnCurrentPage () {
    setTimeout(function() {
        $('span[h_id]').each(function(i, item) {
            $helper = $(item);

            let helpId = $helper.attr('h_id');
            let hsAttr = $helper.attr('h_s');
            let hssAtr = $helper.attr('h_ss');
            let isOnPage = false;

            let hLink = $('#check_help_btn a#help_' + helpId);
            if (hLink && hLink.length > 0) isOnPage = true;

            if (typeof (help_section) == 'undefined') help_section = '';
            if (hsAttr === undefined) hSection = help_section;
            else hSection = hsAttr;
    
            if (typeof (h_sub_section) == 'undefined') h_sub_section = '';
            if (hssAtr === undefined) section = h_sub_section;
            else section = hssAtr;

            let site = location.protocol + '//help.' + clientbase_domain + '/';
            let helpUrl = site + 'help_sys.php?section=1' + hSection + '&sub_section=' + section + '&sys_id=2' + helpId + '&lang=' + lang_full + '&short=1';

            if (!isOnPage) {
                let helpLink = $('<a>', {href: helpUrl, id: 'help_' + helpId, class: 'hidden', text: helpId });
                $('#check_help_btn').append(helpLink);
                $('#check_help_btn a#help_' + helpId).trigger('click');
                $helper.click();
                $('#s_tooltip').html('').hide();
            }
        });
    }, 1000);
}

// Метод для строк, заменяющий ВСЕ вхождения определенного символа/подстроки
String.prototype.replaceAll = function(search, replace) {
    if (search) return this.split(search).join(replace);
    else return this;
}

/*if ( configType === "SAAS" && online_consult ) {
    // Carrot Quest
    !function () {
        function t(t, e) {
            return function () {
                window.carrotquestasync.push(t, arguments)
            }
        }

        if ("undefined" == typeof carrotquest) {
            var e = document.createElement("script");
            e.type = "text/javascript", e.async = !0, e.src = "//cdn.carrotquest.io/api.min.js", document.getElementsByTagName("head")[0].appendChild(e), window.carrotquest = {}, window.carrotquestasync = [], carrotquest.settings = {};
            for (var n = ["connect", "track", "identify", "auth", "oth", "onReady", "addCallback", "removeCallback", "trackMessageInteraction"], a = 0; a < n.length; a++) carrotquest[n[a]] = t(n[a])
        }
    }(), carrotquest.connect("25347-6bc9e3c835d5379d573fa8f11d");
}*/
