// copied from BrightspaceUI/core's LocalizeCoreElement, with modifications
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin';

export const Localizer = superclass => class extends LocalizeMixin(superclass) {

	/**
	 * @param {string[]} langs - contains locales and languages in order of preference
	 * e.g. ['fr-fr', 'fr', 'en-us', 'en']
	 */
	static async getLocalizeResources(langs) {
		let translations;
		// always load in English translations, so we have something to default to
		const enTranslations = await import('./en.js');

		try {
			// not sure why for await..of syntax is required here.
			// In debugger langs looks like a regular array, but maybe it's really an async iterable under the hood
			for await (const lang of langs) {
				switch (lang) {
					case 'ar':
						translations = await import('./ar.js');
						break;
					case 'da':
						translations = await import('./da.js');
						break;
					case 'de':
						translations = await import('./de.js');
						break;
					case 'en':
						translations = await import('./en.js');
						break;
					case 'es':
						translations = await import('./es.js');
						break;
					case 'fr':
						translations = await import('./fr.js');
						break;
					case 'ja':
						translations = await import('./ja.js');
						break;
					case 'ko':
						translations = await import('./ko.js');
						break;
					case 'nl':
						translations = await import('./nl.js');
						break;
					case 'pt':
						translations = await import('./pt.js');
						break;
					case 'sv':
						translations = await import('./sv.js');
						break;
					case 'tr':
						translations = await import('./tr.js');
						break;
					case 'zh-tw':
						translations = await import('./zh-tw.js');
						break;
					case 'zh':
						translations = await import('./zh.js');
						break;
				}
				if (translations && translations.default) {
					return {
						language: lang,
						resources: Object.assign(enTranslations.default, translations.default)
					};
				}
			}

			return {
				language: 'en',
				resources: enTranslations.default
			};

		} catch (err) {
			// can happen if the langterms file for a language doesn't exist
			return {
				language: 'en',
				resources: enTranslations.default
			};
		}
	}
};
