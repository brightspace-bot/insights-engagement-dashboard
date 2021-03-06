import '@brightspace-ui/core/components/offscreen/offscreen.js';

import '../components/summary-card';
import '../components/svg/course-access-thumbnail.svg';
import '../components/svg/current-grade-thumbnail.svg';
import '../components/svg/tic-vs-grade-thumbnail.svg';
import '../components/svg/disc-activity-thumbnail.svg';

import { bodySmallStyles, bodyStandardStyles, heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { css, html, LitElement } from 'lit-element/lit-element';
import { Localizer } from '../locales/localizer';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';

const lastSysAccessThresholdMinDays = 1;
const lastSysAccessThresholdMaxDays = 30;

class CardSelectionList extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			showCourseAccessCard: { type: Boolean, attribute: 'course-access-card', reflect: true },
			showDiscussionsCard: { type: Boolean, attribute: 'discussions-card', reflect: true },
			showGradesCard: { type: Boolean, attribute: 'grades-card', reflect: true },
			showOverdueCard: { type: Boolean, attribute: 'overdue-card', reflect: true },
			showResultsCard: { type: Boolean, attribute: 'results-card', reflect: true },
			showSystemAccessCard: { type: Boolean, attribute: 'system-access-card', reflect: true },
			showTicGradesCard: { type: Boolean, attribute: 'tic-grades-card', reflect: true },
			lastAccessThresholdDays: { type: Number, attribute: 'last-access-threshold-days', reflect: true }
		};
	}

	static get styles() {
		return [bodySmallStyles, bodyStandardStyles, heading3Styles, css`
			:host {
				display: block;
			}
			:host([hidden]) {
				display: none;
			}

			.d2l-demo-card {
				margin-bottom: 10px;
				margin-left: 30px;
				margin-right: 0;
				margin-top: 10px;
			}

			:host([dir="rtl"]) .d2l-demo-card {
				margin-bottom: 10px;
				margin-left: 0;
				margin-right: 30px;
				margin-top: 10px;
			}

			.d2l-insights-list-flex-container {
				display: flex;
				flex-direction: row;
			}

			.d2l-card-selection-title {
				margin-top: 0;
			}

			.d2l-card-selection-text {
				margin: 10px 30px;
			}

			.d2l-system-access-edit-input {
				display: inline-block;
				width: 3.5rem;
				z-index: 2; /* otherwise the input isn't selectable */
			}

			@media screen and (max-width: 767px) {
				.d2l-insights-list-flex-container {
					display: flex;
					flex-direction: column;
				}

				.d2l-card-selection-title {
					display: none;
				}

				.d2l-card-selection-text p {
					margin-top: 0;
				}
			}
		`];
	}

	constructor() {
		super();

		this.showCourseAccessCard = false;
		this.showDiscussionsCard = false;
		this.showGradesCard = false;
		this.showOverdueCard = false;
		this.showResultsCard = false;
		this.showSystemAccessCard = false;
		this.showTicGradesCard = false;
		this.lastAccessThresholdDays = 14;
	}

	render() {
		// NB: card selection list-item keys MUST have the same name as its corresponding component property
		// e.g. the key for this.showGradesCard must be "showGradesCard" (see _handleCardSelectionListChange)

		return html`
			<d2l-list id="card-selection-list" @d2l-list-selection-change="${this._handleCardSelectionListChange}">
				<d2l-list-item key="showGradesCard" selectable ?selected="${this.showGradesCard}">
					<div class="d2l-insights-list-flex-container">
						<d2l-insights-current-grade-thumbnail class="d2l-demo-card" aria-hidden="true"></d2l-insights-current-grade-thumbnail>
						<div class="d2l-card-selection-text">
							<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
								${this.localize('components.insights-current-final-grade-card.currentGrade')}
							</h3>
							<d2l-offscreen>${this.localize('components.insights-current-final-grade-card.currentGrade')}</d2l-offscreen>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.currentGradeDesc')}</p>
						</div>
					</div>
				</d2l-list-item>

				<d2l-list-item key="showCourseAccessCard" selectable ?selected="${this.showCourseAccessCard}">
					<div class="d2l-insights-list-flex-container">
						<d2l-insights-course-access-thumbnail class="d2l-demo-card" aria-hidden="true"></d2l-insights-course-access-thumbnail>
						<div class="d2l-card-selection-text">
							<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
								${this.localize('components.insights-course-last-access-card.courseAccess')}
							</h3>
							<d2l-offscreen>${this.localize('components.insights-course-last-access-card.courseAccess')}</d2l-offscreen>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.courseAccessDesc')}</p>
						</div>
					</div>
				</d2l-list-item>

				<d2l-list-item key="showTicGradesCard" selectable ?selected="${this.showTicGradesCard}">
					<div class="d2l-insights-list-flex-container">
						<d2l-insights-tic-vs-grade-thumbnail class="d2l-demo-card" aria-hidden="true"></d2l-insights-tic-vs-grade-thumbnail>
						<div class="d2l-card-selection-text">
							<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
								${this.localize('components.insights-time-in-content-vs-grade-card.timeInContentVsGrade')}
							</h3>
							<d2l-offscreen>${this.localize('components.insights-time-in-content-vs-grade-card.timeInContentVsGrade')}</d2l-offscreen>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.ticVsGradeDesc')}</p>
						</div>
					</div>
				</d2l-list-item>

				<d2l-list-item key="showOverdueCard" selectable ?selected="${this.showOverdueCard}">
					<div class="d2l-insights-list-flex-container">
						<d2l-labs-summary-card
							class="d2l-demo-card"
							card-title="${this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading')}"
							card-value="22"
							card-message="${this.localize('components.insights-engagement-dashboard.overdueAssignments')}"
							aria-hidden="true"
						>
						</d2l-labs-summary-card>
						<div class="d2l-card-selection-text">
							<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
								${this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading')}
							</h3>
							<d2l-offscreen>${this.localize('components.insights-engagement-dashboard.overdueAssignmentsHeading')}</d2l-offscreen>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.overdueAssignmentsDesc')}</p>
						</div>
					</div>
				</d2l-list-item>

				<d2l-list-item key="showSystemAccessCard" selectable ?selected="${this.showSystemAccessCard}">
					<div class="d2l-insights-list-flex-container">
						${this._renderSystemAccessListContents()}
					</div>
				</d2l-list-item>

				<d2l-list-item key="showDiscussionsCard" selectable ?selected="${this.showDiscussionsCard}">
					<div class="d2l-insights-list-flex-container">
						<d2l-insights-disc-activity-thumbnail class="d2l-demo-card" aria-hidden="true"></d2l-insights-disc-activity-thumbnail>
						<div class="d2l-card-selection-text">
							<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
								${this.localize('components.insights-discussion-activity-card.cardTitle')}
							</h3>
							<d2l-offscreen>${this.localize('components.insights-discussion-activity-card.cardTitle')}</d2l-offscreen>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.discActivityDesc')}</p>
						</div>
					</div>
				</d2l-list-item>
			</d2l-list>
		`;
	}

	_renderSystemAccessListContents() {
		const summaryCardMessage = this.localize(
			'components.insights-engagement-dashboard.lastSystemAccessMessage',
			{ thresholdDays: this.lastAccessThresholdDays }
		);

		// hack to get 2 parts of a localized version of a string
		const editTextParts = this.localize('components.insights-engagement-settings.systemAccessEdit', { num: '{num}' }).split('{num}');

		return html`
			<d2l-labs-summary-card
				class="d2l-demo-card"
				card-title="${this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading')}"
				card-value="10"
				card-message="${summaryCardMessage}"
			 	aria-hidden="true">
			</d2l-labs-summary-card>
			<div class="d2l-card-selection-text">
				<h3 class="d2l-heading-3 d2l-card-selection-title" aria-hidden="true">
					${this.localize('components.insights-engagement-dashboard.lastSystemAccessHeading')}
				</h3>
				<d2l-offscreen>${this.localize('components.insights-engagement-settings.systemAccessDesc')}</d2l-offscreen>
				<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.systemAccessDesc')}</p>

				<div>
					<span class="d2l-body-small">${editTextParts[0]}</span>
					<d2l-input-number
						id="last-access-threshold-edit"
						class="d2l-system-access-edit-input"
						value="${this.lastAccessThresholdDays}"
						min="${lastSysAccessThresholdMinDays}"
						max="${lastSysAccessThresholdMaxDays}"
						label="${this.localize('components.insights-engagement-settings.systemAccessEditLabel')}"
						label-hidden
						@change="${this._handleThresholdFieldChange}">
					</d2l-input-number>
					<span class="d2l-body-small">${editTextParts[1]}</span>
				</div>
			</div>
		`;
	}

	_handleCardSelectionListChange(event) {
		this[event.detail.key] = event.detail.selected;
	}

	_handleThresholdFieldChange(event) {
		const newValue = Number(event.target.value);
		if (isNaN(newValue) || newValue < lastSysAccessThresholdMinDays || newValue > lastSysAccessThresholdMaxDays) {
			return;
		}

		this.lastAccessThresholdDays = Math.floor(newValue);
	}

	get settings() {
		return {
			showResultsCard: this.showResultsCard,
			showOverdueCard: this.showOverdueCard,
			showDiscussionsCard: this.showDiscussionsCard,
			showSystemAccessCard: this.showSystemAccessCard,
			showGradesCard: this.showGradesCard,
			showTicGradesCard: this.showTicGradesCard,
			showCourseAccessCard: this.showCourseAccessCard,
			lastAccessThresholdDays: this.lastAccessThresholdDays
		};
	}
}
customElements.define('d2l-insights-engagement-card-selection-list', CardSelectionList);
