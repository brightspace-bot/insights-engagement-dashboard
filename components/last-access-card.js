import { action, computed, decorate, observable } from 'mobx';
import { RECORD, USER } from '../consts';
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { SkeletonMixin } from '@brightspace-ui/core/components/skeleton/skeleton-mixin.js';

export const filterId = 'd2l-insights-last-access-card';

export class LastAccessFilter {
	constructor() {
		this.usersWithSysLastAccessMoreThanFourteenDays = new Set();
	}

	get id() { return filterId; }

	get isApplied() {
		return this.usersWithSysLastAccessMoreThanFourteenDays.size > 0;
	}

	set isApplied(isApplied) {
		if (!isApplied) this.usersWithSysLastAccessMoreThanFourteenDays.clear();
	}

	get title() {
		return 'components.insights-engagement-dashboard.lastSystemAccessHeading';
	}

	addUsersToSet(userIds) {
		userIds.forEach(item => this.usersWithSysLastAccessMoreThanFourteenDays.add(item));
	}

	filter(record) {
		return this.usersWithSysLastAccessMoreThanFourteenDays.has(record[RECORD.USER_ID]);
	}
}

decorate(LastAccessFilter, {
	isApplied: computed,
	addUsersToSet: action,
	usersWithSysLastAccessMoreThanFourteenDays: observable
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
		return this._usersWithSysLastAccessMoreThanFourteenDays.length;
	}

	get _usersWithSysLastAccessMoreThanFourteenDays() {
		const fourteenDayMillis = 1209600000;

		return this.data.users
			.filter(user => user[USER.LAST_SYS_ACCESS] === null || user[USER.LAST_SYS_ACCESS] === undefined || (Date.now() - user[USER.LAST_SYS_ACCESS] > fourteenDayMillis));
	}

	_addUsersToSet() {
		const userIds = this._usersWithSysLastAccessMoreThanFourteenDays.map(user => user[USER.ID]);
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
		this._addUsersToSet();
	}
}
customElements.define('d2l-insights-last-access-card', LastAccessCard);

decorate(LastAccessCard, {
	_cardValue: computed,
	_usersWithSysLastAccessMoreThanFourteenDays: computed
});
