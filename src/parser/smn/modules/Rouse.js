import React, { Fragment } from 'react'

import ACTIONS from 'data/ACTIONS'
import Module from 'parser/core/Module'
import { Suggestion, SEVERITY } from 'parser/core/modules/Suggestions'
import { ActionLink } from 'components/ui/DbLink'

// Should this be in the actions data?
const ROUSE_DURATION = 20000

export default class Rouse extends Module {
	static dependencies = [
		'pets',
		'suggestions'
	]

	lastRouse = null
	wasted = 0

	on_cast_byPlayer(event) {
		if (event.ability.guid !== ACTIONS.ROUSE.id) {
			return
		}
		this.lastRouse = event.timestamp
	}

	on_summonpet(event) {
		const diff = event.timestamp - this.lastRouse
		if (this.lastRouse === null || diff > ROUSE_DURATION) {
			return
		}
		this.wasted += ROUSE_DURATION - diff
	}

	on_complete() {
		if (this.wasted > 0) {
			this.suggestions.add(new Suggestion({
				icon: ACTIONS.ROUSE.icon,
				content: <Fragment>
					Avoid casting <ActionLink {...ACTIONS.ROUSE}/> less than {this.parser.formatDuration(ROUSE_DURATION)} before you swap pets or summon bahamut. Rouse is lost the moment your current pet despawns.
				</Fragment>,
				severity: this.wasted > ROUSE_DURATION? SEVERITY.MAJOR : this.wasted > 5000? SEVERITY.MEDIUM : SEVERITY.MINOR,
				why: `${this.parser.formatDuration(this.wasted)} of Rouse wasted.`
			}))
		}
	}
}
