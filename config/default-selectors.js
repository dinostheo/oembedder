'use strict';

module.exports = {
  title: { selector: 'h1', text: true },
  providerName: {
    selector: 'meta[property=site_name]',
    attribute: 'content'
  },
  authorName: {
    selector: 'meta[name=author]',
    attribute: 'content'
  },
  thumbnail: {
    selector: 'meta[property="og:image"]',
    attribute: 'content'
  },
  text: {
    selector: 'div[class$=content]',
    text: true
  },
  htmlText: {
    selector: 'div[class$=content]',
    html: true
  }
};
