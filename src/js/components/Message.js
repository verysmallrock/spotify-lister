import React from 'react'
import S from './Message.css'

const Message = () => {
  return (
    <div className={ S.root }>
      <h1>This is an example of the Authorization Code flow</h1>
      <a href="/login" className="btn btn-primary">Log in with Spotify</a>
    </div>
  )
}

export default Message