/* ------ Объект свойств окна и вкладок приложения ------ */
var cbWindowObject = new Object;

/* ------ Свойства объекта ------ */

cbWindowObject.activeTab = true;    // Флаг активной вкладки
cbWindowObject.activeWindow = true; // Флаг активного окна

/* ------ Методы объекта ------ */
// Обработка потери фокуса окна
cbWindowObject.blurTrigger = function () {
    cbWindowObject.activeWindow = false; // Сбрасываем активность окна
    cbEventsObject.checkingInterval = 60000; // Увеличиваем интервал проверки
}

// Обработка получения фокуса окна
cbWindowObject.focusTrigger = function () {
    if (window.IEActiveWin) { // Для IE при активности постоянно сбрасываем таймер потери фокуса
        clearInterval(IEActiveWin);
        //IEActiveWin = setTimeout("cbWindowObject.blurTrigger()", 5000);
    }

    if (cbWindowObject.activeWindow && cbWindowObject.activeTab) return;

    cbWindowObject.activeWindow = true;
    $.cookie("event[hash]", page_hash);
    // Уменьшаем интервал проверки
    cbEventsObject.checkingInterval = 30000;

    if (document.getElementById("tip_window").style.display == "block")
        cbEventsObject.checkingInterval = 3000;
    else if (document.getElementById("message_window")) {
        if (document.getElementById("message_window").style.display == "block")
            cbEventsObject.checkingInterval = 3000;
    }

    if (!cbWindowObject.activeTab) {
        if (window.getTipsInit) clearTimeout(getTipsInit);
        cbWindowObject.activeTab = true; // Вкладка стала активной
        cbEventsObject.getLocalEvents(); // Подгружаем последние данные из хранилища


    }
    else {
        if (window.getTipsInit) {
            clearTimeout(getTipsInit);
            cbEventsObject.getRemoteEvents();
        }
    }
    if (window.displayEventsInit) {
        clearInterval(displayEventsInit);
        cbEventsObject.displayEvents()
    }
}

// Проверка активного окна
cbWindowObject.checkHash = function () {
    if ($.cookie("event[hash]") == page_hash)
        return true;
    else
        return false;
}

/* ------ Установка обработчиков ------ */
if (navigator.appVersion.indexOf("MSIE") == -1) {
    window.onblur = cbWindowObject.blurTrigger;  // Обработка потери фокуса окна
    window.onfocus = cbWindowObject.focusTrigger; // Обработка получения фокуса окна
}
else { // При отсутствии активности 5 сек. активность окна сбрасывается.
    IEActiveWin = setTimeout("cbWindowObject.blurTrigger()", 5000);
}

// Дублирование получения фокуса/активности на вкладке
$(document).ready(function () {
    // Дублирование получение фокуса (для IE только это и работает)
    $(document).bind('click keydown scroll', cbWindowObject.focusTrigger);
});