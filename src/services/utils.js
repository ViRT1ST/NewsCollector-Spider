const axios = require('axios');
const SocksProxyAgent = require('socks-proxy-agent');

const constants = require('../config/constants');

const {
  IS_PROXY_USING,
  PROXY_STRING,
  USER_AGENT,
  LOG_LINE,
  NO_DATA,
  TIMEOUT_GET,
  EXTRA_DELAY
} = constants;

const extraWaitForPromise = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const getCurrentTime = () => {
  return new Date().toISOString().replace(/\.\d+/, '.000');
};

const getProxyForAxios = () => {
  if (IS_PROXY_USING) {
    return {
      httpAgent: new SocksProxyAgent(PROXY_STRING),
      httpsAgent: new SocksProxyAgent(PROXY_STRING)
    };
  }

  return {};
};

const getPageSource = async (url) => {
  const config = {
    ...getProxyForAxios(),
    headers: { 'User-Agent': USER_AGENT },
    timeout: TIMEOUT_GET
  };

  try {
    const { status, data } = await axios.get(url, config);
    if (status === 200) return data;
    return NO_DATA;

  } catch (err) {
    if (err.response) console.log(`status code: ${err.response.status}`);
    console.log(`error: ${err.message}`);
    return NO_DATA;

  } finally {
    await extraWaitForPromise(EXTRA_DELAY);
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
    console.log(LOG_LINE);
  }
};

module.exports.extraWaitForPromise = extraWaitForPromise;
module.exports.getCurrentTime = getCurrentTime;
module.exports.getPageSource = getPageSource;
module.exports.findObjectsWithFields = findObjectsWithFields;
module.exports.printInfo = printInfo;
