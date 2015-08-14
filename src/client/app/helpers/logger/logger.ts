/// <reference path="../../../../../typings/tsd.d.ts" />
module Helpers {
	'use strict';

	export class Logger {

		static $inject: string[]  = ['$log', 'toastr'];

		$log: ng.ILogService;
		toastr: Toastr;
		showToasts: Boolean;
		log: ng.ILogCall;

		constructor($log: ng.ILogService, toastr: Toastr) {
			this.$log = $log;
			this.toastr = toastr;
			this.showToasts = true;
			this.log = $log.log;

		};

		error(message: string, data: any, title: string): void {
			this.toastr.error(message, title);
			this.$log.error('Error: ' + message, data);
		};
		info(message: string, data: any, title: string): void {
			this.toastr.info(message, title);
			this.$log.info('Info: ' + message, data);
		};
		success(message: string, data: any, title: string): void {
			this.toastr.success(message, title);
			this.$log.info('Success: ' + message, data);
		};
		warning(message: string, data: any, title: string): void {
			this.toastr.warning(message, title);
			this.$log.warn('Warning: ' + message, data);
		};
	}

}

angular.module('helpers.logger').service('logger', Helpers.Logger);
