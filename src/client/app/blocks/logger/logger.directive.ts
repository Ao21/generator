/// <reference path="../../../../../typings/tsd.d.ts" />

class MyService
{
    getMessage(): string
    {
    return 'Hello World';
    }
}
 
angular.module('app').service( 'myService', MyService );