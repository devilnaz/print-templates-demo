;(function () {
    jQuery.fn.fixedTable = function (remove = false) {
        return this.each(function () {
            var $this = $(this);
            var $inner = $this.children();
            var $table = $inner.children();
            var width = $this.innerWidth();

            var layer = createLayer();

            if (remove) {
                $inner.off('.fixed');
                layer.innerDiv.off('.fixed');
                $(document).off('.fixed');
                removeLayer();
                return;
            }


            $(window).resize(function () {
                if ( $('.fields__row--info').length > 0 ) {
                    row.eq(0).find(fieldsCell).each(function (i, cell) {
                        $(cell).css({
                            //'width': ''
                        });
                    });
                    fieldsTable.css({
                        'min-width': '-moz-available',
                        'min-width': '-webkit-fill-available'
                    });
                    setFixedHeaderWidth();

                    layer.innerDiv.css('width', $inner.width() + 'px');
                }
            });

            scrollLayerSizes();

            $inner.css({
                'overflow-x': 'auto',
                'overflow-y': 'hidden'
            });
            $table.css({
                'overflow-x': 'hidden',
                'overflow-y': 'hidden'
            });

            layer.innerDiv.on('scroll.fixed', function () {
                var scrollX = layer.innerDiv.scrollLeft();
                $inner.scrollLeft(scrollX);
            });

            var timeout = 0;
            $inner.on('scroll.fixed', function () {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    var scrollX = $inner.scrollLeft();
                    layer.innerDiv.scrollLeft(scrollX);
                }, 200);
            });

            var inB = inBlock($this);

            if (inB.visible && !inB.bottomLeft) {
                layer.div.removeClass('hidden');
            } else {
                layer.div.addClass('hidden');
            }

            $(document).on('scroll.fixed load', function () {
                var inB = inBlock($this);

                if (inB.visible && !inB.bottomLeft) {
                    layer.div.removeClass('hidden');
                } else {
                    layer.div.addClass('hidden');
                }
            });

            function scrollLayerSizes() {
                layer.deepDiv.css('width', $table.css('width'));

                layer.div.css({
                    width: width,
                    left: $this.offset().left
                });
                layer.innerDiv.css('width', $inner.width() + 'px');
            }

            $('body').append(layer.div);
        });
    };

    function removeLayer() {
        if ($('.fixed-table-layer').length > 0) {
            $('.fixed-table-layer').remove();
        }
    }


    function createLayer() {
        var div = $('<div />', {
            'class': 'fixed-table-layer no_print hidden'
        });
        var innerDiv = $('<div />', {
            'class': 'fixed-table-inner'
        });
        div.append(innerDiv);
        var deepDiv = $('<div />', {
            'class': 'fixed-table-deep'
        });
        innerDiv.append(deepDiv);

        return {
            div: div,
            innerDiv: innerDiv,
            deepDiv: deepDiv
        };
    }

    function getCoords(elem) {
        var box = elem.getBoundingClientRect();

        return {
            top: box.top + pageYOffset,
            left: box.left + pageXOffset,
            bottom: box.bottom + pageYOffset,
            right: box.right + pageXOffset
        };
    }

    function inBlock($block, offset) {
        var blockTop = $block.offset().top,
            blockHeight = $block.innerHeight(),
            scrollTop = $(window).scrollTop(),
            windowHeight = $(window).height();

        offset = offset || 0;

        var obj = {
            top: scrollTop >= (blockTop - windowHeight + offset),
            bottom: scrollTop < blockTop + blockHeight
        };
        obj.visible = obj.top && obj.bottom;
        obj.bottomLeft = scrollTop > (blockTop + blockHeight - windowHeight);

        return obj;
    }
})();