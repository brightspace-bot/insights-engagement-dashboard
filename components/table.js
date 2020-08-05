import {html, LitElement} from 'lit-element';
import {Localizer} from '../locales/localizer';
import {RtlMixin} from '@brightspace-ui/core/mixins/rtl-mixin';
import {tableStyle} from '../styles/table.style.js';

/**
 * @property {Array} columns - list of column header text
 * @property {Array} data - a row-indexed 2D array of rows and columns.
 * E.g. data[0] gets the entire first row; data[0][0] gets the first row / first column
 */
class Table extends Localizer(RtlMixin(LitElement)) {

	static get properties() {
		return {
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
	}

	render() {
		return html`
			<table class="d2l-table">
				${this._renderThead()}
				${this._renderTbody()}
			</table>
		`;
	}

	_renderThead() {
		return html`
			<thead class="d2l-table-header">
				<tr>
					${this.columns.map(name => html`
						<th class="d2l-table-cell">${name}</th>
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
						${row.map(col => html`
							<td class="d2l-table-cell">${col}</td>
						`)}
					</tr>
				`)}
			</tbody>
		`;
	}
}
customElements.define('d2l-insights-table', Table);
