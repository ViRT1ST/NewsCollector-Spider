const { extraWaitForPromise, printInfo } = require('./services/utils');
const { parseArticles } = require('./services/parsing');
const Api = require('./services/api');

const constants = require('./config/constants');
const { LOOP_DELAY } = constants;


const printTitles = (articles) => {
  articles.forEach(({ site, section, title }) => {
    printInfo(`[${site}: ${section}]: ${title}`, true);
  });
};

const printQty = (articles) => {
  printInfo(`New articles: ${articles.length}`, false);
};

const sendArticles = async (articles) => {
  if (articles.length > 0) {
    const response = await Api.sendArticles(articles);
    printInfo(`Successful sending: ${response.success}`, false);
  }
};

const сollect = async () => {
  try {
    const sources = await Api.getSources();
    const dbUrls = await Api.getArticlesUrls();

    const parsedArticles = await parseArticles(sources);
    const newArticles = parsedArticles.filter(({ url }) => !dbUrls.includes(url));

    printTitles(newArticles);
    printQty(newArticles);
    await sendArticles(newArticles);

  } catch (error) {
    console.log(error.message);
  }
};

const run = async () => {
  while (true) {
    await сollect()
      .then(() => printInfo(`Waiting: ${LOOP_DELAY / 1000 / 60} min.`, true))
      .then(await extraWaitForPromise(LOOP_DELAY))
      .then(() => process.stdout.write('\x1Bc'));
  }
};

run();

