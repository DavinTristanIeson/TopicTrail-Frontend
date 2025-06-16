const GlobalConfig = {
  ApiUrl: 'http://localhost:8000/api',
  AppName: 'TopicTrail',
};
const isDev = process.env.NODE_ENV === 'development';
if (typeof window !== 'undefined') {
  window.onload = function () {
    if (!isDev) {
      GlobalConfig.ApiUrl = `${window.location.origin}/api`;
    }
  };
}

export default GlobalConfig;
