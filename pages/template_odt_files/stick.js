(function () {
    /**
     * Метод, отвечающий за фиксацию объекта
     * @private
     */
    function _ascroll() {

        if (this.b == null) {
            var Sa = getComputedStyle(this.obj, ''), s = '';
            for (var i = 0; i < Sa.length; i++) {
                if (Sa[i].indexOf('overflow') == 0 || Sa[i].indexOf('padding') == 0 || Sa[i].indexOf('border') == 0 || Sa[i].indexOf('outline') == 0 || Sa[i].indexOf('box-shadow') == 0 || Sa[i].indexOf('background') == 0) {
                    s += Sa[i] + ': ' +Sa.getPropertyValue(Sa[i]) + '; '
                }
            }
            this.b = document.createElement('div');
            this.b.style.cssText = s + ' box-sizing: border-box; width: ' + this.obj.offsetWidth + 'px;';
            this.obj.insertBefore(this.b, this.obj.firstChild);
            var l = this.obj.childNodes.length;
            for (var i = 1; i < l; i++) {
                this.b.appendChild(this.obj.childNodes[1]);
            }
            this.obj.style.height = this.b.getBoundingClientRect().height + 'px';
            this.obj.style.padding = '0';
            this.obj.style.border = '0';
        }
        var Ra = this.obj.getBoundingClientRect(),
            R = Math.round(Ra.top + this.b.getBoundingClientRect().height - this.footer.getBoundingClientRect().top + 0);  // селектор блока, при достижении верхнего края которого нужно открепить прилипающий элемент;  Math.round() только для IE; если ноль заменить на число, то блок будет прилипать до того, как нижний край элемента дойдёт до футера
        if ((Ra.top - this.P) <= 0) {
            if ((Ra.top - this.P) <= R) {
                this.b.className = 'position-stop';
                this.b.style.top = - R +'px';
            } else {
                this.b.className = 'position-sticky';
                if (this.position !== 'bottom') {
                    this.b.style.top = this.P + 'px';
                } else {
                    this.b.style.bottom = 0 + 'px';
                }
            }
        } else {
            this.b.className = '';
            this.b.style.top = '';
        }
        if (this.obj.style.opacity == 0) {
            this.obj.style.opacity = 1;
        }
        window.addEventListener('resize', function() {
            if (this.obj) {
                this.obj.children[0].style.width = getComputedStyle(this.obj, '').width;
            }
        }, false);
    }

    /**
     * Фиксатор
     * @param obj Объект, который нужно фиксировать
     * @param footer Объект, на котором нужно прекратить фиксацию
     * @param position Позиция, к какому краю прижимать
     * @constructor
     */
    function Stick(obj, footer, position) {
        this.obj = obj;
        this.b = null;
        this.position = position;
        this.footer = footer;

        switch (this.position) {
            case 'top':
                this.P = 0;
                break;
            case 'center':
                this.P = window.innerHeight / 2 - this.obj.getBoundingClientRect().height;
                break;
            default:
                this.P = 0;
                break;
        }

        this._ascroll = _ascroll.bind(this);
    }

    /**
     * Метод, добавляющий обработчики фиксации
     */
    Stick.prototype.create = function () {
        document.addEventListener('scroll', this._ascroll);
    }

    /**
     * Метод, удаляющий обработчики фиксации
     */
    Stick.prototype.remove = function () {
        document.removeEventListener('scroll', this._ascroll);
    }

    window.Stick = Stick;
})();