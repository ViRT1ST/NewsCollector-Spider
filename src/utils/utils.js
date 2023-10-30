const constants = require('../config/constants');

const { LOG_LINE } = constants;

const printInfo = (string, lineAfterString = false) => {
  string && console.log(string);
  lineAfterString && console.log(LOG_LINE);
};

const extraWaitForPromise = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
  printInfo,
  extraWaitForPromise,
  findObjectsWithFields
};

