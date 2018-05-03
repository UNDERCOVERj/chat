const middlewares =  require('koa-webpack-middleware');
const path = require('path');
const config = require('./webpack.dev.config.js');
const serve = require('koa-static');
const webpack = require('webpack');
const http = require('http')
// const webpackDevMiddleware = require('webpack-dev-middleware');
// const webpackHotMiddleware = require('webpack-hot-middleware');
const compiler = webpack(config);
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
const request = require('request');

const app = new Koa();
const router = new Router();

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server, {log:false, origins:'*:*'});

require('../src/service/io.js')(io)

app.use(koaBody(), {
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb"
})

app.use(middlewares.devMiddleware(compiler, {
  // webpack-dev-middleware options
  // index: 'index.html'
}));

require('../src/service/api.js')(app, router, io)

app
  .use(router.routes())
  .use(router.allowedMethods());

// app.use(middlewares.hotMiddleware(compiler, {
// 		log: false,
// 	    path: "/__what",
// 	    heartbeat: 2000
// 	})
// );


app.use(serve(path.join(__dirname, '../src/static')));

// app.listen(3000, () => console.log('Example app listening on port 3000!'))
server.listen(3000, () => console.log('Example app listening on port 3000!'))