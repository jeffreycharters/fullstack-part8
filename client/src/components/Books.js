import React, { useState } from 'react'

const Books = (props) => {
  const [filter, setFilter] = useState('')

  if (!props.show) {
    return null
  }

  let books = props.books
  let filteredBooks = books

  let allGenres = new Set()
  books.map(b => {
    if (b.genres) {
      return b.genres.forEach(genre => allGenres.add(genre))
    }
  })
  allGenres = [...allGenres]

  if (filter) {
    filteredBooks = books.filter(b => b.genres.includes(filter))
  }

  return (
    <div>
      <h2>books</h2>

      {filter && <span>Filtering by genre {filter}</span>}

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {filteredBooks.map(b =>
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {allGenres.map(genre =>
          <button key={genre} onClick={({ target }) => setFilter(target.textContent)}>{genre}</button>
        )}
        <button key='allGenres' onClick={() => setFilter('')}>All Genres</button>
      </div>
    </div >
  )
}

export default Books