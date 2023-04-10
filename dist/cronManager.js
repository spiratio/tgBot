"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronManager = void 0;
const cron_1 = require("cron");
class CronManager {
    constructor() {
        this.jobs = {};
        // инициализация объекта, который хранит все кроны
        // можно также получать кроны из базы данных и добавлять их в этот объект
    }
    addCronJob(id, croneString, callback) {
        const job = new cron_1.CronJob(croneString, callback);
        this.jobs[id] = job;
        job.start();
    }
    removeCronJob(id) {
        const job = this.jobs[id];
        if (job) {
            job.stop();
            delete this.jobs[id];
        }
    }
    getCronJob(id) {
        return this.jobs[id];
    }
    scheduleJob(id, croneString, callback) {
        const job = new cron_1.CronJob(croneString, callback);
        job.start();
    }
}
exports.CronManager = CronManager;
