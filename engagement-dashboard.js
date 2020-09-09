import './components/histogram-card.js';
import './components/ou-filter.js';
import './components/results-card.js';
import './components/overdue-assignments-card';
import './components/debug-card.js';
import './components/role-filter.js';
import './components/semester-filter.js';
import './components/users-table.js';
import './components/table.js';
import './components/time-in-content-vs-grade-card';
import './components/current-final-grade-card.js';

import { css, html, LitElement } from 'lit-element/lit-element.js';
import { Data, RECORD } from './model/data.js';
import { fetchData } from './model/lms.js';
import { fetchData as fetchDemoData } from './model/fake-lms.js';
import { heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { Localizer } from './locales/localizer';

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
				.d2l-insights-summary-container {
					display: flex;
					flex-wrap: wrap;
					margin-bottom: 25px;
					margin-top: 10px;
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
			recordProvider: this.isDemo ? fetchDemoData : fetchData,
			cardFilters: [
				// {
				// 	id: 'd2l-insights-engagement-summary',
				// 	title: 'Summary',
				// 	countUniqueField: 'UserId',
				// 	messageProvider: () => 'users'
				// }
				{
					id: 'd2l-insights-overdue-assignments-card',
					title: 'Overdue Assignments',
					filter: (record) => record[RECORD.OVERDUE] > 0
				}
			]
		});

		return html`
				<h1 class="d2l-heading-1">${this.localize('components.insights-engagement-dashboard.title')}</h1>

				<div class="view-filters-container">
					<d2l-insights-ou-filter
						.data="${this._data}"
						@d2l-insights-ou-filter-change="${this._orgUnitFilterChange}"
					></d2l-insights-ou-filter>
					<d2l-insights-semester-filter
						page-size="10000"
						?demo="${this.isDemo}"
						@d2l-insights-semester-filter-change="${this._semesterFilterChange}"
					></d2l-insights-semester-filter>
					<d2l-insights-role-filter
						@d2l-insights-role-filter-change="${this._roleFilterChange}"
						?demo="${this.isDemo}"
					></d2l-insights-role-filter>
				</div>

				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.summaryHeading')}</h2>
				<div class="d2l-insights-summary-container">
					<d2l-insights-results-card .data="${this._data}"></d2l-insights-results-card>
					<d2l-insights-current-final-grade-card .data="${this._data}"></d2l-insights-current-final-grade-card>
					<d2l-insights-overdue-assignments-card .data="${this._data}"></d2l-insights-overdue-assignments-card>
					<d2l-insights-debug-card .data="${this._data}" metric-to-display="filteredRecordsLength" title="Records" message="number of records within filter parameters"></d2l-insights-debug-card>
					<d2l-insights-time-in-content-vs-grade-card .data="${this._data}"></d2l-insights-time-in-content-vs-grade-card>
				</div>

				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.resultsHeading')}</h2>
				<d2l-insights-users-table .data="${this._data}"></d2l-insights-users-table>
		`;
	}

	_roleFilterChange(event) {
		event.stopPropagation();
		this._data.applyRoleFilters(event.target.selected.map(roleId => Number(roleId)));
	}

	_orgUnitFilterChange(event) {
		event.stopPropagation();
		this._data.applyOrgUnitFilters(event.target.selected);
	}

	_semesterFilterChange(event) {
		event.stopPropagation();
		this._data.applySemesterFilters(event.target.selected.map(semesterId => Number(semesterId)));
	}
}
customElements.define('d2l-insights-engagement-dashboard', EngagementDashboard);
