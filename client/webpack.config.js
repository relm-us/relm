const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const Preprocess = require("svelte-preprocess");
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

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
const stylesheets = ["./styles/index.scss"];

module.exports = {
  // Production or Development mode
  mode,

  /**
   * The "entry" is where webpack starts looking for imports and other parts of the
   * app. It produces a bundle.js file (or in our case, multiple chunked bundles
   * due to our needing async wasm support).
   */
  entry: {
    bundle: [
      // Note: Paths in the `stylesheets` variable will be added here
      // automatically
      "./src/main/index.ts",
    ],
  },

  /**
   * When building for production, follow the output pattern to generate bundled js.
   */
  output: {
    filename: "[name].js",
    chunkFilename: "[name].[id].[contenthash].js",
    path: __dirname + "/dist",
    publicPath: "/",
  },

  /**
   * The DevServer is used only in development. It's purpose is to speed up the dev
   * cycle by making it easier to cache parts of the app so that load time is faster.
   */
  devServer: {
    hot: false,
    port: 8080,
    stats: "minimal", // use "normal" to show what chunks are built and what files are copied
    contentBase: "public", // direct the DevServer to serve static files from public/
    watchContentBase: true,
    compress: true,
    historyApiFallback: true,
  },

  /**
   * Direct webpack to understand our app's internal patterns for imports. For example,
   * we use the `~/` prefix to denote the "root" of the project.
   */
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
    extensions: [".mjs", ".js", ".ts", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },

  /**
   * Modules are like plugins, but for specific file types.
   */
  module: {
    rules: [
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            dev: !prod,
            emitCss: prod,
            onwarn(warning, onwarn) {
              if (!/A11y:/.test(warning.message)) {
                onwarn(warning);
              }
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
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),

    /**
     * Useful for detecting issues with svelte components, for example, which sometimes
     * try to sneak in another copy of the svelte compiler's prolog
     */
    new DuplicatePackageCheckerPlugin(),

    /**
     * This plugin analyzes all of our imports & chunks, and produces an HTML
     * file that suitably loads the initial resources (e.g. CSS) and chunks
     * (i.e. chunked JS bundles)
     */
    new HtmlWebpackPlugin({
      title: "Relm",

      // Use the template at src/index.html to produce dist/index.html
      template: "src/index.html",

      // for aesthetics; makes index.html stay formatted
      minify: false,

      // We can pass any parameters we want to the ejs parser that processes "src/index.html"
      templateParameters: {
        relmServer: process.env.RELM_SERVER ?? "http://localhost:3000",
      },
    }),

    /**
     * In production: Copy our static files from public/ to dist/
     */
    new CopyWebpackPlugin([{ from: "public", to: "." }]),
  ],
  optimization: {
    minimizer: [],

    /**
     * We need a separate chunk for @dimforge/rapier3d so that TerserPlugin can
     * exclude it from optimization, so that the physics engine wasm bundle will
     * work on iOS devices. See https://stackoverflow.com/a/58133835/159344.
     */
    splitChunks: {
      cacheGroups: {
        dimforge: {
          test: /[\\/]node_modules[\\/](@dimforge)[\\/]/,
          name: "dimforge",
        },
      },
      chunks: "async",
    },

    /**
     * For HECS to work, we need to prevent module concatenation from mangling
     * class names. See https://github.com/gohyperr/hecs/issues/31
     */
    concatenateModules: false,
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
  module.exports.optimization.minimizer.push(
    new TerserPlugin({
      sourceMap: sourceMapsInProduction,
      extractComments: false,
      // Exclude physics engine glue javascript (necessary for iOS devices)
      exclude: "dimforge",
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      },
    })
  );
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
