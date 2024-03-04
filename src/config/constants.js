const config = {
  // api
  JWT_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTQxODc4NjMsIl9pZCI6IjY1M2MwY2Y0NWVlNmNjMjU3OWZmMzQwNSIsImlhdCI6MTcwNjQxMTg2M30.ar_YFTv5ozzXvZ5ZQaEgrQGc9GNT5MkLtSAKTrkPhRo',
  API_BASE: 'http://localhost:7733/api',
  PASSWORD: 'password123!',

  // parsing
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
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
