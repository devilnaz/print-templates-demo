var catigories = $('#mainmenu');
var submenu_list = $('.header__submenu-list');
var filter_list = $('.header__filter-list');
var show_list;
var category_block = $('.header__categories');
var category_add = $('.header__category-item--add');
var submenu_add = $('.header__submenu-item--add');
var filter_add = $('.header__filter-item--add');
var filter_blocks = $('.header__filter');
var header = $('.header');
var second_bg = $('.header__second-bgr');
var vkUserId = 0
var userName = "Имя собеседника"
var userStatus = "Статус"
var needScroll = true
var prevVkUserId = 0
var timeouts = []
var socialTimeouts = []
var socialNetwork = ''
var prevSocialNetwork = ''
var myVkId = 0
var currentUserImg = ""
var file_hash = ""
var file_server = ""
var longPullServerInfo = {
    key: '',
    server: '',
    ts: ''
}
var selectedMessages = []
var message_id = ''
var isMessageSearch = 0
var msgOffset = 0
var messageContent = 1
var firstMessageQuery = 1
var userGroupsIds = []
var groupId = ''
var messangerType = ''
var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
}
var isGroup = 0
var vkWindowX = '';
var vkWindowY = '';
var canSend = true;
var globalActiveFieldId = "";
var isSubtableTarget = 0;
var prevLinkValue = '';
var globalActiveLineId = "";
var documentTitle = document.title;
var okTitleState = 'new';
var newOkTitle = "~Новое событие в Онлайн консультанте~";
var okIdInterval = 0;
var curLinkCategory = cur_cat;
var curPathOfSiteUrl = window.location.pathname;
var fields = '';

function el_not_gone(){
    let el = submenu_add.find('ul'),
        el_is_gone = $(el).offset().left + $(el).width();
    if ($(el).width() > el_is_gone) {
        $(el).css('right', 'auto');
        $(el).css('border-radius', '0 7px 7px 7px');
    }
}
submenu_add.find('a').on('mouseover', el_not_gone);
if (header.length > 0) {
    header.on('mousemove', function (e) {
        var x = -(e.pageX) / 60;
        var x2 = -(e.pageX) / 120;

        header.css('background-position', x + 'px 0');
        second_bg.css('background-position', x2 + 'px 0');
    });
}

if (catigories.length > 0) {
    catigories.flexMenu({
        'popupClass': 'header__categories-dropdownmenu',
        'cutoff': 0,
        'threshold': 0,
        'linkText': lang.More,
        'linkTitle': lang.Show_more
    });
}

if (submenu_list.length > 0) {
    submenu_list.flexMenu({
        'popupClass': 'header__submenu-dropdownmenu',
        'cutoff': 0,
        'threshold': 0,
        'linkText': lang.More,
        'linkTitle': lang.Show_more
    });
}

if (filter_list.length > 0 && showFiltersList < 1) {
    filter_list.flexMenu({
        'popupClass': 'header__filter-dropdownmenu',
        'cutoff': 0,
        'threshold': 0,
        'linkText': lang.More,
        'linkTitle': lang.Show_more
    });
} else {
    let fil_list = $('ul.header__filter-list, .header--translate');
    let add_new_filter = '<li class="header__filter-item--add header--translate header__filter--add-new-filter">' +
        '<a href="edit_filter.php?table=' + tableId + '&filter=-1" ' +
        'title="' + lang.Add_filter + '" target="_blank">+</a></li>';

    filter_list.css('height', '100%');
    filter_add.remove();
    fil_list.append(add_new_filter);
}

$(document).mousedown((e) => {
    if (typeof session_has_expired === 'undefined') {
      session_has_expired = null;
    }

    if(
        ((
            ($(e.target)[0].nodeName == 'SELECT' ||
            $(e.target)[0].nodeName == 'INPUT' ||
            $(e.target)[0].nodeName == 'TEXTAREA' ||
            $(e.target)[0].nodeName == 'BUTTON' ||
            $(e.target).parents('button').length > 0 ||
            $(e.target).parents('.chosen-container').length > 0)  &&
            !$(e.target).hasClass('sess_button')
        ) || window.location.href.indexOf('report.php') !== -1) &&
        session_has_expired
    ) {
        if($('.session_popup_block').length > 0) return;

        jconfirm(lang.Session_popup_text, function() {
            window.location.reload();
        }, null, null, 'session_expire');

    }
});
/**
 * Метод, скрывающий и раскрывающий overflow для заданных меню
 * @param lists array
 * @param overflow_from string
 * @param overflow_to string
 */
function list_overflow_toggle(lists, overflow_from, overflow_to) {
    lists.forEach(function (list) {
        if (list.length > 0) {
            if (list.css('overflow') === overflow_from) {
                list.css('overflow', overflow_to);
            }
        }
    });
}

/**
 * Метод расставляющий z-index`ы для фильтров разных уровней в шапке
 * @param zIndex int z-index с которого нужно начать
 */
function zIndex_for_filter(zIndex) {
    if (filter_blocks.length > 0) {
        filter_blocks.each(function () {
            $(this).css('z-index', zIndex);
            zIndex--;
        });
    }
}

/**
 * Метод, отвечающий за счетчик событий
 */
function tips_count() {
    var obj = $('#header_tips');

    if (obj.length > 0) {
        if (obj.attr('count-data') !== '' && obj.attr('count-data') !== ' ') {
            obj.attr('count-data', parse_to_int(obj.attr('count-data')));
        }
    }
}

/**
 * Метод, преобразующий строку в число
 * @param str {String}
 * @returns {number}
 */
function parse_to_int(str) {
    return Number(str.replace(/\D+/g, ""));
}

function resetFieldsData(elem) {
    prevLinkValue = elem.val();
    // Обнуляем данные в селекте, автокомплите
    elem.val('null');
    elem.attr('ac_hidden_val', '');
    elem.parent().find('.autocomplete').find('.autocomplete__input').val('');
}

function setGlobalFieldId(elem) {
    const autocompleteWrap = $(elem).parents('.user-data__autocomplete-wrap');
    const fieldId = $(elem).parents('.textpad__value').find('select.combobox').attr('field_id');

    if (autocompleteWrap.length != 0) {
        globalActiveFieldId = autocompleteWrap.find('select.combobox').attr('field_id');
    } else {
        globalActiveFieldId = fieldId;
    }

    // Клик не по подтаблице
    isSubtableTarget = 0;
}

