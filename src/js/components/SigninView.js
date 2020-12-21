import React from 'react'

export default class SigninView extends React.Component {
  render() {
    return <div>
      <h1>This is an example of the Authorization Code flow</h1>
      <sp-button href="/login" variant="cta">Log in with Spotify</sp-button>
    </div>
  }
}