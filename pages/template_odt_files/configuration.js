/**
 * скрипты конфигурации кб
 *
 * @author G.Ruslan
 * @created 22.05.2014
 */

/**
 * открытие закрытие прав
 */
$("#config_access_rules").on("click", function (event) {
    event.preventDefault();

    var block = $(".config_access_rules_window"),
        self = $(this);
    if (block.is(":visible")) {
        self.text(lang.Access_rules);
        block.hide();
    }
    else {
        $("#additional_settings").hide();
        $("#open_add_set").text(lang.Additional);
        self.text(lang.Hide);
        block.show();
    }
    event.stopPropagation();
    return false;
});

/**
 * открытие закрытие дополнительных настроек
 */
$("#open_add_set").on("click", function (event) {
    event.preventDefault();

    var add_settings = $("#additional_settings"),
        set = $("#open_add_set"),
        add_set_on = $("#add_set_on");
    if (add_settings.is(":visible")) {
        add_settings.hide();
        set.text(lang.Additional);
        add_set_on.val(0);
    }
    else {
        add_settings.show();
        set.text(lang.Hide);
        add_set_on.val(1);

        $(".config_access_rules_window").hide();
        $("#config_access_rules").text(lang.Access_rules)
    }

    event.stopPropagation();
    init_chosen();
    return false;
});

/**
 * ajax установка прав на категорию
 *
 * @param group идентификатор группы
 * @param id идентификатор категории
 * @param obj "глаз"
 */
function update_cat_access(group, id, obj, type) {
    var object = $(obj),
        acc_img = object.attr("src"),
        grandPa = $("#eye_wrapper");
    if (acc_img == "images/acc_allow.png") {
        acc = "2";
        new_acc_img = "invisibe";
    }
    else if (acc_img == "images/acc_invisibe.png") {
        acc = "0";
        new_acc_img = "close";
    }
    else {
        acc = "1";
        new_acc_img = "allow";
    }

    grandPa.css('backgroundColor', '#fff6ad').attr('b_col', acc);

    var dataObject = {
        save: 1,
        csrf: csrf,
        access: acc,
        group: group
    };

    if (type == 't') {
        dataObject.rewrite = 0;
        dataObject.cat_item = '' + type + id;
    }
    else {
        dataObject.cat = id;
    }

    $("input[name='ob_access[" + group + "]']").val(acc);
    grandPa.css('backgroundColor', 'transparent').attr('b_col', '');

    object.attr("src", "images/acc_" + new_acc_img + ".png");
}

/**
 * права дочерним группам
 */
function gid_access_checkbox_wrapper(gid, type, val) {
    if (type && gid) {
        $("[data-parent='" + gid + "'][data-type='" + type + "']").not(".access_manage_off").each(function () {
            var that = $(this),
                parent = that.parent(),
                img = parent.find('img');

            if (that.val() >= 2) {
                that.val(val);
                if (val == 2) {
                    img.attr("src", "images/check_dis_on_m.png");
                } else {
                    img.attr("src", "images/check_dis_off_m.png");
                }

                if (that.data('o_value') != val) {
                    parent.css("background-color", "#ff9");
                } else {
                    parent.css("background-color", "");
                }
            } else {
                val = (that.val() == 1) ? 2 : 3;
            }

            gid_access_checkbox_wrapper(that.attr('data-gid'), that.attr('data-type'), val);
        })
    }
}

/**
 * чекбоксы установки прав
 */
$(".access_checkbox_wrapper").find("div").on("click", function () {
    var self = $(this),
        input = self.find("input"),
        img = self.find("img"),
        val = +input.val(),
        old_val = +input.data("o_value"),
        pid = input.data('pid'),
        type = input.data('type'),
        gid = input.data('gid');
    if (input.hasClass('access_manage_off')) {
        return false;
    }

    if (pid != undefined) {
        var parent_id = input.data('parent'),
            parent = $("[data-gid='" + parent_id + "'][data-type='" + type + "']"),
            parent_value = +parent.val();

        parent_value = parent_value < 2 ? parent_value : (parent_value == 2) ? 1 : 0;

        if (val == 1) {
            img.attr("src", "images/check_off_m.png");
            input.val(0);
            val = 0;
        } else if (val == 0) {
            if (parent_value) {
                img.attr("src", "images/check_dis_on_m.png");
            } else {
                img.attr("src", "images/check_dis_off_m.png");
            }
            input.val((parent_value == 1) ? 2 : 3);
            val = parent_value;
        } else {
            img.attr("src", "images/check_on_m.png");
            input.val(1);
            val = 1;
        }
    } else {
        if (val == 1) {
            img.attr("src", "images/check_off_m.png");
            input.val(0);
            val = 0;
        } else {
            img.attr("src", "images/check_on_m.png");
            input.val(1);
            val = 1;
        }
    }

    // права дочерним группам
    if (type && gid) {
        val = (val == 1) ? 2 : 3;
        gid_access_checkbox_wrapper(gid, type, val);
    }

    if (+input.val() != old_val) {
        self.css("background-color", "#ff9");
    } else {
        self.css("background-color", "");
    }
    return false;
});