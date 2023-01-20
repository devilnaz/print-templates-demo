/* ------ Объект уведомлений ------ */
var cbNotifyObject = new Object;

/* ------ Свойства объекта ------ */
cbNotifyObject.events = 0;                        // Счётчик всплывающих событий
cbNotifyObject.tips = 0;                          // Счётчик новых напоминаний
cbNotifyObject.MAX_TIPS = max_notifications || 3; // Максимальное кол-во напоминаний на отображение
cbNotifyObject.messages = 0;                      // Счётчик новых сообщений
cbNotifyObject.title = document.title;            // Текущий заголовок окна
cbNotifyObject.MARGIN_BETWEEN_NOTIFY = 7;         // Отсуп между блоками
cbNotifyObject.NOTIFY_APPEAR_TIMEOUT = 300;       // Таймаут закрытия и открытия уведомлений
cbNotifyObject.timeout = 0;                       // Timeout
cbNotifyObject.isReady = false;                   // Загрузились уведомления при загрузки страницы
cbNotifyObject.prevNotifications = 0;
cbNotifyObject.notificationOpened = true;

// Звук нового события
cbNotifyObject.sound = function (notifySound) {
    if (user.sound_on == "0") return;
    try {
        AudioObj = new Audio("sounds/" + notifySound + ".wav");
        if ((AudioObj.canPlayType("audio/mpeg") != "no") && (AudioObj.canPlayType("audio/mpeg") != ""))
            AudioObj = new Audio("sounds/" + notifySound + ".mp3");
        AudioObj.play();
    }
    catch (e) {
        document.getElementById("event_sound").src = "sounds/" + notifySound + ".wav"
    }
}
var gearWheelImgUrl = "images/top_icon_settings.png"

