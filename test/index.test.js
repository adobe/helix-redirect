/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */
process.env.HELIX_FETCH_FORCE_HTTP1 = 'true';

const assert = require('assert');
const querystring = require('querystring');
const { main } = require('../src/index.js');
const { setupPolly } = require('./utils.js');

function retrofit(fn) {
  const resolver = {
    createURL({ package, name, version }) {
      return new URL(`https://adobeioruntime.net/api/v1/web/helix/${package}/${name}@${version}`);
    },
  };
  return async (params = {}, env = {}) => {
    const resp = await fn({
      url: `https://helix.com/redirect?${querystring.encode(params)}`,
      headers: new Map(Object.entries(params.__ow_headers || {})),
    }, {
      resolver,
      env,
    });
    return {
      statusCode: resp.status,
      body: String(resp.body),
      headers: [...resp.headers.keys()].reduce((result, key) => {
        // eslint-disable-next-line no-param-reassign
        result[key] = resp.headers.get(key);
        return result;
      }, {}),
    };
  };
}

const index = retrofit(main);

describe('Index Tests', () => {
  setupPolly({
    recordIfMissing: false,
  });

  it('400 when params missing', async () => {
    const result = await index({});
    assert.equal(result.statusCode, 400);
  });

  it('204 when no path provided', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch1/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: (.*).php
    to: $1.html
    type: temporary
      `);
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch1',
    });
    assert.equal(result.statusCode, 204);
  });

  it('204 when non-matching path provided', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch2/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: (.*).php
    to: $1.html
    type: temporary
      `);
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch2',
      path: '/do-not-redirect-me',
    });
    assert.equal(result.statusCode, 204);
  });

  it('301 for PHP', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch3/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: (.*).php
    to: $1.html
      `);
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch3',
      path: '/test.php',
    });
    assert.equal(result.statusCode, 301);
  });

  it('301 for dynamic redirect with json', async function test() {
    const { server } = this.polly;
    const data = {
      total: 1,
      offset: 0,
      limit: 1,
      data: [
        {
          Source: '/tag/coronavirus/',
          Destination: 'https://blog.adobe.com/en/topics/covid-19.html',
          Notes: '',
        },
      ],
    };

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch7/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - https://master--theblog--adobe.hlx.page/redirects.json
      `);
      });

    server
      .get('https://master--theblog--adobe.hlx.page/redirects.json')
      .intercept((req, res) => {
        res.status(200).send(JSON.stringify(data));
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch7',
      path: '/tag/coronavirus/',
    });
    assert.equal(result.statusCode, 301);
    assert.equal(result.headers.location, 'https://blog.adobe.com/en/topics/covid-19.html');
  });

  it('Temp Redirect', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch4/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: (.*).php
    to: $1.html
    type: temporary
      `);
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch4',
      path: '/test.php',
    });
    assert.equal(result.statusCode, 302);
  });

  it('Internal Redirect', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch5/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: (.*).php
    to: $1.html
    type: internal
      `);
      });

    const result = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch5',
      path: '/test.php',
    });
    assert.equal(result.statusCode, 307);
  });

  it('Feed Redirect', async function test() {
    const { server } = this.polly;

    server
      .get('https://raw.githubusercontent.com/adobe/theblog/branch6/:path')
      .intercept((req, res) => {
        res.status(200).send(`
redirects:
  - from: .*/feed/$
    to: /feed.xml
    type: temporary
  - from: .*/feed$
    to: /feed.xml
    type: temporary
      `);
      });

    const result1 = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch6',
      path: '/tags/news/feed',
    });
    assert.equal(result1.statusCode, 302);

    const result2 = await index({
      owner: 'adobe',
      repo: 'theblog',
      ref: 'branch6',
      path: '/tags/news/feed/',
    });
    assert.equal(result2.statusCode, 302);
  });
});
