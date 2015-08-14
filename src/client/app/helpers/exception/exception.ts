/// <reference path="../../../../../typings/tsd.d.ts" />
module Helpers {
	'use strict';

	class Exception {

		static $inject: string[] = ['$q', 'logger'];

		$q: ng.IQService;
		logger: Helpers.Logger;

		constructor($q: ng.IQService, Logger: Helpers.Logger) {
			let vm: any = this;
			vm.$q = $q;
			vm.logger = Logger;
		}

		catcher(message: any) {
			return function(e: any): ng.IQService {
				let thrownDescription: string;
				let newMessage: string;
				if (e.data && e.data.description) {
					thrownDescription = '\n' + e.data.description;
					newMessage = message + thrownDescription;
				}
				e.data.description = newMessage;
				this.logger.error(newMessage);
				return this.$q.reject(e);
			};
		}
	}
}