// Всплывание новых напоминаний
cbNotifyObject.newEventBubble = function (eventType, eventId, eventText, eventBgcolor, eventFontcolor, notifies_count, tableName, tableId, tipIdFromTips) {
    if (document.getElementById("new_event_bubble" + eventType + eventId))
        return;

    var bubbleHeader = '';

    if (!this.notificationOpened && notifies_count > this.prevNotifications) {
        this.notificationOpened = false;
    } else {
        this.notificationOpened = true;
    }

    if ($('.event-tooltip_wrap').css('display') === 'none'
        || $('.event-tooltip__notifications-wrap').css('display') === 'none') {
        $('.event-tooltip_wrap').show();
        this.notificationOpened = false;
        if (notifies_count > 1) {
            $('.event-tooltip__notifications-wrap').show();
        } else {
            $('.event-tooltip__notifications-wrap').slideDown();
        }
    }

    this.prevNotifications = notifies_count;

    if (eventType !== "asterisk") {
        this.events += 1;
    }
    if (eventType == "tip") {
        this.tips += 1;
        if(tipShowTableName === 1 && tableName !== null) {
            bubbleHeader = lang.New_tip  + ' ' + tableName;

        } else {
            bubbleHeader = lang.New_tip;
        }
        var urlForNotify = "edit_tip.php?table=" + tableId + "&tip=" + tipIdFromTips;
        CBLocalStorage.putData("['new_tips']['" + eventId + "']['sound_notify']", "1");
    }
    if (eventType == "message") {
        this.messages += 1;
        bubbleHeader = lang.New_message;
        CBLocalStorage.putData("['loaded_messages']['" + eventId + "']['sound_notify']", "1");
    }
    if (eventType == "asterisk") {
        bubbleHeader = 'Asterisk';
    }

    if (eventType === 'save') {
        bubbleHeader = 'Сохранено';
    }

    var asterisk = (eventType === 'asterisk') ? 'event_content--asterisk' : '';

    /** Не удалять комментарии, дальнейшая доработка для админки в напоминаниях */
    /*var event_settings = '';

    if (eventType === 'tip' && parseInt(user.group_id) === 1 || (parseInt(user.sub_admin) === 1 &&
        (parseInt(user.sub_admin_rights_own_acc) === 1) || parseInt(user.sub_admin_rights_access_subadmin) === 1)) {
        event_settings = '<button type="button" class="event-tooltip__settings" onclick="cbNotifyObject.eventSettings(\'' + eventType + '\', ' + eventId + ')"></button>'
    }*/

    //в зависимости от значения notifyStyle меняется вид напоминаний


    if ( notifyStyle === 0 ) {
        var bell_svg ="<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\" width=\"19px\" height=\"19px\" viewBox=\"0 0 510 510\" style=\"enable-background:new 0 0 510 510;\" xml:space=\"preserve\">\n" +
            "<g>\n" +
            "\t<g id=\"notifications-none\">\n" +
            "\t\t<path d=\"M255,510c28.05,0,51-22.95,51-51H204C204,487.05,226.95,510,255,510z M420.75,357V216.75    c0-79.05-53.55-142.8-127.5-160.65V38.25C293.25,17.85,275.4,0,255,0c-20.4,0-38.25,17.85-38.25,38.25V56.1    c-73.95,17.85-127.5,81.6-127.5,160.65V357l-51,51v25.5h433.5V408L420.75,357z M369.75,382.5h-229.5V216.75    C140.25,153,191.25,102,255,102s114.75,51,114.75,114.75V382.5z\"" +
            " fill=\"" +eventBgcolor + "\"/>\n" +
            "\t</g>\n" +
            "</g>\n" +
            "</svg>"

        var chat_svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"19px\" height=\"19px\" viewBox=\"0 0 24 24\">" +
            "<path " +
            " fill=\"" +eventBgcolor +"\"" +
            "d=\"M22 3v13h-11.643l-4.357 3.105v-3.105h-4v-13h20zm2-2h-24v16.981h4v5.019l7-5.019h13v-16.981z\"/>" +
            "</svg>"

        var msg_img = "<svg style=\"enable-background:new 0 0 128 128;\" viewBox=\"0 0 128 128\" xml:space=\"preserve\" xmlns=\"http://www.w3.org/2000/svg\"><circle class=\"bubbleUser0\" cx=\"64\" cy=\"64\" r=\"64\"/><path class=\"bubbleUser1\" d=\"M77.4,75.3c-2-0.3-3.4-1.9-3.4-3.9v-5.8c2.1-2.3,3.5-5.3,3.8-8.7l0.2-3.2c1.1-0.6,2.2-2,2.7-3.8  c0.7-2.5,0.1-4.7-1.5-4.9c-0.2,0-0.4,0-0.7,0l0.4-5.9C79.6,30.9,73.3,24,65.3,24h-2.5c-8,0-14.3,6.9-13.8,15.1l0.4,6  C49.2,45,49,45,48.8,45c-1.6,0.2-2.2,2.4-1.5,4.9c0.5,1.9,1.7,3.3,2.8,3.9l0.2,3.1c0.2,3.4,1.6,6.4,3.7,8.7v5.8c0,2-1.4,3.6-3.4,3.9  C41.8,76.8,27,83.2,27,90v14h74V90C101,83.2,86.2,76.8,77.4,75.3z\"/></svg>"

        var close_img = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" id=\"Layer_1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 80 80\" style=\"enable-background:new 0 0 80 80;\" xml:space=\"preserve\" width=\"13\" height=\"13\">\n" +
            "<g>\n" +
            "\t<polygon id=\"first_close_svg\"" + " fill:\"#D3D3D3\"" + " points=\"40,49.007 15.714,73.293 6.707,64.286 30.993,40 6.707,15.714 15.714,6.707 40,30.993    64.286,6.707 73.293,15.714 49.007,40 73.293,64.286 64.286,73.293  \"/>\n" +
            "\t<path id=\"second_close_svg\"" + " fill:\"#D3D3D3\"" + " d=\"M15.714,7.414l23.578,23.578L40,31.7l0.707-0.707L64.286,7.414l8.3,8.3L49.007,39.293L48.3,40   l0.707,0.707l23.578,23.579l-8.3,8.3L40.707,49.007L40,48.3l-0.707,0.707L15.714,72.586l-8.3-8.3l23.579-23.579L31.7,40   l-0.707-0.707L7.414,15.714L15.714,7.414 M64.286,6L40,30.286L15.714,6L6,15.714L30.286,40L6,64.286L15.714,74L40,49.714L64.286,74   L74,64.286L49.714,40L74,15.714L64.286,6L64.286,6z\"/>\n" +
            "</g>\n" +
            "</svg>"

        var cur_img = ''

        if ( eventType == "message" ) {
            cur_img = chat_svg
        } else if ( eventType == "tip" ) {

            cur_img = bell_svg
        }

        bubble = "<div class='event_bubble' onmouseleave='$(this).find($(\".event_content\")).removeClass(\"event_content--hover\")' event-type='" + eventType + "' event-id='" + eventId + "' id='new_event_bubble" + eventType + eventId + "' style='border-top: 2px solid " + eventBgcolor + ";'>";
        bubble += "<div class='event_header' style='color: " + eventBgcolor + "'>";
        bubble += "<div class='bell_svg' >" + cur_img + "</div>"
        bubble += "<div class='event_header--title' >" + bubbleHeader + "</div>";
        bubble += "</div>";
        bubble += "<button class='event_tooltip_close' onclick=\"cbNotifyObject.closeEventTooltip('" + eventId + "', '" + eventType + "', 1, false)\">"+close_img+"</button>";


        if ( eventType == "message" ) {
            bubble += "<div class='bubble_message-content'>"
            bubble += "<div class='event_bubble-user_img'>" + msg_img + "</div>";
        }

        if(adminGroup === 1 && tipsWheelGear === 1 && eventType == "tip" && tableName !== null) {
            bubble += `<div class='event_content ${asterisk}' onmouseleave='$(this).addClass("event_content--fix-height")' onmouseenter='$(this).addClass("event_content--hover").removeClass("event_content--fix-height")' onclick="cbNotifyObject.clickAction('${eventType}', ${eventId})"> ${eventText} <span class='event_content--after' style='background: linear-gradient(to right, rgba(255, 255, 255, 0), #1f232d 50%)'></span></div><div class="gearwheeltip"><a href="${urlForNotify}"><img src="${gearWheelImgUrl}"/> </a></div></div>`;
        } else {
            bubble += `<div class='event_content ${asterisk}' onmouseleave='$(this).addClass("event_content--fix-height")' onmouseenter='$(this).addClass("event_content--hover").removeClass("event_content--fix-height")' onclick="cbNotifyObject.clickAction('${eventType}', ${eventId})"> ${eventText} <span class='event_content--after' style='background: linear-gradient(to right, rgba(255, 255, 255, 0), #1f232d 50%)'></span></div></div>`;
        }

        if ( eventType == "message" ) {
            bubble += "</div>"
        }
    } else {
        bubble = "<div class='event_bubble' onmouseleave='$(this).find($(\".event_content\")).removeClass(\"event_content--hover\")' event-type='" + eventType + "' event-id='" + eventId + "' id='new_event_bubble" + eventType + eventId + "' style='background: " + eventBgcolor + "; color: " + eventFontcolor + "'>";
        bubble += "<div class='event_header' style='color: " + eventFontcolor + "'>";
        bubble += bubbleHeader;
        bubble += "<img src='images/bullet.png' onmouseover='this.src=\"images/bullet_active.png\"' onmouseout='this.src=\"images/bullet.png\"' alt='' class='event_tooltip_close' onclick=\"cbNotifyObject.closeEventTooltip('" + eventId + "', '" + eventType + "', 1, false)\" />";
        bubble += "</div>";
        if(adminGroup === 1 && tipsWheelGear === 1 && eventType == "tip" && tableName !== null) {
            bubble += `<div class='event_content ${asterisk}' onmouseleave='$(this).addClass("event_content--fix-height")' onmouseenter='$(this).addClass("event_content--hover").removeClass("event_content--fix-height")' onclick="cbNotifyObject.clickAction('${eventType}', ${eventId})" style='color: " + eventFontcolor + "'> ${eventText} <span class='event_content--after' style='background: linear-gradient(to right, rgba(255, 255, 255, 0), " + eventBgcolor + " 50%)'></span></div><div class="gearwheeltip_notifystyle"><a href="${urlForNotify}"><img src="${gearWheelImgUrl}"/></a></div></div> `;
        }else{
            bubble += `<div class='event_content ${asterisk}' onmouseleave='$(this).addClass("event_content--fix-height")' onmouseenter='$(this).addClass("event_content--hover").removeClass("event_content--fix-height")' onclick="cbNotifyObject.clickAction('${eventType}', ${eventId})" style='color: " + eventFontcolor + "'> ${eventText} <span class='event_content--after' style='background: linear-gradient(to right, rgba(255, 255, 255, 0), " + eventBgcolor + " 50%)'></span></div></div> `;
        }
        }

    // Вставка в вверх блока с всплывающими сообщениями
    if (eventType !== 'asterisk') {
        if (!this.isReady) {
            document.getElementById("event_tooltip").innerHTML = document.getElementById("event_tooltip").innerHTML + bubble;
        } else {
            document.getElementById("event_tooltip").innerHTML = bubble + document.getElementById("event_tooltip").innerHTML;
        }
    } else {
        if (!this.isReady) {
            document.getElementById("event_tooltip_asterisk").innerHTML = document.getElementById("event_tooltip_asterisk").innerHTML + bubble;
        } else {
            document.getElementById("event_tooltip_asterisk").innerHTML = bubble + document.getElementById("event_tooltip_asterisk").innerHTML;
        }
    }

    // Задержка перед всплыванием для корректного всплытия нескольких сообщений
    if (!this.isReady && this.events <= this.MAX_TIPS) {
        var notify = $('#event_tooltip .event_bubble').eq(this.events - 1);
        notify.show();
    } else if (this.isReady && this.events <= this.MAX_TIPS && this.notificationOpened) {
        setTimeout(function() {
            $(`#new_event_bubble${eventType}${eventId}`).slideDown();
        }, 0);
    } else if (this.isReady && this.events <= this.MAX_TIPS && !this.notificationOpened) {
        $(`#new_event_bubble${eventType}${eventId}`).slideDown();
    } else if (this.isReady && this.events > this.MAX_TIPS && notifies_count > 1) {
        $(`#new_event_bubble${eventType}${eventId}`).show();
        $('#event_tooltip .event_bubble').eq(this.MAX_TIPS).hide();
    } else if (this.isReady && this.events > this.MAX_TIPS) {
        $(`#new_event_bubble${eventType}${eventId}`).slideDown();
        $('#event_tooltip .event_bubble').eq(this.MAX_TIPS).slideUp();
    }
    if (this.isReady && $('#tooltip-tips-count').length > 0 && this.events > 0 && $('.event-tooltip__control').hasClass('hidden-all-notifies')) {
        $('#tooltip-tips-count').text('(' + this.events + ')').addClass('event-tooltip__tips-count--new');
    } else if ($('#tooltip-tips-count').length > 0 && this.events > 0) {
        $('#tooltip-tips-count').text('(' + this.events + ')');
    }
};

