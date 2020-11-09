import { computed, decorate, observable } from 'mobx';
import { RECORD } from '../consts';
import { UrlState } from './urlState';

function hasSelections(selectedIds) {
	if (!selectedIds) return false;
	return selectedIds.length > 0;
}

function isFilterCleared(oldSelectedIds, newSelectedIds) {
	return hasSelections(oldSelectedIds) && !hasSelections(newSelectedIds);
}

export class RoleSelectorFilter {
	constructor(data) {
		this._data = data;
		this.selected = data.serverData.selectedRolesIds || [];
		// noinspection JSUnusedGlobalSymbols
		this._urlState = new UrlState(this);
	}

	// persistence key and value for UrlState
	get persistenceKey() { return 'rf'; }

	get persistenceValue() {
		return this.selected.join(',');
	}

	set persistenceValue(value) {
		this.selected = value.split(',').filter(x => x).map(Number);
	}

	shouldInclude(record) {
		return !hasSelections(this.selected) || this.selected.includes(record[RECORD.ROLE_ID]);
	}

	shouldReloadFromServer(newRoleIds) {
		if (this._data.serverData.isRecordsTruncated || isFilterCleared(this._data.serverData.selectedRolesIds, newRoleIds)) {
			return true;
		}

		return hasSelections(this._data.serverData.selectedRolesIds)
			&& newRoleIds.some(newRoleId => !this._data.serverData.selectedRolesIds.includes(newRoleId));
	}
}

export class SemesterSelectorFilter {
	constructor(data) {
		this._data = data;
		this.selected = data.serverData.selectedSemestersIds || [];
		// noinspection JSUnusedGlobalSymbols
		this._urlState = new UrlState(this);
	}

	// persistence key and value for UrlState
	get persistenceKey() { return 'sf'; }

	get persistenceValue() {
		return this.selected.join(',');
	}

	set persistenceValue(value) {
		this.selected = value.split(',').filter(x => x).map(Number);
	}

	shouldInclude(record) {
		return this.shouldIncludeOrgUnitId(record[RECORD.ORG_UNIT_ID]);
	}

	shouldIncludeOrgUnitId(orgUnitId) {
		if (!hasSelections(this.selected) || !this._data.orgUnitTree) {
			return true;
		}

		return this._data.orgUnitTree.hasAncestorsInList(orgUnitId, this.selected);
	}

	shouldReloadFromServer(newSemesterIds) {
		if (this._data.serverData.isRecordsTruncated
			|| this._data.serverData.isOrgUnitsTruncated
			|| isFilterCleared(this._latestServerQuery, newSemesterIds)
		) {
			return true;
		}

		return hasSelections(this._latestServerQuery)
			&& newSemesterIds.some(newSemesterId => !this._latestServerQuery.includes(newSemesterId));
	}

	_latestServerQuery() {
		return this._data.serverData.selectedSemestersIds;
	}
}

export class OrgUnitSelectorFilter {
	constructor(data) {
		this._data = data;
		// noinspection JSUnusedGlobalSymbols
		this._urlState = new UrlState(this);
	}

	get selected() {
		return (this._data.orgUnitTree && this._data.orgUnitTree.selected) || [];
	}

	// persistence key and value for UrlState
	get persistenceKey() { return 'ouf'; }

	get persistenceValue() {
		return this.selected.join(',');
	}

	set persistenceValue(value) {
		this._data.orgUnitTree.selected = value.split(',').filter(x => x).map(Number);
	}

	shouldInclude(record) {
		const selected = this.selected;
		if (!hasSelections(selected)) {
			return true;
		}

		return this._data.orgUnitTree.hasAncestorsInList(record[RECORD.ORG_UNIT_ID], selected);
	}

	shouldReloadFromServer(newOrgUnitIds) {
		if (this._data.serverData.isRecordsTruncated
			// ou selection affects the *order* of org units, so if the ou tree is
			// truncated, selection can affect which ones are in view
			|| this._data.serverData.isOrgUnitsTruncated
			|| isFilterCleared(this._data.serverData.selectedOrgUnitIds, newOrgUnitIds)) {
			return true;
		}

		return hasSelections(this._data.serverData.selectedOrgUnitIds) && newOrgUnitIds.some(newOrgUnitId =>
			!this._data.orgUnitTree.hasAncestorsInList(newOrgUnitId, this._data.serverData.selectedOrgUnitIds)
		);
	}
}

decorate(RoleSelectorFilter, {
	selected: observable
});

decorate(SemesterSelectorFilter, {
	selected: observable
});

decorate(OrgUnitSelectorFilter, {
	selected: computed
});
