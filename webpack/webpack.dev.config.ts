import path from "path";
import { fileURLToPath } from "url";
import "webpack-dev-server";
import { Configuration } from "webpack";
import { commonConfig } from "./webpack.common.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration = {
  ...commonConfig,
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "../src/public/"),
    },
    compress: true,
    port: 8080,
  },
};

export default config;
