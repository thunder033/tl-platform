import {buildTree} from 'lib/injector-plus';

const ADT = {
    experienceData: '',
    portfolioCtrl: '',
    portfolioView: '',
    skills: '',
};

buildTree(ADT, require('../manifest.json').name);

export {ADT};
