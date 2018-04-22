import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route} from 'react-router-dom'
import WrappedNormalLoginForm from './components/login/log.js'
import Log from './components/login/log.js'
import Register from './components/login/register.js'
import './static/css/login/index.css'
import store from './store/index.js'
import { Provider } from 'react-redux'
ReactDOM.render(
	<HashRouter>
		<Provider store={store}>
			<div className="content">
				<Route path="/log" component={Log}></Route>
				<Route path="/register" component={Register}></Route>
			</div>
		</Provider>
	</HashRouter>
	, document.querySelector('#app')
)
if (module.hot) {
	module.hot.accept();
}