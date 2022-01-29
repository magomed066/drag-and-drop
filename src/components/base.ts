// Component base clase
export default abstract class Component<
	T extends HTMLElement,
	U extends HTMLElement,
> {
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
