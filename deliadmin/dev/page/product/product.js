'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPage = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPage),
        attrdata,
        rowParam = {};

    /* 产品列表 */
    var productList = function(key_search, currentpage) {
        var loc = kernel.parseHash(location.hash);
        var html;
        $(".table .tbody").html('');
        util.ajaxSubmit({
            url: "product/page",
            data: {
                'currentpage': currentpage,
                pdata: {
                    'key_search': key_search
                }
            },
            success: function(obj) {
                util.setDefaultValue(obj.data);
                var data = obj.data.list;
                if (data != null && data.length > 0) {
                    for (var i = 0, len = data.length; i < len; i++) {
                        html += "<tr class='selectRow' data-id=" + data[i].id + ">\
                                <td>" + data[i].id + "</td>\
                                <td>" + data[i].realname + "</td>\
                                <td>" + data[i].id_card + "</td>\
                                <td>" + data[i].product_name + "</td>\
                                <td>" + data[i].id + "</td>\
                                <td>" + data[i].id + "</td>\
                                <td>" + data[i].id +"</td>\
                                <td>" + data[i].id + "</td>\
                            </tr>";
                    }
                    $(".table .tbody").html(html);
                } else {
                    html = "<tr class='center'><td colspan=10>暂无数据</td></tr>";
                    $(".table .tbody").html(html);
                }
                util.paging(dom.find('.paging'), obj.data.currentpage, obj.data.listnum, obj.data.pagenum);
            },
            error: function() {
                html = "<tr class='center'><td colspan=10>数据加载失败</td></tr>";
                $(".table .tbody").html(html);
                dom.find('.paging').addClass('display_none');
            }
        });
    };

    //关键字搜索
    dom.on("submit", "form", function(e) {
        e.preventDefault()
        var loc = kernel.parseHash(location.hash);
        var params = {};
        checkUrlParams(params, loc);
        kernel.replaceLocation(loc);
    });

    //删除
    dom.on('click', '.table .selectRow', function(e) {
        var id = $(this).data('id');
        if ($(e.target).hasClass('del')) {
            kernel.confirm('是否删除该数据', function(confirm) {
                if (confirm) {
                    util.ajaxSubmit({
                        url: '/remove',
                        data: {
                            id: id
                        },
                        success: function(obj) {
                            kernel.hint(obj.msg, 'success');
                            kernel.reloadPage();
                        },
                        error: function(err) {
                            kernel.hint(err.msg, 'error');
                        }
                    });
                }
            })
        } else if ($(e.target).hasClass('edit')) {
            kernel.openPopup('productEdit', {
                id: id,
                model: {
                    attr: attrdata
                }
            });
        }
    });

    function isNullObj(obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    }

    function checkUrlParams(params, loc) {
        if (!isNullObj(params)) {
            for (var x in params) {
                if (params[x] != '' && params[x] != null) {
                    delete loc.args.p;
                    loc.args[x] = params[x];
                } else {
                    delete loc.args[x];
                }
            }
        }
    }

    dom.on('click', '.addbtn', function() {
        kernel.openPopup('productEdit', {
            model: {
                attr: attrdata
            }
        });
    })

    return {
        onload: function(force) {
            var loc = kernel.parseHash(location.hash),
                type = loc.args.type,
                keyWord = loc.args.key_search;
            //productList(keyWord, loc.args.p);
        }
    };
});