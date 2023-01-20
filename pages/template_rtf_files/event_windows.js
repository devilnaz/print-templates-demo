// Окно напоминаний - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#tip_window").draggable({
        containment: "body",
        handle: "#tip_window_header",
        start: function () {
            eventWindowFocus('tip');
        },
        stop: function () {
            e_top = $("#tip_window").css("top");
            e_left = $("#tip_window").css("left");
            $.cookie("event[tip][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $("#tip_window_frame").resizable({
        containment: "body",
        minHeight: 250,
        minWidth: 470,
        handles: "se",
        start: function () {
            eventWindowFocus('tip');
        },
        stop: function () {
            e_width = $("#tip_window_frame").width();
            e_height = $("#tip_window_frame").height();
            $.cookie("event[tip][size]", e_width + "|" + e_height);
        },
        resize: function () {
            m_height = $("#tip_window").height() - 10;
            c_height = m_height + 5;
            e_height = m_height - 15;
            l_height = m_height - 54;
            $("#tip_window_space").css("margin-top", "-" + m_height + "px");
            $("#tip_window_space").css("height", e_height + "px");
            $("#tip_window_space").width($("#tip_window_frame").width() - 10);
            $("#tip_window_close").css("margin-top", "-" + c_height + "px");
            $("#tip_window_content").css("height", l_height + "px");
        }
    });
});

// Окно поиска - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#search_window").draggable({
        containment: "body",
        handle: "#search_window_header",
        start: function () {
            eventWindowFocus('search');
        },
        stop: function () {
            e_top = $("#search_window").css("top");
            e_left = $("#search_window").css("left");
            $.cookie("event[search][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $("#search_window_frame").resizable({
        containment: "body",
        minHeight: 250,
        minWidth: 470,
        handles: "se",
        start: function () {
            eventWindowFocus('search');
        },
        stop: function () {
            e_width = $("#search_window_frame").width();
            e_height = $("#search_window_frame").height();
            $.cookie("event[search][size]", e_width + "|" + e_height);
        },
        resize: function () {
            m_height = $("#search_window").height() - 10;
            c_height = m_height + 5;
            e_height = m_height - 15;
            l_height = m_height - 54;
            ch_height = l_height - 60;
            u_height = l_height + 25;
            $("#search_window_space").css("margin-top", "-" + m_height + "px");
            $("#search_window_space").css("height", e_height + "px");
            $("#search_window_space").width($("#search_window_frame").width() - 10);
            $("#search_window_close").css("margin-top", "-" + c_height + "px");
            $("#search_window_tables").css("height", u_height + "px");
            $("#search_window_field").css("height", ch_height + "px");
            //$("#search_window_field").width($("#search_window_frame").width() - 226);
            //$("#search_input").width($("#search_window_frame").width() - 228);
            $("#search_window_frame").css("top", "0px"); // Фиксация позиции для Хрома, иногда рамка "соскакивает"

        }
    });
});

// Окно сообщений - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#message_window").draggable({
        containment: "body",
        handle: "#message_window_header, .message_window_vk-title, .message_window_chat-title",
        start: function () {
            eventWindowFocus('message');
        },
        stop: function () {
            e_top = $("#message_window").css("top");
            e_left = $("#message_window").css("left");
            $.cookie("event[message][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $("#message_window_frame").resizable({
        minHeight: 335,
        minWidth: 335,
        handles: "n, e, s, ne, se",
        start: function () {
            eventWindowFocus('message');
        },
        stop: function () {
            e_width = $("#message_window_frame").width();
            e_height = $("#message_window_frame").height();
            $.cookie("event[message][size]", e_width + "|" + e_height);
        },
        resize: function () {
            m_height = $("#message_window").height() - 10;
            c_height = m_height + 5;
            e_height = m_height + 10;
            l_height = m_height - 54;
            ch_height = l_height - 125;
            u_height = l_height - 50;

            //Сложные расчеты размеров элементов ресайза
            var message_window_frame_width = $("#message_window_frame").width()
            var message_window_frame_height = $("#message_window_frame").height()

            $("#message_window_space").css("margin-top", "-" + m_height + "px");
            $("#message_window_space").css("height", e_height + "px");
            $("#message_window_space").width(message_window_frame_width - message_window_frame_width/15);
            $("#message_window_close").css("margin-top", "-" + c_height + "px");

            $("#message_window_frame").css("top", "0px"); // Фиксация позиции для Хрома, иногда рамка "соскакивает"
            //Адаптация под маленький размер окна
            if ( message_window_frame_width < 435 ) {

            }
        }
    });
});

