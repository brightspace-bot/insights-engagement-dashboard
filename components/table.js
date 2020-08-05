import {html} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {MobxLitElement} from '@adobe/lit-mobx';
import {RtlMixin} from '@brightspace-ui/core/mixins/rtl-mixin';
import {tableStyle} from '../styles/table.style.js';

/**
 * @prop {Object} data - an instance of Data from model/data.js
 */
class Table extends Localizer(RtlMixin(MobxLitElement)) {

	static get properties() {
		return {
			data: {type: Object, attribute: false}
		};
	}

	static get styles() {
		return tableStyle;
	}

	constructor() {
		super();
		this.data = {};
	}

	render() {
		return html`
			<table class="d2l-table">
				<thead class="d2l-table-header">
					<tr>
						<th class="d2l-table-cell">${this.localize('components.insights-users-table.lastFirstName')}</th>
					</tr>
				</thead>
				<tbody>
					${this._renderRows()}
				</tbody>
			</table>
		`;
	}

	_renderRows() {
		return this.data.serverData.users.map(user => html`
			<tr>
				<td class="d2l-table-cell">${`${user[2]}, ${user[1]}`}</td>
			</tr>
		`);
	}
}
customElements.define('d2l-insights-table', Table);
