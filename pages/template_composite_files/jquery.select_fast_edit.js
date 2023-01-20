// // Формирование нового стиля для быстро редактируемых select элементов
// function form_fast_select(id, obj_p1, obj_p2) {
//     var obj;
//     if (obj_p2) obj = obj_p2;
//     else obj = this;
//     if ($(obj).hasClass('cust_select')) return;
//     //Вычисляем ширину
//     var adds_w = 8;
//     var s_width;
//     if ($(obj).hasClass('nwidth')) { // Элемент скрыт
//         var tSelect = $('<select/>');
//         tSelect.className = obj.className;
//         tSelect.style = obj.style;
//         var h = obj.innerHTML;
//         h = str_replace('disabled="disabled"', '', h); // Снимаем флаги невидимости, т.к. они влияют на ширину
//         h = str_replace('display: none;', '', h);
//         tSelect.html(h);
//         tSelect.visibility = 'hidden';
//         tSelect.insertBefore(document.body);
//         s_width = tSelect.width() + adds_w + 50;
//         tSelect.remove();
//     }
//     else { // Элемент отображается
//         if ($(obj).attr('add_width') == 0) adds_w = 0;
//         s_width = $(obj).width() + adds_w + 50;
//     }
//
//     // создаем родительский элемент
//     var parentSpan = $('<span/>');
//     parentSpan.addClass('select_border');
//     if ($(obj).hasClass('add_link_field'))
//         parentSpan.addClass('select_border_hover');
//     obj.is_cur_focus = 0;
//     parentSpan.mouseover(function () {
//         if ((!this.is_cur_focus) && (!$(obj).hasClass('add_link_field'))) {
//             $(this).addClass('select_border_hover');
//             $(this).children('.select_border_btn').addClass('select_border_btn_hover');
//         }
//     });
//     parentSpan.mouseout(function () {
//         if ((!this.is_cur_focus) && (!$(obj).hasClass('add_link_field'))) {
//             $(this).removeClass('select_border_hover');
//             $(this).children('.select_border_btn').removeClass('select_border_btn_hover');
//         }
//     });
//     parentSpan.css('width', (s_width + 3) + "px");
//     parentSpan.insertBefore(obj);
//     // перемещаем текущий селект в родительский элемент
//     parentSpan.append(obj.parentNode.removeChild(obj));
//     // меняем текущий селект
//     $(obj).addClass('cust_select');
//     $(obj).css('width', (s_width + 2) + "px");
//     // $(obj).css('clip', "rect(2px 149px 19px 2px)");
//
//     $(obj).focus(function () {
//         this.parentNode.is_cur_focus = 1;
//         $(this.parentNode).addClass('select_border_focus');
//         this.nextSibling.className = 'select_border_btn select_border_btn_hover';
//     });
//
//     $(obj).blur(function () {
//         this.parentNode.is_cur_focus = 0;
//         if (!$(obj).hasClass('add_link_field')) {
//             $(this.parentNode).removeClass('select_border_hover');
//             this.nextSibling.className = 'select_border_btn';
//         }
//         $(this.parentNode).removeClass('select_border_focus');
//     });
//     $(obj).change(function () {
//         var s_text = "";
//         if (this.selectedIndex != -1) s_text = this.options[obj.selectedIndex].text;
//         s_text = htmlspecialchars(s_text);
//         $(this.nextSibling).html(s_text);
//         var curWidth = $(this.nextSibling).width();
//         $(this.nextSibling).css("width", "auto");
//
//         // while ($(this.nextSibling).outerWidth(true) > $(obj).width() - 20 && s_text.length > 2) {
//         //     // s_text = s_text.substring(0, s_text.length - 1);
//         //     $(this.nextSibling).html(s_text);
//         // }
//
//         $(this.nextSibling).width(curWidth);
//         this.blur();
//     });
//
//     $(obj).keyup(function () {
//         var s_text = "";
//         if (this.selectedIndex != -1) s_text = this.options[obj.selectedIndex].text;
//         $(this.nextSibling).html(s_text);
//     });
//
//     // ---- патч для firefox 3.6
//     obj.prevent_node_click = 0;
//     $(obj).mouseup(function () {
//         obj.prevent_node_click = 1;
//         setTimeout(function () {
//             obj.prevent_node_click = 0
//         }, 100);
//     })
//     // ====
//
//     // формируем второй спан - который содержит дизайн
//     var childSpan = $('<span/>');
//     childSpan.addClass('select_border_btn');
//     // childSpan.css('width', (s_width - 5) + "px");
//     if ($(obj).hasClass('add_link_field'))
//         childSpan.addClass('select_border_btn_hover');
//     var s_text = "";
//     if (obj.selectedIndex != -1) s_text = obj.options[obj.selectedIndex].text;
//     s_text = htmlspecialchars(s_text);
//     childSpan.html(s_text);
//     parentSpan.append(childSpan);
//     // var curWidth = childSpan.width();
//     // childSpan.css("width", "auto");
//
//     // while ($(childSpan).outerWidth(true) > $(obj).width() + 10 && s_text.length > 2) {
//     //     s_text = s_text.substring(0, s_text.length - 1);
//     //     $(childSpan).html(s_text);
//     // }
//     childSpan.width('100%');
//
//     // Раскрашиваем строчки разным цветом
//     // меняем аттрибут disabled на display:none
//     var cnt = 0, disabled_count = 0;
//     enabled_count = 0;
//     $(obj).children().each(function () {
//         if (cnt % 2) $(this).addClass('gray_select');
//         $(this).click(function (event) {
//             if (obj.prevent_node_click) return;
//             $(this.parentNode).change();
//         });
//         if (this.disabled) {
//             disabled_count++;
//             this.style.display = 'none';
//         }
//         else
//             enabled_count++;
//         cnt++;
//     });
//     if (disabled_count && (enabled_count == 1)) { // Ниодин элемент не разрешен, скрываем список
//         parentSpan.css('display', 'none');
//     }
// }
//
// function form_fast_select_obj(obj) {
//     form_fast_select(0, 0, obj);
// }
//
// $().ready(function () {
//     $('.fast_edit_select').each(form_fast_select);
// });
//

