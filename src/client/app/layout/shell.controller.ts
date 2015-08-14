/// <reference path="../../../../typings/tsd.d.ts" />

(function(): void {
	'use strict';
	angular
		.module('app.layout')
		.controller('ShellController', ShellController);

	ShellController.$inject = ['logger'];

	function ShellController(logger): void {
		let vm = this;
		vm.title = 'Shell';

		activate();


		function activate(): void {
			logger.error('Application Activated!', null, vm.title);
		}
	}
})();