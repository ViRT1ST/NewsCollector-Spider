const { printInfo } = require('../utils/utils');

const {
  getArticlesFromRss,
  getArticlesFromHtml,
  getArticlesFromKwork
} = require('./requests');

const parseSources = async (sources) => {
  let articles = [];

  for (let i = 0; i < sources.length; i += 1) {
    const { parsingMethod, site, section } = sources[i];
    const source = sources[i];

    printInfo(`Parsing: [${site}: ${section}]`, false);

    if (parsingMethod === 'rss') {
      const fromRss = await getArticlesFromRss(source);
      articles = [...articles, ...fromRss];
    }

    if (parsingMethod === 'html') {
      const fromHtml = await getArticlesFromHtml(source);
      articles = [...articles, ...fromHtml];
    }

    if (parsingMethod === 'tengri') {
      const fromTengri = await getArticlesFromHtml(source, 'tengri');
      articles = [...articles, ...fromTengri];
    }

    if (parsingMethod === 'kwork') {
      const fromKwork = await getArticlesFromKwork(source);
      articles = [...articles, ...fromKwork];
    }
  }

  printInfo(undefined, true);
  return articles;
};

module.exports = {
  parseSources
};
