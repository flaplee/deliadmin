'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    return {
        onload: function(force) {
        	util.ajaxSubmit({
	            url: '/repay/repay/getLists',
	            data: {
	                "app_id":123456,
	                "org_id":123456
	            },
                Dauth: 11111111111,
	            success(r) {
	                console.log("r",r);
	            }
	        });
        }
    };
});