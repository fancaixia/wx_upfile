
const serverAddress = require('../../config')
Page({

  data: {
    downloadFile:[],        //下载到本地的文件列表
    upfilelist:[],          // 要上传的文件列表 
  },

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
// 查阅文件
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
  //选择下载到本地的文件
  choosedownfile(e){
    let path = e.currentTarget.dataset.path;
    let name = e.currentTarget.dataset.name;
    let { downloadFile, upfilelist }= this.data;

    downloadFile.forEach((item)=>{
      if(item.path == path){
        item.sel = true;
        upfilelist.push({name,path,})
      }
    })

    this.setData({
      downloadFile,
      upfilelist,
    })

  },
  //选择要上传的上传文件
  choosefilefun(){
    let _that = this;
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      success(res) {
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
  //删除要上传的文件
  delfile(e){
    let path = e.currentTarget.dataset.path;
    let name = e.currentTarget.dataset.name;
    let { downloadFile, upfilelist } = this.data;
        upfilelist.forEach((k,index)=>{
          if (k.path == path) {
            upfilelist.splice(index, 1) // 删除上传文件
            downloadFile.forEach((item) => {   //更新页面状态
              if (item.path == path) {
                item.sel = false;
              }
            })

          }
    })

    this.setData({
      downloadFile,
      upfilelist,
    })
  },
  // 上传  upfilefun
  upfilefun(){
   this.sendFormData(0)
  },
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

  // 上传成功后  清空数据  页面重置
  resetPage(){
    let { downloadFile, upfilelist } = this.data;
    downloadFile.forEach((item) => {   //更新页面状态
        item.sel = false;
    })
    this.setData({
      downloadFile,
      upfilelist:[],
    })
  }

});

