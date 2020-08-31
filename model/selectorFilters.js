import { decorate, observable } from 'mobx';
import { RECORD } from './data';

function hasSelections(selectedIds) {
	return selectedIds.length > 0;
}

function isFilterCleared(oldSelectedIds, newSelectedIds) {
	return hasSelections(oldSelectedIds) && !hasSelections(newSelectedIds);
}

export class RoleSelectorFilter {
	constructor({ selectedRolesIds, isRecordsTruncated }) {
		this._latestServerQuery = selectedRolesIds || [];
		this.selected = selectedRolesIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
	}

	shouldInclude(record) {
		return !hasSelections(this.selected) || this.selected.includes(record[RECORD.ROLE_ID]);
	}

	shouldReloadFromServer(newRoleIds) {
		if (this._isRecordsTruncated || isFilterCleared(this._latestServerQuery, newRoleIds)) {
			return true;
		}

		return hasSelections(this._latestServerQuery)
			&& newRoleIds.some(newRoleId => !this._latestServerQuery.includes(newRoleId));
	}
}

export class SemesterSelectorFilter {
	constructor({ selectedSemestersIds, isRecordsTruncated, isOrgUnitsTruncated }, orgUnitAncestors) {
		this._latestServerQuery = selectedSemestersIds || [];
		this.selected = selectedSemestersIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
		this._isOrgUnitsTruncated = isOrgUnitsTruncated;
		this._orgUnitAncestors = orgUnitAncestors;
	}

	shouldInclude(record) {
		if (!hasSelections(this.selected) || !this._orgUnitAncestors) {
			return true;
		}

		return this._orgUnitAncestors.hasAncestorsInList(record[RECORD.ORG_UNIT_ID], this.selected);
	}

	shouldReloadFromServer(newSemesterIds) {
		if (this._isRecordsTruncated
			|| this._isOrgUnitsTruncated
			|| isFilterCleared(this._latestServerQuery, newSemesterIds)
		) {
			return true;
		}

		return hasSelections(this._latestServerQuery)
			&& newSemesterIds.some(newSemesterId => !this._latestServerQuery.includes(newSemesterId));
	}
}

export class OrgUnitSelectorFilter {
	constructor({ selectedOrgUnitIds, isRecordsTruncated }, orgUnitAncestors) {
		this._latestServerQuery = selectedOrgUnitIds || [];
		this.selected = selectedOrgUnitIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
		this._orgUnitAncestors = orgUnitAncestors;
	}

	shouldInclude(record) {
		if (!hasSelections(this.selected) || !this._orgUnitAncestors) {
			return true;
		}

		return this._orgUnitAncestors.hasAncestorsInList(record[RECORD.ORG_UNIT_ID], this.selected);
	}

	shouldReloadFromServer(newOrgUnitIds) {
		if (this._isRecordsTruncated || isFilterCleared(this._latestServerQuery, newOrgUnitIds)) {
			return true;
		}

		return hasSelections(this._latestServerQuery) && newOrgUnitIds.some(newOrgUnitId =>
			!this._orgUnitAncestors.hasAncestorsInList(newOrgUnitId, this._latestServerQuery)
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
	selected: observable
});
