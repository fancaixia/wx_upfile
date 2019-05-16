const express=require('express')

const route_index=express.Router();

//此处模拟查询数据库所得到的数据    获取upload 目录下的文件返回页面
var fs = require('fs');
var path = require('path');//解析需要遍历的文件夹
var filePath = path.resolve(__dirname, '../upload'); 

let filesList=[];   //存储upload目录下的文件
//调用文件遍历方法
fileDisplay(filePath);
//文件遍历方法
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
        if(err){
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(filePath, filename);
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror, stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
　　　　　　　　　　　　　　　　// 读取文件名
                            var extname=path.basename(filedir);
                            filesList.push(extname);
                        }
                        if(isDir){
                            fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });
}


route_index.get('/',(req,res)=>{
    res.send({list:filesList}).end();
})


module.exports= route_index;