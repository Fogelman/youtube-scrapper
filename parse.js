const cheerio = require("cheerio");

module.exports.parseChannel = str => {
  const links = [];
  const doc = cheerio.load(str, {});

  doc("h3.yt-lockup-title a").each((i, el) => {
    links.push([doc(el).text(), doc(el).attr("href")]);
  });

  return links;
};
