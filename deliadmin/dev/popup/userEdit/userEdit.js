'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPopup = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPopup),
        id, model, isUpdate = false;

    var adddata = function(data) {
        util.ajaxSubmit({
            url: "/check/cheat/create",
            data: {
                loanusercheat: data
            },
            success: function(obj) {
                kernel.hint(obj.msg, 'success');
                kernel.reloadPage();
            }
        });
    }

    dom.find('form').on('submit', function(e) {
        e.preventDefault();
        var data = util.getFormData(dom, model.attr);
        adddata(data);
    })

    return {
        onload: function(param) {
            dom.find('form')[0].reset();
            if (param && param.model) {
                id = param.id;
                model = param.model;
                util.setFormData(dom, model.attr);
            }
        }
    }
})