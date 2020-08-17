import './components/histogram-card.js';
import './components/ou-filter.js';
import './components/summary-card.js';
import './components/insights-role-filter.js';
import './components/semester-filter.js';
import './components/users-table.js';
import './components/table.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Data } from './model/data.js';
import { heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { Localizer } from './locales/localizer';

async function fetchData() {
	const response = await fetch('/d2l/api/ap/unstable/insights/data/engagement');
	return await response.json();
}

async function demoData() {
	return new Promise(resolve =>
		setTimeout(
			() => resolve({
				records: [{ UserId: 1, OrgUnitId: 1 }, { UserId: 2, OrgUnitId: 1 }, { UserId: 2, OrgUnitId: 2 }],
				orgUnits: [
					[1, 'Course 1', 3, [3, 4]],
					[2, 'Course 2', 3, [3, 4]],
					[6, 'Course 3 has a surprisingly long name, but nonetheless this kind of thing is bound to happen sometimes and we do need to design for it. Is that not so?', 3, [7, 4]],
					[8, 'ZCourse 4', 3, [5]],
					[3, 'Department 1', 2, [5]],
					[7, 'Department 2 has a longer name', 2, [5]],
					[4, 'Semester', 25, [6606]],
					[5, 'Faculty 1', 7, [6606]],
					[9, 'Faculty 2', 7, [6606]],
					[6606, 'Dev', 1, [0]]
				],
				users: [
					[100, 'First', 'Last'],
					[200, 'Test', 'Student']
				],
				semesterTypeId: 25,
				selectedOrgUnitIds: [1, 2]
			}),
			100
		)
	);
}

/**
 * @property {Boolean} useTestData - if true, use canned data; otherwise call the LMS
 */
class EngagementDashboard extends Localizer(LitElement) {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' }
		};
	}

	static get styles() {
		return [
			heading3Styles,
			css`
				:host {
					display: block;
					padding: 0 30px;
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

				h1.d2l-heading-1 {
					font-weight: normal;	/* default for h1 is bold */
					margin: 0.67em 0;		/* required to be explicitly defined for Edge Legacy */
					padding: 0;				/* required to be explicitly defined for Edge Legacy */
				}

				h2.d2l-heading-3 {
					margin-bottom: 1rem; /* default for d2l h3 style is 1.5 rem */
				}

				@media screen and (max-width: 615px) {
					h1 {
						line-height: 2rem;
					}

					:host {
						display: block;
						padding: 0 18px;
					}
				}
			`
		];
	}

	render() {
		this._data = new Data({
			recordProvider: this.isDemo ? demoData : fetchData,
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
				<h1 class="d2l-heading-1">${this.localize('components.insights-engagement-dashboard.title')}</h1>

				<div class="view-filters-container">
					<d2l-insights-ou-filter .data="${this._data}" @d2l-insights-ou-filter-change="${this._onOuFilterChange}"></d2l-insights-ou-filter>
					<d2l-insights-semester-filter @d2l-insights-semester-filter-change="${this._semesterFilterChange}" page-size="3" ?demo="${this.isDemo}"></d2l-insights-semester-filter>
					<d2l-insights-role-filter @d2l-insights-role-filter-change="${this._handleRoleSelectionsUpdated}" ?demo="${this.isDemo}"></d2l-insights-role-filter>
				</div>

				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.summaryHeading')}</h2>
				<div class="summary-container">
					${Object.values(this._data.filters).map(f => html`<d2l-labs-summary-card id="${f.id}" .data="${f}"></d2l-labs-summary-card>`)}
				</div>

				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.resultsHeading')}</h2>
				<d2l-insights-users-table .data="${this._data}"></d2l-insights-users-table>
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

	_semesterFilterChange(event) {
		event.stopPropagation();

		console.log(`List of selected semesters: ${event.target.selected}`);
	}
}
customElements.define('d2l-insights-engagement-dashboard', EngagementDashboard);