// Мигание заголовка окна
cbNotifyObject.blinkTitle = function (firstTitle, secondTitle) {
    if (window.blinkInit)
        clearTimeout(blinkInit);

    if (cbWindowObject.activeWindow) { // Окно стало активным, возвращаем заголовок по умолчанию и прерываем выполнение
        document.title = this.title;
        return;
    }

    if (document.title == firstTitle) {
        if (secondTitle != "")
            document.title = secondTitle;
        else
            document.title = this.title;
    }
    else if (document.title == this.title)
        document.title = firstTitle;
    else
        document.title = this.title;

    var exec_str = "cbNotifyObject.blinkTitle('" + firstTitle + "', '" + secondTitle + "')";
    blinkInit = setTimeout(exec_str, 700);
}

// Закрытие всплывающих сообщений
cbNotifyObject.closeEventTooltip = function (tooltip_id, tooltip_type, manual_close, close_all) { // Плавное скрытие сообщения
    var notify = $("#new_event_bubble" + tooltip_type + tooltip_id);

    if (tooltip_type !== 'asterisk') {
        if (notify.length > 0) {
            if (close_all || this.events === 1) {
                $('.event-tooltip__notifications-wrap').fadeOut(this.NOTIFY_APPEAR_TIMEOUT, function () {
                    notify.remove();
                    request_for_close_notification(tooltip_id, tooltip_type);
                });
            } else {
                //убираем бордер перед закрытием, чтобы не было рывка
                notify.attr("style","border-top: 0px; display: block;")
                notify.slideUp(this.NOTIFY_APPEAR_TIMEOUT, function() {
                    notify.remove();
                    request_for_close_notification(tooltip_id, tooltip_type);
                });
                if (this.events > this.MAX_TIPS) {
                    $('#event_tooltip .event_bubble').eq(this.MAX_TIPS).slideDown(this.NOTIFY_APPEAR_TIMEOUT);
                }
            }
        }

        if ( tooltip_id == '-1' && tooltip_type == 'message' && close_all ) {
            request_for_close_notification(tooltip_id, tooltip_type, close_all);
        }

        this.events -= 1; // Пересчитываем количество показанных напоминаний
        if ($('#tooltip-tips-count').length > 0) {
            if (this.events > 0) {
                $('#tooltip-tips-count').text('(' + this.events + ')');
            }
        }
    }
    if (tooltip_type == "asterisk") {
        $("#new_event_bubble" + tooltip_type + tooltip_id).remove();
    }
    if (tooltip_type == "asterisk" && manual_close) {

        if (asterisk_client_host == "") {
            $.ajax({
                type: "POST",
                url: "modules/asterisk/asterisk_functions.php",
                data: {
                    opt: 'clear',
                    data: {
                        key: open_key,
                        master: main_server,
                        login: asterisk_number,
                        password: asterisk_password,
                        action: 'clear'
                    },
                    csrf: csrf
                }
            });
        } else {
            $.ajax({
                type: "POST",
                url: "modules/asterisk/asterisk_status.php",
                data: {action: 'clear', login: asterisk_login}
            });
        }
    }
};

