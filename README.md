# oembedder

Delivers the embedded representation of a URL if one is provided or tries to create on with the information present on the given URL.

# Installation

`npm i oembedder`

# Usage

The `oembedder` module exports a function that accepts two parameters, the url of the resource to get the oEmbed format and a list of providers that have an oEmbed representation of their resources.

## Providers

You can pass the oEmbed providers from [oembed.com](https://oembed.com/#section7), you can create your own providers list or you can do both, as long as it follows the following format.

```json
[
  {
    "provider_url": "https://www.youtube.com/",
    "endpoints": [
      {
        "url": "https://www.youtube.com/oembed"
      }
    ]
  }
]
```

The above JSON properties are the required ones and they are a subset of the provider objects of [oembed.com](https://oembed.com/#section7). If you have a provider that is not included in the list you could follow the instructions and submit it.

The oembedder returns a promise that resolves to the oEmbed format of the requested resource, as a javascript object.

## Example usage

```js
const oembedder = require('oembedder');

const providers = [
  {
    provider_name: 'YouTube',
    provider_url: 'https://www.youtube.com/',
    endpoints: [
      {
        url: 'https://www.youtube.com/oembed',
        discovery: true
      }
    ]
  }
];
const url = 'https://www.youtube.com/watch?v=_avbO-ckwQw';

oembedder(url, providers)
  .then(console.log)
  .catch(console.log);
```

## Example response

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

# Limitations

At the moment the library only resolves oEmbeds of type link for the resources that no provider is given or matched.
