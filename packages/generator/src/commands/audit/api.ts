import { BaseCommand, type CommandDefinition } from '@nexical/cli-core';
import { auditApiModule } from '../../lib/audit-api.js';

export default class AuditApiCommand extends BaseCommand {
  static usage = 'audit:api';
  static description = 'Audit web-api module code against models.yaml';

  static args: CommandDefinition = {
    args: [
      {
        name: 'name',
        description: 'The name of the module (or glob pattern) to audit. Defaults to "*-api".',
        required: false,
      },
    ],
    options: [
      {
        name: '--schema',
        description: 'Validate models.yaml and api.yaml schemas only',
      },
    ],

  };

  async run(options: any) {
    await auditApiModule(options.name, { schema: options.schema });
  }
}
