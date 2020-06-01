const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)

const JWT_SECRET = 'BLAHBLAHBLAHBLAHBLAH'
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
type User {
  username: String!
  favouriteGenre: String!
  id: ID!
}
type Token {
  value: String!
}
type Query {
  authorCount: Int!
  bookCount: Int!
  allBooks(author: String, genre: String): [Book!]!
  allAuthors: [Author!]!
  me: User
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
  createUser(
    username: String!
    favouriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
}
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && !args.genre) {
        const findAuthor = await Author.findOne({ name: args.name })
        return Book.find({ author: findAuthor._id })
      }
      if (args.genre && !args.author) {
        const booksWithGenre = await Book.find({ genre: { $in: args.genre } })
        return booksWithGenre
      }
      if (args.genre && args.author) {
        const findAuthor = await Author.findOne({ name: args.name })
        const authorsBooksInGenre = await Book.find({ author: findAuthor._id, genre: { $in: args.genre } })
        return authorsBooksInGenre
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async () => {
      return await Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: (root) => {
      // return books.filter(b => b.author === root.name).length
      return Book.find({ author: root._id }).countDocuments()
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authneticated")
      }

      const book = new Book({ ...args })
      const authorExists = await Author.findOne({ name: args.author })
      if (!authorExists) {
        const author = new Author({
          name: args.author
        })
        const newAuthor = await author.save()
        book.author = newAuthor
      }
      else {
        book.author = authorExists
      }

      try {
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      const editedAuthor = await Author.findOne({ name: args.name })
      if (!editedAuthor) { return null }
      editedAuthor.born = Number(args.setBornTo)
      await editedAuthor.save()
      return editedAuthor
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'hi') {
        throw new UserInputError('wrong credentials')
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})