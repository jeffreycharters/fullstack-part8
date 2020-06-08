import React, { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import Recommended from './components/Recommended'

import { useQuery, useLazyQuery, useApolloClient, useSubscription } from '@apollo/client'

import { ALL_AUTHORS } from './queries'
import { ALL_BOOKS, BOOK_ADDED } from './queries'
import { CURRENT_USER } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [getBooks, bookResult] = useLazyQuery(ALL_BOOKS)
  const [getCurrentUser, currentUserResult] = useLazyQuery(CURRENT_USER)
  const [books, setBooks] = useState([])
  const [token, setToken] = useState(null)

  const [user, setUser] = useState({ username: null, favouriteGenre: ' ' })
  const [error, setError] = useState(null)

  const authorResult = useQuery(ALL_AUTHORS)

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }


  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allPersons: dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      notify(`${addedBook.title} added`)
      updateCacheWith(addedBook)
    }
  })


  useEffect(() => {
    const token = localStorage.getItem('books-user-token')
    if (token) {
      setToken(token)
    }
  }, [])

  useEffect(() => {
    if (bookResult.data) {
      setBooks(bookResult.data.allBooks)
    }
  }, [bookResult])

  useEffect(() => {
    if (currentUserResult.data) {
      setUser(currentUserResult.data.me)
    }
  }, [currentUserResult])

  const client = useApolloClient()

  if (authorResult.loading) {
    return <div>loading...</div>
  }

  const handleBookClick = (event) => {
    event.preventDefault()
    setPage('books')
    getBooks()
  }

  const handleRecommendedClick = (event) => {
    event.preventDefault()
    setPage('recommended')
    getCurrentUser()
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
        {token && <button onClick={handleRecommendedClick}>recommended</button>}
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
        getBooks={getBooks}
      />

      <NewBook
        show={page === 'add'}
        setPage={setPage}
        setError={notify}
        updateCacheWith={updateCacheWith}
      />

      <LoginForm
        show={page === 'login'}
        setError={notify}
        setToken={setToken}
        setPage={setPage}
      />

      <Recommended
        show={page === 'recommended'}
        user={user}
      />

    </div>
  )
}

export default App