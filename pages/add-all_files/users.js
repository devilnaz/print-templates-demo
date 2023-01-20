/* ------ Объект для работы с отображаемыми пользователями ------ */
var cbUsersDisplay = new Object;

/* ------ Свойства объекта ------ */
cbUsersDisplay.count = 0; // Счётчик онлайн-пользователей в шапке

/* ------ Методы объекта ------ */
// Показать пользователей в окне сообщений
cbUsersDisplay.display = function () {
    this.count = 0; // Счётчик онлайн-пользователей в шапке
    var usersObj = CBLocalStorage.getData("['users']");
    var chatesObj = CBLocalStorage.getData("['chates']");

    var userContentNew = ""; // Пользователи/чаты с новыми сообщениями
    var userContentOnline = ""; // Пользователи онлайн
    var userContentAway = "";   // Пользователи, которые отошли
    var userContentOffline = ""; // Пользователи оффлайн
    var userContentChat = "";    // Список чатов

    for (userId in usersObj) {
        one_user = usersObj[userId];
        if (one_user.access != "1") continue;
        this.count += 1; // Увеличиваем счётчик пользователей
        var statusBg = "user_offline_mark";
        var userTitle = "";

        if (one_user.online == "1")
            statusBg = "user_online_mark";
        else if (one_user.online == "2")
            statusBg = "user_away_mark";

        var userOnTab = one_user.fio;
        if (userOnTab.length > 20) // Не более 20 символов, иначе обрезается и добавляется многоточие
        {
            userOnTab = userOnTab.substr(0, 20) + "…";
            userTitle = " title='" + one_user.fio + "' "
        }

        if (one_user.new_messages <= 0 && document.getElementById("count_mes_on_tab" + userId))
            $("#count_mes_on_tab" + userId).remove();

        if (one_user.new_messages > 0) // От данного пользователя есть новые сообщения
        {
            userContentNew += "<div " + userTitle + " onclick='cbMessagesDisplay.selUser(" + userId + ")'" + (cbMessagesDisplay.curTab == userId ? 'style="background-color: #e4e4e4;"' : '') + " class='user_list_item " + statusBg + "' id='user_list_item" + userId + "'>" + userOnTab + "<span class='count_new_mes_on_list'>" + one_user.new_messages + "</span></div>";
            if (cbMessagesDisplay.openedTabs[userId]) {
                if (document.getElementById("count_mes_on_tab" + userId)) // Объект (красный счётчик на вкладке) существует - изменяем число
                    document.getElementById("count_mes_on_tab" + userId).innerHTML = one_user.new_messages;
                //else // Объект не существует - добавляем
                    //document.getElementById("message_window_tab" + userId).innerHTML += "<span class='count_mes_on_tab' id='count_mes_on_tab" + userId + "'>" + one_user.new_messages + "</span>";
            }
        }
        else if (one_user.online == "1") // Пользователи онлайн
            userContentOnline += "<div " + userTitle + " onclick='cbMessagesDisplay.selUser(" + userId + ")'" + (cbMessagesDisplay.curTab == userId ? 'style="background-color: #e4e4e4;"' : '') + " class='user_list_item " + statusBg + "' id='user_list_item" + userId + "'>" + userOnTab + "</div>";
        else if (one_user.online == "2") // Пользователи, которые отошли
            userContentAway += "<div " + userTitle + " onclick='cbMessagesDisplay.selUser(" + userId + ")'" + (cbMessagesDisplay.curTab == userId ? 'style="background-color: #e4e4e4;"' : '') + " class='user_list_item " + statusBg + "' id='user_list_item" + userId + "'>" + userOnTab + "</div>";
        else // Пользователи оффлайн
            userContentOffline += "<div " + userTitle + " onclick='cbMessagesDisplay.selUser(" + userId + ")'" + (cbMessagesDisplay.curTab == userId ? 'style="background-color: #e4e4e4;"' : '') + " class='user_list_item " + statusBg + "' id='user_list_item" + userId + "'>" + userOnTab + "</div>";
    }

    for (chatId in chatesObj) {
        one_chat = chatesObj[chatId];
        var chatTitle = "";
        var newMsgs = "";

        var chatOnTab = one_chat.name;
        if (chatOnTab.length > 20) // Не более 20 символов, иначе обрезается и добавляется многоточие
        {
            chatOnTab = chatOnTab.substr(0, 20) + "…";
            chatTitle = " title='" + one_chat.name + "' "
        }

        if (one_chat.new_messages > 0) // В данном чате есть новые сообщения
        {
            newMsgs = "<span class='count_new_mes_on_list'>" + one_chat.new_messages + "</span>";
            if (cbMessagesDisplay.openedTabs["chat" + chatId]) {
                if (document.getElementById("count_mes_on_tabchat" + chatId)) // Объект (красный счётчик на вкладке) существует - изменяем число
                    document.getElementById("count_mes_on_tabchat" + chatId).innerHTML = one_chat.new_messages;
                else // Объект не существует - добавляем
                    document.getElementById("message_window_tabchat" + chatId).innerHTML += "<span class='count_mes_on_tab' id='count_mes_on_tabchat" + chatId + "'>" + one_chat.new_messages + "</span>";
            }
        }
        else if (document.getElementById("count_mes_on_tabchat" + chatId))
            $("#count_mes_on_tabchat" + chatId).remove();

        userContentChat += "<div " + chatTitle + " onclick=\"cbMessagesDisplay.selUser('chat" + chatId + "')\" class='user_list_item user_online_mark' id='user_list_itemchat" + chatId + "'>" + chatOnTab + newMsgs + "</div>";
    }

    document.getElementById("message_window_users_new").innerHTML = userContentNew;
    document.getElementById("message_window_users_online").innerHTML = userContentOnline;
    document.getElementById("message_window_users_away").innerHTML = userContentAway;
    document.getElementById("message_window_users_offline").innerHTML = userContentOffline;
    document.getElementById("message_window_chates").innerHTML = userContentChat;
    if (userContentNew != "") $("#message_window_users").scrollTop(0);
}
