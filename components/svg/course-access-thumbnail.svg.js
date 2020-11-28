import { html, LitElement } from 'lit-element/lit-element';
import { Localizer } from '../../locales/localizer';

class CourseAccessThumbnailSvg extends Localizer(LitElement) {
	render() {
		return html`
			<svg xmlns="http://www.w3.org/2000/svg" width="293" height="150" viewBox="0 0 291 150">
				<g id="Course_Access" data-name="Course Access">
					<g id="Rectangle_495" data-name="Rectangle 495" fill="#fff" stroke="#e3e9f1"
					   stroke-width="1">
						<rect width="291" height="144" rx="15" stroke="none"/>
						<rect x="0.5" y="0.5" width="291" height="143" rx="14.5" fill="none"/>
					</g>
					<g id="Course_Access-2" data-name="Course Access" transform="translate(10 5)">
						<text id="Time_in_Content_vs." data-name="Time in Content vs." transform="translate(9.047 5)" fill="#494c4e"
							  font-size="14" font-family="Lato-Bold, Lato" font-weight="700" letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-course-last-access-card.courseAccess')}</tspan>
						</text>
						<g id="Chart-2" data-name="Chart" transform="translate(75.558 31.449)">
							<path id="Line_3" data-name="Line 3" d="M.5.449V94" transform="translate(-0.5 -0.449)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_3-2" data-name="Line 3" d="M.5.449V94" transform="translate(44.811 -0.449)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_3-3" data-name="Line 3" d="M.5.449V94" transform="translate(91.468 -0.449)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_3-4" data-name="Line 3" d="M.5.449V94" transform="translate(136.779 -0.449)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
							<path id="Line_3-5" data-name="Line 3" d="M.5.449V94" transform="translate(181.989 -0.449)" fill="none"
								  stroke="#979797" stroke-linecap="square" stroke-miterlimit="10" stroke-width="1"/>
						</g>
						<g id="X_axis" data-name="X axis" transform="translate(6 32)">
							<text id="_100" data-name="100" transform="translate(0 2)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.never')}</tspan>
							</text>
							<text id="_80" data-name="80" transform="translate(0 17)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.moreThanFourteenDaysAgo')}</tspan>
							</text>
							<text id="_60" data-name="60" transform="translate(0 32)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0" xml:space="preserve">${this.localize('components.insights-course-last-access-card.sevenToFourteenDaysAgo')}</tspan>
							</text>
							<text id="_40" data-name="40" transform="translate(0 47)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.fiveToSevenDaysAgo')}</tspan>
							</text>
							<text id="_40-2" data-name="40" transform="translate(0 61)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.threeToFiveDaysAgo')}</tspan>
							</text>
							<text id="_20" data-name="20" transform="translate(0 77)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.oneToThreeDaysAgo')}</tspan>
							</text>
							<text id="_0" data-name="0" transform="translate(0 93)" fill="#72777a" font-size="9"
								  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
								<tspan x="0" y="0">${this.localize('components.insights-course-last-access-card.lessThanOneDayAgo')}</tspan>
							</text>
						</g>
						<rect id="Rectangle_376" data-name="Rectangle 376" width="186" height="9" transform="translate(75.047 26)"
							  fill="#0057a3"/>
						<rect id="Rectangle_375" data-name="Rectangle 375" width="140" height="9"
							  transform="translate(75.047 42.062)" fill="#0057a3"/>
						<rect id="Rectangle_373" data-name="Rectangle 373" width="183" height="9"
							  transform="translate(75.047 57.123)" fill="#0057a3"/>
						<rect id="Rectangle_372" data-name="Rectangle 372" width="83" height="9"
							  transform="translate(75.047 72.272)" fill="#0057a3"/>
						<rect id="Rectangle_371" data-name="Rectangle 371" width="91" height="9"
							  transform="translate(75.047 101.574)" fill="#0057a3"/>
						<rect id="Rectangle_377" data-name="Rectangle 377" width="111.84" height="9"
							  transform="translate(75.047 118)" fill="#0057a3"/>
						<rect id="Rectangle_372-2" data-name="Rectangle 372" width="83" height="9"
							  transform="translate(75.047 87.333)" fill="#0057a3"/>
					</g>
				</g>
			</svg>
		`;
	}
}
customElements.define('d2l-insights-course-access-thumbnail', CourseAccessThumbnailSvg);
