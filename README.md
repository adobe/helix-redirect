# Helix Redirect

> Serve 3xx and internal redirects for Project Helix

## Status
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-redirect.svg)](https://codecov.io/gh/adobe/helix-redirect)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-redirect.svg)](https://circleci.com/gh/adobe/helix-redirect)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-redirect.svg)](https://github.com/adobe/helix-redirect/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-redirect.svg)](https://github.com/adobe/helix-redirect/issues)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/helix-redirect.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/helix-redirect)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/adobe/helix-redirect.svg)](https://greenkeeper.io/)

## Installation

## Usage

```bash
curl https://adobeioruntime.net/api/v1/web/helix/helix-services/redirect@v1
```

For more, see the [API documentation](docs/API.md).

## Development

### Deploying Helix Redirect

Deploying Helix Redirect requires the `wsk` command line client, authenticated to a namespace of your choice. For Project Helix, we use the `helix` namespace.

All commits to master that pass the testing will be deployed automatically. All commits to branches that will pass the testing will get commited as `/helix-services/redirect@ci<num>` and tagged with the CI build number.
