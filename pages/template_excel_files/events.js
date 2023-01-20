/* ------ Объект работы с событиями ------*/
var cbEventsObject = new Object;
/* ------ Флаг для определения, есть ли на странице открытый alert ------*/
var alertIsShowed = false;

/* ------ Свойства объекта ------ */
cbEventsObject.checkingInterval = intval(config.events_refresh); // Интервал проверки
if (document.getElementById("tip_window").style.display == "block")
    cbEventsObject.checkingInterval = 3000;
else if (document.getElementById("message_window")) {
    if (document.getElementById("message_window").style.display == "block")
        cbEventsObject.checkingInterval = 3000;
}

/* ------ Методы объекта ------ */
// Получение событий с сервера
cbEventsObject.getRemoteEvents = function () {
    if (!cbWindowObject.activeWindow && !cbWindowObject.checkHash()) // Окно неактивно, вкладка стала неактивной
    {
        cbWindowObject.activeTab = false; // Сбрасываем активность вкладки
        return; // Прерывание
    }

    if (window.getTipsInit)
        clearInterval(getTipsInit);

    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'get', csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            // Если пользователь не найден - редиректим на страницу авторизации
            if (msg === 'Unknown user') location.href = 'login.php';

            // Если истекло время сессии -> выводим сообщение, перезагружаем страницу
            if (msg === 'Session has expired') {
                session_has_expired = true;
                /*if (!alertIsShowed) {
                    alertIsShowed = true;
                    if (confirm(lang.Session_time_expired)) window.location.reload();
                    else window.location.reload();
                }
                return false;*/
            }

            events_array = JSON.parse(msg);
            const oldTipsObject = CBLocalStorage.getData("['new_tips']"); // Получаем объект всех текущих уведомлений

            if (events_array) {
                for (type in events_array) { // Цикл по полученным событиям, добавляем в массив
                    var inputStorage = {} // Объект всех полученных событий

                    one_event = events_array[type];
                    if (one_event == "EMPTY") { // Пустой объект, очищаем данные по типу
                        CBLocalStorage.putData("['" + type + "']", undefined); // Записываем в объект
                        continue;
                    }
                    if (type == "tips_count" || type == "messages_count" || type == "calendar_count" || type == "ok_messages_count") {
                        CBLocalStorage.putData("['" + type + "']", one_event);
                        continue;
                    }

                    if (type == "tips") type = "new_" + type;
                    if (type == "messages") type = "loaded_" + type;

                    for (event_id in one_event) {
                        inputStorage[event_id] = {};
                        full_data = one_event[event_id];
                        for (key in full_data) {
                            inputStorage[event_id][key] = full_data[key];
                            // Проверяем, есть ли объект в массиве
                            eventObj = CBLocalStorage.getData("['" + type + "']['" + event_id + "']['" + key + "']");

                            if (eventObj != full_data[key]) // Объект изменился или ещё не был создан, ставим флаг "новый"
                            {
                                if (key == "popup" && eventObj != "1" && eventObj != undefined)
                                    inputStorage[event_id][key] = "0";
                                if (key == "popup" && eventObj == undefined)
                                    inputStorage[event_id]['sound_notify'] = "0";
                                inputStorage[event_id]['n'] = "1";
                            }
                            else // Устанавливаем предыдущий флаг
                                inputStorage[event_id]['n'] = CBLocalStorage.getData("['" + type + "']['" + event_id + "']['n']");
                        }
                    }
                    if (type == "new_tips") CBLocalStorage.putData("['new_tips']", null); // сбрасываем старые уведомления

                    for (event_id in one_event) {
                        if (type == "new_tips" || type == "loaded_messages") {
                            CBLocalStorage.putData("['" + type + "']['" + event_id + "']", inputStorage[event_id]); // Записываем в объект
                        }
                    }

                    if (type != "new_tips" && type != "loaded_messages")
                        CBLocalStorage.putData("['" + type + "']", inputStorage); // Записываем в объект

                    if (type == "new_tips") {
                        const newTipsObject = CBLocalStorage.getData("['new_tips']"); // Обновленный объект с уведомлениями
                        const oldTipsIds = oldTipsObject != void 0 ? Object.keys(oldTipsObject) : []; // Массив клчей (id) старого объекта
                        const newTipsIds = Object.keys(newTipsObject); // Массив клчей (id) нового объекта

                        // Если в новом обекте нет ранее выводимого уведомления -> закрываем его
                        for (let tipId of oldTipsIds)
                            if (newTipsIds.indexOf(tipId) === -1) cbNotifyObject.closeEventTooltip(tipId, 'tip', 1, false)
                    }
                }

                // Обновляем данные в шапке
                // Напоминания
                let tipsCount = CBLocalStorage.getData("['tips_count']");
                const tipsBuble = $('#header_tips > span.header__tips');
                tipsBuble.text(tipsCount);
                if ( tipsCount > 0 ) {
                    tipsBuble.css('display','flex');
                } else {
                    if(document.getElementById('event_tooltip_asterisk').innerHTML == ""){
                        $('#event-tooltip-close-all').trigger('click'); // Если уведомлений нет - закрываем блок со всеми уведомлениями
                        tipsBuble.hide();
                    }
                }

                // Сообщения
                if (typeof events_array?.cb_messages !== 'undefined') {
                  CB.display_chats_in_tray.redraw({id:'cb_messages', count: events_array.cb_messages});
                }

                // Сообщения ОК
                let okMessagesCount = CBLocalStorage.getData("['ok_messages_count']");
                CB.display_chats_in_tray.redraw({id:'ok_messages', count: okMessagesCount});
                const okMessagesBuble = $('#ok_manager__messages > span.header__tips');
                okMessagesBuble.text(okMessagesCount);
                if ( okMessagesCount > 0 ) {
                    okMessagesBuble.css('display','flex');
                } else {
                    okMessagesBuble.hide();
                }

                // Календарь
                let calendarCount = CBLocalStorage.getData("['calendar_count']");
                const calendarBuble = $('.header__user-item--calendar > span.header__tips');
                calendarBuble.text(calendarCount);
                if ( calendarCount > 0 ) {
                    calendarBuble.css('display','flex');
                } else {
                    calendarBuble.hide();
                }

                // Перезапуск
                getTipsInit = setTimeout("cbEventsObject.getRemoteEvents()", cbEventsObject.checkingInterval);
            }
        }
    });
}

