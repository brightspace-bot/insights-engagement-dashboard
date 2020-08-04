import {css, html} from 'lit-element';
import {Localizer} from '../locales/localizer';
import { MobxLitElement } from '@adobe/lit-mobx';

/**
 * @property {Object} data - an instance of Data from model/data.js
 */
class UsersTable extends Localizer(MobxLitElement) {

	static get properties() {
		return {
			data: {type: Object, attribute: false}
		};
	}

	static get styles() {
		return css`
			tr {
				text-align: left; /* TODO: RTL support */
			}
		`;
	}

	constructor() {
		super();
		this.data = {};
	}

	render() {
		return html`
			<table ?loading="${this.data.isLoading}">
				<thead>
					<tr>
						<!-- TODO: figure out if localization will be an issue with name ordering here -->
						<th>${this.localize('components.insights-users-table.lastFirstName')}</th>
					</tr>
				</thead>
				<tbody>
					${this.data.serverData.users.map(user => {
						return html`
							<tr>
								<td>${`${user[2]}, ${user[1]}`}</td>
							</tr>
						`;
					})}
				</tbody>
			</table>
		`;
	}
}
customElements.define('d2l-insights-users-table', UsersTable);
