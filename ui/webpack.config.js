const path = require("path");
const webpack = require("webpack");
const TerserWebpackPlugin = require("terser-webpack-plugin");
// What are the options for groupKind
const extName = "logsummary";

const config = {
  entry: {
    extension: "./src/index.tsx",
  },
  output: {
    filename: `extensions-${extName}.js`,
    path: __dirname + `extension/resources`,
    libraryTarget: "window",
    library: ["tmp", "extensions"],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".ttf"],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    moment: "Moment",
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2015",
        },
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "raw-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
};

module.exports = config;
