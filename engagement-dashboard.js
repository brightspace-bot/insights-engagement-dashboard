import '@brightspace-ui/core/components/dialog/dialog-confirm';
import 'd2l-button-group/d2l-action-button-group';
import 'd2l-navigation/d2l-navigation-immersive';
import 'd2l-navigation/d2l-navigation-link-back';

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
import './components/user-drill-view.js';

import { css, html } from 'lit-element/lit-element.js';
import { getPerformanceLoadPageMeasures, TelemetryHelper } from './model/telemetry-helper';
import { CourseLastAccessFilter } from './components/course-last-access-card';
import { createComposeEmailPopup } from './components/email-integration';
import { CurrentFinalGradesFilter } from './components/current-final-grade-card';
import { Data } from './model/data.js';
import { DiscussionActivityFilter } from './components/discussion-activity-card';
import { ExportData } from './model/exportData';
import { fetchData } from './model/lms.js';
import { fetchData as fetchDemoData } from './model/fake-lms.js';
import { FilteredData } from './model/filteredData';
import { heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { LastAccessFilter } from './components/last-access-card';
import { Localizer } from './locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';
import { OverdueAssignmentsFilter } from './components/overdue-assignments-card';
import { TimeInContentVsGradeFilter } from './components/time-in-content-vs-grade-card';
import { toJS } from 'mobx';

const insightsPortalEndpoint = '/d2l/ap/insightsPortal/main.d2l';

/**
 * @property {Boolean} isDemo - if true, use canned data; otherwise call the LMS
 * @property {String} currentView - is the name of supported view. Valid values: home, user, settings
 * @property {String} telemetryEndpoint - endpoint for gathering telemetry performance data
 * @property {String} telemetryId - GUID that is used to group performance metrics for each separate page load
 */
class EngagementDashboard extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
			orgUnitId: { type: Number, attribute: 'org-unit-id' },
			currentView: { type: String, attribute: 'view', reflect: true },
			telemetryEndpoint: { type: String, attribute: 'telemetry-endpoint' },
			telemetryId: { type: String, attribute: 'telemetry-id' },
		};
	}

	constructor() {
		super();

		this.orgUnitId = 0;
		this.isDemo = false;
		this.currentView = 'home';
		this.telemetryEndpoint = '';
		this.telemetryId = '';

		this.linkToInsightsPortal = ''; // initialized in firstUpdated to get the actual orgUnitId value
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

				.d2l-insights-immersive-nav-title {
					display: flex;
  					align-items: center;
				}

				.d2l-insights-chart-container {
					display: flex;
					flex-wrap: wrap;
					margin-top: -10px;
				}

				.d2l-insights-summary-chart-layout {
					display: flex;
					flex-wrap: wrap;
					max-width: 1300px;
				}

				d2l-insights-results-card,
				d2l-insights-discussion-activity-card {
					margin-right: 12px;
				}

				.d2l-insights-summary-container {
					display: flex;
					flex-wrap: wrap;
					margin-right: 10px;
					max-width: 594px;
				}

				.d2l-insights-summary-container-applied-filters {
					height: auto;
					width: 100%;
				}

				h1.d2l-heading-1 {
					font-weight: normal;	/* default for h1 is bold */
					margin: 0.67em 0;		/* required to be explicitly defined for Edge Legacy */
					padding: 0;				/* required to be explicitly defined for Edge Legacy */
				}

				h2.d2l-heading-3 {
					margin-bottom: 1rem; /* default for d2l h3 style is 1.5 rem */
				}

				.d2l-heading-button-group {
					display: flex;
					flex-direction: row;
					justify-content: space-between;
				}

				.d2l-main-action-button-group {
					flex-grow: 1;
					margin: 0.7em;
					max-width: 300px;
				}

				@media only screen and (max-width: 780px) {
					.d2l-main-action-button-group {
						max-width: 10%;
					}
				}

				.d2l-table-action-button-group {
					margin-bottom: 1rem;
				}

				.d2l-insights-noDisplay {
					display: none;
					padding: 50px;
				}

				.d2l-insights-link-back-default {
					display: inline-block;
				}

				.d2l-insights-link-back-responsive {
					display: none;
				}

				@media screen and (max-width: 615px) {
					h1 {
						line-height: 2rem;
						margin-bottom: 10px;
					}

					:host {
						display: block;
						padding: 0 18px;
					}

					.d2l-insights-summary-container {
						margin-right: 0;
					}

					.d2l-insights-link-back-default {
						display: none;
					}

					.d2l-insights-link-back-responsive {
						display: inline-block;
					}
				}
			`
		];
	}

	firstUpdated() {
		const linkToInsightsPortal = new URL(insightsPortalEndpoint, window.location.origin);
		linkToInsightsPortal.searchParams.append('ou', this.orgUnitId);
		this.linkToInsightsPortal = linkToInsightsPortal;
	}

	render() {
		let innerView = html``;
		switch (this.currentView) {
			case 'home':
				innerView = this._renderHomeView();
				break;
			case 'user':
				innerView =  this._renderUserDrillView();
				break;
		}

		return html`
			${ this._renderNavBar() }
			${ innerView }
		`;
	}

	_renderNavBar() {
		return html`
			<d2l-navigation-immersive
				width-type="fullscreen">
				<div slot="left">
					<d2l-navigation-link-back
						text="${this.localize('components.insights-engagement-dashboard.backLinkText')}"
						href="${this.linkToInsightsPortal}"
						class="d2l-insights-link-back-default">
					</d2l-navigation-link-back>
					<d2l-navigation-link-back
						text="${this.localize('components.insights-engagement-dashboard.backLinkTextShort')}"
						href="${this.linkToInsightsPortal}"
						class="d2l-insights-link-back-responsive">
					</d2l-navigation-link-back>
				</div>
				<div slot="middle" class="d2l-insights-immersive-nav-title">
					${this.localize('components.insights-engagement-dashboard.title')}
				</div>
			</d2l-navigation-immersive>
		`;
	}

	_renderUserDrillView() {
		const user = {
			firstName: 'Dane',
			lastName: 'Clarie',
			username: 'claire.dane',
			userId: 887
		};

		return html`
			<d2l-insights-user-drill-view
				.user="${user}"
				@d2l-insights-user-drill-view-back="${this._backToHomeHandler}"
			></d2l-insights-user-drill-view>
		`;
	}

	_renderHomeView() {
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
							text=${this.localize('components.insights-engagement-dashboard.exportToCsv')}
							@click="${this._exportToCsv}">
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
				<d2l-insights-message-container .data="${this._data}" .isNoDataReturned="${this._isNoUserResults}"></d2l-insights-message-container>
				<h2 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.summaryHeading')}</h2>
				<div class="d2l-insights-summary-container-applied-filters">
					<d2l-insights-applied-filters .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-applied-filters>
				</div>
				<div class="d2l-insights-summary-chart-layout">
					<div class="d2l-insights-summary-container">
						<d2l-insights-results-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-results-card>
						<d2l-insights-overdue-assignments-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-overdue-assignments-card>
						<d2l-insights-discussion-activity-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-discussion-activity-card>
						<d2l-insights-last-access-card .data="${this._data}" ?skeleton="${this._isLoading}"></d2l-insights-last-access-card>
					</div>
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
					?opened=${Boolean(this._serverData.isDefaultView)}
					.data="${this._serverData}">
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

	_backToHomeHandler(event) {
		event.stopPropagation();
		this.currentView = 'home';
	}

	_exportToCsv() {
		const usersTable = this.shadowRoot.querySelector('d2l-insights-users-table');
		ExportData.userDataToCsv(usersTable.dataForExport, usersTable.headersForExport);
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

	get _isNoUserResults() {
		if (!this.isDemo) {
			return this._data.records.length === 0 && !this._data.isLoading;
		}
		return false;
	}

	get _serverData() {
		if (!this.__serverData) {
			this.__serverData = new Data({
				recordProvider: this.isDemo ? fetchDemoData : fetchData
			});
		}

		return this.__serverData;
	}

	get _telemetryHelper() {
		if (!this.telemetryEndpoint) {
			return null;
		}

		if (!this.__telemetryHelper) {
			this.__telemetryHelper = new TelemetryHelper(this.telemetryEndpoint);
		}

		return this.__telemetryHelper;
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
			// we use the root OU id because that's where we expect users to have email permissions
			createComposeEmailPopup(toJS(selectedUserIds), this._serverData.orgUnitTree.rootId);
		}
	}

	_handlePageLoad() {
		if (!this._telemetryHelper) {
			return;
		}

		this._telemetryHelper.logPerformanceEvent({
			id: this.telemetryId,
			measures: getPerformanceLoadPageMeasures(),
			action: 'PageLoad'
		});
	}

	_handlePerformanceMeasure(event) {
		if (!this._telemetryHelper) {
			return;
		}

		if (!['d2l.page.tti', 'first-paint', 'first-contentful-paint'].includes(event.detail.value.name)) {
			return;
		}

		this._telemetryHelper.logPerformanceEvent({
			id: this.telemetryId,
			measures: [event.detail.value],
			action: 'PageLoad'
		});
	}

	connectedCallback() {
		super.connectedCallback();

		this._boundHandlePageLoad = this._handlePageLoad.bind(this);
		window.addEventListener('load', this._boundHandlePageLoad);

		this._boundHandlePerformanceMeasure = this._handlePerformanceMeasure.bind(this);
		document.addEventListener('d2l-performance-measure', this._boundHandlePerformanceMeasure);
	}

	disconnectedCallback() {
		window.removeEventListener('load', this._boundHandlePageLoad);
		document.removeEventListener('d2l-performance-measure', this._boundHandlePerformanceMeasure);

		super.disconnectedCallback();
	}
}
customElements.define('d2l-insights-engagement-dashboard', EngagementDashboard);
