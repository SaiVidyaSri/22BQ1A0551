import fs from 'fs';
import path from 'path';

/**
 * Advanced Logging Middleware for URL Shortener
 * Provides comprehensive request logging, error tracking, and analytics
 */

class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.logToFile = options.logToFile || false;
    this.logDir = options.logDir || './logs';
    this.includeBody = options.includeBody || false;
    this.excludePaths = options.excludePaths || [];
    
    if (this.logToFile) {
      this.ensureLogDirectory();
    }
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatTimestamp() {
    return new Date().toISOString();
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      timestamp: this.formatTimestamp(),
      level: level.toUpperCase(),
      message,
      ...metadata
    };

    
    const colors = {
      error: '\x1b[31m',
      warn: '\x1b[33m', 
      info: '\x1b[36m',
      debug: '\x1b[90m'
    };
    const reset = '\x1b[0m';
    
    console.log(`${colors[level]}[${logEntry.timestamp}] ${logEntry.level}: ${message}${reset}`);
    
    if (metadata && Object.keys(metadata).length > 0) {
      console.log(`${colors[level]}${JSON.stringify(metadata, null, 2)}${reset}`);
    }

    
    if (this.logToFile) {
      const fileName = `${new Date().toISOString().split('T')[0]}.log`;
      const logPath = path.join(this.logDir, fileName);
      const logLine = JSON.stringify(logEntry) + '\n';
      
      fs.appendFileSync(logPath, logLine);
    }
  }

  info(message, metadata) {
    this.log('info', message, metadata);
  }

  warn(message, metadata) {
    this.log('warn', message, metadata);
  }

  error(message, metadata) {
    this.log('error', message, metadata);
  }

  debug(message, metadata) {
    this.log('debug', message, metadata);
  }
}

/**
 * Express middleware for request logging
 */
export function requestLogger(options = {}) {
  const logger = new Logger(options);

  return (req, res, next) => {
    const startTime = Date.now();
    const { method, url, ip, headers } = req;

    
    if (options.excludePaths && options.excludePaths.some(path => url.includes(path))) {
      return next();
    }

    
    const requestMetadata = {
      method,
      url,
      ip: ip || req.connection.remoteAddress,
      userAgent: headers['user-agent'],
      referer: headers.referer,
      contentType: headers['content-type']
    };

    if (options.includeBody && req.body && Object.keys(req.body).length > 0) {
      requestMetadata.body = req.body;
    }

    logger.info(`Incoming ${method} request to ${url}`, requestMetadata);

    
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      
      const responseMetadata = {
        method,
        url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: requestMetadata.ip
      };

      if (res.statusCode >= 400) {
        logger.error(`Request failed: ${method} ${url}`, {
          ...responseMetadata,
          error: data.error || 'Unknown error'
        });
      } else {
        logger.info(`Request completed: ${method} ${url}`, responseMetadata);
      }

      return originalJson.call(this, data);
    };

    
    const originalRedirect = res.redirect;
    res.redirect = function(status, url) {
      const duration = Date.now() - startTime;
      
      logger.info(`Redirect: ${req.method} ${req.url}`, {
        method: req.method,
        originalUrl: req.url,
        redirectTo: arguments.length === 1 ? arguments[0] : url,
        statusCode: arguments.length === 1 ? 302 : status,
        duration: `${duration}ms`,
        ip: requestMetadata.ip
      });

      return originalRedirect.apply(this, arguments);
    };

    next();
  };
}

/**
 * Error logging middleware
 */
export function errorLogger(options = {}) {
  const logger = new Logger(options);

  return (err, req, res, next) => {
    const errorMetadata = {
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      stack: err.stack,
      message: err.message,
      statusCode: err.statusCode || 500
    };

    if (req.body && Object.keys(req.body).length > 0) {
      errorMetadata.requestBody = req.body;
    }

    logger.error(`Unhandled error: ${err.message}`, errorMetadata);
    
    next(err);
  };
}

/**
 * Analytics logging middleware for URL shortener specific events
 */
export function analyticsLogger(options = {}) {
  const logger = new Logger(options);

  return {
    logUrlCreated: (urlData, req) => {
      logger.info('URL shortened', {
        event: 'url_created',
        shortCode: urlData.shortCode,
        originalUrl: urlData.originalUrl,
        customCode: !!urlData.customCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: urlData.createdAt
      });
    },

    logUrlAccessed: (urlData, req) => {
      logger.info('URL accessed', {
        event: 'url_accessed',
        shortCode: urlData.shortCode,
        originalUrl: urlData.originalUrl,
        clicks: urlData.clicks,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer')
      });
    },

    logUrlDeleted: (shortCode, req) => {
      logger.info('URL deleted', {
        event: 'url_deleted',
        shortCode,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
  };
}

/**
 * Performance monitoring middleware
 */
export function performanceLogger(options = {}) {
  const logger = new Logger(options);
  const slowRequestThreshold = options.slowRequestThreshold || 1000; 

  return (req, res, next) => {
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; 

      if (duration > slowRequestThreshold) {
        logger.warn('Slow request detected', {
          method: req.method,
          url: req.url,
          duration: `${duration.toFixed(2)}ms`,
          statusCode: res.statusCode,
          ip: req.ip
        });
      }

      if (options.logAllRequests) {
        logger.debug('Request performance', {
          method: req.method,
          url: req.url,
          duration: `${duration.toFixed(2)}ms`,
          statusCode: res.statusCode
        });
      }
    });

    next();
  };
}


export { Logger };


export default {
  Logger,
  requestLogger,
  errorLogger,
  analyticsLogger,
  performanceLogger
};
