// Всплывающая системная справка

help_viewed = false;
help_hided = false;
h_init = false;
v_init = false;
help_pos_v = 0;
help_pos_h = 0;

function bind_help_bt(block_id) {
    var master_block = "";
    if (typeof (block_id) != "undefined") master_block = "#" + block_id + " ";
    $(master_block + "span[class='help_bt']").each(function (i, btn) {
        var s_id = $(btn).attr('h_id');
        $btn = $(this);

        $btn.off('click');
        $btn.off('mouseover');
        $btn.off('mouseout');

        $btn.on("click", function () {
            viewHelp(s_id);
        });

        $btn.on('mouseover', function () {

            v_init = setTimeout('viewHelp("' + s_id + '")', 500);

            help_offset = $(this).offset();
            help_pos_t = help_offset.top + 20;
            help_pos_l = help_offset.left;
            $("#s_tooltip").css('top', help_pos_t);
            $("#s_tooltip").css('left', help_pos_l);
        });

        $btn.on('mouseout', function () {
            hideHelpInit();
        });

        $btn.find('div').mouseover(function (event) {
            event.stopPropagation();
        });

        $btn.find('div').mouseout(function (event) {
            event.stopPropagation();
        });
    });
}

$(function () {
    var div_t = '<div class="tooltip_sys" id="s_tooltip" onmouseover="viewHelp()" onmouseout="hideHelpInit()"></div>';
    $("body").append(div_t);
    bind_help_bt();

    if (window.addEventListener)
        addEventListener("message", resize_help_bt_frame, false)
    else
        attachEvent("onmessage", resize_help_bt_frame)
});

function hide_help_bt_pogress() {
    document.getElementById('help_bt_pogress').style.display = "none";
    document.getElementById('help_bt_progrss_frame').style.display = "block";
}

// Делаем resize фрейма
function resize_help_bt_frame(event) {
    if (event.origin !== location.protocol + '//help.' + clientbase_domain) return;
    if (document.getElementById('help_bt_progrss_frame'))
        document.getElementById('help_bt_progrss_frame').style.height = parseInt(event.data) + "px";
}

function viewHelp(sys_id) {
    if (h_init) clearTimeout(h_init);
    if (help_viewed) return;
    help_viewed = true;

    if (!help_available) {
        document.getElementById('s_tooltip').style.display = "block";
        document.getElementById('s_tooltip').style.textAlign = "center";
        document.getElementById('s_tooltip').innerHTML = "<span id='help_bt_pogress'><i>" + lang.Help_not_available + "</i></span>";
        return;
    }

    var elem = $("span[h_id='" + sys_id + "']");
    var h_s = elem.attr('h_s');
    if (typeof (help_section) == "undefined") help_section = "";
    if (h_s === undefined) h_section = help_section;
    else h_section = h_s;

    var h_ss = elem.attr('h_ss');
    if (typeof (help_sub_section) == "undefined") help_sub_section = "";
    if (h_ss === undefined) h_sub_section = help_sub_section;
    else h_sub_section = h_ss;

    var site = location.protocol + '//help.' + clientbase_domain + '/';
    var link = site + 'help_sys.php?section=' + h_section + '&sub_section=' + h_sub_section + '&sys_id=' + sys_id + '&lang=' + lang_full + "&short=1";
    //console.log(link);
    document.getElementById('s_tooltip').style.display = "block";
    document.getElementById('s_tooltip').style.textAlign = "center";
    document.getElementById('s_tooltip').innerHTML = "<span id='help_bt_pogress'><img src=\"images/indicator.gif\" alt=\"\" style=\"vertical-align: middle\" /> <i>" + lang.Help_load + "</i></span>" +
        "<iframe id='help_bt_progrss_frame' height=100px frameborder=0  marginheight=0 marginwidth=0 hspace=0 vspace=0 scrolling=no src='" + link + "' onload='hide_help_bt_pogress();'></iframe>";
}


function hideHelpInit() {
    if (v_init) clearTimeout(v_init);
    str_to = "hideHelp()";
    h_init = setTimeout(str_to, 200);
}

function hideHelp() {
    help_viewed = false;
    document.getElementById('s_tooltip').style.display = "none";
}