$(document).ready(function () {
    list_overflow_toggle([catigories, submenu_list, filter_list], 'hidden', 'visible');
    zIndex_for_filter(497);
    tips_count();
    addIdentClassForLinkFieldsWithImage();

    moment.locale('ru');

    $('#attach_files_form').submit(function (e) {
        e.preventDefault()
        var formD = new FormData(document.forms.attach_files_form)

        $.ajax({
            url: 'modules/vk_chat/getFileHash.php',
            data: formD,
            method: 'POST',
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (data) {
                file_hash = data.file
            },
            error: function (er) {
                $('#attach_file_name').text('Некорректный файл')
            }
        });
    });

    $('#activate_form').submit(function () {
        localStorage.removeItem("longPullServerInfo")
        localStorage.removeItem("currentGroup")
        localStorage.removeItem("docServer")
        localStorage.removeItem("groupActive")
        localStorage.removeItem("groupActiveName")
    })

    $(document).on('click', function (e) {
        if (e.target.classList.contains("ui-menu-item-wrapper")) {
            if (e.target.textContent === lang.add_new_record) {
                if (typeof isTableTarget != "undefined" && isTableTarget == 1) { // в таблице
                    const selectBox = $(`#sel_records .fields__cell select[field_id=${globalActiveFieldId}][line_id=${globalActiveLineId}]`);
                    $(`#sel_records #tr${globalActiveLineId} .fields__cell[field_id=${globalActiveFieldId}] div[id^=add_link_block]`).css({
                        'top': addLinkFieldsBlockPoints.top,
                        'left': addLinkFieldsBlockPoints.left
                    })
                    add_link_block_show(`add_link_block${globalActiveFieldId}_${globalActiveLineId}`, globalActiveFieldId);
                    resetFieldsData(selectBox);
                } else if (typeof isCalendarTarget != "undefined" && isCalendarTarget == 1) {
                    const selectBox = $(`.fast_add_link_field[field_id=${globalActiveFieldId}]`);
                    $(`#record_card_add${globalCalendarEventId} .add_link_block`).css({
                        'top': addLinkFieldsBlockPoints.top,
                        'left': addLinkFieldsBlockPoints.left
                    })
                    add_link_block_show_calendar(globalActiveFieldId, globalCalendarEventId);
                    resetFieldsData(selectBox);
                } else {
                    if (isSubtableTarget) { //клик по подтаблице
                        const subtableSelectBox = $(`.subtable select.combobox[field_id=${globalActiveFieldId}][line_id=${globalActiveLineId}]`);
                        $('.subtable').css('z-index', 'unset');
                        $('.subtable div[id^=add_link_block]').css({
                            'top': addLinkFieldsBlockPoints.top + 25, // для отображения формы добавления ПОД полем
                            'left': addLinkFieldsBlockPoints.left
                        })
                        add_link_block_show(`add_link_block${globalActiveFieldId}_${globalActiveLineId}`, globalActiveFieldId);
                        resetFieldsData(subtableSelectBox);
                    } else {
                        const selectBox = $(`select.combobox[ac_id=view_value${globalActiveFieldId}]`);
                        const selectBoxEdit = $(`select.combobox[ac_id=edit_value${globalActiveFieldId}]`);
                        if ($('#view_block').css('display') == 'none') {
                            add_link_block_show(`add_link_block${globalActiveFieldId}`, globalActiveFieldId);
                            resetFieldsData(selectBoxEdit);
                        } else {
                            add_link_block_show(`add_link_edit_block${globalActiveFieldId}`, globalActiveFieldId);
                            resetFieldsData(selectBox);
                        }
                    }
                }
            }
        }

        if (e.target.classList.contains("header__user-item--messages")) {
            // nothing to do
        } else if ((!e.target.classList.contains("messages__tooltip")) && !$('.messages__tooltip').hasClass('hidden')) {
            $('.header__user-item--messages').find('div.messages__tooltip').toggleClass('hidden');
        }

        // Запрещаем всплытие события наведения мыши, чтобы не сработало цветовое выделение строки
        $('div[id^=add_link_block]').mouseover(function (e) {
            e.stopPropagation();
        });
    });

    // При клике на автокомплит записываем глобально id поля
    $('.autocomplete__input').on('click', function () {
        setGlobalFieldId(this);
    });

    // При клике на стрелку в автокомплите записываем глобально id поля
    $('a.autocomplete__btn').on('click', function () {
        setGlobalFieldId(this)
    });

    if (category_block.length > 0) {
        category_block.addClass('header--translate');
    }

    if (category_add.length > 0) {
        category_add.addClass('header--translate');
    }

    $('.message_window_vk').on('contextmenu', function (e) {
        var offset = $(this).offset();
        vkWindowX = (e.pageX - offset.left);
        vkWindowY = (e.pageY - offset.top);
    })

    setTimeout(function () {
        if (submenu_list.length > 0) {
            submenu_list.addClass('header--translate');
        }
        if (submenu_add.length > 0) {
            submenu_add.addClass('header--translate');
        }
    }, 200);

    setTimeout(function () {
        if (filter_list.length > 0) {
            filter_list.addClass('header--translate');
        }

        if (filter_add.length > 0) {
            filter_add.addClass('header--translate');
        }
    }, 400);

    $('.jq_maskedTime').mask('00:00');
    $('.jq_masked_fourNumber').mask('0000');

    $('input[name=time_for_status]').change(function () {
        let workDiv = $('#work_graffic');
        if ($(this).prop('checked'))
            workDiv.css('display', 'table-row');
        else
            workDiv.hide();
    });

    $('input[name=autotext_on]').change(function () {
        let firstAutoDiv = $('#autotext_online');
        let secondAutoDiv = $('#autotext_offline');
        if ($(this).prop('checked')) {
            firstAutoDiv.css('display', 'table-row');
            secondAutoDiv.css('display', 'table-row');
        } else {
            firstAutoDiv.hide();
            secondAutoDiv.hide();
        }
    });

    $('#message_vk-attachButton').change(function () {
        $this = $(this)
        //получаем хэш файла
        $('#attach_files_form').submit()

        //показываем инфу о прикрепленном файле
        $('#attach_file_name').text($this.val())
        $('#attach_file_info').css('display', 'flex')
    })

    $('#delete_attachment_file').click(function () {
        $('#message_vk-attachButton').val('')
        $('#attach_file_name').text('')
        $('#attach_file_info').css('display', 'none')
        file_hash = ''
    })

    // Переключение на чат кб
    $('.message_window_menu_chat').on('click', function () {
        $('#message_window_content').css('display', 'block')
        $('.message_window_vk').css('display', 'none')
        $('#message_window_managerOk').css('display', 'none')
        $('#message_window_drafting').show()

        socialNetwork = 'cb_chat'
        vkUserId = 0
        needScroll = true

        socialTimeouts.forEach(function (item, i) {
            clearTimeout(item)
        })
        socialTimeouts = []
    })

    $('#message_window_close').click(function () {
        socialNetwork = '0'

        //Останавливаем функции получения пользователей
        socialTimeouts.forEach(function (item, i) {
            clearTimeout(item)
        })
        socialTimeouts = []

        //Останавливаем функции получения сообщений
        timeouts.forEach(function (item, i) {
            clearTimeout(item)
        })
        timeouts = []
    })

    //При прогрузке страницы вставляем непрочитанные в ВК
    let unreadVkMessLoad = localStorage.getItem('unread_vk_count');
    if (unreadVkMessLoad == 0)
        $('#message_window_menu_items--counter').text('')
    else
        $('#message_window_menu_items--counter').text(unreadVkMessLoad)
    /*
        //Переходим в модуль чата ВК для юзера
        $('#message_window_menu_vk').click(function () {
            prevSocialNetwork = socialNetwork
            socialNetwork = 'vk'
            needScroll = true

            if ( prevSocialNetwork == socialNetwork ) {
                return false
            }

            //Меняем настройки под вк
            messangerType = 'vk'
            $('#message_window_vk-title--name').text('В контакте')
            groupId = ''
            vkUserId = ''
            $('.message_vk-history_field').empty()

            //Смена представления
            $('#message_window_content').css('display','none')
            $('.message_window_vk').css('display','grid')
            $('#attach_files_form').show()

            //Скрытие и открытие элементов
            $('.message_vk-sendMessage').hide()
            $('#message_search-goSearch').hide()
            $('#message_search-button--cancel').hide()
            $('#message_search-input').hide()
            $('#message_search-button').hide()
            $('#friends_search_vk').hide()

            $('.chatUser-username').text('Имя собеседника')
            $('.chatUser-userstatus').text('Статус')

            //получаем данные о нашем аккаунте
            $.ajax({
                url: 'modules/vk_chat/myAccount.php',
                success: function (resp) {
                    var data = JSON.parse(resp)
                    if ( data.error ) {
                        jalert('Вы не прошли авторизацию! Перейдите в <a href="edit_modules.php?module=social_messages">"Модули"->"Модуль интеграции с социальной сетью vk.com"</a> и следуйте инструкции авторизации ')
                        $('#message_window').hide()
                    } else {
                        myVkId = data.response[0].id

                        //Получаем сервер для загрузки документов
                        $.ajax({
                            url: `modules/vk_chat/getDocServer.php?user_id=${myVkId}`,
                            success: function (resp) {
                                var data = JSON.parse(resp)
                                file_server = data.response.upload_url
                                $('#attach_docs_form').attr('action', file_server)
                                $('#message_server_name').val(file_server)
                            }
                        })

                        //получаем данные от longPullServer
                        isGroup = 0
                        getLongPull()

                        //Получаем пользователей
                        getVkUsersAjax()

                    }
                }
            })
        })
    */
    //Переходим в модуль чата ВК для сообщества
    $('#message_window_menu_vk_group').click(function () {
        prevSocialNetwork = socialNetwork
        socialNetwork = 'vk_group'
        needScroll = true
        vkUserId = 0

        if (prevSocialNetwork == socialNetwork) {
            return false
        }

        //Меняем настройки под вк сообщества
        messangerType = 'vk_group'
        $('.message_vk-history_field').empty()
        $('.message_vk-users--list').empty()
        myVkId = ''
        //Смена представления
        $('#message_window_content').css('display', 'none')
        $('#message_window_managerOk').css('display', 'none')
        $('.message_window_vk').css('display', 'grid')

        //Скрытие и открытие элементов
        $('.message_vk-sendMessage').hide()
        $('#message_search-goSearch').hide()
        $('#message_search-button--cancel').hide()
        $('#message_search-input').hide()
        $('#message_search-button').hide()
        $('#friends_search_vk').hide()

        $('.chatUser-username').text('Имя собеседника')
        $('.chatUser-userstatus').text('Статус')

        //получаем данные об аккаунте
        $.ajax({
            url: `modules/vk_chat/myAccount.php`,
            success: function (resp) {
                var data = JSON.parse(resp)
                if (data.error) {
                    jalert('Вы не прошли авторизацию! Перейдите в <a href="edit_modules.php?module=social_messages">"Модули"->"Интеграция с vk.com"</a> и следуйте инструкции авторизации ')
                    $('#message_window').hide()
                } else {
                    myVkId = data.response[0].id
                    //получаем данные о группе
                    if (typeof CBLocalStorage != 'undefined') {
                        if (typeof CBLocalStorage.getData("['currentGroup']") == "undefined") {
                            $.ajax({
                                url: `modules/vk_chat/getCurrentGroupId.php?user_id=${myVkId}`,
                                success: function (resp) {
                                    if (resp == 'null') {
                                        jalert('Вы не прошли авторизацию под сообществом! Перейдите в <a href="edit_modules.php?module=social_messages">"Модули"->"Интеграция с vk.com"</a> и следуйте инструкции авторизации ')
                                        $('#message_window').hide()
                                        return false
                                    } else {
                                        var data = JSON.parse(resp)
                                        groupId = data.group_id
                                        CBLocalStorage.putData("['currentGroup']", groupId)
                                        myVkId = ''
                                        if (!localStorage.getItem('groupActive')) {
                                            localStorage.setItem('groupActive', groupId);
                                        }
                                        let groupName = localStorage.getItem('groupActiveName')
                                        if (groupName != null)
                                            $('#message_window_vk-title--name').text(`vk.com - ${groupName}`)
                                        else
                                            $('#message_window_vk-title--name').text(`Подключите публичную страницу в настройках модуля ВК`)

                                    }
                                }
                            });
                        } else {
                            groupId = CBLocalStorage.getData("['currentGroup']")
                        }
                    }

                    if (typeof CBLocalStorage.getData("['docServer']") == "undefined") {
                        //Получаем сервер для загрузки документов
                        $.ajax({
                            url: `modules/vk_chat/getDocServer.php?user_id=${myVkId}`,
                            success: function (resp) {
                                var data = JSON.parse(resp)
                                file_server = data.response.upload_url
                                $('#attach_docs_form').attr('action', file_server)
                                $('#message_server_name').val(file_server)

                                CBLocalStorage.putData("['docServer']", file_server)
                            }
                        })
                    } else {
                        file_server = CBLocalStorage.getData("['docServer']")
                    }

                    //получаем данные от longPullServer
                    isGroup = 1
                    getLongPull()

                    //Получение и вывод пользователей
                    getVkUsersAjax()

                }
            }
        })
    })

    // Убираем событие beforeunload
    $(window).off('beforeunload');

    if (typeof vkIsActive != 'undefined') { // Если модуль активный, тогда запросы доступны ( index_top.tpl )
        getLongPull()
        longPullServerUpdate(longPullServerInfo, csrf)
    }

    $('.user-data__row-wrap').mouseup(function (e) {
        e.stopPropagation();
    });

    initMaskFromDateTimepicker();

    $('body').delegate('.hasDatepicker', 'click', function () {
        $(this).next('.ui-datepicker-trigger').trigger('click');
    });

    $('.ui-sortable .ui-sortable-handle input[type=text]').change(function () {
        updateDragNDropValues($(this).parents('form'), $(this));
    });
});

