function addHandler(object, event, handler) {
    if (object.addEventListener) {
        object.addEventListener(event, handler, false);
    }
    else if (object.attachEvent) {
        object.attachEvent('on' + event, handler);
    }
    else alert("Обработчик не поддерживается");
}

function addWheelHandler(obj) {
    addHandler(obj, 'DOMMouseScroll', wheel);
    addHandler(obj, 'mousewheel', wheel);
    addHandler(obj, 'mousewheel', wheel);
}

function wheel(event) {
    var delta;
    event = event || window.event;

    if (event.wheelDelta) { // В Opera и IE
        delta = -event.wheelDelta / 120;
    }
    else if (event.detail) { // Для Gecko
        delta = event.detail / 3;
    }
    // Запрещаем обработку события браузером по умолчанию
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;
    var el = event.target || event.srcElement
    if (el.className != 'trackItem') return

    var pl_c = el.parentNode
    var pl = el.parentNode.parentNode
    var b = getElementsByClass('scrollBar', pl, 'div')[0]
    if (b.style.display == 'none') return
    var t = parseInt(pl_c.style.top) - (delta * 30)
    if (t > 0) t = 0
    if (t < -pl_c.clientHeight + pl.clientHeight) t = -pl_c.clientHeight + pl.clientHeight
    pl_c.style.top = t + 'px'

    var sbh = (pl.clientHeight / pl_c.clientHeight) * pl.clientHeight
    var sbt = -parseInt(pl_c.style.top) / (pl_c.clientHeight - pl.clientHeight) * (pl.clientHeight - sbh)
    if (sbt == 0) sbt = 2
    if (sbt == pl.clientHeight - sbh) sbt = pl.clientHeight - sbh - 1
    b.style.height = sbh + 'px'
    b.style.top = sbt + 'px'
}

function getOffsetSum(elem) {
    var top = 0, left = 0
    while (elem) {
        top = top + parseFloat(elem.offsetTop)
        left = left + parseFloat(elem.offsetLeft)
        elem = elem.offsetParent
    }

    return {top: Math.round(top), left: Math.round(left)}
}

function getOffsetRect(elem) {

    var ua = navigator.userAgent.toLowerCase()
    if (ua.indexOf('msie') && parseFloat(ua.slice(ua.indexOf('msie') + 5)) <= 7) {
        return getOffsetSum(elem)
    }

    var box = elem.getBoundingClientRect()

    var body = document.body
    var docElem = document.documentElement

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft

    var clientTop = docElem.clientTop || body.clientTop || 0
    var clientLeft = docElem.clientLeft || body.clientLeft || 0

    var top = box.top + scrollTop - clientTop
    var left = box.left + scrollLeft - clientLeft

    return {top: Math.round(top), left: Math.round(left)}
}

function getBodyScrollLeft() {
    return self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (document.body && document.body.scrollLeft);
}

function getElementsByClass(searchClass, node, tag) {
    var classElements = new Array();
    if (node == null)
        node = document;
    if (tag == null)
        tag = '*';
    var els = node.getElementsByTagName(tag);
    var elsLen = els.length;

    var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
    for (i = 0, j = 0; i < elsLen; i++) {
        if (pattern.test(els[i].className)) {
            classElements[j] = els[i];
            j++;
        }
    }
    return classElements;
}

function getBackgroundColor(obj) {
    var style = obj.currentStyle || getComputedStyle(obj, '')
    var bgcol = style.backgroundColor
    if (bgcol != 'transparent') return bgcol
    else if (obj.tagName.toLowerCase() != 'body') return getBackgroundColor(obj.parentNode)
    else return '#fff'
}

function hexToDec(n) {
    return Number(parseInt(n + '', 16)).toString(10)
}

function decToHex(n) {
    return Number(parseInt(n + '', 10)).toString(16)
}

function highlight(color) {
    var red = color.substring(1, 3)
    var green = color.substring(3, 5)
    var blue = color.substring(5, 7)
    red = decToHex(255 - (255 - parseInt(hexToDec(red))) / 3.8)
    green = decToHex(255 - (255 - parseInt(hexToDec(green))) / 4.2)
    blue = decToHex(255 - (255 - parseInt(hexToDec(blue))) / 3.6)
    return '#' + red + green + blue
}

function embedSWF(swfUrlStr, replaceElemIdStr, widthStr, heightStr, flashvarsObj, parObj, attObj) {

    document.getElementById(replaceElemIdStr).style.visibility = 'hidden';
    widthStr += "";
    heightStr += "";
    var att = {};
    if (attObj && typeof attObj === "object") {
        for (var i in attObj) { // copy object to avoid the use of references, because web authors often reuse attObj for multiple SWFs
            att[i] = attObj[i];
        }
    }
    att.data = swfUrlStr;
    att.width = widthStr;
    att.height = heightStr;
    var par = {};
    if (parObj && typeof parObj === "object") {
        for (var j in parObj) { // copy object to avoid the use of references, because web authors often reuse parObj for multiple SWFs
            par[j] = parObj[j];
        }
    }
    if (flashvarsObj && typeof flashvarsObj === "object") {
        for (var k in flashvarsObj) { // copy object to avoid the use of references, because web authors often reuse flashvarsObj for multiple SWFs
            if (typeof par.flashvars != "undefined") {
                par.flashvars += "&" + k + "=" + flashvarsObj[k];
            }
            else {
                par.flashvars = k + "=" + flashvarsObj[k];
            }
        }
    }

    var obj = createSWF(att, par, replaceElemIdStr);

}

function createSWF(attObj, parObj, id) {
    var r, el = document.getElementById(id);

    if (document.all && !window.opera) { // Internet Explorer

        var att = "";
        for (var i in attObj) {
            if (i.toLowerCase() == "data") {
                parObj.movie = attObj[i];
            }
            else if (i.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                att += ' class="' + attObj[i] + '"';
            }
            else if (i.toLowerCase() != "classid") {
                att += ' ' + i + '="' + attObj[i] + '"';
            }
        }

        var par = "";
        for (var j in parObj) {
            par += '<param name="' + j + '" value="' + parObj[j] + '" />';
        }

        el.outerHTML = '<object id="' + id + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '<embed name="audio_' + attObj.id + '" src="' + parObj.movie + '" width="' + attObj.width + '" height="' + attObj.height + '"' + att + '></embed></object>';
        el = document.getElementById(id);
        if (el.getElementsByTagName('embed')[0]) {
            for (var i in parObj) {
                el.getElementsByTagName('embed')[0].setAttribute(i, parObj[i])
            }
        }
        r = document.getElementById(attObj.id);

    } else { // well-behaving browsers

        var o = document.createElement("object");
        o.id = id
        o.setAttribute("type", "application/x-shockwave-flash");
        for (var m in attObj) {
            if (m.toLowerCase() == "styleclass") { // 'class' is an ECMA4 reserved keyword
                o.setAttribute("class", attObj[m]);
            }
            else if (m.toLowerCase() != "classid") { // filter out IE specific attribute
                o.setAttribute(m, attObj[m]);
            }
        }
        for (var n in parObj) {
            if (n.toLowerCase() != "movie") { // filter out IE specific param element
                var p = document.createElement("param");
                p.setAttribute("name", n);
                p.setAttribute("value", parObj[n]);
                o.appendChild(p);
            }
        }
        el.parentNode.replaceChild(o, el);
        r = o;
    }

    return r;
}

function shuffle(array) {
    for (var j, x, i = array.length; i; j = parseInt(Math.random() * i), x = array[--i], array[i] = array[j], array[j] = x);
}

