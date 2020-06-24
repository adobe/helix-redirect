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
const RedirectConfig = require('@adobe/helix-shared/src/RedirectConfig');

/**
 * This is the main function
 * @param {string} name name of the person to greet
 * @returns {object} a greeting
 */
async function main({
  owner, repo, ref, path,
}) {
  if (!(owner && repo && ref)) {
    return {
      statusCode: 400,
      body: 'missing owner, repo, or ref',
    };
  }

  const config = await new RedirectConfig()
    .withRepo(owner, repo, ref)
    .init();

  const match = await config.match(path);

  if (match && match.type === 'temporary') {
    return {
      statusCode: 302,
      body: `moved temporarily <a href="${match.url}">here</a>`,
      headers: {
        Location: match.url,
      },
    };
  } else if (match && match.type === 'permanent') {
    return {
      statusCode: 301,
      body: `moved permanently <a href="${match.url}">here</a>`,
      headers: {
        'Cache-Control': 'max-age=30000000',
        Location: match.url,
      },
    };
  } else if (match && match.type === 'internal') {
    return {
      statusCode: 307,
      body: `moved internally <a href="${match.url}">here</a>`,
      headers: {
        'HLX-Refetch': 'yes',
        Location: match.url,
      },
    };
  }
  return {
    statusCode: 204, // no content
    body: 'No redirect',
  };
}

module.exports.main = wrap(main)
  .with(epsagon)
  .with(status)
  .with(logger.trace)
  .with(logger);
