/**
 * Метод, скрывающий загрузку
 */
function hidePreloader() {
    var preloaderBlock = $('.user-data .preloader__block, .fields .preloader__block, .subtable .preloader__block');

    if (preloaderBlock.length > 0) {
        preloaderBlock.remove();
    }
}

/**
 * Метод, создающий прелоадер
 * @param width {String} Ширина прелоадера
 * @param height {String} Высота прелоадера
 * @returns {jQuery|HTMLElement}
 */
function create_preloader_block(width = '100%', height = '100%') {
    var block = $('<div class="preloader__block">');
    var preloader = $('<div class="preloader">');
    var lds = $('<div class="lds-css ng-scope">');
    var lds_ellipsis = $('<div class="lds-ellipsis" style="width: ' + width + '; height: ' + height + '">');
    var parent_circles = [];

    for (var i = 0; i < 5; i++) {
        parent_circles[i] = $('<div>');

        var circle = $('<div>');
        parent_circles[i].append(circle);
        lds_ellipsis.append(parent_circles[i]);
    }

    lds.append(lds_ellipsis);
    preloader.append(lds);
    block.append(preloader);

    return block;
}
