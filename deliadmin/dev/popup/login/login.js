'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPopup = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPopup),
        form = dom.find('form'),
        rem = dom.find('.rememberMe'),
        autoLogin = dom.find('.autoLogin'),
        uid = dom.find('.username'),
        pwd = dom.find('.password');
    rem.on('change', function() {
        autoLogin.prop('disabled', !this.checked);
    });
    dom.find('.version').text(require.data.debug ? 'test1' : 'v' + require.data.siteVersion);
    form.on('submit', function() {
        util.ajaxSubmit({
            url: '/auth',
            data: {
                username: uid.val(),
                password: pwd.val()
            },
            success: function(json) {
                util.setCookie('username', rem.prop('checked') ? uid.val() : '', 9999);
                util.setCookie('password', autoLogin.prop('checked') && !autoLogin.prop('disabled') ? pwd.val() : '', 9999);
                util.setSsid(json.ssid);
                kernel.closePopup(thisPopup);
                kernel.hint('登录成功', 'success');
            }
        });
        return false;
    });

    return {
        onload: function() {
            uid.val(util.getCookie('username'));
            pwd.val(util.getCookie('password'));
        }
    };
});