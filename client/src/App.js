import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'

import { useQuery, useLazyQuery, useApolloClient } from '@apollo/client'

import { ALL_AUTHORS } from './queries'
import { ALL_BOOKS } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [getBooks, bookResult] = useLazyQuery(ALL_BOOKS)
  const [books, setBooks] = useState([])
  const [token, setToken] = useState(null)

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

  const client = useApolloClient()

  if (authorResult.loading) {
    return <div>loading...</div>
  }

  const handleBookClick = (event) => {
    event.preventDefault()
    setPage('books')
    getBooks()
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={handleBookClick}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {!token && <button onClick={() => setPage('login')}>log in</button>}
        {token && <button onClick={logout}>log out</button>}
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

      <LoginForm
        show={page === 'login'}
        setError={notify}
        setToken={setToken}
      />

    </div>
  )
}

export default App