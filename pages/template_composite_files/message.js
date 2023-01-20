/* ------ Объект для работы с сообщениями ------ */
var cbMessagesDisplay = new Object;

/* ------ Свойства объекта ------ */
cbMessagesDisplay.count = 0;       // Счётчик новых сообщений в шапке
cbMessagesDisplay.openedTabs = {}; // Открытые вкладки и количество отображаемых сообщений в них
cbMessagesDisplay.tabsCount = 0;  // Счётчик отрытых вкладок
cbMessagesDisplay.prevTab = 0;     // Счётчик отрытых вкладок
cbMessagesDisplay.curTab = 0;      // Текущая вкладка
cbMessagesDisplay.msgQueue = {}    // Очередь сообщений на отправку
cbMessagesDisplay.rdQueue = {}     // Очередь прочитанных сообщений
cbMessagesDisplay.lastHist = {}    // Вкладки, которые требуют дополнительной загрузки истории сообщений
cbMessagesDisplay.fullLoad = {}    // Вкладки, полностью загруженные
cbMessagesDisplay.offset = 30;   // Количество сообщений по загрузке
cbMessagesDisplay.firstLoad = {};

/* ------ Методы объекта ------ */
// Счётчик сообщений
cbMessagesDisplay.counter = function () {
    var prev_message_counter = $.cookie("event[message][count]"); // Предыдущее значение счётчика
    var strCount = CBLocalStorage.getData("['messages_count']");
    if (!strCount) return;
    //this.count = strCount.replace(/\"/g, ""); // Счётчик напоминаний
    //this.count = this.count.replace(/\\/g, "");

    // Отображение количества напоминаний в шапке
    if (this.count == 0)
        this.count = " ";
    if (document.getElementById("message_count")) {
        document.getElementById("message_count").innerHTML = this.count;
    }
    $.cookie("event[message][count]", this.count);
    if (prev_message_counter != this.count) { // Количество сообщений изменилось, мерцание счётчика
        $('#header_messages').stop();
        document.getElementById("header_messages").style.color = "#ffff00";
        $('#header_messages').css("opacity", "1.0");
        setTimeout("document.getElementById('header_messages').style.color='#ffffff'; $('#header_messages').animate({opacity: '0.7'}, 200)", 200);
    }
}

// Прокрутка истории сообщений вниз, поскольку webkit некорректно считает высоту элементов со скроллом, приходится счтитать высоту элементов в этом блоке
cbMessagesDisplay.scrollHistory = function () {
    var histHeight = 0;
    $("#message_window_history div").each(function () {
        histHeight += $(this).height();
    });
    $("#message_window_history").scrollTop(histHeight + 1000);
}

// Сохранение вкладок для перехода по страницам
cbMessagesDisplay.saveTabs = function () {
    var savedTabs = {}; // Объект для сохранения
    var oTabs = this.openedTabs; // Список открытыч вкладок
    var noTabs = true; // Флаг, что нет открытых вкладок

    for (oneTab in oTabs) { // Цикл по вкладкам
        if (oTabs[oneTab] == undefined)
            continue; // Вкладка была закрыта

        savedTabs[oneTab] = {};
        if (oneTab == this.curTab)
            savedTabs[oneTab]['current'] = "1";
        else
            savedTabs[oneTab]['current'] = "0";
    }

    for (oneItem in savedTabs) { // Если есть хоть одна вкладка записываем в хранилище
        CBLocalStorage.putData("['m_tabs']", savedTabs);
        noTabs = false;
        break;
    }

    if (noTabs) // Открытых вкладок нет, очищаем данные
        CBLocalStorage.putData("['m_tabs']", undefined);
}

// Открыть вкладки после загрузки страницы
cbMessagesDisplay.openSavedTabs = function () {
    var selTab; // Выбранная вкладка
    var openedTabs = CBLocalStorage.getData("['m_tabs']"); // Последние открытые вкладки

    if (!openedTabs) // Не было открытых вкладок
        return;

    for (oneTab in openedTabs) { // Открываем вкладки
        this.selUser(oneTab, 1);
        if (openedTabs[oneTab]['current'] == "1")
            selTab = oneTab;
    }

    if (selTab) { // Выбираем последнюю открытую
        this.selTab(selTab);
        this.setReadAll();
    }
}