function initMaskFromDateTimepicker() {
  // С вводом глобального config['formats'] данное условие не актуально
  // if (lang.name === 'English' || lang.name === 'American') {
  if (lang.date_js_format == "mm/dd/yy" || lang.date_js_format == "dd/mm/yy") {
    $('.onlyDatePicker, .fields__fast-edit--date, .fix-search__date').mask('99/99/9999');
    $('.datetimepicker, .fields__fast-edit--datetime, .fix-search__datetime').mask('99/99/9999 99:99');
  } else {
    $('.onlyDatePicker, .fields__fast-edit--date, .fix-search__date').mask('99.99.9999');
    $('.datetimepicker, .fields__fast-edit--datetime, .fix-search__datetime').mask('99.99.9999 99:99');
  }
}

// Отправление запроса на лонг пул
messangerType = 'vk_group'
function getLongPull() {
    if (typeof CBLocalStorage != 'undefined') {
        if (typeof CBLocalStorage.getData("['longPullServerInfo']") == "undefined") {
            $.ajax({
                url: `modules/vk_chat/getLongPullServer.php?messanger=${messangerType}`,
                async: false,
                success: function (resp) {
                    var data = JSON.parse(resp)
                    if (!data.error) {
                        longPullServerInfo.key = data.response.key
                        longPullServerInfo.server = data.response.server
                        longPullServerInfo.ts = data.response.ts

                        CBLocalStorage.putData("['longPullServerInfo']", longPullServerInfo)
                    }
                }
            })
        }
    }
}


//Отправка сообщений на Enter, но на Enter+Shift просто перенос строки
$('#message_vk-messageText').keypress(function (e) {
    if (e.which == 13 && !e.shiftKey) {
        $('#message_vk-sendButton').click()
        e.preventDefault()
        return false
    }
});

$('#message_vk-sendButton').click(function () {
    var messageText = $('#message_vk-messageText').val()
    var fileInputVal = $('#message_vk-attachButton').val()
    var incorectFile = $('#attach_file_name').text()
    if (messageText.trim() == '' && fileInputVal == '') {
        $('#message_vk-messageText').val('')
        return false
    }

    if (incorectFile == 'Некорректный файл') {
        alert('Прикреплен некорректный файл')
        return false
    }

    //Защита от SQL Injections
    if (/select /i.test(messageText) || /from /i.test(messageText) || /update /i.test(messageText) || /insert /i.test(messageText) || /delete /i.test(messageText) || /create /i.test(messageText)
        || /grant /i.test(messageText) || /execute /i.test(messageText)) {
        alert('Некорректное сообщение')
        return false
    }

    if (fileInputVal != "" && file_hash != "" && incorectFile != 'Некорректный файл') {
        var data = `user_id=${vkUserId}&message_text=${messageText}&attachments=${file_hash}&csrf=${csrf}&messanger=${messangerType}&group_id=${groupId}`
    } else {
        var data = `user_id=${vkUserId}&message_text=${messageText}&csrf=${csrf}&messanger=${messangerType}&group_id=${groupId}`
    }

    // Если можно отправлять сообщение
    if (canSend) {
        canSend = false;
        //запрос на отправку сообщения
        $.ajax({
            url: 'modules/vk_chat/sendMessage.php',
            type: 'post',
            data: data,
            success: function (resp) {
                // Проверяем отправилось ли сообщение
                if (/414 Request-URI/.test(resp)) { // Ошибка на очень длинный запрос(сообщение)
                    jalert('Ошибка. Вы пытаетесь отправить очень длинное сообщение');
                    needScroll = true;
                    canSend = true;
                } else {
                    let data = JSON.parse(resp);
                    if (typeof data.error != "undefined" && data.error.error_code == 901) {
                        $('.message_vk-history_field').empty()
                        let errorDiv = `<p>Этот пользователь не разрешил вам отправку сообщений, вы не можете написать ему первым</p>`;
                        $('.message_vk-history_field').append(errorDiv);

                        $('#message_vk-messageText').val('')
                        $('#message_vk-attachButton').val('')
                        $('#attach_file_info').hide()
                        needScroll = true
                        msgOffset = 0
                        firstMessageQuery = 1
                        canSend = true;
                        return false;
                    }

                    $('#message_vk-messageText').val('')
                    $('#message_vk-attachButton').val('')
                    $('.message_vk-history_field').empty()
                    $('#attach_file_info').hide()
                    needScroll = true
                    msgOffset = 0
                    firstMessageQuery = 1
                    canSend = true;
                }
            },
            error: function (er) {
                needScroll = true
                msgOffset = 0
                return false
            }
        })
    }

});

function getVkUsersAjax(messageFromId) {
    $.ajax({
        url: `modules/vk_chat/getChats.php?messanger=${messangerType}&group_id=${groupId}`,
        beforeSend: function () {
            createVkPreloader($('.message_vk-history_field'));
        },
        success: function (resp) {
            var data = JSON.parse(resp)
            var usersList = $('.message_vk-users--list')
            if (!data.error) {
                destroyVkPreloader($('.message_vk-history_field'));
                usersList.empty();

                data['response']['items'].forEach(function (item, i) {
                    var id = item.conversation.peer.id
                    var styleUnread = ''
                    if (item.conversation.unread_count)
                        styleUnread = "border: 3px solid orange"

                    if (item.conversation.peer.type == 'chat') {
                        var title = item.conversation.chat_settings.title
                        if (item.conversation.chat_settings.photo) {
                            var photo = item.conversation.chat_settings.photo.photo_50
                        } else {
                            var photo = "https://vk.com/images/icons/im_multichat_50.png"
                        }
                        var optionElem = `<option id="message_vk-users--list_option${id}" data-id="${id}" data-name="${title}">${title}</option>`
                        var avatar = `<img src='${photo}' alt='${title}' data-id='${id}' title='${title}' style="${styleUnread}">`
                        var nameDiv = `<div class="message_vk-users__name" data-id="${id}" data-name="${name}">${name}</div>`
                        var userDiv = `<div id="userDiv${id}" data-id="${id}" data-name="${name}" style="position: relative;"></div>`
                        usersList.append(userDiv)
                        var userDivElem = $(`#userDiv${id}`)
                        userDivElem.append(avatar)
                        userDivElem.append(nameDiv)
                        userDivElem.append(optionElem)
                    } else if (item.conversation.peer.type == 'user') {
                        data.response.profiles.forEach(function (user, i) {
                            if (user.id == id) {
                                var name = `${user.first_name} ${user.last_name}`
                                var online = user.online
                                var photo = user.photo_50
                                var optionElem = `<option id="message_vk-users--list_option${id}" data-id="${id}" data-name="${name}">${name}</option>`
                                var avatar = `<img id="message_vk-users--list_img${id}" src='${photo}' alt='${name}' data-id='${id}' title='${name}' online='${online}' style="${styleUnread}">`
                                var nameDiv = `<div class="message_vk-users__name" data-id="${id}" data-name="${name}">${name}</div>`
                                var userDiv = `<div id="userDiv${id}" data-id="${id}" data-name="${name}" style="position: relative;"></div>`
                                usersList.append(userDiv)
                                var userDivElem = $(`#userDiv${id}`)
                                userDivElem.append(avatar)
                                userDivElem.append(nameDiv)
                                userDivElem.append(optionElem)

                                //значок онлайн у аватарки
                                if (online) {
                                    //объект для css
                                    var styleObj = {
                                        'content': '',
                                        'bottom': '18%',
                                        'right': '-3px',
                                        'border': '2px solid #fff',
                                        'height': '8px',
                                        'width': '8px',
                                        'position': 'absolute',
                                        'background-color': '#8ac176',
                                        'border-radius': '50%'
                                    }
                                    var greenOnline = '<div class="greenOnline"></div>'
                                    userDivElem.append(greenOnline)
                                    $('.greenOnline').css(styleObj)
                                }
                            }
                        })
                    } else if (item.conversation.peer.type == 'group') {
                        //Заполняем группы
                        data['response']['groups'].forEach(function (group, i) {
                            if (group.id == item.conversation.peer.local_id) {
                                var local_id = group.id
                                var name = group.name
                                if (group.photo_50) {
                                    var photo = group.photo_50
                                } else {
                                    var photo = "https://vk.com/images/icons/im_multichat_50.png"
                                }
                                var optionElem = `<option id="message_vk-users--list_option${local_id}" data-id="${local_id}" data-name="${name}">${name}</option>`
                                var avatar = `<img src='${photo}' alt='${name}' data-id='-${local_id}' title='${name}'>`
                                var nameDiv = `<div class="message_vk-users__name" data-id="${id}" data-name="${name}">${name}</div>`
                                var userDiv = `<div id="userDiv${local_id}" data-id="${local_id}" data-name="${name}" style="position: relative;"></div>`
                                usersList.append(userDiv)
                                var userDivElem = $(`#userDiv${local_id}`)
                                userDivElem.append(avatar)
                                userDivElem.append(nameDiv)
                                userDivElem.append(optionElem)
                            }
                        })
                    } else {
                        //doing nothing
                    }
                })

                if (messageFromId != vkUserId) {
                    $(`.message_vk-users--list img[data-id=${messageFromId}]`).css('border', '3px solid orange')
                }

                if (data['response']['unread_count']) {
                    let unreadCount = data['response']['unread_count'];
                    localStorage.setItem('unread_vk_count', unreadCount)
                    $('#message_window_menu_items--counter').text(unreadCount)
                } else {
                    localStorage.setItem('unread_vk_count', '')
                }

                eventOptionOnClick($('.message_vk-users--list img'))
            } else {
                console.log('Не удалось получить диалоги аккаунта ВК')
            }
        }
    })
}

