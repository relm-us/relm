process.traceDeprecation = true;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const DuplicatePackageCheckerPlugin = require("@cerner/duplicate-package-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { ProvidePlugin } = require("webpack");

const Preprocess = require("svelte-preprocess");

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";
const path = require("path");
const sveltePath = path.resolve("node_modules", "svelte");

const dotenv = require("dotenv");
dotenv.config();

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

// Point the client to the server; default is for development mode
const relmServer = process.env.RELM_SERVER ?? "http://localhost:3000";

const htmlPages = {
  "src/index.html.handlebars": {
    filename: "index.html",
    chunks: ["index"],
  },
  "src/dashboard.html.handlebars": {
    filename: "dashboard.html",
    chunks: ["dashboard"],
  },
};

module.exports = {
  // Production or Development mode
  mode,

  // Summarize the webpacking process at the end;
  // Other options include: 'minimal', 'detailed', or 'verbose'
  stats: "normal",

  /**
   * The "entry" is where webpack starts looking for imports and other parts of the
   * app. It produces a main.js file (or in our case, multiple chunked bundles
   * due to our needing async wasm support).
   */
  entry: {
    index: [
      /**
       * The main entry for the 3D app; imported dependencies will be bundled
       */
      "./src/main/index.ts",

      /**
       * One or more stylesheets to compile and add to the beginning of the bundle. By
       * default, SASS, SCSS and CSS files are supported. The order of this array is
       * important, as the order of outputted styles will match. Svelte component
       * styles will always appear last in the bundle.
       */
      "./styles/index.scss",
    ],

    dashboard: [
      /**
       * The main entry for our dashboard app
       */
      "./src/main2d/index.ts",
    ],
  },

  /**
   * When building for production, follow the output pattern to generate bundled js.
   */
  output: {
    filename: prod ? "[name].[contenthash].js" : "[name].js",
    chunkFilename: "[name].[contenthash].js",
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
    static: [{ directory: path.join(__dirname, "public") }],
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
    fallback: {
      crypto: false,
      buffer: false,
      http: false,
      assert: false,
    },
    extensions: [".js", ".ts", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },

  experiments: {
    asyncWebAssembly: true,
  },

  /**
   * Modules are like plugins, but for specific file types.
   */
  module: {
    rules: [
      { test: /\.handlebars$/, loader: "handlebars-loader" },
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
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: !prod || sourceMapsInProduction,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("autoprefixer")],
              },
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
          },
          {
            loader: "css-loader",
            options: {
              sourceMap: !prod || sourceMapsInProduction,
            },
          },
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
        test: /\.(png|jpe?g|gif|svg|glb)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
    ],
  },

  plugins: [
    new ProvidePlugin({ process: "process/browser.js" }),

    /**
     * Extract CSS into its own files
     */
    new MiniCssExtractPlugin({
      filename: prod ? "[name].[contenthash].css" : "[name].css",
    }),

    /**
     * Useful for detecting issues with svelte components, for example, which sometimes
     * try to sneak in another copy of the svelte compiler's prolog
     */
    new DuplicatePackageCheckerPlugin({
      exclude(instance) {
        // We know about the following library duplications, but it is safe to ignore
        return ["abstract-leveldown", "buffer", "events"].includes(
          instance.name
        );
      },
    }),

    /**
     * In production: Copy our static files from public/ to dist/
     */
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "." }],
    }),
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
      chunks: "all",
      minSize: 50000,
      maxSize: 500000,
    },

    /**
     * For HECS to work, we need to prevent module concatenation from mangling
     * class names. See https://github.com/gohyperr/hecs/issues/31
     */
    concatenateModules: false,
  },
  devtool: prod && !sourceMapsInProduction ? false : "source-map",
};

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

// Use HtmlWebpackPlugin to generate each of the static html pages; e.g. index.html
for (let [template, options] of Object.entries(htmlPages)) {
  /**
   * This plugin analyzes all of our imports & chunks, and produces an HTML
   * file that suitably loads the initial resources (e.g. CSS) and chunks
   * (i.e. chunked JS bundles)
   */
  module.exports.plugins.push(
    new HtmlWebpackPlugin({
      title: process.env.RELM_TITLE ?? "Relm",

      // e.g. template at src/index.html.handlebars
      template,

      // for aesthetics; makes HTML page keep its white-space formatting
      minify: false,

      // We can pass any parameters we want to the ejs parser that processes "src/index.html"
      templateParameters: {
        config: {
          assetsUrl: process.env.RELM_ASSETS_URL ?? `${relmServer}/asset`,
          fontsUrl:
            process.env.RELM_FONTS_URL ??
            "https://fonts.bunny.net/css" /* "https://fonts.googleapis.com/css" */,
          langDefault: process.env.RELM_LANG_DEFAULT ?? "en",
          // The URL of the relm-server (backend) we will connect to:
          server: relmServer,
        },
        analyticsScript: process.env.RELM_ANALYTICS_SCRIPT ?? null,
      },

      // Override any of the above with options passed in via htmlPages
      ...options,
    })
  );
}

// These options should only apply to production builds
if (prod) {
  // Clean the build directory for production builds
  module.exports.plugins.push(new CleanWebpackPlugin());

  // Compress assets
  module.exports.plugins.push(
    new CompressionPlugin({
      test: /\.(js|css|html|svg|png|jpg|wasm)$/,
      algorithm: "brotliCompress",
      threshold: 10240,
      minRatio: 0.8,
    })
  );

  // Minify CSS
  module.exports.optimization.minimizer.push(
    new OptimizeCSSAssetsPlugin({
      minimizerOptions: {
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
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true,
      },
      exclude: "dimforge",
      extractComments: false,
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