// Выбор пользователя из списка
cbMessagesDisplay.selUser = function (userId, noReadAll) {
    userId = userId + "";
    if (this.openedTabs[userId] == undefined) { // Если вкладка ещё не добавлена
        layoutWidth = (this.tabsCount + 1) * 154; // Отступ слева для новой вкладки
        //document.getElementById("message_window_tabs").style.width = layoutWidth + "px";
        document.getElementById("message_window_history").innerHTML += "<div style='display: none;' class='message_history_content' id='message_history_content" + userId + "'></div>";
        if (userId.indexOf("chat") >= 0) {
            chatId = userId.replace("chat", "");
            userFio = CBLocalStorage.getData("['chates']['" + chatId + "']['name']"); // Название чата на вкладке
        }
        else
            userFio = CBLocalStorage.getData("['users']['" + userId + "']['fio']"); // ФИО пользователя на вкладке
        if (userFio == undefined) return;
        fullUserFio = userFio;   // Полное ФИО в подсказку
        if (userFio.length > 17) // Не более 17 символов, иначе обрезается и добавляется многоточие
            userFio = userFio.substr(0, 17) + "…";
        //document.getElementById("message_window_tabs").innerHTML += "<div title='" + fullUserFio + "' onclick=\"cbMessagesDisplay.selTab('" + userId + "')\" class='message_window_tab' id='message_window_tab" + userId + "'><img src='images/message_tab_close.png' onclick=\"cbMessagesDisplay.closeTab('" + userId + "'); event.cancelBubble = true\" /><div>" + userFio + "</div></div>";
        this.openedTabs[userId] = 0; // Добавляем вкладку в список
        this.tabsCount += 1; // Увеличиваем количество открытых вкладок
    }
    this.selTab(userId); // Выбираем вкладку
    this.saveTabs();     // Сохраняем открытые вкладки
    if (!noReadAll) this.setReadAll();
}

// Выбор вкладки
cbMessagesDisplay.selTab = function (tabId) {
    var overWidth = 0;
    $(".message_history_content").css("display", "none"); // Скрываем все истории сообщений
    $(".message_window_tab").removeClass("active_message_tab"); // Сбрасываем активность вкладок
    document.getElementById("message_history_content" + tabId).style.display = "block"; // Показываем необходимую историю сообщений
    $("#message_window_tab" + tabId).addClass("active_message_tab"); // Устанавливаем активную вкладку
    this.prevTab = this.curTab;
    this.curTab = tabId;  // Текущая вкладка
    if(this.prevTab != 0) $(`#user_list_item${this.prevTab}`).removeAttr('style');
    $(`#user_list_item${this.curTab}`).attr('style', 'background-color: #e4e4e4;');
    cbMessagesDisplay.scrollHistory(); // Прокручиваем историю сообщений вниз
    setTimeout("cbMessagesDisplay.scrollHistory();", 400); // Докручиваем
    $("#message_window_tabs .message_window_tab").each(function () { // Цикл по открытым вкладкам
        if (this.id == "message_window_tab" + tabId) { // Если вкладка выбранная
            $("#message_tabs_layout").scrollLeft(overWidth);
        }
        overWidth += 154;
    });
    if (document.getElementById("message_window").style.display == "block")
        document.getElementById("chat_textarea").focus();
    this.saveTabs();      // Сохраняем открытые вкладки
    if ($("#message_window_history").height() < $("#message_history_content" + tabId).height())
        this.scrollLoad();
}

