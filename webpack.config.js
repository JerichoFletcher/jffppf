const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: "production",
  devtool: "inline-source-map",
  entry: {
    main: "./src/index.ts",
  },
  output: {
    path: path.resolve(__dirname, './lib'),
    filename: "jffppf-bundle.js",
    library: "JFFPPF"
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  }
};