/**
 * Метод, остылающий запрос об удалении уведомления
 * @param tooltip_id
 * @param tooltip_type
 */
function request_for_close_notification(tooltip_id, tooltip_type, close_all = false) {
    if (tooltip_type == "tip") {
        this.tips -= 1;
        CBLocalStorage.putData("['new_tips']['" + tooltip_id + "']['popup']", "1");
        notifyRepeat = CBLocalStorage.putData("['new_tips']['" + tooltip_id + "']['notify_repeat']");
        if (notifyRepeat != "0") {
            $.ajax({ // Формируем запрос
                type: "POST",
                async: false,
                url: "events.php",
                data: {sel: 'put', type: 'tips', key: 'notify_close', value: {id: tooltip_id}, csrf: csrf}
            });
        }
    }
    if (tooltip_type == "message") {
        if (!close_all) {
            this.messages -= 1;
            CBLocalStorage.putData("['loaded_messages']['" + tooltip_id + "']['popup']", "1");
            // отмечаем сообщение прочитанным согласно заданию 49 832
            $.ajax({ // Формируем запрос
                type: "POST",
                url: "events.php",
                data: {sel: 'put', type: 'messages', key: 'readone', value: {id: tooltip_id}, csrf: csrf},
                success: function (msg) { // Сообщение с сервера
                    if (msg == "1") { // Изменяем текущий объект
                        if (CBLocalStorage.getData("['loaded_messages']['" + tooltip_id + "']")) {
                            CBLocalStorage.putData("['loaded_messages']['" + tooltip_id + "']['is_read']", "1");
                            CBLocalStorage.putData("['loaded_messages']['" + tooltip_id + "']['n']", "1");
                        }
                        let msg_count = $("message_count").text() - 1;
                        let msgCountValue = msg_count > 0 ? msg_count : '';
                        $("message_count").text(msgCountValue);
                    }
                }
            });
        } else {
            this.messages = 0;
            CBLocalStorage.putData("['loaded_messages']", "");
            // отмечаем сообщение прочитанным согласно заданию 49 832
            $.ajax({ // Формируем запрос
                type: "POST",
                url: "events.php",
                data: {sel: 'put', type: 'messages', key: 'readall_without_id', value: {id: '-1'}, csrf: csrf},
                success: function (msg) { // Сообщение с сервера
                    if (msg == "0") { // Изменяем текущий объект
                        $("message_count").hide().text('');
                    }
                }
            });
        }
    }
}



