/* ------ Объект для работы с отображаемыми напоминаниями ------ */
var cbTipsDisplay = new Object;

/* ------ Свойства объекта ------ */
cbTipsDisplay.cur_tab = "all";    // Вкладка окна напоминаний. По умолчанию - все.
cbTipsDisplay.count = 0;          // Счётчик сообщений в шапке
cbTipsDisplay.last_tip_list = {}; // Список последних напоминаний
cbTipsDisplay.arcLoad = false;    // Был ли загружен архив
cbTipsDisplay.offset = 50;        // Количество напоминаний, загруженных за раз
cbTipsDisplay.fullLoad = {};      // Объект загруженных вкладок
cbTipsDisplay.firstLoad = {};     // Флаг первой загрузки
// Показанные напоминания
cbTipsDisplay.displayed = {};
cbTipsDisplay.displayed['all'] = 0; // Все
cbTipsDisplay.displayed['important'] = 0; // Важные
cbTipsDisplay.displayed['today'] = 0; // Сегодня
cbTipsDisplay.displayed['active'] = 0; // Активные
cbTipsDisplay.deleted = {};               // Удалённые напоминания

/* ------ Методы объекта ------ */
// Счётчик напоминаний
cbTipsDisplay.counter = function () {
    var prev_tips_counter = $.cookie("event[tip][count]"); // Предыдущее значение счётчика
    if (CBLocalStorage.getData("['tips_count']")) {
        var strCount = (CBLocalStorage.getData("['tips_count']")).toString();
        if (!strCount) return;
        this.count = strCount.replace(/\\/g, ""); // Счётчик напоминаний
        this.count = ((this.count).toString()).replace(/\\/g, "");

        // Отображение количества напоминаний в шапке
        if (this.count == 0) {
            this.count = " ";
            CBLocalStorage.putData("['new_tips']", undefined);
            CBLocalStorage.putData("['loaded_tips']", undefined);
        }
        if (document.getElementById("tips_count")) {
            document.getElementById("tips_count").innerHTML = this.count;
        }
        $.cookie("event[tip][count]", this.count);
        if (prev_tips_counter != this.count) { // Количество напоминаний изменилось, мерцание счётчика
            $('#header_tips').stop();
            document.getElementById("header_tips").style.color = "#ffff00";
            $('#header_tips').css("opacity", "1.0");
            setTimeout("document.getElementById('header_tips').style.color='#ffffff'; $('#header_tips').animate({opacity: '0.7'}, 200)", 200);
        }
    }


}

// Загрузка напоминаний при скролле
cbTipsDisplay.scrollLoad = function () {
    $("#tip_window_content").unbind("scroll");
    if (this.fullLoad[this.cur_tab])
        $("#tip_load_block").remove();
    if (this.fullLoad[this.cur_tab] || this.cur_tab == "archive" || this.cur_tab == "search") return;

    if (!document.getElementById("tip_load_block"))
        document.getElementById("tip_window_list").innerHTML += "<div id='tip_load_block' style='min-height: 90px; text-align: center'><br /><a class='tip_link' href='#' onclick=\"cbTipsDisplay.load('" + cbTipsDisplay.cur_tab + "'); return false\">" + lang.Show_more + "</a></div>";
    else
        document.getElementById("tip_load_block").innerHTML = "<br /><a class='tip_link' href='#' onclick=\"cbTipsDisplay.load('" + cbTipsDisplay.cur_tab + "'); return false\">" + lang.Show_more + "</a>";

    $("#tip_window_content").bind("scroll", function () {
        if ($("#tip_window_content").scrollTop() > $("#tip_window_list").height() - $("#tip_window_content").height() - 200) {
            if (document.getElementById("tip_load_block"))
                document.getElementById("tip_load_block").innerHTML = "<br /><img src='images/process.gif' alt='' />";
            $("#tip_window_content").unbind("scroll");
            cbTipsDisplay.load(cbTipsDisplay.cur_tab);
        }
    });
};

