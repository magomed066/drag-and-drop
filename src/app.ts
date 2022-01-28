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
type Listener<T> = (items: T[]) => void

class State<T> {
	protected listeners: Listener<T>[] = []

	addListener(listener: Listener<T>) {
		this.listeners.push(listener)
	}
}

class ProjectState extends State<Project> {
	private projects: Project[] = []
	private static instance: ProjectState

	private constructor() {
		super()
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

// Component base clase
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	$template: HTMLTemplateElement
	$host: T
	$el: U

	constructor(
		templateId: string,
		hostId: string,
		insertAtStart: boolean,
		newElementId?: string,
	) {
		this.$template = <HTMLTemplateElement>document.getElementById(templateId)!
		this.$host = <T>document.getElementById(hostId)!

		const importedNode = document.importNode(this.$template.content, true)

		this.$el = <U>importedNode.firstElementChild

		if (newElementId) {
			this.$el.id = newElementId
		}

		this.attach(insertAtStart)
	}

	private attach(insertAtBeginning: boolean) {
		this.$host.insertAdjacentElement(
			insertAtBeginning ? 'afterbegin' : 'beforeend',
			this.$el,
		)
	}

	abstract configure(): void
	abstract renderContent(): void
}

// ProjectItem
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
	private project: Project

	get persons() {
		if (this.project.people === 1) {
			return '1 person'
		} else {
			return `${this.project.people} people`
		}
	}

	constructor(hostId: string, project: Project) {
		super('single-project', hostId, false, project.id)
		this.project = project

		this.configure()
		this.renderContent()
	}

	configure() {}

	renderContent() {
		this.$el.querySelector('h2')!.textContent = this.project.title
		this.$el.querySelector('h3')!.textContent = `${this.persons} assigned.`
		this.$el.querySelector('p')!.textContent = this.project.description
	}
}

// ProjectList
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assignedProjects: Project[] = []

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`)

		this.configure()
		this.renderContent()
	}

	configure() {
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
	}

	renderContent() {
		const listId = `${this.type}-projects-list`

		this.$el.querySelector('ul')!.id = listId

		this.$el.querySelector('h2')!.textContent =
			this.type.toUpperCase() + ' PROJECTS'
	}

	private renderProjects() {
		const listEl = <HTMLUListElement>(
			document.getElementById(`${this.type}-projects-list`)
		)

		listEl.innerHTML = ''

		for (const project of this.assignedProjects) {
			new ProjectItem(this.$el.querySelector('ul')!.id, project)
		}
	}
}

// ProjectInput
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

new ProjectInput()
const activeList = new ProjectList('active')
const finishedList = new ProjectList('finished')
