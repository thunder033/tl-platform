import angular = require('angular');
import {Ng1StateDeclaration} from '@uirouter/angularjs';
import {DT} from '@tree';

angular.module('thunderlab', [
    require('tl-platform.module'),
]).constant(DT.value.states, [
    {
        name: 'index',
    },
] as Ng1StateDeclaration[]);
