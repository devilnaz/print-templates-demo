function str_replace(search, replace, subject) {
    if (subject !== null && subject !== undefined) return subject.split(search).join(replace);
}

function fulltrim(str) {
    str = str + ""; // Привидение типа
    return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
}

function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    str = str + ""; // Привидение типа
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    str = str + ""; // Привидение типа
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

function explode(delimiter, string) { // Split a string by string
                                      //
                                      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                                      // +   improved by: kenneth
                                      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    var emptyArray = {0: ''};

    if (arguments.length != 2
        || typeof arguments[0] == 'undefined'
        || typeof arguments[1] == 'undefined') {
        return null;
    }

    if (delimiter === ''
        || delimiter === false
        || delimiter === null) {
        return false;
    }

    if (typeof delimiter == 'function'
        || typeof delimiter == 'object'
        || typeof string == 'function'
        || typeof string == 'object') {
        return emptyArray;
    }

    if (delimiter === true) {
        delimiter = '1';
    }

    return string.toString().split(delimiter.toString());
}

function in_array(needle, haystack, strict) {   // Checks if a value exists in an array
    //
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)

    var found = false, key, strict = !!strict;

    for (key in haystack) {
        if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
            found = true;
            break;
        }
    }

    return found;
}

function strtr(str, from, to) {
    var fr = '', i = 0,
        j = 0,
        lenStr = 0,
        lenFrom = 0,
        tmpStrictForIn = false, fromTypeStr = '',
        toTypeStr = '',
        istr = '';
    var tmpFrom = [];
    var tmpTo = [];
    var ret = '';
    var match = false;

    // Received replace_pairs?
    // Convert to normal from->to chars
    if (typeof from === 'object') {
        tmpStrictForIn = this.ini_set('phpjs.strictForIn', false); // Not thread-safe; temporarily set to true
        from = this.krsort(from);
        this.ini_set('phpjs.strictForIn', tmpStrictForIn);
        for (fr in from) {
            if (from.hasOwnProperty(fr)) {
                tmpFrom.push(fr);
                tmpTo.push(from[fr]);
            }
        }

        from = tmpFrom;
        to = tmpTo;
    }
    // Walk through subject and replace chars when needed
    lenStr = str.length;
    lenFrom = from.length;
    fromTypeStr = typeof from === 'string';
    toTypeStr = typeof to === 'string';

    for (i = 0; i < lenStr; i++) {
        match = false;
        if (fromTypeStr) {
            istr = str.charAt(i);
            for (j = 0; j < lenFrom; j++) {
                if (istr == from.charAt(j)) {
                    match = true;
                    break;
                }
            }
        } else {
            for (j = 0; j < lenFrom; j++) {
                if (str.substr(i, from[j].length) == from[j]) {
                    match = true;
                    // Fast forward
                    i = (i + from[j].length) - 1;
                    break;
                }
            }
        }
        if (match) {
            ret += toTypeStr ? to.charAt(j) : to[j];
        } else {
            ret += str.charAt(i);
        }
    }
    return ret;
}

function utf2eng(str) {
    var utf = new Array("а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ь", "ы", "э", "ю", "я", "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ь", "Ъ", "Ы", "Э", "Ю", "Я");
    var eng = new Array("a", "b", "v", "g", "d", "e", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "h", "c", "ch", "sh", "sch", "", "", "y", "e", "yu", "ya", "A", "B", "V", "G", "D", "E", "E", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "H", "C", "Ch", "Sh", "Sch", "", "", "Y", "E", "Yu", "Ya");
    var sim = new Array("`", "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "=", "[", "]", "{", "}", ":", ";", "\"", "'", "|", "\\", "/", "?", ",", ".", "<", ">", "№", " ");
    for (var key in utf) {
        var r_ch = utf[key];
        var e_ch = eng[key];
        str = str.replace(new RegExp(r_ch, 'g'), e_ch);
    }
    for (var key in sim) {
        var s_ch = sim[key];
        var new_str = str.replace(s_ch, "_");
        while (new_str != str) {
            str = new_str;
            new_str = str.replace(s_ch, "_");
        }
    }
    str = str.replace(/__/g, '_');
    return trim(str, "_");
}

