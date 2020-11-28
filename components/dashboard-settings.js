import '@brightspace-ui/core/components/list/list';
import '@brightspace-ui/core/components/list/list-item';
import '@brightspace-ui/core/components/tabs/tabs';
import '@brightspace-ui/core/components/tabs/tab-panel';
import '@brightspace-ui/core/components/inputs/input-number';

import '../components/summary-card';
import '../components/svg/course-access-thumbnail.svg';
import '../components/svg/current-grade-thumbnail.svg';
import '../components/svg/tic-vs-grade-thumbnail.svg';
import '../components/svg/disc-activity-thumbnail.svg';

import { bodySmallStyles, bodyStandardStyles, heading1Styles, heading2Styles, heading3Styles }
	from '@brightspace-ui/core/components/typography/styles.js';
import { css, html, LitElement } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';
import { saveSettings } from '../model/lms';

class DashboardSettings extends RtlMixin(Localizer(LitElement)) {

	static get properties() {
		return {
			showCourseAccessCard: { type: Boolean, attribute: 'course-access-card', reflect: true },
			showCoursesCol: { type: Boolean, attribute: 'courses-col', reflect: true },
			showDiscussionsCard: { type: Boolean, attribute: 'discussions-card', reflect: true },
			showDiscussionsCol: { type: Boolean, attribute: 'discussions-col', reflect: true },
			showGradesCard: { type: Boolean, attribute: 'grades-card', reflect: true },
			showGradeCol: { type: Boolean, attribute: 'grade-col', reflect: true },
			showLastAccessCol: { type: Boolean, attribute: 'last-access-col', reflect: true },
			showOverdueCard: { type: Boolean, attribute: 'overdue-card', reflect: true },
			showResultsCard: { type: Boolean, attribute: 'results-card', reflect: true },
			showSystemAccessCard: { type: Boolean, attribute: 'system-access-card', reflect: true },
			showTicCol: { type: Boolean, attribute: 'tic-col', reflect: true },
			showTicGradesCard: { type: Boolean, attribute: 'tic-grades-card', reflect: true },
			lastAccessThresholdDays: { type: Number, attribute: 'last-access-threshold-days', reflect: true },
			includeRoles: { type: Array, attribute: 'include-roles' }
		};
	}

	static get styles() {
		return [bodySmallStyles, bodyStandardStyles, heading1Styles, heading2Styles, heading3Styles, css`
			:host {
				display: flex;
				flex-direction: column; /* required so the footer actually appears on-screen */
				height: 100%;
			}
			:host([hidden]) {
				display: none;
			}

			.d2l-insights-settings-page-main-container {
				height: 100%;
				overflow-y: auto;
				padding-top: 30px;
			}

			.d2l-insights-settings-page-main-content {
				background-color: white;
				margin: 0 auto;
				max-width: 1230px;
				padding-bottom: 72px; /* height of footer */
				width: 100%;
			}

			footer {
				background-color: white;
				bottom: 0;
				box-shadow: 0 -2px 4px rgba(73, 76, 78, 0.2); /* ferrite */
				height: 42px; /* height of a d2l-button */
				left: 0;
				padding: 0.75rem 30px;
				position: fixed;
				right: 0;
				z-index: 2; /* ensures the footer box-shadow is over main areas with background colours set */
			}

			.d2l-insights-settings-page-footer {
				margin: 0 auto;
				max-width: 1230px;
				width: 100%;
			}

			h1.d2l-heading-1, h2.d2l-heading-2 {
				font-weight: normal;
			}

			h3.d2l-heading-3 {
				margin-top: 0;
			}

			.d2l-demo-card {
				margin: 10px 30px;
			}

			.d2l-system-access-edit-input {
				display: inline-block;
				width: 3.5rem;
				z-index: 2; /* otherwise the input isn't selectable */
			}

			/* buttons */
			.d2l-insights-settings-footer-button,
			.d2l-insights-settings-footer-button-desktop,
			.d2l-insights-settings-footer-button-responsive {
				margin-left: 0;
				margin-right: 0.75rem;
			}

			:host([dir="rtl"]) .d2l-insights-settings-footer-button,
			:host([dir="rtl"]) .d2l-insights-settings-footer-button-desktop,
			:host([dir="rtl"]) .d2l-insights-settings-footer-button-responsive {
				margin-left: 0.75rem;
				margin-right: 0;
			}

			.d2l-insights-settings-footer-button-desktop {
				display: inline-block;
			}

			.d2l-insights-settings-footer-button-responsive {
				display: none;
			}

			@media screen and (max-width: 615px) {
				h1.d2l-heading-1, h2.d2l-heading-2 {
					font-weight: normal;
				}

				footer {
					padding: 0.75rem 18px;
				}

				.d2l-insights-settings-footer-button-desktop {
					display: none;
				}

				.d2l-insights-settings-footer-button-responsive {
					display: inline-block;
				}

				.d2l-insights-settings-footer-button,
				.d2l-insights-settings-footer-button-desktop,
				.d2l-insights-settings-footer-button-responsive {
					margin-right: 0;
				}

				:host([dir="rtl"]) .d2l-insights-settings-footer-button,
				:host([dir="rtl"]) .d2l-insights-settings-footer-button-desktop,
				:host([dir="rtl"]) .d2l-insights-settings-footer-button-responsive {
					margin-left: 0;
				}
			}
		`];
	}

	constructor() {
		super();

		this.showCourseAccessCard = false;
		this.showCoursesCol = false;
		this.showDiscussionsCard = false;
		this.showDiscussionsCol = false;
		this.showGradesCard = false;
		this.showGradeCol = false;
		this.showLastAccessCol = false;
		this.showOverdueCard = false;
		this.showResultsCard = false;
		this.showSystemAccessCard = false;
		this.showTicCol = false;
		this.showTicGradesCard = false;
		this.lastAccessThresholdDays = 14;
		this.includeRoles = [];
	}

