const express = require('express');
const index = require('./route/index')
const upfile =  require('./route/upfile')

let server = new express();

server.use(express.static('./upload'))
server.use('/getFiles',index)
server.use('/upload',upfile)

server.listen(8080)