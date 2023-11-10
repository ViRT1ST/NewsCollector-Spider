const entities = require('html-entities');

const constants = require('../config/constants');

const { NO_DATA } = constants;

const correctArticleTitle = (title, removeInTitle) => {
  let result = entities.decode(title);
  result = result.replace(removeInTitle, '');
  result = result.replaceAll("'", '’');
  result = result.replaceAll("'", '’');
  result = result.replaceAll('|', '-');
  result = result.replaceAll('\n', '');
  result = result.trim();

  if (title.match(/^.?(node|express|api).?$/g)) {
    result = `!!! ${result}`;
  }

  return result.length > 3 ? result : NO_DATA;
};

const correctArticleLink = (url) => {
  let result = url;
  result = result.includes('dtf.ru') ? result.split('-')[0] : result;
  result = result.includes('?') ? result.split('?')[0] : result;
  result = result.includes('#') ? result.split('#')[0] : result;
  result = result.includes("'") ? result.replaceAll("'", '%27') : result;
  return result;
};

const createArticle = (sixFieldsObj) => {
  const { sourceId, site, section, title, link, removeInTitle } = sixFieldsObj;

  return {
    sourceId,
    site,
    section,
    title: correctArticleTitle(title, removeInTitle),
    url: correctArticleLink(link),
  };
};

module.exports = {
  correctArticleTitle,
  correctArticleLink,
  createArticle
};
