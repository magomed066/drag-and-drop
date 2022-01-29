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

export default Autobind
