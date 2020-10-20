import { action, computed, decorate, observable } from 'mobx';
import { RECORD, USER } from '../consts';
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export const filterId = 'd2l-insights-last-access-card';
const fourteenDayMillis = 1209600000;

export class LastAccessFilter {
	constructor() {
		this.usersWithoutRecentAccess = new Set();
	}

	get id() { return filterId; }

	get isApplied() {
		return this.usersWithoutRecentAccess.size > 0;
	}

	set isApplied(isApplied) {
		if (!isApplied) this.usersWithoutRecentAccess.clear();
	}

	get title() {
		return 'components.insights-engagement-dashboard.lastSystemAccessHeading';
	}

	addUsersToSet(userIds) {
		userIds.forEach(item => this.usersWithoutRecentAccess.add(item));
	}

	filter(record) {
		return this.usersWithoutRecentAccess.has(record[RECORD.USER_ID]);
	}
}

decorate(LastAccessFilter, {
	isApplied: computed,
	addUsersToSet: action,
	usersWithoutRecentAccess: observable
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
		return this._usersWithoutRecentAccess.length;
	}

	get _usersWithoutRecentAccess() {
		return this.data.users
			.filter(user => !user[USER.LAST_SYS_ACCESS] || ((Date.now() - user[USER.LAST_SYS_ACCESS]) > fourteenDayMillis));
	}

	_addUsersToSetWithoutRecentAccess() {
		const userIds = [...this.data._userDictionary]
			.filter(user => !user[1][USER.LAST_SYS_ACCESS] || ((Date.now() - user[1][USER.LAST_SYS_ACCESS]) > fourteenDayMillis))
			.map(user => user[0]);
		this.filter.addUsersToSet(userIds);
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
		this._addUsersToSetWithoutRecentAccess();
	}
}
customElements.define('d2l-insights-last-access-card', LastAccessCard);

decorate(LastAccessCard, {
	_cardValue: computed,
	_usersWithoutRecentAccess: computed
});
