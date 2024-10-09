const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Task-7
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Task-8
  try {
    const requestedIsbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session.authorization.username; // Assuming username is stored in the session
    console.log("isbn" , requestedIsbn);

    if (!username) {
      return res.status(401).json({ message: "Unauthorized" }); // Handle unauthorized access
    }

    const book = books[requestedIsbn];
    console.log("book" , book);

    // if (book) {
    //   book.reviews[username] = reviewText; // Add or modify review based on username      
    
    //   res.json({ message: "The review for the book with ISBN " + requestedIsbn + "added/updated successfully" });
    // } else {
    //   res.status(404).json({ message: "Book not found" }); // Handle book not found
    // }
    if (book) {
    let review = reviewText;

        if (review) {
            book.reviews[username] = review;
        }

        books[requestedIsbn] = book;
        res.send(`Review for book with ISBN ${requestedIsbn} "added/updated successfully" .`);
      } else {
        res.send("Unable to find book!");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding/modifying review" }); // Handle unexpected errors
  } 
   //return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Task-9
  try {
    const requestedIsbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session
    console.log("isbn to be deleted " , requestedIsbn);
    if (!username) {
      return res.status(401).json({ message: "Unauthorized" }); // Handle unauthorized access
    }

    const book = books[requestedIsbn];
    console.log("book to be deleted " , book);

    if (book) {
      // if (book.reviews[username]) { // Check if a review exists for the user
      //   delete book.reviews[username]; // Delete the user's review
      //   res.json({ message: "The reviews for the book with ISBN " + requestedIsbn + "by the " + username + "  deleted" });
      // } else {
      //   res.status(404).json({ message: "Review not found" }); // Handle review not found
      // }
      let username = req.session.username;
      delete book.reviews[username];
      books[requestedIsbn] = book;
      res.send(`Review for book with ISBN ${requestedIsbn} deleted.`);
      } 
     else {
      res.status(404).json({ message: "Book not found" }); // Handle book not found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting review" }); // Handle unexpected errors
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
