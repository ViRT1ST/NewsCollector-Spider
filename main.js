const { extraWaitForPromise, printInfo } = require('./services/utils');
const { parseArticles } = require('./services/parsing');
const { Api } = require('./services/api');

const loopDelay = parseInt(process.env.LOOP_DELAY, 10);
const api = new Api();

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
    const result = await api.sendArticles(articles);
    printInfo(`Sending result: ${result}`, false);
  }
};

const сollect = async () => {
  try {
    const subscriptions = await api.getSubscriptions();
    const dbUrls = await api.getArticlesUrls();

    const parsedArticles = await parseArticles(subscriptions);
    const newArticles = parsedArticles.filter(({ url }) => !dbUrls.includes(url));

    printTitles(newArticles);
    printQty(newArticles);
    await sendArticles(newArticles);

  } catch (err) {
    console.log(err.message);
  }
};

const run = async () => {
  while (true) {
    await сollect()
      .then(() => printInfo(`Waiting: ${loopDelay / 1000 / 60} min.`, true))
      .then(await extraWaitForPromise(loopDelay))
      .then(() => process.stdout.write('\x1Bc'));
  }
};

run();
