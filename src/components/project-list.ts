import { Component, ProjectItem } from './index.js'
import { DragTarget } from '../models/drag-drop.js'
import Autobind from '../decorators/autobind.js'
import { ProjectStatus, Project } from '../models/project.js'
import projectState from '../state/project.js'

// ProjectList
export default class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignedProjects: Project[] = []

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`)

		this.configure()
		this.renderContent()
	}

	@Autobind
	dragOverHandler(e: DragEvent) {
		if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
			e.preventDefault()
			const listEl = this.$el.querySelector('ul')!
			listEl.classList.add('droppable')
		}
	}

	@Autobind
	dropHandler(e: DragEvent) {
		const projId = e.dataTransfer!.getData('text/plain')
		projectState.moveProject(
			projId,
			this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED,
		)
	}

	@Autobind
	dragLeaveHandler(_: DragEvent) {
		const listEl = this.$el.querySelector('ul')!
		listEl.classList.remove('droppable')
	}

	configure() {
		this.$el.addEventListener('dragover', this.dragOverHandler)
		this.$el.addEventListener('dragleave', this.dragLeaveHandler)
		this.$el.addEventListener('drop', this.dropHandler)

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