function getVkMessagesAjax() {
    var messageField = $('.message_vk-history_field')

    if (messageContent == 1) {
        $.ajax({
            url: `modules/vk_chat/getMessages.php?user_id=${vkUserId}&offset=${msgOffset}&messanger=${messangerType}&group_id=${groupId}`,
            beforeSend: function () {
                createVkPreloader(messageField);
            },
            success: function (resp) {
                var data = JSON.parse(resp)
                if (!data.error) {
                    if (data.response.items.length != 0) {
                        $('.vk_message_line_me').off('mouseover')

                        $('.vk_message_line_me').off('mouseout')

                        $('.edit_message_img').off('click')

                        getMessageContent(data, messageField)
                        destroyVkPreloader(messageField);
                        messageContent = 1
                    } else {
                        messageContent = 0
                        destroyVkPreloader(messageField);
                    }

                    //скролим вниз истории при первом клике на пользователя
                    if (needScroll) {
                        messageField.scrollTop(1000000)
                        needScroll = false
                    }

                    firstMessageQuery = 0
                }
            }
        })
    }

}

//Получаем сообщения
function eventOptionOnClick(elem) {
    elem.on('click', function () {
        $this = $(this)
        $this.css('border', '3px solid white')
        prevVkUserId = vkUserId
        var messageField = $('.message_vk-history_field')
        vkUserId = $this.attr('data-id')
        userName = $this.attr('title')
        currentUserImg = $this.attr('src')
        if ($this.attr('online') == 1) {
            userStatus = "В сети"
        } else {
            userStatus = "Не в сети"
        }

        //Скрытие и открытие элементов
        $('.message_vk-sendMessage').show()
        $('#message_search-goSearch').hide()
        $('#message_search-button--cancel').hide()
        $('#message_search-input').hide()
        $('#message_search-button').show()
        $('#friends_search_vk').hide()

        //В зависимости от настройки имя собеседника просто текст или ссылка
        if (vkNameLinkUser === "0" || typeof vkNameLinkUser == "undefined") {
            $('.chatUser-username').text(userName);
        } else {
            $('.chatUser-username').html(`<a href="https://vk.com/id${vkUserId}" target="_blank" class="username__link">${userName}</a>`);
        }

        $('.chatUser-userstatus').text(userStatus);

        needScroll = true
        if (vkUserId == prevVkUserId) {
            return false
        } else {
            //сбрасываем выбранные сообщения
            lastSelectedMessage = ''
            selectedMessages = []
            messageContent = 1
            msgOffset = 0
            messageField.empty()
            firstMessageQuery = 1
            //Получение и вывод сообщений по диалогу
            getVkMessagesAjax()
        }
    })

    // Переход в таблицу Подписчики
    elem.on('contextmenu', function (e) {
        let $this = $(this)
        let dataId = $this.attr('data-id')

        // На Shift простое меню браузера
        if (e.shiftKey) {
            // Стандартный функционал правой кнопки мыши в браузере
        } else {
            e.preventDefault()
            setTimeout(function () {
                // Создаем всплывающее меню, отправляем запрос на формирование ссылки в таблице
                let menu = $('<div id="vkContextMenu"></div>')
                    .css({ top: vkWindowY, left: vkWindowX })
                    .appendTo('.message_window_vk')
                    .on('click', function (e) {
                        e.stopPropagation();
                    });

                $.ajax({
                    url: `modules/vk_chat/getUserRowNumber.php?user_id=${dataId}`,
                    success: function (resp) {
                        let data = JSON.parse(resp)
                        // Если запись есть, то формируем ссылку
                        if (data.id != null) {
                            let link = $(`<a class="vkContextMenu__link" target="_blank" href="view_line2.php?table=${data.table_id}&line=${data.id}">Открыть в таблице</a>`)
                                .appendTo('#vkContextMenu')
                        } else {
                            let link = $(`<p>Этого пользователя нет в таблице Подписчики</p>`)
                                .appendTo('#vkContextMenu')
                        }
                    }
                })
            }, 1)
        }
    })
}

//делаем запрос к longPullServer
function longPullServerUpdate(info, csrf) {
    $.ajax({
        url: `modules/vk_chat/longPullUpdate.php`,
        type: 'post',
        data: `key=${info.key}&server=${info.server}&ts=${info.ts}&csrf=${csrf}&group=${isGroup}`,
        success: function (resp) {
            if (resp == '') {
                return
            }
            if (resp != 'Unknown user') {
                var data = JSON.parse(resp);

                if (data.failed) {
                    longPullServerInfo.ts = data['ts'];
                    longPullServerUpdate(longPullServerInfo, csrf);
                } else if (data['updates'].length != 0) {
                    data['updates'].forEach(function (event, i) {
                        //если произошло добавление нового сообщения
                        if (event[0] == 4) {
                            var messageFromId = event[3]
                            getVkUsersAjax(messageFromId)

                            if (messageFromId == vkUserId || messageFromId == myVkId) {
                                var messageField = $('.message_vk-history_field')
                                messageField.empty()
                                msgOffset = 0
                                needScroll = true
                                firstMessageQuery = 1
                                getVkMessagesAjax()
                            }
                            //Удаление сообщения
                        } else if (event[0] == 2) {
                            $(`.vk_message_line_me[msg-id=${event[1]}]`).remove()
                            $(`.vk_message_line[msg-id=${event[1]}]`).remove()
                            ///Редактирование сообщения
                        } else if (event[0] == 5) {
                            event[5] = link_it(event[5]);
                            $(`#vk_message_line-text_${event[1]}`).find('div.inner_message_p').html(event[5])
                            if (event[6].attach1_type) {
                                if (event[6].attach1_type != 'link')
                                    $(`#vk_message_line-text_${event[1]}`).find('div.inner_message_p').append(`<a class="vk_doc" href="https://vk.com/${event[6].attach1_type}${event[6].attach1}" target="_blank">Файл</a>`)
                            }
                        } else if (event[0] == 80) { // Прочтение сообщений
                            localStorage.setItem('unread_vk_count', event[1])
                            if (event[1] == 0)
                                $('#message_window_menu_items--counter').text('')
                            else
                                $('#message_window_menu_items--counter').text(event[1])
                        }
                    })

                    longPullServerInfo.ts = data['ts'];
                    longPullServerUpdate(longPullServerInfo, csrf);
                } else {
                    longPullServerInfo.ts = data['ts'];
                    longPullServerUpdate(longPullServerInfo, csrf);
                }
            }
        }
    })
}

//удаление сообщения
$('#message_vk-deleteButton').click(function () {
    $.ajax({
        url: 'modules/vk_chat/deleteMessages.php',
        type: 'post',
        data: `messages_id=${selectedMessages}&csrf=${csrf}&messanger=${messangerType}&group_id=${groupId}`,
        success: function (resp) {
            selectedMessages = []
            msgOffset = 0
            needScroll = true
        }
    })
})

//поиск по сообщениям (открытие формы)
$('#message_search-button').click(function () {
    $this = $(this)
    $this.hide()
    var searchInput = $('#message_search-input')
    var cancelButton = $('#message_search-button--cancel')
    var goButton = $('#message_search-goSearch')
    searchInput.show()
    cancelButton.show()
    goButton.show()
    isMessageSearch = 0
})

//отмена поиска
$('#message_search-button--cancel').click(function () {
    $this = $(this)
    $('.message_vk-history_field').scrollTop(100000)
    $this.hide()
    var searchInput = $('#message_search-input')
    var goButton = $('#message_search-goSearch')
    var searchButton = $('#message_search-button')
    searchButton.show()
    goButton.hide()
    searchInput.val('')
    searchInput.hide()

    if (isMessageSearch == 1) {
        msgOffset = 0
        needScroll = true
        $('.message_vk-history_field').empty()
        getVkMessagesAjax()
    }

    isMessageSearch = 0
})

//приступить к поиску по сообщениям
$('#message_search-goSearch').click(function () {
    $this = $(this)
    goMessagesSeacrh()
})

// тоже самое на Enter
$('#message_search-input').keyup(function (e) {
    if (e.which == 13)
        goMessagesSeacrh()
});

function goMessagesSeacrh() {
    var q = $('#message_search-input').val()

    if (q != '') {
        $.ajax({
            url: 'modules/vk_chat/messagesSearch.php',
            type: 'post',
            data: `q=${q}&user_id=${vkUserId}&csrf=${csrf}&group_id=${groupId}&messanger=${messangerType}`,
            beforeSend: function () {
                createVkPreloader($('.message_vk-history_field'));
            },
            success: function (resp) {
                var data = JSON.parse(resp)
                var messageField = $('.message_vk-history_field')
                messageField.empty()

                if (data.error) {
                    isMessageSearch = 0
                    return false
                } else if (data.response.count == 0) {
                    isMessageSearch = 1
                    messageField.append('<p>По такому запросу сообщений не найдено</p>')
                } else {
                    isMessageSearch = 1
                    getMessageContent(data, messageField)
                }
            }
        })
    }
}