// Закрыть вкладку
cbMessagesDisplay.closeTab = function (tabId) {
    var selTabId = false; // Переключатель на активную вкладку после закрытия
    var deleted = false;  // Была ли удалена вкладка
    $("#message_window_tabs .message_window_tab").each(function () { // Цикл по открытым вкладкам
        if (this.id == "message_window_tab" + tabId) { // Если вкладка закрываемая
            cbMessagesDisplay.openedTabs[tabId] = undefined; // Удаляем вкладку из списка
            document.getElementById("message_history_content" + tabId).style.display = "none"; // Скрываем блок с историей сообщений
            document.getElementById("message_window_tab" + tabId).innerHTML = "&nbsp;";
            $(this).animate({width: "0px"}, 100, function () {
                $(this).remove(); // Удаляем вкладку
                $("#message_history_content" + tabId).remove();  // Удаляем блок с историей сообщений
                $("#message_window_tabs").css({width: "-=154"}); // Уменьшаем ширину области с вкладками
                if (cbMessagesDisplay.fullLoad[tabId]) cbMessagesDisplay.fullLoad[tabId] = undefined;
            });
            deleted = true; // Ставим флаг, что вкладка была удалена
            cbMessagesDisplay.tabsCount -= 1; // Уменьшаем количество вкладок
        }
        else if (deleted) // Вкладка была удалена
        {
            if (!selTabId) // Если следующая активная вкладка не определена, ставим эту
                selTabId = this.id.replace("message_window_tab", "");
        }
        else // Вкладка не была удалена
            selTabId = this.id.replace("message_window_tab", "");
    });

    if (tabId == cbMessagesDisplay.curTab) { // Если закрываемая вкладка была текущей активной, необходимо установить другую активную вкладку
        if (selTabId) // Если следующая активная вкладка определена, устанавливаем её
            cbMessagesDisplay.selTab(selTabId);
        else { // Нет вкладок, выводим блок с выводом сообщения о выборе контакта
            cbMessagesDisplay.curTab = 0;
            document.getElementById("message_history_content0").style.display = "block";
        }
    }
    cbMessagesDisplay.saveTabs(); // Сохраняем открытые вкладки
}

// Очередь сообщений на отправку
cbMessagesDisplay.messageQueue = function () {
    var message_text = document.getElementById("chat_textarea").value;

    if (this.curTab == 0) {
        $("#message_history_content0").animate({color: "#ff0000"}, 100, function () {
            $("#message_history_content0").animate({color: "#888888"}, 100);
        });
        return;
    }

    if (message_text == "") // Если поле пустое или вкладка не выбрана - прерываем
        return;

    if (window.sentInit) // Сбрасываем таймер отправки, если он уже был запущен
        clearTimeout(sentInit);

    if (!this.msgQueue[this.curTab]) { // Если очередь сообщений на данную вкладку не существует, то создаём
        this.msgQueue[this.curTab] = {};
        this.msgQueue[this.curTab]['length'] = 0;    // Счётчик сообщений на отправку в данной вкладке
        this.msgQueue[this.curTab]['messages'] = {}; // Объект сообщений на отправку
    }

    this.msgQueue[this.curTab]['length'] += 1; // Увеличиваем счётчик

    var m_sec = 0 + new Date().getTime();
    var msg_id = 'd' + m_sec;

    // Добавляем сообщение в объект
    this.msgQueue[this.curTab]['messages'][msg_id] = message_text;

    message_text = nl2br(htmlspecialchars(message_text));
    message_text = message_text.replace(/http(s?):\/\/([\S]*)/gim, '<a href="http$1://$2" target="_blank">http$1://$2</a>');

    // Вставляем текст в окно сообщений, с временным id
    document.getElementById("message_history_content" + this.curTab).innerHTML += "<div class='message_window_item' id='one_message" + this.curTab + "_" + msg_id + "'><div class='message_autor_date' id='message_autor_date" + this.curTab + "_" + msg_id + "'><div class='message_autor_from'>" + user.fio + "</div>&nbsp;</div>" + message_text + "</div>";
    this.openedTabs[this.curTab] += 1; // Увеличиваем счётчик сообщений на вкладке
    setTimeout("cbMessagesDisplay.scrollHistory();", 100); // Прокручиваем историю сообщений вниз
    document.getElementById("chat_textarea").value = ""; // Очищаем текстовую область

    // Запускаем таймер на отправку
    sentInit = setTimeout("cbMessagesDisplay.messageSent()", 1500);
}

