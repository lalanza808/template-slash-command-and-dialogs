const axios = require('axios');
const qs = require('querystring');
const apiUrl = 'https://slack.com/api';

const callSlackAPI = async (method, payload) => {
    let data = Object.assign({ token: process.env.SLACK_ACCESS_TOKEN }, payload);
    let result = await axios.post(`${apiUrl}/${method}`, qs.stringify(data));
    return result.data;
}

const postZapierWebhook = async (webhook_url, data) => {
  let result = await axios.post(webhook_url, {
      data: data
    })
    .then(res => {
      console.log(`[.] Webhook data: ${res.config.data}`)
      console.log(`[.] Webhook status: ${res.status}`)
    })
    .catch(error => {
      console.error(error)
    })
  return result;
}

module.exports = {
    callSlackAPI,
    postZapierWebhook
}
