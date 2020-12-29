

const serverAddress = require('../../config')
Page({
  data: {
    defaultfiles:[],       //后台获取的文件列表 
    downloadFile:[],        //下载到本地的文件列表
  },

  onLoad (query) {
    
  },
  onShow(){
    let $this = this;
    //获取服务器端文件列表
    wx.request({
      url: serverAddress.url+'/getFiles', // 请求服务端文件
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        // console.log(res.data, " 获取文件")
        $this.setData({
          defaultfiles:res.data.list
        })
      }
    })
    //读取小程序缓存到本地的文件列表  
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
          })
        })
        $this.setData({
          downloadFile,
        })
      },
      fail: (err) => {
        console.log('本地文件列表读取失败: ')
      }
    })
  },
  //下载文件
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
  gotoindex(){
    wx.navigateTo({
      url: '/pages/index/index',
    })
  }

});

