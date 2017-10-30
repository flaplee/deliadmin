'use strict';
define(['common/kernel/kernel', 'site/util/util', 'site/pages/menus'], function(kernel, util, menus) {
	var headMenu = $('#head>.menu'),
        leftMenu = $('#menu'),
        usermenu = $('#head>.user>.usermenu');
    kernel.appendCss(require.toUrl("common/ztree/css/metroStyle/metroStyle.css"));
    $('#head>.user>a').on('click', function() {
        if (usermenu.css('display') !== 'block') {
            usermenu.css('display', 'block');
            setTimeout(function() {
                $(document).on('click', hideusermenu);
            }, 0);
        }
    });
    usermenu.find('.logout').on('click', function() {
        util.setCookie('password', '');
        util.setSsid('');
    });
    usermenu.find('.changepass').on('click', function() {
        kernel.openPopup('changepass');
    });
    usermenu.find('.loginInfo').on('click', function() {
        kernel.openPopup('loginInfo');
    });

    headMenu.find('>a').on('click',function(){
    	var c = $(this);
    	c.addClass('active').siblings('a').removeClass('active');
    });

    leftMenu.find('> div > a').on('click',function(){
    	var c = $(this);
    	c.addClass('active').siblings('a').removeClass('active');
    });

	
	var historyNav;
	//百度统计代码
	if (location.host === 'your_production_host') {
		window._hmt = [
			['_setAutoPageview', false]
		];
		require(['//hm.baidu.com/hm.js?[your_hmid]'], function() {
			//由于百度统计在head中插入的input标签在ie7中会导致jquery选择器遍历时出错，这里尝试将其移除
			var ipt = head.getElementsByTagName('input')[0];
			if (ipt) {
				head.removeChild(ipt);
			}
		});
	}
	kernel.listeners.add(kernel.pageEvents, 'route', function(){
		historyNav = history.state;
		history.replaceState && history.replaceState(true, null);
		//百度统计接口
		if (window._hmt && _hmt.push) {
			_hmt.push(['_trackPageview', '/' + kernel.buildHash(kernel.location)]);
		}
	});
	kernel.listeners.add(kernel.pageEvents, 'routend', function() {
		var h;
		//如果上次访问的页面id和当前页id不同，并且不是在history中导航时，则滚动到页面顶部
		if (kernel.lastLocation && kernel.lastLocation.id !== kernel.location.id && !historyNav) {
			h = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
			if (h > 0) {
				$('html,body').animate({
					scrollTop: 0
				}, h);
			}
		}
	});
	kernel.init('home');
});