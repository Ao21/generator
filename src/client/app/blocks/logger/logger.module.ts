module Blocks {
	'use strict';
	angular.module('blocks.logger', []);

	export var getModule: () => ng.IModule = () => {
		return angular.module("blocks.logger");
	};

}