// Переключение вида напоминаний
cbTipsDisplay.switchTab = function (tipType) {
    if (this.cur_tab != tipType)
        $("#tip_window_content").scrollTop(0);

    this.cur_tab = tipType;
    // Вкладки сообщений
    $("#tips_window_controls td").removeClass("tip_sw_active");
    $("#tip_sw_tab_" + tipType).addClass("tip_sw_active");

    if (tipType == "all") { // Все напоминания
        document.getElementById("close_all_tips_button").style.display = '';
        document.getElementById("tip_window_search").style.display = "none";
        document.getElementById("tip_window_archive").style.display = "none";
        document.getElementById("tip_window_list").style.display = "block";
        $("#tip_window_list .tip_list_item:not(.t_closed)").show();
        $("#tip_window_list .all_load:not(.t_all)").hide();

        noTips = true;
        $("#tip_window_list .tip_list_item:visible").each(function () {
            noTips = false;
        });

        if (noTips && document.getElementById("tip_window").style.display == 'block') {
            document.getElementById("tip_window_tooltip").style.display = "block";
            document.getElementById("tip_window_tooltip").innerHTML = "<div style='color: #444; font-size: 13px; margin: 20px 0px 0px;'>" + lang.No_tips + "</div>";
        }
        else if (noTips) {
            document.getElementById("tip_window_tooltip").style.display = "block";
            document.getElementById("tip_window_tooltip").innerHTML = "<h2><img src='images/process.gif' alt='' style='vertical-align: middle' /></h2>";
        }
        else
            document.getElementById("tip_window_tooltip").style.display = "none";
    }
    else if (tipType == "search") { // Поиск
        document.getElementById("close_all_tips_button").style.display = 'none';
        document.getElementById("tip_window_tooltip").style.display = "none";
        document.getElementById("tip_window_list").style.display = "none";
        document.getElementById("tip_window_archive").style.display = "none";
        document.getElementById("tip_window_search").style.display = "block";
    }
    else if (tipType == "archive") { // Архив
        document.getElementById("close_all_tips_button").style.display = 'none';
        document.getElementById("tip_window_tooltip").style.display = "none";
        document.getElementById("tip_window_list").style.display = "none";
        document.getElementById("tip_window_search").style.display = "none";
        document.getElementById("tip_window_archive").style.display = "block";
        if (!this.arcLoad) {
            this.arcLoad = true;
            this.getArchive(1);
        }
    }
    else { // Фильтр напоминаний
        document.getElementById("close_all_tips_button").style.display = '';
        document.getElementById("tip_window_list").style.display = "block";
        document.getElementById("tip_window_search").style.display = "none";
        document.getElementById("tip_window_archive").style.display = "none";
        tClass = ".t_" + tipType;
        $(tClass + ":not(.t_closed)").show();
        $("#tip_window_list .tip_list_item:not(" + tClass + ")").hide();

        noTips = true;
        $("#tip_window_list .tip_list_item:visible").each(function () {
            noTips = false;
        });

        if (noTips && document.getElementById("tip_window").style.display == 'block') {
            document.getElementById("tip_window_tooltip").style.display = "block";
            document.getElementById("tip_window_tooltip").innerHTML = "<div style='color: #444; font-size: 13px; margin: 20px 0px 0px;'>" + lang.No_tips + "</div>";
            if (document.getElementById("close_all_tip_link"))
                document.getElementById("close_all_tip_link").style.display = 'none';
        }
        else if (noTips) {
            document.getElementById("tip_window_tooltip").style.display = "block";
            document.getElementById("tip_window_tooltip").innerHTML = "<h2><img src='images/process.gif' alt='' style='vertical-align: middle' /></h2>";
        }
        else
            document.getElementById("tip_window_tooltip").style.display = "none";
    }

    if (tipType != "archive" && tipType != "search" && (this.offset > this.displayed[tipType] || !cbTipsDisplay.firstLoad[tipType]))
        this.load(tipType);
    else {
        $("#tip_load_block").remove();
        this.scrollLoad();
    }
};

// Загрузка напоминаний
cbTipsDisplay.load = function (type) {
    if (cbTipsDisplay.fullLoad[type]) return;
    var offset = this.displayed[type];
    var limit = this.offset;
    if (!cbTipsDisplay.firstLoad[type]) {
        if (this.offset <= this.displayed[type])
            limit = this.displayed[type];
        offset = 0;
        cbTipsDisplay.firstLoad[type] = 1;
    }
    CBLocalStorage.firstData = false;
    if (document.getElementById("tip_load_block"))
        document.getElementById("tip_load_block").innerHTML = "<br /><img src='images/process.gif' alt='' />";
    else if (!this.fullLoad[type]) {
        document.getElementById("tip_window_list").innerHTML += "<div id='tip_load_block' style='min-height: 90px; text-align: center'><br /><img src='images/process.gif' alt='' /></div>";
    }
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'get', type: 'tips', key: 'load', value: {type: type, offset: offset, limit: limit}, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (msg == "EMPTY") {
                cbTipsDisplay.fullLoad[type] = 1;
                $("#tip_load_block").remove();
                if (!document.getElementById("tip_list_item_" + type) && cbTipsDisplay.displayed[type] != 0)
                    document.getElementById("tip_window_list").innerHTML += "<table class='tip_list_item t_" + type + " all_load' id='tip_list_item_" + type + "' cellspacing='0' style='border: none'><tr><td style='padding: 10px 0px; text-align: center'>" + lang.tips_loaded + "</td></tr></table>";
                return;
            }
            var tips = JSON.parse(msg);
            if (!tips) return;

            for (tipId in tips) {
                one_tip = tips[tipId];
                isNewTip = CBLocalStorage.getData("['new_tips']['" + tipId + "']");
                isLoadTip = CBLocalStorage.getData("['loaded_tips']['" + tipId + "']");
                one_tip.n = "1";
                if (isNewTip != undefined) {
                    one_tip.sound_notify = isNewTip.sound_notify;
                    one_tip.popup = isNewTip.popup;
                    CBLocalStorage.putData("['new_tips']['" + tipId + "']", one_tip); // Записываем в объект
                }
                else if (isLoadTip != undefined) {
                    one_tip.sound_notify = isLoadTip.sound_notify;
                    one_tip.popup = isLoadTip.popup;
                    CBLocalStorage.putData("['loaded_tips']['" + tipId + "']", one_tip); // Записываем в объект
                }
                else {
                    one_tip.sound_notify = "0";
                    one_tip.popup = "1";
                    CBLocalStorage.putData("['loaded_tips']['" + tipId + "']", one_tip); // Записываем в объект
                }
            }
            //уберем колесо загрузки, так как все напоминания уже отдались :-)
            if (document.getElementById("tip_load_block"))
                $("#tip_load_block").remove();

            if (offset == 0) {
                newTips = CBLocalStorage.getData("['new_tips']");
                for (tipId in newTips)
                    if (tips[tipId] == undefined)
                        CBLocalStorage.putData("['new_tips']['" + tipId + "']", undefined);
                loadedTips = CBLocalStorage.getData("['loaded_tips']");
                for (tipId in loadedTips)
                    if (tips[tipId] == undefined)
                        CBLocalStorage.putData("['loaded_tips']['" + tipId + "']", undefined);
            }

            if (document.getElementById("tip_list_item_" + type))
                $("#tip_list_item_" + type).remove();
        }
    });
};