function getPos(ob) { // позиция курсора в поле ввода
    if (document.selection) {
        var r = document.selection.createRange().duplicate()
        r.moveEnd('character', ob.value.length)
        if (r.text == '') return ob.value.length
        return ob.value.lastIndexOf(r.text)
    } else return ob.selectionStart
}

function is_digit(str) // только числа
{
    var reg = /[^0-9]/g;
    return !reg.test(str);
}

function is_digit_defis(str) // два числа через дефис: 1-3
{
    var reg = /^[0-9]+\-[0-9]+$/g;
    return reg.test(str);
}

function is_list(str) // наличие символа ]   
{
    var reg = /\]/;
    return reg.test(str);
}

function htmlspecialchars(str) // Преобразование спец. символов в строке
{
    str = str_replace("&", "&amp;", str);
    str = str_replace("\"", "&quot;", str);
    str = str_replace("'", "&apos;", str);
    str = str_replace("<", "&lt;", str);
    str = str_replace(">", "&gt;", str);
    return str;
}

function htmlspecialchars_decode(str) // Обратное преобразование спец. символов в строке
{
    str = str_replace("&amp;", "&", str);
    str = str_replace("&quot;", "\"", str);
    str = str_replace("&apos;", "'", str);
    str = str_replace("&#039;", "'", str);
    str = str_replace("&lt;", "<", str);
    str = str_replace("&gt;", ">", str);
    return str;
}

function nl2br(str) // Переводы строк в <br/>
{
    var enterType;
    if (str.indexOf("\r\n") >= 0)
        enterType = "\r\n"; // Win
    else if (str.indexOf("\n") >= 0)
        enterType = "\n"; // Unix
    else if (str.indexOf("\r") >= 0)
        enterType = "\r"; // Mac
    else // Enter not found
        return str;

    return str_replace(enterType, "<br/>", str);
}

