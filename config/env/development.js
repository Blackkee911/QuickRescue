module.exports = {
    passphrase: 'l6myLoN',
    debug: true,
    mongoUri: 'mongodb://localhost/QRDB',
    sessionSecret: 'dev_secret_key',
    facebook: {
        clientID: '<Get from Facebook API>',
        clientSecret: '<Get from Facebook API>',
        callbackURL: 'http://localhost:3000/oauth/facebook/callback'
    },
    googleApis: {
        apiKey: '<api key>'
    },
    line: {
        adminGroupToken: 'Bearer <Group token>',
        volunteerGroupToken: 'Bearer <Group token>'
    },
    amazonS3: {
        bucketName: '<s3 bucket name>',
        accessKeyId: '<s3 access key>',
        secretAccessKey: '<s3 secret key>'
    }
};
