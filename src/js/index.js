import React from 'react'
import ReactDOM from 'react-dom'
import ApplicationFrame from './components/ApplicationFrame'
import './index.css'

let reactElement = document.getElementById('react-container') // eslint-disable-line no-undef

ReactDOM.render(
  <ApplicationFrame />,
  reactElement 
)

if(module.hot) // eslint-disable-line no-undef  
  module.hot.accept() // eslint-disable-line no-undef  

