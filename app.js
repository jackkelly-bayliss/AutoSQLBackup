const chalk = require('chalk');
const CronJob = require('cron').CronJob;
const humanToCron = require('human-to-cron');
const figlet = require('figlet');
const center = require('center-align');
const moment = require('moment');
const mkdirp = require('mkdirp');
const mysqldump = require('mysqldump');
require('dotenv').config();

figlet('AutoSQLBackup', function (err, data) {
    console.log(data);
    console.log(center('A Jack Hansen® Project', 75));
    console.log(center('Version: 1.0.1', 75));
    console.log('');
    console.log('');
    startApp();
});

function startApp() {
    console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.green(`Starting application...`)));

    // Read ENV variables
    SQL_HOST = process.env.SQL_HOST;
    SQL_PORT = process.env.SQL_PORT || '3306';
    SQL_USERNAME = process.env.SQL_USERNAME;
    SQL_PASSWORD = process.env.SQL_PASSWORD;
    SQL_DB = process.env.SQL_DB;
    SAVE_PATH = process.env.SAVE_PATH;
    SAVE_FILENAME = process.env.SAVE_FILENAME;
    BACKUP_INTERVAL = process.env.BACKUP_INTERVAL;

    // Check if ENV values exist
    if (!SQL_HOST || !SQL_PORT || !SQL_USERNAME || !SAVE_PATH || !SAVE_FILENAME || !BACKUP_INTERVAL) 
        return console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.red(`You are missing values for required ENV values. Please ensure you fill these in before starting this application.`)));
    


    // Create cron task
    const startInterval = new CronJob(humanToCron(BACKUP_INTERVAL), function () {
        let DIRPATH = SAVE_PATH.replace('{year}', moment().format('YYYY'));
        DIRPATH = DIRPATH.replace('{month}', moment().format('MM'));
        DIRPATH = DIRPATH.replace('{day}', moment().format('DD'));
        FILENAME = SAVE_FILENAME.replace('{datetime}', moment().format('DD-MM-YYYY----hh-mma'));
        mkdirp(DIRPATH).then(function (made) {
            if (made != undefined) {
                console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.yellow(`The directory '${DIRPATH}' did not exist but this has now been created.`)))
            }
        }).then(function () {
            mysqldump({
                connection: {
                    host: SQL_HOST,
                    port: SQL_PORT,
                    user: SQL_USERNAME,
                    password: SQL_PASSWORD,
                    database: SQL_DB
                },
                dumpToFile: DIRPATH + FILENAME
            }).then(function () {
                console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.green(`Successfully backed up database(s) '${SQL_DB}' at ${
                    moment().format('hh:mma on DD-MM-YYYY')
                }`)));
            }).catch(function (err) {
                console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.red(`${err}`)));
                return false;
            })
        })
    });

    startInterval.start();
    console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.blue(`startInterval has initialized`)));
    console.log(chalk.bold(chalk.red("[AutoSQLBackup] ") + chalk.blue(`Is startInterval running?: ${
        startInterval.running
    }`)));
};
