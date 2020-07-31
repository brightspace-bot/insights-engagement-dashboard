import './components/histogram-card.js';
import './components/ou-filter.js';
import './components/summary-card.js';
import './components/insights-role-filter.js';

import {css, html, LitElement} from 'lit-element/lit-element.js';
import {Data} from './model/data.js';

async function fetchData() {
	const response = await fetch('/d2l/api/ap/unstable/insights/data/engagement');
	return await response.json();
}

async function testData() {
	return new Promise(resolve =>
		setTimeout(
			() => resolve({
				records: [{UserId: 1, OrgUnitId: 1}, {UserId: 2, OrgUnitId: 1}, {UserId: 2, OrgUnitId: 2}],
				orgUnits: [
					[1, 'Course 1', 3, [3, 4]],
					[2, 'Course 2', 3, [3, 4]],
					[6, 'Course 3', 3, [7, 4]],
					[8, 'Course 4', 3, [5]],
					[3, 'Department 1', 2, [5]],
					[7, 'Department 2', 2, [5]],
					[4, 'Semester', 5, [6606]],
					[5, 'Faculty 1', 7, [6606]],
					[9, 'Faculty 2', 7, [6606]],
					[6606, 'Dev', 1, [0]]
				],
				selectedOrgUnitIds: [1, 2]
			}),
			100
		)
	);
}

/**
 * @property {Boolean} useTestData - if true, use canned data; otherwise call the LMS
 */
class EngagementDashboard extends LitElement {

	static get properties() {
		return {
			useTestData: { type: Boolean, attribute: 'use-test-data' }
		};
	}

	static get styles() {
		return [
			css`
				:host {
					display: block;
				}
				:host([hidden]) {
					display: none;
				}

				/* NB: this layout css doesn't quite work; do not ship */
				.summary-container {
					margin-top: 10px;
					margin-bottom: 25px;
					display: flex;
					flex-wrap: wrap;
				}
			`
		];
	}

	render() {
		this._data = new Data({
			recordProvider: this.useTestData ? testData : fetchData,
			filters: [
				// {
				// 	id: 'd2l-insights-engagement-summary',
				// 	title: 'Summary',
				// 	countUniqueField: 'UserId',
				// 	messageProvider: () => 'users'
				// }
			]
		});

		return html`
				<h2>Hello ${this.prop1}!</h2>

				<d2l-insights-role-filter @d2l-insights-role-filter-change="${this._handleRoleSelectionsUpdated}"></d2l-insights-role-filter>

				<div class="view-filters-container">
					<d2l-insights-ou-filter .data="${this._data}" @d2l-insights-ou-filter-change="${this._onOuFilterChange}"></d2l-insights-ou-filter>
					<d2l-insights-role-filter @d2l-insights-role-filter-change="${this._handleRoleSelectionsUpdated}" ?demo="${this.useTestData}"></d2l-insights-role-filter>
				</div>
				<div class="summary-container">
					${Object.values(this._data.filters).map(f => html`<d2l-labs-summary-card id="${f.id}" .data="${f}"></d2l-labs-summary-card>`)}
				</div>
		`;
	}

	_handleRoleSelectionsUpdated(event) {
		event.stopPropagation();
		// event.target should be d2l-insights-role-filter
		console.log(`List of selected role ids: ${event.target.selected}`);
	}

	_onOuFilterChange(e) {
		console.log(`got ou filter change with selected nodes ${JSON.stringify(e.target.selected.map(x => x.name))}`);
	}
}
customElements.define('d2l-insights-engagement-dashboard', EngagementDashboard);
