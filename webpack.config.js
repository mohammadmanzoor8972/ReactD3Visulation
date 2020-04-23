const webpack = require('webpack');
const { resolve } = require('path');

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MiniCssExtractPluginConfig = new MiniCssExtractPlugin({
  filename: "style.css",
  inject: "body"
});

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: {
    ks: "./src/ks.js",
    //school: "./src/school.js",
    group: "./src/group.js",
    pastoral: "./src/pastoral.js"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/dist"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.(less)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
      }
    ]
  },
  plugins: [
  
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: "ks.html",
      template: "src/ks.html",
      chunks: ["ks"]
    }),  /*
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: "school.html",
      template: "src/school.html",
      chunks: ["school"]
    }),   */
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: "group.html",
      template: "src/group.html",
      chunks: ["group"]
    }),
 
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: "pastoral.html",
      template: "src/pastoral.html",
      chunks: ["pastoral"]
    }),
    MiniCssExtractPluginConfig
  ]
};