function ksort(inputArr, sort_flags) {
    // http://kevin.vanzonneveld.net
    // +   original by: GeekFG (http://geekfg.blogspot.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %          note 1: The examples are correct, this is a new way
    // %        note 2: This function deviates from PHP in returning a copy of the array instead
    // %        note 2: of acting by reference and returning true; this was necessary because
    // %        note 2: IE does not allow deleting and re-adding of properties without caching
    // %        note 2: of property position; you can set the ini of "phpjs.strictForIn" to true to
    // %        note 2: get the PHP behavior, but use this only if you are in an environment
    // %        note 2: such as Firefox extensions where for-in iteration order is fixed and true
    // %        note 2: property deletion is supported. Note that we intend to implement the PHP
    // %        note 2: behavior by default if IE ever does allow it; only gives shallow copy since
    // %        note 2: is by reference in PHP anyways
    // %        note 3: Since JS objects' keys are always strings, and (the
    // %        note 3: default) SORT_REGULAR flag distinguishes by key type,
    // %        note 3: if the content is a numeric string, we treat the
    // %        note 3: "original type" as numeric.
    // -    depends on: i18n_loc_get_default
    // -    depends on: strnatcmp
    // *     example 1: data = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: data = ksort(data);
    // *     results 1: {a: 'orange', b: 'banana', c: 'apple', d: 'lemon'}
    // *     example 2: ini_set('phpjs.strictForIn', true);
    // *     example 2: data = {2: 'van', 3: 'Zonneveld', 1: 'Kevin'};
    // *     example 2: ksort(data);
    // *     results 2: data == {1: 'Kevin', 2: 'van', 3: 'Zonneveld'}
    // *     returns 2: true
    var tmp_arr = {},
        keys = [],
        sorter, i, k, that = this,
        strictForIn = false,
        populateArr = {};

    switch (sort_flags) {
        case 'SORT_STRING':
            // compare items as strings
            sorter = function (a, b) {
                return that.strnatcmp(a, b);
            };
            break;
        case 'SORT_LOCALE_STRING':
            // compare items as strings, based on the current locale (set with  i18n_loc_set_default() as of PHP6)
            var loc = this.i18n_loc_get_default();
            sorter = this.php_js.i18nLocales[loc].sorting;
            break;
        case 'SORT_NUMERIC':
            // compare items numerically
            sorter = function (a, b) {
                return ((a + 0) - (b + 0));
            };
            break;
        // case 'SORT_REGULAR': // compare items normally (don't change types)
        default:
            sorter = function (a, b) {
                var aFloat = parseFloat(a),
                    bFloat = parseFloat(b),
                    aNumeric = aFloat + '' === a,
                    bNumeric = bFloat + '' === b;
                if (aNumeric && bNumeric) {
                    return aFloat > bFloat ? 1 : aFloat < bFloat ? -1 : 0;
                } else if (aNumeric && !bNumeric) {
                    return 1;
                } else if (!aNumeric && bNumeric) {
                    return -1;
                }
                return a > b ? 1 : a < b ? -1 : 0;
            };
            break;
    }

    // Make a list of key names
    for (k in inputArr) {
        if (inputArr.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    keys.sort(sorter);

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;

    // Rebuild array with sorted key names
    for (i = 0; i < keys.length; i++) {
        k = keys[i];
        tmp_arr[k] = inputArr[k];
        if (strictForIn) {
            delete inputArr[k];
        }
    }
    for (i in tmp_arr) {
        if (tmp_arr.hasOwnProperty(i)) {
            populateArr[i] = tmp_arr[i];
        }
    }

    return strictForIn || populateArr;
}

function usort(inputArr, sorter) {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: This function deviates from PHP in returning a copy of the array instead
    // %        note 1: of acting by reference and returning true; this was necessary because
    // %        note 1: IE does not allow deleting and re-adding of properties without caching
    // %        note 1: of property position; you can set the ini of "phpjs.strictForIn" to true to
    // %        note 1: get the PHP behavior, but use this only if you are in an environment
    // %        note 1: such as Firefox extensions where for-in iteration order is fixed and true
    // %        note 1: property deletion is supported. Note that we intend to implement the PHP
    // %        note 1: behavior by default if IE ever does allow it; only gives shallow copy since
    // %        note 1: is by reference in PHP anyways
    // *     example 1: stuff = {d: '3', a: '1', b: '11', c: '4'};
    // *     example 1: stuff = usort(stuff, function (a, b) {return(a-b);});
    // *     results 1: stuff = {0: '1', 1: '3', 2: '4', 3: '11'};
    var valArr = [],
        k = '',
        i = 0,
        strictForIn = false,
        populateArr = {};

    if (typeof sorter === 'string') {
        sorter = this[sorter];
    } else if (Object.prototype.toString.call(sorter) === '[object Array]') {
        sorter = this[sorter[0]][sorter[1]];
    }

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;


    for (k in inputArr) { // Get key and value arrays
        if (inputArr.hasOwnProperty(k)) {
            valArr.push(inputArr[k]);
            if (strictForIn) {
                delete inputArr[k];
            }
        }
    }
    try {
        valArr.sort(sorter);
    } catch (e) {
        return false;
    }
    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        populateArr[i] = valArr[i];
    }

    return strictForIn || populateArr;
}

function uasort(inputArr, sorter) {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // %        note 1: This function deviates from PHP in returning a copy of the array instead
    // %        note 1: of acting by reference and returning true; this was necessary because
    // %        note 1: IE does not allow deleting and re-adding of properties without caching
    // %        note 1: of property position; you can set the ini of "phpjs.strictForIn" to true to
    // %        note 1: get the PHP behavior, but use this only if you are in an environment
    // %        note 1: such as Firefox extensions where for-in iteration order is fixed and true
    // %        note 1: property deletion is supported. Note that we intend to implement the PHP
    // %        note 1: behavior by default if IE ever does allow it; only gives shallow copy since
    // %        note 1: is by reference in PHP anyways
    // *     example 1: fruits = {d: 'lemon', a: 'orange', b: 'banana', c: 'apple'};
    // *     example 1: fruits = uasort(fruits, function (a, b) { if (a > b) {return 1;}if (a < b) {return -1;} return 0;});
    // *     results 1: fruits == {c: 'apple', b: 'banana', d: 'lemon', a: 'orange'}
    var valArr = [],
        tempKeyVal, tempValue, ret, k = '',
        i = 0,
        strictForIn = false,
        populateArr = {};

    if (typeof sorter === 'string') {
        sorter = this[sorter];
    } else if (Object.prototype.toString.call(sorter) === '[object Array]') {
        sorter = this[sorter[0]][sorter[1]];
    }

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT
    strictForIn = this.php_js.ini['phpjs.strictForIn'] && this.php_js.ini['phpjs.strictForIn'].local_value && this.php_js.ini['phpjs.strictForIn'].local_value !== 'off';
    populateArr = strictForIn ? inputArr : populateArr;


    for (k in inputArr) { // Get key and value arrays
        if (inputArr.hasOwnProperty(k)) {
            valArr.push([k, inputArr[k]]);
            if (strictForIn) {
                delete inputArr[k];
            }
        }
    }
    valArr.sort(function (a, b) {
        return sorter(a[1], b[1]);
    });

    for (i = 0; i < valArr.length; i++) { // Repopulate the old array
        populateArr[valArr[i][0]] = valArr[i][1];
    }

    return strictForIn || populateArr;
}


function date(format, timestamp) { // Format a local time/date
                                   //
                                   // +   original by: Carlos R. L. Rodrigues
                                   // +    parts by: Peter-Paul Koch (http://www.quirksmode.org/js/beat.html)
                                   // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                                   // +   improved by: MeEtc (http://yass.meetcweb.com)
                                   // +   improved by: Brad Touesnard

    var a, jsdate = new Date(timestamp ? timestamp * 1000 : null);
    var pad = function (n, c) {
        if ((n = n + "").length < c) {
            return new Array(++c - n.length).join("0") + n;
        } else {
            return n;
        }
    };
    var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday",
        "Thursday", "Friday", "Saturday"];
    var txt_ordin = {1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st"};
    var txt_months = ["", "January", "February", "March", "April",
        "May", "June", "July", "August", "September", "October", "November",
        "December"];

    var f = {
        // Day
        d: function () {
            return pad(f.j(), 2);
        },
        D: function () {
            t = f.l();
            return t.substr(0, 3);
        },
        j: function () {
            return jsdate.getDate();
        },
        l: function () {
            return txt_weekdays[f.w()];
        },
        N: function () {
            return f.w() + 1;
        },
        S: function () {
            return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
        },
        w: function () {
            return jsdate.getDay();
        },
        z: function () {
            return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
        },

        // Week
        W: function () {
            var a = f.z(), b = 364 + f.L() - a;
            var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

            if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
                return 1;
            } else {

                if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
                    nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
                    return date("W", Math.round(nd2.getTime() / 1000));
                } else {
                    return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
                }
            }
        },

        // Month
        F: function () {
            return txt_months[f.n()];
        },
        m: function () {
            return pad(f.n(), 2);
        },
        M: function () {
            t = f.F();
            return t.substr(0, 3);
        },
        n: function () {
            return jsdate.getMonth() + 1;
        },
        t: function () {
            var n;
            if ((n = jsdate.getMonth() + 1) == 2) {
                return 28 + f.L();
            } else {
                if (n & 1 && n < 8 || !(n & 1) && n > 7) {
                    return 31;
                } else {
                    return 30;
                }
            }
        },

        // Year
        L: function () {
            var y = f.Y();
            return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
        },
        //o not supported yet
        Y: function () {
            return jsdate.getFullYear();
        },
        y: function () {
            return (jsdate.getFullYear() + "").slice(2);
        },

        // Time
        a: function () {
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () {
            return f.a().toUpperCase();
        },
        B: function () {
            // peter paul koch:
            var off = (jsdate.getTimezoneOffset() + 60) * 60;
            var theSeconds = (jsdate.getHours() * 3600) +
                (jsdate.getMinutes() * 60) +
                jsdate.getSeconds() + off;
            var beat = Math.floor(theSeconds / 86.4);
            if (beat > 1000) beat -= 1000;
            if (beat < 0) beat += 1000;
            if ((String(beat)).length == 1) beat = "00" + beat;
            if ((String(beat)).length == 2) beat = "0" + beat;
            return beat;
        },
        g: function () {
            return jsdate.getHours() % 12 || 12;
        },
        G: function () {
            return jsdate.getHours();
        },
        h: function () {
            return pad(f.g(), 2);
        },
        H: function () {
            return pad(jsdate.getHours(), 2);
        },
        i: function () {
            return pad(jsdate.getMinutes(), 2);
        },
        s: function () {
            return pad(jsdate.getSeconds(), 2);
        },
        //u not supported yet

        // Timezone
        //e not supported yet
        //I not supported yet
        O: function () {
            var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
            if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
            return t;
        },
        P: function () {
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        //T not supported yet
        //Z not supported yet

        // Full Date/Time
        c: function () {
            return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
        },
        //r not supported yet
        U: function () {
            return Math.round(jsdate.getTime() / 1000);
        }
    };

    return format.replace(/[\\]?([a-zA-Z])/g, function (t, s) {
        if (t != s) {
            // escaped
            ret = s;
        } else if (f[s]) {
            // a date function exists
            ret = f[s]();
        } else {
            // nothing special
            ret = s;
        }

        return ret;
    });
}

function strtotime(text, now) {
    // Convert string representation of date and time to a timestamp
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/strtotime
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // +   improved by: Caio Ariede (http://caioariede.com)
    // +   bugfixed by: Wagner B. Soares
    // +   bugfixed by: Artur Tchernychev
    // +   improved by: A. Matías Quezada (http://amatiasq.com)
    // +   improved by: preuter
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600
    var parsed, match, year, date, days, ranges, len, times, regex, i;

    if (!text) {
        return null;
    }

    // Unecessary spaces
    text = text.trim()
        .replace(/\s{2,}/g, ' ')
        .replace(/[\t\r\n]/g, '')
        .toLowerCase();

    if (text === 'now') {
        return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
    }
    if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000 | 0;
    }
    if (text === 'now') {
        return new Date().getTime() / 1000; // Return seconds, not milli-seconds
    }
    if (!isNaN(parsed = Date.parse(text))) {
        return parsed / 1000;
    }

    match = text.match(/^(\d{2,4})-(\d{2})-(\d{2})(?:\s(\d{1,2}):(\d{2})(?::\d{2})?)?(?:\.(\d+)?)?$/);
    if (match) {
        year = match[1] >= 0 && match[1] <= 69 ? +match[1] + 2000 : match[1];
        return new Date(year, parseInt(match[2], 10) - 1, match[3],
                match[4] || 0, match[5] || 0, match[6] || 0, match[7] || 0) / 1000;
    }

    date = now ? new Date(now * 1000) : new Date();
    days = {
        'sun': 0,
        'mon': 1,
        'tue': 2,
        'wed': 3,
        'thu': 4,
        'fri': 5,
        'sat': 6
    };
    ranges = {
        'yea': 'FullYear',
        'mon': 'Month',
        'day': 'Date',
        'hou': 'Hours',
        'min': 'Minutes',
        'sec': 'Seconds'
    };

    function lastNext(type, range, modifier) {
        var diff, day = days[range];

        if (typeof day !== 'undefined') {
            diff = day - date.getDay();

            if (diff === 0) {
                diff = 7 * modifier;
            }
            else if (diff > 0 && type === 'last') {
                diff -= 7;
            }
            else if (diff < 0 && type === 'next') {
                diff += 7;
            }

            date.setDate(date.getDate() + diff);
        }
    }

    function process(val) {
        var splt = val.split(' '), // Todo: Reconcile this with regex using \s, taking into account browser issues with split and regexes
            type = splt[0],
            range = splt[1].substring(0, 3),
            typeIsNumber = /\d+/.test(type),
            ago = splt[2] === 'ago',
            num = (type === 'last' ? -1 : 1) * (ago ? -1 : 1);

        if (typeIsNumber) {
            num *= parseInt(type, 10);
        }

        if (ranges.hasOwnProperty(range) && !splt[1].match(/^mon(day|\.)?$/i)) {
            return date['set' + ranges[range]](date['get' + ranges[range]]() + num);
        }
        if (range === 'wee') {
            return date.setDate(date.getDate() + (num * 7));
        }

        if (type === 'next' || type === 'last') {
            lastNext(type, range, num);
        }
        else if (!typeIsNumber) {
            return false;
        }
        return true;
    }

    times = '(years?|months?|weeks?|days?|hours?|minutes?|min|seconds?|sec' +
        '|sunday|sun\\.?|monday|mon\\.?|tuesday|tue\\.?|wednesday|wed\\.?' +
        '|thursday|thu\\.?|friday|fri\\.?|saturday|sat\\.?)';
    regex = '([+-]?\\d+\\s' + times + '|' + '(last|next)\\s' + times + ')(\\sago)?';

    match = text.match(new RegExp(regex, 'gi'));
    if (!match) {
        return false;
    }

    for (i = 0, len = match.length; i < len; i++) {
        if (!process(match[i])) {
            return false;
        }
    }

    // ECMAScript 5 only
    //if (!match.every(process))
    //    return false;

    return (date.getTime() / 1000);
}

