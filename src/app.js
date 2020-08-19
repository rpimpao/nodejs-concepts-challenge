const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: uuidValidate } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

function validateRepoId(request, response, next) {
  const { id } = request.params;

  if (!uuidValidate(id)) {
    return response.status(400).json({ error: "Invalid repository ID. " });
  }

  console.log("validating url for ", request.method, request.url);

  return next();
}

app.use('/repositories/:id', validateRepoId);

const repositories = [];
const likes = {};

app.get("/repositories", (request, response) => {
  // return all repos, no filter yet
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const id = uuid();
  likes[id] = []; // create an array to store this repo's likes

  const newRepo = {
    id,
    title,
    url,
    techs,
    likes: likes[id].length
  };

  repositories.push(newRepo);

  return response.json(newRepo);
});

function findRepoById(id) {
  const repoIndex = repositories.findIndex(repo => repo.id === id);
  return repoIndex
}

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = findRepoById(id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  const { title, url, techs } = request.body;

  const newRepo = {
    id,
    title,
    url,
    techs,
    likes: likes[id].length
  }

  repositories[id] = newRepo;

  return response.json(newRepo);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repoIndex = findRepoById(id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repoIndex = findRepoById(id);

  if (repoIndex < 0) {
    return response.status(400).json({ error: "Repository not found" });
  }

  const likeId = uuid();
  likes[id].push(likeId);

  const repo = repositories[repoIndex];
  repo.likes = likes[id].length;

  return response.json(repo);
});

module.exports = app;