// Вывод напоминаний в окно
cbTipsDisplay.display = function () {
    var newTips = false;            // Флаг новых напоминаний
    var soundNotify = false;        // Флаг звукового уведомления
    var listContent = "";           // Список напоминаний
    var listChanged = false;        // Флаг о том, что список изменился

    let tipsObj = CBLocalStorage.getData("['new_tips']");
    let tipsObjLoaded = CBLocalStorage.getData("['loaded_tips']");
    const tipsCount = CBLocalStorage.getData("['tips_count']");

    if (!tipsObj && !tipsObjLoaded || tipsCount < 1) { // Объект пустой, прерывание
        for (key in this.last_tip_list) // Удаляем ранее загруженные напоминания, если в последней итерации их не было
        {
            $("#tip_list_item" + key).addClass("t_closed"); // Добавляем класс, чтобы сообщение не появлялось на вкладках
            document.getElementById("tip_list_item" + key).style.display = "none";
        }
        this.displayed['all'] = 0;
        this.displayed['important'] = 0;
        this.displayed['today'] = 0;
        this.displayed['active'] = 0;
        this.switchTab(cbTipsDisplay.cur_tab);
        return;
    }
    // Преобразование объекта в массив
    tipsArr = new Array;
    for (tipId in tipsObjLoaded) {
        if (!tipsObjLoaded[tipId]) continue;
        tipsObjLoaded[tipId]['type'] = "load";
        tipsArr[tipId] = tipsObjLoaded[tipId];
    }
    for (tipId in tipsObj) {

        if (!tipsObj[tipId]) continue;
        tipsObj[tipId]['type'] = "new";
        tipsArr[tipId] = tipsObj[tipId];
    }

    var new_notifications = 0;

    for (var i = tipsArr.length; i >= 0; i--) { // Цикл по всем напоминаниям, выводим в окно

        var tipId = i;
        if (tipsArr[tipId] == undefined)
            continue;

        one_tip = tipsArr[tipId]; // Объект напоминания
        var tableName = tipsArr[tipId].name_table;
        var tableId = tipsArr[tipId].table_id;
        var tipIdFromTips = tipsArr[tipId].tip_id;



        if (one_tip.deleted == 1) {
            if (document.getElementById("tip_list_item" + tipId)) {
                $("#tip_list_item" + tipId).addClass("t_closed"); // Добавляем класс, чтобы сообщение не появлялось на вкладках
                document.getElementById("tip_list_item" + tipId).style.display = "none";
            }

            if (!this.deleted[tipId]) {
                this.displayed['all'] -= 1;
                if (one_tip.inactive != 1)
                    this.displayed['active'] -= 1;
                if (one_tip.today == 1)
                    this.displayed['today'] -= 1;
                if (one_tip.flag == "1")
                    this.displayed['important'] -= 1;
                this.deleted[tipId] = 1;
            }
            continue;
        }

        if (one_tip.message == undefined) continue;

        // Классы напоминаний
        tip_classes = "tip_list_item";

        // Свойство напоминания - активность
        if (one_tip.inactive == 1) // Неактивное
        {
            bg_color = "#CCCCCC";
            /*if (document.getElementById("new_event_bubbletip" + tipId)) {
                $("#new_event_bubbletip" + tipId).animate({backgroundColor: "#CCCCCC"}, 400);
                //$(".event_content--after").css("background","#CCCCCC")
            }*/
        }
        else { // Активное напоминание
            tip_classes += " t_active";
            bg_color = one_tip.bg_color;
        }

        // Уведомления о новых напоминаниях
        if (one_tip.popup == "0") {
            if (one_tip.notify_on == "1") {
                newTips = true;
                if (one_tip.sound_notify == "0")
                    soundNotify = one_tip.notify_sound ? one_tip.notify_sound : false;
                bubbleText = one_tip.message;
                new_notifications++;
                cbNotifyObject.newEventBubble('tip', tipId, bubbleText, bg_color, "#000000", new_notifications, tableName, tableId, tipIdFromTips);
            }
            else {
                if (one_tip.type == "new")
                    CBLocalStorage.putData("['new_tips']['" + tipId + "']['sound_notify']", "1");
                if (one_tip.type == "load")
                    CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['sound_notify']", "1");
            }
        }
        // Окно напоминаний закрыто
        if (document.getElementById("tip_window").style.display == 'none')
            continue;

        // Напоминание не было изменено
        if (one_tip.n == "0")
            continue;

        // Свойство напоминания - важность
        if (one_tip.flag == "1") { // Важное напоминание
            starImage = "star.png";
            tip_classes += " t_important";
        }
        else starImage = "star_gray.png";
        // Свойство напоминания - сегодня
        if (one_tip.today == 1) // Месяц, день и год совпадают - флаг "сегодня"
            tip_classes += " t_today";

        // Формируем ссылку
        standart_link = "view_line2.php?table=" + one_tip.table_id + "&line=" + one_tip.line_id; // Стандартная ссылка
        if (one_tip.main == "1") standart_link += "&solution=" + tipId;

        if (one_tip.custom_url)
            tip_link = one_tip.custom_url; // Пользовательская ссылка
        else
            tip_link = standart_link

        full_message = "<a href=\"" + tip_link + "\" class='tip_link'>" + one_tip.message + "</a>";

        // Формируем содержание блока с напоминаниями
        if (this.last_tip_list[tipId] == undefined) { // Напоминания не было, формируем блок полностью.
            listContentPart = "<table class='" + tip_classes + "' id='tip_list_item" + tipId + "' cellspacing='0' style='display: none'><tr>";
            listContentPart += "<td style='width: 32px;'><img style='cursor: pointer' onclick='cbTipsDisplay.star(" + tipId + ")' src='images/" + starImage + "' alt='' id='tip_item_star" + tipId + "' /></td>";
            listContentPart += "<td style='width: 140px'><div id='tip_item_date" + tipId + "' style='margin: 0px 15px; border-radius: 2px; padding: 3px; background-color: " + bg_color + "; color: #444;'>" + one_tip.date + "</div></td>";
            listContentPart += "<td class='t_message' style='text-align: left;' id='tip_item_message" + tipId + "'>" + full_message + "</td>";
            listContentPart += "<td style='width: 32px' id='tip_item_action" + tipId + "' class='tip_item_action'>";
            if (one_tip.main != "1" || one_tip.inactive == "1")
                listContentPart += "<img class='tip_item_close' id='tip_item_close" + tipId + "' onclick='cbTipsDisplay.close(" + tipId + ")' src='images/tip_window_item_close.png' />";
            else
                listContentPart += "<a href='" + standart_link + "'><img src='images/tip_arrow.gif' alt='' /></a>";
            listContentPart += "</td>";
            listContentPart += "</tr></table>";

            if (one_tip.type == "new") // Новое напоминание вставляем в начало
                document.getElementById("tip_window_list").innerHTML = listContentPart + document.getElementById("tip_window_list").innerHTML;
            else // Остальные в конец
                listContent += listContentPart

            this.last_tip_list[tipId] = 1; // Добавляем напоминание в список

            this.displayed['all'] += 1;
            if (one_tip.inactive != 1)
                this.displayed['active'] += 1;
            if (one_tip.today == 1)
                this.displayed['today'] += 1;
            if (one_tip.flag == "1")
                this.displayed['important'] += 1;
        }
        else if (document.getElementById("tip_list_item" + tipId)) { // Напоминание уже есть, изменяем части
            // Звезда
            document.getElementById("tip_item_star" + tipId).src = "images/" + starImage;
            // Цвет даты
            document.getElementById("tip_item_date" + tipId).style.backgroundColor = bg_color;
            // Сообщение
            document.getElementById("tip_item_message" + tipId).innerHTML = full_message;
            // Классы
            document.getElementById("tip_list_item" + tipId).className = tip_classes;
        }
        // Напоминание было отображено
        if (one_tip.type == "new")
            CBLocalStorage.putData("['new_tips']['" + tipId + "']['n']", "0");
        if (one_tip.type == "load")
            CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['n']", "0");
        listChanged = true;
    }
    // Конец цикла по напоминаниям

    if (listContent != "")
        document.getElementById("tip_window_list").innerHTML += listContent; // Вставка содержимого в окно

    if (document.getElementById("tip_window_list").style.display == "none" && listChanged) // Отображаем напоминания
        setTimeout("cbTipsDisplay.switchTab('" + cbTipsDisplay.cur_tab + "')", 400);  // Включаем текущую вкладку для скрытия/показа изменившихся напоминаний
    else if (listChanged)
        this.switchTab(cbTipsDisplay.cur_tab);

    for (key in this.last_tip_list) // Удаляем ранее загруженные напоминания, если в последней итерации их не было
    {
        if (!tipsArr[key]) {
            if (document.getElementById("tip_list_item" + key)) {
                $("#tip_list_item" + key).addClass("t_closed"); // Добавляем класс, чтобы сообщение не появлялось на вкладках
                document.getElementById("tip_list_item" + key).style.display = "none";
            }
        }
    }

    // Уведомления
    if (newTips && cbWindowObject.activeTab) {
        if (soundNotify) cbNotifyObject.sound(soundNotify); // Звук события
        fTitle = lang.New_tips + " (" + cbNotifyObject.tips + ")";
        if (cbNotifyObject.messages > 0) sTitle = lang.New_messages + " (" + cbNotifyObject.messages + ")";
        else sTitle = "";
        cbNotifyObject.blinkTitle(fTitle, sTitle); // Включаем мигание заголовка
    }
};

