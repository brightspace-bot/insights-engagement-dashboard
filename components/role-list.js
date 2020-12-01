import './dropdown-filter';
import '@brightspace-ui/core/components/inputs/input-checkbox';

import { css, html, LitElement } from 'lit-element';
import { fetchRoles as fetchDemoRoles } from '../model/fake-lms';
import { fetchRoles } from '../model/lms';
import { heading3Styles } from '@brightspace-ui/core/components/typography/styles.js';
import { Localizer } from '../locales/localizer';

/**
 * @property {Number[]} selected - component managed user selected roles
 * @property {Number[]} includeRoles - user selected roles from preferences
 * @fires d2l-insights-role-list-change
 */
class RoleList extends Localizer(LitElement) {
	static get styles() {
		return [heading3Styles, css`
			:host {
				display: flex;
				flex-direction: column;
			}

			:host([hidden]) {
				display: none;
			}

			h3.d2l-heading-3 {
				margin: 0;
			}

			span {
				margin-bottom: 24px;
				margin-top: 6px;
			}

			d2l-input-checkbox {
				flex: 1 1 40%;
				margin-left: 24px;
				min-width: 260px;
			}

			.d2l-insights-role-list-list {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				max-height: 536px;
				max-width: 100vw;
				min-height: 200px;
				overflow-y: auto;
			}

		`];
	}

	static get properties() {
		return {
			isDemo: { type: Boolean, attribute: 'demo' },
			selected: { type: Array, attribute: true },
			includeRoles: { type: Array, attribute: false },
			_filterData: { type: Array, attribute: false }
		};
	}

	constructor() {
		super();

		this.isDemo = false;
		this.selected = [];
		this.includeRoles = [];
		/** @type {{id: string, displayName: string}[]} */
		this._filterData = [];
	}

	async firstUpdated() {
		const dataProvider = this.isDemo ? fetchDemoRoles : fetchRoles;
		const data = await dataProvider();
		this.selected = this.includeRoles || [];
		this._setRoleData(data);
	}

	get _selected() {
		return Array.from(this.shadowRoot.querySelectorAll('d2l-input-checkbox'))
			.filter(checkbox => checkbox.checked)
			.map(checkbox => checkbox.value)
			.map(roleId => Number(roleId));
	}

	_setRoleData(roleData) {
		roleData.sort((role1, role2) => {
			// NB: it seems that localeCompare is pretty slow, but that's ok in this case, since there
			// shouldn't usually be many roles, and loading/sorting roles is only expected to happen infrequently.
			return role1.DisplayName.localeCompare(role2.DisplayName)
				|| role1.Identifier.localeCompare(role2.Identifier);
		});

		this._setFilterData(roleData);
	}

	_setFilterData(roleData) {
		const selected = new Set(this.selected.map(String));
		this._filterData = roleData.map(obj => {
			return { id: obj.Identifier, displayName: obj.DisplayName, selected: selected.has(obj.Identifier) };
		});
	}

	render() {
		return html`
			<h3 class="d2l-heading-3">${this.localize('components.insights-settings-view-role-list.title')}</h3>
			<span>${this.localize('components.insights-settings-view-role-list.description')}</span>

			<div class="d2l-insights-role-list-list">
				${this._filterData.map(item => html`<d2l-input-checkbox value="${item.id}" @change="${this._handleSelectionChange}" ?checked="${item.selected}" >${item.displayName}</d2l-input-checkbox>`)}
			</div>
		`;
	}

	_handleSelectionChange() {
		this.selected = this._selected;
		this.dispatchEvent(new Event('d2l-insights-role-list-change'));
	}
}
customElements.define('d2l-insights-role-list', RoleList);
