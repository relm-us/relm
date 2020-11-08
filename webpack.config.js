const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Preprocess = require("svelte-preprocess");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";
const path = require("path");
const BrotliWebpackPlugin = require("brotli-webpack-plugin");
const sveltePath = path.resolve("node_modules", "svelte");

/**
 * Should source maps be generated alongside your production bundle? This will
 * expose your raw source code, so it's disabled by default.
 */
const sourceMapsInProduction = true;

/**
 * Should we run Babel on builds? This will transpile your bundle in order to
 * work on your target browsers (see the `browserslist` property in your
 * package.json), but will impact bundle size and build speed.
 */
const useBabel = true;

/**
 * Should we run Babel on development builds? If set to `false`, only production
 * builds will be transpiled. If you're only testing in modern browsers and
 * don't need transpiling in development, it is recommended to keep this
 * disabled as it will greatly speed up your builds.
 */
const useBabelInDevelopment = false;

/**
 * One or more stylesheets to compile and add to the beginning of the bundle. By
 * default, SASS, SCSS and CSS files are supported. The order of this array is
 * important, as the order of outputted styles will match. Svelte component
 * styles will always appear last in the bundle.
 */
const stylesheets = ["./src/styles/index.scss"];

module.exports = {
  entry: {
    bundle: [
      // Note: Paths in the `stylesheets` variable will be added here
      // automatically
      "./src/main.ts",
    ],
  },
  resolve: {
    //
    // modules: [path.resolve(__dirname, "src")],
    alias: {
      // Note: Additional aliases will be loaded automatically from
      // `tsconfig.compilerOptions.paths`
      svelte: path.resolve("node_modules", "svelte"),
      // Resolve tilde ("~") to project root, so we can use absolute-path style modules
      // See https://medium.com/@davidmieloch/tilde-paths-with-eslint-typescript-and-webpack-971f694c9b15
      "~": path.resolve(__dirname, "src"),
    },
    // symlinks: false,
    extensions: [".mjs", ".js", ".ts", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  output: {
    publicPath: "/build/",
    path: __dirname + "/public/build",
    filename: "[name].js",
    chunkFilename: "[name].[id].js",
  },
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader-hot",
          options: {
            dev: !prod,
            emitCss: prod,
            hotReload: !prod,
            hotOptions: {
              // List of options and defaults:
              // https://www.npmjs.com/package/svelte-loader-hot#usage
              noPreserveState: false,
              optimistic: true,
            },
            preprocess: Preprocess({
              scss: true,
              postcss: {
                plugins: [require("autoprefixer")],
              },
            }),
          },
        },
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !prod,
              sourceMap: !prod || sourceMapsInProduction,
            },
          },
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              plugins: [require("autoprefixer")],
            },
          },
          "sass-loader",
        ],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: !prod,
              sourceMap: !prod || sourceMapsInProduction,
            },
          },
          "css-loader",
        ],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      // Include source maps from node modules
      // {
      //   test: /\.js$/,
      //   enforce: "pre",
      //   use: ["source-map-loader"],
      // },
    ],
  },
  devServer: {
    hot: true,
    stats: "minimal",
    contentBase: "public",
    watchContentBase: true,
  },
  mode,
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new DuplicatePackageCheckerPlugin(),
  ],
  optimization: {
    minimizer: [],
  },
  devtool: prod && !sourceMapsInProduction ? false : "source-map",
};

// Add stylesheets to the build
if (Array.isArray(stylesheets) || typeof stylesheets === "string") {
  if (!Array.isArray(stylesheets)) {
    stylesheets = [stylesheets];
  }

  module.exports.entry.bundle.unshift.apply(
    module.exports.entry.bundle,
    stylesheets
  );
}

// Load path mapping from tsconfig
const tsconfigPath = path.resolve(__dirname, "tsconfig.json");
const tsconfig = require("fs").existsSync(tsconfigPath)
  ? require(tsconfigPath)
  : {};
if ("compilerOptions" in tsconfig && "paths" in tsconfig.compilerOptions) {
  const aliases = tsconfig.compilerOptions.paths;
  for (const alias in aliases) {
    const paths = aliases[alias].map((p) => path.resolve(__dirname, p));

    if (!(alias in module.exports.resolve.alias) && paths.length) {
      module.exports.resolve.alias[alias] = paths.length > 1 ? paths : paths[0];
    }
  }
}

// These options should only apply to production builds
if (prod) {
  // Clean the build directory for production builds
  module.exports.plugins.push(new CleanWebpackPlugin());

  // Compress assets
  module.exports.plugins.push(
    new BrotliWebpackPlugin({
      test: /\.(js|css|html|svg|png|jpg|wasm)$/,
      threshold: 10240,
      minRatio: 0.8,
    })
  );

  // Minify CSS
  module.exports.optimization.minimizer.push(
    new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        map: sourceMapsInProduction
          ? {
              inline: false,
              annotation: true,
            }
          : false,
      },
      cssProcessorPluginOptions: {
        preset: [
          "default",
          {
            discardComments: {
              removeAll: !sourceMapsInProduction,
            },
          },
        ],
      },
    })
  );

  // Minify and treeshake JS
  // module.exports.optimization.minimizer.push(
  //   new TerserPlugin({
  //     sourceMap: sourceMapsInProduction,
  //     extractComments: false,
  //   })
  // );
}

// Add babel if enabled
if (useBabel && (prod || useBabelInDevelopment)) {
  module.exports.module.rules.unshift({
    test: /\.(?:svelte|m?js)$/,
    include: [path.resolve(__dirname, "src"), path.dirname(sveltePath)],
    use: {
      loader: "babel-loader",
      options: {
        sourceType: "unambiguous",
        presets: ["@babel/preset-env"],
        plugins: ["@babel/plugin-transform-runtime"],
      },
    },
  });
}
