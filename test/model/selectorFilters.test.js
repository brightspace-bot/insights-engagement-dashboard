import { OrgUnitSelectorFilter, RoleSelectorFilter, SemesterSelectorFilter } from '../../model/selectorFilters';
import { expect } from '@open-wc/testing';

describe('selectorFilters', () => {
	describe('RoleSelectorFilter', () => {
		describe('shouldInclude', () => {
			it('should return true if the filter has no selected ids', () => {
				const record = [1, 1, 1]; // doesn't matter what the ids are here
				const sut = new RoleSelectorFilter({ selectedRolesIds: [], isRecordsTruncated: false });
				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return true if the record role id is in the selected ids', () => {
				const record = [1, 1, 1];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return false if the record role id is not in the selected ids', () => {
				const record = [1, 1, 2];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldInclude(record)).to.be.false;
			});
		});

		describe('shouldReloadFromServer', () => {
			it('should return true if records are truncated', () => {
				const newRoleIds = [1, 3]; // a list that otherwise wouldn't trigger a server reload
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: true });
				expect(sut.shouldReloadFromServer(newRoleIds)).to.be.true;
			});

			it('should return true if the existing selected list has items and the new list has no items', () => {
				// i.e. the filter was cleared
				const newRoleIds = [ /* empty */ ];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldReloadFromServer(newRoleIds)).to.be.true;
			});

			it('should return true if the new role ids list has an id that is not in the existing list', () => {
				const newRoleIds = [1, 2, 5];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldReloadFromServer(newRoleIds)).to.be.true;
			});

			it('should return false if the new list is the same as the old list', () => {
				// added an explicit test for this because it could potentially happen often
				const newRoleIds = [1, 3, 5];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldReloadFromServer(newRoleIds)).to.be.false;
			});

			it('should return false if the new list is a subset of the old list', () => {
				const newRoleIds = [1, 3];
				const sut = new RoleSelectorFilter({ selectedRolesIds: [1, 3, 5], isRecordsTruncated: false });
				expect(sut.shouldReloadFromServer(newRoleIds)).to.be.false;
			});
		});
	});

	describe('SemesterSelectorFilter', () => {
		describe('shouldInclude', () => {
			it('should return true if the filter has no selected ids', () => {
				const record = [1, 1, 1]; // doesn't matter what the ids are here
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return true if the record orgUnit id has a selected semester id as one of its ancestors', () => {
				const mockOrgUnitAncestors = {
					hasAncestorsInList: (/* any */) => true
				};
				const record = [1, 1, 1]; // doesn't matter what the ids are here
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [11, 12],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, mockOrgUnitAncestors);

				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return false if the record orgUnitId has no ancestors in the selected ids', () => {
				const mockOrgUnitAncestors = {
					hasAncestorsInList: (/* any */) => false
				};
				const record = [1, 1, 1]; // doesn't matter what the ids are here
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [12, 13],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, mockOrgUnitAncestors);

				expect(sut.shouldInclude(record)).to.be.false;
			});
		});

		describe('shouldReloadFromServer', () => {
			it('should return true if records are truncated', () => {
				const newSemesterIds = [1, 3]; // a list that otherwise wouldn't trigger a server reload
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [1, 3, 5],
					isRecordsTruncated: true,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.true;
			});

			it('should return true if orgUnits are truncated', () => {
				const newSemesterIds = [1, 3]; // a list that otherwise wouldn't trigger a server reload
				const sut = new SemesterSelectorFilter({
					selectedOrgUnitIds: [1, 3, 5],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: true
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.true;
			});

			it('should return true if the existing selected list has items and the new list has no items', () => {
				// i.e. the filter was cleared
				const newSemesterIds = [ /* empty */ ];
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [1, 3, 5],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.true;
			});

			it('should return true if the new semester ids list has an id that is not in the existing list', () => {
				const newSemesterIds = [1, 2, 5];
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [1, 3, 5],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.true;
			});

			it('should return false if the new list is the same as the old list', () => {
				// added an explicit test for this because it could potentially happen often
				const newSemesterIds = [1, 3, 5];
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [1, 3, 5],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.false;
			});

			it('should return false if the new list is a subset of the old list', () => {
				const newSemesterIds = [1, 3];
				const sut = new SemesterSelectorFilter({
					selectedSemestersIds: [1, 3, 5],
					isRecordsTruncated: false,
					isOrgUnitsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newSemesterIds)).to.be.false;
			});
		});
	});

	describe('OrgUnitSelectorFilter', () => {
		describe('shouldInclude', () => {
			it('should return true if the filter has no selected ids', () => {
				const record = [1, 1, 1]; // doesn't matter what the ids are here
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [],
					isRecordsTruncated: false
				}, null);
				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return true if the record orgUnit id has an ancestor in the selected orgUnit list', () => {
				const mockOrgUnitAncestors = {
					hasAncestorsInList: (/* any */) => true
				};
				const record = [1, 5, 5];
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [1, 2, 3],
					isRecordsTruncated: false
				}, mockOrgUnitAncestors);

				expect(sut.shouldInclude(record)).to.be.true;
			});

			it('should return false if the record orgUnitId has no ancestors in the selected ids', () => {
				const mockOrgUnitAncestors = {
					hasAncestorsInList: (/* any */) => false
				};
				const record = [10, 5, 5]; // doesn't matter what the ids are here
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [2, 3, 4],
					isRecordsTruncated: false
				}, mockOrgUnitAncestors);

				expect(sut.shouldInclude(record)).to.be.false;
			});
		});

		describe('shouldReloadFromServer', () => {
			it('should return true if records are truncated', () => {
				const newOrgUnitIds = [1, 3]; // a list that otherwise wouldn't trigger a server reload
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [1, 3, 5],
					isRecordsTruncated: true
				}, null);
				expect(sut.shouldReloadFromServer(newOrgUnitIds)).to.be.true;
			});

			it('should return true if the existing selected list has items and the new list has no items', () => {
				// i.e. the filter was cleared
				const newOrgUnitIds = [/* empty */];
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [1, 3, 5],
					isRecordsTruncated: false
				}, null);
				expect(sut.shouldReloadFromServer(newOrgUnitIds)).to.be.true;
			});

			it('should return true if the new orgUnitIds list has any id that has no ancestors in the existing list', () => {
				const mockOrgUnitAncestors = {
					// pretend 3 has no ancestors in the list
					hasAncestorsInList: (orgUnitId) => orgUnitId !== 3
				};

				const newOrgUnitIds = [1, 2, 3];
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [1, 2],
					isRecordsTruncated: false
				}, mockOrgUnitAncestors);
				expect(sut.shouldReloadFromServer(newOrgUnitIds)).to.be.true;
			});

			it('should return false if the new list has only ids that had ancestors in the old list', () => {
				const mockOrgUnitAncestors = {
					hasAncestorsInList: (/* any */) => true
				};

				const newOrgUnitIds = [1, 2, 3];
				const sut = new OrgUnitSelectorFilter({
					selectedOrgUnitIds: [1, 2],
					isRecordsTruncated: false
				}, mockOrgUnitAncestors);
				expect(sut.shouldReloadFromServer(newOrgUnitIds)).to.be.false;
			});
		});
	});
});
