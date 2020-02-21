var express = require('express')
var fs = require('fs')
var User = require('./models/user.js')
var md5 = require('blueimp-md5')



var router = express.Router()

// 首页
router.get('/', function (req, res) {
  res.render('index.html', {
    user: req.session.user
  })
})

router.get('/register', function (req, res) {
  res.render('register.html')
})
router.post('/register', function (req, res) {
  console.log(req.body)
  // 1 获取表单提交的数据 
  //    req.body
  // 2 操作数据库 
  //    判断该用户(邮箱)是否存在 
  //      如果存在，不允许注册 
  //      不过不存在，注册新建用户
  // 3 发送响应
  var body = req.body
  User.findOne({
    $or: [{ email: body.email }, { nickname: body.nickname }]
  },
    function (err, data) {
      if (err) {
        return res.status(500).json({
          // success:false,
          err_code: 500,
          message: 'Server Error'
        })
      }
      if (data) {//邮箱或昵称已存在(所以数据库中有data)
        return res.status(200).json({
          // success:true,
          err_code: 1,
          message: 'email or nickname aleary exist.'
        })
      }
      //不存在，注册
      body.password = md5(md5(body.password))
      new User(body).save(function (err, user) {
        // console.log(user) //一条数据
        if (err) {
          return res.status(500).json({
            // success:false,
            err_code: 500,
            message: 'server error'
          })
        }
        //注册成功，使用session记录用户的登陆状态
        req.session.user = user
        res.status(200).json({
          // success:true,
          err_code: 0,
          message: 'ok'
        })
        // res.render('/')
      })
    }
  )
})
router.get('/login', function (req, res) {
  res.render('login.html')
})
router.post('/login', function (req, res) {
  // 1 获取表单提交的数据 
  //    req.body
  // 2 查询数据库用户名密码是否正确 
  // 3 发送响应
  var body=req.body
  User.findOne({
    email:body.email,
    password:md5(md5(body.password))
  },function(err,user){
    if(err){
      return res.status(500).json({
        err_code:500,
        message:err.message
      })
    }
    if(!user){
      return res.status(200).json({
        err_code:1,
        message:'邮箱或昵称不对'
      })
    }
    //用户存在，登陆成功，通过session记录登陆状态
    req.session.user=user
    res.status(200).json({
      err_code:0,
      message:'ok'
    })
  })
})
router.get('/logout', function (req, res) {
  res.session.user=null
  res.redirect('/login')
})

module.exports = router

