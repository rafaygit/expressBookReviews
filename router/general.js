const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let axios = require("axios");
const public_users = express.Router();
axios;

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);

  let usernameExists = false; // Variable to track if the username already exists

  if (!username || !password) {
    return res.status(400).json({ error: "Username or password cannot be empty!" });
  }
  // Check if the username already exists in the users array
  for (let user of users) {
    if (user.username === username) {
      usernameExists = true;
      break;
    }
  }
  if (usernameExists) {
    return res.status(400).json({ error: "Username already exists" });
  } else {
    users.push({ username, password });
    return res.status(200).json(users);
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  return res.status(200).json({ books });
});

public_users.get("axios/books", async function (req, res) {
  const response = await axios.get("http://localhost:5000/");
  const booksAxios = response.data;
  return res.status(200).json({ booksAxios });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  return res.status(200).json(books[req.params.isbn]);
});
public_users.get("/axios/isbn/:isbn", async function (req, res) {
  const response = await axios.get(`http://localhost:5000/isbn/${req.params.isbn}`);
  const isbnAxios = response.data;
  return res.status(200).json({ isbnAxios });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const arrayBooks = [];
  for (let values of Object.values(books)) {
    if (values.author === author) {
      arrayBooks.push(values);
    }
  }

  return res.status(200).json(arrayBooks);
});

public_users.get("/axios/author/:author", async function (req, res) {
  const author = req.params.author;
  const response = await axios.get(`http://localhost:5000/author/${author}`);

  const authorAxios = response.data;
  return res.status(200).json({ authorAxios });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const titleBooks = [];
  for (let values of Object.values(books)) {
    if (values.title === title) {
      titleBooks.push(values);
    }
  }

  return res.status(200).json(titleBooks);
});

public_users.get("/axios/title/:title", async function (req, res) {
  const title = req.params.title;

  const response = await axios.get(`http://localhost:5000/title/${title}`);

  const titleAxios = response.data;
  return res.status(200).json(titleAxios);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  return res.status(200).json(books[isbn]["reviews"]);
});

module.exports.general = public_users;
