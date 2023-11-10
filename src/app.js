const constants = require('./config/constants');
const parseSources = require('./parsing/sources');

const {
  printInfo, extraWaitForPromise, printSeparator
} = require('./utils/utils');

const Api = require('./api/api');

const { LOOP_DELAY } = constants;

const printParsedArticlesInfo = (articles) => {
  articles.forEach(({ site, section, title }) => {
    printInfo(`[${site}: ${section}]: ${title}`);
    printSeparator();
  });

  printInfo(`New articles: ${articles.length}`);
};


const sendArticles = async (articles) => {
  if (articles.length !== 0) {
    const response = await Api.sendArticles(articles);
    printInfo(`Successful sending: ${response.success}`);
  }
};

const сollectArticles = async () => {
  try {
    const sources = await Api.getSources();
    const dbUrls = await Api.getArticlesUrls();

    const parsedArticles = await parseSources(sources);
    const newArticles = parsedArticles.filter(({ url }) => !dbUrls.includes(url));

    printParsedArticlesInfo(newArticles);

    await sendArticles(newArticles);
  } catch (error) {
    console.log(error.message);
  }
};

const run = async () => {
  while (true) {
    await сollectArticles()
      .then(() => printInfo(`Waiting: ${LOOP_DELAY / 1000 / 60} min.`, true))
      .then(await extraWaitForPromise(LOOP_DELAY))
      .then(() => process.stdout.write('\x1Bc'));
  }
};

run();

