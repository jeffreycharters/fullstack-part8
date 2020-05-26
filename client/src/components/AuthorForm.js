import React, { useState } from 'react'
import { UPDATE_AUTHOR } from "../queries"
import { ALL_AUTHORS } from "../queries"
import { useMutation } from '@apollo/client'

const AuthorForm = () => {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const submit = async (event) => {
    event.preventDefault()

    updateAuthor({ variables: { name, born: Number(year) } })

    setName('')
    setYear('')
  }

  return (
    <div>
      <h2>set birthyear</h2>
      <div>
        <form onSubmit={submit}>
          <div>
            name <input type="text"
              value={name}
              onChange={({ target }) => setName(target.value)} />
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