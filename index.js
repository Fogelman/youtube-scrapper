const AWS = require("aws-sdk");
const { parseAbout, parseChannel, randomValueHex } = require("./parse");
const axios = require("axios");
const uuid = require("uuid/v4");

const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

const uploadParams = {
  Bucket: "youtube-redes2",
  Key: "",
  Body: ""
};

const api = axios.create({
  baseURL: "https://www.youtube.com/"
});

exports.handle = async ({ name, href, depth, maxDepth, sufix }, context) => {
  uploadParams.Key = uuid();
  if (sufix) {
    uploadParams.Key += "=" + sufix;
  }

  if (!href && href !== "") {
    return {};
  }

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

    if (depth < maxDepth) {
      await Promise.all(
        ch.links.map(el =>
          lambda
            .invoke({
              FunctionName: "nodeless-dev-channel",
              Payload: JSON.stringify(
                {
                  name: el[0],
                  href: el[1],
                  maxDepth: maxDepth,
                  depth: depth + 1,
                  sufix
                },
                null,
                2
              ),
              InvocationType: "Event"
            })
            .promise()
        )
      );
    }
  } catch (error) {
    return {
      error
    };
  }
  return {};
};
