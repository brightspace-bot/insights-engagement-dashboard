import './summary-card.js';

import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class OverdueAssignmentsCard extends Localizer(MobxLitElement) {

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
				is-value-clickable id="d2l-insights-engagement-overdue-assignments"
				.data="${this.data}"
				card-title="${this._cardTitle}"
				card-value="${this._cardValue}"
				card-message="${this._cardMessage}"
				@d2l-labs-summary-card-value-click=${this._valueClickHandler}
			></d2l-labs-summary-card>
		`;
	}

	_valueClickHandler() {
		this.data.setApplied('d2l-insights-overdue-assignments-card', true);
	}
}
customElements.define('d2l-insights-overdue-assignments-card', OverdueAssignmentsCard);
