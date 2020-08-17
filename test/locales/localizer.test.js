import { expect } from '@open-wc/testing';
import { Localizer } from '../../locales/localizer';

class MockLocalizedObjectSuperclass {}
class MockLocalizedObject extends Localizer(MockLocalizedObjectSuperclass) {}

describe('Localizer', () => {
	it('should default to English if the lang file is not found', async() => {
		const langTerms = await MockLocalizedObject.getLocalizeResources(['not a supported language']);

		expect(langTerms.language).to.equal('en');
	});

	// whenever we get actual langterms files: add a test that makes sure the correct langterms are loaded in
});
