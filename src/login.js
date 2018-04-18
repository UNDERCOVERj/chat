import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route} from 'react-router-dom'
import WrappedNormalLoginForm from './components/login/log.js'
import Log from './components/login/log.js'
import Register from './components/login/register.js'
import './static/css/login/index.css'
ReactDOM.render(
	<HashRouter>
		<div className="content">
			<Route path="/log" component={Log}></Route>
			<Route path="/register" component={Register}></Route>			
		</div>
	</HashRouter>
	, document.querySelector('#app')
)
if (module.hot) {
	module.hot.accept();
}