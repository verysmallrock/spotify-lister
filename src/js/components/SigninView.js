import React from 'react'
import S from './SigninView.css'

export default class SigninView extends React.Component {
  render() {
    return <div className={ S.root }>
      <div>
        <h1>Spotify Song Finder</h1>
        <sp-button href="/login" variant="cta">Log in with Spotify to continue</sp-button>
      </div>
    </div>
  }
}