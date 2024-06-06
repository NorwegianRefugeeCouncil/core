import { EntityType, Language, LanguageFilter } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { ListMixin } from './base.service';

export class LanguageService extends ListMixin<Language, LanguageFilter>()(
  class {
    public entityType = EntityType.Language;
    public store = LanguageStore;
  },
) {
  async validateIsoCode(value: string) {
    const enabledLanguages = await this.list(
      { startIndex: 0, pageSize: 8000 },
      undefined,
      { enabled: true },
    );
    const possibleValues = enabledLanguages.map((language) => language.id);
    if (!possibleValues.includes(value)) {
      throw new Error(`Invalid language: ${value}`);
    }
  }
}
