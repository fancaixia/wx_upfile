const express=require('express')

const route_index=express.Router();

//此处模拟查询数据库所得到的数据    获取upload 目录下的文件返回页面
const multiparty = require('multiparty')
var fs = require('fs');
var path = require('path');//解析需要遍历的文件夹
var filePath = path.resolve(__dirname, '../upload'); 

route_index.post('/',(req,res)=>{
    var form = new multiparty.Form();
    form.encoding = 'utf-8';
    form.uploadDir='upload'   //上传图片保存的地址     目录必须存在
    form.parse(req, function(err, fields, files) {
        if(err){
            res.send({code:-1,msg:'上传失败'}).end();
         } else {
             let newfiles;
             for(let k in files){
                newfiles = files[k]
             }

            var uploadedPath = newfiles[0].path;
            let originalFilename = newfiles[0].originalFilename;
            let fieldName = newfiles[0].fieldName;

             var dstPath = 'static/' + fieldName
              //重命名为真实文件名
               fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    res.send({code:-1,msg:'上传失败'}).end();
               } else {
                    res.send({code:1,msg:'上传成功',path:dstPath}).end();
                }

               });
           }

      });
    
})


module.exports= route_index;