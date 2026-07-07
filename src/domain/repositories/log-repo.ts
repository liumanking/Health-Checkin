import type { Log } from '@/domain/entities/log';
import type { LogQuery } from '@/domain/queries/log-query';
import type { Repository } from './base-repo';

export type LogRepository = Repository<Log, LogQuery>;
