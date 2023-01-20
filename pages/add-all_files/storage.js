/* ------ Объект данных записи ------ */
var CBLocalStorage = new Object;
// Объект данных событий
var dataEvents = new Object;
CBLocalStorage.firstData = true;

/* ------ Методы объекта ------ */

// Поддержка локального хранилища
// Возвращает true или false
CBLocalStorage.support = function () {
    return ('localStorage' in window) && window['localStorage'] !== null;
}

// Метод получения данных
// Получает ключ в виде строки формата ['key'] (простой вариант), или ['key_1']['key_2']['key_3'] для расширенного доступа к свойствам объекта
// Возвращает конечные данные объекта dataEvents
CBLocalStorage.getData = function (storageKey) {
    try { // Пытаемся найти целевой объект
        return eval("dataEvents" + storageKey);
    }
    catch (e) { // Объект не существует, возвращаем undefined
        return undefined;
    }
}

// Метод записи данных
// Получает ключ в виде строки формата ['key'] (простой вариант), или ['key_1']['key_2']['key_3'] для расширенного доступа к свойствам объекта и данные любого типа
CBLocalStorage.putData = function (storageKey, storageData) {
    str_keys = storageKey.substring(2); // Убираем ['
    str_keys = str_keys.substring(0, str_keys.length - 2); // Убираем ']
    keys = str_keys.split("']['"); // Массив ключей
    exec_str = "dataEvents"; // Переменная
    tObjUndefined = false;   // Флаг несуществования целевого объекта

    try { // Пытаемся присвоить данные целевому объекту
        eval(exec_str + storageKey + "=storageData;");
    }
    catch (e) { // Объект не существовал, ставим флаг
        tObjUndefined = true;
    }

    if (tObjUndefined) { // Если целевой объект не был найден, выполняем цикл по ключам с воссозданием всей цепочки объектов
        for (i = 0; i < keys.length; i++) { // Цикл по ключам
            exec_str += "['" + keys[i] + "']";
            if (eval(exec_str) == undefined)
                eval(exec_str + "={}");

            if (i == (keys.length - 1))
                eval(exec_str + "=storageData;");
        }
    }

    if (this.support && cbWindowObject.activeTab) // Если локальное хранилище поддерживается и вкладка активна, записываем данные в локальное хранилище
    {
        if ((keys[0] == "loaded_tips" || keys[0] == "loaded_messages") && this.firstData) {
            var sorted = new Array;
            var recData = new Object;
            for (objId in dataEvents[keys[0]]) {
                if (dataEvents[keys[0]][objId]['deleted']) continue;
                sorted[objId] = dataEvents[keys[0]][objId];
            }
            var dCount = 0;
            if (keys[0] == "loaded_tips")
                var offset = cbTipsDisplay.offset;
            else
                try { // Проверка для пользователей не имеющих доступа к messages
                  var offset = cbMessagesDisplay.offset;
                } catch { };
            for (var i = sorted.length; i > 0; i--) {
                if (!sorted[i]) continue;
                if (dCount >= offset) break;
                recData[i] = sorted[i];
                dCount += 1;
            }
            localStorage[keys[0]] = JSON.stringify(recData);
        }
        else
            localStorage[keys[0]] = JSON.stringify(dataEvents[keys[0]]);
    }
}































