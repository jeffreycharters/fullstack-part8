import React from 'react'
import { useQuery } from '@apollo/client'
import { BOOKS_BY_GENRE } from '../queries'

const Recommended = ({ show, user }) => {
  let recommendedBooks = []
  recommendedBooks = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: user.favouriteGenre }
  })
  if (!show || !user || !recommendedBooks) {
    return null
  }

  const bookList = recommendedBooks.data.allBooks ? recommendedBooks.data.allBooks : []

  return (
    <div>
      <h2>Recommended based on favourite genre: {user.favouriteGenre}</h2>
      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {bookList.map(b => {
            return (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended