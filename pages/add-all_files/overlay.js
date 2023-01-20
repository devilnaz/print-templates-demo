/**
 * @constructor
 */
function Overlay() {
    var overlay = $('.overlay');

    /**
     * Метод, добавляющий обработчики для закрытия
     * @param obj {Element} элемент, который нужно закрыть
     * @param events {Array} массив объектов, по которым нужно закрывать overlay
     * @param hide {String} метод закрытия элемента
     * @param speed {Number} скорость закрытия элемента
     */
    this.close = function(obj, events = [], hide = '', speed = 400) {
        if (typeof obj !== 'undefined' && overlay.length > 0) {
            if ($(obj).css('display') !== 'none') {
                overlay.on('click', function() {
                    this.hide(obj, hide, speed);
                    $('div[id^=add_link_block]').hide();

                    // Если кликнули не по подтаблице
                    if (!isSubtableTarget) {
                        // Вызываем клик у автокомплита после закрытия формы быстрого добавления в зависимости от режима
                        if ($('#edit_block').css('display') === 'none') {
                            $(`#view_block select.combobox[field_id=${globalActiveFieldId}]`).next().find('.autocomplete__input').click();
                            return;
                        } else {
                            $(`#edit_block select.combobox[field_id=${globalActiveFieldId}]`).next().find('.autocomplete__input').click();
                            return;
                        }

                        // В календаре
                        if ( typeof globalCalendarEventId != 'undefined')
                            $(`#record_card_add${globalCalendarEventId} select.combobox[field_id=${globalActiveFieldId}]`).next().find('.autocomplete__input').click();
                        else if ( typeof globalActiveFieldId != 'undefined' && typeof globalActiveLineId != 'undefined' )
                            $(`#sel_records .fields__cell select[field_id=${globalActiveFieldId}][line_id=${globalActiveLineId}]`).next().find('.autocomplete__input').click();
                    } else {
                        $(`.subtable select.combobox[field_id=${globalActiveFieldId}][line_id=${globalActiveLineId}]`).next().find('.autocomplete__input').click();
                        $('.subtable').css('z-index', '2');
                    }
                }.bind(this));
                $(document).keydown(function(e) {
                    if( e.keyCode === 27 ) {
                        this.hide(obj, hide, speed);
                        return false;
                    }
                }.bind(this));

                events.forEach(function (item) {
                    $(item).on('click', function() {
                        this.hide(obj, hide, speed);
                    });
                });
            }
        }
    }

    /**
     * Метод, закрывающий overlay и элемент
     * @param obj {Element} элемент, который нужно закрыть
     * @param hide {String} метод закрытия элемента
     * @param speed {Number} скорость закрытия элемента
     */
    this.hide = function(obj, hide, speed) {
        $(overlay).remove();
        switch (hide) {
            case 'slide':
                $(obj).slideUp(speed);
                break;
            default:
                $(obj).css('display', 'none');
                break;
        }
    }

    window.Overlay = Overlay;

}
