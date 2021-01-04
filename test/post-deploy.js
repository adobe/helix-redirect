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
const { createTargets } = require('./post-deploy-utils.js');

chai.use(chaiHttp);
const { expect } = chai;

createTargets().forEach((target) => {
  describe(`Post-Deploy Tests (${target.title()}) #online`, () => {
    before(function beforeAll() {
      if (!target.enabled()) {
        this.skip();
      }
    });

    it('No Redirect', async () => {
      const qs = '?owner=trieloff&repo=helix-demo&ref=528fd4692b6e4cd47ee9a11a133e7c6728b51fe5&path=test.md';
      const url = `${target.urlPath()}${qs}`;
      // eslint-disable-next-line no-console
      console.log(`Trying ${target.host()}${url}`);
      await chai
        .request(target.host())
        .get(url)
        .redirects(0)
        .then((response) => {
          expect(response).to.have.status(204);
        })
        .catch((e) => {
          throw e;
        });
    }).timeout(20000);

    it('302 Redirect', async () => {
      const qs = '?owner=trieloff&repo=helix-demo&ref=528fd4692b6e4cd47ee9a11a133e7c6728b51fe5&path=test.php';
      const url = `${target.urlPath()}${qs}`;
      // eslint-disable-next-line no-console
      console.log(`Trying ${target.host()}${url}`);
      await chai
        .request(target.host())
        .get(url)
        .redirects(0)
        .then((response) => {
          expect(response).to.have.status(302);
        })
        .catch((e) => {
          throw e;
        });
    }).timeout(20000);

    it('/feed Redirect', async () => {
      const qs = '?owner=adobe&repo=theblog&ref=34e880537c4bb787cdc6df0b71fcf76cc496bca5&path=/tags/news/feed';
      const url = `${target.urlPath()}${qs}`;
      // eslint-disable-next-line no-console
      console.log(`Trying ${target.host()}${url}`);
      await chai
        .request(target.host())
        .get(url)
        .redirects(0)
        .then((response) => {
          expect(response).to.have.status(302);
        })
        .catch((e) => {
          throw e;
        });
    }).timeout(20000);

    it('/feed/ Redirect', async () => {
      const qs = '?owner=adobe&repo=theblog&ref=34e880537c4bb787cdc6df0b71fcf76cc496bca5&path=/tags/news/feed/';
      const url = `${target.urlPath()}${qs}`;
      // eslint-disable-next-line no-console
      console.log(`Trying ${target.host()}${url}`);
      await chai
        .request(target.host())
        .get(url)
        .redirects(0)
        .then((response) => {
          expect(response).to.have.status(302);
        })
        .catch((e) => {
          throw e;
        });
    }).timeout(20000);
  });
});