function mktime() {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: baris ozdil
    // +      input by: gabriel paderni
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: FGFEmperor
    // +      input by: Yannoo
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: jakes
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Marc Palau
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: 3D-GRAF
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Chris
    // +    revised by: Theriault
    // %        note 1: The return values of the following examples are
    // %        note 1: received only if your system's timezone is UTC.
    // *     example 1: mktime(14, 10, 2, 2, 1, 2008);
    // *     returns 1: 1201875002
    // *     example 2: mktime(0, 0, 0, 0, 1, 2008);
    // *     returns 2: 1196467200
    // *     example 3: make = mktime();
    // *     example 3: td = new Date();
    // *     example 3: real = Math.floor(td.getTime() / 1000);
    // *     example 3: diff = (real - make);
    // *     results 3: diff < 5
    // *     example 4: mktime(0, 0, 0, 13, 1, 1997)
    // *     returns 4: 883612800
    // *     example 5: mktime(0, 0, 0, 1, 1, 1998)
    // *     returns 5: 883612800
    // *     example 6: mktime(0, 0, 0, 1, 1, 98)
    // *     returns 6: 883612800
    // *     example 7: mktime(23, 59, 59, 13, 0, 2010)
    // *     returns 7: 1293839999
    // *     example 8: mktime(0, 0, -1, 1, 1, 1970)
    // *     returns 8: -1
    var d = new Date(),
        r = arguments,
        i = 0,
        e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

    for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
            r[i] = d['get' + e[i]]();
            r[i] += (i === 3); // +1 to fix JS months.
        } else {
            r[i] = parseInt(r[i], 10);
            if (isNaN(r[i])) {
                return false;
            }
        }
    }

    // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
    r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);

    // Set year, month (-1 to fix JS months), and date.
    // !This must come before the call to setHours!
    d.setFullYear(r[5], r[3] - 1, r[4]);

    // Set hours, minutes, and seconds.
    d.setHours(r[0], r[1], r[2]);

    // Divide milliseconds by 1000 to return seconds and drop decimal.
    // Add 1 second if negative or it'll be off from PHP by 1 second.
    return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}

function strip_tags(str) { // Strip HTML and PHP tags from a string
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    return str.replace(/<\/?[^>]+>/gi, '');
}