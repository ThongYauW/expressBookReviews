const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
});
// Return true if any user with the same username is found, otherwise false
if (userswithsamename.length > 0) {
    return true;
} else {
    return false;
}
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

const addReview = (bookId, username, review) => {
  // Check if the book exists in the books collection
  if (books[bookId]) {
      // Add the review with the username as the key
      books[bookId].reviews[username] = review;
  } else {
      console.log("Book not found");
  }
}

function deleteReview(bookId, username) {
  // Check if the book exists and the review for the username exists
  if (books[bookId] && books[bookId].reviews[username]) {
      // Delete the review for the given username
      delete books[bookId].reviews[username];
      console.log(`Review by ${username} has been deleted.`);
  } else {
      console.log("Book or review not found.");
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  let book = books[isbn];
  
  if (req.session.authorization) {
      let username = req.session.authorization['username'];

      if (book) {
        let review = req.body.review;
    
        if (review) {
          addReview(isbn, username, review)
        }
    
        res.send(`Book with the isbn ${isbn} updated.`);
      } else {
        // Respond if friend with specified email is not found
        res.send("Unable to find book!");
      }
  } else {
    return res.status(300).json({message: "user not logged in"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  let book = books[isbn];
  
  if (req.session.authorization) {
      let username = req.session.authorization['username'];

      if (book) {
        deleteReview(isbn, username)
        res.send(`Book with the isbn ${isbn} deleted.`);
      } else {
        res.send("Unable to find book!");
      }
  } else {
    return res.status(300).json({message: "user not logged in"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
