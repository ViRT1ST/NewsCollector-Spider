const { printInfo } = require('../utils/utils');
const parsers = require('./parsers');

const parseSources = async (sources) => {
  let articles = [];

  for (let i = 0; i < sources.length; i += 1) {
    const { parsingMethod, site, section } = sources[i];

    printInfo(`Parsing: [${site}: ${section}]`, false);

    if (parsingMethod === 'rss') {
      const fromRss = await parsers.getArticlesFromRss(sources[i]);
      articles = articles.concat(fromRss);
    }

    if (parsingMethod === 'html') {
      const fromHtml = await parsers.getArticlesFromHtml(sources[i]);
      articles = articles.concat(fromHtml);
    }

    if (parsingMethod === 'kwork') {
      const fromKwork = await parsers.getArticlesFromKwork(sources[i]);
      articles = articles.concat(fromKwork);
    }
  }

  printInfo(null, true);
  return articles;
};

module.exports = parseSources;
