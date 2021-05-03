module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? 'https://mikatalk.github.io/border-to-border' : '',
  configureWebpack: {
    devServer: {
      host: '0.0.0.0',
      port: '8080'
    }
  },
  parallel: false,
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.hotReload = false
          return options
        })
    config.module
      .rule('worker')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .end();
  }
}
