'use strict';

const request = require('request');
const sqrap = require('sqrap');
const url = require('url');
const imageSize = require('image-size');
const { defaultSelectors, defaultHttpOptions } = require('./config');

const BASIC_SCHEMA = {
  version: '1.0',
  type: 'link'
};

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

function fixRelativeUrl(srcUrl, parsedUrl) {
  const base = `${parsedUrl.protocol}//${parsedUrl.host}`;

  if (!srcUrl) {
    return base;
  }

  if (/^\//.test(srcUrl)) {
    return `${base}${srcUrl}`;
  }

  return srcUrl;
}

function getThumbnailSize(imageUrl) {
  return new Promise((resolve, reject) => {
    request(
      {
        method: 'GET',
        uri: imageUrl,
        encoding: null
      },
      (error, response, body) => {
        if (error) {
          return reject(error);
        }

        if (response.statusCode !== 200) {
          return reject(new Error(`Thumbnail request status code ${response.statusCode}`));
        }

        resolve(imageSize(body));
      }
    );
  });
}

module.exports = (originUrl, config = {}) =>
  new Promise(async (resolve, reject) => {
    const { selectors = {}, provider, httpOptions = {} } = config;
    const parsedUrl = url.parse(originUrl);
    const mergedSelectors = Object.assign({}, defaultSelectors, selectors);

    if (provider) {
      try {
        const embeddedResource = await fetchProviderOembed(originUrl, provider);

        return resolve(JSON.parse(embeddedResource));
      } catch (error) {
        return reject(error);
      }
    }

    const requestOptions = Object.assign({}, defaultHttpOptions, httpOptions);
    let extractedValues;

    try {
      extractedValues = await sqrap(originUrl, {
        selectors: mergedSelectors,
        httpOptions: requestOptions
      });
    } catch (error) {
      return reject(error);
    }

    BASIC_SCHEMA.title = extractedValues.title;
    BASIC_SCHEMA.provider_url = fixRelativeUrl(extractedValues.providerUrl, parsedUrl);
    BASIC_SCHEMA.provider_name = extractedValues.providerName || parsedUrl.host;
    BASIC_SCHEMA.author_url = fixRelativeUrl(extractedValues.authorUrl, parsedUrl);
    BASIC_SCHEMA.author_name = extractedValues.authorName || parsedUrl.host;
    BASIC_SCHEMA.thumbnail_url = extractedValues.thumbnail;
    BASIC_SCHEMA.text = extractedValues.text;
    BASIC_SCHEMA.htmlText = extractedValues.htmlText;

    try {
      if (BASIC_SCHEMA.thumbnail_url) {
        const { width, height } = await getThumbnailSize(BASIC_SCHEMA.thumbnail_url);

        BASIC_SCHEMA.thumbnail_width = width;
        BASIC_SCHEMA.thumbnail_height = height;
      }
    } catch (thumbnailError) {
      return reject(thumbnailError);
    }

    resolve(BASIC_SCHEMA);
  });
