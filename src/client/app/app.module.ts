/// <reference path="../../../typings/tsd.d.ts" />
(function(){
	angular.module('app',['app.core'])
		.controller('MainController', MainController);

	function MainController(){
		console.log('hi2')
	}
})()