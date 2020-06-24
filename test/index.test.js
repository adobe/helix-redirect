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
const index = require('../src/index.js').main;
const { setupPolly } = require('./utils.js');

describe('Index Tests', () => {
  setupPolly({
    recordIfMissing: true,
  });

  it('204 when no path provided', async () => {
    const result = await index({
      owner: 'trieloff',
      repo: 'helix-demo',
      ref: '4e05a4e2c7aac6dd8d5f2b6dcf05815994812d7d',
    });
    assert.equal(result.statusCode, 204);
  });

  it('204 when non-matching path provided', async () => {
    const result = await index({
      owner: 'trieloff',
      repo: 'helix-demo',
      ref: '4e05a4e2c7aac6dd8d5f2b6dcf05815994812d7d',
      path: '/do-not-redirect-me',
    });
    assert.equal(result.statusCode, 204);
  });

  it('302 for PHP', async () => {
    const result = await index({
      owner: 'trieloff',
      repo: 'helix-demo',
      ref: '4e05a4e2c7aac6dd8d5f2b6dcf05815994812d7d',
      path: '/test.php',
    });
    assert.equal(result.statusCode, 302);
  });
});
