import ACTIONS from './action.js'

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
	nickname: '',
	telephone: '',
	signature: '',
	sex: 1,
	region: [],
	regionStr: ''
}

const initialDialogueDetailState = []

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

module.exports = {
	pageState,
	topBarState,
	chatObjectState,
	dialogueDetailState
}