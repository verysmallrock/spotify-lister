import React from 'react'
import S from './Message.css'

const Message = () => {
  return (
    <div className="content">
      <h1>Rexpack</h1>
      <p className={ S.description }>React, Express, and Webpack Boilerplate Application</p>
      <div className={ S.awfulSelfie }></div>
    </div>
  )
}

export default Message