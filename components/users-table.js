import './table.js';

import { css, html } from 'lit-element';
import { Localizer } from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

/**
 * At the moment the mobx data object is doing all the display logic,
 * including sorting / filtering (and eventually paging, probably)
 *
 * @property {Object} data - an instance of Data from model/data.js
 */
class UsersTable extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: { type: Object, attribute: false }
		};
	}

	static get styles() {
		return [
			css`
				.table-controls {
					margin: 30px 0;
					display: flex;
					width: 100%;
				}

				.table-controls-item {
					flex: 1 1 33%;
				}
			`
		];
	}

	constructor() {
		super();
		this.data = {};
	}

	get columns() {
		return [
			this.localize('components.insights-users-table.lastFirstName')
		];
	}

	render() {
		const _displayData = this.data.userDataForDisplay;
		// not sure how _itemsCount has the correct initial value of 0, since _displayData should initially be undefined
		// behind-the-scenes mobx magic, I guess
		const _itemsCount = _displayData.length;

		return html`
			<d2l-insights-table
				title="${this.localize('components.insights-users-table.title')}"
				.columns=${this.columns}
				.data="${_displayData}"></d2l-insights-table>

			<div class="table-controls">
				<div class="table-controls-item">
					${this.localize('components.insights-users-table.totalUsers', { num: _itemsCount })}
				</div>
				<!-- other columns in the flex box are for paging controls -->
			</div>
		`;
	}
}
customElements.define('d2l-insights-users-table', UsersTable);
