// Project Type
enum ProjectStatus {
	ACTIVE,
	FINISHED,
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public people: number,
		public status: ProjectStatus,
	) {}
}

// Project State
type Listener = (items: Project[]) => void

class ProjectState {
	private listeners: Listener[] = []
	private projects: Project[] = []
	private static instance: ProjectState

	private constructor() {}

	addListener(listener: Listener) {
		this.listeners.push(listener)
	}

	static getInstance() {
		if (this.instance) {
			return this.instance
		}

		this.instance = new ProjectState()
		return this.instance
	}

	public addProject(title: string, desc: string, ppl: number) {
		const newProject = new Project(
			Math.random() * 1000 + '',
			title,
			desc,
			ppl,
			ProjectStatus.ACTIVE,
		)

		this.projects.push(newProject)

		for (const listener of this.listeners) {
			listener(this.projects.slice())
		}
	}
}

const projectState = ProjectState.getInstance()

// Validatiion
interface Validatable {
	value: string | number
	required?: boolean
	minLength?: number
	maxLength?: number
	min?: number
	max?: number
}

function validate(input: Validatable) {
	let isValid = true

	if (input.required) {
		isValid = isValid && input.value.toString().trim().length !== 0
	}

	if (input.minLength != null && typeof input.value === 'string') {
		isValid = isValid && input.value.length >= input.minLength
	}

	if (input.maxLength != null && typeof input.value === 'string') {
		isValid = isValid && input.value.length <= input.maxLength
	}

	if (input.min != null && typeof input.value === 'number') {
		isValid = isValid && input.value >= input.min
	}

	if (input.max != null && typeof input.value === 'number') {
		isValid = isValid && input.value <= input.max
	}

	return isValid
}
// autobind decorator
function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value

	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		enumerable: false,
		get() {
			const bindFn = originalMethod.bind(this)
			return bindFn
		},
	}

	return adjDescriptor
}

//ProjectList
class ProjectList {
	$template: HTMLTemplateElement
	$host: HTMLDivElement
	$el: HTMLElement

	assignedProjects: Project[] = []

	constructor(private type: 'active' | 'finished') {
		this.$template = <HTMLTemplateElement>(
			document.getElementById('project-list')
		)
		this.$host = <HTMLDivElement>document.getElementById('app')

		const importedNode = document.importNode(this.$template.content, true)

		this.$el = <HTMLElement>importedNode.firstElementChild
		this.$el.id = `${this.type}-projects`

		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((p) => {
				if (this.type === 'active') {
					return p.status === ProjectStatus.ACTIVE
				}

				return p.status === ProjectStatus.FINISHED
			})

			this.assignedProjects = relevantProjects
			this.renderProjects()
		})

		this.attach()
		this.renderContent()
	}

	private renderProjects() {
		const listEl = <HTMLUListElement>(
			document.getElementById(`${this.type}-projects-list`)
		)

		listEl.innerHTML = ''

		for (const project of this.assignedProjects) {
			const listItem = <HTMLLIElement>document.createElement('li')
			listItem.textContent = project.title
			listEl?.appendChild(listItem)
		}
	}

	private renderContent() {
		const listId = `${this.type}-projects-list`

		this.$el.querySelector('ul')!.id = listId

		this.$el.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS'
	}

	private attach() {
		this.$host.insertAdjacentElement('beforeend', this.$el)
	}
}

// ProjectInput
class ProjectInput {
	$template: HTMLTemplateElement
	$host: HTMLDivElement
	$el: HTMLFormElement

	titleInput: HTMLInputElement
	descriptionInput: HTMLInputElement
	peopleInput: HTMLInputElement

	constructor() {
		this.$template = <HTMLTemplateElement>(
			document.getElementById('project-input')!
		)
		this.$host = <HTMLDivElement>document.getElementById('app')!

		const importedNode = document.importNode(this.$template.content, true)

		this.$el = <HTMLFormElement>importedNode.firstElementChild
		this.$el.id = 'user-input'

		this.titleInput = <HTMLInputElement>this.$el.querySelector('#title')
		this.descriptionInput = <HTMLInputElement>(
			this.$el.querySelector('#description')
		)
		this.peopleInput = <HTMLInputElement>this.$el.querySelector('#people')

		this.configure()
		this.attach()
	}

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

	private configure() {
		this.$el.addEventListener('submit', this.submitHandler)
	}

	private attach() {
		this.$host.insertAdjacentElement('afterbegin', this.$el)
	}
}

new ProjectInput()
const activeList = new ProjectList('active')
const finishedList = new ProjectList('finished')
