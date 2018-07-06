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

  if (!fieldSelectors) {
    return;
  }

  const { selector, text = false, attribute = null } = fieldSelectors.filter(({ selctr }) =>
    $(selctr)
  )[0];

  if (text) {
    return $(selector)
      .first()
      .text();
  }

  if (attribute) {
    return $(selector)
      .first()
      .attr(attribute);
  }
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

module.exports = (originUrl, config = {}) =>
  new Promise(async (resolve, reject) => {
    const { selectors = {}, provider } = config;
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

        BASIC_SCHEMA.title = extractField($, 'title', selectors);
        BASIC_SCHEMA.provider_url =
          extractField($, 'providerUrl', selectors) || `${parsedUrl.protocol}//${parsedUrl.host}/`;
        BASIC_SCHEMA.provider_name = extractField($, 'providerName', selectors) || parsedUrl.host;
        BASIC_SCHEMA.author_url =
          extractField($, 'authorUrl', selectors) || BASIC_SCHEMA.provider_url;
        BASIC_SCHEMA.author_name = extractField($, 'authorName', selectors) || parsedUrl.host;
        BASIC_SCHEMA.thumbnail_url = extractField($, 'thumbnail', selectors);

        resolve(BASIC_SCHEMA);
      }
    );

    reqStream.on('response', response => {
      if (response.statusCode !== 200) {
        reqStream.emit('error', new Error(`Http status code ${response.statusCode}`));
      } else if (!/text\/html/.test(response.headers['content-type'])) {
        reqStream.emit(
          'error',
          new Error(`Unsupported content type ${response.headers['content-type']}`)
        );
      }
    });
  });
