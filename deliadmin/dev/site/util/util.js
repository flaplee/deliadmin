'use strict';
define(['common/kernel/kernel'], function(kernel) {
    var util = {
        ajaxSubmit: function(param) {
            var xhr = new XMLHttpRequest(),
                type = param.type || 'post',
                url = param.url
            if (type === 'get' && param.data) {
                var strArr = []
                for (var key in param.data) {
                    if (param.data.hasOwnProperty(key)) {
                        strArr.push(key + '=' + param.data[key])
                    }
                }
                url = url + '?' + strArr.join('&')
            }
            xhr.open(type, url, true);
            if (!param.data) {
                param.data = {};
            }
            xhr.onreadystatechange = function() {
                var s;
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        try {
                            s = JSON.parse(xhr.responseText);
                        } catch (e) {}
                        if (s) {
                            if (s.ret == 200) {
                                if (typeof param.success === 'function') {
                                    param.success(s);
                                }
                            } else {
                                if (typeof param.error === 'function') {
                                    param.error(s);
                                } else if (!param.silent) {
                                    kernel.hint(s.msg, 'error');
                                }
                                if (s.ret === 402) {
                                    util.setSsid('');
                                }
                            }
                        } else {
                            if (typeof param.error === 'function') {
                                param.error(xhr, 'parse_error');
                            } else if (!param.silent) {
                                kernel.hint('数据解析失败: ' + xhr.responseText, 'error');
                            }
                        }
                    } else {
                        if (typeof param.error === 'function') {
                            param.error(xhr, 'network_error');
                        } else if (!param.silent) {
                            kernel.hint('网络或服务器错误: ' + xhr.status, 'error');
                        }
                    }
                    if (typeof param.complete === 'function') {
                        param.complete(xhr);
                    }
                    if (!param.silent) {
                        kernel.hideLoading();
                    }
                }
            };
            if (param.data instanceof FormData) {
                //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                xhr.send(param.data);
            } else {
                xhr.setRequestHeader('content-type', 'application/json');
                xhr.send(JSON.stringify(param.data));
            }
            if (!param.silent) {
                kernel.showLoading();
            }
        },
        moneyFormat: function(money, refix, precision, n) {
            var prefix;
            if (isFinite(money)) {
                money = parseFloat(money);
            } else {
                money = 0;
            }
            if (money < 0) {
                money = money * -1;
                prefix = '-';
            }
            if (refix) {
                if (money >= 10000 * 10000) {
                    money = toFloat(money / (10000 * 10000), precision) + '亿';
                } else if (money >= 10000) {
                    money = toFloat(money / 10000, precision) + '万';
                } else {
                    money = toFloat(money, precision);
                }
            } else {
                money = splitMoney(toFloat(money, precision), isFinite(n) ? n : 3);
            }
            if (prefix && parseFloat(money) > 0) {
                money = prefix + money;
            }
            return money;

            function splitMoney(money, n) {
                var i, tmp = money.split('.');
                n = parseInt(n);
                if (tmp.length > 1) {
                    money = '.' + tmp[1];
                } else {
                    money = '';
                }
                for (i = 0; i < tmp[0].length; i += n) {
                    if (i < tmp[0].length - n) {
                        money = ',' + tmp[0].substr(-n - i, n) + money;
                    } else {
                        money = tmp[0].substr(0, tmp[0].length - i) + money;
                    }
                }
                return money;
            }

            function toFloat(money, precision) {
                if (!isFinite(precision)) {
                    if (money % 1) {
                        precision = 2;
                    } else {
                        precision = 0;
                    }
                }
                var i, p = Math.pow(10, precision);
                money = (Math.round(money * p) / p).toString();
                if (precision > 0) {
                    i = money.split('.')[1];
                    for (i = i ? i.length : 0; i < precision; i++) {
                        if (i === 0) {
                            money += '.';
                        }
                        money += '0';
                    }
                }
                return money;
            }
        },
        formatDate: function(time) {
            if (time <= 0) return '';
            var t, y, m, d, h, i, s;
            t = new Date(time * 1000);
            y = t.getFullYear();
            m = t.getMonth() + 1;
            if (m < 10) m = '0' + m;
            d = t.getDate();
            if (d < 10) d = '0' + d;
            return y + '-' + m + '-' + d;
        },
        formatTime: function(time) {
            if (time <= 0) return '';
            var t, y, m, d, h, i, s;
            t = new Date(time * 1000);
            y = t.getFullYear();
            m = t.getMonth() + 1;
            if (m < 10) m = '0' + m;
            d = t.getDate();
            if (d < 10) d = '0' + d;
            h = t.getHours();
            if (h < 10) h = '0' + h;
            i = t.getMinutes();
            if (i < 10) i = '0' + i;
            s = t.getSeconds();
            if (s < 10) s = '0' + s;
            return y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
        },
        formatObj: function(r, need) {
            /**
             * 传入对象
             * r.obj 需要显示的字段
             * r.loan 字段值
             *
             * 由于后端返回时间戳类型为字符串故使用正则判断是否为时间，字段名中含date或time并且是十位数字会认为是时间戳
             *
             * 返回格式化后数组，使用for循环即可
             */
            var arr = [],
                obj = {},
                key
            for (key in r.obj) {
                if (r.obj.hasOwnProperty(key)) {
                    if (/time|expire$/.test(key) && /^\d{10}$/.test(r.loan[key])) {
                        arr.push({
                            title: r.obj[key].title,
                            content: util.formatTime(r.loan[key])
                        })
                    } else if (/date$/.test(key) && /^\d{10}$/.test(r.loan[key])) {
                        arr.push({
                            title: r.obj[key].title,
                            content: util.formatDate(r.loan[key])
                        })
                    } else {
                        if (r.obj[key].type === 'select') {
                            if (!/car_brand|car_model|car_series/.test(key)) {
                                r.loan[key] = r.obj[key].stype[r.loan[key]];
                                r.loan[key] = r.loan[key] ? r.loan[key] : '暂无数据';
                            }
                        } else if (r.obj[key].type === 'checkbox') {
                            r.loan[key] = typeof r.loan[key] == 'String' ? r.loan[key].split(',') : [];

                            if (r.loan[key].length > 0) {
                                var i = 0;
                                while (i < r.loan[key].length) {
                                    if (!r.obj[key].stype.hasOwnProperty(r.loan[key][i])) {
                                        r.loan[key].splice(i, 1);
                                    } else {
                                        r.loan[key][i] = r.obj[key].stype[r.loan[key][i]];
                                        i++;
                                    }
                                }
                                r.loan[key] = r.loan[key].join(', ');
                            } else {
                                r.loan[key] = '暂无数据'
                            }
                        } else {
                            if (/[\(（]元/.test(r.obj[key].title)) {
                                if (r.loan[key]) {
                                    r.loan[key] = util.moneyFormat(r.loan[key], true);
                                } else {
                                    r.loan[key] = '暂无数据'
                                }
                            } else {
                                if (!r.loan[key] || r.loan[key] == '') {
                                    r.loan[key] = '暂无数据'
                                }
                            }
                        }
                        arr.push({
                            title: r.obj[key].title,
                            content: r.loan[key] ? r.loan[key] : '暂无数据'
                        })
                    }
                }
            }
            if (need === 'object') {
                var j
                for (j = 0; j < arr.length; j++) {
                    obj[arr[j].title] = arr[j].content
                }
                return obj
            }
            return arr
        },
        setImgCat: function(r, attr) {
            /**
             * r: 数据
             * attr: 数据对应标签信息
             * 返回对象：src: 图片地址, title: 图片标题
             */
            var _imgList = [],
                images = [],
                imgName = []
            for (var key in r) {
                if (r.hasOwnProperty(key)) {
                    if (/_img$/.test(key) && attr[key]['get'] == 1) {
                        _imgList.push(r[key])
                        imgName.push(attr[key]['title'])
                    }
                }
            }
            for (var i = 0; i < _imgList.length; i++) {
                var _arr = _imgList[i].split(',')
                for (var j = 0; j < _arr.length; j++) {
                    images.push({
                        src: _arr[j],
                        title: imgName[i]
                    })
                }
            }
            return images
        },
        setFormData: function(dom, a, r) {
            /**
             *
             * 用于格式化表单，并赋值
             * dom, 需要操作的form节点
             * a, 对象, 接口返回的attributes
             * r, 接口返回的数据（可不传）
             *
             */
            var k, t
            for (k in a) {
                if (a.hasOwnProperty(k)) {
                    dom.find('.' + k + ' input, .' + k + ' select').prop('required', !!a[k].required)
                    if (a[k].stype.toString() === '[object Object]') {
                        dom.find('.' + k + ' .select').html('')
                        for (t in a[k].stype) {
                            dom.find('.' + k + ' .select').append('<option value="' + t + '">' + a[k].stype[t] + '</option>')
                        }
                    }
                }
            }
            if (r) {
                for (k in a) {
                    if (a.hasOwnProperty(k)) {
                        dom.find('.' + k + ' input, .' + k + ' select, .' + k + ' textarea').val(r[k])
                            //                      if (a[k].stype.toString() === '[object Object]') {
                            //                          dom.find('.' + k + ' .select').val(a[k].stype[r[k]])
                            //                      }
                    }
                }
            }
        },
        getFormData: function(dom, a) {
            /**
             *
             * dom, 获取数据form的节点
             * a, 对象, 接口返回的attributes
             *
             * @return 传入dom值的对象
             *
             */
            var k, t, val, data = {}
            for (k in a) {
                if (a.hasOwnProperty(k) && !dom.find('.' + k + ' input, .' + k + ' textarea, .' + k + ' select').is(':hidden')) {
                    val = dom.find('.' + k + ' input, .' + k + ' textarea').val()
                    data[k] = (val === undefined ? '' : val)
                    if (a[k].stype.toString() === '[object Object]') {
                        for (t in a[k].stype) {
                            data[k] = dom.find('.' + k + ' input, .' + k + ' select').val()
                        }
                    }
                }
            }
            return data
        },
        formatTimeDiff: function(time, min) {
            var i, a, u,
                s = [Math.floor(time / (3600 * 24)), Math.floor(time / 3600) % 24, Math.floor(time / 60) % 60, Math.floor(time) % 60];
            if (min) {
                u = ['天', '小时', '分钟', '秒'];
                for (i = 0; i < s.length; i++) {
                    if (s[i] > 0) {
                        return s[i] + u[i];
                    }
                }
                return '刚才';
            } else {
                u = ['天', '时', '分', '秒'];
                a = false;
                for (i = 0; i < s.length; i++) {
                    if (!a) {
                        if (s[i] > 0) {
                            s[i] = s[i] + u[i];
                            a = true;
                        } else {
                            s[i] = '';
                        }
                    } else {
                        s[i] += u[i];
                    }
                }
                return s.join('');
            }
        },
        formatCreditType: function(val) {
            var text;
            if (val == "") {
                text = "--"
            }
            if (val == "0201") {
                text = "全款车"
            }
            if (val == "0202") {
                text = "按揭车"
            }
            return text;
        },
        formatCheckStatus: function(val) {
            var thisStatus = {
                1: '草稿',
                2: '无效',
                3: '审核失败',
                11: '待审核',
                12: '待发布',
                13: '发布中',
                21: '竞拍中',
                31: '成功结束',
                32: '流拍结束',
                41: '等待付清尾款',
                42: '付款成功'
            }
            return thisStatus[val];
        },
        formatCashStatus: function(val) {
            var thisStatus = {
                1: '失败',
                2: '无效',
                11: '充值中',
                12: '待确认',
                21: '充值成功'
            }
            return thisStatus[val];
        },
        isNullObj: function(obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        },
        setDisabledClass: function(o, disable) {
            if (disable) {
                o.addClass('disabled');
            } else {
                o.removeClass('disabled');
            }
        },
        setCookie: function(c_name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            var c_value = escape(value) + '; path=/' + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = c_name + "=" + c_value;
        },
        getCookie: function(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
        },
        clone: function(d) {
            var result;
            var s = $.type(d);
            if (s === 'date') {
                result = new Date(d.valueOf());
            } else if (s === 'regexp') {
                s = '';
                if (d.ignoreCase) {
                    s += 'i';
                }
                if (d.multiline) {
                    s += 'm';
                }
                if (d.global) {
                    s += 'g';
                }
                if (d.sticky) {
                    s += 'y';
                }
                if (d.unicode) {
                    s += 'u';
                }
                result = RegExp(d.source, s);
            } else if (s === 'error') {
                if (d.name === 'RangeError') {
                    result = RangeError(d.message);
                } else if (d.name === 'ReferenceError') {
                    result = ReferenceError(d.message);
                } else if (d.name === 'SyntaxError') {
                    result = SyntaxError(d.message);
                } else if (d.name === 'TypeError') {
                    result = TypeError(d.message);
                } else if (d.name === 'URIError') {
                    result = URIError(d.message);
                } else {
                    result = Error(d.message);
                }
            } else if (s === 'array') {
                result = [];
                for (s = 0; s < d.length; s++) {
                    result[s] = util.clone(d[s]);
                }
            } else if (s === 'object') {
                result = {};
                for (s in d) {
                    result[s] = util.clone(d[s]);
                }
            } else {
                result = d;
            }
            return result;
        },
        isEqual: function(o1, o2) {
            var t = $.type(o1),
                n;
            if (t === $.type(o2)) {
                if (t === 'object') {
                    if (Object.keys(o1).length === Object.keys(o2).length) {
                        for (n in o1) {
                            if (!(n in o2) || !util.isEqual(o1[n], o2[n])) {
                                return false;
                            }
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else if (t === 'array') {
                    if (o1.length === o2.length) {
                        for (n = 0; n < o1.length; n++) {
                            if (!util.isEqual(o1[n], o2[n])) {
                                return false;
                            }
                        }
                        return true;
                    } else {
                        return false;
                    }
                } else if (t === 'regexp') {
                    return o1.source === o2.source && o1.global === o2.global && o1.ignoreCase === o2.ignoreCase && o1.multiline === o2.multiline && o1.sticky === o2.sticky && o1.unicode === o2.unicode;
                } else if (t === 'error') {
                    return o1.message = o2.message && o1.name === o2.name;
                } else if (t === 'date') {
                    return o1.valueOf() === o2.valueOf();
                } else {
                    return o1 === o2;
                }
            } else {
                return false;
            }
        },
        paging: function(dom, currentpage, listnum, pagenum) {
            var total, first, last, previous, next, i, k, j, item;
            if (listnum > pagenum) {
                dom.find('.item').remove();
                dom.find('a').off('click');
                dom.find('.listnum').text(listnum)
                total = Math.ceil(listnum / pagenum);
                first = dom.find('.first');
                last = dom.find('.last');
                previous = dom.find('.previous');
                next = dom.find('.next');
                if (currentpage == 1) {
                    first.addClass('disabled');
                    previous.addClass('disabled');
                } else {
                    first.removeClass('disabled');
                    first.on('click', function() {
                        var loc = util.clone(kernel.location);
                        loc.args.p = 1;
                        location.assign(kernel.buildHash(loc));
                    });
                    previous.removeClass('disabled');
                    previous.on('click', function() {
                        var loc = util.clone(kernel.location);
                        loc.args.p = currentpage - 1;
                        location.assign(kernel.buildHash(loc));
                    });
                }
                if (currentpage == total) {
                    last.addClass('disabled');
                    next.addClass('disabled');
                } else {
                    last.removeClass('disabled');
                    last.on('click', function() {
                        var loc = util.clone(kernel.location);
                        loc.args.p = total;
                        location.assign(kernel.buildHash(loc));
                    });
                    next.removeClass('disabled');
                    next.on('click', function() {
                        var loc = util.clone(kernel.location);
                        loc.args.p = currentpage + 1;
                        location.assign(kernel.buildHash(loc));
                    });
                }
                j = Math.max(currentpage - 5, 1);
                k = Math.min(currentpage + 4, total);
                while (k - j < 9 && (j > 1 || k < total)) {
                    if (j > 1) {
                        j--;
                    } else {
                        k++;
                    }
                }
                for (i = j; i <= k; i++) {
                    item = $('<a href="javascript:;" class="item">' + i + '</a>');
                    if (i == currentpage) {
                        item.addClass('active');
                    }
                    item.on('click', pageItemClick);
                    next.before(item);
                }
                dom.css('display', '');
            } else {
                dom.css('display', 'none');
            }
        }
    };
    ! function() {
        var userData;
        //当账号数据发生变化时请使用此接口传入新的数据
        //传入undefined表示账号已退出登录
        util.setUserData = function(data) {
            if (!util.isEqual(userData, data)) {
                userData = data;
                if (data) {
                    if (util.userEvents.ondatachange instanceof Function) {
                        util.userEvents.ondatachange({
                            type: 'datachange',
                            data: data
                        });
                    }
                }
            }
        };
        util.getUserData = function() {
            return userData;
        };
        //当用户数据发生变化时请使用此接口传入新的数据
        //传入''表示用户已退出登录
        util.setSsid = function(newssid) {
            if (util.ssid !== newssid) {
                util.ssid = newssid;
                util.setCookie('ssid', newssid);
                if (typeof util.userEvents.onstatechange === 'function') {
                    util.userEvents.onstatechange({
                        type: 'statechange'
                    });
                }
            }
        };
        //从服务器获取最新的账号数据
        util.updateUserData = function(callback) {
            util.ajaxSubmit({
                url: '/auth',
                silent: true,
                complete: function(xhr, msg) {
                    var json, i;
                    try {
                        json = $.parseJSON(xhr.responseText);
                        if (json.data) {
                            // change 20017-10-12
                            util.setUserData(json.data.list);
                            if (json.data.list.change_passwd < 1) {
                                kernel.openPopup('changepass', true);
                            }
                        }
                    } catch (e) {}
                    if (typeof callback === 'function') {
                        callback(util.clone(userData));
                    }
                }
            });
        };
        util.ssid = util.getCookie('ssid');
        //用于监视账号登录状态或者属性变化
        //此接口中的事件需要用 kernel.listeners.add来监控
        // kernel.listeners.add(util.userEvents,'statechange',yourlistener);
        util.userEvents = {};
    }();
    ! function() {
        util.setDefaultValue = function(data) {
            var n, i;
            if (data.attributes) {
                if (!data.list) {
                    data.list = {};
                }
                for (n in data.attributes) {
                    if (!data.list[n]) {
                        data.list[n] = {};
                    }
                    if ($.type(data.list[n]) === 'array') {
                        for (i = 0; i < data.list[n].length; i++) {
                            setDef(data.attributes[n], data.list[n][i]);
                        }
                    } else {
                        setDef(data.attributes[n], data.list[n]);
                    }
                }
            }
        };
        util.getCheckboxValue = function(ctn, sel) {
            var i, v = [],
                l = ctn.find('input[type=checkbox]' + (sel ? sel : '') + ':enabled:checked');
            for (i = 0; i < l.length; i++) {
                v.push(l[i].value);
            }
            return v.join(',');
        };
        util.setCheckboxValue = function(ctn, sel, v) {
            var i,
                l = ctn.find('input[type=checkbox]' + (sel ? sel : ''));
            for (i = 0; i < l.length; i++) {
                l[i].checked = v.indexOf(l[i].value) >= 0;
            }
        };
        util.getRadioValue = function(ctn, name) {
            return ctn.find('input[type=radio][name=' + name + ']:enabled:checked').val();
        };
        util.setRadioValue = function(ctn, name, v) {
            ctn.find('input[type=radio][name=' + name + '][value=' + v + ']').prop('checked', true);
        };
        util.getInputValue = function(ctn, sel) {
            return ctn.find(sel + ':enabled').val();
        };
        util.makeOptions = function(stype) {
            var n, r = '';
            for (n in stype) {
                r += '<option value="' + n + '">' + stype[n] + '</option>';
            }
            return r;
        }

        function setDef(attr, data) {
            var n;
            for (n in attr) {
                if (attr[n].type === 'checkbox') {
                    if (data[n]) {
                        data[n] = data[n].split(',');
                    } else if (attr[n].des) {
                        data[n] = attr[n].des.split(',');
                    } else {
                        data[n] = [];
                    }
                } else if (attr[n].type === 'select') {
                    if (!(data[n] in attr[n].stype)) {
                        data[n] = attr[n].des || Object.keys(attr[n].stype)[0];
                    }
                } else {
                    if (data[n] === undefined || data[n] === null) {
                        data[n] = attr[n].des;
                    }
                }
            }
        }
    }();
    return util;

    function pageItemClick() {
        var loc = util.clone(kernel.location);
        loc.args.p = this.firstChild.data;
        location.assign(kernel.buildHash(loc));
    }
});