const Parser = require('rss-parser');
const jsdom = require('jsdom');

const utils = require('../utils/utils');
const corrections = require('./corrections');

const rssParser = new Parser();
const { JSDOM } = jsdom;

const getArticlesFromRss = async (source) => {
  const { site, section, url, removeInTitle, _id: sourceId } = source;

  try {
    const pageSource = await utils.getPageSource(url);
    const feed = await rssParser.parseString(pageSource);

    const articles = feed.items.map(({ title, link }) => {
      return corrections.createArticle({
        sourceId, site, section, title, link, removeInTitle
      });
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromHtml = async (source) => {
  const { site, section, url, regex, removeInTitle, _id: sourceId } = source;

  try {
    const pageSource = await utils.getPageSource(url);

    const dom = new JSDOM(pageSource);
    const document = dom.window.document;

    const links = Array.from(document.querySelectorAll('a')).map((item) => {
      return {
        title: item.hasAttribute('title')
          ? item.getAttribute('title')
          : item.textContent,
        link: item.href.startsWith('/')
          ? `${new URL(url).origin}${item.href}`
          : item.href
      };
    });

    const goodLinks = links.filter(({ title, link }) => {
      return link && link.match(regex) && !title.includes('Bid now');
    });

    const correctedLinks = goodLinks.map(({ title, link }) => {
      return {
        title: corrections.correctArticleTitle(title),
        link: corrections.correctArticleLink(link)
      };
    });

    const uniqueLinks = [
      ...new Map(correctedLinks.map((item) => [item.link, item])).values()
    ];

    const articles = uniqueLinks.map(({ title, link }) => {
      return corrections.createArticle({
        sourceId, site, section, title, link, removeInTitle
      });
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromKwork = async (source) => {
  const { site, section, url, removeInTitle, _id: sourceId } = source;

  try {
    const pageSource = await utils.getPageSource(url);
    const jsonText = pageSource
      .split('window.stateData=')[1]
      .split(';</script>')[0];

    const jsonObj = JSON.parse(jsonText);

    const fieldsToFind = ['name', 'id', 'user_id'];
    const foundObjects = utils.findObjectsWithFields(jsonObj, fieldsToFind);

    const articles = foundObjects.map((item) => {
      const title = item.name;
      const link = `https://kwork.ru/projects/${item.id}`;

      return corrections.createArticle({
        sourceId, site, section, title, link, removeInTitle
      });
    });

    return articles;
  } catch (err) {
    return [];
  }
};

module.exports = {
  getArticlesFromRss,
  getArticlesFromHtml,
  getArticlesFromKwork
};
