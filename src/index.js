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
const { Response } = require('node-fetch');
const { wrap } = require('@adobe/openwhisk-action-utils');
const { logger } = require('@adobe/openwhisk-action-logger');
const { wrap: status } = require('@adobe/helix-status');
const RedirectConfig = require('@adobe/helix-shared/src/RedirectConfig');

/**
 * This is the main function
 * @param {Request} req The request
 */
async function main(req) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const ref = searchParams.get('ref');
  const path = searchParams.get('path');
  if (!(owner && repo && ref)) {
    return new Response('missing owner, repo, or ref', {
      status: 400,
    });
  }
  console.log(owner, repo, ref, path);

  const config = await new RedirectConfig()
    .withRepo(owner, repo, ref)
    .init();

  const match = await config.match(path);

  console.log(config);
  if (match && match.type === 'temporary') {
    return new Response('moved temporarily', {
      status: 302,
      headers: {
        Location: match.url,
      },
    });
  } else if (match && match.type === 'permanent') {
    return new Response('moved permanently', {
      status: 301,
      headers: {
        'Cache-Control': 'max-age=30000000',
        Location: match.url,
      },
    });
  } else if (match && match.type === 'internal') {
    return new Response('moved internally', {
      status: 307,
      headers: {
        'HLX-Refetch': 'yes',
        Location: match.url,
      },
    });
  }
  return new Response('No redirect', {
    status: 204, // no content
  });
}

module.exports.main = wrap(main)
  .with(status)
  .with(logger.trace)
  .with(logger);
