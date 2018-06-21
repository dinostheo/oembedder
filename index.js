'use strict';

const request = require('request');
const cheerio = require('cheerio');
const url = require('url');

const BASIC_SCHEMA = {
  version: '1.0',
  type: 'link',
  thumbnail_width: '',
  thumbnail_height: ''
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

module.exports = originUrl =>
  new Promise((resolve, reject) => {
    const reqStream = request(
      {
        method: 'GET',
        uri: originUrl,
        gzip: true
      },
      (error, response, body) => {
        if (error) {
          return error;
        }

        const $ = cheerio.load(body);

        $('script').remove();
        $('footer').remove();
        $('style').remove();
        $('link').remove();
        $('title').remove();

        const parsedUrl = url.parse(originUrl);

        BASIC_SCHEMA.title = extractTitle($);
        BASIC_SCHEMA.provider_url = `${parsedUrl.protocol}//${parsedUrl.host}`;
        BASIC_SCHEMA.provider_name = extractProviderName($) || parsedUrl.host;
        BASIC_SCHEMA.author_url = BASIC_SCHEMA.provider_url;
        BASIC_SCHEMA.author_name = extractAuthorName($) || parsedUrl.host;
        BASIC_SCHEMA.thumbnail_url = extractThumbnail($);

        resolve(BASIC_SCHEMA);
      }
    );

    reqStream.on('response', res => {
      if (res.statusCode !== 200) {
        reqStream.emit(
          'error',
          new Error(`Http status code ${res.statusCode}`)
        );
      } else if (!/text\/html/.test(res.headers['content-type'])) {
        reqStream.emit(
          'error',
          new Error(`Unsupported content type ${res.headers['content-type']}`)
        );
      }
    });
  });
