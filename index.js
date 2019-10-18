const AWS = require("aws-sdk");
const { parseAbout, parseChannel, randomValueHex } = require("./parse");
const axios = require("axios");
const uuid = require("uuid/v4");

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();
// { apiVersion: "2006-03-01" }

const uploadParams = {
  Bucket: "youtube-redes",
  Key: "",
  Body: ""
};

const api = axios.create({
  baseURL: "https://www.youtube.com/"
});

exports.handle = async ({ name, href, depth, maxDepth }, context) => {
  uploadParams.Key = uuid();

  const response = await Promise.all([
    api.get(`${href}/about`).then(async ({ data }) => {
      return data;
    }),
    api.get(`${href}/channels`).then(async ({ data }) => {
      return data;
    })
  ]);

  try {
    const ch = parseChannel(response[1]);
    uploadParams.Body = JSON.stringify(
      { name, href, ...parseAbout(response[0]), ...ch },
      null,
      2
    );

    await s3.upload(uploadParams).promise();

    const Payload = JSON.stringify(
      {
        name: el[0],
        href: el[1],
        maxDepth: maxDepth,
        depth: depth + 1
      },
      null,
      2
    );

    if (depth < maxDepth) {
      await Promise.all(
        ch.links.map(el =>
          lambda
            .invoke({
              FunctionName: "nodeless-dev-channel",
              Payload,
              InvocationType: "Event"
            })
            .promise()
        )
      );
    }
  } catch (e) {
    return {
      error: e
    };
  }
  return {};
};
