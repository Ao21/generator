/// <reference path="../../../../typings/tsd.d.ts" />

(function() {
	let core = angular.module('app.core', [])
		.controller('CoreController', CoreController);

	function CoreController() {
		let vm = this;
		vm.title = 'Admin';

		activate();

		function activate() {
			console.log('Activated Admin View');
		}
	}
})();
