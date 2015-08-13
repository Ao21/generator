/// <reference path="../../../../typings/tsd.d.ts" />

(function() {
	var core = angular.module('app.core', [])
		.controller('CoreController', CoreController);

	function CoreController($scope) {
		console.log('hi');
	}
})();
