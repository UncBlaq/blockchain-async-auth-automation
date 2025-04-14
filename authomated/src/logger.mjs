import { LogtailTransport } from "@logtail/winston";
import dotenv from "dotenv";

import winston from 'winston';
const { combine, timestamp, prettyPrint, printf, transports, format } = winston.format; 
const { Console, File } = winston.transports; // Access Console and File from transports
import { Logtail } from "@logtail/node";

dotenv.config();

const LOG_TOKEN = process.env.LOG_TOKEN
const logtail = new Logtail(LOG_TOKEN);




winston.loggers.add('loggerSetup', {
      level : 'info',
      format : combine(
        // errors({stack: false}),
        timestamp(),
        printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
        prettyPrint()
      ),
      // format : combine(
      //   errors({stack: false}),
      //   timestamp(),
      //   json(),
      //   prettyPrint()
      // ),
      // format : winston.format.cli(),
      transports : [
        new File({filename :"emit.log"}),
        new LogtailTransport(logtail)
      ]
});