// Получение событий из локального хранилища
cbEventsObject.getLocalEvents = function () {
    if (!CBLocalStorage.support()) // Локальное хранилище не поддерживается, прерывание
        return;

    // Типы обрабатываемых событий
    var s_events = new Array('tips_count', 'messages_count', 'ok_messages_count', 'loaded_tips', 'new_tips', 'users', 'chates', 'loaded_messages', 'new_messages', 'm_tabs', 'lines');

    // Цикл по типам событий
    for (i = 0; i < s_events.length; i++) {
        var inputStorage = {} // Объект всех полученных событий
        var type = s_events[i]; // Тип события

        if ((typeof localStorage[type] == 'undefined') || (localStorage[type] == 'undefined')) // Объект отсутствует в хранилище, следующая итерация
            continue;

        if (type == "tips_count" || type == "messages_count" || type == "ok_messages_count") {
            CBLocalStorage.putData("['" + type + "']", localStorage[type])
            continue;
        }

        var one_event = JSON.parse(localStorage[type]);
        for (event_id in one_event) {
            full_data = one_event[event_id];
            if ((type == "new_tips" || (type == "new_messages" && full_data.is_read == "1")) && full_data.popup == "1") {
                if (type == "new_tips")
                    CBLocalStorage.putData("['loaded_tips']['" + event_id + "']", full_data);
                else
                    CBLocalStorage.putData("['loaded_messages']['" + event_id + "']", full_data);
                continue;
            }

            inputStorage[event_id] = {};

            for (key in full_data) {
                inputStorage[event_id][key] = full_data[key];
                // Проверяем объект в массиве
                eventObj = CBLocalStorage.getData("['" + type + "']['" + event_id + "']['" + key + "']");

                if (eventObj != full_data[key]) // Объект изменился или ещё не был создан, ставим флаг "новый"
                    inputStorage[event_id]['n'] = "1";
                else // Устанавливаем предыдущий флаг
                    inputStorage[event_id]['n'] = CBLocalStorage.getData("['" + type + "']['" + event_id + "']['n']");
            }
        }
        CBLocalStorage.putData("['" + type + "']", inputStorage); // Записываем в объект
    }
    this.getRemoteEvents(); // Запускаем получение сообщений с сервера
}
// Первый запуск
cbEventsObject.getLocalEvents();

// Отображение событий, добавлять функции отображения сюда
cbEventsObject.displayEvents = function () {
    // Напоминания
    cbTipsDisplay.counter();
    cbTipsDisplay.display();

    if (user.acc_msg) {
        // Пользователи
        cbUsersDisplay.display();

        // Сообщения
        cbMessagesDisplay.counter();
        cbMessagesDisplay.display();
    }

    // Перезапуск
    displayEventsInit = setTimeout("cbEventsObject.displayEvents()", cbEventsObject.checkingInterval);
}
// Первый запуск
setTimeout("cbEventsObject.displayEvents()", 600);
if (document.getElementById("tip_window").style.display == 'none')
    cbTipsDisplay.load("all");
