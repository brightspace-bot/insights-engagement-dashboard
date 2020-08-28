import { decorate, observable } from 'mobx';
import { RECORD } from './data';

function isFilterApplied(selectedIds) {
	return selectedIds.length > 0;
}

function isFilterCleared(oldSelectedIds, newSelectedIds) {
	return isFilterApplied(oldSelectedIds) && !isFilterApplied(newSelectedIds);
}

export class RoleSelectorFilter {
	constructor({ selectedRolesIds, isRecordsTruncated }) {
		this.roleIds = selectedRolesIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
	}

	shouldInclude(record) {
		return !isFilterApplied(this.roleIds) || this.roleIds.includes(record[RECORD.ROLE_ID]);
	}

	shouldReloadFromServer(newRoleIds) {
		return this._isRecordsTruncated
			|| isFilterCleared(this.roleIds, newRoleIds) // filter was cleared
			|| newRoleIds.some(newRoleId => !this.roleIds.includes(newRoleId));
	}
}

export class SemesterSelectorFilter {
	constructor({ selectedSemestersIds, isRecordsTruncated, isOrgUnitsTruncated }, orgUnitAncestors) {
		this.semesterIds = selectedSemestersIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
		this._isOrgUnitsTruncated = isOrgUnitsTruncated;
		this._orgUnitAncestors = orgUnitAncestors;
	}

	shouldInclude(record) {
		if (!isFilterApplied(this.semesterIds) || !this._orgUnitAncestors) {
			return true;
		}

		return this._orgUnitAncestors.hasAncestorsInList(record[RECORD.ORG_UNIT_ID], this.semesterIds);
	}

	shouldReloadFromServer(newSemesterIds) {
		return this._isRecordsTruncated
			|| this._isOrgUnitsTruncated
			|| isFilterCleared(this.semesterIds, newSemesterIds)
			|| newSemesterIds.some(newSemesterId => !this.semesterIds.includes(newSemesterId));
	}
}

export class OrgUnitSelectorFilter {
	constructor({ selectedOrgUnitIds, isRecordsTruncated }, orgUnitAncestors) {
		this.orgUnitIds = selectedOrgUnitIds || [];
		this._isRecordsTruncated = isRecordsTruncated;
		this._orgUnitAncestors = orgUnitAncestors;
	}

	shouldInclude(record) {
		if (!isFilterApplied(this.orgUnitIds) || !this._orgUnitAncestors) {
			return true;
		}

		return this._orgUnitAncestors.hasAncestorsInList(record[RECORD.ORG_UNIT_ID], this.orgUnitIds);
	}

	shouldReloadFromServer(newOrgUnitIds) {
		return this._isRecordsTruncated
			|| isFilterCleared(this.orgUnitIds, newOrgUnitIds)
			|| newOrgUnitIds.some(newOrgUnitId =>
				!this._orgUnitAncestors.hasAncestorsInList(newOrgUnitId, this.orgUnitIds)
			);
	}
}

decorate(RoleSelectorFilter, {
	roleIds: observable
});

decorate(SemesterSelectorFilter, {
	semesterIds: observable
});

decorate(OrgUnitSelectorFilter, {
	orgUnitIds: observable
});