// Отправка сообщений
cbMessagesDisplay.messageSent = function () {
    // Если очередь сообщений пуста, прерывание
    if (!this.msgQueue)
        return;

    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'messages', key: 'sent', value: cbMessagesDisplay.msgQueue, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            response = JSON.parse(msg);
            if (!response) return;

            for (tabId in response) { // Цикл по вкладкам
                for (q_msg in response[tabId]) { // Цикл по отправленным сообщениям
                    if (tabId.indexOf("chat") >= 0)
                        dateColor = "#BFBFBF";
                    else
                        dateColor = "#7F7F7F";
                    document.getElementById("message_autor_date" + tabId + "_" + q_msg).innerHTML += "<div class='message_date' style='color: " + dateColor + ";'>" + cbMessagesDisplay.form_lang_date(response[tabId][q_msg]['add_time']) + "</div>"; // Дописываем полученную дату
                    document.getElementById("message_autor_date" + tabId + "_" + q_msg).id = "message_autor_date" + response[tabId][q_msg]['id']; // Изменяем временный id на постоянный
                    document.getElementById("one_message" + tabId + "_" + q_msg).id = "one_message" + response[tabId][q_msg]['id']; // Изменяем временный id на постоянный
                    response[tabId][q_msg]['n'] = 1;
                    CBLocalStorage.putData("['loaded_messages']['" + response[tabId][q_msg]['id'] + "']", response[tabId][q_msg]);
                    /*  Возможно сделать отрправку в условиях глючного инета, необходимо еще одно поле в таблице messages, для того чтобы не отравлять дубликаты
                     delete this.msgQueue[tabId]['messages'][q_msg];
                     this.msgQueue[tabId]['length']--;
                     if (this.msgQueue[tabId]['length']<1) cbMessagesDisplay.msgQueue[tabId]={};
                     */
                }
            }
        }
    });
    // Очищаем очередь сообщений
    this.msgQueue = {};
}

// Формирование даты для отображения
cbMessagesDisplay.form_lang_date = function (o_date) {
    var msg_tsp = strtotime(o_date);
    var today_tsp = mktime(0, 0, 0);
    var msg_date;
    if (msg_tsp < today_tsp) msg_date = ", " + date("d", msg_tsp) + " " + lang[date("F", msg_tsp)] + " " + date("Y", msg_tsp);
    else msg_date = "";
    return date("H:i", msg_tsp) + msg_date;
}

