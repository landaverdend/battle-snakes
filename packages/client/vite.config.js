"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    server: {
        port: 3000,
    },
    envDir: path_1.default.resolve(__dirname, './'),
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
            '@components': path_1.default.resolve(__dirname, './src/components'),
            '@game': path_1.default.resolve(__dirname, './src/game'),
            '@views': path_1.default.resolve(__dirname, './src/views'),
            '@state': path_1.default.resolve(__dirname, './src/state'),
            '@service': path_1.default.resolve(__dirname, './src/service'),
        },
    },
    optimizeDeps: {
        include: ['@battle-snakes/shared'], // Explicitly include the shared package
    },
});
