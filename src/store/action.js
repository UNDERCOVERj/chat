const SET_PAGE = 'SET_PAGE';
const SET_TOPBAR = 'SET_TOPBAR'
const SET_CHAT_OBJECT = 'SET_CHAT_OBJECT'
const SET_DIALOGUE_DETAIL = 'SET_DIALOGUE_DETAIL'
const CONCAT_DIALOGUE_DETAIL = 'CONCAT_DIALOGUE_DETAIL'
const SET_FRIEND_SELECT_FLAG = 'SET_FRIEND_SELECT_FLAG'
const SET_FRIEND_LIST = 'SET_FRIEND_LIST'

const setPage = (pageUrl, text) => {
	return {
		type: SET_PAGE,
		pageUrl,
		text
	}
}

const setTopBar = (isShowLeftIcon, isShowRightSearchIcon, isShowRightPlusIcon) => {
	return {
		type: SET_TOPBAR,
		isShowLeftIcon,
		isShowRightSearchIcon,
		isShowRightPlusIcon
	}
}

const setChatObject = (data) => {
	return {
		type: SET_CHAT_OBJECT,
		data
	}
}

const setDialogueDetail = (list) => {
	return {
		type: SET_DIALOGUE_DETAIL,
		list
	}
}

const concatDialogueDetail = (list) => {
	return {
		type: CONCAT_DIALOGUE_DETAIL,
		list
	}
}

const setFriendSelectFlag = (friendSelectFlag = false, list = [], type = SET_FRIEND_SELECT_FLAG) => { // 选择好友，应用于群聊创建
	return {
		type,
		friendSelectFlag,
		list
	}
}

module.exports = {
	SET_PAGE,
	setPage,
	SET_TOPBAR,
	setTopBar,
	SET_CHAT_OBJECT,
	setChatObject,
	SET_DIALOGUE_DETAIL,
	setDialogueDetail,
	CONCAT_DIALOGUE_DETAIL,
	concatDialogueDetail,
	SET_FRIEND_SELECT_FLAG,
	setFriendSelectFlag,
	SET_FRIEND_LIST
}