// Важно/неважно
cbTipsDisplay.star = function (tipId, addTipType) {
    tipTable = "show";
    if (addTipType == undefined)
        addId = "";
    else {
        addId = addTipType;
        if (addId == "b" || addId == "arc")
            tipTable = "arc";
    }
    document.getElementById("tip_item_star" + addId + tipId).src = "images/indicator.gif"; // Меняем звезду на анимацию загрузки
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'tips', key: 'star', value: {id: tipId, tip_table: tipTable}, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (document.getElementById("tip_item_star" + addId + tipId)) { // Объект не был удалён
                if (msg == '1') {
                    document.getElementById("tip_item_star" + addId + tipId).src = "images/star.png"; // Устанавливаем активную звезду
                    if (tipTable == "show") { // Изменяем данные в объекте
                        if (CBLocalStorage.getData("['new_tips']['" + tipId + "']"))
                            CBLocalStorage.putData("['new_tips']['" + tipId + "']['flag']", 1);
                        if (CBLocalStorage.getData("['loaded_tips']['" + tipId + "']"))
                            CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['flag']", 1);
                        if (addId != "")
                            document.getElementById("tip_item_star" + tipId).src = "images/star.png"; // Устанавливаем активную звезду
                        else if (document.getElementById("tip_item_stara" + tipId))
                            document.getElementById("tip_item_stara" + tipId).src = "images/star.png"; // Устанавливаем активную звезду
                        $("#tip_list_item" + tipId).addClass("t_important"); // Добавляем класс
                        cbTipsDisplay.displayed['important'] += 1;
                        cbTipsDisplay.switchTab(cbTipsDisplay.cur_tab); // Включаем текущую вкладку для скрытия/показа изменившихся напоминаний
                    }
                    else {
                        if (document.getElementById("tip_item_starb" + tipId))
                            document.getElementById("tip_item_starb" + tipId).src = "images/star.png"; // Устанавливаем активную звезду
                        if (document.getElementById("tip_item_stararc" + tipId))
                            document.getElementById("tip_item_stararc" + tipId).src = "images/star.png"; // Устанавливаем активную звезду
                    }
                }
                else if (msg == '0') {
                    document.getElementById("tip_item_star" + addId + tipId).src = "images/star_gray.png"; // Устанавливаем неактивную звезду
                    if (tipTable == "show") { // Изменяем данные в объекте
                        if (CBLocalStorage.getData("['new_tips']['" + tipId + "']"))
                            CBLocalStorage.putData("['new_tips']['" + tipId + "']['flag']", 0);
                        if (CBLocalStorage.getData("['loaded_tips']['" + tipId + "']"))
                            CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['flag']", 0);
                        if (addId != "")
                            document.getElementById("tip_item_star" + tipId).src = "images/star_gray.png"; // Устанавливаем неактивную звезду
                        else if (document.getElementById("tip_item_stara" + tipId))
                            document.getElementById("tip_item_stara" + tipId).src = "images/star_gray.png"; // Устанавливаем неактивную звезду
                        $("#tip_list_item" + tipId).removeClass("t_important"); // Сбрасываем класс
                        cbTipsDisplay.displayed['important'] -= 1;
                        cbTipsDisplay.switchTab(cbTipsDisplay.cur_tab); // Включаем текущую вкладку для скрытия/показа изменившихся напоминаний
                    }
                    else {
                        if (document.getElementById("tip_item_starb" + tipId))
                            document.getElementById("tip_item_starb" + tipId).src = "images/star_gray.png"; // Устанавливаем активную звезду
                        if (document.getElementById("tip_item_stararc" + tipId))
                            document.getElementById("tip_item_stararc" + tipId).src = "images/star_gray.png"; // Устанавливаем активную звезду
                    }
                }
            }
        }
    });
};

