import { Draggable } from '../models/drag-drop.js'
import { Component } from './index.js'
import { Project } from '../models/project.js'
import Autobind from '../decorators/autobind.js'

// ProjectItem
export default class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Draggable
{
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

	@Autobind
	dragStartHandler(e: DragEvent) {
		e.dataTransfer!.setData('text/plain', this.project.id)
		e.dataTransfer!.effectAllowed = 'move'
	}

	@Autobind
	dragEndHandler(_: DragEvent) {}

	configure() {
		this.$el.addEventListener('dragstart', this.dragStartHandler)
		this.$el.addEventListener('dragend', this.dragEndHandler)
	}

	renderContent() {
		this.$el.querySelector('h2')!.textContent = this.project.title
		this.$el.querySelector('h3')!.textContent = `${this.persons} assigned.`
		this.$el.querySelector('p')!.textContent = this.project.description
	}
}
