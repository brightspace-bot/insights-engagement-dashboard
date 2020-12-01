import '@brightspace-ui/core/components/list/list';
import '@brightspace-ui/core/components/list/list-item';
import { bodySmallStyles, bodyStandardStyles, heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { css, html, LitElement } from 'lit-element/lit-element';
import { formatNumber, formatPercent } from '@brightspace-ui/intl';
import { formatDateTime } from '@brightspace-ui/intl/lib/dateTime.js';
import { Localizer } from '../locales/localizer';
import { numberFormatOptions } from './users-table';
import { RtlMixin } from '@brightspace-ui/core/mixins/rtl-mixin';

function thirtyHoursAgo() {
	return new Date(Date.now() - 30 * 60 * 60 * 1000);
}

class ColumnConfiguration extends RtlMixin(Localizer(LitElement)) {
	static get properties() {
		return {
			showCoursesCol: { type: Boolean, attribute: 'courses-col', reflect: true },
			showDiscussionsCol: { type: Boolean, attribute: 'discussions-col', reflect: true },
			showGradeCol: { type: Boolean, attribute: 'grade-col', reflect: true },
			showLastAccessCol: { type: Boolean, attribute: 'last-access-col', reflect: true },
			showTicCol: { type: Boolean, attribute: 'tic-col', reflect: true }
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
			.d2l-insights-config-list-item {
				display: flex;
				flex-direction: row;
			}

			@media screen and (max-width: 767px) {
				.d2l-insights-config-list-item {
					display: flex;
					flex-direction: column;
				}
			}
			.d2l-column-example {
				margin: 10px 30px;
				min-width: 300px;
			}
			.d2l-column-selection-text {
				margin: 10px 30px;
			}
			h3.d2l-heading-3 {
				margin-top: 0;
			}

			table {
				width: min-content;
			}
			td.discussion-info {
				vertical-align: top;
			}
		`];
	}

	constructor() {
		super();

		this.showCoursesCol = false;
		this.showDiscussionsCol = false;
		this.showGradeCol = false;
		this.showLastAccessCol = false;
		this.showTicCol = false;
	}

	render() {
		// NB: list-item keys MUST have the same name as its corresponding component property
		// e.g. the key for this.showCoursesCol must be "showCoursesCol" (see _handleSelectionChange)

		return html`
			<d2l-list id="card-selection-list" @d2l-list-selection-change="${this._handleSelectionChange}">
				<d2l-list-item key="showGradeCol" selectable ?selected="${this.showGradeCol}">
					<div class="d2l-insights-config-list-item">
						<div class="d2l-column-example">${formatPercent(0.8705, numberFormatOptions)}</div>
						<div class="d2l-column-selection-text">
							<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-settings.avgGrade')}</h3>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.avgGrade-description')}</p>
						</div>
					</div>
				</d2l-list-item>
				<d2l-list-item key="showTicCol" selectable ?selected="${this.showTicCol}">
					<div class="d2l-insights-config-list-item">
						<div class="d2l-column-example" slot="illustration">${formatNumber(92, numberFormatOptions)}</div>
						<div class="d2l-column-selection-text">
							<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-settings.avgTimeInContent')}</h3>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.avgTimeInContent-description')}</p>
						</div>
					</div>
				</d2l-list-item>
				<d2l-list-item key="showDiscussionsCol" selectable ?selected="${this.showDiscussionsCol}">
					<div class="d2l-insights-config-list-item">
						<div class="d2l-column-example" slot="illustration">${this._discussionsExample}</div>
						<div class="d2l-column-selection-text">
							<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-settings.avgDiscussionActivity')}</h3>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.avgDiscussionActivity-description')}</p>
						</div>
					</div>
				</d2l-list-item>
				<d2l-list-item key="showLastAccessCol" selectable ?selected="${this.showLastAccessCol}">
					<div class="d2l-insights-config-list-item">
						<div class="d2l-column-example" slot="illustration">${formatDateTime(thirtyHoursAgo(), { format: 'medium' })}</div>
						<div class="d2l-column-selection-text">
							<h3 class="d2l-heading-3">${this.localize('components.insights-engagement-settings.lastAccessedSystem')}</h3>
							<p class="d2l-body-standard">${this.localize('components.insights-engagement-settings.lastAccessedSystem-description')}</p>
						</div>
					</div>
				</d2l-list-item>
			</d2l-list>
		`;
	}

	get _discussionsExample() {
		return html`<table>
			<tr>
				<td class="discussion-info">
					<div class="d2l-body-standard" style="text-align:center;">1</div>
					<div class="d2l-body-standard" style="text-align:center;">${this.localize('components.insights-discussion-activity-card.threads')}</div>
				</td>
				<td>
					<d2l-icon icon="tier2:divider"></d2l-icon>
				</td>
				<td class="discussion-info">
					<div class="d2l-body-standard" style="text-align:center;">1</div>
					<div class="d2l-body-standard" style="text-align:center;">${this.localize('components.insights-discussion-activity-card.reads')}</div>
				</td>
				<td>
					<d2l-icon icon="tier2:divider"></d2l-icon>
				</td>
				<td class="discussion-info">
					<div class="d2l-body-standard" style="text-align:center;">0</div>
					<div class="d2l-body-standard" style="text-align:center;">${this.localize('components.insights-discussion-activity-card.replies')}</div>
				</td>
			</tr>
		</table>`;
	}

	_handleSelectionChange(event) {
		this[event.detail.key] = event.detail.selected;
	}
}
customElements.define('d2l-insights-engagement-column-configuration', ColumnConfiguration);
