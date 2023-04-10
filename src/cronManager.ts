import { CronCommand, CronJob } from "cron";
import { CronJobObject } from "./types";


export class CronManager {
    private jobs: CronJobObject = {};
  
    constructor() {
      // инициализация объекта, который хранит все кроны
      // можно также получать кроны из базы данных и добавлять их в этот объект
    }
  
    public addCronJob(id: string, croneString: string, callback: CronCommand) {
      const job = new CronJob(croneString, callback);
      this.jobs[id] = job;
      job.start();
    }
  
    public removeCronJob(id: string) {
      const job = this.jobs[id];
      if (job) {
        job.stop();
        delete this.jobs[id];
      }
    }
  
    public getCronJob(id: string) {
      return this.jobs[id];
    }

    public scheduleJob(id: string, croneString: string, callback: CronCommand) {
        const job = new CronJob(croneString, callback);
        job.start();
      }
  }