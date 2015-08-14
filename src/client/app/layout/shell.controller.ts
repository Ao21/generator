/// <reference path="../../../../typings/tsd.d.ts" />

module Layout.Controller {
	export class Shell {

		static $inject: string[] = ['logger'];

		title: string;
		logger: Helpers.Logger;

		constructor(logger: Helpers.Logger) {
			this.logger = logger;
			this.title = 'Shell';
			this.activate();
		}

		activate(): void {
			this.logger.info('Application Activated!', null, this.title);
		}
	}
}

angular.module('app.layout')
	.controller('ShellController',  Layout.Controller.Shell);