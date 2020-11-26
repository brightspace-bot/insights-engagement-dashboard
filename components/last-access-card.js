import { computed, decorate, observable } from 'mobx';
import { RECORD, USER } from '../consts';
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';
import { UrlState } from '../model/urlState';

export const filterId = 'd2l-insights-last-access-card';
const oneDayMillis = 86400000;

export class LastAccessFilter {
	constructor(thresholdDays) {
		this.isApplied = false;
		this.thresholdDays = thresholdDays;
		this._urlState = new UrlState(this);
	}

	get id() { return filterId; }

	get title() {
		return 'components.insights-engagement-dashboard.lastSystemAccessHeading';
	}

	filter(record, userDictionary) {
		const user = userDictionary.get(record[RECORD.USER_ID]);
		return this.isWithoutRecentAccess(user);
	}

	// for UrlState
	get persistenceKey() { return 'saf'; }

	get persistenceValue() {
		return this.isApplied ? '1' : '';
	}

	set persistenceValue(value) {
		this.isApplied = value === '1';
	}

	isWithoutRecentAccess(user) {
		return !user[USER.LAST_SYS_ACCESS] ||
			((Date.now() - user[USER.LAST_SYS_ACCESS]) > this.thresholdDays * oneDayMillis);
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
		return this.filter.thresholdDays !== 1 ?
			this.localize(
				'components.insights-engagement-dashboard.lastSystemAccessMessage',
				{ thresholdDays: this.filter.thresholdDays }
			) :
			this.localize('components.insights-engagement-dashboard.lastSystemAccessMessageOneDay');
	}

	get _cardTitle() {
		return this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading');
	}

	get filter() {
		return this.data.getFilter(filterId);
	}

	get _cardValue() {
		return this.data.withoutFilter(filterId).users
			.filter(user => this.filter.isWithoutRecentAccess(user)).length;
	}

	render() {
		return html`
			<d2l-labs-summary-card
				id="d2l-insights-engagement-last-access"
				value-clickable
				card-title="${this._cardTitle}"
				card-value="${this._cardValue}"
				card-message="${this._cardMessage}"
				@d2l-labs-summary-card-value-click=${this._valueClickHandler}
				?skeleton="${this.skeleton}"
			></d2l-labs-summary-card>
		`;
	}

	_valueClickHandler() {
		this.filter.isApplied = !this.filter.isApplied;
	}
}
customElements.define('d2l-insights-last-access-card', LastAccessCard);

decorate(LastAccessCard, {
	_cardValue: computed,
	filter: computed
});
