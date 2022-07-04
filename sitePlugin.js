const webpack = require('webpack');
// eslint-disable-next-line
module.exports = function (context, options) {
  return {
    name: 'custom-docusaurus-plugin',
    // eslint-disable-next-line
    configureWebpack(config, isServer, utils) {
      return {
        resolve: {
          fallback: {
	    url: false,
            fs: false,
          },
        },
      };
    },
  };
};
