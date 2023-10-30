const Parser = require('rss-parser');
const cheerio = require('cheerio');
const entities = require('html-entities');

const { getPageSource, findObjectsWithFields, printInfo } = require('./utils');

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


const getPageTitle = async (url) => {
  try {
    const source = await getPageSource(url);
    const $ = cheerio.load(source);

    const metaTitle = $('meta[property="og:title"]').attr('content');
    const headTitle = $('title').contents().first().text();

    if (metaTitle && metaTitle.length > 3) {
      return metaTitle;
    }

    if (headTitle && headTitle.length > 3) {
      return headTitle;
    }

    return NO_DATA;
  } catch (error) {
    return NO_DATA;
  }
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


const getArticlesFromRss = async (subscription) => {
  try {
    const { _id: sourceId, site, section, url, removeInTitle } = subscription;

    const source = await getPageSource(url);
    const feed = await new Parser().parseString(source);

    const articles = feed.items.map(({ title, link }) => {
      return createFullArticle(sourceId, site, section, title, link, removeInTitle);
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromHtml = async (subscription, custom = null) => {
  try {
    const { _id: sourceId, site, section, url, regex, removeInTitle } = subscription;


    const source = await getPageSource(url);
    const $ = cheerio.load(source);

    const allLinks = $('a').toArray().map((item) => {
      return {
        title: custom === 'tengri'
          ? item.children[0].data
          : item.attribs.title,
        link: custom === 'tengri'
          ? `https://tengrinews.kz${item.attribs.href}`
          : item.attribs.href
      };
    });

    const goodLinks = allLinks.filter(({ title, link }) => {
      return title && !title.includes('\n') && link && link.match(regex);
    });

    const correctedLinks = goodLinks.map(({ title, link }) => {
      return { title, link: correctArticleUrl(link) };
    });

    const uniqueLinks = [
      ...new Map(correctedLinks.map((item) => [item.link, item])).values()
    ];

    const articles = uniqueLinks.map(({ title, link }) => {
      return createFullArticle(sourceId, site, section, title, link, removeInTitle);
    });

    return articles;
  } catch (err) {
    return [];
  }
};

const getArticlesFromKwork = async (subscription) => {
  try {
    const { _id: sourceId, site, section, url, removeInTitle } = subscription;


    const kworkPage = await getPageSource(url);
    const jsonText = kworkPage.split('window.stateData=')[1].split(';</script>')[0];
    const jsonObj = JSON.parse(jsonText);

    const fieldsToFind = ['name', 'id', 'user_id'];
    const foundObjects = findObjectsWithFields(jsonObj, fieldsToFind);

    const articles = foundObjects.map(({ name, id }) => {
      const title = name;
      const link = `https://kwork.ru/projects/${id}`;
      return createFullArticle(sourceId, site, section, title, link, removeInTitle);
    });

    return articles;
  } catch (err) {
    return [];
  }
};


const parseArticles = async (subscriptions) => {
  let articles = [];

  for (let i = 0; i < subscriptions.length; i += 1) {
    const sub = subscriptions[i];

    const { parsingMethod, site, section } = sub;

    printInfo(`Parsing: [${site}: ${section}]`, false);

    if (parsingMethod === 'rss') {
      const fromRss = await getArticlesFromRss(sub);
      articles = [...articles, ...fromRss];
    }

    if (parsingMethod === 'html') {
      const fromHtml = await getArticlesFromHtml(sub);
      articles = [...articles, ...fromHtml];
    }

    if (parsingMethod === 'tengri') {
      const fromTengri = await getArticlesFromHtml(sub, 'tengri');
      articles = [...articles, ...fromTengri];
    }

    if (parsingMethod === 'kwork') {
      const fromKwork = await getArticlesFromKwork(sub);
      articles = [...articles, ...fromKwork];
    }
  }

  printInfo(null, true);

  return articles;
};

module.exports.getPageTitle = getPageTitle;
module.exports.parseArticles = parseArticles;
