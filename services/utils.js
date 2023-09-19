require('dotenv').config();

const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');

const isProxyUsing = process.env.IS_PROXY_USING === 'true';
const proxyString = process.env.PROXY_STRING;
const userAgent = process.env.USER_AGENT;
const noData = process.env.NO_DATA;
const logLine = process.env.LOG_LINE;
const timeoutGet = parseInt(process.env.TIMEOUT_GET, 10);
const extraDelay = parseInt(process.env.EXTRA_DELAY, 10);

const extraWaitForPromise = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getCurrentTime = () => {
  return new Date().toISOString().replace(/\.\d+/, '.000');
};

const getProxyForAxios = () => {
  if (isProxyUsing) {
    return {
      httpAgent: new SocksProxyAgent(proxyString),
      httpsAgent: new SocksProxyAgent(proxyString)
    };
  }

  return {};
};

const getPageSource = async (url) => {
  const config = {
    ...getProxyForAxios(),
    headers: { 'User-Agent': userAgent },
    timeout: timeoutGet,
  };

  try {
    const source = await axios.get(url, config)
      .then(await extraWaitForPromise(extraDelay))
      .then((response) => {
        if (response.status === 200) {
          return response.data;
        }

        console.log('response.status (no data): ', response.status); // ?
        return noData;
      })
      .catch((error) => {
        console.log(error); // ?
        return noData;
      });

    return source;
  } catch (err) {
    return noData;
  }
};

const findObjectsWithFields = (object, fields) => {
  const foundObjects = [];

  function recurse(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => recurse(item));
    } else if (typeof obj === 'object' && obj !== null) {
      if (fields.every((field) => Object.keys(obj).includes(field))) {
        foundObjects.push(obj);
      }
      Object.keys(obj).forEach((key) => recurse(obj[key]));
    }
  }

  recurse(object);
  return foundObjects;
};

const printInfo = (string, lineAfterString = false) => {
  if (string) {
    console.log(string);
  }
  if (lineAfterString) {
    console.log(logLine);
  }
};

exports.extraWaitForPromise = extraWaitForPromise;
exports.getCurrentTime = getCurrentTime;
exports.getPageSource = getPageSource;
exports.findObjectsWithFields = findObjectsWithFields;
exports.printInfo = printInfo;

