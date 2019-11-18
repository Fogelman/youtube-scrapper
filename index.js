const { parseChannel } = require("./parse");
const axios = require("axios");

const api = axios.create({
  baseURL: "https://www.youtube.com"
});

exports.handle = async ({ name, href, phase, owner }, context) => {
  if (!href && href !== "") {
    return {};
  }

  const response = await api.get(`${href}/channels`).then(({ data }) => {
    return data;
  });

  const channels = parseChannel(response);
  try {
    await Promise.all(
      channels.map(link => {
        return axios.post(
          "http://3.231.149.136:8080/channel",
          {
            name: link[0],
            href: link[1],
            phase,
            recommender: name,
            owner
          }
        );
      })
    );
  } catch (error) {
    return JSON.stringify(error);
  }
  return;
};
