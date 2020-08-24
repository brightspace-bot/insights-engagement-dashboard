const ORG_UNIT = {
	ID: 0,
	NAME: 1,
	TYPE: 2,
	ANCESTORS: 3
};

class OrgUnitAncestors {
	/**
	 * @param orgUnitData - the same orgUnit format that we get from the server
	 */
	constructor(orgUnitData) {

		const parentsMap = new Map();
		orgUnitData.forEach(orgUnit => {
			parentsMap.set(orgUnit[ORG_UNIT.ID], orgUnit[ORG_UNIT.ANCESTORS]);
		});

		/**
		 * @type {Map<Number, Set>} - map from orgUnitIds to set of all ancestors
		 * NOTE: each set includes the element itself as well
		 */
		this.ancestorsMap = new Map();
		orgUnitData.forEach(orgUnit => {
			this._addOrgUnitToAncestorsMap(orgUnit[ORG_UNIT.ID], parentsMap);
		});
	}

	_addOrgUnitToAncestorsMap(orgUnitId, parentsMap) {
		if (this.ancestorsMap.has(orgUnitId)) {
			return this.ancestorsMap.get(orgUnitId);
		}

		const parents = parentsMap.get(orgUnitId);
		const ancestorsSet = new Set([orgUnitId]);

		if (parents.length && parents[0] !== 0) {
			// this isn't the top level - recursively add ancestors
			parents.forEach(parent => {
				ancestorsSet.add(parent);
				const ancestorsOfParent = this._addOrgUnitToAncestorsMap(parent, parentsMap);
				ancestorsOfParent.forEach(ancestor => ancestorsSet.add(ancestor));
			});
		}
		// else, this is the top level, so we don't need to add any ancestors to the set

		this.ancestorsMap.set(orgUnitId, ancestorsSet);
		return ancestorsSet;
	}

	/**
	 * @param {Number} orgUnitId
	 * @returns {Set | undefined} - undefined if the key can't be found in the map
	 */
	getAncestorsFor(orgUnitId) {
		return this.ancestorsMap.get(orgUnitId);
	}
}
export default OrgUnitAncestors;