// Отображение сообщений
cbMessagesDisplay.display = function () {
    if (this.curTab == 0 && document.getElementById("message_window").style.display != 'none') // Если текущая вкладка не выбрана,
        this.openSavedTabs(); // Пытаемся открыть сохранённые вкладки
    var scroll = false; // Флаг скролла
    var newMessages = false; // Флаг нового сообщения
    var soundNotify = false; // Флаг звукового уведомления

    var readStatusList = {};
    var checkRead = false;

    msgObjLoaded = CBLocalStorage.getData("['loaded_messages']");
    if (!msgObjLoaded) { // Объект пустой, прерывание
        for (tabId in this.openedTabs)
            this.load(tabId);
        return;
    }

    // Фильтр результатов на валидность
    var msgArr = new Array;
    for (msgId in msgObjLoaded) {
        if (!msgObjLoaded[msgId]) continue;
        if (msgObjLoaded[msgId]['add_time']) {
            if (msgObjLoaded[msgId]['add_time'].length != 19) continue; // Старый кеш, некорректная дата
        }
        msgArr['i' + msgId] = msgObjLoaded[msgId];
    }

    // Сравнение по id
    function cmp_id(a, b) {
        return (a.id < b.id) ? -1 : 1;
    }

    // Сравнение по дате
    function cmp_date(a, b) {
        if (a.add_time == b.add_time) {
            return cmp_id(a, b);
        }
        return (a.add_time < b.add_time) ? -1 : 1;
    }

    // Проводим общую сортировку по msgId
    msgArr = uasort(msgArr, cmp_date);

    // Обрабатываем все сообщения
    var loadedMessages = {}; // HTML история сообщений
    var refresh_tab = {};   // Флаг что необходимо перерисовать историю сообщений таба

    for (oneTab in this.openedTabs) { // Цикл по открытым вкладкам
        this.openedTabs[oneTab] = 0; // сбрасываем счетчик сообщений
    }

    for (var m in msgArr) { // Цикл по сообщениям
        one_msg = msgArr[m];
        if (!one_msg) continue;
        msgId = m.substr(1);

        readAction = ""; // Действия по прочтению сообщений

        if (one_msg.from_user == user.id) { // Если отправитель - текущий пользователь (исходящее сообщение)
            userFio = user.fio; // ФИО пользователя на вкладке
            autorColor = "message_autor_from"; // Цвет автора сообщения
            if (one_msg.chat_id == "0")
                tabId = one_msg.to_user; // Вкладка
            else
                tabId = "chat" + one_msg.chat_id;
        }
        else { // Входящее сообщение
            userFio = CBLocalStorage.getData("['users']['" + one_msg.from_user + "']['fio']"); // ФИО пользователя на вкладке
            if (userFio == undefined) userFio = "<i>" + lang.user_deleted + "</i>";
            autorColor = "message_autor_to"; // Цвет автора сообщения
            if (one_msg.chat_id == "0")
                tabId = one_msg.from_user; // Вкладка
            else
                tabId = "chat" + one_msg.chat_id;
            if (one_msg.is_read == "0") {
                readAction = " onmouseover=\"cbMessagesDisplay.readQueue('" + tabId + "', '" + msgId + "')\" "; // Добавляем действия для прочтения
                if (one_msg.popup == "0" && (this.curTab != tabId || document.getElementById("message_window").style.display == "none" || !cbWindowObject.activeTab)) // Блок уведомления не выводился или не был закрыт
                {
                    if (user.notify_mes) {
                        newMessages = true;
                        if (one_msg.sound_notify == "0")
                            soundNotify = true;
                        if (document.getElementById("message_window").style.display == "none") {
                            bubbleText = one_msg.message;
                            if ( notifyStyle === 0 ) {
                                var eMsg = "<b>" + userFio + "</b> " + "<div class='bubble_message-text'>" + bubbleText + "</div>";
                                cbNotifyObject.newEventBubble('message', msgId, eMsg, "#f19d26", "#ffffff");
                            } else {
                                var eMsg = "<b style='color: #D48787'>" + userFio + ":</b> " + bubbleText;
                                cbNotifyObject.newEventBubble('message', msgId, eMsg, "#404040", "#ffffff");
                            }
                        }
                        else
                            CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['popup']", "1");
                    }
                    else {
                        CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['sound_notify']", "1");
                        CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['popup']", "1");
                    }
                }
                else if (one_msg.popup == "0")
                    CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['popup']", "1");
            }
        }

        if (document.getElementById("message_window").style.display != "block") continue;

        if (one_msg.is_read == "1" || (one_msg.chat_id != "0" && one_msg.from_user == user.id)) dateColor = "#BFBFBF"; // Прочитанное сообщение
        else {
            dateColor = "#7F7F7F"; // Непрочитанное сообщение
            checkRead = true;
            readStatusList[msgId] = 1;
        }

        if (this.openedTabs[tabId] != undefined) { // Есть открытая вкладка для отображения сообщений
            if (!document.getElementById("one_message" + msgId)) { // Флаг обновить вкладку
                refresh_tab[tabId] = 1;
                if (this.curTab == tabId) scroll = true; // Скролл вниз после загрузки, т.к. сообщение появилось в текущей вкладке
            }
            else {
                if (this.curTab == tabId) scroll = false; // Скролл вниз отменяется, т.к. есть уже отображенные сообщения ниже
                if (one_msg.is_read == "1" && one_msg.n == "1") // Если изменился статус прочтённости сообщения, изменяем цвет даты
                    $("#message_autor_date" + msgId + " .message_date").css("color", "#BFBFBF");
            }


            message_text = nl2br(htmlspecialchars(one_msg.message));
            message_text = message_text.replace(/http(s?):\/\/([\S]*)/gim, '<a href="http$1://$2" target="_blank">http$1://$2</a>');
            full_message_text = "<div class='message_window_item' " + readAction + " id='one_message" + msgId + "'><div class='message_autor_date' id='message_autor_date" + msgId + "'><div class='" + autorColor + "'>" + userFio + "</div><div class='message_date' style='color: " + dateColor + "'>" + this.form_lang_date(one_msg.add_time) + "</div></div>" + message_text + "</div>";
            if (loadedMessages[tabId]) // Сообщения добавляются вверх
                loadedMessages[tabId] = loadedMessages[tabId] + full_message_text;
            else
                loadedMessages[tabId] = full_message_text;

            this.openedTabs[tabId] += 1; // Увеличиваем счётчик сообщений на вкладке
        }
    }

    for (oneTab in this.openedTabs) { // Цикл по открытым вкладкам
        if (refresh_tab[oneTab]) {
            var curHeight = $("#message_history_content" + oneTab).height();
            var curScroll = $("#message_window_history").scrollTop();
            document.getElementById("message_history_content" + oneTab).innerHTML = loadedMessages[oneTab];
            var newHeight = $("#message_history_content" + oneTab).height();
            if (oneTab == this.curTab) {
                if (!scroll) { // Оставляем позицию
                    $("#message_window_history").scrollTop((newHeight - curHeight) + (curScroll));
                }
            }
        }

        if (document.getElementById("message_loading" + oneTab) && loadedMessages[oneTab])
            $("#message_loading" + oneTab).remove();

        if ((this.openedTabs[oneTab] < this.offset && this.curTab == oneTab) || this.firstLoad[this.curTab] == undefined) // Если на вкладке меньше offset сообщений и она не полностью загружена
            this.load(oneTab); // Получаем сообщения на текущей вкладке, если они не полностью загружены
    }

    if (checkRead)
        this.checkReadStatus(readStatusList); // Проверить статус отправленных непрочитанных сообщений

    if (this.fullLoad[this.curTab]) {
        if (document.getElementById("message_loading" + this.curTab))
            document.getElementById("message_loading" + this.curTab).innerHTML = lang.messages_loaded;
        else
            document.getElementById("message_history_content" + this.curTab).innerHTML = "<div id='message_loading" + this.curTab + "' style='margin: 15px 0px; text-align: center; color: #7F7F7F;'>" + lang.messages_loaded + "</div>" + document.getElementById("message_history_content" + this.curTab).innerHTML;
    }
    else
        this.scrollLoad();

    if (scroll) cbMessagesDisplay.scrollHistory(); // Необходим скролл в текущей вкладке

    // Уведомления
    if (newMessages && cbWindowObject.activeTab) {
        if (soundNotify) cbNotifyObject.sound('sound1'); // Звук события
        fTitle = lang.New_messages + " (" + cbNotifyObject.messages + ")";
        if (cbNotifyObject.tips > 0) sTitle = lang.New_tips + " (" + cbNotifyObject.tips + ")";
        else sTitle = "";
        cbNotifyObject.blinkTitle(fTitle, sTitle); // Включаем мигание заголовка
    }
}

