const SocksProxyAgent = require('socks-proxy-agent');
const axios = require('axios');

const constants = require('../config/constants');

const {
  IS_PROXY_USING,
  PROXY_STRING,
  USER_AGENT,
  NO_DATA,
  TIMEOUT_GET,
  EXTRA_DELAY,
  LOG_LINE
} = constants;

const extraWaitForPromise = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const handleAxiosError = (error) => {
  if (error.response) {
    console.log(`status code: ${error.response.status}`);
  }

  console.log(`error: ${error.message}`);
  return NO_DATA;
};

const getAxiosConfig = () => {
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
    const config = getAxiosConfig();
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

const printInfo = (string, lineAfterString = false) => {
  string && console.log(string);
  lineAfterString && console.log(LOG_LINE);
};

const findObjectsWithFields = (object, fields) => {
  const foundObjects = [];

  const recurse = (obj) => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => recurse(item));
      return;
    }

    if (typeof obj === 'object' && obj !== null) {
      if (fields.every((field) => Object.keys(obj).includes(field))) {
        foundObjects.push(obj);
      }

      Object.keys(obj).forEach((key) => recurse(obj[key]));
    }
  };

  recurse(object);
  return foundObjects;
};

module.exports = {
  extraWaitForPromise,
  getPageSource,
  printInfo,
  findObjectsWithFields
};

