import { computed, decorate, observable } from 'mobx';
import { RECORD, USER } from '../consts';
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export const filterId = 'd2l-insights-last-access-card';
const fourteenDayMillis = 1209600000;

function isWithoutRecentAccess(user) {
	return !user[USER.LAST_SYS_ACCESS] || ((Date.now() - user[USER.LAST_SYS_ACCESS]) > fourteenDayMillis);
}

export class LastAccessFilter {
	constructor() {
		this.isApplied = false;
	}

	get id() { return filterId; }

	get title() {
		return 'components.insights-engagement-dashboard.lastSystemAccessHeading';
	}

	filter(record, data) {
		const user = data._userDictionary.get(record[RECORD.USER_ID]);
		return isWithoutRecentAccess(user);
	}
}

decorate(LastAccessFilter, {
	isApplied: observable
});

class LastAccessCard extends SkeletonMixin(Localizer(MobxLitElement)) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	get _cardMessage() {
		return this.localize('components.insights-engagement-dashboard.lastSystemAccess');
	}

	get _cardTitle() {
		return this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading');
	}

	get filter() {
		return this.data.getFilter(filterId);
	}

	get _cardValue() {
		return this.data.users
			.filter(user => isWithoutRecentAccess(user)).length;
	}

	render() {
		return html`
			<d2l-labs-summary-card
				id="d2l-insights-engagement-last-access"
				is-value-clickable
				.data="${this.data}"
				card-title="${this._cardTitle}"
				card-value="${this._cardValue}"
				card-message="${this._cardMessage}"
				@d2l-labs-summary-card-value-click=${this._valueClickHandler}
				?skeleton="${this.skeleton}"
			></d2l-labs-summary-card>
		`;
	}

	_valueClickHandler() {
		this.filter.isApplied = true;
	}
}
customElements.define('d2l-insights-last-access-card', LastAccessCard);

decorate(LastAccessCard, {
	_cardValue: computed
});
