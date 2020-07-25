class Roles {
    async fetchRolesFromLms() {
        // TODO: error handling
        const response = await fetch('/d2l/api/lp/1.23/roles/');

        /**
         * Expected data format from Roles API
         * @type {{Identifier: string, DisplayName: string, Code: string|null}[]}
         */
        const data = await response.json();

        this.roles = data.map(obj => {
            return {...obj, selected: false};
        });

        this.roles.sort((role1, role2) => {
            // NB: it seems that localeCompare is pretty slow, but that's ok in this case, since there
            // shouldn't usually be many roles, and loading/sorting roles is only expected to happen infrequently.
            return role1.DisplayName.localeCompare(role2.DisplayName)
                || role1.Identifier.localeCompare(role2.Identifier);
        });
    }

    /**
     * @returns {{displayName: (string), id: (string)}[]}
     */
    getRoleDataForFilter() {
        return this.roles.map(obj => {
            return {id: obj.Identifier, displayName: obj.DisplayName};
        });
    }

    getSelectedRoleIds() {
        return this.roles.filter(role => role.selected).map(role => role.Identifier);
    }

    setSelectedState(roleId, selected) {
        this.roles.find(role => role.Identifier === roleId).selected = selected;
    }
}

export default Roles;
