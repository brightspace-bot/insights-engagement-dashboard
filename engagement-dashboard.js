import '@brightspace-ui/core/components/dialog/dialog-confirm';
import 'd2l-button-group/d2l-action-button-group';

import './components/histogram-card.js';
import './components/ou-filter.js';
import './components/results-card.js';
import './components/debug-card.js';
import './components/role-filter.js';
import './components/semester-filter.js';
import './components/users-table.js';
import './components/table.js';
import './components/current-final-grade-card.js';
import './components/applied-filters';
import './components/aria-loading-progress';
import './components/course-last-access-card.js';
import './components/discussion-activity-card.js';
import './components/message-container.js';
import './components/default-view-popup.js';

import { css, html } from 'lit-element/lit-element.js';
import { CourseLastAccessFilter } from './components/course-last-access-card';
import { CurrentFinalGradesFilter } from './components/current-final-grade-card';
import { Data } from './model/data.js';
import { DiscussionActivityFilter } from './components/discussion-activity-card';
import { fetchData } from './model/lms.js';
import { fetchData as fetchDemoData } from './model/fake-lms.js';
import { FilteredData } from './model/filteredData';
import { heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { LastAccessFilter } from './components/last-access-card';
import { Localizer } from './locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { OverdueAssignmentsFilter } from './components/overdue-assignments-card';
import { TimeInContentVsGradeFilter } from './components/time-in-content-vs-grade-card';

/**
 * @property {Boolean} isDemo - if true, use canned data; otherwise call the LMS
 */
class EngagementDashboard extends Localizer(MobxLitElement) {

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

				.d2l-insights-chart-container {
					display: flex;
					flex-wrap: wrap;
					margin-top: -10px;
				}

				.d2l-insights-summary-container {
					display: flex;
					flex-wrap: wrap;
				}

				.d2l-insights-summary-container-applied-filters {
					height: auto;
					width: 100%;
				}

				h1.d2l-heading-1 {
					font-weight: normal;	/* default for h1 is bold */
					margin: 0.67em 0;		/* required to be explicitly defined for Edge Legacy */
					padding: 0;				/* required to be explicitly defined for Edge Legacy */
					width: 65%;
				}

				h2.d2l-heading-3 {
					margin-bottom: 1rem; /* default for d2l h3 style is 1.5 rem */
				}

				.d2l-heading-button-group {
					display: flex;
					flex-direction: row;
					flex-wrap: wrap;
				}

				.d2l-main-action-button-group {
					flex-grow: 1;
					margin: 0.7em;
					width: 25%;
				}

				.d2l-table-action-button-group {
					margin-bottom: 1rem;
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
		return html`

				<d2l-insights-aria-loading-progress .data="${this._data}"></d2l-insights-aria-loading-progress>

				<div class="d2l-heading-button-group">
					<h1 class="d2l-heading-1">${this.localize('components.insights-engagement-dashboard.title')}</h1>
					<d2l-action-button-group
						class="d2l-main-action-button-group"
						min-to-show="0"
						max-to-show="2"
						opener-type="more"
					>
						<d2l-button-subtle
							icon="d2l-tier1:export"
							text=${this.localize('components.insights-engagement-dashboard.exportToCsv')}>
						</d2l-button-subtle>
						<d2l-button-subtle
							icon="d2l-tier1:help"
							text=${this.localize('components.insights-engagement-dashboard.learMore')}
							@click="${this._openHelpLink}">
						</d2l-button-subtle>
					</d2l-action-button-group>
				</div>

				<div class="view-filters-container">
					<d2l-insights-ou-filter
						.data="${this._serverData}"
						@d2l-insights-ou-filter-change="${this._orgUnitFilterChange}"
					></d2l-insights-ou-filter>
					<d2l-insights-semester-filter
						page-size="10000"
						?demo="${this.isDemo}"
						.preSelected="${this._serverData.selectedSemesterIds}"
						@d2l-insights-semester-filter-change="${this._semesterFilterChange}"
					></d2l-insights-semester-filter>
					<d2l-insights-role-filter
						@d2l-insights-role-filter-change="${this._roleFilterChange}"
						?demo="${this.isDemo}"
					></d2l-insights-role-filter>
				</div>
				<d2l-insights-message-container .data="${this._data}"></d2l-insights-message-container>
				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.summaryHeading')}</h2>
				<div class="d2l-insights-summary-container-applied-filters">
					<d2l-insights-applied-filters .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-applied-filters>
				</div>
				<div class="d2l-insights-summary-container">
					<d2l-insights-results-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-results-card>
					<d2l-insights-overdue-assignments-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-overdue-assignments-card>
					<d2l-insights-discussion-activity-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-discussion-activity-card>
					<d2l-insights-last-access-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-last-access-card>
				</div>
				<div class="d2l-insights-chart-container">
					<div><d2l-insights-current-final-grade-card	.data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-current-final-grade-card></div>
					<div><d2l-insights-time-in-content-vs-grade-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-time-in-content-vs-grade-card></div>
					<div><d2l-insights-course-last-access-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-course-last-access-card></div>
				</div>

				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.resultsHeading')}</h2>

				<d2l-action-button-group class="d2l-table-action-button-group" min-to-show="0" max-to-show="2" opener-type="more">
					<d2l-button-subtle
						icon="d2l-tier1:email"
						text="${this.localize('components.insights-engagement-dashboard.emailButton')}"
						@click="${this._handleEmailButtonPress}">
					</d2l-button-subtle>
				</d2l-action-button-group>

				<d2l-insights-users-table
					.data="${this._data}"
					?skeleton="${this._isLoading}"
				></d2l-insights-users-table>

				<d2l-insights-default-view-popup
					?opened=${Boolean(this._serverData.defaultViewPopupDisplayData.length)}
					.data="${this._serverData.defaultViewPopupDisplayData}">
				</d2l-insights-default-view-popup>

				<d2l-dialog-confirm
					id="no-users-selected-dialog"
					text="${this.localize('components.insights-engagement-dashboard.noUsersSelectedDialogText')}">
					<d2l-button slot="footer" primary data-dialog-action>
						${this.localize('components.insights-default-view-popup.buttonOk')}
					</d2l-button>
				</d2l-dialog-confirm>
		`;
	}

	get _isLoading() {
		return this._data.isLoading;
	}

	get _data() {
		if (!this.__data) {
			// There are row filters - which look at each record individually when deciding to include or
			// exclude it - and there are aggregate filters, which also look at all records selected by
			// other filters (e.g. to include a record if it has an above-average value in some field).
			// Aggregate filters are potentially ambiguous if there are more than one and each depends
			// on the results of the other: we avoid this by building them on specific sets of filters.
			const rowFilteredData = new FilteredData(this._serverData)
				.withFilter(new OverdueAssignmentsFilter())
				.withFilter(new LastAccessFilter())
				.withFilter(new CourseLastAccessFilter())
				.withFilter(new CurrentFinalGradesFilter())
				.withFilter(new DiscussionActivityFilter());

			this.__data = rowFilteredData.withFilter(new TimeInContentVsGradeFilter(rowFilteredData));
		}

		return this.__data;
	}

	get _serverData() {
		if (!this.__serverData) {
			this.__serverData = new Data({
				recordProvider: this.isDemo ? fetchDemoData : fetchData
			});
		}

		return this.__serverData;
	}

	_openHelpLink() {
		window.open('https://community.brightspace.com/s/article/Brightspace-Performance-Plus-Analytics-Administrator-Guide', '_blank');
	}

	_roleFilterChange(event) {
		event.stopPropagation();
		this._serverData.selectedRoleIds = event.target.selected;
	}

	_orgUnitFilterChange(event) {
		event.stopPropagation();
		this._serverData.selectedOrgUnitIds = event.target.selected;
	}

	_semesterFilterChange(event) {
		event.stopPropagation();
		this._serverData.selectedSemesterIds = event.target.selected;
	}

	_handleEmailButtonPress() {
		const usersTable = this.shadowRoot.querySelector('d2l-insights-users-table');
		const selectedUserIds = usersTable.selectedUserIds;

		if (!selectedUserIds.length) {
			const noUsersSelectedDialog = this.shadowRoot.querySelector('#no-users-selected-dialog');
			noUsersSelectedDialog.opened = true;
		} else {
			// (out-of-scope) show email edit dialog
			console.log(selectedUserIds);
		}
	}
}
customElements.define('d2l-insights-engagement-dashboard', EngagementDashboard);
