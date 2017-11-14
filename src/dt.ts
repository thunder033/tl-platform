import {buildTree} from 'lib/injector-plus';

const DT = {
    config: {
        platform: '',
        site: '',
    },
    core: {
        data: {
            templates: '',
        },
        log: '',
        stateMachine: '',
        staticCtrl: '',
    },
    ng: {
        $http: '$http',
        $locationProvider: '$locationProvider',
        $q: '$q',
        $rootScope: '$rootScope',
        $scope: '$scope',
        $socket: 'socketFactory',
        $state: '$state',
        $stateParams: '$stateParams',
        $stateProvider: '$stateProvider',
        $timeout: '$timeout',
        $urlService: '$urlService',
    },
    value: {
        states: '',
    },
};

buildTree(DT, 'tl-platform');

export {DT};
