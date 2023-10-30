const entities = require('html-entities');

const constants = require('../config/constants');

const { NO_DATA } = constants;

const correctArticleTitle = (title, removeInTitle) => {
  let result = entities.decode(title);
  result = result.replace(removeInTitle, '');
  result = result.replace("'", '’');
  result = result.replace("'", '’');
  result = result.replace('|', '-');
  result = result.trim();
  return result.length > 3 ? result : NO_DATA;
};

const correctArticleUrl = (url) => {
  let result = url;
  result = result.includes('dtf.ru') ? result.split('-')[0] : result;
  result = result.includes('?') ? result.split('?')[0] : result;
  result = result.includes('#') ? result.split('#')[0] : result;
  result = result.includes("'") ? result.replaceAll("'", '%27') : result;
  return result;
};

const createFullArticle = (sourceId, site, section, title, link, removeInTitle) => {
  return {
    sourceId,
    site,
    section,
    title: correctArticleTitle(title, removeInTitle),
    url: correctArticleUrl(link),
  };
};

module.exports = {
  correctArticleTitle,
  correctArticleUrl,
  createFullArticle
};
