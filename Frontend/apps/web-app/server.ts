import 'zone.js/dist/zone-node';
import { enableProdMode } from '@angular/core';
// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import { join } from 'path';
import { CSD_GRAPHQL_UNIVERSAL_HOST } from './src/app/core/core.types';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const HOST = process.env.CSD_WEBAPP_FRONTEND_WEBAPP_SSR_HOST;
const PORT = process.env.CSD_WEBAPP_FRONTEND_WEBAPP_SSR_HTTP_PORT || 4200;
const graphqlHost = `http://${process.env.CSD_WEBAPP_SERVER_WEBAPP_HOST}:${process.env.CSD_WEBAPP_SERVER_WEBAPP_HTTP_PORT}`;
const DIST_FOLDER = join(process.cwd(), 'dist', 'apps', 'webapp', 'browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('../../dist/apps/webapp/server/main');

const ROUTES_RENDER_SERVER_SIDE = ['/', '/auth/login', '/signup', '/version'];

function renderServerSide(req, res) {
  res.render('index', {
    req,
    providers: [
      { provide: 'REQUEST', useValue: req },
      { provide: CSD_GRAPHQL_UNIVERSAL_HOST, useValue: graphqlHost },
    ],
  });
}

function renderNoServerSide(req, res) {
  res.sendFile(join(DIST_FOLDER, 'index.html'));
}

function renderStaticRessource(req, res) {
  return express.static(DIST_FOLDER, {
    maxAge: '1y',
  });
}

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine(
  'html',
  ngExpressEngine({
    bootstrap: AppServerModuleNgFactory,
    providers: [provideModuleMap(LAZY_MODULE_MAP)],
  })
);

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

app.get('*.*', renderStaticRessource);
app.get('*', renderServerSide);

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node Express server listening on http://${HOST}:${PORT}`);
});
