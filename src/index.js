import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route} from 'react-router-dom'
import App from './components/index/app.js'
import Search from './components/index/search.js'
import DialogueDetail from './components/index/dialogueDetail.js'
import { Provider } from 'react-redux'
import store from './store/index.js'
import './static/css/index/index.css'

ReactDOM.render(
	<HashRouter>
		<Provider store={store}>
			<div style={{"width":"100%","height":"100%"}}>
				<Route path="/app" component={App}></Route>
				<Route path="/search" component={Search}></Route>
				<Route path="/detail" component={DialogueDetail}></Route>
			</div>
		</Provider>
	</HashRouter>
	, document.querySelector('#app')
)
if (module.hot) {
	module.hot.accept();
}