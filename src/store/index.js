import reducers from './reducer.js'
import { combineReducers, createStore } from 'redux'

const store = createStore(combineReducers(reducers))

export default store