// Окно сообщений - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#manager_ok__window").draggable({
        handle: ".ok_draggable-wrapper",
        start: function () {
            //eventWindowFocus('message');
            $('.ok_draggable-wrapper').css('height','10%');
        },
        stop: function () {
            $('.ok_draggable-wrapper').css('height','3%');
            // Откатываемся до top 0, если перетащили за пределы окна браузера
            let cssTop = $("#manager_ok__window").css("top").substr(0, $("#manager_ok__window").css("top").indexOf('px'));
            if ( cssTop < 0 ) {
                $("#manager_ok__window").css("top",'0');
            }
            e_top = $("#manager_ok__window").css("top");
            e_left = $("#manager_ok__window").css("left");
            $.cookie("event[message][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $("#manager_ok__wrapper").resizable({
        minHeight: 670,
        minWidth: 860,
        handles: "e, se",
        start: function () {
            //eventWindowFocus('message');
            $('#manager_ok__wrapper .ui-resizable-se').attr('style','width: 300px !important; height: 300px !important;');
            $('#manager_ok__wrapper .ui-resizable-e').attr('style','width: 300px !important;');
        },
        stop: function () {
            $('#manager_ok__wrapper .ui-resizable-se').attr('style','');
            $('#manager_ok__wrapper .ui-resizable-e').attr('style','');

            e_width = $("#manager_ok__wrapper").width();
            e_height = $("#manager_ok__wrapper").height();
            $.cookie("event[message][size]", e_width + "|" + e_height);
        },
        resize: function () {
            $('#manager_ok__wrapper .ui-resizable-se').css({
                'width': '300px !important',
                'height': '300px !important'
            });
        }
    });
});

// Окно календаря - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#calendar_window").draggable({
        containment: "body",
        handle: "#calendar_window_header",
        start: function () {
            eventWindowFocus('calendar');
        },
        stop: function () {
            var calendar_window = $("#calendar_window"),
                e_top, e_left;
            e_top = calendar_window.css("top");
            e_left = calendar_window.css("left");
            $.cookie("event[calendar][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $("#calendar_window_frame").resizable({
        containment: "body",
        minHeight: 250,
        minWidth: 470,
        handles: "se",
        start: function () {
            eventWindowFocus('calendar');
        },
        stop: function () {
            var calendar_window_frame = $("#calendar_window_frame"),
                e_width, e_height;
            e_width = calendar_window_frame.width();
            e_height = calendar_window_frame.height();
            $.cookie("event[calendar][size]", e_width + "|" + e_height);
        },
        resize: function () {
            var m_height, c_height, e_height, l_height,
                calendar_window_space = $("#calendar_window_space");
            m_height = $("#calendar_window").height() - 10;
            c_height = m_height + 5;
            e_height = m_height - 15;
            l_height = m_height - 54;
            calendar_window_space.css("margin-top", "-" + m_height + "px");
            calendar_window_space.css("height", e_height + "px");
            calendar_window_space.width($("#calendar_window_frame").width() - 10);
            $("#calendar_window_close").css("margin-top", "-" + c_height + "px");
            $("#calendar_window_content").css("height", l_height + "px");
        }
    });
});

// Окно сообщений - ресайз и перетаскивание
$(function () {
    // Перетаскивание
    $("#asterisk__window").draggable({
        handle: ".dragg_asterisk",
        start: function () {
            //eventWindowFocus('message');
        },
        stop: function () {
            // Откатываемся до top 0, если перетащили за пределы окна браузера
            let cssTop = $("#asterisk__window").css("top").substr(0, $("#asterisk__window").css("top").indexOf('px'));
            if ( cssTop < 0 ) {
                $("#asterisk__window").css("top",'0');
            }
            e_top = $("#asterisk__window").css("top");
            e_left = $("#asterisk__window").css("left");
            $.cookie("event[message][position]", e_top + "|" + e_left);
        }
    });
    // Ресайз
    $(".asterisk__window-wrapper").resizable({
        minHeight: 550,
        minWidth: 500,
        handles: "e, se",
        start: function () {

        },
        stop: function () {
            e_width = $(".asterisk__window-wrapper").width();
            e_height = $(".asterisk__window-wrapper").height();
            $.cookie("event[message][size]", e_width + "|" + e_height);
        }
    });
});

/**
 * класс управления порядком плавающих окон
 */
