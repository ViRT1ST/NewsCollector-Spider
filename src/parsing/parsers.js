const Parser = require('rss-parser');
const jsdom = require('jsdom');

const utils = require('../utils/utils');
const corrections = require('./corrections');

const rssParser = new Parser();
const { JSDOM } = jsdom;

const getArticlesFromRss = async (subscription) => {
  const { _id: sourceId, site, section, url, removeInTitle } = subscription;

  try {
    const source = await utils.getPageSource(url);
    const feed = await rssParser.parseString(source);

    const articles = feed.items.map(({ title, link }) => {
      return corrections.createFullArticle({
        sourceId,
        site,
        section,
        title,
        link,
        removeInTitle
      });
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromHtml = async (subscription) => {
  const {
    site,
    section,
    url,
    regex,
    removeInTitle,
    _id: sourceId,
  } = subscription;

  try {
    const source = await utils.getPageSource(url);

    const dom = new JSDOM(source);
    const document = dom.window.document;

    const anchorElements = Array.from(document.querySelectorAll('a'));

    const allLinks = anchorElements.map((item) => {
      const data = {
        title: item.textContent,
        link: item.href
      };

      if (item.hasAttribute('title')) {
        data.title = item.getAttribute('title');
      }

      if (data.link.startsWith('/')) {
        data.link = `${new URL(url).origin}${data.link}`;
      }

      return data;
    });

    const goodLinks = allLinks.filter(({ title, link }) => {
      // filter 'Bid now' is temporal fix for freelancer.net
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
      return corrections.createFullArticle({
        sourceId, site, section, title, link, removeInTitle
      });
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromKwork = async (subscription) => {
  const { site, section, url, removeInTitle, _id: sourceId } = subscription;

  try {
    const kworkPage = await utils.getPageSource(url);
    const jsonText = kworkPage
      .split('window.stateData=')[1]
      .split(';</script>')[0];

    const jsonObj = JSON.parse(jsonText);

    const fieldsToFind = ['name', 'id', 'user_id'];
    const foundObjects = utils.findObjectsWithFields(jsonObj, fieldsToFind);

    const articles = foundObjects.map(({ name, id }) => {
      return corrections.createFullArticle({
        sourceId,
        site,
        section,
        removeInTitle,
        title: name,
        link: `https://kwork.ru/projects/${id}`,
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
