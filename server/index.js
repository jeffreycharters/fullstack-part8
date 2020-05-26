const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

mongoose.set('useFindAndModify', false)

// const JWT_SECRET = 'BLAHBLAHBLAHBLAHBLAH'
const MONGODB_URI = 'mongodb+srv://fullstack:superboogers@cluster0-hkxnt.mongodb.net/graphql-part8?retryWrites=true'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })


const typeDefs = gql`
type Author {
  name: String!
  born: Int
  bookCount: Int!
  id: ID!
}
type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}
type Query {
  authorCount: Int!
  bookCount: Int!
  allBooks(author: String, genre: String): [Book!]!
  allAuthors: [Author!]!
}
type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
  ): Book
  editAuthor(
    name: String!
    setBornTo: Int!
  ): Author
}
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => books.length,
    allBooks: (root, args) => {
      /*
      if (args.author && !args.genre) {
        return books.filter(b => b.author === args.author)
      }
      if (args.genre && !args.author) {
        return books.filter(b => b.genres.includes(args.genre))
      }
      if (args.genre && args.author) {
        const authorsBooks = books.filter(b => b.author === args.author)
        return authorsBooks.filter(b => b.genres.includes(args.genre))
      } */
      return Book.find({}).populate('author')
    },
    allAuthors: () => {
      return Author.find({})
    }
  },
  Author: {
    bookCount: (root) => {
      return books.filter(b => b.author === root.name).length
    }
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      const authorExists = authors.find(a => a.name === args.author)
      if (!authorExists) {
        const author = {
          name: args.author,
          id: uuid()
        }
        authors = authors.concat(author)
      }
      return book
    },
    editAuthor: (root, args) => {
      let editedAuthor = authors.find(a => a.name === args.name)
      if (!editedAuthor) { return null }
      editedAuthor = { ...editedAuthor, born: args.setBornTo }
      authors = authors.map(a => a.name === editedAuthor.name ? editedAuthor : a)
      return editedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})