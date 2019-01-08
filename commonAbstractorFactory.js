const {Schema, StreamingAbstractor} = require('protocore')

module.exports = () => {
	const build = new StreamingAbstractor()

	build.register('login', new Schema([
		{
			'name': 'username',
			'type': 'string'
		}
	]))

	build.register('chat', new Schema([
		{
			'title': 'message',
			'type': 'string'
		}
	]))

	return build
}