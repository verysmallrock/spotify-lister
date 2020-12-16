import React from 'react'
import ReactDOM from 'react-dom'
import Message from './components/Message'
import ApplicationFrame from './components/ApplicationFrame'

import getHashParams from './utils/hashParams'



let reactElement = document.getElementById('react-container') // eslint-disable-line no-undef
let hashParams = getHashParams()

let access_token = hashParams.access_token,
    error = hashParams.error

if (error) {
  alert('Error signing into Spotify.')
}
if (access_token) {
  ReactDOM.render(
    <ApplicationFrame params={ hashParams } />,
    reactElement 
  )
} else {
  ReactDOM.render(
    <Message />,
    reactElement 
  )
}

if(module.hot) // eslint-disable-line no-undef  
  module.hot.accept() // eslint-disable-line no-undef  

