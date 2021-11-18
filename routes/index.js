const express = require('express');
const Book = require('../models').Book;
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


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
  res.redirect('/books');
});

/* GET books page. */
router.get('/books', asyncHandler(async (req, res) => {
  const books = await Book.findAll({ 
    order: [["createdAt", "DESC"]],
    offset: 5,
    limit: 5
 });

 const query = req.query;
 const matches = await Book.findAll({
  where: {
    [Op.or]: [
            { Title: {[Op.like]: `%${query}%` }},
            { Author: {[Op.like]: `%${query}%` }},
            { Genre: {[Op.like]: `%${query}%` }},
            { Year: {[Op.like]: `%${query}%` }},
            ]
          }
})

 if (query) {
  res.render('index', {matches});
 } else {
  res.render('index', {books});
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
    res.redirect('/');
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

/* Search bar */
// router.post("/search", asyncHandler(async(req,res) => {
//   const searchMatches = req.query;
//   searchMatches = searchMatches.toLowerCase();
//   const books = await Book.findAll({
//     where: {
//       [Op.or]: [
//               { Title: {[Op.like]: `%${searchMatches}%` }},
//               { Author: {[Op.like]: `%${searchMatches}%` }},
//               { Genre: {[Op.like]: `%${searchMatches}%` }},
//               { Year: {[Op.like]: `%${searchMatches}%` }},
//               ]
//             }
//   })
//   res.render('index', {books:books});
// }));

module.exports = router;
