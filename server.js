const express = require('express');
const path = require('path');
const fs = require('fs');
const glob = require("glob")
const app = express();

const BUNDLES_PATH = path.join(__dirname, 'apps/webpack');
const LOCALE_PATH = path.join(__dirname, 'apps/bundles');

app.set('view engine', 'ejs');

app.use('/app/apps/webpack', express.static(path.join(__dirname, 'apps/webpack')));
app.use('/app/runtime', express.static(path.join(__dirname, 'runtime')));
app.use('/app/apps/bundles', express.static(path.join(__dirname, 'apps/bundles')));

app.get('/', (req, res) => res.render(path.join(__dirname, 'app-list.ejs'), _getAppListParams(true)))

app.get('/app/:app', (req, res) => {
    const app = req.params.app;
    if (_isAppExists(app)) {
        const params = _getParamsForApp(app);
        res.render(path.join(__dirname, 'landing.ejs'), params)
    } else {
        const params = _getAppListParams();
        res.render(path.join(__dirname, 'app-list.ejs'), params)
    }
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))

function _isAppExists(app) {
    const bundle = _getAppBundle(app);
    return !!bundle;
}

function _getParamsForApp(app) {
    return {
        title: app,
        app: app,
        styles: {
            common: ['./apps/webpack', _getAppStyle('common')].join('/'),
            app: ['./apps/webpack', _getAppStyle(app)].join('/')
        },
        runtime: './runtime/ts-9.3.11.js',
        locale: ['./apps/bundles', _getAppLocale('core.locale.en_US')].join('/'),
        bundles: {
            common: ['./apps/webpack', _getAppBundle('common')].join('/'),
            app: ['./apps/webpack', _getAppBundle(app)].join('/')
        }
    }
}

function _getAppListParams(isIndex) {
    const files = glob.sync(path.join(BUNDLES_PATH, 'Tradeshift.*.*.js'), {});
    const apps = files.map(file => {
        const name = path.basename(file);
        const nameParts = name.match(/(\w+).(\w+).*.*/i)
        return [nameParts[1], nameParts[2]].join('.');
    });

    return {
        apps: apps, 
        indexPage: isIndex
    };
}

function _getAppLocale(localePattern) {
    if (!app) {
        return '';
    }
    const bundlePath = path.join(LOCALE_PATH, localePattern + '.*.js');
    return _getFileByPattern(bundlePath);
}

function _getAppBundle(app) {
    if (!app) {
        return '';
    }
    const bundlePath = path.join(BUNDLES_PATH, app + '.*.js');
    return _getFileByPattern(bundlePath);
}

function _getAppStyle(app) {
    if (!app) {
        return '';
    }
    const stylePath = path.join(BUNDLES_PATH, app + '.*.css');
    return _getFileByPattern(stylePath);
}

function _getFileByPattern(pattern) {
    if (!pattern) {
        return '';
    }
    const files = glob.sync(pattern, {});
    return files.length > 0 ? path.basename(files[0]) : '';
}
