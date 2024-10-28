const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/rpc',
    createProxyMiddleware({
      target: 'https://polygon-amoy.drpc.org',
      changeOrigin: true,
      pathRewrite: {
        '^/rpc': '',
      },
    })
  );
};
