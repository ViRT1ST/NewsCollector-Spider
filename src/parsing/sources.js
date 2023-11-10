const { printInfo, printSeparator } = require('../utils/utils');
const parsers = require('./parsers');

const parsingMethods = {
  rss: parsers.getArticlesFromRss,
  html: parsers.getArticlesFromHtml,
  kwork: parsers.getArticlesFromKwork
};

const parseSources = async (sources) => {
  let articles = [];

  for (let i = 0; i < sources.length; i += 1) {
    const { site, section, parsingMethod } = sources[i];

    printInfo(`Parsing: [${site}: ${section}]`);

    const fromSource = await parsingMethods[parsingMethod](sources[i]);
    articles = articles.concat(fromSource);
  }

  printSeparator();
  return articles;
};

module.exports = parseSources;
