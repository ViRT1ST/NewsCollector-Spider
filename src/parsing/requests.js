const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');
const Parser = require('rss-parser');
const jsdom = require('jsdom');

const constants = require('../config/constants');
const { extraWaitForPromise, findObjectsWithFields } = require('../utils/utils');
const { createFullArticle, correctArticleTitle, correctArticleUrl } = require('./corrections');

const {
  IS_PROXY_USING, PROXY_STRING, USER_AGENT, NO_DATA, TIMEOUT_GET, EXTRA_DELAY
} = constants;

const { JSDOM } = jsdom;

const handleAxiosError = (error) => {
  if (error.response) {
    console.log(`status code: ${error.response.status}`);
  }

  console.log(`error: ${error.message}`);
  return NO_DATA;
};

const getRequestConfig = () => {
  const config = {
    headers: { 'User-Agent': USER_AGENT },
    timeout: TIMEOUT_GET,
  };

  if (IS_PROXY_USING) {
    config.httpAgent = new SocksProxyAgent(PROXY_STRING);
    config.httpsAgent = new SocksProxyAgent(PROXY_STRING);
  }

  return config;
};

const getPageSource = async (url) => {
  try {
    const config = getRequestConfig();
    const { status, data } = await axios.get(url, config);

    if (!status === 200) {
      return NO_DATA;
    }

    return data;
  } catch (error) {
    return handleAxiosError(error);
  } finally {
    await extraWaitForPromise(EXTRA_DELAY);
  }
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

const getArticlesFromHtml = async (subscription) => {
  try {
    const {
      _id: sourceId,
      site,
      section,
      url,
      regex,
      removeInTitle
    } = subscription;

    const source = await getPageSource(url);

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
        title: correctArticleTitle(title),
        link: correctArticleUrl(link)
      };
    });

    const uniqueLinks = [
      ...new Map(correctedLinks.map((item) => [item.link, item])).values()
    ];

    const articles = uniqueLinks.map(({ title, link }) => {
      return createFullArticle(
        sourceId,
        site,
        section,
        title,
        link,
        removeInTitle
      );
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

module.exports = {
  getArticlesFromRss,
  getArticlesFromHtml,
  getArticlesFromKwork
};


// =================================================
// Unused functions
// =================================================

// const getPageTitle = async (url) => {
//   try {
//     const source = await getPageSource(url);
//     const $ = cheerio.load(source);

//     const metaTitle = $('meta[property="og:title"]').attr('content');
//     const headTitle = $('title').contents().first().text();

//     if (metaTitle && metaTitle.length > 3) {
//       return metaTitle;
//     }

//     if (headTitle && headTitle.length > 3) {
//       return headTitle;
//     }

//     return NO_DATA;
//   } catch (error) {
//     return NO_DATA;
//   }
// };