// Закрыть напоминания
cbTipsDisplay.close = function (tipId) {
    var imgCell = document.getElementById("tip_item_close" + tipId);
    var tipView = "";
    if (!imgCell) { // Закрытие в поиске
        imgCell = document.getElementById("tip_item_closea" + tipId);
        tipView = "a";
    }
    else if (document.getElementById("tip_item_closea" + tipId))
        document.getElementById("tip_item_closea" + tipId).src = "images/indicator.gif";
    imgCell.src = "images/indicator.gif"; // Меняем кнопку закрытия на анимацию загрузки
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'tips', key: 'close', value: tipId, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            if (document.getElementById("tip_list_item" + tipView + tipId)) { // Объект не был удалён со страницы
                if (msg == '1') { // Плавное срытие элемента
                    if (tipView != "a") {
                        var newObj = CBLocalStorage.getData("['new_tips']['" + tipId + "']");
                        var loadedObj = CBLocalStorage.getData("['loaded_tips']['" + tipId + "']")
                        if (newObj)
                            CBLocalStorage.putData("['new_tips']['" + tipId + "']['deleted']", 1);
                        if (loadedObj)
                            CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['deleted']", 1);
                    }
                    else if (document.getElementById("tip_list_itema" + tipId))
                        document.getElementById("tip_list_itema" + tipId).style.display = "none";
                    $("#tip_list_item" + tipView + tipId).addClass("t_closed"); // Добавляем класс, чтобы сообщение не появлялось на вкладках
                    document.getElementById("tip_list_item" + tipView + tipId).style.display = "none";
                }
                else // Пришло некорректное сообщение с сервера, возвращаем кнопку
                    imgCell.src = "images/tip_window_item_close.png";
            }
        }
    });
};

