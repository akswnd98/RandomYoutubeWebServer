import express, { Request } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';
import https from 'https';
import fs from 'fs';
import useragent from 'express-useragent';

dotenv.config();

const app = express();

app.set('port', process.env.SERVER_PORT);

app.use(useragent.express());

app.use('/api', createProxyMiddleware('', {
  target: `http://${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`,
  changeOrigin: true,
}));

const devClients = [
  'desktop-web-client',
  'mobile-web-client',
];

const devClientsPublicPath = [
  'desktop',
  'mobile',
];

if (process.env.NODE_ENV === 'development') {
  devClients.forEach((v) => {
    const webpackConfig = {
      mode: 'development',
      ...require(`../${v}/webpack.config.js`),
    };
    webpackConfig.resolve.modules = [
      path.resolve(__dirname, `../${v}`),
      path.resolve(__dirname, `../${v}/node_modules`),
      ...webpackConfig.resolve.modules !== undefined ? webpackConfig.resolve.modules : [],
    ];
    const compiler = webpack(webpackConfig);
    const instance = webpackMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
    });

    app.use(instance);
  });
}

if (process.env.NODE_ENV === 'production') {
  app.use('/desktop/', express.static(path.resolve(__dirname, '../desktop-web-client/dist')));
  app.use('/mobile/', express.static(path.resolve(__dirname, '../mobile-web-client/dist')));

  app.get('/', async (req, res) => {
    try {
      if (req.useragent?.isDesktop) {
        res.sendFile(path.resolve(__dirname, '../desktop-web-client/dist/index.html'));
      } else if (req.useragent?.isMobile) {
        res.sendFile(path.resolve(__dirname, '../mobile-web-client/dist/index.html'));
      }
    } catch (e) {
      console.log(e);
    }
  });
} else if (process.env.NODE_ENV === 'development') {
  app.get('/', async (req, res) => {
    try {
      if (req.useragent?.isDesktop) {
        res.redirect('/desktop/index.html');
      } else if (req.useragent?.isMobile) {
        res.redirect('/mobile/index.html');
      }
    } catch (e) {
      console.log(e);
    }
  });
}

const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, '../ssl/ry.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../ssl/ry.crt')),
};

https.createServer(httpsOptions, app).listen(process.env.SERVER_PORT, () => {
  console.log(`server started on port ${app.get('port')}`);
});
