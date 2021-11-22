const express = require('express');
const Book = require('../models').Book;
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
// const paginate = require('express-paginate');


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req,res,next) => {
    try {
      await cb(req,res,next)
    } catch(error) {
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', (req, res) =>{
  res.redirect("/books");
});



/* GET books page. It shows the first 5 entries*/
router.get("/books", asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const perPage = 5;


  // const results = {};

  // if (endIndex < 10) {
  //   results.next = {
  //     page: page + 1,
  //     limit: limit
  // }
  
  // }
  // if (startIndex > 0) {
  //   results.previous = {
  //     page: page - 1,
  //     limit: limit
  //   }
  // }
  

  const booksList = await Book.findAndCountAll({ 
    order: [["createdAt", "DESC"]],
    offset: page * perPage - perPage,
    limit: perPage
 });


 /* This code takes the query string from the search field and render the result. */
 let query = req.query.search || "";
 const matches = await Book.findAndCountAll({
  where: {
    [Op.or]: [
            { Title: {[Op.like]: `%${query}%` }},
            { Author: {[Op.like]: `%${query}%` }},
            { Genre: {[Op.like]: `%${query}%` }},
            { Year: {[Op.like]: `%${query}%` }},
            ]
          },
      order: [["createdAt", "DESC"]],
      offset: page * perPage - perPage,
      limit: perPage    
});

 if (query) {
  res.render('index', {
    books: matches.rows,
    pages: parseInt(matches.count / perPage),
  });

 } else {
  res.render('index', {
      books: booksList.rows,
      pages: parseInt(booksList.count / perPage),
    });

 }
}));

/* GET create book. */
router.get('/books/new', (req, res) =>{
  res.render('new-book', {  book: {}, title: 'New Book' });
});


/*POST create a book. */
router.post('/books/new', asyncHandler(async(req, res) =>{
  let book;
  try{
    book = await Book.create(req.body);
    res.redirect("/books?page=1");
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      res.render('new-book', { book, errors: error.errors, title: 'New Book'});
    } else {
      throw error;
    }
  }
}));

/* GET Update book. */
router.get('/books/:id', asyncHandler(async (req, res, next) => { 
  const book = await Book.findByPk(req.params.id);
    if (book) {
      res.render('update-book', { book, title: book.title});
    } else {
      const error = new Error();
      error.status = 404;
      error.message = 'Sorry, the book you are requesting is not available in our database.';
      next(error);
    }
}));

/*POST Update book. */
router.post('/books/:id', asyncHandler(async(req, res) => {
  let book;
  try{
    book = await Book.findByPk(req.params.id);
    if(book) {
    await book.update(req.body);
    res.redirect("/");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors, title: 'Update Book'});
    } else {
      throw error;
    }
  }
}));

/* GET Delete book */
router.get('/books/:id/delete', asyncHandler(async(req,res,next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('delete', { book:book, title: "Delete book" });
  } else {
    res.sendStatus(404);
  }
}));

/*POST Delete a book. */
router.post('/books/:id/delete', asyncHandler(async(req, res,next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/');
  } else {
    res.sendStatus(404);
  }
}));

/*404 error handler */
router.use((req, res, next) => {
  const error = new Error();
  error.status = 404;
  error.message = 'Sorry, the page you are requesting does not exist.';
  console.log(error.status, error.message);
  res.status(404).render('page-not-found', { error });
  next(error);
});

/*Global error handler */
router.use((error, req, res, next) => {
  if (error) {
    console.log('Global error called', error);
  }
  if (error.status === 404) {
    res.status(404).render('page-not-found', { error });
  } else {
  error.status = 500;
  error.message = 'Oops!, It looks like something went wrong on the server.';
  console.log(error.message, error.status);
  res.status(500).render('error', { error });
  }
});

module.exports = router;
