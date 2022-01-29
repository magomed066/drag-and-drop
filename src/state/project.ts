import { Project, ProjectStatus } from '../models/project.js'

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

	addProject(title: string, desc: string, ppl: number) {
		const newProject = new Project(
			Math.random() * 1000 + '',
			title,
			desc,
			ppl,
			ProjectStatus.ACTIVE,
		)

		this.projects.push(newProject)

		this.updateListeners()
	}

	moveProject(projId: string, newStatus: ProjectStatus) {
		const project = this.projects.find((p) => p.id === projId)

		if (project && project.status !== newStatus) {
			project.status = newStatus
			this.updateListeners()
		}
	}

	private updateListeners() {
		for (const listener of this.listeners) {
			listener(this.projects.slice())
		}
	}
}

const projectState = ProjectState.getInstance()

export default projectState