// Закрыть все напоминания
cbTipsDisplay.closeAll = function () {
    $(".tip_item_action img").attr("src", "images/indicator.gif");
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'put', type: 'tips', key: 'close', value: 'all', csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            closedTips = JSON.parse(msg);
            if (closedTips) {
                for (one_tip in closedTips) {
                    tipId = closedTips[one_tip];
                    var newObj = CBLocalStorage.getData("['new_tips']['" + tipId + "']");
                    var loadedObj = CBLocalStorage.getData("['loaded_tips']['" + tipId + "']")
                    if (newObj)
                        CBLocalStorage.putData("['new_tips']['" + tipId + "']['deleted']", 1);
                    if (loadedObj)
                        CBLocalStorage.putData("['loaded_tips']['" + tipId + "']['deleted']", 1);
                    if (document.getElementById("tip_list_item" + tipId)) {
                        $("#tip_list_item" + tipId).addClass("t_closed"); // Добавляем класс, чтобы сообщение не появлялось на вкладках
                        document.getElementById("tip_list_item" + tipId).style.display = 'none';
                    }
                }
                cbTipsDisplay.switchTab(cbTipsDisplay.cur_tab);
            }
            setTimeout("$('.tip_item_action img').attr('src', 'images/tip_arrow.gif')", 1000);
        }
    });
};

