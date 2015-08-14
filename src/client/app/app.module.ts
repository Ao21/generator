/// <reference path="../../../typings/tsd.d.ts" />
(function(): void {
	angular.module("app", ["app.core"])
		.controller("MainController", MainController);


	function MainController(): void {
		this.title = 'Admin';
	}
})();