// Загрузка сообщений пр прокрутке
cbMessagesDisplay.scrollLoad = function () {
    $("#message_window_history").unbind("scroll");
    if (!this.curTab) return;

    $("#message_window_history").bind("scroll", function () {
        if ($("#message_window_history").scrollTop() < 100)
            cbMessagesDisplay.load(cbMessagesDisplay.curTab);
    });
}

// Загрузка сообщений на вкладке
cbMessagesDisplay.load = function (tabId) {
    var offset = this.openedTabs[tabId];
    var limit = cbMessagesDisplay.offset;
    if (offset == undefined) offset = 0;
    if (offset < limit || this.firstLoad[tabId] == undefined) {
        this.firstLoad[tabId] = 1;
        offset = 0;
    }

    if (!document.getElementById("message_loading" + tabId) && document.getElementById("message_history_content" + tabId)) {
        document.getElementById("message_history_content" + tabId).innerHTML = "<div id='message_loading" + tabId + "' style='margin: 15px 0px; text-align: center; color: #7F7F7F;'><img style='display: none;' src='images/process.gif' alt='' /></div>" + document.getElementById("message_history_content" + tabId).innerHTML;
        $("#message_window_history").scrollTop($("#message_window_history").scrollTop() + 70);
    }

    $("#message_window_history").unbind("scroll");
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {
            sel: 'get',
            type: 'messages',
            key: 'load',
            value: {tab: tabId, offset: offset, limit: limit},
            csrf: csrf
        },
        success: function (msg) { // Сообщение с сервера
            if (msg == "EMPTY") {
                cbMessagesDisplay.fullLoad[tabId] = 1;
                return;
            }
            var messages = JSON.parse(msg);
            if (!messages) return;
            var loadedCount = 0;
            for (msgId in messages) {
                one_msg = messages[msgId];
                one_msg.n = "1";
                CBLocalStorage.putData("['loaded_messages']['" + msgId + "']", one_msg); // Записываем в объект
                loadedCount += 1;
            }
            if (loadedCount < limit)
                cbMessagesDisplay.fullLoad[tabId] = 1;
        }
    });
}

