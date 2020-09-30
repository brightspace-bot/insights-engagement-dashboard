
import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { RECORD } from '../model/data.js';

export const OverdueAssignmentsCardFilter = {
	id: 'd2l-insights-overdue-assignments-card',
	title: 'components.insights-engagement-dashboard.overdueAssignmentsHeading',
	filter: (record) => record[RECORD.OVERDUE] > 0
};

class OverdueAssignmentsCard extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false },
			skeleton: { type: Boolean, attribute: true }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	get _cardMessage() {
		return this.localize('components.insights-engagement-dashboard.overdueAssignments');
	}

	get _cardTitle() {
		return this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading');
	}

	get _cardValue() {
		return this.data.usersCountsWithOverdueAssignments;
	}

	render() {
		return html`
			<d2l-labs-summary-card
				id="d2l-insights-engagement-overdue-assignments"
				is-value-clickable
				.data="${this.data}"
				card-title="${this._cardTitle}"
				card-value="${this._cardValue}"
				card-message="${this._cardMessage}"
				?loading="${this.data.isLoading}"
				?skeleton="${this.skeleton}"
				@d2l-labs-summary-card-value-click=${this._valueClickHandler}
			></d2l-labs-summary-card>
		`;
	}

	_valueClickHandler() {
		this.data.setApplied('d2l-insights-overdue-assignments-card', true);
	}
}
customElements.define('d2l-insights-overdue-assignments-card', OverdueAssignmentsCard);