	render() {
		return html`
			<div class="d2l-insights-settings-page-main-container">
				<div class="d2l-insights-settings-page-main-content">
					<h1 class="d2l-heading-1">${this.localize('components.insights-settings-view.title')}</h1>
					<h2 class="d2l-heading-2">${this.localize('components.insights-settings-view.description')}</h2>

					<d2l-tabs>
						<d2l-tab-panel text="${this.localize('components.insights-settings-view.tabTitleSummaryMetrics')}">
							<!-- out of scope: roles selection -->

							${this._renderCardSelectionList()}
						</d2l-tab-panel>

						<d2l-tab-panel text="${this.localize('components.insights-settings-view.tabTitleResultsTableMetrics')}">
							<!-- out of scope: users table column selection -->
						</d2l-tab-panel>
					</d2l-tabs>
				</div>
			</div>
			${this._renderFooter()}
		`;
	}

	_renderCardSelectionList() {
		return html`
			<d2l-list>
				<d2l-list-item key="1" selectable>
					<d2l-insights-current-grade-thumbnail class="d2l-demo-card"></d2l-insights-current-grade-thumbnail>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-current-final-grade-card.currentGrade')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.currentGradeDesc')}</p>
					</div>
				</d2l-list-item>
				<d2l-list-item key="2" selectable>
					<d2l-insights-course-access-thumbnail class="d2l-demo-card"></d2l-insights-course-access-thumbnail>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-course-last-access-card.courseAccess')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.courseAccessDesc')}</p>
					</div>
				</d2l-list-item>
				<d2l-list-item key="3" selectable>
					<d2l-insights-tic-vs-grade-thumbnail class="d2l-demo-card"></d2l-insights-tic-vs-grade-thumbnail>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-time-in-content-vs-grade-card.timeInContentVsGrade')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.ticVsGradeDesc')}</p>
					</div>
				</d2l-list-item>
				<d2l-list-item key="4" selectable>
					<d2l-labs-summary-card
						class="d2l-demo-card"
						card-title="${this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading')}"
						card-value="22"
						card-message="${this.localize('components.insights-engagement-dashboard.overdueAssignments')}">
					</d2l-labs-summary-card>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.overdueAssignmentsDesc')}</p>
					</div>
				</d2l-list-item>
				<d2l-list-item key="5" selectable>
					<d2l-labs-summary-card
						class="d2l-demo-card"
						card-title="${this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading')}"
						card-value="10"
						card-message="${this.localize('components.insights-engagement-dashboard.lastSystemAccess')}">
					</d2l-labs-summary-card>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.systemAccessDesc')}</p>
						${this._renderSystemAccessEditText()}
					</div>
				</d2l-list-item>
				<d2l-list-item key="6" selectable>
					<d2l-insights-disc-activity-thumbnail class="d2l-demo-card"></d2l-insights-disc-activity-thumbnail>
					<div>
						<h3 class="d2l-heading-3">${this.localize('components.insights-discussion-activity-card.cardTitle')}</h3>
						<p class="d2l-body-standard">${this.localize('components.insights-settings-view.discActivityDesc')}</p>
					</div>
				</d2l-list-item>
			</d2l-list>
		`;
	}

	_renderSystemAccessEditText() {
		const text = this.localize('components.insights-settings-view.systemAccessEdit', { num: '{num}' }).split('{num}');

		// TODO: use current value as placeholder
		return html`
			<div>
				<span class="d2l-body-small">${text[0]}</span>
				<d2l-input-number class="d2l-system-access-edit-input"></d2l-input-number>
				<span class="d2l-body-small">${text[1]}</span>
			</div>
		`;
	}

	_renderFooter() {
		return html`
			<footer>
				<div class="d2l-insights-settings-page-footer">
					<d2l-button
						primary
						class="d2l-insights-settings-footer-button-desktop"
						@click="${this._handleSaveAndClose}">
						${this.localize('components.insights-settings-view.saveAndClose')}
					</d2l-button>
					<d2l-button
						primary
						class="d2l-insights-settings-footer-button-responsive"
						@click="${this._handleSaveAndClose}">
						${this.localize('components.insights-settings-view.save')}
					</d2l-button>
					<d2l-button
						class="d2l-insights-settings-footer-button"
						@click="${this._returnToEngagementDashboard}">
						${this.localize('components.insights-settings-view.cancel')}
					</d2l-button>
				</div>
			</footer>
		`;
	}

	async _handleSaveAndClose() {
		await saveSettings({
			showResultsCard: this.showResultsCard,
			showOverdueCard: this.showOverdueCard,
			showDiscussionsCard: this.showDiscussionsCard,
			showSystemAccessCard: this.showSystemAccessCard,
			showGradesCard: this.showGradesCard,
			showTicGradesCard: this.showTicGradesCard,
			showCourseAccessCard: this.showCourseAccessCard,
			showCoursesCol: this.showCoursesCol,
			showGradeCol: this.showGradeCol,
			showTicCol: this.showTicCol,
			showDiscussionsCol: this.showDiscussionsCol,
			showLastAccessCol: this.showLastAccessCol,
			lastAccessThresholdDays: this.lastAccessThresholdDays,
			includeRoles: this.includeRoles
		});

		// todo: apply settings to dashboard, probably by firing an event
		this._returnToEngagementDashboard();
	}

	_returnToEngagementDashboard() {
		this.dispatchEvent(new Event('d2l-insights-settings-view-back'));
	}
}
customElements.define('d2l-insights-engagement-dashboard-settings', DashboardSettings);