/*cbNotifyObject.eventSettings = function(eventType, eventId) {
    if (eventType === 'tip') {
        var tipsObj = CBLocalStorage.getData('["new_tips"]["' + eventId + '"]');
        if (!tipsObj) {
            tipsObj = CBLocalStorage.getData('["new_tips"]["' + eventId + '"]');
        }
        if (tipsObj) {
            location.href = 'edit_tip.php?table=' + tipsObj['table_id'] + '&tip=' + tipsObj['tip_id'];
        }
    }
};*/

// Клик по уведомлению
cbNotifyObject.clickAction = function (eventType, eventId) {
    if (eventType === 'tip') {
        tipsObj = CBLocalStorage.getData("['new_tips'][" + eventId + "]");
        if (!tipsObj)
            tipsObj = CBLocalStorage.getData("['loaded_tips'][" + eventId + "]");

        if (tipsObj) {
            this.closeEventTooltip(eventId, eventType);
            if (tipsObj.custom_url == '{none}'){
                newLocation = '';
            }
            else if (tipsObj.custom_url){
                newLocation = tipsObj.custom_url;
            }
            else {
                newLocation = "view_line2.php?table=" + tipsObj.table_id + "&line=" + tipsObj.line_id;
                if (tipsObj.main == "1") newLocation += "&solution=" + tipsObj.id
            }
            if (newLocation != '') {
                window.open(newLocation, '');
            }
        }
    }
    if (eventType === 'message') {
        var chatId = CBLocalStorage.getData("['loaded_messages'][" + eventId + "]['chat_id']");
        if (chatId != "0")
            msgObj = "chat" + chatId;
        else
            msgObj = CBLocalStorage.getData("['loaded_messages'][" + eventId + "]['from_user']");
        if (msgObj) {
            this.closeEventTooltip(eventId, eventType);
            if (document.getElementById("message_window").style.display == "none")
                eventView('message');
            cbMessagesDisplay.selUser(msgObj);
        }
    }
};

