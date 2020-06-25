const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");

const app = express();

const client = redis.createClient(6379);

client.on("connect", function() {
  console.log("Redis client connected");
});
client.on("error", (err) => {
  console.log("Error " + err);
});

app.get("/posts", (req, res) => {
  const postsRedisKey = "user:posts";

  return client.get(postsRedisKey, (err, posts) => {
    if (posts) {
      return res.json({ source: "cache", data: JSON.parse(posts) });
    } else {
      fetch("https://jsonplaceholder.typicode.com/posts?_limit=8")
        .then((response) => response.json())
        .then((posts) => {
          client.setex(postsRedisKey, 3600, JSON.stringify(posts));

          return res.json({ source: "api", data: posts });
        })
        .catch((error) => {
          console.log(error);

          return res.json(error.toString());
        });
    }
  });
});

app.listen(9950, () => {
  console.log("Server listening on port: ", 9950);
});
