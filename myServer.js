var http  = require('http'),
    fs=require('fs'),
    url=require('url');
var port = 9999;

// 开启服务
// 静态资源文件处理
// 根据API设置接口服务

http.createServer(function (req,res) {
    var urlObj = url.parse(req.url,true),
        pathname= urlObj.pathname,
        query=urlObj.query;

    // 1 静态资源文件处理

    // .css .html .mp4  匹配后缀 查找文件
    var reg = /\.([a-zA-Z0-9]+)/i;
    var status = cont =null;
    var mime='text/plain';
    if(reg.exec(pathname)){
        try{
            cont = fs.readFileSync('.'+pathname);
            status=200;
        }catch (e){
            status=404;
            cont = 'not content';
        }

        // 根据后缀修改mime
        var end = RegExp.$1.toLowerCase();
        switch (end){
            case 'css':
                mime='text/css';
                break;
            case 'html':
                mime='text/html';
                break;
            case 'js':
                mime='text/javascript';
                break;
        }
        // 重写头部
        res.writeHeader(status,{'content-type':mime+';charset=utf-8;'});
        res.end(cont);

    }

    // 接口处理
    var dataPath = './json/custom.json',
        result={code:1,msg:'error',data:null};
    var dataStr = fs.readFileSync(dataPath,'utf-8'),
        dataAry = dataStr.length==0?[]:JSON.parse(dataStr);
//    展示所有的客户信息 URL:/getAllList
    if(pathname=='/getAllList'){
        result={code:0,msg:'success',data:dataAry};
        res.end(JSON.stringify(result));
        res.writeHead(200,{'content-type':'application/json;charset=utf-8;'});
        return;
    }
//获取指定客户的信息 URL:/getInfo GET
    if(pathname=='/getInfo'){
        var userId = query['id'];
        var user = dataAry.filter(function (item) {
            return (item['id']==userId);
        });
        if(user.length>0){
            result={code:0,msg:'success',data:user[0]};
        }
        res.end(JSON.stringify(result));
        res.writeHead(200,{'content-type':'application/json;charset=utf-8;'});
        return;
    }
// 删除客户信息 URL:/removeInfo GET
    if(pathname=='/removeInfo'){
        var userId = query['id'];
        var user = dataAry.filter(function (item) {
            return (item['id']==userId);
        });
        // 进行删除
        if(user.length>0){
            dataAry.splice(dataAry.indexOf(user[0]),1);
            result={code:0,mag:'success'};
            // 重新写入
            fs.writeFileSync(dataPath,JSON.stringify(dataAry));
        }
        res.end(JSON.stringify(result));
        res.writeHead(200,{'content-type':'application/json;charset=utf-8;'});
        return;

    }
    //增加客户信息 URL:/addInfo POST
    if(pathname=='/addInfo'){
        var user ='';
        req.on('data', function (data) {
            user+=data;
        });
        req.on('end', function () {
            user = format(user);
            // 添加一个ID 并重新写写入文件
            user['id']= dataAry.length==0?1:dataAry[dataAry.length-1]['id']+1;
            dataAry.push(user);
            fs.writeFileSync(dataPath,JSON.stringify(dataAry));
            result={code:0,msg:'success'};
            res.writeHead(200,{'content-type':'application/json;charset=utf-8;'})
            res.end(JSON.stringify(result))
            return;
        })
    };
//修改客户信息   URL:/updateInfo POST
    if(pathname=='/updateInfo'){
        var user='';
        req.on('data', function (data) {
            user+=data;
        });
        req.on('end', function () {
            user = format(user);
            var userId = user['id'];
            var end = dataAry.filter(function (item) {
                return (item['id']==userId);
            });
            if(end.length>0){
                // 进行直接替换
                dataAry[dataAry.indexOf(end[0])] = user;
                // 重新写入
                fs.writeFileSync(dataPath,JSON.stringify(dataAry));
                result={code:0,msg:'success'};
            };
            res.writeHead(200,{'content-type':'application/json;charset=utf-8;'});
            res.end(JSON.stringify(result));
            return;
        })
    }


}).listen(port, function () {
    console.log('the port is',port);
});

// 将字符串解析为对象
function format(str){
    var reg = /([^&?=#]+)=([^&?=#]+)/g;
    var obj={};
    str.replace(reg, function ($0,$1,$2) {
        obj[$1]=$2;
    });
    return obj;
}


