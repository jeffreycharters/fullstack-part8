import React, { useState } from 'react'
import { UPDATE_AUTHOR } from "../queries"
import { ALL_AUTHORS } from "../queries"
import { useMutation } from '@apollo/client'

const AuthorForm = (props) => {
  const [year, setYear] = useState('')
  const [author, setAuthor] = useState(props.authors[0].name)

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const submit = async (event) => {
    event.preventDefault()
    updateAuthor({ variables: { name: author, born: Number(year) } })
    setYear('')
  }

  const nameHandler = (event) => {
    setAuthor(event.target.value)
  }

  return (
    <div>
      <h2>set birthyear</h2>
      <div>
        <form onSubmit={submit}>
          <div>
            name <select value={author} onChange={nameHandler}>
              {props.authors.map(a => {
                return <option value={a.name} key={a.name}>{a.name}</option>
              })}
            </select>
          </div>
          <div>
            birth year <input type="text"
              value={year}
              onChange={({ target }) => setYear(target.value)} />
          </div>
          <button type="submit">submit</button>
        </form>
      </div>
    </div>
  )
}

export default AuthorForm