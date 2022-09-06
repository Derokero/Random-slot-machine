import path from "path";
import { fileURLToPath } from "url";
import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const commonConfig: Configuration = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "js/[name]-[hash].js",
    path: path.resolve(__dirname, "dist/"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/public/index.html",
    }),
  ],
};

export default commonConfig;
