import {format} from 'fecha'
const region = require('./region.json')

function isTelephoneAvailable (phone) {
	var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;  
	if (!myreg.test(phone)) {  
		return false;  
	} else {  
		return true;  
	}  
}
function isPasswordAvailable (password) {
	var myreg = /^[a-zA-Z0-9]{4,8}$/;
	if (!myreg.test(password)) {
		return false;
	} else {
		return true;
	}
}

function getCity (dataRegion = []) {
	let province = dataRegion.length && region[dataRegion[0]].label;
	let city = dataRegion.length 
		&& region[dataRegion[0]].children[dataRegion[1]].label;
	return province ? province + ' ' + city : ''
}

function getCookie (str) {
	let items = document.cookie.split(';')
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		let itemArr = item.split('=');
		if (itemArr[0] === str) {
			return itemArr[1];
		}
	}
	return ''
}

function getDateStr (date) {
	let dateStr = '';
	let dateYear = date.getFullYear();

	let newDate = new Date();

	let newDateYear = newDate.getFullYear();
	let newDateDate = newDate.getDate();

	if (date.toDateString() === newDate.toDateString()) {
		dateStr = '今天 ' + format(date, 'shortTime');
	} else if (dateYear !== newDateYear) {
		dateStr = format(date, 'YYYY-MM-DD hh:mm');
	} else if (new Date(newDate.setDate(newDateDate - 1)).toDateString() === date.toDateString()){
		dateStr = '昨天 ' + format(date, 'shortTime');
	} else {
		dateStr = format(date, 'MM-DD hh:mm');
	}	
	return dateStr
}

module.exports = {
	isTelephoneAvailable,
	isPasswordAvailable,
	getCity,
	getCookie,
	getDateStr
}