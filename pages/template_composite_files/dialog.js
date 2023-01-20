function jalert(text, tableId = '', fieldId = '') {
    text = text.replace(/\n/g, "<br>");
    const textEncoder = new TextEncoder();
    const encodeId = textEncoder.encode(text);
    let doNotShowAgain = '';
    let extended_filter = JSON.parse(sessionStorage.getItem('extended_filter')),
        extended_filter_rigth = false;
    if (extended_filter) {
        for (value in extended_filter) {
            if (extended_filter[value]['table_id'] == tableId && extended_filter[value]['field_id'] == fieldId) {
                extended_filter_rigth = true;
            }
        }
    }
    if (tableId != '' && fieldId != '') {
        doNotShowAgain = "<input type='checkbox' style='margin-right: 3px;'id='extended_filter_rigth' table_id='"+ tableId +"' field_id='"+ fieldId +"'><label for='extended_filter_rigth'>Больше не показывать</label>";
    }
    if (!extended_filter_rigth) {
        $("<div id='jalert'><div class=\"hr1\" ></div><p align=\"left\" style=\"padding-left: 6px;\">" + text + "</p><p align=center>" + doNotShowAgain + "<button class='al_button' onclick='closeWindobtnwByOkBtn(this);' id='jalert_ok_" + encodeId + "'>OK</button></p></div>").prependTo("#alert_div");
        bind_help_bt("alert_div"); // привязываем подсказки
        title = lang.Attention;
        title_html = '<table cellpadding=0 cellspacing=0 ><tr><td height=10><p style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding-left:4px;\">' + title + '<\/p><\/td><td><\/td><\/tr><\/table>';
        var obj = {};
        obj.modal = true;
        obj.width = 500;
        obj.title = "";
        obj.open = function (event, ui) {
            $(this).parent().find('.ui-dialog-title').html(title_html);
        };
        obj.close = function (ev, ui) {
            $(this).remove();
        };
        obj.draggable = false;
        obj.resizable = false;
        $("#jalert").dialog(obj);
        $('.ui-icon-closethick').remove();
        $('.ui-button-icon-space').remove();
        $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
        $('.ui-dialog-titlebar-close').text('');
        overlayHandler();
        $(window).bind('resize', overlayHandler);
        $("div.ui-dialog").focus();
        $("#jalert_ok").one('click', function () {
            $("#jalert").dialog('close');
            $(window).unbind('resize', overlayHandler);
            return false;
        });
        $("#jclose_link").one('click', function () {
            $("#jalert").dialog('close');
            $(window).unbind('resize', overlayHandler);
        });
        document.addEventListener('keydown', function (event) {
            if ($('#jalert').length > 0 && event.code == 'Space') {
                event.preventDefault();
                $('#jalert').find('button').trigger('click');
            }
        });
    }
    return false;
}

function closeWindobtnwByOkBtn(btn) {
    let table_id = $(btn).parent().find('input') ? $(btn).parent().find('input').attr('table_id') : '',
        field_id = $(btn).parent().find('input') ? $(btn).parent().find('input').attr('field_id') : '',
        all_info_filter;
    if($(btn).parent().find('input') && $(btn).parent().find('input').prop( "checked" )) {
        if (JSON.parse(sessionStorage.getItem('extended_filter')) == null) {
            all_info_filter = {0: { 'table_id' : table_id, 'field_id' : field_id }}
        } else {
            all_info_filter = JSON.parse(sessionStorage.getItem('extended_filter'));
            all_info_filter[all_info_filter.length + 1] = { 'table_id' : table_id, 'field_id' : field_id };
        }
        sessionStorage.setItem('extended_filter', JSON.stringify(all_info_filter));
    }
    $(btn).parents('.ui-dialog').find('.ui-dialog-titlebar-close').trigger('click');
}

