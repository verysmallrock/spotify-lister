import React from 'react'
import '@spectrum-web-components/button/sp-button';

const SigninView = () => {
  return (
    <div>
      <h1>This is an example of the Authorization Code flow</h1>
      <sp-button href="/login" variant="cta">Log in with Spotify</sp-button>
    </div>
  )
}

export default SigninView