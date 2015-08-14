/// <reference path="../../../../../typings/tsd.d.ts" />


(function() {
	'use strict';

	angular.module('blocks.logger')
		.factory('logger', logger)

	logger.$inject = ['$log', 'toastr'];

	function logger($log, toastr) {
		var service = {
			showToasts: true,

			error: error,
			info: info,
			success: success,
			warning: warning,

			log: $log.log
		};

		return service;
		//////////////////	
		function error(message: string, data: any, title : string) {
			toastr.error(message, title);
			$log.error('Error: ' + message, data);
		}
		function info(message: string,data: any,title : string) {
			toastr.info(message, title);
            $log.info('Info: ' + message, data);
		}
		function success(message: string,data: any,title : string) {
			toastr.success(message, title);
            $log.info('Success: ' + message, data);
		}
		function warning(message: string,data: any,title : string) {
			toastr.warning(message, title);
            $log.warn('Warning: ' + message, data);
		}

	}
})();