require('dotenv').config();

const axios = require('axios');

const timeoutGet = parseInt(process.env.TIMEOUT_GET, 10);
const timeoutPost = parseInt(process.env.TIMEOUT_POST, 10);
const apiBase = process.env.API_BASE;
const spiderId = process.env.SPIDER_ID;
const noData = process.env.NO_DATA;

class Api {

  apiGetRequest = async (path) => {
    const url = `${apiBase}${path}`;

    const config = {
      headers: { 'spider': spiderId },
      timeout: timeoutGet,
    };

    try {
      const { data } = await axios.get(url, config);
      return data;

    } catch (err) {
      if (err.response) console.log(`status code: ${err.response.status}`);
      console.log(`error: ${err.message}`);
      return noData;
    }

  };

  apiPostRequest = async (path, payload) => {
    const url = `${apiBase}${path}`;

    const config = {
      headers: { 'spider': spiderId, 'Content-Type': 'application/json' },
      timeout: timeoutPost,
    };

    try {
      const { data } = await axios.post(url, payload, config);
      return data;

    } catch (err) {
      if (err.response) console.log(`status code: ${err.response.status}`);
      console.log(`error: ${err.message}`);
      return noData;
    }
  };

  getSubscriptions = async () => {
    const response = await this.apiGetRequest('/api/spider/subscriptions');
    return response.data;
  };

  getArticlesUrls = async () => {
    const response = await this.apiGetRequest('/api/spider/urls');
    return response.data;
  };

  sendArticles = async (jsonArray) => {
    const response = await this.apiPostRequest('/api/spider/articles', jsonArray);
    return response.msg;
  };

}

module.exports.Api = Api;

