const http = require('http');
const url = require('url')
http.createServer((sreq, res) => {
	let opts = {
		host: '127.0.0.1',
		port: 3000,
		path: url.parse(sreq.url).pathname,
		headers: sreq.headers,
		method: sreq.method
	};
	let content = ''; 
	console.log(sreq.headers)         
    console.log('hhhhhs');
    sreq.on("data",function(data){//接收参数 ------ sreq.on("data",function(data){});接收html中ajax传递的参数  
        console.log(data)
        console.log('data')
        var req = http.request(opts, function(res) {  
            res.on('data',function(body){  
                console.log('return');  
                content+=body;  
            }).on("end", function () {  
                //返回给前台  
                if(res.headers != null && res.headers['set-cookie'] != null){  
               //console.log("=======res.headers.cookie======="+res.headers.cookie);  
                   sres.writeHead(200, {  
                               'Content-Type': 'text/html',  
                               'Set-Cookie': res.headers['set-cookie']  
                   });//将cookie放到response中  
                } else{  
                      sres.writeHead(200, {'Content-Type': 'text/html'});  
                }
                sres.write(content);  
                sres.end();  
            });  
        }).on('error', function(e) {  
            console.log("Got error: " + e.message);  
        });  
        //console.log("固定参数===="+post_data);  
        //console.log("接收参数===="+data+"\n");  
		if(sreq.headers.cookie != null ){  
		   req.setHeader('Cookie',sreq.headers.cookie);  
		}//获取request中的cookie</span>  

        req.write(data+"\n");  
        req.end();  
    }); 
}).listen(8888, '127.0.0.1')