import { html, LitElement } from 'lit-element/lit-element';
import { Localizer } from '../../locales/localizer';

class DiscActivityThumbnailSvg extends Localizer(LitElement) {
	render() {
		return html`
			<svg xmlns="http://www.w3.org/2000/svg" width="293" height="150" viewBox="0 0 291 150">
				<g id="Discussion">
					<g id="Card_Container-4" data-name="Card Container">
						<g id="card_container-5" data-name="card container" fill="#fff" stroke="#e3e9f1" stroke-miterlimit="10"
						   stroke-width="1">
							<rect width="291" height="143" rx="15" stroke="none"/>
							<rect x="0.5" y="0.5" width="291" height="142" rx="14.5" fill="none"/>
						</g>
						<text id="Status_of_Assignment" data-name="Status of Assignment" transform="translate(21 12)" fill="#494c4e"
							  font-size="14" font-family="Lato-Bold, Lato" font-weight="700" letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-discussion-activity-card.cardTitle')}</tspan>
						</text>
						<text id="Overdue" transform="translate(179.557 42.837)" fill="#6e7376" font-size="14"
							  font-family="Lato-Regular, Lato" letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-discussion-activity-card.threads')}</tspan>
						</text>
						<text id="Submitted_late" data-name="Submitted late" transform="translate(180.299 78.418)" fill="#6e7376"
							  font-size="14" font-family="Lato-Regular, Lato" letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-discussion-activity-card.replies')}</tspan>
						</text>
						<text id="Submitted_on_time" data-name="Submitted on time" transform="translate(179.557 110)" fill="#6e7376"
							  font-size="14" font-family="Lato-Regular, Lato" letter-spacing="0.014em">
							<tspan x="0" y="14">${this.localize('components.insights-discussion-activity-card.reads')}</tspan>
						</text>
						<rect id="Rectangle" width="17" height="17" transform="translate(152.563 41.598)" fill="#7866ff"/>
						<rect id="Rectangle-2" data-name="Rectangle" width="17" height="17" transform="translate(152.563 77.115)"
							  fill="#036a8a"/>
						<rect id="Rectangle-3" data-name="Rectangle" width="17" height="17" transform="translate(152.563 109)"
							  fill="#00c4ac"/>
					</g>
					<path id="Oval-33" data-name="Oval"
						  d="M31.548,0A40.3,40.3,0,0,0,0,15.021L31.548,39h40C71.548,17.461,53.639,0,31.548,0Z"
						  transform="translate(44.798 44)" fill="#7866ff"/>
					<path id="Oval-34" data-name="Oval"
						  d="M25.884,54.457C15.358,62.587,5.295,62.587,5.295,62.6L.053,24.456Q0,24.044,0,24.011L31.52,0h0C45.121,16.973,43.292,41.2,25.884,54.457Z"
						  transform="translate(75.716 58.66)" fill="#036a8a"/>
					<g id="Circle_graph" data-name="Circle graph" transform="translate(36.479 58.66)">
						<path id="Oval-35" data-name="Oval"
							  d="M15.375,54.743a40.733,40.733,0,0,0,34.345,7.1L40,24.011h0L8.481,0h0A38.349,38.349,0,0,0,15.375,54.743Z"
							  fill="#00c4ac"/>
					</g>
				</g>
			</svg>
		`;
	}
}
customElements.define('d2l-insights-disc-activity-thumbnail', DiscActivityThumbnailSvg);
