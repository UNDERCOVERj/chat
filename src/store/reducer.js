import ACTIONS from './action.js'

let io = require('socket.io-client')
let socket = io('http://localhost:3000')

const initialState = {
	pageUrl: '/person',
	text: '个人中心'
}

const initialTopBarState = {
	isShowLeftIcon: false,
	isShowRightSearchIcon: false,
	isShowRightPlusIcon: false
}

const initialChatObjectState = {
	date: new Date(),
	iconUrl: '',
	lordId: '',
	memberIds: [],
	message: '',
	nickname: '',
	telephone: '',
	type: 'groupId',
	friendRoomId: '',
	groupId: '',
	arrangeFlag: false
}

const initialFriendSelectState = {
	friendSelectFlag: false,
	list: []
}

const initialDialogueDetailState = []

const generalSocketState = {
	socket: socket
}

function pageState (state = initialState, action) {
	switch (action.type) {
		case ACTIONS.SET_PAGE:
			return Object.assign({}, state, {
				pageUrl: action.pageUrl,
				text: action.text
			})
		default: 
			return state;
	}
}

function topBarState (state = initialTopBarState, action) {
	switch (action.type) {
		case ACTIONS.SET_TOPBAR :
			return Object.assign({}, state, {
				isShowLeftIcon: action.isShowLeftIcon,
				isShowRightSearchIcon: action.isShowRightSearchIcon,
				isShowRightPlusIcon: action.isShowRightPlusIcon
			})
		default:
			return state
	}
}

function chatObjectState (state = initialChatObjectState, action) {
	switch (action.type) {
		case ACTIONS.SET_CHAT_OBJECT: 
			return Object.assign({}, state, action.data)
		default: 
			return state
	}
}

function dialogueDetailState (state = initialDialogueDetailState, action) {
	switch (action.type) {
		case ACTIONS.CONCAT_DIALOGUE_DETAIL:
			return state.concat(action.list)
		case ACTIONS.SET_DIALOGUE_DETAIL:
			return action.list
		default:
			return state
	}
}

function friendSelectState (state = initialFriendSelectState, action) {
	switch (action.type) {
		case ACTIONS.SET_FRIEND_SELECT_FLAG:
			return Object.assign({}, state, {friendSelectFlag: action.friendSelectFlag})
		case ACTIONS.SET_FRIEND_LIST:
			let cloneState = JSON.parse(JSON.stringify(state));
			return Object.assign({}, cloneState, {list: action.list});
		default:
			return state
	}
}

function generalSocket (state = generalSocketState) {
	return state;
}

module.exports = {
	pageState,
	topBarState,
	chatObjectState,
	dialogueDetailState,
	friendSelectState,
	generalSocket
}