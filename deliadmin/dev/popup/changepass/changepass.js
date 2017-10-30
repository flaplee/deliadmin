'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPopup = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPopup),
        form = dom.find('form'),
        oldpass = form.find('.oldpass'),
        newpass = form.find('.newpass'),
        newpass2 = form.find('.newpass2');
    form.on('submit', function() {
        if (newpass.val() === newpass2.val()) {
            util.ajaxSubmit({
                url: '/auth/user/editpwd',
                data: {
                    sysuser: {
                        oldpass: oldpass.val(),
                        password: newpass.val()
                    }
                },
                success: function(json) {
                    kernel.hint('密码修改成功，请重新登陆', 'success');
                    util.setSsid('');
                }
            });
        } else {
            kernel.hint('两次输入的密码不一致', 'error');
        }
        return false;
    });
    return {
        onload: function(param) {
            if (param) {
                $('#popups').addClass('force');
                kernel.hint('必须修改密码才能继续使用', 'info');
            }
            form[0].reset();
        }
    };
});