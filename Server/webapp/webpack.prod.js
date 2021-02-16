const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const buildPath = path.resolve(__dirname, "webapp/static");
// needed to prevent xss when injecting html inside react component
const BundleTracker = require("webpack-bundle-tracker");

// from https://material.io/develop/web/docs/getting-started/

function tryResolve_(url, sourceFilename) {
  // Put require.resolve in a try/catch to avoid node-sass failing with cryptic libsass errors
  // when the importer throws
  try {
    return require.resolve(url, { paths: [path.dirname(sourceFilename)] });
  } catch (e) {
    return "";
  }
}

function tryResolveScss(url, sourceFilename) {
  // Support omission of .scss and leading _
  const normalizedUrl = url.endsWith(".scss") ? url : `${url}.scss`;
  return (
    tryResolve_(normalizedUrl, sourceFilename) ||
    tryResolve_(
      path.join(
        path.dirname(normalizedUrl),
        `_${path.basename(normalizedUrl)}`
      ),
      sourceFilename
    )
  );
}

function materialImporter(url, prev) {
  if (url.startsWith("@material") || url.startsWith("@angular/material")) {
    const resolved = tryResolveScss(url, prev);
    return { file: resolved || url };
  }
  return { file: url };
}

// end from https://material.io/develop/web/docs/getting-started/

module.exports = {
  // This option controls if and how source maps are generated.
  // https://webpack.js.org/configuration/devtool/
  devtool: "source-map",

  // https://webpack.js.org/configuration/mode/
  mode: 'production',

  // https://webpack.js.org/concepts/entry-points/#multi-page-application
  context: path.resolve(__dirname, "webapp"),
  entry: {
    index: "./static_src/js/main.js"
  },

  // how to write the compiled files to disk
  // https://webpack.js.org/concepts/output/
  output: {
    filename: "[name].[hash:20].js",
    path: buildPath,
    publicPath:''
  },

  // https://webpack.js.org/concepts/loaders/
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"]
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"]
        }
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader", // translates CSS into CommonJS
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              postcssOptions: {
                plugins: [
                  [
                    "autoprefixer",
                    {
                      grid: true
                    }
                  ]
                ]
              }
            }
          },
          {
            loader: "sass-loader", // compiles Sass to CSS, using Node Sass by default
            options: {
              sourceMap: false,
              sassOptions: {
                importer: [materialImporter]
              }
            }
          }
        ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg|otf)$/,
        loader: "url-loader",
        options: {
          limit: 100
        }
      }
    ]
  },

  // https://webpack.js.org/concepts/plugins/
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css",
      chunkFilename: "[id].[contenthash].css"
    }),
    // Copy the images folder and optimize all the images
    new CopyWebpackPlugin(
      { patterns: [{ from: "./static_src/images/", to: "images" }] }
    ),
    new ImageminPlugin({ test: /\.(jpe?g|png|gif|svg)$/i }),
    new BundleTracker({
      filename: "./webpack-stats.json"
    })
  ],

  // https://webpack.js.org/configuration/optimization/
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: false
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  }
};
