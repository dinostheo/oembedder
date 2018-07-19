'use strict';

module.exports = {
  title: [
    { selector: 'h1', text: true },
    { selector: 'h2', text: true },
    { selector: 'div[class$=title]', text: true },
    { selector: 'span[class$=title]', text: true }
  ],
  providerName: [
    {
      selector: 'meta[property=site_name]',
      attribute: 'content'
    }
  ],
  authorName: [
    {
      selector: 'meta[name=author]',
      attribute: 'content'
    }
  ],
  thumbnail: [
    {
      selector: 'meta[property="og:image"]',
      attribute: 'content'
    }
  ],
  text: [
    {
      selector: 'section[class$=content]',
      text: true
    },
    {
      selector: 'div[class$=content]',
      text: true
    }
  ]
};
