import { html, LitElement } from 'lit-element/lit-element';
import { Localizer } from '../../locales/localizer';

class CurrentGradeThumbnailSvg extends Localizer(LitElement) {
	render() {
		return html`
			<svg xmlns="http://www.w3.org/2000/svg" width="293" height="150" viewBox="0 0 291 150">
				<g id="Current_Grade" data-name="Current Grade">
					<g id="Rectangle_494" data-name="Rectangle 494" fill="#fff" stroke="#e3e9f1" stroke-width="1">
						<rect width="291" height="144" rx="15" stroke="none"/>
						<rect x="0.5" y="0.5" width="291" height="143" rx="14.5" fill="none"/>
					</g>
					<g id="Current_Grade-2" data-name="Current Grade" transform="translate(10 25)">
						<text id="Current_Final_Grade" data-name="Current Final Grade" transform="translate(6.173 -17)"
							  fill="#494c4e" font-size="14" font-family="Lato-Bold, Lato" font-weight="700"
							  letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-current-final-grade-card.currentGrade')}</tspan>
						</text>
						<g id="Chart" transform="translate(17.605 20.263)">
							<path id="Line_4" data-name="Line 4" d="M.479.5H241.973" transform="translate(-0.479 -0.5)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_4-2" data-name="Line 4" d="M.479.5H241.973" transform="translate(-0.479 27.496)"
								  fill="none" stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_4-3" data-name="Line 4" d="M.479.5H241.973" transform="translate(-0.479 55.098)"
								  fill="none" stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_4-4" data-name="Line 4" d="M.479.5H241.973" transform="translate(-0.479 83.094)"
								  fill="none" stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
						</g>
						<g id="Group_822" data-name="Group 822" transform="translate(34.126 11.118)">
							<rect id="Rectangle_Copy_6" data-name="Rectangle Copy 6" width="18" height="35"
								  transform="translate(183 57.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_7" data-name="Rectangle Copy 7" width="18" height="49"
								  transform="translate(160 43.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_8" data-name="Rectangle Copy 8" width="18" height="28"
								  transform="translate(206 64.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_9" data-name="Rectangle Copy 9" width="18" height="93"
								  transform="translate(137 -0.118)" fill="#6038ff"/>
							<rect id="Rectangle_Copy" data-name="Rectangle Copy" width="18" height="25"
								  transform="translate(69 67.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_2" data-name="Rectangle Copy 2" width="18" height="1"
								  transform="translate(0 91.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_3" data-name="Rectangle Copy 3" width="18" height="8"
								  transform="translate(23 84.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_3-2" data-name="Rectangle Copy 3" width="18" height="8"
								  transform="translate(46 84.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_4" data-name="Rectangle Copy 4" width="18" height="35"
								  transform="translate(92 57.882)" fill="#6038ff"/>
							<rect id="Rectangle_Copy_10" data-name="Rectangle Copy 10" width="18" height="49"
								  transform="translate(115 43.882)" fill="#6038ff"/>
						</g>
					</g>
				</g>
			</svg>
		`;
	}
}
customElements.define('d2l-insights-current-grade-thumbnail', CurrentGradeThumbnailSvg);
