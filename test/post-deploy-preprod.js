/*
 * Copyright 2020 Adobe. All rights reserved.
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
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');
const packjson = require('../package.json');

chai.use(chaiHttp);
const { expect } = chai;

function getbaseurl() {
  const namespace = 'helix';
  const package = 'helix-services';
  const name = packjson.name.replace('@adobe/helix-', '');
  let version = `${packjson.version}`;
  if (process.env.CI && process.env.CIRCLE_BUILD_NUM && process.env.CIRCLE_BRANCH !== 'master') {
    version = `ci${process.env.CIRCLE_BUILD_NUM}`;
  }
  return `api/v1/web/${namespace}/${package}/${name}@${version}`;
}

describe('Post-Deploy Tests on Preprod', () => {
  it('No Redirect', async () => {
    const qs = '?owner=trieloff&repo=helix-demo&ref=528fd4692b6e4cd47ee9a11a133e7c6728b51fe5&path=test.md';
    // eslint-disable-next-line no-console
    console.log(`Trying https://adobeioruntime.net/${getbaseurl()}${qs}`);

    await chai
      .request('https://adobeioruntime.net/')
      .get(`${getbaseurl()}${qs}`)
      .redirects(0)
      .then((response) => {
        expect(response).to.have.status(204);
      })
      .catch((e) => {
        throw e;
      });
  }).timeout(100000);

  it('302 Redirect', async () => {
    const qs = '?owner=trieloff&repo=helix-demo&ref=528fd4692b6e4cd47ee9a11a133e7c6728b51fe5&path=test.php';
    // eslint-disable-next-line no-console
    console.log(`Trying https://adobeioruntime.net/${getbaseurl()}${qs}`);

    await chai
      .request('https://adobeioruntime.net/')
      .get(`${getbaseurl()}${qs}`)
      .redirects(0)
      .then((response) => {
        expect(response).to.have.status(302);
      })
      .catch((e) => {
        throw e;
      });
  }).timeout(100000);
});
