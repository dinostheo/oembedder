'use strict';

const request = require('request');
const cheerio = require('cheerio');
const url = require('url');

const BASIC_SCHEMA = {
  version: '1.0',
  type: 'link'
};

const TITLE_SELECTORS = ['h1', 'h2', 'div[class$=title]', 'span[class$=title]'];

function extractTitle($) {
  const titleSelector = TITLE_SELECTORS.filter(selector =>
    $(selector).text()
  )[0];

  return $(titleSelector).text();
}

function extractProviderName($) {
  return $('meta[property=site_name]').attr('content');
}

function extractAuthorName($) {
  return $('meta[name=author]').attr('content');
}

function extractThumbnail($) {
  return $('meta[property="og:image"]')
    .first()
    .attr('content');
}

function fetchProviderOembed(originUrl, provider) {
  const oembedUrl = `${provider.endpoints[0].url}?url=${originUrl}&format=json`;

  return new Promise((resolve, reject) => {
    request(oembedUrl, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      resolve(body);
    });
  });
}

module.exports = (originUrl, providers) =>
  new Promise(async (resolve, reject) => {
    const parsedUrl = url.parse(originUrl);
    const providerHostRegEx = new RegExp(parsedUrl.host);
    const matchingProvider =
      providers &&
      providers.filter(provider =>
        providerHostRegEx.test(provider.provider_url)
      )[0];

    if (matchingProvider) {
      try {
        const embeddedResource = await fetchProviderOembed(
          originUrl,
          matchingProvider
        );

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

        $('script').remove();
        $('footer').remove();
        $('style').remove();
        $('link').remove();
        $('title').remove();

        BASIC_SCHEMA.title = extractTitle($);
        BASIC_SCHEMA.provider_url = `${parsedUrl.protocol}//${parsedUrl.host}/`;
        BASIC_SCHEMA.provider_name = extractProviderName($) || parsedUrl.host;
        BASIC_SCHEMA.author_url = BASIC_SCHEMA.provider_url;
        BASIC_SCHEMA.author_name = extractAuthorName($) || parsedUrl.host;
        BASIC_SCHEMA.thumbnail_url = extractThumbnail($);

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
