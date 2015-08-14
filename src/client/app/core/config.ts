/// <reference path="../../../../typings/tsd.d.ts" />

(function(): void {
	'use strict';
	let core = angular.module('app.core');

	core.config(toastConfig);

	toastConfig.$inject = ['toastr'];

	function toastConfig(toastr): void {
		toastr.options.timeOut = 4000;
		toastr.options.positionClass = 'toast-bottom-right';
	}


})();