var xPlayer = {

    setMainColor: function (col, obj) {
        var _play = getElementsByClass('play', obj, 'div')[0]
        var _pause = getElementsByClass('pause', obj, 'div')[0]
        var _stop = getElementsByClass('stop', obj, 'div')[0]


        _play.style.borderLeft = '14px solid ' + col
        _stop.style.background = col
        _pause.style.borderLeft = '4px solid ' + col
        _pause.style.borderRight = '4px solid ' + col
        getElementsByClass('progress', obj, 'div')[0].style.background = col
        getElementsByClass('volume', obj, 'div')[0].style.background = col
        getElementsByClass('progresstip', obj, 'div')[0].style.border = '1px solid ' + col
        getElementsByClass('progresstip', obj, 'div')[0].style.color = col
        getElementsByClass('volumetip', obj, 'div')[0].style.border = '1px solid ' + col
        getElementsByClass('volumetip', obj, 'div')[0].style.color = col

        if (obj.playlist && obj.getAttribute('noplaylist') == null && obj.getAttribute('playliststyle') == null) {
            getElementsByClass('playlistView', obj, 'div')[0].style.color = col
            getElementsByClass('playlistView', obj, 'div')[0].style.border = '1px solid ' + col
            getElementsByClass('scrollBar', obj, 'div')[0].style.background = col
            getElementsByClass('nowPlaying', obj, 'div')[0].style.borderLeft = '6px solid ' + col
        }


        var bgcol = getBackgroundColor(obj)

        var _play = getElementsByClass('play', obj, 'div')[0]
        // _play.style.borderBottom = '7px solid ' + bgcol
        //_play.style.borderTop = '7px solid ' + bgcol

        if (obj.playlist && obj.getAttribute('noplaylist') == null && obj.getAttribute('pointercolor') == null) {
            var els = getElementsByClass('nowPlaying', obj, 'div')
            for (var i = 0; i < els.length; i++) {
                var col2 = getBackgroundColor(els[i].parentNode)
                els[i].style.borderLeft = '6px solid ' + col
                els[i].style.borderTop = '3px solid ' + col2
                els[i].style.borderBottom = '3px solid ' + col2
            }
        }

        if (obj.playlist && obj.getAttribute('noplaylist') == null && obj.getAttribute('scrollbarcolor') == null) {
            this.setScrollbarColor(col, obj)
        }

        if (!obj.getAttribute('tooltipcolor')) this.setTooltipColor(col, '#fff', obj)
        else this.setTooltipColor(col, obj.getAttribute('tooltipcolor'), obj)

    },

    setScaleColor: function (col, obj) {
        var ps = getElementsByClass('progressScale', obj, 'div')[0]
        var vs = getElementsByClass('volumeScale', obj, 'div')[0]

        ps.style.background = col
        vs.style.background = col
    },

    setTooltipColor: function (maincol, col, obj) {
        getElementsByClass('progresstip', obj, 'div')[0].style.backgroundColor = col
        getElementsByClass('volumetip', obj, 'div')[0].style.backgroundColor = col

        if (!document.all || window.opera) {
            var obj = document.head.getElementsByTagName('style')
            obj = obj[obj.length - 1]
            var str = obj.innerHTML
        } else {
            var str = document.styleSheets[0].cssText
        }
        var new_rules = '.xt1:before,\r\n\
.xt1:after {\r\n\
    content: "\\2666";\r\n\
    font-family: monospace;\r\n\
    font-size: 10px;\r\n\
    line-height: 12px;\r\n\
    text-align: center;\r\n\
\r\n\
    position: absolute;\r\n\
    overflow: hidden;\r\n\
    width: 10px;\r\n\
    height: 10px;\r\n\
\r\n\
    -moz-user-select: -moz-none;\r\n\
    -khtml-user-select: none;\r\n\
    -webkit-user-select: none;\r\n\
    user-select: none;\r\n\
}\r\n\
.xt1:before {\r\n\
    color: ' + maincol + ';\r\n\
}\r\n\
.xt1:after {\r\n\
    color: ' + maincol + ';\r\n\
}\r\n\
.xbottomArrow:before,\r\n\
.xbottomArrow:after {\r\n\
    left: 50%;\r\n\
    bottom: -6px;\r\n\
    margin-left: -5px;\r\n\
    clip: rect(5px, 10px, 10px, 0px);\r\n\
}\r\n\
.xbottomArrow:after {\r\n\
    bottom: -4px;\r\n\
    color: ' + col + ';\r\n\
}\r\n'
        if (str.indexOf('.xt1') != -1) str = str.slice(0, str.indexOf('.xt1')) + new_rules
        else str = str + new_rules
        if (!document.all || window.opera) obj.innerHTML = str
        else document.styleSheets[0].cssText = str
    },

    setPointerColor: function (col, obj) {
        var els = getElementsByClass('nowPlaying', obj, 'div')
        for (var i = 0; i < els.length; i++) {
            els[i].style.borderLeft = '6px solid ' + col
        }
    },

    setScrollbarColor: function (col, obj) {
        getElementsByClass('scrollBar', obj, 'div')[0].style.background = col
    },

    disableOtherSources: function (player) {
        var audios = document.getElementsByTagName('audio')
        for (var i = 0; i < audios.length; i++) {
            audios[i].pause()
            if (audios[i].parentNode.hasAttribute('source') && audios[i].parentNode != player) {
                var b1 = getElementsByClass('play', audios[i].parentNode, 'div')[0]
                var b2 = getElementsByClass('pause', audios[i].parentNode, 'div')[0]
                b2.style.display = 'none'
                b1.style.display = 'inline-block'
            }
        }
        var uppods = document.getElementsByTagName('object')
        for (var i = 0; i < uppods.length; i++) {
            if (uppods[i].id.indexOf('audio_') == 0) {
                if (uppods[i].parentNode.isPlaying != undefined) this.stop(uppods[i].parentNode)
            }
        }
    },

    MODE_NORMAL: 0,
    MODE_CONT: 1,
    MODE_REPEAT: 2,
    MODE_CONT_REPEAT: 3,

    changeMode: function (mode, player) {
        if (mode < 0 || mode > 3) return false;
        player.mode = mode
        return true;
    },

    setShuffling: function (value, player) {
        if (value == null) return false
        if (!player.shuffle && value) {
            var pos = player.plPos + 1 < player.playlist.length ? player.plPos + 1 : 0
            player.playlist_shuffled = player.playlist.slice(pos)
            shuffle(player.playlist_shuffled)
        }
        player.shuffle = !!value
        return true;
    },

    loadFile: function (src, player, startPlaying) {
        if (player.isPlaying) this.stop(player)

        var p = getElementsByClass('progressScale', player, 'div')[0]
        clearInterval(p.timer)

        var volume = 0.5
        if (!player.flash) {
            volume = player.getElementsByTagName('audio')[0].volume
        } else {
            var v = uppodGet('audio_' + player.id, 'getv')
            if (v != null) volume = v / 100
        }

        player.setAttribute('source', src)
        var re = /\s*;\s*/
        var sources = src.split(re)
        var str = ''
        var mp3file = ''
        var audio = document.createElement("audio");
        if (audio == null && !audio.canPlayType) {
            player.flash = true
        }
        var supported = false
        for (var i = 0; i < sources.length; i++) {
            str += '<source src="' + sources[i] + '" />\r\n'
            var type = sources[i].slice(sources[i].lastIndexOf('.') + 1)
            if (audio.canPlayType && audio.canPlayType('audio/' + type)) supported = true
            if (type == 'mp3') mp3file = sources[i]
        }
        if (player.flash) {
            var obj = player.getElementsByTagName('object')[0]
            if (obj) player.removeChild(obj)
        } else {
            var obj = player.getElementsByTagName('audio')[0]
            if (obj) player.removeChild(obj)
        }
        if (!supported || player.getAttribute('flash') != null) {
            if (mp3file == '') {
                if (!supported) return false;
                else player.flash = false
            } else {
                player.flash = true
            }
        } else {
            player.flash = false
        }
        if (!player.flash) {
            var a = document.createElement('audio')
            a.innerHTML = str
            player.appendChild(a)
        }
        else {
            var a = document.createElement('div')
            a.id = 'audio_' + player.id
            player.appendChild(a)
            var attributes = {"style": "position: absolute; top: -999px"}
            var flashvars = {"uid": "audio_" + player.id, "m": "audio", "file": mp3file};
            var params = {"id": "audio_" + player.id, "bgcolor": "#ffffff", "allowScriptAccess": "always"};
            var url = "http://popov654.pp.ru/xplayer/uppod.swf"
            embedSWF(url, "audio_" + player.id, "0", "0", flashvars, params, attributes);
        }
        this.setVolume(volume, player)
        if (startPlaying) this.play(player)
        return true;
    },

    loadPlaylist: function (pl, player, startPlaying) {
        player.playlist = []
        for (var i = 0; i < pl.length; i++) {
            if (pl[i].title && pl[i].source) {
                player.playlist.push({"title": pl[i].title, "source": pl[i].source})
            }
        }
        if (player.shuffle) {
            var n = Math.floor(Math.random() * pl.length)
            player.plPos = n
            this.loadFile(pl[n].source, player, startPlaying)
        } else {
            player.plPos = 0
            this.loadFile(pl[0].source, player, startPlaying)
        }
        if (player.titleId && document.getElementById(player.titleId)) {
            document.getElementById(player.titleId).innerHTML = player.playlist[player.plPos].title
        }
    },

    loadPlaylistJSON: function (obj, player) {
        try {
            eval('player.playlist = ' + obj.innerHTML)
        } catch (ex) {
            alert(ex);
            return false;
        }
        return true;
    },

    loadPlaylistXML: function (obj, player) {
        var children = obj.childNodes
        var elements = []
        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeType == 1) elements.push(children[i])
        }
        if (elements.length % 2 == 1) return false;
        player.playlist = []
        if (document.all && !window.opera && children[2].tagName.charAt(0) == '/') {
            if (children[0].tagName == children[4].tagName) {
                if (children[children.length / 2 - 4].tagName != children[0].tagName ||
                    children[children.length / 2].tagName == children[0].tagName) return false;
                for (var i = 0; i < children.length / 2; i += 4) {
                    player.playlist.push({
                        "title": children[i + 1].nodeValue,
                        "source": children[children.length / 2 + i + 1].nodeValue
                    })
                }
            } else {
                for (var i = 0; i < children.length; i += 8) {
                    player.playlist.push({"title": children[i + 1].nodeValue, "source": children[i + 5].nodeValue})
                }
            }
            return true;
        }
        if (elements[0].tagName == elements[1].tagName) {
            if (elements[elements.length / 2 - 1].tagName != elements[0].tagName ||
                elements[elements.length / 2].tagName == elements[0].tagName) return false;
            for (var i = 0; i < elements.length / 2; i++) {
                player.playlist.push({
                    "title": elements[i].innerHTML,
                    "source": elements[elements.length / 2 + i].innerHTML
                })
            }
        } else {
            for (var i = 0; i < elements.length; i += 2) {
                player.playlist.push({"title": elements[i].innerHTML, "source": elements[i + 1].innerHTML})
            }
        }
        return true;
    },

    prevSong: function (player) {
        if (!player.playlist || player.playlist.length == 1) return
        player.plPos--
        if (player.plPos < 0) {
            player.plPos = player.playlist.length - 1
            if (player.shuffle) {
                player.playlist_shuffled = player.playlist.slice()
                shuffle(player.playlist_shuffled)
            }
        }
        var title = player.shuffle ? player.playlist_shuffled[player.plPos].title : player.playlist[player.plPos].title
        var source = player.shuffle ? player.playlist_shuffled[player.plPos].source : player.playlist[player.plPos].source
        if (player.titleId && document.getElementById(player.titleId)) {
            document.getElementById(player.titleId).innerHTML = title
        }
        var p = player.isPlaying
        this.loadFile(source, player, p)
        this.fireEvent(player, 'prev', title, source)
    },

    nextSong: function (player) {
        if (!player.playlist || player.playlist.length == 1) return
        else if (player.getAttribute('noplaylist') == null) getElementsByClass('nowPlaying', null, 'div')[player.plPos].style.visibility = 'hidden'
        player.plPos++
        if (player.plPos == player.playlist.length) {
            player.plPos = 0
            if (player.shuffle) {
                player.playlist_shuffled = player.playlist.slice()
                shuffle(player.playlist_shuffled)
            }
        }
        var title = player.shuffle ? player.playlist_shuffled[player.plPos].title : player.playlist[player.plPos].title
        var source = player.shuffle ? player.playlist_shuffled[player.plPos].source : player.playlist[player.plPos].source
        if (player.titleId && document.getElementById(player.titleId)) {
            document.getElementById(player.titleId).innerHTML = title
        }
        var p = player.isPlaying
        this.loadFile(source, player, p)
        this.fireEvent(player, 'next', title, source)
    },

    play: function (player) {

        if (player.isPlaying && getElementsByClass('play', player, 'div')[0].style.display == 'none') return
        if (player.playlist && player.titleId && document.getElementById(player.titleId)) {
            document.getElementById(player.titleId).innerHTML = player.playlist[player.plPos].title
        }

        xPlayer.disableOtherSources(player)

        player.isPlaying = true

        var t = getElementsByClass('play', player, 'div')[0]
        if (t.style.display != 'none') {
            t.style.display = 'none'
            while (t.className != 'pause') t = t.nextSibling
            t.style.display = 'inline-block'
        }

        var title = ''
        if (player.playlist && player.playlist.length > 0) {
            title = player.shuffle ? player.playlist_shuffled[player.plPos].title : player.playlist[player.plPos].title
            if (player.getAttribute('noplaylist') == null) {
                var pos = player.plPos
                if (player.shuffle) {
                    for (var i = 0; i < player.playlist.length; i++) {
                        if (player.playlist[i].title == player.playlist_shuffled[pos].title && player.playlist[i].source == player.playlist_shuffled[pos].source) {
                            break;
                        }
                    }
                    var pos = i
                }
                getElementsByClass('nowPlaying', null, 'div')[pos].style.visibility = 'visible'
            }
        } else {
            if (player.getAttribute('songtitle') != null) title = player.getAttribute('songtitle')
        }
        var source = player.getAttribute('source')
        this.fireEvent(player, 'play', title, source)

        var t = getElementsByClass('progressScale', player, 'div')[0]
        t.timer = setInterval(function (obj) {
            return function () {
                xPlayer.updatePosition(obj)
            }
        }(t.firstChild), t.parentNode.delay)

        if (player.flash) {
            uppodSend('audio_' + player.id, 'play')
            var pos = parseFloat(t.firstChild.style.width) / 100
            xPlayer.setPosition(pos, t.parentNode)
            return;
        }
        var audio = player.getElementsByTagName('audio')[0]
        audio.play()
    },

    pause: function (player) {

        var t = getElementsByClass('pause', player, 'div')[0]
        if (t.style.display != 'none') {
            t.style.display = 'none'
            while (t.className != 'play') t = t.previousSibling
            t.style.display = 'inline-block'
        } else {
            return
        }
        var p = getElementsByClass('progressScale', player, 'div')[0]
        clearInterval(p.timer)

        this.fireEvent(player, 'pause')
        if (player.flash) {
            uppodSend('audio_' + player.id, 'pause')
            return;
        }
        var audio = player.getElementsByTagName('audio')[0]
        audio.pause()
    },

    stop: function (player) {

        if (!player.isPlaying) return
        var t = getElementsByClass('pause', player, 'div')[0]
        if (t.style.display != 'none') {
            t.style.display = 'none'
            while (t.className != 'play') t = t.previousSibling
            t.style.display = 'inline-block'
        }
        if (player.playlist && player.getAttribute('noplaylist') == null) {
            if (player.shuffle) {
                var a = getElementsByClass('nowPlaying', null, 'div')
                for (var i = 0; i < a.length; i++) {
                    a[i].style.visibility = 'hidden'
                }
            } else {
                getElementsByClass('nowPlaying', null, 'div')[player.plPos].style.visibility = 'hidden'
            }
        }

        getElementsByClass('progress', player, 'div')[0].style.marginLeft = '0%'
        var p = getElementsByClass('progressScale', player, 'div')[0]
        clearInterval(p.timer)

        player.isPlaying = false
        this.fireEvent(player, 'stop')
        if (player.flash) {
            uppodSend('audio_' + player.id, 'stop')
            uppodSend('audio_' + player.id, 'time0')
            xPlayer.storage.ticker = 0
            return;
        }
        var audio = player.getElementsByTagName('audio')[0]
        audio.pause()
        audio.currentTime = 0
    },

    setPosition: function (pos, player) {
        if (player.flash) {
            var time = uppodGet('audio_' + player.id, 'getimed')
            uppodSend('audio_' + player.id, 'seek:' + time * pos)
            if (player.clockId && document.getElementById(player.clockId)) {
                var time = Math.round(time * pos)
                var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
                document.getElementById(player.clockId).innerHTML = Math.floor(time / 60) + ':' + secs
            }
            return;
        }
        var audio = player.getElementsByTagName('audio')[0]
        audio.currentTime = audio.duration * pos
        if (player.clockId && document.getElementById(player.clockId)) {
            var time = Math.round(audio.duration * pos)
            var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
            document.getElementById(player.clockId).innerHTML = Math.floor(time / 60) + ':' + secs
        }
    },

    setVolume: function (volume, player) {

        player.volume = volume

        getElementsByClass('volume', player, 'div')[0].style.width = Number(volume * 100).toPrecision(4) + '%'

        if (player.flash) {
            uppodSend('audio_' + player.id, 'v' + Math.round(volume * 100))
            return;
        }
        var audio = player.getElementsByTagName('audio')[0]
        audio.volume = volume
    },

    updatePosition: function (obj) {
        var player = obj.parentNode.parentNode

        var currentTime = 0
        var duration = 0

        if (!player.flash) {
            var audio = player.getElementsByTagName('audio')[0]
            currentTime = audio.currentTime
            duration = audio.duration
        } else {
            currentTime = uppodGet('audio_' + player.id, 'getime')
            duration = uppodGet('audio_' + player.id, 'getimed')
            if (currentTime == 0) xPlayer.storage.ticker++
            if (document.all && !window.opera) xPlayer.storage.ticker++
            var limit = (player.delay == 1000) ? 2 : 40
            if (currentTime == 0 && xPlayer.storage.ticker > limit) currentTime = duration
        }

        if (duration == 0 || isNaN(duration) || isNaN(currentTime) || !player.isPlaying) return

        if (player.getAttribute('smoothrefresh') == null) {
            posPerc = Number((currentTime / duration * 100) - 2).toPrecision(3);
            obj.style.marginLeft = posPerc + '%'
            if (currentTime == duration || posPerc < 0)
                obj.style.marginLeft = "0%";
        } else {
            obj.style.width = Math.round(currentTime / duration * parseInt(obj.parentNode.clientWidth)) + 'px'
        }

        if (xPlayer.storage.follow) {
            var tooltip = getElementsByClass('progresstip', obj.parentNode.parentNode, 'div')[0]
            var time = Math.round(currentTime)
            var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
            tooltip.innerHTML = Math.floor(time / 60) + ':' + secs
            tooltip.style.left = (obj.parentNode.offsetLeft + obj.clientWidth - tooltip.clientWidth / 2) + 'px'
        }

        if (player.clockId && document.getElementById(player.clockId)) {
            if (xPlayer.storage.follow) {
                var tooltip = getElementsByClass('progresstip', obj.parentNode.parentNode, 'div')[0]
                document.getElementById(player.clockId).innerHTML = tooltip.innerHTML
            } else {
                var time = Math.round(currentTime)
                var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
                document.getElementById(player.clockId).innerHTML = Math.floor(time / 60) + ':' + secs
            }
        }

        var title = ''
        if (player.playlist && player.playlist.length > 0) {
            title = player.playlist[player.plPos].title
        } else {
            if (player.getAttribute('songtitle') != null) title = player.getAttribute('songtitle')
        }
        var source = player.getAttribute('source')

        if (player.delay == 50) {
            xPlayer.storage.ticker2++
            if (xPlayer.storage.ticker2 == 20) {
                this.fireEvent(player, 'progress', currentTime, duration, title, source)
                xPlayer.storage.ticker2 = 0
            }
        } else {
            this.fireEvent(player, 'progress', currentTime, duration, title, source)
        }

        if (currentTime == duration) {
            if (player.mode == this.MODE_CONT && player.plPos < player.playlist.length - 1
                || player.mode == this.MODE_CONT_REPEAT) {
                obj.style.marginLeft = "0%";
                this.nextSong(player)
                return
            }
            if (player.mode == this.MODE_REPEAT) {
                obj.style.marginLeft = "0%";
                this.stop(player)
                this.play(player)
                return
            }
            //obj.style.borderRadius = '3px'
            setTimeout(function () {
                xPlayer.stop(player)
                obj.style.marginLeft = "0%";
                var play = getElementsByClass('play', player, 'div')[0]
                var pause = getElementsByClass('pause', player, 'div')[0]
                pause.style.display = 'none'
                play.style.display = 'inline-block'
                // obj.style.borderRadius = '3px 0px 0px 3px'
            }, 400)
        }
    },

    seek: function (time, player) {

        var duration = this.getTrackDuration(player)

        if (time < 0 || time > duration) return false

        var pos = time / duration
        getElementsByClass('progress', player, 'div')[0].style.width = Number(pos * 100).toPrecision(4) + '%'
        this.setPosition(pos, player)
        return true
    },

    getTrackDuration: function (player) {

        var duration = 0

        if (!player.flash) {
            var audio = player.getElementsByTagName('audio')[0]
            duration = audio.duration
        } else {
            duration = uppodGet('audio_' + player.id, 'getimed')
        }
        return duration;

    },

    getVolume: function (player) {
        return player.volume
    },

    getKey: function () {
        var result = ''
        for (var i = 0; i < 16; i++) {
            var n = Math.floor(Math.random() * 62)
            if (n < 26) {
                result += String.fromCharCode(n + 65)
            }
            if (n >= 26 && n < 52) {
                result += String.fromCharCode(n + 71)
            }
            if (n >= 52) {
                result += String.fromCharCode(n - 4)
            }
        }
        return result
    },

    addListener: function (player, type, listener, obj) {
        var c
        if (!player) c = this.storage.listeners
        else c = player.listeners
        switch (type) {
            case 'play':
                if (c[type] == undefined) c[type] = []
                var key = this.getKey()
                var fn = function (title, source) {
                    listener.call(obj, title, source)
                }
                c[type].push({"key": key, "listener": fn})
                break;
            case 'pause':
            case 'stop':
                if (c[type] == undefined) c[type] = []
                var key = this.getKey()
                var fn = function () {
                    listener.call(obj)
                }
                c[type].push({"key": key, "listener": fn})
                break;
            case 'prev':
            case 'next':
                if (c[type] == undefined) c[type] = []
                var key = this.getKey()
                var fn = function (title, source) {
                    listener.call(obj, title, source)
                }
                c[type].push({"key": key, "listener": fn})
                break;
            case 'progress':
                if (c[type] == undefined) c[type] = []
                var key = this.getKey()
                var fn = function (time, duration, title, source) {
                    listener.call(obj, time, duration, title, source)
                }
                c[type].push({"key": key, "listener": fn})
                break;
        }
        return key
    },

    removeListener: function (player, key, type) {
        if (key == null) return false;
        var c
        if (!player) c = this.storage.listeners
        else c = player.listeners
        if (type == null) {
            for (var type in c) {
                for (var i = 0; i < c[type].length; i++) {
                    if (c[type][i] == null) continue;
                    if (c[type][i].key == key) {
                        c[type][i] = null;
                        return true;
                    }
                }
            }
        } else {
            for (var i = 0; i < c[type].length; i++) {
                if (c[type][i] == null) continue;
                if (c[type][i].key == key) {
                    c[type][i] = null;
                    return true;
                }
            }
        }
        return false;
    },

    fireEvent: function (player, type) {
        var args = Array.prototype.slice.call(arguments, 2)

        c = player.listeners
        if (c[type] != undefined) {
            for (var i = 0; i < c[type].length; i++) {
                if (c[type][i] == null) continue;
                c[type][i].listener.apply(null, args)
            }
        }

        c = this.storage.listeners
        if (c[type] != undefined) {
            for (var i = 0; i < c[type].length; i++) {
                if (c[type][i] == null) continue;
                c[type][i].listener.apply(null, args)
            }
        }
    },


    createPlayer: function (obj) {

        if (obj.getAttribute('shuffle') != null) obj.shuffle = true

        if (getElementsByClass('playlist', obj, null).length > 0) {
            var playlist = getElementsByClass('playlist', obj, null)[0]
            if (playlist.getAttribute('type') == "xml") this.loadPlaylistXML(playlist, obj)
            else if (playlist.getAttribute('type') == "json") this.loadPlaylistJSON(playlist, obj)
            if (obj.playlist && obj.playlist.length > 0) {
                obj.plPos = 0
                if (obj.shuffle) {
                    obj.playlist_shuffled = obj.playlist.slice()
                    shuffle(player.playlist_shuffled)
                    obj.setAttribute('source', obj.playlist_shuffled[obj.plPos].source)
                } else {
                    obj.setAttribute('source', obj.playlist[obj.plPos].source)
                }
            }
        }
        var playlists = getElementsByClass('playlist', obj, null)
        for (var i = 0; i < playlists.length; i++) obj.removeChild(playlists[i])

        var re = /\s*;\s*/
        var sources = obj.getAttribute('source').split(re)
        var str = ''
        var mp3file = ''
        var audio = document.createElement("audio");
        if (audio == null && !audio.canPlayType) obj.flash = true
        var supported = false
        for (var i = 0; i < sources.length; i++) {
            str += '<source src="' + sources[i] + '" />\r\n'
            var type = sources[i].slice(sources[i].lastIndexOf('.') + 1)
            if (audio.canPlayType && audio.canPlayType('audio/' + type)) supported = true
            if (type == 'mp3') mp3file = sources[i]
        }
        if (!supported || obj.getAttribute('flash') != null) {
            if (mp3file == '') {
                if (!supported) return false;
                else obj.flash = false
            } else {
                obj.flash = true
            }
        } else {
            obj.flash = false
        }
        obj.style.height = '19px'
        obj.innerHTML = '<div class="play"></div>\r\n\
   <div class="pause"></div>\r\n\
   <div class="stop"></div>\r\n\
   <div class="progressScale"><div class="progress"></div><div style="width: 100%; height: 1px; background: #c0c0c0; margin-top: 6px"></div></div>\r\n\
   <div class="volumeScale"><div class="volume"></div></div>\r\n\
   <div class="progresstip xt1 xbottomArrow">0:00</div>\r\n\
   <div class="volumetip xt1 xbottomArrow">50%</div>\r\n'
        if (!obj.flash) obj.innerHTML += '<audio>' + str + '</audio>'
        else {
            obj.innerHTML += '<div id="audio_' + obj.id + '"></div>'
            var attributes = {"style": "position: absolute; top: -999px"}
            var flashvars = {"uid": "audio_" + obj.id, "m": "audio", "file": mp3file};
            var params = {"id": "audio_" + obj.id, "bgcolor": "#ffffff", "allowScriptAccess": "always"};
            var url = "modules/asterisk/uppod.swf"
            embedSWF(url, "audio_" + obj.id, "0", "0", flashvars, params, attributes);
        }
        obj.mode = this.MODE_NORMAL
        obj.isPlaying = false

        obj.playlistHeight = 0

        if (obj.playlist && obj.getAttribute('noplaylist') == null) {
            var pl = document.createElement('div')
            var pl_c = document.createElement('div')
            var b = document.createElement('div')
            b.className = 'scrollBar'
            pl.className = 'playlistView'
            pl_c.className = 'playlistContents'
            for (var i = 0; i < obj.playlist.length; i++) {
                var pl_el = document.createElement('div')
                pl_el.className = 'trackItem'
                pl_el.innerHTML = '<div class="nowPlaying"></div>' + obj.playlist[i].title
                pl_c.appendChild(pl_el)
                pl_el.onclick = function (player, pos) {
                    return function () {
                        getElementsByClass('nowPlaying', null, 'div')[player.plPos].style.visibility = 'hidden'
                        if (player.shuffle) {
                            for (var i = 0; i < player.playlist.length; i++) {
                                if (player.playlist_shuffled[i].title == player.playlist[pos].title && player.playlist_shuffled[i].source == player.playlist[pos].source) {
                                    break;
                                }
                            }
                            player.plPos = i
                        } else {
                            player.plPos = pos
                        }
                        xPlayer.loadFile(player.playlist[pos].source, player, true)
                    }
                }(obj, i)
            }

            function setPlaylistHeight() {
                var height = obj.playlist.length * getElementsByClass('trackItem', obj, 'div')[0].clientHeight
                if (!isNaN(parseInt(obj.getAttribute('height')))) {
                    obj.playlistHeight = parseInt(obj.getAttribute('height')) - 48
                } else if (obj.getAttribute('height') == 'auto') {
                    obj.playlistHeight = height
                    obj.style.height = height + 48 + 'px'
                }
                if (obj.playlistHeight > 78 && !obj.getAttribute('height')) {
                    obj.playlistHeight = 78
                }
                pl.style.height = obj.playlistHeight - 4 + 'px'
                if (obj.playlistHeight < height) {
                    pl_c.style.right = '3px'
                } else {
                    pl_c.style.right = '0px'
                    b.style.display = 'none'
                }
            }

            pl.appendChild(pl_c)
            pl_c.style.top = '0px'
            pl.appendChild(b)
            obj.appendChild(pl)
            setPlaylistHeight()
            addWheelHandler(pl)

            var sbh = (pl.clientHeight / pl_c.clientHeight) * (pl.clientHeight - 4)
            var sbt = 2
            b.style.height = sbh + 'px'
            b.style.top = sbt + 'px'
        }

        obj.delay = (obj.getAttribute('smoothrefresh') != null) ? 50 : 1000

        obj.listeners = {}

        if (obj.getAttribute('titleid')) obj.titleId = obj.getAttribute('titleid')
        if (obj.getAttribute('clockid')) obj.clockId = obj.getAttribute('clockid')

        if (obj.getAttribute('maincolor')) this.setMainColor(obj.getAttribute('maincolor'), obj)
        if (obj.getAttribute('scalecolor')) this.setScaleColor(obj.getAttribute('scalecolor'), obj)

        if (!obj.getAttribute('maincolor')) {
            if (obj.getAttribute('tooltipcolor')) {
                this.setTooltipColor('#c0c0c0', obj.getAttribute('tooltipcolor'), obj)
            } else {
                this.setTooltipColor('#c0c0c0', '#fff', obj)
            }
        }


        var _play = getElementsByClass('play', obj, 'div')[0]
        var _pause = getElementsByClass('pause', obj, 'div')[0]
        var _stop = getElementsByClass('stop', obj, 'div')[0]
        var ps = getElementsByClass('progressScale', obj, 'div')[0]
        var vs = getElementsByClass('volumeScale', obj, 'div')[0]


        var st = obj.currentStyle || getComputedStyle(obj, '')
        if (st.position == 'absolute' || st.position == 'fixed') {
            _play.style.position = 'absolute'
            _play.style.top = '8px'
            _play.style.marginTop = '0px'
            _pause.style.position = 'absolute'
            _pause.style.top = '9px'
            _pause.style.marginTop = '0px'
            _stop.style.position = 'absolute'
            _stop.style.left = '41px'
            _stop.style.top = '9px'
            _stop.style.marginTop = '0px'

            if (obj.playlist && obj.getAttribute('noplaylist') == null) {
                _play.style.top = '9px'
                _pause.style.top = '10px'
                _stop.style.top = '10px'
                ps.style.top = vs.style.top = '14px'
            }
        } else if (st.position != 'relative') {
            obj.style.position = 'relative'
            if (obj.playlist && obj.getAttribute('noplaylist') == null) {
                _play.style.marginTop = '9px'
                _pause.style.marginTop = '9px'
                _stop.style.marginTop = '9px'
                ps.style.top = vs.style.top = '14px'
            }
        }

        if (obj.getAttribute('playliststyle')) {
            var rules = obj.getAttribute('playliststyle').split(',')
            var pl = getElementsByClass('playlistView', obj, 'div')[0]
            for (var i = 0; i < rules.length; i++) {
                pl.style[rules[i].split(':')[0]] = rules[i].split(':')[1]
            }
        }
        if (obj.getAttribute('trackstyle')) {
            var rules = obj.getAttribute('trackstyle').split(',')
            var pl = getElementsByClass('playlistView', obj, 'div')[0]
            var els = getElementsByClass('trackItem', pl, 'div')
            for (var j = 0; j < els.length; j++) {
                var f = function () {
                }
                var g = function () {
                }
                for (var i = 0; i < rules.length; i++) {
                    if (rules[i].split(':')[0].indexOf('hover-') == 0) {
                        els[j].onmouseover = function (rule, content, func) {
                            return function () {
                                func()
                                this.style[rule] = content
                                if (rule == 'background' || rule == 'background-color') {
                                    var el = getElementsByClass('nowPlaying', this, 'div')[0]
                                    el.style.borderTop = '3px solid ' + content
                                    el.style.borderBottom = '3px solid ' + content
                                }
                            }
                        }(rules[i].split(':')[0].slice(6), rules[i].split(':')[1], f)
                        f = els[j].onmouseover

                        var old_val = ''
                        if (els[j].style[rules[i].split(':')[0].slice(6)] != '') {
                            old_val = els[j].style[rules[i].split(':')[0].slice(6)]
                        }
                        els[j].onmouseout = function (rule, content, func) {
                            return function () {
                                func()
                                this.style[rule] = content
                                if (rule == 'background' || rule == 'background-color') {
                                    var el = getElementsByClass('nowPlaying', this, 'div')[0]
                                    var bg = getBackgroundColor(el.parentNode)
                                    el.style.borderTop = '3px solid ' + bg
                                    el.style.borderBottom = '3px solid ' + bg
                                }
                            }
                        }(rules[i].split(':')[0].slice(6), old_val, g)
                        g = els[j].onmouseout
                    } else {
                        els[j].style[rules[i].split(':')[0]] = rules[i].split(':')[1]
                    }
                }
            }
        }
        if (obj.getAttribute('pointercolor')) {
            this.setPointerColor(obj.getAttribute('pointercolor'), obj)
        }
        if (obj.getAttribute('scrollbarcolor')) {
            this.setScrollbarColor(obj.getAttribute('scrollbarcolor'), obj)
        }

        if (document.all && !window.opera && document.compatMode != 'CSS1Compat') {
            var el = getElementsByClass('progressScale', obj, 'div')[0]
            el.style.width = parseInt(el.parentNode.clientWidth) - parseInt(el.currentStyle.right) - parseInt(el.currentStyle.left) + 'px'
        }

        if (obj.titleId && document.getElementById(obj.titleId)) {
            if (obj.playlist && obj.playlist.length > 0) {
                document.getElementById(obj.titleId).innerHTML = obj.playlist[obj.plPos].title
            } else if (obj.getAttribute('songtitle')) {
                document.getElementById(obj.titleId).innerHTML = obj.getAttribute('songtitle')
            }
        }


        var bgcol = getBackgroundColor(obj)

        //  _play.style.borderBottom = '7px solid ' + bgcol
        //  _play.style.borderTop = '7px solid ' + bgcol

        var h1 = 7, h2 = 2
        if (obj.getAttribute('zoomfactor') != null || obj.getAttribute('buttonsheight') || obj.getAttribute('scalesheight')) {
            if (obj.getAttribute('zoomfactor') != null) {
                var z = parseFloat(obj.getAttribute('zoomfactor'))
                var z2 = z
                h1 *= z
                h2 *= z
                var bh = 13 * z
                var sh = 4 * z
            } else {
                var bh = parseInt(obj.getAttribute('buttonsheight')) || 13
                var sh = parseInt(obj.getAttribute('scalesheight')) || 4
                var z = bh / 13
                var z2 = sh / 4
                var bh2 = Math.round(bh / 2)
                var sh2 = Math.round(sh / 2)
            }
            var s1 = bh
            var s2 = Math.round(bh / 2)
            var s3 = Math.round((4 / 13) * bh)
            var s4 = Math.round((5 / 13) * bh)
            var s5 = bh
            var s6 = sh
            var x1 = 4 + Math.round(z * 12)
            var x2 = x1 + bh + Math.round(z * 11) + 3
            var x3 = x2 + bh + Math.round(z * 13) + 4

            var top = Math.round((height - bh) / 2)

            var c = 8 * ((bh - 13) / 13)
            if (bh == 13) s1 = 14
            var volWidth = Math.round(z2 * 28)
            if (volWidth < 52) volWidth = 52
            if (obj.getAttribute('volwidth')) volWidth = obj.getAttribute('volwidth')

            var height = bh > sh ? bh + 20 : sh + 20
            if (!obj.getAttribute('height')) obj.style.height = height + 'px'
            var st = _stop.currentStyle || getComputedStyle(_stop, '')
            var col = st.backgroundColor
            _play.style.borderLeft = s1 + 'px solid ' + col
            _play.style.borderBottom = s2 + 'px solid ' + bgcol
            _play.style.borderTop = s2 + 'px solid ' + bgcol

            _play.style.top = top + 'px'
            _pause.style.top = top + 'px'
            _stop.style.top = top + 'px'
            _pause.style.borderLeft = s3 + 'px solid ' + col
            _pause.style.borderRight = s3 + 'px solid ' + col
            _pause.style.width = s4 + 'px'
            _pause.style.height = s5 + 'px'
            _stop.style.width = s5 + 'px'
            _stop.style.height = s5 + 'px'
            _play.style.left = x1 + 'px'
            _pause.style.left = x1 + 'px'
            _stop.style.left = x2 + 'px'
            ps.style.height = s6 + 'px'
            vs.style.height = s6 + 'px'
            ps.style.left = x3 + 'px'
            ps.style.right = Math.round(33 + c + volWidth) + 'px'
            ps.style.top = vs.style.top = Math.round((height - sh) / 2) + 'px'
            vs.style.width = volWidth + 'px'

            var zz = z > z2 ? z : z2
            var ht = -12 + (height / 2 - sh2 - 14) - Math.ceil(zz)
            var pt = getElementsByClass('progresstip', obj, 'div')[0]
            var vt = getElementsByClass('volumetip', obj, 'div')[0]
            pt.style.top = vt.style.top = ht + 'px'
            pt.style.fontSize = vt.style.fontSize = Math.round(12 + Math.ceil(zz)) + 'px'

            var zoom = true

            if (document.all && !window.opera && document.compatMode != 'CSS1Compat') {
                _play.style.height = s5 + 'px'
                _play.style.height = s5 + 'px'
                _pause.style.width = s5 + 'px'
                ps.style.height = (s6 + 1) + 'px'
                vs.style.height = (s6 + 1) + 'px'
                ps.firstChild.style.height = s6 + 'px'
                vs.firstChild.style.height = s6 + 'px'
            }
            if (detectIE() != -1 && detectIE() < 9) {
                _play.style.top = _pause.style.top = _stop.style.top = Math.round((60 - bh) / 2) + 'px'
                var gap = Math.round(z * 10)
            }
        }

        if (obj.getAttribute('height') && (detectIE() == -1 || detectIE() > 8)) {
            var h = parseInt(obj.getAttribute('height'))
            obj.style.height = h + 'px'
            var bh2 = Math.round(bh / 2)
            var sh2 = Math.round(sh / 2)
            _play.style.top = Math.round(h / 2) - bh2 + 'px'
            _pause.style.top = Math.round(h / 2) - bh2 + 'px'
            _stop.style.top = Math.round(h / 2) - bh2 + 'px'
            ps.style.top = Math.round(h / 2) - sh2 + 'px'
            vs.style.top = Math.round(h / 2) - sh2 + 'px'
            var ht = Math.round(h / 2) - sh2 - 25
            getElementsByClass('progresstip', obj, 'div')[0].style.top = ht + 'px'
            getElementsByClass('volumetip', obj, 'div')[0].style.top = ht + 'px'
        }

        if (obj.getAttribute('volwidth')) {
            var vw = obj.getAttribute('volwidth')
            ps.style.right = Math.round(33 + vw) + 'px'
            vs.style.width = vw + 'px'
        }

        if ((detectIE() == -1 || detectIE() > 8) && obj.hasAttribute('noroundtips')) {
            getElementsByClass('progresstip', obj, 'div')[0].style.borderRadius = '0px'
            getElementsByClass('volumetip', obj, 'div')[0].style.borderRadius = '0px'
        }

        _pause.style.display = 'none'

        this.setVolume(0.5, obj)

        _play.onclick = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            xPlayer.play(t.parentNode)
        }

        _pause.onclick = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            xPlayer.pause(t.parentNode)
        }

        _stop.onclick = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            xPlayer.stop(t.parentNode)
        }

        ps.onmousedown = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode
            clearInterval(t.timer)
            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            var w = Number(x / t.clientWidth * 100).toPrecision(4)
            t.firstChild.style.width = w + '%'
            xPlayer.storage.drag = true
            if (e.preventDefault) e.preventDefault()
        }
        ps.onmousemove = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode
            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            if (xPlayer.storage.drag) {
                var w = Number(x / t.clientWidth * 100).toPrecision(4)
                t.firstChild.style.width = w + '%'
            }

            var tooltip = getElementsByClass('progresstip', t.parentNode, 'div')[0]
            var duration = t.parentNode.flash ? uppodGet('audio_' + t.parentNode.id, 'getimed') : t.parentNode.getElementsByTagName('audio')[0].duration
            var time = Math.round(x / t.clientWidth * duration)
            var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
            tooltip.innerHTML = Math.floor(time / 60) + ':' + secs
            if (xPlayer.storage.drag) {
                tooltip.style.left = (t.offsetLeft + t.firstChild.clientWidth - tooltip.clientWidth / 2) + 'px'
            } else {
                tooltip.style.left = (e.clientX - getOffsetRect(t.parentNode).left - tooltip.clientWidth / 2) + 'px'
            }
            xPlayer.storage.follow = false
            clearTimeout(xPlayer.storage.timer)
            if (!xPlayer.storage.drag) xPlayer.storage.timer = setTimeout(function () {
                xPlayer.storage.follow = true
            }, 1500)
        }
        ps.onmouseup = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode
            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            xPlayer.setPosition(x / t.clientWidth, t.parentNode)
            xPlayer.storage.drag = false

            var p = t
            while (p.className != 'pause') p = p.previousSibling
            if (p.style.display != 'none') {
                t.timer = setInterval(function (obj) {
                    return function () {
                        xPlayer.updatePosition(obj)
                    }
                }(t.firstChild), t.parentNode.delay)
            }
        }
        ps.onmouseover = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode

            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            var tooltip = getElementsByClass('progresstip', t.parentNode, 'div')[0]
            var duration = t.parentNode.flash ? uppodGet('audio_' + t.parentNode.id, 'getimed') : t.parentNode.getElementsByTagName('audio')[0].duration
            var time = Math.round(x / t.clientWidth * duration)
            var secs = (time % 60 < 10) ? ('0' + time % 60) : (time % 60)
            tooltip.innerHTML = Math.floor(time / 60) + ':' + secs
            tooltip.style.display = 'block'
        }
        ps.onmouseout = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode

            var tooltip = getElementsByClass('progresstip', t.parentNode, 'div')[0]
            tooltip.style.display = 'none'
            clearTimeout(xPlayer.storage.timer)
            xPlayer.storage.follow = false
        }


        vs.onmousedown = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode
            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            if (x > t.clientWidth) x = t.clientWidth
            var n = 2
            if (x == t.clientWidth) n = 3
            var w = Number(x / t.clientWidth * 100).toPrecision(4)
            t.firstChild.style.width = w + '%'

            var tooltip = getElementsByClass('volumetip', t.parentNode, 'div')[0]
            tooltip.innerHTML = Number(x / t.clientWidth * 100).toPrecision(n) + '%'

            xPlayer.setVolume(x / t.clientWidth, t.parentNode)
            xPlayer.storage.drag = true
            if (e.preventDefault) e.preventDefault()
        }
        vs.onmousemove = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode
            var x = e.clientX + getBodyScrollLeft() - getOffsetRect(t).left
            if (x > t.clientWidth) x = t.clientWidth
            if (xPlayer.storage.drag) {
                var w = Number(x / t.clientWidth * 100).toPrecision(4)
                t.firstChild.style.width = w + '%'
                xPlayer.setVolume(x / t.clientWidth, t.parentNode)
            }

            var tooltip = getElementsByClass('volumetip', t.parentNode, 'div')[0]
            var n = 2
            if (x == t.clientWidth) {
                n = 3
                if (parseInt(t.firstChild.style.width) == 100) t.firstChild.style.borderRadius = '3px'
            } else {
                t.firstChild.style.borderRadius = '3px 0px 0px 3px'
            }
            tooltip.innerHTML = Number(x / t.clientWidth * 100).toPrecision(n) + '%'
            if (xPlayer.storage.drag) {
                tooltip.style.left = (t.offsetLeft + t.firstChild.clientWidth - tooltip.clientWidth / 2) + 'px'
            } else {
                tooltip.style.left = (e.clientX + getBodyScrollLeft() - getOffsetRect(t.parentNode).left - tooltip.clientWidth / 2) + 'px'
            }
        }
        vs.onmouseup = function (event) {
            xPlayer.storage.drag = false
        }
        vs.onmouseover = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode

            var tooltip = getElementsByClass('volumetip', t.parentNode, 'div')[0]
            tooltip.style.display = 'block'
        }
        vs.onmouseout = function (event) {
            var e = event || window.event
            var t = e.target || e.srcElement
            if (t.className.indexOf('Scale') == -1) t = t.parentNode

            var tooltip = getElementsByClass('volumetip', t.parentNode, 'div')[0]
            tooltip.style.display = 'none'
        }
    },

    writeCSS: function () {
        var gap = 10
        if (!window.opera) gap = 9
        var st = document.createElement('style')
        var str = '.play {\r\n\
     position: absolute;\r\n\
     width: 19px;\r\n\
     height: 19px;\r\n\
     top: 0px;\r\n\
     left: 0px;\r\n\
     cursor: pointer;\r\n\
     background: url("images/play.png");\r\n\
}\r\n\
.stop {\r\n\
     position: absolute;\r\n\
     width: 13px;\r\n\
     height: 13px;\r\n\
     background: #5873A3;\r\n\
     top: 0px;\r\n\
     left: 43px;\r\n\
     cursor: pointer;\r\n\
     display: none;\r\n\
}\r\n\
.pause {\r\n\
     position: absolute;\r\n\
     width: 19px;\r\n\
     height: 19px;\r\n\
     top: 0px;\r\n\
     left: 0px;\r\n\
     cursor: pointer;\r\n\
     background: url("images/pause.png");\r\n\
}\r\n\
.progressScale {\r\n\
     background: transparent;\r\n\
     width: auto;\r\n\
     height: 12px;\r\n\
     /*border: 1px solid transparent;*/\r\n\
     border-radius: 3px;\r\n\
     cursor: pointer;\r\n\
     position: absolute;\r\n\
     left: 25px;\r\n\
     right: 81px;\r\n\
     top: 3px;\r\n\
}\r\n\
.volumeScale {\r\n\
     background: #ccc;\r\n\
     width: 48px;\r\n\
     height: 4px;\r\n\
     border: 1px solid transparent;\r\n\
     border-radius: 3px;\r\n\
     cursor: pointer;\r\n\
     position: absolute;\r\n\
     right: ' + (gap + 3) + 'px;\r\n\
     top: 13px;\r\n\
     display: none;\r\n\
}\r\n\
.progress {\r\n\
     position: absolute;\r\n\
     left: 0px;\r\n\
     top: 2px;\r\n\
     height: 9px;\r\n\
     background: #777;\r\n\
     max-width: 1px;\r\n\
     width: 1px;\r\n\
    /* border-radius: 3px 0px 0px 3px;*/\r\n\
     cursor: pointer;\r\n\
}\r\n\
.volume {\r\n\
     position: absolute;\r\n\
     left: 0px;\r\n\
     top: 0px;\r\n\
     height: 100%;\r\n\
     width: 50%;\r\n\
     background: #5873A3;\r\n\
     border-radius: 3px 0px 0px 3px;\r\n\
     cursor: pointer;\r\n\
}\r\n\
.progresstip, .volumetip {\r\n\
     display: none;\r\n\
     border: 1px solid #c0c0c0;\r\n\
     border-radius: 2px;\r\n\
     padding: 1px 2px 1px 2px;\r\n\
     color: #c0c0c0;\r\n\
     font-family: Arial, Sans-Serif;\r\n\
     font-size: 10px;\r\n\
     position: absolute;\r\n\
     top: -18px;\r\n\
}\r\n\
.playlistView {\r\n\
     display: block;\r\n\
     border: 1px solid #5873A3;\r\n\
     border-radius: 3px;\r\n\
     padding: 2px 0px;\r\n\
     color: #5873A3;\r\n\
     font-family: Arial, Sans-Serif;\r\n\
     font-size: 12px;\r\n\
     position: absolute;\r\n\
     top: 36px;\r\n\
     bottom: 10px;\r\n\
     left : 10px;\r\n\
     right: 10px;\r\n\
     overflow: hidden;\r\n\
}\r\n\
.playlistContents {\r\n\
     position: absolute;\r\n\
     left:0px;\r\n\
     right:3px;\r\n\
}\r\n\
.scrollBar {\r\n\
     position: absolute;\r\n\
     right: 2px;\r\n\
     width: 4px;\r\n\
     background: #5873A3;\r\n\
     border-radius: 2px;\r\n\
}\r\n\
.trackItem {\r\n\
     padding: 2px 18px 2px 3px;\r\n\
     cursor: default;\r\n\
}\r\n\
.nowPlaying {\r\n\
     display: inline-block;\r\n\
     width: 0px;\r\n\
     height: 0px;\r\n\
     border-left: 6px solid #5873A3;\r\n\
     border-right: 0;\r\n\
     border-bottom: 3px solid white;\r\n\
     border-top: 3px solid white;\r\n\
     margin: 1px 4px;\r\n\
     visibility: hidden;\r\n\
}\r\n\
@-moz-document url-prefix() {\r\n\
.pause {\r\n\
     /*margin-top: 9px;*/\r\n\
     margin-right: 10px;\r\n\
}}\r\n'
        if (detectIE() != -1 && detectIE() < 9) str += '.play {\r\n\
     position: absolute;\r\n\
     top: 9px;\r\n\
     left: ' + (gap + 3) + 'px;\r\n\
}\r\n\
.stop {\r\n\
     position: absolute;\r\n\
     top: 2px;\r\n\
     left: ' + (2 * gap + 21) + 'px;\r\n\
}\r\n\
.pause {\r\n\
     position: absolute;\r\n\
     top: 2px;\r\n\
     left: ' + (gap - 9) + 'px;\r\n\
}\r\n'
        if (document.all && !window.opera && document.compatMode != 'CSS1Compat') str += '.play {\r\n\
     width: 14px;\r\n\
     height: 14px;\r\n\
     overflow: hidden;\r\n\
}\r\n\
.stop {\r\n\
     overflow: hidden;\r\n\
}\r\n\
.pause {\r\n\
     width: 13px;\r\n\
     height: 13px;\r\n\
     overflow: hidden;\r\n\
}\r\n\
.progressScale {\r\n\
     height: 6px;\r\n\
}\r\n\
.volumeScale {\r\n\
     height: 6px;\r\n\
}\r\n\
.progress {\r\n\
     height: 1px;\r\n\
     overflow: hidden;\r\n\
}\r\n\
.volume {\r\n\
     height: 4px;\r\n\
     overflow: hidden;\r\n\
}\r\n'
        if (detectIE() > 0 && detectIE() < 8 && document.compatMode == 'CSS1Compat') str += '.play {\r\n\
     width: 1px;\r\n\
     height: 1px;\r\n\
}\r\n'
        st.innerHTML = str
        document.head.appendChild(st)
    },

    storage: {drag: false, follow: false, timer: null, ticker: 0, ticker2: 0, listeners: {}},

    init: function (id, cl) {
        this.writeCSS()
        if (id.length) {
            var players = document.getElementsByTagName('div')
            for (var i = 0; i < players.length; i++) {
                if (players[i].id.indexOf(id) == 0) {
                    this.createPlayer(players[i])
                }
            }
        }
        if (cl.length) {
            var players = getElementsByClass(cl, null, 'div')
            for (var i = 0; i < players.length; i++) {
                this.createPlayer(players[i])
            }
        }
        document.onmouseup = function (event) {
            xPlayer.storage.drag = false;
            var e = event || window.event
            var t = e.target || e.srcElement
            var current = null
            if (t.className == ('progress')) {
                current = getElementsByClass('progresstip', t.parentNode.parentNode, 'div')[0]
            }
            if (t.className == ('volume')) {
                current = getElementsByClass('volumetip', t.parentNode.parentNode, 'div')[0]
            }

            var els = getElementsByClass('volumetip', null, 'div')

            for (var i = 0; i < els.length; i++) {
                if (current && current == els[i]) continue
                els[i].style.display = 'none'
            }

            var els = getElementsByClass('progresstip', null, 'div')

            for (var i = 0; i < els.length; i++) {
                if (current && current == els[i]) continue
                els[i].style.display = 'none'
            }
        }
    }

}

function detectIE() {
    var agent = navigator.userAgent.toLowerCase()
    var i = agent.indexOf('msie')
    if (i != -1) return parseFloat(agent.slice(i + 5))
    return -1
}

// Commands

function uppodSend(playerID, com, callback) {
    if (!document.getElementById(playerID) || !document.getElementById(playerID).sendToUppod) {
        setTimeout(function () {
            uppodSend(playerID, com, callback)
        }, 10)
        return
    }
    document.getElementById(playerID).sendToUppod(com);
}

// Requests

function uppodGet(playerID, com, callback) {
    if (!document.getElementById(playerID) || !document.getElementById(playerID).getUppod) {
        return null
    }
    return document.getElementById(playerID).getUppod(com);
}