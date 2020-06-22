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
const { wrap } = require('@adobe/openwhisk-action-utils');
const { logger } = require('@adobe/openwhisk-action-logger');
const { wrap: status } = require('@adobe/helix-status');
const { epsagon } = require('@adobe/helix-epsagon');
const { RedirectConfig } = require('@adobe/helix-shared');

/**
 * This is the main function
 * @param {string} name name of the person to greet
 * @returns {object} a greeting
 */
async function main({ owner, repo, ref, path }) {

  const config = await new RedirectConfig()
    .withRepo(owner, repo, ref)
    .init();

  const { url, type } = config.match(path);

  if (type === 'temporary') {
    return {
      statusCode: 302,
      body: `moved temporarily <a href="${url}">here</a>`,
      headers: {
        Location: url
      }
    }
  } else if (type === 'permanent') {
    return {
      statusCode: 302,
      body: `moved permanently <a href="${url}">here</a>`,
      headers: {
        'Cache-Control': 'max-age=30000000',
        Location: url
      }
    }
  } else if (type === 'internal') {
    return {
      statusCode: 307,
      body: `moved internally <a href="${url}">here</a>`,
      headers: {
        'HLX-Refetch': 'yes',
        Location: url
      }
    }
  }
  return {
    statusCode: 204, // no content
    body: `No redirect`,
  };
}

module.exports.main = wrap(main)
  .with(epsagon)
  .with(status)
  .with(logger.trace)
  .with(logger);