// Поиск по напоминаниям
cbTipsDisplay.search = function (page) {
    var search_text = document.getElementById("t_search_text").value;
    var begin_date = document.getElementById("t_date_begin").value;
    var end_date = document.getElementById("t_date_end").value;
    if (document.getElementById("t_search_text").style.color == "gray")
        search_text = "";

    if (document.getElementById("extended_tip_search").style.display == "none") {
        if (search_text == "") {
            begin_date = "";
            end_date = "";
            $("#tip_search_result").fadeOut(200, function () {
                document.getElementById("tip_search_result").innerHTML = "<div style='color: red; font-size: 13px; margin: 20px 0px 0px;'>" + lang.alert_enter_search_text + "</div>";
                $("#tip_search_result").fadeIn(200);
            });
            return;
        }
    }
    else if (search_text == "" && begin_date == "" && end_date == "") {
        $("#tip_search_result").fadeOut(200, function () {
            document.getElementById("tip_search_result").innerHTML = "<div style='color: red; font-size: 13px; margin: 20px 0px 0px;'>" + lang.enter_date_or_text + "</div>";
            $("#tip_search_result").fadeIn(200);
        });
        return;
    }

    if (document.getElementById("admin_tip_search"))
        s_user = document.getElementById("admin_tip_search").value;
    else
        s_user = user.id;

    if (page > 0) loadSearchRes = "add_search_next" + page;
    else loadSearchRes = "tip_search_result";

    $("#" + loadSearchRes).fadeOut(200, function () {
        document.getElementById(loadSearchRes).innerHTML = "<div style='margin: 20px 0px 0px;'><img src='images/process.gif' alt='' style='vertical-align: middle' /></div>";
        $("#" + loadSearchRes).fadeIn(200);
        $.ajax({ // Формируем запрос
            type: "POST",
            url: "events.php",
            data: {
                sel: 'get',
                type: 'tips',
                key: 'search',
                value: {text: search_text, begin_date: begin_date, end_date: end_date, page: page, user: s_user},
                csrf: csrf
            },
            success: function (msg) { // Сообщение с сервера
                search_res = JSON.parse(msg);
                cnt = parseInt(search_res.cnt)
                if (cnt > 0) {
                    if (page == 0)
                        searchContent = "<div style='color: #444; font-size: 13px; text-align: left; border-bottom: 1px solid #DBDBDB; padding: 10px;'>" + lang.Found + " " + lang.reminders + ": " + cnt + "</div>";
                    else
                        searchContent = "";

                    for (tip_type in search_res['result']) {
                        for (tipId in search_res['result'][tip_type]) {
                            add_class = "";
                            one_tip = search_res['result'][tip_type][tipId];
                            if (one_tip.flag == "1")
                                starImage = "star.png";
                            else
                                starImage = "star_gray.png";
                            if (one_tip.inactive == 1)
                                bg_color = "#CCCCCC";
                            else {
                                bg_color = one_tip.bg_color;
                                add_class = " t_active";
                            }
                            standart_link = "view_line2.php?table=" + one_tip.table_id + "&line=" + one_tip.line_id; // Стандартная ссылка
                            if (one_tip.main == "1") standart_link += "&solution=" + tipId;

                            if (one_tip.custom_url)
                                tip_link = one_tip.custom_url; // Пользовательская ссылка
                            else
                                tip_link = standart_link

                            full_message = "<a href=\"" + tip_link + "\" class='tip_link'>" + one_tip.message + "</a>";

                            searchContent += "<table class='tip_list_item_search" + add_class + "' id='tip_list_item" + tip_type + tipId + "' cellspacing='0'><tr>";
                            searchContent += "<td style='width: 32px;'><img ";
                            if (s_user == user.id) searchContent += "style='cursor: pointer' onclick=\"cbTipsDisplay.star(" + tipId + ", '" + tip_type + "')\" ";
                            searchContent += "src='images/" + starImage + "' alt='' id='tip_item_star" + tip_type + tipId + "' /></td>";
                            searchContent += "<td style='width: 140px'><div style='margin: 0px 15px; border-radius: 2px; padding: 3px; background-color: " + bg_color + "; color: #444;'>" + one_tip.date + "</div></td>";
                            searchContent += "<td class='t_message' style='text-align: left;'>" + full_message + "</td>";
                            searchContent += "<td style='width: 32px' class='tip_item_action'>";
                            if (tip_type == "a" && s_user == user.id) {
                                if (one_tip.main != "1" || one_tip.inactive == "1")
                                    searchContent += "<img class='tip_item_close' id='tip_item_close" + tip_type + tipId + "' onclick=\"cbTipsDisplay.close(" + tipId + "); $('#tip_list_item" + tip_type + tipId + "').fadeOut()\" src='images/tip_window_item_close.png' />";
                                else
                                    searchContent += "<a href='" + standart_link + "'><img src='images/tip_arrow.gif' alt='' /></a>";
                            }
                            searchContent += "</td>";
                            searchContent += "</tr></table>";
                        }
                    }
                    next_search_page = parseInt(search_res.next)
                    if (cnt > next_search_page) {
                        if (next_search_page + 10 > cnt) next_cnt = cnt - next_search_page;
                        else next_cnt = 10;
                        searchContent += "<div id='add_search_next" + next_search_page + "' style='min-height: 90px'><br /><a class='tip_link' href='#' onclick='cbTipsDisplay.search(" + next_search_page + "); return false'>" + lang.Show_more + " " + next_cnt + "</a></div>";
                    }

                    $("#" + loadSearchRes).fadeOut(200, function () {
                        document.getElementById(loadSearchRes).innerHTML = searchContent;
                        $("#" + loadSearchRes).fadeIn(200);
                    });
                }
                else {
                    $("#tip_search_result").fadeOut(200, function () {
                        document.getElementById("tip_search_result").innerHTML = "<div style='color: #444; font-size: 13px; margin: 20px 0px 0px;'>" + lang.No_data + "</div>";
                        $("#tip_search_result").fadeIn(200);
                    });
                }
            }
        });
    });
};

// Фокус в поле поиска
cbTipsDisplay.search_focus = function (fObj) {
    if (fObj.style.color == "gray") {
        fObj.value = "";
        fObj.style.color = "black";
    }
};

// Увод курсора из поля поиска
cbTipsDisplay.search_blur = function (fObj) {
    if (fObj.value == "") {
        fObj.value = lang.Search;
        fObj.style.color = "gray"
    }
};

// Календари в расширенном поиске
$(function () {
    $('.t_search_date').datepicker({
        showOn: "button",
        dateFormat: lang.date_js_format,
        showAlways: true,
        buttonImage: "images/calbtn.png",
        buttonImageOnly: true,
        buttonText: lang.Calendar,
        showAnim: (('\v' == 'v') ? "" : "show")  // в ie не включаем анимацию, тормозит
    }).attr('placeholder', lang.date_placeholder);
});

