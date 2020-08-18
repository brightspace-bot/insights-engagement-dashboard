import './summary-card.js';

import { html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

class ResultsCard extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	constructor() {
		super();
		this.data = {};
	}

	get cardMessage() {
		return this.localize('components.insights-engagement-dashboard.resultsReturned');
	}

	get cardTitle() {
		return this.localize('components.insights-engagement-dashboard.resultsHeading');
	}

	get cardValue() {
		return this.data.userDataForDisplay.length;
	}

	render() {
		return html`
			<d2l-labs-summary-card id="d2l-insights-engagement-results" .data="${this.data}" card-title="${this.cardTitle}" card-value="${this.cardValue}" card-message="${this.cardMessage}"></d2l-labs-summary-card>
		`;
	}
}
customElements.define('d2l-insights-results-card', ResultsCard);
