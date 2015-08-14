/* jshint -W117, -W030 */
describe('MainController', function() {
    var controller;

    beforeEach(function() {
            bard.appModule('app');
            bard.inject('$controller', '$rootScope');
        });

    beforeEach(function () {
        controller = $controller('MainController');
        $rootScope.$apply();
    });

    bard.verifyNoOutstandingHttpRequests();

    describe('Admin controller', function() {
        it('should be created successfully', function () {
            expect(controller).toBeDefined();
        });
        it('should be called Admin', function () {
            expect(controller.title).toEqual('Admin');
        });


    });
});
