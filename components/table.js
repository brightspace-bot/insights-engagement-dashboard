import {html, LitElement} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {RtlMixin} from '@brightspace-ui/core/mixins/rtl-mixin';
import {tableStyle} from '../styles/table.style.js';

/**
 * @property {String} title - for use by screen reader users
 * @property {Array} columns - list of column header text
 * @property {Array} data - a row-indexed 2D array of rows and columns.
 * E.g. data[0] gets the entire first row; data[0][0] gets the first row / first column
 */
class Table extends Localizer(RtlMixin(LitElement)) {

	static get properties() {
		return {
			title: {type: String, attribute: true},
			columns: {type: Array, attribute: false},
			data: {type: Array, attribute: false}
		};
	}

	static get styles() {
		return tableStyle;
	}

	constructor() {
		super();
		this.columns = [];
		this.data = [];
		this.title = '';
	}

	render() {
		return html`
			<table class="d2l-table" aria-label="${this.title}">
				${this._renderThead()}
				${this._renderTbody()}
			</table>
		`;
	}

	_renderThead() {
		return html`
			<thead class="d2l-table-header">
				<tr>
					${this.columns.map(colName => html`
						<th class="d2l-table-cell" scope="col">${colName}</th>
					`)}
				</tr>
			</thead>
		`;
	}

	_renderTbody() {
		return html`
			<tbody>
				${this.data.map(row => html`
					<tr>
						${row.map(colValue => html`
							<td class="d2l-table-cell">${colValue}</td>
						`)}
					</tr>
				`)}
			</tbody>
		`;
	}
}
customElements.define('d2l-insights-table', Table);
