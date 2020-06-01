import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notification from './components/Notification'

import { useQuery, useLazyQuery } from '@apollo/client'

import { ALL_AUTHORS } from './queries'
import { ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [getBooks, bookResult] = useLazyQuery(ALL_BOOKS)
  const [books, setBooks] = useState([])

  const [error, setError] = useState(null)

  const authorResult = useQuery(ALL_AUTHORS)

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }

  useEffect(() => {
    if (bookResult.data) {
      setBooks(bookResult.data.allBooks)
    }
  }, [bookResult])

  if (authorResult.loading) {
    return <div>loading...</div>
  }

  const handleBookClick = (event) => {
    event.preventDefault()
    setPage('books')
    getBooks()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={handleBookClick}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Notification error={error} />

      <Authors
        show={page === 'authors'}
        authors={authorResult.data.allAuthors}
        setError={notify}
      />

      <Books
        show={page === 'books'}
        books={books}
      />

      <NewBook
        show={page === 'add'}
        setPage={setPage}
        setError={notify}
      />

    </div>
  )
}

export default App