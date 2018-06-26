# oembedder

Delivers the embedded representation of a URL if one is provided or tries to create on with the information present on the given URL.

# Installation

`npm i oembedder`

# Usage

The `oembedder` module exports a function that accepts two parameters, the url of the resource to get the oEmbed format and the url of the provider that have an oEmbed representation of their resources, if this is known.

## Provider

You can find the oEmbed provider from the [oembed.com](https://oembed.com/#section7) list, or you might know a provider that is not listed there.

_Example provider for youtube:_

```json
{
  "provider_name": "YouTube",
  "provider_url": "https://www.youtube.com/",
  "endpoints": [
    {
      "url": "https://www.youtube.com/oembed",
      "discovery": true
    }
  ]
}
```

The above JSON is retrieved from [oembed.com](https://oembed.com/#section7) and the library expects the `https://www.youtube.com/oembed` endpoint from the `endpoints` array.

**_If you have a provider that is not included in the list you could follow the instructions and submit it._**

The oembedder returns a promise that resolves to the oEmbed format of the requested resource, as a javascript object.

### Example usage with provider

_Usage:_

```js
const oembedder = require('oembedder');

const provider = 'https://www.youtube.com/oembed';
const url = 'https://www.youtube.com/watch?v=_avbO-ckwQw';

oembedder(url, provider)
  .then(console.log)
  .catch(console.log);
```

_Response_

```js
{
  author_url: 'https://www.youtube.com/user/NBA',
  type: 'video',
  provider_url: 'https://www.youtube.com/',
  thumbnail_url: 'https://i.ytimg.com/vi/_avbO-ckwQw/hqdefault.jpg',
  thumbnail_width: 480,
  html: '<iframe width="480" height="270" src="https://www.youtube.com/embed/_avbO-ckwQw?feature=oembed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>',
  provider_name: 'YouTube',
  thumbnail_height: 360,
  height: 270,
  title: '2018 NBA Finals Game 4 Mini-Movie',
  author_name: 'NBA',
  version: '1.0',
  width: 480
}
```

### Example usage without provider

If you don't know the provider or there is no oEmbed provider to a specific url. The library will try to resolve the oEmbed format of the resource.

_Usage:_

```js
const oembedder = require('oembedder');

const url =
  'http://www.bbc.com/capital/story/20180626-why-owls-might-suffer-in-a-cashless-society';

oembedder(url)
  .then(console.log)
  .catch(console.log);
```

_Response_

```js
{
  version: '1.0',
  type: 'link',
  title: 'The strange reason owl theft may be on the rise ',
  provider_url: 'http://www.bbc.com/',
  provider_name: 'www.bbc.com',
  author_url: 'http://www.bbc.com/',
  author_name: 'Richard Gray',
  thumbnail_url:'http://ichef.bbci.co.uk/wwfeatures/live/624_351/images/live/p0/6c/29/p06c29f1.jpg'
}
```

# Limitations

At the moment the library only resolves oEmbeds of type link for the resources that no provider is given or matched.
