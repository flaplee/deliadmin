'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPage = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPage),
        attrdata,
        rowParam = {};

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
            kernel.openPopup('userEdit', {
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
        kernel.openPopup('userEdit', {
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
        }
    };
});