function cb_alert(id, title, text, button_name, button_url, check_show) {
    text = text.replace(/\n/g, "<br>");
    button_name = button_name ? button_name : 'OK';
    $("<div id=cb_alert><p align=\"left\" style=\"padding-left: 6px;\">" + text + "</p><p>" + check_show + "</p><div align=center><button class=\"al_button\" id=\"cb_alert_ok\" value='" + button_url + "'>" + button_name + "</button></div></div>").prependTo("#alert_div");
    bind_help_bt("alert_div"); // привязываем подсказки
    title_html = '<table cellpadding=0 cellspacing=0 ><tr><td><div style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding:4px;\">' + title + '&nbsp;<\/div><\/td><\/tr><\/table>';
    var obj = {};
    obj.modal = true;
    obj.width = 500;
    obj.title = "";
    obj.open = function (event, ui) {
        $(this).parent().find('.ui-dialog-title').css("width", "100%");
        if (title) {
            $(this).parent().find('.ui-dialog-title').html(title_html + "<div class=\"hr1\"></div>");
        }
        $("#cb_alert_ok").css("margin", "10px");
        $(".ui-button").css("top", "20px");
    };
    obj.close = function (ev, ui) {
        $(this).remove();
    };
    obj.draggable = false;
    obj.resizable = false;
    $("#cb_alert").dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();
    $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
    $('.ui-dialog-titlebar-close').text('');
    overlayHandler();
    $(window).bind('resize', overlayHandler);
    $("div.ui-dialog").focus();
    $('div.ui-widget-overlay').bind('click', function() {
        $('#cb_alert').dialog('close');
        $(window).unbind('resize', overlayHandler);
        return false;
    });
    $("#cb_alert_ok").click(function () {
        if ($("#cb_alert_ok").attr("value")) {
            window.open($("#cb_alert_ok").attr("value"));
        }
        $("#cb_alert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        return false;
    });
    $("#jclose_link").one('click', function () {
        $("#cb_alert").dialog('close');
        $(window).unbind('resize', overlayHandler);
    });
    return false;
}


function jconfirm(text, object, no_succes, title, type) {

    if (typeof text === 'object' && text.has('delete_field')) {
        let objText = Object.fromEntries(text);
        $("<div id='jalert'><div class='hr1' ></div><p align='left' style=\"padding-left: 6px;\">" + `${objText.desc} "${objText.title}"?` + "</p><p align='center'><button class=\"al_button\" id=\"jalert_ok\">OK</button><button class=\"al_button\" id=\"jalert_can\">" + lang.Cancel + "</button></p></div>").prependTo("#alert_div");
    } else if (type === 'session_expire') { // Условие для обновления сессии
        text = text.replace(/\n/g, "<br>");
        $("<div id='jalert' class='session_popup_block'><div class='hr1' ></div><p align='left' style=\"padding-left: 6px;\">" + text + "</p><p align='center'><button class=\"al_button\" id=\"jalert_ok\">" + lang.Refresh + "</button></p></div>").prependTo("#alert_div");
    } else {
        text = text.replace(/\n/g, "<br>");
        $("<div id='jalert'><div class='hr1' ></div><p align='left' style=\"padding-left: 6px;\">" + text + "</p><p align='center'><button class=\"al_button\" id=\"jalert_ok\">OK</button><button class=\"al_button\" id=\"jalert_can\">" + lang.Cancel + "</button></p></div>").prependTo("#alert_div");
    }

    bind_help_bt("alert_div"); // привязываем подсказки
    if (!title) title = lang.Attention;
    title_html = '<table cellpadding=0 cellspacing=0 ><tr><td height=10><p style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding-left:4px;\">' + title + '<\/p><\/td><td><\/td><\/tr><\/table>';

    var obj = {};
    obj.modal = true;
    obj.width = 500;
    obj.title = "";
    obj.open = function (event, ui) {
        $(this).parent().find('.ui-dialog-title').html(title_html);
    };
    obj.close = function (ev, ui) {
        $(this).remove();
    };
    obj.draggable = false;
    obj.resizable = false;
    $("#jalert").dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();

    // Условие для обновления сессии
    if (type === 'session_expire') {
        $('.ui-dialog-titlebar-close').remove();
    } else {
        $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
        $('.ui-dialog-titlebar-close').text('');
    }

    overlayHandler();
    $(window).bind('resize', overlayHandler);
    $("div.ui-dialog").focus();
    $("#jalert_ok").one('click', function () {
        var form_array = jQuery.makeArray($("#jalert form").serializeArray());
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        if (typeof object == 'object') {
            url_d = object.href;
            class_d = object.className;
            if (typeof url_d !== undefined) {
                if (class_d.indexOf('href_post') != -1) {
                    href_post_click(object, true);
                }
                else {
                    location.href = url_d;
                }
            }
            else {
                return false;
            }
        }
        else {
            return object(form_array);
        }
    });
    $("#jalert_can").one('click', function () { // При отмене вызывается закрытие окна, действие происходит автоматически
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        if (typeof object !== 'object') {
            if (typeof no_succes === 'function') {
                return no_succes();
            } else {
                return no_succes;
            }
        }
        else {
            return false;
        }
    });
    $(".ui-dialog-titlebar-close").one('click', function () {
        $(window).unbind('resize', overlayHandler);
        if (typeof object !== 'object') {
            if (typeof no_succes === 'function') {
                return no_succes();
            } else {
                return no_succes;
            }
        }
        else {
            return false;
        }
    });
    return false;
}

function jinfo(text, title, width, no_button) {
    text = text.replace(/\n/g, "<br>");
    button = no_button ? "" : "<p align=center><button class=\"al_button\" id=\"jalert_ok\">OK</button></p>"
    $("<div id=jalert><div class=\"hr1\" ></div><p align=\"left\" style=\"padding-left: 6px;\">" + text + "</p>" + button + "</div></div>").prependTo("#alert_div");
    bind_help_bt("alert_div"); // привязываем подсказки
    title_html = '<table cellpadding=0 cellspacing=0 ><tr><td height=10><p style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding-left:4px;\">' + title + '<\/p><\/td><td><\/td><\/tr><\/table>';
    var obj = {};
    obj.modal = true;
    obj.title = title_html;
    obj.draggable = false;
    obj.resizable = false;
    obj.open = function (event, ui) {
        $(this).parent().find('.ui-dialog-title').html(title_html);
    };
    obj.width = width ? width : 500;
    $("#jalert").dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();
    $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
    $('.ui-dialog-titlebar-close').text('');
    overlayHandler();
    $(window).bind('resize', overlayHandler);
    $("div.ui-dialog").focus();
    $("#jalert_ok").click(function () {
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        return false;
    });
    $("#jclose_link").one('click', function () {
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
    });
    return false;
}

function cb_info(obj, text) {
    title_html = '<table cellpadding=0 cellspacing=0 ><tr><td height=10><p style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding-left:4px;\">' + obj.title + '<\/p><\/td><td><\/td><\/tr><\/table>';
    if (!text) {
        text = '';
    }
    if (!text.html) {
        $("<div id=jalert><div class=\"hr1\" ></div><p align=\"left\" style=\"padding-left: 6px;\">"+ text.body +"</p></div>").prependTo("body");
    } else {
        $("<div id=jalert><span>"+ text.body +"</span></div>").prependTo("body");
    }

    if (!obj.width) {
        obj.width = 500;
    }
    obj.modal = true;
    obj.draggable = false;
    obj.resizable = false;
    for (var i = 0; i < obj.buttons.length; i++) {
        if(!obj.buttons[i].class) {
            obj.buttons[i].class = 'al_button';
        }
    }
    $("#jalert").dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();
    $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
    $('.ui-dialog-titlebar-close').text('');
    overlayHandler();
    $(window).bind('resize', overlayHandler);
    $("div.ui-dialog").focus();
    return false;
}

var overlayHandler = function () {
    $(".ui-widget-overlay").height($(document).height());
};

function jVariableConfirm(text, object, buttons, no_succes, title) {
    text = text.replace(/\n/g, "<br>");
    $("<div id='jalert'><div class='hr1'></div><p align='left' style='padding-left:6px;'>" + text + "</p><p align='center'>" +
            "<button class='al_button confirm_button' id='jalert_main'>" + buttons['var1'] + "</button>" +
            "<button class='al_button confirm_button' id='jalert_alt'>" + buttons['var2'] + "</button>" +
            "<button class='al_button confirm_button' id='jalert_cancel'>" + buttons['cancel'] + "</button>" +
        "</p></div>").prependTo("#alert_div");
    bind_help_bt("alert_div"); // привязываем подсказки
    if (!title) title = lang.Attention;
    title_html = '<table cellpadding=0 cellspacing=0 ><tr><td height=10><p style=\"font-size:16px; font-weight:normal; color:#999; margin-top:0;padding-left:4px;\">' +
                    title +
                '<\/p><\/td><td><\/td><\/tr><\/table>';

    var obj = {};
    obj.modal = true;
    obj.width = 500;
    obj.title = '';
    obj.open = function (event, ui) {
        $(this).parent().find('.ui-dialog-title').html(title_html);
    };
    obj.close = function (ev, ui) {
        $(this).remove();
    };
    obj.draggable = false;
    obj.resizable = false;
    $("#jalert").dialog(obj);
    $('.ui-icon-closethick').remove();
    $('.ui-button-icon-space').remove();
    $('.ui-dialog-titlebar-close').removeClass('ui-button ui-corner-all ui-widget ui-button-icon-only');
    $('.ui-dialog-titlebar-close').text('');
    overlayHandler();
    $(window).bind('resize', overlayHandler);
    $("div.ui-dialog").focus();

    $("#jalert_main").one('click', function() { // Основной вариант - первая кнопка
        var form_array = jQuery.makeArray($("#jalert form").serializeArray());
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        if (typeof object == 'object') {
            url_d = object.href;
            class_d = object.className;
            if (typeof url_d !== undefined) {
                if (class_d.indexOf('href_post') != -1) href_post_click(object, true);
                else location.href = url_d;
            }
            else return false;
        }
        else return object(form_array);
    });

    $("#jalert_alt").one('click', function() { // Альтернативный вариант
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        if (typeof object !== 'object') {
            if (typeof no_succes === 'function') return no_succes();
            else return no_succes;
        }
        else return false;
    });

    $("#jalert_cancel").one('click', function() {
        $("#jalert").dialog('close');
        $(window).unbind('resize', overlayHandler);
        $('#sel_all').trigger('click');
        return false;
    });

    $(".ui-dialog-titlebar-close").one('click', function() {
        $(window).unbind('resize', overlayHandler);
        $('#sel_all').trigger('click');
        return false;
    });

    return false;
}
