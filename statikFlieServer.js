//笔记：http模块
const http = require("http");//http模块
const fs = require("fs");//读取文件
const fsp = fs.promises;
const path = require("path");//处理路径
const { fips } = require("crypto");

const port = 8090;
const baseDir = __dirname//当前模块的目录名，相当于__filename的path.dirname()

//参数：请求资源的路径
// const server = http.createServer((req, res) =>{
//     console.log(req.method, req.url);

//     var targetPath = path.join(baseDir, req.url);//拼接路径
//     fs.stat(targetPath, (err,stat) => {
//         if(err){
//             res.writeHead(404, {//防止乱码
//                 "Content-Type": "text/html; charset=UTF-8"
//             });
//             res.end("404 未找到文件")
//         }else{//是文件还是文件夹
//             if(stat.isFile()){
//                 fs.readFile(targetPath, (err, data) =>{
//                     if(err){
//                         res.writeHead(404, {//防止乱码
//                             "Content-Type": "text/html; charset=UTF-8"
//                         });
//                         res.end("请求的文件不存在")
//                     }else{
//                         fs.readFile(targetPath, (err, data) =>{
//                             res.end(data);
//                         })
//                     }
//                 })
//             }else if(stat.isDirectory()){
//                 var indexPath = path.join(targetPath, "index.html")//硬盘路径地址
//                 fs.stat(indexPath, (err, stat) => {
//                     if(err){//index文件不存在，把文件夹的所有内容读取
//                         if(!req.url.endsWith("/")){
//                             //展示地址栏时最后要有“/”，如果地址栏里不以"/"结尾，跳转到以"/"结尾的相同的地址栏
//                             res.writeHead(301, {
//                                 "Location": req.url + "/"
//                             })
//                             res.end();
//                             return;
//                         }
//                         fs.readdir(targetPath, {withFileTypes: true}, (err, entries) =>{
//                             res.end(`${entries.map(entry =>{
//                                 var slash = entry.isDirectory() ? "/" : ""//是文件夹的话在文件名后加“/”
//                                 return `<div><a href="${entry.name}${slash}">${entry.name}${slash}</a></div>`
//                             }).join("")}`)
//                         });
//                     }else{
//                         fs.readFile(indexPath, (err, data) =>{
//                             res.end(data);
//                         })
//                     }
//                 })
//             }
//         }
//     })
// })

const server = http.createServer(async(req, res) => {//加async同步函数转为异步
    console.log(req.method, req.url)

    var targetPath = path.join(baseDir, req.url);
    //阻止将baseDir以外的文件发送出去
    if(!targetPath.startsWith(baseDir)){
        res.end();
        return;
    }
    //阻止发送点.开头的文件夹里的文件
    if(targetPath.split(path.sep).some(seg => seg.startsWith("."))){
        res.end();
        return;
    }
    try{
        var stat = await fsp.stat(targetPath);//用await获得结果
        if(stat.isFile()){//如果是文件
            var data = await fsp.readFile(targetPath);
            res.end(data);//读取文件内容并返回
        }else if(stat.isDirectory()){//如果是文件夹
            var indexPath = path.join(targetPath, "index.html");
            try{
                await fsp.stat(indexPath);
                var indexContent = await fsp.readFile(indexPath);
                res.end(indexContent);
            }catch(e){//index.html文件不存在

                if(!req.url.endsWith("/")){
                            //展示地址栏时最后要有“/”，如果地址栏里不以"/"结尾，跳转到以"/"结尾的相同的地址栏
                            res.writeHead(301, {
                                "Location": req.url + "/"
                            })
                            res.end();
                            return;
                }

                var entries = await fsp.readdir(targetPath, {withFileTypes: true})
                    res.end(`${entries.map(entry =>{
                        var slash = entry.isDirectory() ? "/" : ""//是文件夹的话在文件名后加“/”
                        return `<div><a href="${entry.name}${slash}">${entry.name}${slash}</a></div>`
                    }).join("")}`)
            }
        }
    }catch(e){
        res.writeHead(404, {
            "Content-Type": "text/html; charset=UTF-8"
        });
        res.end(e.toString());
    }
})

server.listen(port, () =>{//设置回调
    console.log(port);
})