var floatedWindows = {
    // порядок фокусировки - стек окон
    focusOrder: $.cookie("event[windowsStack]") && $.cookie("event[windowsStack]").split(",") || [],
    // с какого z-индекса начинаем отсчет
    zIndexMin: 800,
    // прозрачность в фоне
    opacityBackground: "0.7",
    // прозрачность активных
    opacityActive: "1.0",
    // помещение окна в конец стека
    _focusOrderAdd: function (type) {
        for (var i = this.focusOrder.length - 1; i >= 0; i--) {
            // удаляем окно из стека, если оно есть
            if (this.focusOrder[i] == type)
                this.focusOrder.splice(i, 1);
        }
        this.focusOrder.push(type);
        // заносим в куку
        $.cookie("event[windowsStack]", this.focusOrder.join());
    },

    // помещение окна в начало стека
    _focusOrderPutDown: function (type) {
        for (var i = this.focusOrder.length - 1; i >= 0; i--) {
            // удаляем окно из стека, если оно есть
            if (this.focusOrder[i] == type)
                this.focusOrder.splice(i, 1);
        }
        this.focusOrder.unshift(type);
        // заносим в куку
        $.cookie("event[windowsStack]", this.focusOrder.join());
    },

    // показ/скрытие окна
    viewWindow: function (type) {
        // выбираем окно
        var casement = $("#" + type + "_window");
        // если открыто скрываем
        if (casement.is(":visible")) {

            casement.animate({opacity: 'hide'}, function () {
                casement.css({
                    display: 'none',
                    opacity: this.opacityActive
                });
            });

            // при закрытии окна, помещаем окно в начало стека пересчитываем стек
            this._focusOrderPutDown(type);
            var focusOrder = this.focusOrder,
                newActiveWindow = focusOrder[focusOrder.length - 1];

            // если предыдущее окно открыто, делаем активным его
            // newActiveWindow!=type на случай, когда в стеке всего 1 элемент
            if ($("#" + newActiveWindow + "_window").is(":visible")
                && newActiveWindow != type)
                this.focusWindow(newActiveWindow);
            else
                cbEventsObject.checkingInterval = 30000;

            //кука
            $.cookie("event[" + type + "][view]", "none");
        }
        // если скрыто показываем
        else {
            // расчет фокуса
            this.focusWindow(type);

            if (type == "message")
                cbMessagesDisplay.scrollHistory();

            cbEventsObject.checkingInterval = 3000;
            if (window.getTipsInit) {
                clearInterval(getTipsInit);
                cbEventsObject.getRemoteEvents();
            }
            if (window.displayEventsInit) {
                clearInterval(displayEventsInit);
                cbEventsObject.displayEvents()
            }

            //кука
            $.cookie("event[" + type + "][view]", "block");
        }
    },

    // фокус окна
    focusWindow: function (type) {
        // помещаем окно в стек
        this._focusOrderAdd(type);

        var zIndexMin = this.zIndexMin,
            zIndexIteration = 0,
            windowIteration = "",
            opacityIteration = "",
            focusOrderLength = this.focusOrder.length,
            casement = "";

        // выстраиваем все открытые окна по стеку
        for (var i = 0; i < focusOrderLength; i++) {

            windowIteration = this.focusOrder[i];
            casement = $("#" + windowIteration + "_window");

            zIndexIteration = 100 * i + zIndexMin;
            casement.css("z-index", zIndexIteration);
            $('#' + windowIteration + "_window_frame").css("z-index", zIndexIteration + 1);
            $('#' + windowIteration + "_window_space").css("z-index", zIndexIteration + 2);
            $('#' + windowIteration + "_window_close").css("z-index", zIndexIteration + 3);

            // прозрачность (последний элемент имеет максимальную прозрачность)
            if (focusOrderLength - 1 == i) {
                opacityIteration = this.opacityActive;
                casement.animate({opacity: 'show'}, function () {
                    casement.css({
                        display: 'block',
                        opacity: opacityIteration
                    });
                });
            }
            else {
                opacityIteration = this.opacityBackground;
                if (casement.is(":visible")) {
                    casement.animate({opacity: opacityIteration}, 200);
                }
            }

            // куки
            $.cookie("event[" + windowIteration + "][zindex]", zIndexIteration / 100);
            $.cookie("event[" + windowIteration + "][opacity]", opacityIteration);
        }
        //console.log(this.focusOrder);
    }
}

// alias для прошлых функций
function eventWindowFocus(e_type) {
    floatedWindows.focusWindow(e_type);
}

function eventView(e_type) {
    floatedWindows.viewWindow(e_type);
}

// Прокрутка вкладок в окне сообщений
if (document.getElementById("message_window")) {
    $("#message_tabs_layout").mousewheel(function (event, delta) {
        $('#message_tabs_layout').scrollLeft($('#message_tabs_layout').scrollLeft() - (delta * 10));
        return false;
    });
}