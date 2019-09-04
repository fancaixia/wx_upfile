### 微信小程序word, doc文件上传与下载

[github项目地址:https://github.com/fancaixia/upfile](https://github.com/fancaixia/upfile)

##### 文件上传两种方式 
- [x] 上传当前小程序中下载过的文件
- [x] 利用wx.chooseMessageFile  调用微信会话页面 选择要上传的文件

![示例](https://github.com/fancaixia/upfile/blob/master/pic/IMG_3638.GIF)
![示例](https://github.com/fancaixia/upfile/blob/master/pic/pic01.jpg)

### 文件上传示例代码

##### 微信会话中选择要上传的上传文件
```
//选择要上传的上传文件
  choosefilefun(){
    let _that = this;
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      success(res) {
        console.log(_that,' :this')
        // console.log(res, " :res")
        const tempFiles = res.tempFiles
        let {upfilelist} = _that.data;
        let newupfilelist = upfilelist.concat(tempFiles)

        _that.setData({
          upfilelist: newupfilelist,
        })
      }
    })
  },
    
```
##### 选择当前小程序缓存到本地的文件
```
onLoad (query) {
    const manager = wx.getFileSystemManager();  //获取全局唯一的文件管理器
    this.getLocalFiles(manager, this)
  },
  //读取本地缓存文件
  getLocalFiles(manager, $this) {
    manager.readdir({
      dirPath: `${wx.env.USER_DATA_PATH}/download`,
      success: (res) => {
        // console.log('本地文件列表: ', res)
        let downloadFile = [];
        res.files.forEach((item, index) => {
          downloadFile.push({
            file: item,
            path: `${wx.env.USER_DATA_PATH}/download/` + item,
            sel:false,
          })
        })
        $this.setData({
          downloadFile,
        })
      },
      fail: (err) => {
        console.log('本地文件列表读取失败: ',err)
      }
    })
  },
```
#####  文件上传请求
```
sendFormData(fileindex){
    let { upfilelist } = this.data;
    if (upfilelist.length == 0){
        wx.showToast({
          title: '请选择要上传的文件',
        })
        return;
    }
    let $this = this;
    wx.uploadFile({
      url: serverAddress.url + '/upload', // 请求服务端文件,
      filePath: upfilelist[fileindex].path,
      name: upfilelist[fileindex].name,
      header: {
        "content-type": "multipart/form-data;charset=UTF-8",
      },
      formData: {},
      success: function (res) {
        let data = JSON.parse(res.data)
        if(data.code == 1){
          console.log('上传成功')
        }
      },
      fail: function (res) {
        console.log(res, " :失败res")
      },
      complete:function(res){
        if (fileindex == upfilelist.length -1){
          wx.showToast({
            title: '上传成功',
          })
          $this.resetPage()
            
        }else{
          fileindex++;
          $this.sendFormData(fileindex);
        }
      }

    })
  },
```
### 文件下载示例代码
```
savefiles(e){
    const fileName = e.currentTarget.dataset.name;   //获取页面要下载的文件名
    let $this = this;
    wx.downloadFile({
      url: serverAddress.url + '/' + fileName,   
      success:(res)=> {
        var filePath = res.tempFilePath;
        let manager = wx.getFileSystemManager();  //获取全局唯一的文件管理器
        //判断目录是否存在
        manager.access({
          path: `${wx.env.USER_DATA_PATH}/download`,
          success: (res) => {
            // console.log('已存在path对应目录',res)
            //保存文件之前查看是否存在此文件  
            manager.access({
              path: `${wx.env.USER_DATA_PATH}/download/${fileName}`, 
              success(res){
                // console.log('已存在此文件', res);
                return false;
              },
              fail(err){
                  console.log('不存在此文件')
                  manager.saveFile({
                    tempFilePath: filePath,     //filePath为保存到本地的临时路径
                    filePath: `${wx.env.USER_DATA_PATH}/download/${fileName}`,
                    success: (res) => {
                      $this.getLocalFiles(manager, $this)
                    },
                    fail: (err) => {
                      console.log(err)
                    }
                  })
              }
            })

            },
            fail: (err) => {
              // console.log(err, '不存在path对应目录')
              //创建保存文件的目录
              manager.mkdir({
                dirPath: `${wx.env.USER_DATA_PATH}/download`,
                recursive: false,
                success: (res) => {
                  //将临时文件保存到目录  /download
                   manager.saveFile({
                    tempFilePath: filePath,
                    filePath: `${wx.env.USER_DATA_PATH}/download/${fileName}`,
                    success: (res) => {
                      // console.log(res)
                      $this.getLocalFiles(manager, $this)
                    },
                    fail: (err) => {
                      console.log(err)
                    }
                  })
                },
                fail: (err) => {
                  console.log(err,)
                }
              })
            }
        })
      },
      fail:(err)=>{
          console.log(err, "下载失败")
      }
    })
  },
  
```
##### 文件预览
```
openfile(e){
      let path = e.currentTarget.dataset.path;
      wx.openDocument({
        filePath: path,
        success:(res)=>{
          console.log('读取成功',res)
        },
        fail:(err)=>{
          console.log('读取失败',err)
        }
      })
  },
```


**项目启动**  

> wx_static 目录为小程序项目 <br/>
[1] cd / wx_static
[2] 修改config.js 中的 ip地址


> node 服务端 <br/>

[1] cd / node 

[2] cnpm install （安装依赖）  

[3] npm run dev( 如果node启动服务失败那么运行 node app)

**文件是否上传成功可查看 node/static 目录** <br/>
**将想要下载的文件丢到  node/upload, 小程序下载页面可显示（不显示的话 重启node即可）**



