/// <reference path="../../../../../typings/tsd.d.ts" />

module Helpers {
	'use strict';
	angular.module('helpers.logger', []);

	export var getModule: () => ng.IModule = () => {
		return angular.module("helpers.logger");
	};

}