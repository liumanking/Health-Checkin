import type { Query } from '@/core/cqrs/query';
import { buildExportEnvelope } from '@/data/export/json-export';
import type { ExportEnvelope } from '@/domain/entities/export-envelope';

export const getExportDataQuery: Query<void, ExportEnvelope> = {
  name: 'GetExportData',

  async execute() {
    return buildExportEnvelope();
  },
};
