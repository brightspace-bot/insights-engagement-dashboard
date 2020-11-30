import '@brightspace-ui/core/components/list/list';
import '@brightspace-ui/core/components/list/list-item';
import '@brightspace-ui/core/components/tabs/tabs';
import '@brightspace-ui/core/components/tabs/tab-panel';

import { css, html, LitElement } from 'lit-element';
import { heading1Styles, heading2Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { Localizer } from '../locales/localizer';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';
import { saveSettings } from '../model/lms';

/**
 * @fires d2l-insights-settings-view-save-and-close
 * @fires d2l-insights-settings-view-back
 */
class DashboardSettings extends RtlMixin(Localizer(LitElement)) {

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
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
			includeRoles: { type: String, attribute: 'include-roles' }
		};
	}

	static get styles() {
		return [heading1Styles, heading2Styles, css`
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

		this.isDemo = false;

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
		this.includeRoles = '';
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

							<d2l-insights-role-list
								?demo="${this.isDemo}"
								include-roles="${this.includeRoles}">
							</d2l-insights-role-list>
						</d2l-tab-panel>

						<d2l-tab-panel text="${this.localize('components.insights-settings-view.tabTitleResultsTableMetrics')}">
							<!-- out of scope: users table column selection -->
						</d2l-tab-panel>
					</d2l-tabs>
				</div>
			</div>

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

	get _selectedRoleIds() {
		return this.shadowRoot.querySelector('d2l-insights-role-list').selected;
	}

	async _handleSaveAndClose() {
		const selectedRoleIds = this._selectedRoleIds;

		const response = await saveSettings({
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
			includeRoles: selectedRoleIds
		});

		if (!response.ok) {
			console.error('Dashboard Settings View. Cannot save settings!');
			return;
		}

		this.dispatchEvent(new CustomEvent('d2l-insights-settings-view-save-and-close', {
			detail: {
				selectedRoleIds
			}
		}));
	}

	_returnToEngagementDashboard() {
		this.dispatchEvent(new Event('d2l-insights-settings-view-back'));
	}
}
customElements.define('d2l-insights-engagement-dashboard-settings', DashboardSettings);