function link_it(text) {
    text = text.replace(/(^|[\n ])([\w]*?)((ht|f)tp(s)?:\/\/[\w]+[^ \,\"\n\r\t<]*)/gm, "$1$2<a href=\"$3\" >$3</a>");
    text = text.replace(/(^|[\n ])([\w]*?)((www|ftp)\.[^ \,\"\t\n\r<]*)/gm, "$1$2<a href=\"http://$3\" >$3</a>");
    text = text.replace(/(^|[\n ])([a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/gm, "$1<a href=\"mailto:$2@$3\">$2@$3</a>");
    return (text);
}

function getMessageContent(data, messageField) {
    data.response.items.forEach(function (message, i) {
        //защищаемся от html и скрипт тегов
        if (/</.test(message.text) || /script/.test(message.text)) {
            message.text = message.text.replace(/[&<>"'`=\/]/g, function (s) {
                return entityMap[s]
            })
        }

        //если в тексте есть ссылка, преобразуем в ссылку
        message.text = link_it(message.text);

        if (message.attachments.length != 0) {
            message.attachments.forEach(function (attach, i) {
                switch (attach.type) {
                    case "sticker":
                        var attachment = `<img class="vk_sticker" src='${attach.sticker.images[0].url}' alt='Стикер'>`
                        break
                    case "audio":
                        var attachment = `<a class="vk_audio" href='${attach.audio.url}' target="_blank">${attach.audio.artist} - ${attach.audio.title}</a>`
                        break
                    case "wall":
                        var attachment = "Пост со стены"
                        break
                    case "link":
                        if (message.text == '')
                            var attachment = `<a class="vk_link" href='${attach.link.url}' target="_blank">${attach.link.title}</a>`;
                        else
                            var attachment = '';
                        break
                    case "doc":
                        var attachment = `<a class="vk_doc" href='${attach.doc.url}' target="_blank">${attach.doc.title}</a>`
                        break
                    case "photo":
                        var attachment = `<a class="vk_photo" href='${attach.photo.sizes[attach.photo.sizes.length - 1].url}' target="_blank"><img src="${attach.photo.sizes[0].url}" alt="Изображение"></a>`
                        break
                    case "market":
                        var attachment = `<a class="vk_market" href='${attach.market.thumb_photo}' target="_blank"><img class="vk_market-photo" src="${attach.market.thumb_photo}" alt="Изображение" style="height: 150px;"><div class="vk_market-title">${attach.market.title}</div><div class="vk_market-price">${attach.market.price.text}</div></a>`
                        break
                    case "audio_message":
                        var attachment = `<a class="vk_audio_message" href='${attach.audio_message.link_mp3}' target="_blank">Голосовое сообщение</a>`
                        break
                    default:
                        var attachment = 'Неизвестный элемент'
                        break
                }
                message.text += (' ' + attachment)
            })
        }

        if (message.fwd_messages.length != 0) {
            var fwd_msg = 'Пересланное сообщение'
            message.text += fwd_msg
        }

        // Формируем дату для сообщения через momentjs
        var dateString = moment.unix(message.date).format("lll");

        if (message.from_id == myVkId || message.from_id == `-${groupId}`) {
            var oneMessage = `<div class="vk_message_line_me" msg-id="${message.id}"><img class="edit_message_img" id="edit_message_img_${message.id}" msg-id="${message.id}" src="images/vk_edit.png" alt="Редактировать" style="display: none;"><div class="vk_message_line-text" id="vk_message_line-text_${message.id}" msg-id="${message.id}"><div class="inner_message_p" style="margin: 0; font-size: 15px;">${message.text}</div><div class="message__date">${dateString}</div></div></div>`
        } else {
            var oneMessage = `<div class="vk_message_line" msg-id="${message.id}"><div class="vk_message_line-avatar"><img src="${currentUserImg}"></div><div class="vk_message_line-text" msg-id="${message.id}"><div class="inner_message_p" style="margin: 0; font-size: 15px; color: inherit;">${message.text}</div><div class="message__date">${dateString}</div></div></div>`
        }
        messageField.prepend(oneMessage)
    })

    //обработчик на сообщения
    $(".vk_message_line-text").on('click', function () {
        $this = $(this)

        var msgId = $this.attr('msg-id')

        //для удаления сообщений
        if (!selectedMessages.includes(msgId)) {
            selectedMessages.push(msgId)
            $this.css('background-color', '#0285fb')
        } else {
            //определяем бг сообщения(свое или собеседника)
            if ($this.parent('.vk_message_line').length) {
                var bgPrevColor = '#f0f0f0'
            } else {
                var bgPrevColor = '#A5DBFD'
            }

            var indexMsg = selectedMessages.indexOf(msgId)
            selectedMessages.splice(indexMsg, 1)
            $this.css('background-color', bgPrevColor)
        }
    })

    $('.inner_message_p').on('click', function () {
        $this = $(this)
        var isLink = $this.find('a').length
        if (isLink == 0)
            return false
    })

    myMessageEditEventListener()
}

$('#writeMessageButton').click(function () {
    if (messangerType == 'vk')
        getFriends()
    else if (messangerType == 'vk_group')
        getGroupMembers()
})

$('#friends_search_field-input').keyup(function () {
    var q = $(this).val()

    if (q == '' && messangerType == 'vk') {
        getFriends()
        return false
    } else if (q == '' && messangerType == 'vk_group') {
        getGroupMembers()
        return false
    }

    if (messangerType == 'vk') {
        $.ajax({
            url: 'modules/vk_chat/friendsSearch.php',
            type: 'post',
            data: `user_id=${myVkId}&q=${q}&csrf=${csrf}`,
            success: function (resp) {
                $('.friends_search_items').empty()
                var data = JSON.parse(resp)
                if (data.error)
                    return false
                fillFriendsField(data)
            }
        })
    } else if (messangerType == 'vk_group') {
        $.ajax({
            url: 'modules/vk_chat/groupMembersSearch.php',
            type: 'post',
            data: `group_id=${groupId}&q=${q}&csrf=${csrf}`,
            success: function (resp) {
                $('.friends_search_items').empty()
                var data = JSON.parse(resp)
                if (data.error)
                    return false
                fillFriendsField(data)
            }
        })
    }
})

$('#friends_search_field--cancel').click(function () {
    $('#friends_search_field-input').val('')
    if (messangerType == 'vk')
        getFriends()
    else if (messangerType == 'vk_group')
        getGroupMembers()
})

function myMessageEditEventListener() {
    $('.vk_message_line_me').on('mouseover', function () {
        $this = $(this)
        var msgId = $this.attr('msg-id')
        var editImg = $(`#edit_message_img_${msgId}`)
        editImg.css('display', 'block')
    })

    $('.vk_message_line_me').on('mouseout', function () {
        $this = $(this)
        var msgId = $this.attr('msg-id')
        var editImg = $(`#edit_message_img_${msgId}`)
        editImg.css('display', 'none')
    })

    $('.edit_message_img').on('click', function () {
        $this = $(this)
        var msgId = $this.attr('msg-id')
        message_id = msgId
        var msgText = $(`#vk_message_line-text_${msgId} > .inner_message_p`).text()
        var okEditButton = $('#message_vk-editOkButton')
        var cancelEditButton = $('#message_vk-editCancelButton')
        var attachForm = $('#attach_files_form')

        $('#message_vk-messageText').val(msgText)
        okEditButton.show()
        cancelEditButton.show()
        attachForm.hide()
        $('#message_vk-sendButton').hide()
    })
}

$('#message_vk-editCancelButton').click(function () {
    $this = $(this)
    var okEditButton = $('#message_vk-editOkButton')
    var input = $('#message_vk-messageText')
    var attachForm = $('#attach_files_form')
    message_id = ''
    $this.hide()
    okEditButton.hide()
    input.val('')
    attachForm.show()
    $('#message_vk-sendButton').show()
})

//редактирование сообщения
$('#message_vk-editOkButton').click(function () {
    $this = $(this)
    var messageText = $('#message_vk-messageText').val()
    var fileInputVal = $('#message_vk-attachButton').val()
    if (messageText.trim() == '' && !fileInputVal) {
        $('#message_vk-messageText').val('')
        return false;
    }

    if (fileInputVal != "" && file_hash != "") {
        var data = `user_id=${vkUserId}&message_id=${message_id}&message_text=${messageText}&attachments=${file_hash}&csrf=${csrf}&messanger=${messangerType}&group_id=${groupId}`
    } else {
        var data = `user_id=${vkUserId}&message_id=${message_id}&message_text=${messageText}&csrf=${csrf}&messanger=${messangerType}&group_id=${groupId}`
    }

    //запрос на отправку сообщения
    $.ajax({
        url: 'modules/vk_chat/editMessage.php',
        type: 'post',
        data: data,
        beforeSend: function () {
            needScroll = true
            msgOffset = 0
        },
        success: function (resp) {
            $('#message_vk-messageText').val('')
            $('#message_vk-attachButton').val('')
        }
    })

    $this.hide()
    $('#message_vk-editCancelButton').hide()
    $('#attach_file_info').css('display', 'none')
    $('#message_vk-sendButton').show()
    var attachForm = $('#attach_files_form')
    attachForm.show()
})

$(document).mousedown(function (e) { // событие клика по веб-документу
    var div = $("#friends_search_vk")
    var header = $('#message_window_header')
    var head = $('.message_window_vk-title')
    var resiazeble = $('.ui-resizable-handle')
    if (!div.is(e.target) // если клик был не по нашему блоку
        && div.has(e.target).length === 0
        && !header.is(e.target)
        && !head.is(e.target)
        && head.has(e.target).length === 0
        && !resiazeble.is(e.target)) { // и не по его дочерним элементам
        div.hide(); // скрываем его
    }

    // Удаляем контекстное меню
    if (!$(".vkContextMenu__link").is(e.target))
        $('#vkContextMenu').remove()
});

function getFriends() {
    var searchWindow = $('#friends_search_vk')
    searchWindow.show()

    $.ajax({
        url: `modules/vk_chat/getFriends.php?user_id=${myVkId}`,
        success: function (resp) {
            $('.friends_search_items').empty()
            var data = JSON.parse(resp)
            fillFriendsField(data)
        }
    })
}

function getGroupMembers() {
    var searchWindow = $('#friends_search_vk')
    searchWindow.show()
    $('.friends_search_items').empty();
    $.ajax({
        url: `modules/vk_chat/getGroupMembers.php?group_id=${groupId}`,
        beforeSend: function () {
            createVkPreloader($('.friends_search_items'));
        },
        success: function (resp) {
            destroyVkPreloader($('.friends_search_items'));
            var data = JSON.parse(resp)
            fillFriendsField(data)
        }
    })
}

function fillFriendsField(data) {
    data['response']['items'].forEach(function (item, i) {
        var id = item.id
        var name = `${item.first_name} ${item.last_name}`
        var online = item.online
        var photo = item.photo_50
        var line = `<div class="friend_line" id="friend_line${id}" data-id='${id}' title="${name}" online='${online}' src="${photo}"><img src='${photo}' alt='${name}' data-id='${id}' title='${name}' online='${online}'><option id="message_vk-users--list_option${id}" data-id="${id}" data-name="${name}">${name}</option></div>`
        $('.friends_search_items').append(line)
    })
    eventOptionOnClick($('.friend_line'))
}

$('.header__category-item a').click(function () {
    $('.header__submenu-list.active').flexMenu({
        'popupClass': 'header__submenu-dropdownmenu',
        'cutoff': 0,
        'threshold': 0,
        'linkText': lang.More,
        'linkTitle': lang.Show_more
    });

    let itemId = $(this).attr('id');
    changeAddingItemsId(itemId);
});

// Изменение ссылок для добавления новых сущностей при клике на категорию
function changeAddingItemsId(clickedItemId) {
    let curCatId = parseInt(clickedItemId.replace('active_cat_', ''));

    $('.header__submenu-item--add.flexMenu-viewMore ul li').each(function (i, liItem) {
        let linkForAdding = $(liItem).children('a.header__submenu-link');
        let hrefForLink = linkForAdding.attr('href');
        let curCatParam = 'cat=' + curLinkCategory;
        let newCatParam = 'cat=' + curCatId;

        hrefForLink = hrefForLink.replace(curCatParam, newCatParam);
        linkForAdding.attr('href', hrefForLink);
    });

    // Значение глобальной переменной - id категории, на которую был совершен клик
    curLinkCategory = curCatId;
}

$(window).resize(function () {
    list_overflow_toggle([catigories, submenu_list, filter_list], 'visible', 'hidden');
    clearTimeout(show_list);

    show_list = setTimeout(function () {
        list_overflow_toggle([catigories, submenu_list, filter_list], 'hidden', 'visible');
    }, 210);
});

$('.message_vk-history_field').scroll(function () {
    $this = $(this)

    // Если высота окна + высота прокрутки больше или равны высоте всего документа и ajax-запрос в настоящий момент не выполняется, то запускаем ajax-запрос
    if ($this.scrollTop() == 0 && isMessageSearch == 0) {
        if (messageContent == 1 && firstMessageQuery == 0) {

            $this.scrollTop($this.height() / 2)
            msgOffset += 50
            getVkMessagesAjax()
        }
    }
})

$('.message_vk-history_field').on('click', function () {
    if (selectedMessages.length > 0) {
        $('#message_vk-deleteButton').show()
    } else {
        $('#message_vk-deleteButton').hide()
    }
})

$('#friends_search_header_btn-close').click(function () {
    $('#friends_search_vk').hide()
})

/* Внутренний чат КБ*/
$('#chat_form_submit__img').click(function () {
    $('#chat_from_submit').submit()
})

/* Реализация ОК менеджера в шапке КБ */
$('.header__user-item--messages').click(function (e) {
    e.stopPropagation();
    // Проверяем один ли пункт в списке messages__tooltip
    const menuTooltipLenght = $('.messages__tooltip').children().length;
    if (menuTooltipLenght > 1) {
        $('.header__user-item--messages').find('div.messages__tooltip').toggleClass('hidden');
    } else if (menuTooltipLenght === 1) {
        // Вызываем клик этого пункта
        $('.messages__tooltip').children().trigger('click');
    }
});

$('#ok_manager__messages').click(function (e) {
    e.stopPropagation();
    //Запрос на статус менеджера: если активный - значит уже открыта сессия и тут блокируем окно, иначе открываем
    $.ajax({
        url: `modules/livechat/checkManagerStatus.php?manager_id=${user.id}`,
        success: function (resp) {
            if (resp) {
                resp = JSON.parse(resp);
                const activeStatus = resp.manager_is_active;
                const isOkWindowClosed = $('.manager_ok__window').hasClass('hidden');

                if (activeStatus == '1' && !isOkWindowClosed) { // Если уже есть активность
                    jalert('Сессия менеджера уже активна в другом окне. Пожалуйста, закройте активные окна, чтобы начать работу');
                } else if (activeStatus == '0' || activeStatus == '') {
                    // Устанавливаем активность менеджера
                    $.ajax({
                        url: 'modules/livechat/setActiveUserStatus.php',
                        type: 'POST',
                        data: `manager_id=${user.id}&csrf=${csrf}`,
                        success: function (resp) {
                            $('#manager_ok__window').toggleClass('hidden');
                            $('.messages__tooltip').toggleClass('hidden');
                            // Передача события клика в iframe
                            document.getElementById('message_window_okFrame').contentWindow.postMessage({ "isWindowOpen": true }, "*");
                        }
                    });
                }
            }
        }
    });
});


// Открываем popup для телефонии
$('#header__item-phone').click(function (e) {
    e.preventDefault();
    const href = $(this).attr('href');
    window.open(href, 'popup', 'width=540,height=715,top=150,left=650');
});

window.addEventListener('message', okMessageFunction);

function okMessageFunction(e) {
    let data = typeof e.data == 'string' ? JSON.parse(e.data) : e.data;

    if (typeof data.okWindow != 'undefined') {
        $('#manager_ok__window').toggleClass('hidden');
        clearInterval(okIdInterval);
        document.title = documentTitle;
    } else if (typeof data.okTitle != 'undefined') {
        if (okIdInterval != 0) clearInterval(okIdInterval);
        if (data.okTitle == 'stop') {
            document.title = documentTitle;
        } else {
            okIdInterval = setInterval(changeTitleOK, 500);
        }
    }
}

// Изменение title страницы(инфа о новом сообщении)
function changeTitleOK() {
    switch (okTitleState) {
        case 'new':
            document.title = newOkTitle;
            okTitleState = 'old';
            break;
        case 'old':
            document.title = documentTitle;
            okTitleState = 'new';
            break;
        default:
            break;
    }
}

function createVkPreloader(node) {
    let parentNode = node;
    const preloader = `<div class="vk__preloader-data">
                            <div class="preloader__block" style="z-index: 10000000;">
                                        <div class="preloader">
                                            <div class="lds-css ng-scope">
                                                <div style="width:100%;height:100%" class="lds-ellipsis">
                                                    <div>
                                                        <div></div>
                                                    </div>
                                                    <div>
                                                        <div></div>
                                                    </div>
                                                    <div>
                                                        <div></div>
                                                    </div>
                                                    <div>
                                                        <div></div>
                                                    </div>
                                                    <div>
                                                        <div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                        </div>`;
    node.prepend(preloader);
}

function destroyVkPreloader(node) {
    node.find('.vk__preloader-data').remove();
}

function add_link_block_show(selector, field_id) {
    var v_o = document.getElementById(selector);
    var v_t;
    var v_e;
    var l_field;
    var l_field_id;
    var l_table_id;
    var catItem = $(v_o).attr('cat-item');

    if (typeof catItem != "undefined") {
        jalert(`<a href='edit_group.php?group=${user_group_id}&cat_item=${catItem}' target="_blank">${lang.No_rights_fast_saving}</a>`);
        return;
    }

    if (v_o.style.display == 'none') {
        var overlay = $('<div>');
        overlay.addClass('overlay');
        $('body').append(overlay);
        $(v_o).slideDown(200);
        var overlay_obj = new Overlay();
        overlay_obj.close(v_o, [], 'slide', 200);

        // Устанавливаем в отображаемое поле, значение которое забили в быстром поиске
        if (typeof show_fields['fields'][field_id] != "undefined") {
            l_field_id = show_fields['fields'][field_id]['s_field_id'];
            l_table_id = show_fields['fields'][field_id]['s_table_id'];
        } else {
            l_field_id = cur_subtable['show_fields'][field_id]['s_field_id'];
            l_table_id = cur_subtable['show_fields'][field_id]['s_table_id'];
        }

        $.ajax({
            url: 'update_value.php?table=' + l_table_id + '&get_field_by_id' + '&field_id=' + l_field_id,
            method: 'GET',
            success: function (xhr) {
                if (xhr) {
                    l_field = JSON.parse(xhr);

                    v_t = document.getElementById('fast_edit_span_' + l_field_id + '_' + field_id + '_0');
                    v_e = document.getElementById('edit_value' + field_id);
                    if ((l_field['type_field'] == 1) || (l_field['type_field'] == 2) || (l_field['type_field'] == 3)) { // Число, дата, строка
                        //очистка полей в зеленом плюсике
                        if (click_status === 1) {
                            var elem_arr = [];
                            $("tr .add_link_block" + field_id + " > td[id*='sub_cell_'] > input[part='add_link_field']").each(function () {
                                elem_arr[$(this).attr('field_id')] = $(this).attr('field_id');
                            });
                            for (var i = 0; i < elem_arr.length; i++) {
                                if (elem_arr[i]) {
                                    var l_field_id_1 = elem_arr[i];
                                    var l_field_1 = show_fields['fields'][l_field_id_1];
                                    var v_t_1 = $('.fast_edit_span_' + l_field_id_1 + '_' + field_id + '_0');
                                    var v_e_1 = $('#edit_value' + field_id);
                                    if ((l_field_1['type_field'] == 1) || (l_field_1['type_field'] == 2) || (l_field_1['type_field'] == 3));
                                    v_t_1.value = "";
                                }
                            }
                            click_status = 0;
                        }
                    }
                }
            }
        });
    }
    else {
        v_o.style.display = 'none';
    }
}

function add_link_block_save(field_id, add_link_field_ids, lineId, target) { // Сохранить результаты новой строки, и выбрать его в качестве значения для поля связи
    click_status = 1;
    var add_link_field_ids = explode(',', add_link_field_ids);
    var field;
    var l_field_id;
    var l_field;
    var l_table_id;
    var v_o;
    var val;
    //var update_params = ''; // старая реализация в виде строки
    var update_params_formData = new FormData(); // новая реализация в виде FormData
    if (show_fields['fields'][field_id]) {
        field = show_fields['fields'][field_id];
    } else {
        field = cur_subtable['show_fields'][field_id];
    }
    var localSelector = '';
    var v_oSelector = '';
    switch (target) {
        case 'table':
            localSelector = '.add_link_block' + field_id;
            v_oSelector = '#add_link_block' + field_id + '_' + lineId;
            break;
        case 'subtable':
            localSelector = '.add_link_block' + field_id;
            v_oSelector = '#add_link_block' + field_id + '_' + lineId;
            break;
        case 'view':
            localSelector = '.add_link_block' + field_id;
            v_oSelector = '.add_link_block' + field_id;
            break;
        case 'edit':
            localSelector = '.add_link_edit_block' + field_id;
            v_oSelector = '.add_link_edit_block' + field_id;
            break;
        default:
            break;
    }

    if (field) {
        //update_params = "mfield=" + field_id + "&sel=save&table=" + field['s_table_id'] + "&line=new&csrf=" + csrf + "&"; // старая реализация в виде строки
        update_params_formData.append("mfield", field_id);
        update_params_formData.append("sel", "save");
        update_params_formData.append("table", field['s_table_id']);
        update_params_formData.append("line", "new");
        update_params_formData.append("csrf", csrf); // новая реализация в виде FormData

        if (field['parent_link_field']) { // Поле фильтруется
            var parent_field_id = field['parent_link_field'];
            var parent_field = show_fields['fields'][parent_field_id];
            if (document.getElementById('value' + parent_field_id)) {
                var parent_val = document.getElementById('value' + parent_field_id).value;
                // Также сохраняем его значение
                if (parent_field['s_table_id'] != field['s_table_id']) { // Новый тип полей фильтров связи
                    var filter_field_id = field['s_field_filter_id'];
                    //update_params += "value[new][" + filter_field_id + "]=" + parent_val + "&edit[new][" + filter_field_id + "]=1&"; // старая реализация в виде строки
                    update_params_formData.append("value[new][" + filter_field_id + "]", parent_val);
                    update_params_formData.append("edit[new][" + filter_field_id + "]", 1); // новая реализация в виде FormData
                    if (parent_val) // значение вообще установлено
                    {
                        //update_params += "value[new][" + filter_field_id + "]=" + parent_val + "&edit[new][" + filter_field_id + "]=1&"; // старая реализация в виде строки
                        update_params_formData.append("value[new][" + filter_field_id + "]", parent_val);
                        update_params_formData.append("edit[new][" + filter_field_id + "]", 1); // новая реализация в виде FormData
                    }
                    else {
                        if (show_fields['fields'][filter_field_id] && show_fields['fields'][filter_field_id]['main']) {
                            jalert(lang.Qst_required_alert + ': ' + parent_field['name_field']);
                            return;
                        }
                    }
                }
            }
        }
        if (field['child_link_field'] && document.getElementById('edit_value' + field['child_link_field'])) {
            var c_l_f = field['child_link_field'];
            v_o = document.getElementById('edit_value' + c_l_f);
            v_o.value = '';
            $(v_o).change();
            document.getElementById('value' + c_l_f).value = '';
            var select = $('#value' + field.id)
            fields_find_link_fields(select)
        }
    }
    if (typeof show_fields['fields'][field_id] != "undefined")
        l_table_id = show_fields['fields'][field_id]['s_table_id'];
    else
        l_table_id = cur_subtable['show_fields'][field_id]['s_table_id'];

    $.ajax({
        url: 'update_value.php?table=' + l_table_id + '&get_fields_by_id',
        method: 'GET',
        success: function (xhr) {
            if (xhr) {
                fields = JSON.parse(xhr);
                var additional_params = [],
                    arr_all_files = {},
                    main_field = [];
                for (var i in add_link_field_ids) {
                    l_field_id = add_link_field_ids[i];
                    if (!l_field_id) continue;
                    l_field = fields[l_field_id];
                    v_o = document.querySelector(v_oSelector + ' #fast_edit_span_' + l_field_id + '_' + field_id + '_0');
                    if ((l_field['type_field'] == 1) || (l_field['type_field'] == 2) || (l_field['type_field'] == 3) || (l_field['type_field'] == 3)) { // Число, дата, строка
                        if (typeof (v_o.value) !== 'undefined') val = v_o.value;
                        else
                            if (typeof (v_o.innerHTML) !== 'undefined') val = v_o.innerHTML;
                        val = html_form(val);
                        if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                            jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                            return;
                        }
                        //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                        update_params_formData.append("value[new][" + l_field_id + "]", val);
                        update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                    }
                    if(l_field["type_field"] == 4){
                        if (l_field['mult_value'] == '1') {
                            if ($(v_o).val().length === 0 && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(v_o.value) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", v_o.value);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        }else {
                            val = v_o.value;

                            // Если установлено значение по умолчанию, и не происходил выбор значения вручную (options у select не подгружаются => val = null)
                            if (!val) val = $(v_o).attr('ac_link_val');
                            if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", val);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        }
                    }
                    if(l_field["type_field"] == 7 || l_field["type_field"] == 14){
                        if (l_field['mult_value'] == '1') {
                            if ($(v_o).val().length === 0 && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            let val =$(v_o).val();
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", val);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        }else {
                            val = v_o.value;

                            // Если установлено значение по умолчанию, и не происходил выбор значения вручную (options у select не подгружаются => val = null)
                            if (!val) val = $(v_o).attr('ac_link_val');
                            if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", val);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        }
                    }
                    if ((l_field["type_field"] == 13) || (l_field["type_field"] == 11) ) {
                        if (l_field['mult_value'] == '1') {
                            let multiValues = [];
                            $(v_o).next('.subtable__multi-select').children().each((i, item) => {
                                const selectVal = $(item).val();
                                if (selectVal) multiValues.push(selectVal);
                            });
                            if (multiValues.length === 0 && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            if (multiValues.length === 0) {
                                multiValues = v_o.value.split('-');
                            }
                            const newVal = multiValues.join('\r\n');
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(newVal) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", newVal);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        } else {
                            val = v_o.value;
                            if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                                jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                                return;
                            }
                            //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                            update_params_formData.append("value[new][" + l_field_id + "]", val);
                            update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                        }
                    }
                    if (l_field["type_field"] == 5) { // Связь
                        val = v_o.value;

                        // Если установлено значение по умолчанию, и не происходил выбор значения вручную (options у select не подгружаются => val = null)
                        if (!val) val = $(v_o).attr('ac_link_val');

                        if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                            jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                            return;
                        }
                        //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                        update_params_formData.append("value[new][" + l_field_id + "]", val);
                        update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                    }
                    if (l_field["type_field"] == 6 || l_field["type_field"] == 9) {
                        let arr_files = [],
                            isEditMode = $('#edit_block').css('display') === 'block';
                        if(isEditMode){
                            fieldValue = $('#edit_block .new-file' + l_field_id + '_' + field_id);
                        }else{
                            fieldValue = $('#view_block .new-file' + l_field_id + '_' + field_id);
                        }
                        if (l_field['main'] == 1 && fieldValue.length == 0) {
                            jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                            return;
                        }
                        for(let j = 0; j < fieldValue.length; j++) {
                            if (fieldValue[j].files.length == '0') {
                                continue;
                            }
                            for (let z = 0; z < fieldValue[j].files.length; z++){
                                arr_files.push(fieldValue[j].files[z]);
                                if (i == '0') {
                                    main_field.push(fieldValue[j].files[z].name);
                                }
                            }
                        }
                        arr_all_files[l_field_id] = arr_files; // заполнение массива файлов для последующего преобразования их в Base64
                        update_params_formData.append("value[new][" + l_field_id + "]", '');
                        update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                    }
                    if (l_field["type_field"] == 5) { // Связь
                        val = v_o.value;

                        // Если установлено значение по умолчанию, и не происходил выбор значения вручную (options у select не подгружаются => val = null)
                        if (!val) val = $(v_o).attr('ac_link_val');

                        if (!val && (l_field['main'] == 1 || l_field_id == explode('|', field['type_value'])[1])) {
                            jalert(lang.Qst_required_alert + ": " + l_field['name_field']);
                            return;
                        }
                        //update_params += "value[new][" + l_field_id + "]=" + encodeURIComponent(val) + "&edit[new][" + l_field_id + "]=1&"; // старая реализация в виде строки
                        update_params_formData.append("value[new][" + l_field_id + "]", val);
                        update_params_formData.append("edit[new][" + l_field_id + "]", 1); // новая реализация в виде FormData
                    }
                }
                var correct = true;
                for (var i in add_link_field_ids) {
                    l_field_id = add_link_field_ids[i];
                    if (!l_field_id) continue;
                    l_field = fields[l_field_id];
                    v_o = document.querySelector(localSelector + ' #fast_edit_span_' + l_field_id + '_' + field_id + '_0');
                    var pref = 'templ_fill_link_ok';
                    var temp_fill_link_ok = $(v_o).parent().find('#templ_fill_link_ok' + l_field_id);
                    if (temp_fill_link_ok.length > 0) {
                        var myelems = temp_fill_link_ok.get(0);
                        if (myelems.id.substr(0, pref.length) == pref && v_o.value.toString().trim() != '') {
                            id = myelems.id.substr(pref.length);
                            if (myelems.value == '0') {
                                if (document.querySelector(localSelector + ' #fast_edit_span_' + l_field_id + '_' + field_id + '_0').value) {
                                    document.querySelector(localSelector + ' #fast_edit_span_' + l_field_id + '_' + field_id + '_0').className += ' bg_err';
                                    correct = correct && false;
                                }
                                return;
                            }
                        }
                    }
                }
                if (correct) {
                    $("input[id^='fast_edit_span_']").removeClass('bg_err');
                    $("input[id^='fast_edit_span_']").removeClass('bg_fill');
                }
                clear_recheck_text();
                fetch('view_line2.php', {
                    method: 'POST',
                    body: update_params_formData
                }).then(async (response) => {
                    let json = await response.text();
                    let res_arr = json.toString().split("|");
                    let act = res_arr[0];
                    let table_id = res_arr[1];
                    let line_id = res_arr[2];
                    let update_files = new FormData();
                    const toBase64 = file => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                    });
                    for (let [key, value] of Object.entries(arr_all_files)) {
                        for (let i = 0; i < value.length; i++) {
                            if (!value[i]) {
                                break;
                            }
                            update_files.append("csrf", csrf);
                            update_files.append("table", table_id);
                            update_files.append("line", line_id);
                            update_files.append("field", key);
                            update_files.append("add_file_name", value[i].name);

                            let base64_data = await toBase64(value[i]);
                            //отрезаем начало base64 строки (в начале хранятся тип, что это base64 и т.д. а нам нужно только содержимое)
                            base64_data = base64_data.substr(base64_data.indexOf('base64,') + 7);
                            update_files.append("add_file_data", base64_data);
                            fetch('update_value.php', {
                                method: 'POST',
                                body: update_files
                            }).then(()=>{console.log("success");});
                            for (let key of update_files.keys()) {
                                update_files.delete(key)
                            }
                        }
                    }
                    let new_value = Base64.decode(res_arr[3]);
                    if (act == 'dupl') {
                        jalert(lang.fast_field_already_exists_p1 + " \"" + fields[new_value]['name_field'] + "\" " + lang.fast_field_already_exists_p2);
                    }
                    else {
                        var block;
                        switch (target) {
                            case 'table':
                                block = $('#add_link_block' + field_id + '_' + lineId);
                                v_o = $('select.fields__fast-edit--combobox[field_id=' + field_id + '][line_id=' + lineId + ']').next().find('.autocomplete__input');
                                add_link_block_show(`add_link_block${field_id}_${lineId}`, field_id);
                                break;
                            case 'subtable':
                                block = $('#add_link_block' + field_id + '_' + lineId);
                                v_o = $('select.sub_edit_link_input[field_id=' + field_id + '][line_id=' + lineId + ']').next().find('.autocomplete__input');
                                add_link_block_show(`add_link_block${field_id}_${lineId}`, field_id);
                                break;
                            case 'edit':
                                block = $('#add_link_edit_block' + field_id);
                                v_o = $('#view_value' + field_id);
                                add_link_block_show(`add_link_edit_block${field_id}`, field_id);
                                break;
                            case 'view':
                                block = $('#add_link_block' + field_id);
                                v_o = $('#edit_value' + field_id);
                                add_link_block_show(`add_link_block${field_id}`, field_id);
                                break;
                            default:
                                break;
                        }

                        if (main_field.length > 0) {
                            v_o.val(main_field.join(', '));
                        } else {
                            v_o.val(new_value);
                        }
                        var select = v_o.parent().prev();
                        var option = $('<option>');
                        option.text(new_value);
                        option.val(line_id);
                        option.attr('selected', true);
                        option.addClass('new-link');

                        var no_data_option = select.find($('.no-data'));
                        if (typeof no_data_option !== 'undefined') {
                            no_data_option.remove();
                        }

                        var last_option = select.find($('.new-link'));
                        if (typeof last_option !== 'undefined') {
                            last_option.remove();
                        }

                        select.append(option);

                        var overlay = new Overlay();

                        /**
                         * Открытый блок для добавления ссылки
                         * @type Element
                         */

                        if (typeof block !== 'undefined') {
                            overlay.hide(block, 'slide', 200);
                        }

                        // Посылаем запрос на обновление данных в БД
                        if (target !== 'view') {
                            // let ajaxData = '';
                            let ajaxData = new FormData();
                            switch (target) {
                                case 'table':
                                    ajaxData.append("csrf", csrf);
                                    ajaxData.append("field", field_id);
                                    ajaxData.append("line", lineId);
                                    ajaxData.append("value", line_id);
                                    // ajaxData = `field=${field_id}&line=${lineId}&value=${line_id}&csrf=${csrf}`;
                                    break;
                                case 'subtable':
                                    ajaxData.append("csrf", csrf);
                                    ajaxData.append("field", field_id);
                                    ajaxData.append("line", lineId);
                                    ajaxData.append("value", line_id);
                                    // ajaxData = `field=${field_id}&line=${lineId}&value=${line_id}&csrf=${csrf}`;
                                    break;
                                case 'edit':
                                    ajaxData.append("csrf", csrf);
                                    ajaxData.append("field", field_id);
                                    ajaxData.append("line", select.attr('line_id'));
                                    ajaxData.append("value", line_id);
                                    // ajaxData = `field=${field_id}&line=${select.attr('line_id')}&value=${line_id}&csrf=${csrf}`;
                                    break;
                                default:
                                    break;
                            }
                            fetch('update_value.php', {
                                method: 'POST',
                                body: ajaxData
                            }).then(()=>{
                                console.log('Данные обновлены');
                                if(target == 'subtable'){
                                    $(`#button-done-${lineId}-${field_id}`).trigger('click');
                                    $(`.subtable__footer-btn--save`).trigger('click');
                                    displayNotification(lang['Success_save_notif'], 1);
                                }
                                else {
                                    save_view_line_autocomplete($(`#view_value${field_id}`));
                                }
                            });
                        }
                    }
                });
            }
        }
    });

}

function explode(delimiter, string) {
    var emptyArray = { 0: '' };
    if (arguments.length != 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined') {
        return null;
    }
    if (delimiter === ''
        || delimiter === false
        || delimiter === null) {
        return false;
    }
    if (typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object') {
        return emptyArray;
    }
    if (delimiter === true) {
        delimiter = '1';
    }
    return string.toString().split(delimiter.toString());
}

function html_form(str) {
    str = str_replace('<br>', "\n", str);
    str = str_replace('<BR>', "\n", str);
    str = str_replace('</div><div>', "\n", str);
    str = str_replace('</DIV><DIV>', "\n", str);
    str = str_replace('<div>', "\n", str);
    str = str_replace('<DIV>', "\n", str);
    str = str_replace('</div>', "", str);
    str = str_replace('</DIV>', "", str);
    str = str_replace('&nbsp;', ' ', str);
    str = fulltrim(str);
    return str;
}

function displayNotification(text, type) {
    const newNotify = $(`<div class="display_notification display_notification_class_by_type_${type}">
                            <a class="display_notification_button" href="#"
                                onclick="hide_this_notif(this);" title="Закрыть уведомление"></a>
                            <div class="display_notification_text">${text}</div>
                        </div>`);
    const closeNotifyButton = newNotify.find('.display_notification_button');
    const isRecordMode = /view_line2.php/igm.test(curPathOfSiteUrl);

    $('.event-tooltip_wrap').prepend(newNotify).css('display', '');
    setTimeout(() => {
        if (isRecordMode) hide_this_notif(closeNotifyButton);
        else closeNotifyButton.trigger('click');
    }, 5000);
}

function isDateValid(dateVal) {
    let date_format = [lang.datetime_placeholder, lang.date_js_format];
    return moment(dateVal, date_format).isValid();
}

function incorrectDateFieldFormat(element) {
    element.css('background-color', '#ffe0e0');
    displayNotification(lang.date_validation_error, 2);
}

// При нажатии на Enter происходит сохранение значения
// При нажатии на любую другую кнопку (сочетание кнопок) выполняется действие по умолчанию
function saveNewValueByEnterBtn(field, event) {
    let keyCode = event.keyCode;
    let shiftKey = event.shiftKey;
    let dateFieldsParent = $(field).parent('.fields__date-field');
    let isResizeTextarea = $(field).hasClass('resize-textarea') && field.nodeName === 'TEXTAREA';
    let isMultRowField = $(field).attr('mult_row') == '1';

    // Для многострочного поля сохранение по Enter не применяется
    if (isResizeTextarea || isMultRowField) return false;

    if (keyCode === 13) {
        if (shiftKey) return false;
        else {
            event.preventDefault();
            field.blur();
            if (dateFieldsParent.length > 0) { // Для датапикера в таблице
                dateFieldsParent.parent().stop().animate({ backgroundColor: 'transparent' }, 1600).css('background', '');
            }
        }
    }
};

function checkBottomOffsetForTipElements() {
    const defaultTooltipPadding = 23;
    const defaultCirclePadding = 30;
    const footerElement = $('.footer');

    $('.event-tooltip_wrap').css('bottom', `${defaultTooltipPadding}px`);
    $('.fixed-panel').css('bottom', `${defaultCirclePadding}px`);
    $('.demo_create_acc').css('bottom', `${defaultCirclePadding}px`);

    checkBottomOffsetForTipElementsWindowScroll(footerElement, defaultTooltipPadding, defaultCirclePadding);
    $(document).scroll(function() {
        checkBottomOffsetForTipElementsWindowScroll(footerElement, defaultTooltipPadding, defaultCirclePadding);
    });
}

function checkBottomOffsetForTipElementsWindowScroll(footerElement, defaultTooltipPadding, defaultCirclePadding) {
    //Если скролл до начала елемента
    const offset = footerElement.offset().top;
    const scroll = $(window).scrollTop() + $(window).height();
    let toolTipBlock = $('.event-tooltip_wrap');
    let circleElem = $('.fixed-panel');
    let demoCreateAcc = $('.demo_create_acc');

    if (scroll > offset) {
        const tipsPadding = scroll - offset + 10;
        const circlePadding = tipsPadding + 7;

        toolTipBlock.css('bottom', `${tipsPadding}px`);
        circleElem.css('bottom', `${circlePadding}px`);
        demoCreateAcc.css('bottom', `${circlePadding}px`);
    } else {
        toolTipBlock.css('bottom', `${defaultTooltipPadding}px`);
        circleElem.css('bottom', `${defaultCirclePadding}px`);
        demoCreateAcc.css('bottom', `${defaultCirclePadding}px`);
    }
}

function checkFieldForMultiValAndShowTooltip(fieldType, multiVal, tableId, fieldId, type) {
    const tooltipText = type === 1 ? lang.Multival_attention : lang.Multival_attention_2;

    if ((fieldType === 4 || fieldType === 5 || fieldType === 7 || fieldType === 14) && multiVal === 1) {
        jalert(tooltipText, tableId, fieldId);
    }
}

// Если поле является ссылкой и в значении содержит изображение, то добавляем к нему класс "image-link",
// который убирает синее подчеркивание и синий background при наведении
function addIdentClassForLinkFieldsWithImage() {
    const autocompleteLinks = $('a>img');
    const autocompleteSpans = $('span>img');

    for (let link of autocompleteLinks) $(link).parent('a').addClass('image-link');
    for (let span of autocompleteSpans) {
        if(!$(span).parent('span').hasClass('show-field-slave__item') && !$(span).parent('span').hasClass('show-field-slave__item--inline') && !$(span).parent('span').hasClass('image-link')){
            $(span).parent('span').addClass('image-link');
        }
        else {
            if(!$(span).parent('span').parent('span').hasClass('image-link-inline') && !$(span).hasClass('call__button')){
                $(span).parent('span').parent('span').addClass('image-link-inline');
                $(span).parent('span').css('display', 'block');
                $(span).css('display', 'block');
            }
            else {
                $(span).parent('span').css('display', 'block');
            }
        }
    }
}
