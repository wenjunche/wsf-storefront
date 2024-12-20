const path = require("path");
const fs = require("fs");
const webpack = require("webpack");

const HtmlwebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isDevServer = process.env.WEBPACK_SERVE; // if in dev-server mode
const localPort = 8081;
const localUrl = `http://localhost:${localPort}`;
const remoteUrl = "https://testing-assets.openfin.co/wsf-storefront";

let definePlugin, rootUrl;
if (!isDevServer) {
  rootUrl = remoteUrl;
  definePlugin = new webpack.DefinePlugin({
    APP_ROOT_URL: JSON.stringify(remoteUrl),
  });
} else {
  rootUrl = localUrl;
  definePlugin = new webpack.DefinePlugin({
    APP_ROOT_URL: JSON.stringify(localUrl),
  });
}

const copyPlugin = new CopyPlugin({
  patterns: [
    {
      from: path.join(__dirname, "res", "app.json"),
      to: path.join(__dirname, "dist"),
      transform(content, absoluteFrom) {
        return content.toString().replaceAll("{APP_ROOT_URL}", rootUrl);
      },
    },
  ],
});

module.exports = (env) => {
  console.log(env.mode);

  return {
    mode: env.mode,
    entry: {
      index: "./src/index.tsx",
    },
    devtool: env.mode === "development" ? "source-map" : undefined,
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name]-bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js", ".tsx"],
    },
    plugins: [
      new HtmlwebpackPlugin({
        title: "OpenFin Workspace Example",
        template: "res/index.html",
        filename: "index.html",
        chunks: ["index"],
      }),
      definePlugin,
      copyPlugin,
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "res"),
      },
      port: localPort,
      hot: true,
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get("/app.json", (_, response) => {
          const data = fs.readFileSync(
            path.join(__dirname, "res", "app.json"),
            { encoding: "utf8", flag: "r" }
          );
          response.send(data.replaceAll("{APP_ROOT_URL}", rootUrl));
        });
        return middlewares;
      },
    },
  };
};
