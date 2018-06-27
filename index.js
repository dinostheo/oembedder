'use strict';

const request = require('request');
const cheerio = require('cheerio');
const url = require('url');
const { defaultSelectors } = require('./config');

const BASIC_SCHEMA = {
  version: '1.0',
  type: 'link'
};

function extractField($, field, selectors) {
  const fieldSelectors = selectors[field] || defaultSelectors[field];
  const fieldSelector = fieldSelectors.filter(({ selector }) => $(selector))[0];

  const { selector, text = false, attribute = null } = fieldSelector;

  if (text) {
    return $(selector)
      .first()
      .text();
  } else if (attribute) {
    return $(selector)
      .first()
      .attr(attribute);
  }

  return '';
}

function fetchProviderOembed(originUrl, provider) {
  const oembedUrl = `${provider}?url=${originUrl}&format=json`;

  return new Promise((resolve, reject) => {
    request(oembedUrl, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      resolve(body);
    });
  });
}

module.exports = (originUrl, provider) =>
  new Promise(async (resolve, reject) => {
    const parsedUrl = url.parse(originUrl);

    if (provider) {
      try {
        const embeddedResource = await fetchProviderOembed(originUrl, provider);

        return resolve(JSON.parse(embeddedResource));
      } catch (error) {
        return reject(error);
      }
    }

    const reqStream = request(
      {
        method: 'GET',
        uri: originUrl,
        gzip: true
      },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }

        const $ = cheerio.load(body);

        // FIXME: read the empty hardcoded selectors from the given configuration.
        BASIC_SCHEMA.title = extractField($, 'title', {});
        BASIC_SCHEMA.provider_url = `${parsedUrl.protocol}//${parsedUrl.host}/`;
        BASIC_SCHEMA.provider_name =
          extractField($, 'providerName', {}) || parsedUrl.host;
        BASIC_SCHEMA.author_url = BASIC_SCHEMA.provider_url;
        BASIC_SCHEMA.author_name =
          extractField($, 'authorName', {}) || parsedUrl.host;
        BASIC_SCHEMA.thumbnail_url = extractField($, 'thumbnail', {});

        resolve(BASIC_SCHEMA);
      }
    );

    reqStream.on('response', response => {
      if (response.statusCode !== 200) {
        reqStream.emit(
          'error',
          new Error(`Http status code ${response.statusCode}`)
        );
      } else if (!/text\/html/.test(response.headers['content-type'])) {
        reqStream.emit(
          'error',
          new Error(
            `Unsupported content type ${response.headers['content-type']}`
          )
        );
      }
    });
  });
