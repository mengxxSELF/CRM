/* 增加页面*/


var submit = document.getElementById('submit');
var username = document.getElementById('userName');

// 给提交按钮增加点击事件
var detailRender = (function () {
    // 绑定事件
    function bindEvent(userId){
        var cont = username.value;
        if(cont.length==0) {
            alert('输入为空');
            return;
        }; // 非空

        // 处理增加
        if(typeof userId !== 'undefined'){
            // id 存在时  修改用户
            ajax('/updateInfo',{
                method:'post',
                data:{
                    id:userId,
                    name:cont
                },
                success: function (res) {
                    if(res && res.code==0){
                        alert('修改成功')
                        window.location.href='index.html';
                    }else{
                        alert('修改失败')
                    }
                }
            })
            return;
        }
        // 处理新增用户
        ajax('/addInfo',{
            method:'POST',
            data:{
                name:cont
            },
            success: function (res) {
                console.log(res);
                // 跳转页面
                window.location.href= 'index.html';
            }
        })
    };

    // 用于解析URL  http://mxx2015web.gotoip2.com/wp-admin/post.php?post=1083&action=edit
    (function (str){
        function getUrl(){
            //使用正则
            var reg= /([^?=&#]+)=([^?=&#]+)/g;
            var obj={};
            this.replace(reg, function ($0,$1,$2) {
                obj[$1]=$2;
            });
            return obj;
        };
        str.getUrl=getUrl;
    })(String.prototype);  // 给字符串的原型上添加一个方法



    return {
        init: function () {
            //  分析URL 判断是否有问号传参
            // 获取URL 参数 判断是增加用户还是修改
            var urlObj = window.location.href.getUrl(),
                urlId= urlObj.id;
            if(urlId=='undefined'){
                // 如果ID 不存在
            }else{
                // 如果ID存在  先渲染信息
                ajax('/getInfo?id='+urlId,{
                    success: function (res) {
                        if(res && res.code==0){
                            username.value = res.data.name;
                        }
                    }
                })
            }
           // 绑定事件
            submit.onclick = function () {
                bindEvent(urlId); // 将ID传入
            };
        }
    }
})();
detailRender.init();