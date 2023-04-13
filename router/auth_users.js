const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  for (let user of users) {
    if (user.username === username) {
      return true;
    } else return false;
  }
};

const authenticatedUser = (username, password) => {
  for (let user of users) {
    if (user.username === username && user.password === password) {
      return true;
    } else return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: { password, username },
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "Customer successfully logged in!", accessToken });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the request URL parameter
  const review = req.query.review; // Get the review from the request query parameter
  const username = req.user;

  console.log(username);
  // Check if the review and username are present in the request
  if (!review || !username) {
    return res.status(400).json({ message: "Review and username are required" });
  }

  let reviewExists = false;
  for (const user of users) {
    console.log(user);
    if (user.isbn === isbn && user.username === username) {
      user.review = review; // Update the review
      reviewExists = true;
      break;
    }
  }

  if (reviewExists) {
    return res.status(200).json({ message: "Review modified successfully" });
  }

  // If the review with the same ISBN and username does not exist, add a new review
  const newReview = { isbn, username, review };
  users.push(newReview); // Add the new review to the users array
  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the request URL parameter
  const username = req.user; // Get the username from the session

  // Check if the username is present in the session
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: User not logged in" });
  }

  // Filter the reviews array to find the index of the review with matching ISBN and username
  const reviewIndex = users.findIndex((user) => user.isbn === isbn && user.username === username);

  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }

  // Delete the review from the users array
  users.splice(reviewIndex, 1);

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