$(document).ready(function() {
    var events_wrap = $('#event_tooltip');
    if (localStorage.getItem('hidden-notifications') === '1') {
        events_wrap.hide();
        $('.event-tooltip__control').addClass('hidden-all-notifies');
        $('.event-tooltip__control').attr('title', lang['show_tips']);
    }
    setTimeout(function() {
        if (this.events === 0) {
            $('.event-tooltip__notifications-wrap').hide();
        }
        checkBottomOffsetForTipElements();
        if ($('#tooltip-tips-count').length > 0) {
            $('#tooltip-tips-count').text('(' + this.events + ')');
        }
    }.bind(this), 400);

    setTimeout(function () {
        this.isReady = true;
    }.bind(this), 1000);

    $('.event-tooltip__control').click(function () {
        var target = $('.event-tooltip__control');
        if (target.hasClass('hidden-all-notifies')) {
            target.removeClass('hidden-all-notifies');
            $('#tooltip-tips-count').removeClass('event-tooltip__tips-count--new');
            localStorage.setItem('hidden-notifications', '0');
            target.attr('title', lang['hide_tips']);
            events_wrap.slideDown(this.NOTIFY_APPEAR_TIMEOUT, function () {
                events_wrap.addClass('event-tooltip--hover');
            });
        } else {
            target.addClass('hidden-all-notifies');
            localStorage.setItem('hidden-notifications', '1');
            target.attr('title', lang['show_tips']);
            events_wrap.slideUp(this.NOTIFY_APPEAR_TIMEOUT, function() {
                events_wrap.removeClass('event-tooltip--hover');
            });
        }
    }.bind(this));

    $('#event-tooltip-close-all').click(function (e) {
        e.stopPropagation();
        var tooltip_wrap = $('.event-tooltip_wrap');
        tooltip_wrap.css('transition', 'unset'); // Убираем длительность анимации в css, для четкой анимации на js
        tooltip_wrap.fadeOut(this.NOTIFY_APPEAR_TIMEOUT, function() {
            var notifies = $('.event_bubble');
            if (notifies.length > 0) {
                this.events = 0;
                var notifications_id = [];
                notifies.each(function (i, notify) {
                    var id = $(notify).attr('event-id');
                    notifications_id.push(id);
                    CBLocalStorage.putData("['new_tips']['" + id + "']['popup']", "1");
                    notifyRepeat = CBLocalStorage.putData("['new_tips']['" + id + "']['notify_repeat']");
                }.bind(this));
                $('.event_bubble').remove();
                if (notifications_id.length > 0) {
                    // Для tips
                    $.ajax({
                        url: 'events.php',
                        method: 'POST',
                        data: {
                            sel: 'put',
                            type: 'tips',
                            key: 'notify_close',
                            value: {
                                id: JSON.stringify(notifications_id)
                            },
                            csrf: csrf
                        }
                    });

                    // Для сообщений
                    cbNotifyObject.closeEventTooltip('-1', 'message', 1, true);
                }
            }
        }.bind(this));

    }.bind(this));

}.bind(cbNotifyObject));
