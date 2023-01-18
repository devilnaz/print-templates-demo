var href_post = 1;
function href_post_click(event, href_post_dialog) {
    if (href_post_dialog) href_post = href_post_dialog;
    if (!href_post) return href_post;
    if (href_post_dialog) var obj = event;
    else var obj = event.currentTarget;
    // Парсим строку выбираем из нее параметры
    var href = obj.href;
    var p = href.indexOf('?');
    var action = href.substr(0, p);
    var qst_form = document.createElement("form");
    qst_form.setAttribute('enctype', 'multipart/form-data');
    qst_form.setAttribute('action', action);
    qst_form.setAttribute('method', 'post');

    var qst_input = document.createElement('input');
    qst_input.setAttribute('type', 'hidden');
    qst_input.setAttribute('name', 'csrf');
    qst_input.value = csrf;
    qst_form.appendChild(qst_input);

    if (p != -1) {  // Есть параметры
        href = href.substr(p + 1);
        var len = href.length;
        var r, r2;
        var d;
        var name;
        var val;
        while (len) {
            r = href.indexOf('=');
            r2 = href.indexOf('&');
            if ((r2 < r || r == -1) && r2 != -1) r = r2;
            if (r == -1) {
                r = href.length;
                d = r;
                name = href.substr(0, r);
                val = '';
            }
            else {
                name = href.substr(0, r);
                d = href.indexOf('&');
                if (d == -1) d = href.length;
                if (d != r) val = href.substr(r + 1, d - r - 1);
                else val = '';
            }
            var qst_input = document.createElement('input');
            qst_input.setAttribute('type', 'hidden');
            qst_input.setAttribute('name', name);
            qst_input.value = val;
            qst_form.appendChild(qst_input);
            href = href.substr(d + 1);
            len = href.length;
        }
    }
    document.body.appendChild(qst_form);
    qst_form.submit();
    return false;
}
$().ready(function () {
    $(".href_post").each(function () {
        $(this).bind("click", href_post_click);
    });
});
