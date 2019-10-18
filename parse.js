const cheerio = require("cheerio");

module.exports.parseAbout = str => {
  const doc = cheerio.load(str, {});
  const subscribers = doc(
    "span.yt-subscription-button-subscriber-count-branded-horizontal.subscribed.yt-uix-tooltip"
  ).text();

  const description = doc(
    "div.about-description.branded-page-box-padding"
  ).text();

  const stats = doc("div.about-stats").children(".about-stat");
  const views = stats
    .eq(0)
    .children()
    .first()
    .text();

  const joined = stats.eq(1).text();

  return {
    joined,
    views,
    description,
    subscribers
  };
};

module.exports.parseChannel = str => {
  const links = [];
  const doc = cheerio.load(str, {});
  const regions = doc("meta[itemprop=regionsAllowed]").attr("content");
  const family_friendly = doc("meta[itemprop=isFamilyFriendly]").attr(
    "content"
  );

  doc("h3.yt-lockup-title > a").each((i, el) => {
    links.push([doc(el).text(), doc(el).attr("href")]);
  });

  return {
    regions,
    family_friendly,
    links
  };
};
