const config = {
  // api
  JWT_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTNjMGNmNDVlZTZjYzI1NzlmZjM0MDUiLCJleHAiOjE3MDYzNTE3NTYsImlhdCI6MTY5ODU3NTc1Nn0.b-aKXCy73SIHgzmJJQZV-D4CdRDLn5EQSD3b6ZdJerg',
  API_BASE: 'http://localhost:7733/api',

  // parsing
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.167 Safari/537.36',
  PROXY_STRING: 'socks5://localhost:1080',
  IS_PROXY_USING: false,
  TIMEOUT_GET: 30000,
  TIMEOUT_POST: 5000,
  EXTRA_DELAY: 2000,

  // other
  LOG_LINE: '------------------------------------------------------------------------------------',
  NO_DATA: 'NO DATA',
  LOOP_DELAY: 300000
};

module.exports = config;
