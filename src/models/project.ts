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

export { Project, ProjectStatus }
