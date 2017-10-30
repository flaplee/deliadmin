'use strict';
define(['module', 'common/kernel/kernel', 'site/util/util'], function(module, kernel, util) {
    var thisPopup = module.id.replace(/^[^/]+\/|\/[^/]+/g, ''),
        dom = $('#' + thisPopup),
        d = util.getUserData();
    kernel.listeners.add(util.userEvents, 'datachange', datachange);
    if (d) {
        datachange({
            data:d
        });
    }
    function datachange(evt){
        var n;
        if (evt.data) {
            for (n in evt.data) {
                if (typeof evt.data[n] === 'string') {
                    dom.find('>div>.' + n).text(evt.data[n] || '暂无数据');
                }
            }
            if (evt.data.role_name === 'admin') {
                dom.find('>div>.manage_store_name').text('全部');
            } else if (evt.data.manage_store){
                util.ajaxSubmit({
                    url:'/api/api/store',
                    silent: true,
                    success: function(json) {
                        var t, i, j, k = evt.data.manage_store.split(',');
                        console.log(k)
                        for (i = 0; i < json.data.list.child.length; i++){
                            n = json.data.list.child[i].organization_name;
                            t = k.indexOf(json.data.list.child[i].organization_id);
                            if (t >= 0) {
                                k[t] = json.data.list.child[i].organization_name;
                            }
                            if(json.data.list.child[i].child && json.data.list.child[i].child.length) {
                                for (j = 0; j < json.data.list.child[i].child.length; j++) {
                                    t = k.indexOf(json.data.list.child[i].child[j].organization_id);
                                    if (t >= 0) {
                                        k[t] = n + '/' + json.data.list.child[i].child[j].organization_name;
                                    }
                                }
                            }
                        }
                        dom.find('>div>.manage_store_name').text(k.join(', '));
                    }
                });
            } else {
                dom.find('>div>.manage_store_name').text('暂无数据');
            }
        }
    }
});