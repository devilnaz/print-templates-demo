(function () {

    /**
     * Конструктор для callback функций в режиме просмотра
     * @constructor
     */
    var ViewLineCalcs = function () {
        /**
         * Массив функций
         * @type {Array}
         */
        this.calcFunctions = [];
    };

    /**
     * Метод, переберающий массив функций вычислений и вызывающий их
     */
    ViewLineCalcs.prototype.callFunctions = function () {
        this.calcFunctions.forEach(function (func) {
            if (typeof func === 'function') {
                func();
            }
        });
    };

    window.ViewLineCalcs = ViewLineCalcs;

})();