// Проверка отправленных сообщений на статус прочтённых
cbMessagesDisplay.checkReadStatus = function (objRead) {
    if (document.getElementById("message_window").style.display == "none") return;
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'get', type: 'messages', key: 'read', value: objRead, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (!msg || msg.length < 0) return false;
            var messages = JSON.parse(msg);
            if (!messages) return;

            for (msgId in messages) {
                if (CBLocalStorage.getData("['loaded_messages']['" + msgId + "']")) {
                    CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['is_read']", "1"); // Записываем в объект
                    CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['n']", "1");
                }
            }
        }
    });
}

// Очередь прочтённых сообщений
cbMessagesDisplay.readQueue = function (tabId, msgId) {
    if (!this.rdQueue[tabId]) // Сообщения не было в очереди, добавляем
        this.rdQueue[tabId] = {};
    else if (this.rdQueue[tabId][msgId]) // Сообщение уже находится в очереди, выход
        return;

    if (window.readInit) // Сбрасываем таймер отправки, если он уже был запущен
        clearTimeout(readInit);

    this.rdQueue[tabId][msgId] = 1;
    // Запускаем таймер на отправку очереди
    readInit = setTimeout("cbMessagesDisplay.setRead(cbMessagesDisplay.rdQueue)", 1500);
}

// Отметить прочтианными все сообщения на вкладке
cbMessagesDisplay.setReadAll = function () {
    msgObj = CBLocalStorage.getData("['loaded_messages']");
    if (!msgObj) // Объект сообщений пустой - прерывание
        return;

    if (this.count == 0) return;
    var cur_sel_tab = this.curTab;

    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'messages', key: 'readall', value: cur_sel_tab, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (msg == "1") { // Цикл по сообщениям в ответе, переход с голубого на белый
                for (msgId[cur_sel_tab] in msgObj[oneTab]) {
                    // Изменяем текущий объект
                    if (CBLocalStorage.getData("['loaded_messages']['" + msgId + "']")) {
                        CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['is_read']", "1");
                        CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['n']", "1");
                    }
                    if (document.getElementById("new_event_bubblemessage" + msgId))
                        cbNotifyObject.closeEventTooltip(msgId, 'message');
                }
                cbMessagesDisplay.rdQueue[cur_sel_tab] = {}; // Очищаем очередь
            }
        }
    });
}

// Отправка меток прочтённоых сообщений
cbMessagesDisplay.setRead = function (msgObj) {
    if (!msgObj)
        return;

    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'messages', key: 'read', value: msgObj, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (msg == "1") { // Цикл по сообщениям в ответе, переход с голубого на белый
                for (oneTab in msgObj) {
                    for (msgId in msgObj[oneTab]) {
                        // Изменяем текущий объект
                        if (CBLocalStorage.getData("['loaded_messages']['" + msgId + "']")) {
                            CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['is_read']", "1");
                            CBLocalStorage.putData("['loaded_messages']['" + msgId + "']['n']", "1");
                        }
                        if (document.getElementById("new_event_bubblemessage" + msgId))
                            cbNotifyObject.closeEventTooltip(msgId, 'message');
                    }
                }
                cbMessagesDisplay.rdQueue = {}; // Очищаем очередь
            }
        }
    });
}

// Метод отправки (по enter или ctrl+enter)
cbMessagesDisplay.enterMode = function (eObj) {
    if (true) // Здесь должна быть проверка установки метода отправки
    { // Отправлять по Enter - установлено
        if (((eObj.keyCode == 0xA) || (eObj.keyCode == 0xD)) && (eObj.ctrlKey)) { // Обработка ctrl+enter - перевод строки в позицию курсора
            msgArea = document.getElementById("chat_textarea");
            cPos = getPos(msgArea);
            msgVal = msgArea.value;
            firstPart = msgVal.substring(0, cPos);
            secondPart = msgVal.substring(cPos);
            document.getElementById("chat_textarea").value = firstPart + "\n" + secondPart;
        }
        else if ((eObj.keyCode == 0xA) || (eObj.keyCode == 0xD)) { // Обработка Enter - отправка сообщения
            cbMessagesDisplay.messageQueue();
            return false;
        }
    }
    else if (((eObj.keyCode == 0xA) || (eObj.keyCode == 0xD)) && (eObj.ctrlKey)) { // Отправлять по enter не установлено, отправляем по ctrl+enter
        cbMessagesDisplay.messageQueue();
        return false;
    }
}
