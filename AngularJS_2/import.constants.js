const csvUploaderTypes = [
    {
        value: 'users',
        description: 'Users with an existing account'
    },{
        value: 'visitors',
        description: 'Visitors who may create an account later'
    }
];

const csvUploaderTooltip = `Your .csv file should at least contain each person’s email address.
                            Other import attributes include user id, full names, and joining dates.`;

const usersSteps = [
    {
        title: 'Email address',
        question: 'Which column contains your user\'s email address?',
        description: 'An email address is required for each user stored',
        name: 'email',
        data_type: 'string'
    }, {
        title: 'User ID',
        question: 'Which column contains user IDs?',
        description: 'Importing user IDs lets you easily find specific users.',
        name: 'id',
        data_type: 'string'
    }, {
        title: 'Full names',
        question: 'Which column contains your users’ full names?',
        description: 'Importing full names lets you create more personal messages.',
        name: 'name',
        data_type: 'string'
    }, {
        title: 'Signup date',
        question: 'Which column contains the date the user signed up on?',
        description: 'Importing signed up dates lets you easily target segments of users.',
        name: 'signup_date',
        data_type: 'date'
    }, {
        question: 'Which additional columns would you like to import?',
        description: 'Additional columns will be imported as custom attributes'
    }
];

const visitorsSteps = [
    {
        title: 'Email address',
        question: 'Which column contains your user\'s email address?',
        description: 'An email address is required for each user stored',
        name: 'email',
        data_type: 'string'
    }, {
        title: 'Full names',
        question: 'Which column contains your users’ full names?',
        description: 'Importing full names lets you create more personal messages.',
        name: 'name',
        data_type: 'string'
    }, {
        question: 'Which additional columns would you like to import?',
        description: 'Additional columns will be imported as custom attributes'
    }
];

const dataTypes = [
    {
        name: 'Text',
        type: 'string'
    }, {
        name: 'Date',
        type: 'date'
    }, {
        name: 'Number',
        type: 'integer'
    }, {
        name: 'Boolean',
        type: 'boolean'
    }
];


const csvImportSteps = [
    'Import users or visitors',
    'Map column in your .csv',
    'Tag imported users'
];


module.exports = (module) =>  
    module
        .constant('csvUploaderHelper', {
            csvUploaderTypes,
            csvUploaderTooltip
        })
        .constant('importColumnHelper', {
            visitorsSteps,
            usersSteps
        })
        .constant('columnHelper', {
            dataTypes
        }).constant('csvImportSteps', csvImportSteps);