// Получить страницу архива
cbTipsDisplay.getArchive = function (arcPage) {
    $.ajax({ // Формируем запрос
        type: "POST",
        url: "events.php",
        data: {sel: 'get', type: 'tips', key: 'archive', value: arcPage, csrf: csrf},
        success: function (msg) { // Сообщение с сервера
            onePage = JSON.parse(msg);
            allRecords = onePage.cnt;
            arc_pages = Math.ceil(allRecords / 20);

            $("#tip_window_archive").animate({opacity: 'hide', height: 'hide'}, 400, function () {
                document.getElementById("tip_window_archive").innerHTML = "";
                $("#tip_window_content").scrollTop(0);
                for (tipId in onePage['arc_page']) {
                    arcContent = "";
                    add_class = "";
                    one_tip = onePage['arc_page'][tipId];

                    if (one_tip.flag == "1")
                        starImage = "star.png";
                    else
                        starImage = "star_gray.png";
                    if (one_tip.inactive == 1)
                        bg_color = "#CCCCCC";
                    else {
                        bg_color = one_tip.bg_color;
                        add_class = " t_active";
                    }
                    if (one_tip.custom_url)
                        tip_link = one_tip.custom_url; // Пользовательская ссылка
                    else
                        tip_link = "view_line2.php?table=" + one_tip.table_id + "&line=" + one_tip.line_id // Стандартная ссылка

                    full_message = "<a href=\"" + tip_link + "\" class='tip_link'>" + one_tip.message + "</a>";

                    arcContent += "<table class='tip_list_item_archive" + add_class + "' id='tip_list_item_arc" + tipId + "' cellspacing='0'><tr>";
                    arcContent += "<td style='width: 32px;'><img style='cursor: pointer' onclick=\"cbTipsDisplay.star(" + tipId + ", 'arc')\" src='images/" + starImage + "' alt='' id='tip_item_stararc" + tipId + "' /></td>";
                    arcContent += "<td style='width: 140px'><div style='margin: 0px 15px; border-radius: 2px; padding: 3px; background-color: " + bg_color + "; color: #444;'>" + one_tip.date + "</div></td>";
                    arcContent += "<td class='t_message' style='text-align: left;'>" + full_message + "</td>";
                    arcContent += "<td style='width: 32px'>&nbsp;</td>";
                    arcContent += "</tr></table>";
                    document.getElementById("tip_window_archive").innerHTML = arcContent + document.getElementById("tip_window_archive").innerHTML;
                }
                document.getElementById("tip_window_archive").innerHTML = "<div style='color: #444; font-size: 13px; text-align: left; border-bottom: 1px solid #DBDBDB; padding: 10px;'>" + lang.Arc_pages + ": " + arc_pages + ". " + lang.Arc_total + " " + lang.reminders + ": " + allRecords + ".</div>" + document.getElementById("tip_window_archive").innerHTML;

                if (arc_pages > 1) {
                    arcPagesContent = "<div class='tip_arc_pages'>";
                    prev_page = arcPage - 1;
                    next_page = arcPage + 1;

                    for (p = 1; p <= 3 && p <= arc_pages; p++) {
                        if (p == arcPage)
                            arcPagesContent += "<span>" + arcPage + "</span>&nbsp;";
                        else
                            arcPagesContent += "<a href='#' onclick='cbTipsDisplay.getArchive(" + p + "); return false' class='tip_link'>" + p + "</a>&nbsp;";
                    }

                    if (arcPage > 5)
                        arcPagesContent += "<span>...</span>&nbsp;";

                    if (arc_pages > 7) {
                        for (p = prev_page; p <= next_page; p++) {
                            if (p > 3 && p < arc_pages - 2) {
                                if (p == arcPage)
                                    arcPagesContent += "<span>" + arcPage + "</span>&nbsp;";
                                else
                                    arcPagesContent += "<a href='#' onclick='cbTipsDisplay.getArchive(" + p + "); return false' class='tip_link'>" + p + "</a>&nbsp;";
                            }
                        }
                    }

                    if (arc_pages > 9 && arcPage < arc_pages - 4)
                        arcPagesContent += "<span>...</span>&nbsp;";

                    for (p = arc_pages - 2; p <= arc_pages; p++) {
                        if (p > 3) {
                            if (p == arcPage)
                                arcPagesContent += "<span>" + arcPage + "</span>&nbsp;";
                            else
                                arcPagesContent += "<a href='#' onclick='cbTipsDisplay.getArchive(" + p + "); return false' class='tip_link'>" + p + "</a>&nbsp;";
                        }
                    }

                    arcPagesContent += "</div>";
                    document.getElementById("tip_window_archive").innerHTML += arcPagesContent;
                }
                $("#tip_window_archive").animate({opacity: 'show', height: 'show'}, 600);
            });
        }
    });
};