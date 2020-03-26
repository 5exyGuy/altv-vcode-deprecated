const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: {
        main: path.resolve(__dirname, "../src", "index.js")
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dist/'),
        publicPath: path.join(__dirname, '../dist/')
    },
    devServer: {
        port: 3042,
        historyApiFallback: true,
        overlay: true,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: [/node_modules/],
                use: [{ loader: "babel-loader" }]
            },
            {
                test: /.*\.(gif|png|jp(e*)g|svg)$/i,
                use: [
                    {
                        loader: "url-loader",
                        options: {
                            limit: 21000,
                            name: "images/[name]_[hash:7].[ext]"
                        }
                    }
                ]
            },
            // Vendor CSS loader
            // This is necessary to pack third party libraries like antd
            {
                test: /\.css$/,
                include: path.resolve(__dirname, './src'),
                use: [
                    {
                        loader: 'style-loader',
                    }, 
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            namedExport: true,
                        },
                    }
                ]
            },
            {
                test: /\.css$/,
                include: path.resolve(__dirname, './node_modules/monaco-editor'),
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader']
            },
            {
                test: /\.less$/,
                use: [
                    {loader: "style-loader"},
                    {loader: "css-loader"},
                    {loader: "less-loader",
                        options: {
                            javascriptEnabled: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname, '../public', 'index.html'),
        }),
        new MonacoWebpackPlugin({languages: ['javascript']})
    ],
    resolve: {
        extensions: ['.js', '.jsx', '.less']
    },
}
