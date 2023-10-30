const axios = require('axios');

const constants = require('../config/constants');
const { API_BASE, TIMEOUT_GET, TIMEOUT_POST, JWT_TOKEN, NO_DATA } = constants;

class Api {

  static handleError(error) {
    if (error.response) {
      console.log(`status code: ${error.response.status}`);
      // console.log(error.response.data);
    }

    console.log(`error: ${error.message}`);
    return NO_DATA;
  }

  static getConfig(isGetRequest) {
    return {
      timeout: isGetRequest ? TIMEOUT_GET : TIMEOUT_POST,
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
  }

  static async getRequest(path) {
    try {
      const url = `${API_BASE}${path}`;
      const config = this.getConfig(true);

      const { data } = await axios.get(url, config);

      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async postRequest(path, payload) {
    try {
      const url = `${API_BASE}${path}`;
      const config = this.getConfig(false);

      const response = axios.post(url, payload, config);

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  static async getSources() {
    const response = await this.getRequest('/sources');
    return response.data;
  }

  static async getArticlesUrls() {
    const response = await this.getRequest('/articles/urls');
    return response.data;
  }

  static async sendArticles(jsonArray) {
    const response = await this.postRequest('/articles', jsonArray);
    return response.data;
  }

}

module.exports = Api;
