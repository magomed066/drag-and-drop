import { Component } from './index.js'
import Autobind from '../decorators/autobind.js'
import Validatable from '../models/validation.js'
import projectState from '../state/project.js'
import validate from '../utils/validate.js'

// ProjectInput
export default class ProjectInput extends Component<
	HTMLDivElement,
	HTMLFormElement
> {
	titleInput: HTMLInputElement
	descriptionInput: HTMLInputElement
	peopleInput: HTMLInputElement

	constructor() {
		super('project-input', 'app', true, 'user-input')
		this.titleInput = <HTMLInputElement>this.$el.querySelector('#title')
		this.descriptionInput = <HTMLInputElement>(
			this.$el.querySelector('#description')
		)
		this.peopleInput = <HTMLInputElement>this.$el.querySelector('#people')

		this.configure()
	}

	configure() {
		this.$el.addEventListener('submit', this.submitHandler)
	}

	renderContent() {}

	private gatherUserInput(): [string, string, number] | void {
		const title = this.titleInput.value
		const desc = this.descriptionInput.value
		const ppl = this.peopleInput.value

		const titleValidatable: Validatable = {
			value: title,
			required: true,
		}
		const descValidatable: Validatable = {
			value: desc,
			required: true,
			minLength: 5,
		}
		const pplValidatable: Validatable = {
			value: +ppl,
			required: true,
			min: 1,
			max: 5,
		}

		if (
			!validate(titleValidatable) ||
			!validate(descValidatable) ||
			!validate(pplValidatable)
		) {
			alert('Invalid input, please try again!')
			return
		} else {
			return [title, desc, +ppl]
		}
	}

	private clearInputs() {
		this.titleInput.value = ''
		this.descriptionInput.value = ''
		this.peopleInput.value = ''
	}

	@Autobind
	private submitHandler(e: Event) {
		e.preventDefault()

		const userInput = this.gatherUserInput()

		if (Array.isArray(userInput)) {
			const [title, desc, ppl] = userInput
			projectState.addProject(title, desc, ppl)
			this.clearInputs()
		}
	}
}
